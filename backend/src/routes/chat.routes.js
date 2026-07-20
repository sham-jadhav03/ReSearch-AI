import express from "express";
import { getChats, getMessages, deleteChat, sendMessage } from "../controllers/chat.controller.js";
import { authUser } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/message", authUser, sendMessage);

router.get('/', authUser, getChats);

router.get('/:chatId/messages', authUser, getMessages)

router.delete('/delete/:chatId', authUser, deleteChat)

export default router;
