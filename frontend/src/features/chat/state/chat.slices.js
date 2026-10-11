import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    chats: {},
    currentChatId: null,
    isLoadingChats: false,
    loadingChatId: null,
    deletingChatId: null,
    error: null,
  },
  reducers: {
    createNewChat: (state, action) => {
      const { chatId, title } = action.payload;
      state.chats[chatId] = {
        id: chatId,
        title,
        messages: [],
        messagesLoaded: true,
        lastUpdated: new Date().toISOString(),
      };
    },
    addNewMessage: (state, action) => {
      const { chatId, content, role, citations, hasCitations, parts } = action.payload;
    
      if (!state.chats[chatId]) return;
      state.chats[chatId].messages.push({
        content,
        role,
        citations: citations || [],
        hasCitations: hasCitations || false,
        parts: parts || [],
      });
    },
    addMessages: (state, action) => {
      const { chatId, messages } = action.payload;
      if (!state.chats[chatId]) {
        state.chats[chatId] = {
          id: chatId,
          title: "New Chat",
          messages: [],
          messagesLoaded: false,
          lastUpdated: new Date().toISOString(),
        };
      };
      state.chats[chatId].messages.push(...messages);
      state.chats[chatId].messagesLoaded = true;
    },
    deleteChat: (state, action) => {
      const { chatId } = action.payload;
      delete state.chats[chatId];

      if (state.currentChatId === chatId) {
        state.currentChatId = null;
      }
    },
    setChats: (state, action) => {
      state.chats = action.payload;
    },
    setCurrentChatId: (state, action) => {
      state.currentChatId = action.payload;
    },
    setChatsLoading: (state, action) => {
      state.isLoadingChats = action.payload;
    },
    setLoadingChatId: (state, action) => {
      state.loadingChatId = action.payload;
    },
    setDeletingChatId: (state, action) => {
      state.deletingChatId = action.payload;
    },
    /**
     * Sets the error state. Pass `null` to clear the error banner.
     */
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setChats,
  setCurrentChatId,
  setChatsLoading,
  setLoadingChatId,
  setDeletingChatId,
  setError,
  createNewChat,
  addMessages,
  addNewMessage,
  deleteChat,
} = chatSlice.actions;
export default chatSlice.reducer;
