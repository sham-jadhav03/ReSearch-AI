import { intializeSocketConnect } from "../services/chat.socket";
import {
  sendMessage,
  getChats,
  getMessages,
  deleteChat as deleteChatApi
} from "../services/chat.api";
import {
  addMessages,
  addNewMessage,
  createNewChat,
  deleteChat,
  setChats,
  setCurrentChatId,
  setError,
  setLoading,
} from "../slices/chat.slices";
import { useDispatch, useSelector } from "react-redux";

export const useChat = () => {
  const dispatch = useDispatch();
  const chats = useSelector((state) => state.chat.chats);

  async function handleSendMessage({ message, chatId }) {
    try {
      dispatch(setLoading(true));
      const data = await sendMessage({ message, chatId });
      const { chat, aiMessage } = data;
      if (!chatId)
        dispatch(
          createNewChat({
            chatId: chat?._id,
            title: chat.title,
          }),
        );
      dispatch(
        addNewMessage({
          chatId: chat?._id,
          content: message,
          role: "user",
        }),
      );
      dispatch(
        addNewMessage({
          chatId: chat?._id,
          content: aiMessage.content,
          role: aiMessage.role,
        }),
      );
      dispatch(setCurrentChatId(chat?._id));
    } catch (error) {
      dispatch(
        setError(error.response?.data.message || "Unable to send message."),
      );
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleGetChats() {
    try {
      dispatch(setLoading(true));
      const data = await getChats();
      const { chats } = data;
      dispatch(
        setChats(
          chats.reduce((acc, chat) => {
            acc[chat?._id] = {
              id: chat?._id,
              title: chat.title,
              messages: [],
              lastUpdated: chat.updatedAt,
            };
            return acc;
          }, {}),
        ),
      );
    } catch (error) {
      dispatch(
        setError(error.response?.data.message || "Unable to get message"),
      );
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleOpenChat(chatId) {
    if (!chats[chatId]?.messages?.length) {
      const data = await getMessages({ chatId });
      const { messages } = data;

      const formattedMessages = messages.map((msg) => ({
        content: msg.content,
        role: msg.role,
      }));

      dispatch(
        addMessages({
          chatId,
          messages: formattedMessages,
        }),
      );
    }
    dispatch(setCurrentChatId(chatId));
  }

  async function handleDeleteChat(chatId) {
    try {
      dispatch(setLoading(true))

      await deleteChatApi({chatId});

      dispatch(deleteChat({chatId}))
    } catch (error) {
      dispatch(setError(error.response?.data.message || "Unable to delete chat."))
    }
  }

  return {
    intializeSocketConnect,
    handleSendMessage,
    handleGetChats,
    handleOpenChat,
    handleDeleteChat,
  };
};
