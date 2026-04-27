import { json } from "zod";
import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";
import {
  buildContext,
  formatResponse,
  generateChatTitle,
  generateResponse,
  parseCitations,
} from "../services/ai.service.js";
import { getIo } from "../socket/server.socket.js";

export const sendMessage = async (req, res) => {
  const { message, chat: chatId } = req.body;
  const io = getIo();
  const userId = req.user.id.toString();

  let title = null,
    chat = null;

  if (!chatId) {
    title = await generateChatTitle(message);
    chat = await chatModel.create({
      user: req.user.id,
      title,
    });
  }

  // const currentChatId = chatId || chat._id;

  await messageModel.create({
    chat: chatId || chat._id,
    content: message,
    role: "user",
  });

  const allMessages = await messageModel.find({
    chat: chatId || chat._id,
  });

  const contextMessages = await buildContext(allMessages);

  //SSE setup
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "kee-alive");
  res.flushHeaders();

  res.write(
    `data: ${JSON.stringify({ type: "start", chatId: chatId || chat._id, title })}\n\n`,
  );

  generateResponse(contextMessages, (token) => {
    res.write(`data:${JSON.stringify({ type: "token", token })}\n\n`);
  })
    .then(async (result) => {
      if (!result) {
        res.write(`data: ${JSON.stringify({ type: "error" })}\n\n`);
        res.end();
        return;
      }

      const parsed = parseCitations(result);
      const { answer, citations, hasCitations } = formatResponse(parsed);

      const aiMessage = await messageModel.create({
        chat: chatId || chat._id,
        content: answer,
        role: "ai",
        citations,
        hasCitations,
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
