import chatModel from "../models/chat.model.js"

export const createChat = (data) => {
    return chatModel.create(data);
}

export const getChatsByUser = (userId) => {
    return chatModel.find({
        user: userId
    });
}

export const findChat = (chatId, userId) => {
    return chatModel.findOne({
        _id: chatId,
        user: userId
    });
}

export const deleteChat = (chatId, userId) => {
    return chatModel.findOneAndDelete({
        _id: chatId,
        user: userId
    });
}