import messageModel from "../models/message.model.js";
import chatModel from "../models/chat.model.js";
import { createMessageSchema } from "../validators/message.validator.js";

/**
 * Single write path for every message. Validates shape via Zod, persists,
 * then keeps the parent chat's activity metadata in sync. Explicit here
 * rather than a post-save hook — visible in the call site, not implicit.
 */
const normalizePayload = (payload) => {
  const normalizedContent = typeof payload.content === "string" ? payload.content : "";
  const content = normalizedContent.trim()
    ? normalizedContent.trim()
    : payload.role === "ai"
      ? "No response generated."
      : normalizedContent;

  return {
    ...payload,
    content,
  };
};

const persistMessage = async (payload) => {
  const normalizedPayload = normalizePayload(payload);
  const parsed = createMessageSchema.parse(normalizedPayload);
  const message = await messageModel.create(parsed);

  await chatModel.updateOne(
    { _id: normalizedPayload.chat },
    { $set: { lastMessageAt: new Date() }, $inc: { messageCount: 1 } }
  );

  return message;
};

export const createUserMessage = ({ chatId, content }) =>
  persistMessage({ chat: chatId, content, role: "user" });

export const createAiMessage = ({ chatId, content, parts, citations }) =>
  persistMessage({ chat: chatId, content, role: "ai", parts, citations });