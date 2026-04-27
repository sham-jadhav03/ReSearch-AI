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

    return () => {
      socket.disconnect();
    };
  }, [user?._id]);

  async function handleSendMessage({ message, chatId }) {
    try {
      dispatch(setLoading(true));

      // ── reset streaming state (was in socket "ai:start") ──
      streamingBufferRef.current = "";
      setStreamingText("");
      setIsStreaming(false);

      // ✅ sendMessage API call stays the same
      // but now it returns an SSE stream instead of JSON
      const data = await sendMessage({ message, chatId });

      const reader = data.body.getReader();
      const decoder = new TextDecoder();
      let frame = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const raw = decoder.decode(value, { stream: true });
        const lines = raw.split("\n\n").filter(Boolean);

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;

          const parsed = JSON.parse(line.replace("data: ", "").trim());

          // ── replaces socket.on("ai:start") ──
          if (parsed.type === "start") {
            const resolvedChatId = chatId || parsed.chatId;

            if (!chatId) {
              dispatch(
                createNewChat({
                  chatId: resolvedChatId,
                  title: parsed.title,
                }),
              );
            }

            dispatch(
              addNewMessage({
                chatId: resolvedChatId,
                content: message,
                role: "user",
              }),
            );

            dispatch(setCurrentChatId(resolvedChatId));
            setIsStreaming(true);
          }

          // ── replaces socket.on("ai:token") ──
          // your exact requestAnimationFrame + Sources-trimming logic preserved
          if (parsed.type === "token") {
            streamingBufferRef.current += parsed.token;

            if (!frame) {
              frame = requestAnimationFrame(() => {
                const buffer = streamingBufferRef.current;
                const sourceMatch = buffer.match(
                  /(?:\n\s*)?(?:\*\*Sources\*\*|##\s*Sources|Sources:)/i,
                );
                if (sourceMatch) {
                  setStreamingText(buffer.substring(0, sourceMatch.index));
                } else {
                  setStreamingText(buffer);
                }
                frame = null;
              });
            }
          }

          // ── replaces socket.on("ai:done") ──
          if (parsed.type === "done") {
            const resolvedChatId = chatId || parsed.chatId;
            dispatch(
              addNewMessage({
                chatId: resolvedChatId,
                content: parsed.aiMessage.content || streamingBufferRef.current,
                role: parsed.aiMessage.role,
                citations: parsed.citations || [],
                hasCitations: parsed.hasCitations || false,
              }),
            );
            setStreamingText("");
            setIsStreaming(false);
            streamingBufferRef.current = "";
            dispatch(setLoading(false));
          }

          if (parsed.type === "error") {
            setIsStreaming(false);
            dispatch(setLoading(false));
            dispatch(setError("AI failed to respond. Please try again."));
          }
        }
      }
    } catch (error) {
      setIsStreaming(false);
      dispatch(setLoading(false));
      dispatch(setError(error.message || "Unable to send message."));
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
          citations: msg.citations || [],
          hasCitations: msg.hasCitations || false,
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
