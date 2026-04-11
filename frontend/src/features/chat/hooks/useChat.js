import { intializeSocketConnect } from "../services/chat.socket";
import {
  sendMessage,
  getChats,
  getMessages,
  deleteChat as deleteChatApi,
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
import { useEffect, useRef, useState } from "react";

export const useChat = () => {
  const dispatch = useDispatch();
  const chats = useSelector((state) => state.chat.chats);
  const user = useSelector((state) => state.auth.user);
  const socketRef = useRef(null);

  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const streamingBufferRef = useRef("");

  useEffect(() => {
    if (!user?._id) return;

    const socket = intializeSocketConnect(user._id);
    socketRef.current = socket;

    let frame = null;

    socket.on("ai:start", () => {
      streamingBufferRef.current = "";
      setStreamingText("");
      setIsStreaming(true);
    });

    socket.on("ai:token", ({ token }) => {
      streamingBufferRef.current += token;

      if (!frame) {
        frame = requestAnimationFrame(() => {
          setStreamingText(streamingBufferRef.current);
          frame = null;
        });
      }
    });

    socket.on("ai:done", ({ chatId, aiMessage, citations, hasCitations }) => {
      dispatch(
        addNewMessage({
          chatId,
          content: aiMessage.content || streamingBufferRef.current,
          role: aiMessage.role,
          citations: citations || [],
          hasCitations: hasCitations || false,
        }),
      );
      setStreamingText("");
      setIsStreaming(false);
      streamingBufferRef.current = "";
      dispatch(setLoading(false));
    });

    return () => {
      socket.off("ai:start");
      socket.off("ai:token");
      socket.off("ai:done");
      socket.disconnect();
    };
  }, [user?._id]);

  async function handleSendMessage({ message, chatId }) {
    try {
      dispatch(setLoading(true));
      const data = await sendMessage({ message, chatId });
      const { chat, title, currentChatId } = data;

      const resolvedChatId = chatId || currentChatId || chat?._id;

      if (!chatId)
        dispatch(
          createNewChat({
            chatId: resolvedChatId,
            title: title,
          }),
        );
      dispatch(
        addNewMessage({
          chatId: resolvedChatId,
          content: message,
          role: "user",
        }),
      );

      dispatch(setCurrentChatId(resolvedChatId));
    } catch (error) {
      setIsStreaming(false);
      dispatch(setLoading(false));
      dispatch(
        setError(error.response?.data.message || "Unable to send message."),
      );
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
      dispatch(setError(null));
      dispatch(
        setError(error.response?.data?.message || "Failed to fetch user data"),
      );
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleOpenChat(chatId) {
    try {
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
    } catch (error) {
      dispatch(
        setError(error.response?.data?.message || "Failed to load message"),
      );
    }
  }

  async function handleDeleteChat(chatId) {
    try {
      dispatch(setLoading(true));

      await deleteChatApi({ chatId });

      dispatch(deleteChat({ chatId }));
    } catch (error) {
      dispatch(
        setError(error.response?.data.message || "Unable to delete chat."),
      );
    } finally {
      dispatch(setLoading(false));
    }
  }

  return {
    intializeSocketConnect,
    handleSendMessage,
    handleGetChats,
    handleOpenChat,
    handleDeleteChat,
    isStreaming,
    streamingText,
  };
};
