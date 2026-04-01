import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    chats: {},
    currentChatId: null,
    isLoading: true,
    error: null,
    streamingBuffer: {},
  },
  reducers: {
    createNewChat: (state, action) => {
      const { chatId, title } = action.payload;
      state.chats[chatId] = {
        id: chatId,
        title,
        messages: [],
        lastUpdated: new Date().toISOString(),
      };
    },
    addNewMessage: (state, action) => {
      const { chatId, content, role, citations, hasCitations } = action.payload;
      state.chats[chatId].messages.push({
        content,
        role,
        citations: citations || [],
        hasCitations: hasCitations || false
      });
    },
    addMessages: (state, action) => {
      const { chatId, messages } = action.payload;
      state.chats[chatId].messages.push(...messages);
    },
    deleteChat: (state, action) => {
      const { chatId } = action.payload;
      delete state.chats[chatId];

      if (state.currentChatId === chatId) {
        state.currentChatId = null;
      }
    },
    appendStreamingChunk: (state, action) => {
      const { chatId, chunk } = action.payload;

      if (!state.streamingBuffer[chatId]) {
        state.streamingBuffer[chatId] = "";
      }
      state.streamingBuffer[chatId] += chunk;
    },
    finalizeStreamingMessage: (state, action) => {
      const { chatId, aiMessage } = action.payload;
      state.chats[chatId].messages.push(aiMessage);
      state.streamingBuffer[chatId] = "";
    },
    setChats: (state, action) => {
      state.chats = action.payload;
    },
    setCurrentChatId: (state, action) => {
      state.currentChatId = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setChats,
  setCurrentChatId,
  setLoading,
  setError,
  createNewChat,
  addMessages,
  addNewMessage,
  deleteChat,
  appendStreamingChunk,
  finalizeStreamingMessage,
} = chatSlice.actions;
export default chatSlice.reducer;
