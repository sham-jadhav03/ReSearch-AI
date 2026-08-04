import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const sendMessage = async ({ message, chatId, resumeFromIndex }) => {
  const response = await fetch(`${API_BASE_URL}/api/chat/message`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, chat: chatId, resumeFromIndex }),
  });

  console.log(response);
  

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    try {
      const errorBody = await response.json();
      errorMessage = errorBody?.message || errorMessage;
    } catch {
      // response body wasn't JSON (e.g. proxy error page) — fall back to status text
    }
    const error = new Error(errorMessage);
    error.status = response.status;
    throw error;
  }

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
