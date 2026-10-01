// message.service.js
import messageModel from "../models/message.model.js";
import chatModel from "../models/chat.model.js";
import { createMessageSchema } from "../validators/message.validator.js";

/**
 * Single write path for every message. Validates shape via Zod, persists,
 * then keeps the parent chat's activity metadata in sync. Explicit here
 * rather than a post-save hook — visible in the call site, not implicit.
 * Note: messageCount increment removed from model (was dead code — never read
 * anywhere per Backend-Analysis.md §5.2). Only `lastMessageAt` is updated.
 */
const persistMessage = async (payload) => {
  const parsed = createMessageSchema.parse(payload);
  const message = await messageModel.create(parsed);

  await chatModel.updateOne(
    { _id: payload.chat },
    { $set: { lastMessageAt: new Date() } },
  );

  return message;
};

export const createUserMessage = ({ chatId, content }) =>
  persistMessage({ chat: chatId, content, role: "user" });

export const createAiMessage = ({ chatId, content, parts, citations }) =>
  persistMessage({ chat: chatId, content, role: "ai", parts, citations });
