import express from "express";
import {
  sendMessage,
  getChats,
  getMessages,
  deleteChat,
} from "../controllers/chat.controller.js";
import { authUser } from "../middlewares/auth.middleware.js";
import { chatMessageLimiter } from "../middlewares/rateLimit.middleware.js";
import {
  sendMessageValidator,
  chatIdParamValidator,
} from "../validators/chat.validator.js";

const router = express.Router();

router.post(
  "/message",
  authUser,
  chatMessageLimiter,
  sendMessageValidator,
  sendMessage,
);

router.get("/", authUser, getChats);

router.get("/:chatId/messages", authUser, chatIdParamValidator, getMessages);

router.delete("/delete/:chatId", authUser, chatIdParamValidator, deleteChat);

export default router;
