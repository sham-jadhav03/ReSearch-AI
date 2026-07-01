import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const sendMessage = async ({ message, chatId, resumeFromIndex }) => {
  const response = await fetch(`${API_BASE_URL}/api/chat/message`, {
    method: "POST",
    credentials: 'include',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, chat: chatId, resumeFromIndex }),
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
