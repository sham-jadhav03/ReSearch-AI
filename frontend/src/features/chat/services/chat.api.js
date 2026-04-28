import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000",
  withCredentials: true,
});

export const sendMessage = async ({ message, chatId }) => {
  const response = await fetch("http://localhost:4000/api/chat/message", {
    method: "POST",
    credentials: 'include',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, chat: chatId }),
  });

  console.log(response);
  return response;
};

export const getChats = async () => {
  const response = await api.get(`/api/chat`);

  return response.data;
};

export const getMessages = async ({ chatId }) => {
  const response = await api.get(`/api/chat/${chatId}/messages`);

  return response.data;
};

export const deleteChat = async ({ chatId }) => {
  const response = await api.delete(`/api/chat/delete/${chatId}`);

  return response.data;
};
