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
  if (!res.writableEnded && !res.destroyed) {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  }
};

const HEARTBEAT_INTERVAL_MS = 15_000;

const setupSSE = (res, startEvent) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  // The first write commits the headers and prevents an empty 200 response.
  writeEvent(res, startEvent);

  const heartbeat = setInterval(() => {
    if (!res.writableEnded && !res.destroyed) res.write(": ping\n\n");
  }, HEARTBEAT_INTERVAL_MS);
  heartbeat.unref?.();

  return () => clearInterval(heartbeat);
};

const streamMessage = (message) => ({
  id: message._id.toString(),
  chat: message.chat.toString(),
  content: message.content,
  role: message.role,
  createdAt: message.createdAt,
});

/**
 * Resolves which chat this message belongs to. If `chatId` is provided,
 * ownership is verified — closes an IDOR gap where any authenticated
 * user could previously read/write into another user's chat by guessing
 * or reusing an ID. If absent, a new chat is created with a generated title.
 */
const resolveChat = async ({ chatId, userId, message, signal }) => {
  if (signal?.aborted) throw signal.reason;

  if (chatId) {
    const chat = await chatModel.findOne({ _id: chatId, user: userId, deletedAt: null });
    if (!chat) throw new ChatAccessError("Chat not found or access denied.");
    return { finalChatId: chat._id.toString(), title: null, isNewChat: false };
  }

  const title = await generateChatTitle(message, signal);
  if (signal?.aborted) throw signal.reason;

  const chat = await chatModel.create({ user: userId, title });
  return { finalChatId: chat._id.toString(), title, isNewChat: true };
};

/** Streams one agent run and persists its completed response. */
const streamAndPersist = async ({ res, finalChatId, contextMessages, signal }) => {
  const onChunk = (event) => {
    if (!signal.aborted) writeEvent(res, event);
  };

  const { finalMessage, parts, citations } = await generateResponse(contextMessages, onChunk, signal);
  if (signal.aborted) return;

  const aiMessage = await createAiMessage({
    chatId: finalChatId,
    content: finalMessage,
    parts,
    citations,
  });

  writeEvent(res, {
    type: "done",
    aiMessage: streamMessage(aiMessage),
    citations,
    hasCitations: citations.length > 0,
  });
  res.end();
};

export const sendMessage = async (req, res) => {
  const { message, chat: chatId } = req.body;
  const userId = req.user.id;

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ message: "Message content is required.", success: false });
  }

  const abortController = new AbortController();
  const abortForDisconnect = () => {
    if (!res.writableEnded && !abortController.signal.aborted) {
      abortController.abort();
    }
  };
  const abortForRequestClose = () => {
    if (req.aborted) abortForDisconnect();
  };

  req.on("close", abortForRequestClose);
  res.on("close", abortForDisconnect);
  let stopHeartbeat = () => {};

  try {
    const { finalChatId, title, isNewChat } = await resolveChat({
      chatId,
      userId,
      message,
      signal: abortController.signal,
    });

    if (abortController.signal.aborted) return;

    await createUserMessage({ chatId: finalChatId, content: message });

    const contextMessages = buildContext(
      await messageModel
        .find({ chat: finalChatId, deletedAt: null })
        .select("role content parts")
        .sort({ createdAt: 1 })
        .lean()
    );

    stopHeartbeat = setupSSE(res, {
      type: "start",
      chatId: finalChatId,
      title: isNewChat ? title : undefined,
    });

    await streamAndPersist({
      res,
      finalChatId,
      contextMessages,
      signal: abortController.signal,
    });
  } catch (err) {
    if (abortController.signal.aborted) return;

    console.error("sendMessage failed:", err);

    if (!res.headersSent) {
      const status = err.status || 500;
      return res.status(status).json({ message: err.message || "Failed to process message.", success: false });
    }
    writeEvent(res, {
      type: "error",
      code: "AI_STREAM_FAILED",
      message: "The AI response could not be completed.",
    });
    res.end();
  } finally {
    stopHeartbeat();
    req.off("close", abortForRequestClose);
    res.off("close", abortForDisconnect);
  }
};

const paginationParams = (req, fallbackLimit) => {
  const parsedLimit = parseInt(req.query.limit, 10);
  const parsedPage = parseInt(req.query.page, 10);
  const limit =
    Number.isInteger(parsedLimit) && parsedLimit > 0
      ? Math.min(parsedLimit, 100)
      : fallbackLimit;
  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  return { limit, page, isPaged: limit > 0 };
};

export const getChats = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { limit, page, isPaged } = paginationParams(req, 0);
    const filter = { user: userId, deletedAt: null };

    const baseQuery = () =>
      chatModel.find(filter)
        .sort({ lastMessageAt: -1, _id: -1 })
        .select("-user -__v");

    let chats;
    let total;
    if (isPaged) {
      total = await chatModel.countDocuments(filter);
      chats = await baseQuery()
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();
    } else {
      chats = await baseQuery().lean();
    }

    res.status(200).json({
      message: "Chats retrieved successfully.",
      success: true,
      chats,
      ...(isPaged && {
        pagination: { page, limit, total, hasMore: page * limit < total },
      }),
    });
  } catch (err) {
    console.error("getChats error:", err);
    res.status(500).json({ message: "Failed to retrieve chats.", success: false });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user?.id || req.user?._id;

    const chat = await chatModel
      .findOne({ _id: chatId, user: userId, deletedAt: null })
      .select("_id")
      .lean();
    if (!chat) {
      return res.status(404).json({ message: "Chat not found.", success: false });
    }

    const { limit, page, isPaged } = paginationParams(req, 0);
    const filter = { chat: chatId, deletedAt: null };

    const baseQuery = () =>
      messageModel.find(filter)
        .sort({ createdAt: 1, _id: 1 })
        .select("-__v")
        .lean({ virtuals: true });

    let messages;
    let total;
    if (isPaged) {
      total = await messageModel.countDocuments(filter);
      messages = await baseQuery()
        .skip((page - 1) * limit)
        .limit(limit);
    } else {
      messages = await baseQuery();
    }

    res.status(200).json({
      message: "Messages retrieved successfully.",
      success: true,
      messages,
      ...(isPaged && {
        pagination: { page, limit, total, hasMore: page * limit < total },
      }),
    });
  } catch (err) {
    console.error("getMessages error:", err);
    res.status(500).json({ message: "Failed to retrieve messages.", success: false });
  }
};

export const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user?.id || req.user?._id;

    const chat = await chatModel.findOneAndUpdate(
      { _id: chatId, user: userId, deletedAt: null },
      { $set: { deletedAt: new Date() } },
      { returnDocument: "after" }
    );

    if (!chat) {
      return res.status(404).json({ message: "Chat not found.", success: false });
    }

    // Cascade soft-delete: mark every message of the chat as deleted too.
    // Without this, "deleted" chats leak their message documents forever.
    // The TTL index on the message's deletedAt purges them after 30 days.
    await messageModel.updateMany(
      { chat: chatId, deletedAt: null },
      { $set: { deletedAt: new Date() } }
    );

    res.status(200).json({ message: "Chat deleted successfully.", success: true });
  } catch (err) {
    console.error("deleteChat error:", err);
    res.status(500).json({ message: "Failed to delete chat.", success: false });
  }
};
