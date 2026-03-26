import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";
import { generateChatTitle, generateResponse } from "../services/ai.service.js";

export const sendMessage = async (req, res) => {
  const { message, chat: chatId } = req.body;

  let title=null, chat=null

  if (!chatId) {
     title = await generateChatTitle(message);
     chat = await chatModel.create({
      user: req.user.id,
      title,
    });
  }

  const currentChatId = chatId || chat.id;

   await messageModel.create({
    chat: currentChatId,
    content: message,
    role: "user",
  });

  const messages = await messageModel.find({
    chat: currentChatId,
  });

  const result = await generateResponse(messages);

  const aiMessage = await messageModel.create({
    chat: currentChatId,
    content: result,
    role: "ai",
  });

  res.status(201).json({
    title,
    chat,
    aiMessage,
  });
};

export const getChats = async (req, res) => {
   const user = req.user;

   const chats = await chatModel.find({
    user: user.id
   })

   res.status(200).json({
    message: "Chats retrieved successfully.",
    chats
   })
}

export const getMessages = async (req, res) => {
  const {chatId} = req.params;

  const chat = await chatModel.findOne({
    _id:chatId,
    user:req.user.id
  })

  if(!chat){
    res.status(404).json({
      message: "Chat not found."
    })
  }

  const messages = await messageModel.find({
    chat:chatId
  })

  res.status(200).json({
    message: "Message retrieve successfully.",
    messages
  })
}

export const deleteChat = async (req, res) => {
  const {chatId} = req.params;

  const chat = await chatModel.findOneAndDelete({
    _id:chatId,
    user:req.user.id
  })

  await messageModel.deleteMany({
    chat:chatId
  })

  if(!chat){
    return res.status(404).json({
      message: "Chat not found."
    })
  }

  res.status(200).json({
    message: "Chat deleted successfully."
  })
}
