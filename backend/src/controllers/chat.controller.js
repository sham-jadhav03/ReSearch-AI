import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";
import {
  buildContext,
  formatResponse,
  generateChatTitle,
  generateResponse,
  parseCitations,
} from "../services/ai.service.js";

export const sendMessage = async (req, res) => {
  const { message, chat: chatId, resumeFromIndex } = req.body;
  const userId = req.user.id.toString();

  let title = null,
    chat = null;

  // Only create chat if not provided and not resuming
  if (!chatId && !resumeFromIndex) {
    title = await generateChatTitle(message);
    chat = await chatModel.create({
      user: req.user.id,
      title,
    });
  }

  const finalChatId = chatId || chat?._id;

  // Only create user message if not resuming
  if (!resumeFromIndex) {
    await messageModel.create({
      chat: finalChatId,
      content: message,
      role: "user",
    });
  }

  const allMessages = await messageModel.find({
    chat: finalChatId,
  });

  const contextMessages = await buildContext(allMessages);

  //SSE setup
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  res.write(
    `data: ${JSON.stringify({ type: "start", chatId: finalChatId, title })}\n\n`,
  );

  let currentTextLength = 0;

  generateResponse(contextMessages, (event) => {
    if (resumeFromIndex && event.type === "text-delta") {
      const delta = event.delta;
      const prevLength = currentTextLength;
      currentTextLength += delta.length;

      if (currentTextLength <= resumeFromIndex) {
        return; // Fully skip
      }

      if (prevLength < resumeFromIndex) {
        // Partially skip
        const skip = resumeFromIndex - prevLength;
        const slicedDelta = delta.slice(skip);
        res.write(
          `data: ${JSON.stringify({ ...event, delta: slicedDelta })}\n\n`,
        );
        return;
      }
    }

    res.write(`data: ${JSON.stringify(event)}\n\n`);
  })
    .then(async (result) => {
      if (!result) {
        res.write(`data: ${JSON.stringify({ type: "error" })}\n\n`);
        res.end();
        return;
      }

      const { finalMessage, parts } = result;

      const parsed = parseCitations(finalMessage);
      const { answer, citations, hasCitations } = formatResponse(parsed);

      // Save AI message (or update if we want to avoid duplicates, 
      // but usually the AI message is only saved at the end)
      const aiMessage = await messageModel.create({
        chat: finalChatId,
        content: answer,
        role: "ai",
        citations,
        hasCitations,
        parts,
      });

      res.write(
        `data: ${JSON.stringify({
          type: "done",
          aiMessage,
          citations,
          hasCitations,
        })}\n\n`,
      );
      res.end();
    })
    .catch((err) => {
      console.error(err);
      res.write(`data: ${JSON.stringify({ type: "error" })}\n\n`);
      res.end();
    });
};

export const getChats = async (req, res) => {
  const user = req.user;

  const chats = await chatModel.find({
    user: user.id,
  });

  res.status(200).json({
    message: "Chats retrieved successfully.",
    chats,
  });
};

export const getMessages = async (req, res) => {
  const { chatId } = req.params;

  const chat = await chatModel.findOne({
    _id: chatId,
    user: req.user.id,
  });

  if (!chat) {
    res.status(404).json({
      message: "Chat not found.",
    });
  }

  const messages = await messageModel.find({
    chat: chatId,
  });

  res.status(200).json({
    message: "Message retrieve successfully.",
    messages,
  });
};

export const deleteChat = async (req, res) => {
  const { chatId } = req.params;

  const chat = await chatModel.findOneAndDelete({
    _id: chatId,
    user: req.user.id,
  });

  await messageModel.deleteMany({
    chat: chatId,
  });

  if (!chat) {
    return res.status(404).json({
      message: "Chat not found.",
    });
  }

  res.status(200).json({
    message: "Chat deleted successfully.",
  });
};
