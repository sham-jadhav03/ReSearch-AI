import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../../features/auth/slice/auth.slice";
import chatReducer from "../../features/chat/slices/chat.slices";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
  },
});
