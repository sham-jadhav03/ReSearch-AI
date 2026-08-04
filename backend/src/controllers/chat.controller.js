import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";
import { generateResponse, generateChatTitle, buildContext } from "../services/ai.service.js";
import { createUserMessage, createAiMessage } from "../services/message.service.js";

class ChatAccessError extends Error {
  constructor(message) {
    super(message);
    this.status = 404;
  }
}

const writeEvent = (res, event) => {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
};

const setupSSE = (res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();
};

/**
 * Resolves which chat this message belongs to. If `chatId` is provided,
 * ownership is verified — closes an IDOR gap where any authenticated
 * user could previously read/write into another user's chat by guessing
 * or reusing an ID. If absent, a new chat is created with a generated title.
 */
const resolveChat = async ({ chatId, userId, message }) => {
  if (chatId) {
    const chat = await chatModel.findOne({ _id: chatId, user: userId, deletedAt: null });
    if (!chat) throw new ChatAccessError("Chat not found or access denied.");
    return { finalChatId: chat._id.toString(), title: null, isNewChat: false };
  }

  const title = await generateChatTitle(message);
  const chat = await chatModel.create({ user: userId, title });
  return { finalChatId: chat._id.toString(), title, isNewChat: true };
};

/**
 * Streams the agent's response over SSE, re-applying the resume-skip
 * logic when reconnecting mid-generation, then persists the finished
 * message. Note: on resume, the agent still re-runs from scratch —
 * this only avoids re-sending already-seen text to the client, it does
 * not avoid re-running tool calls. Flagged as a known limitation, not
 * fixed here (would require the pub/sub redesign discussed earlier).
 */
const streamAndPersist = async ({ res, finalChatId, contextMessages, resumeFromIndex }) => {
  let sentTextLength = 0;

  const onChunk = (event) => {
    if (resumeFromIndex && event.type === "text-delta") {
      const prevLength = sentTextLength;
      sentTextLength += event.delta.length;

      if (sentTextLength <= resumeFromIndex) return;
      if (prevLength < resumeFromIndex) {
        writeEvent(res, { ...event, delta: event.delta.slice(resumeFromIndex - prevLength) });
        return;
      }
    }
    writeEvent(res, event);
  };

  const { finalMessage, parts, citations } = await generateResponse(contextMessages, onChunk);

  const aiMessage = await createAiMessage({
    chatId: finalChatId,
    content: finalMessage,
    parts,
    citations,
  });

  writeEvent(res, {
    type: "done",
    aiMessage,
    citations,
    hasCitations: citations.length > 0,
  });
  res.end();
};

export const sendMessage = async (req, res) => {
  const { message, chat: chatId, resumeFromIndex } = req.body;
  const userId = req.user.id;

  if (!resumeFromIndex && (!message || typeof message !== "string" || !message.trim())) {
    return res.status(400).json({ message: "Message content is required.", success: false });
  }

  try {
    const { finalChatId, title, isNewChat } = await resolveChat({ chatId, userId, message });

    if (!resumeFromIndex) {
      await createUserMessage({ chatId: finalChatId, content: message });
    }

    const contextMessages = buildContext(
      await messageModel.find({ chat: finalChatId }).select("role content").sort({ createdAt: 1 }).lean()
    );

    setupSSE(res);
    writeEvent(res, { type: "start", chatId: finalChatId, title: isNewChat ? title : undefined });

    await streamAndPersist({ res, finalChatId, contextMessages, resumeFromIndex });
  } catch (err) {
    console.error("sendMessage failed:", err);

    if (!res.headersSent) {
      const status = err.status || 500;
      return res.status(status).json({ message: err.message || "Failed to process message.", success: false });
    }
    writeEvent(res, { type: "error" });
    res.end();
  }
};

export const getChats = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const chats = await chatModel
      .find({ user: userId, deletedAt: null })
      .sort({ lastMessageAt: -1 })
      .lean();

    res.status(200).json({ message: "Chats retrieved successfully.", chats });
  } catch (err) {
    console.error("getChats error:", err);
    res.status(500).json({ message: "Failed to retrieve chats.", success: false });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user?.id || req.user?._id;

    const chat = await chatModel.findOne({ _id: chatId, user: userId, deletedAt: null }).lean();
    if (!chat) {
      return res.status(404).json({ message: "Chat not found.", success: false });
    }

    const messages = await messageModel.find({ chat: chatId }).sort({ createdAt: 1 }).lean();

    res.status(200).json({ message: "Messages retrieved successfully.", messages });
  } catch (err) {
    console.error("getMessages error:", err);
    res.status(500).json({ message: "Failed to retrieve messages.", success: false });
  }
};

export const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    console.log(req.params);
    
    const userId = req.user?.id || req.user?._id;

    const chat = await chatModel.findOneAndUpdate(
      { _id: chatId, user: userId, deletedAt: null },
      { $set: { deletedAt: new Date() } },
      { new: true }
    );

    if (!chat) {
      return res.status(404).json({ message: "Chat not found.", success: false });
    }

    res.status(200).json({ message: "Chat deleted successfully." });
  } catch (err) {
    console.error("deleteChat error:", err);
    res.status(500).json({ message: "Failed to delete chat.", success: false });
  }
};