import messageModel from "../models/message.model.js"

export const createMessage = (data) => {
    return messageModel.create(data);
}

export const getMessagesByChat = (chatId) => {
    return messageModel.find({
        chat: chatId
    });
};

export const deleteMessagesByChat = (chatId) => {
    return messageModel.deleteMany({
        chat: chatId
    });
};