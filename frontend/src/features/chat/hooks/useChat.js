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
} from "../state/chat.slices";
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

    // Socket stays connected for any other real-time features
    // ai:start, ai:token, ai:done are now handled via SSE

    return () => {
      socket.disconnect();
    };
  }, [user?._id]);

  async function handleSendMessage({ message, chatId }) {
    try {
      dispatch(setLoading(true));

      // Reset streaming state
      streamingBufferRef.current = "";
      setStreamingText("");
      setIsStreaming(false);

      const data = await sendMessage({ message, chatId });
      const reader = data.body.getReader();
      const decoder = new TextDecoder();
      let frame = null;

      // KEY FIX: declare resolvedChatId outside the loop
      // so both "start" and "done" blocks share the same value
      let resolvedChatId = chatId;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const raw = decoder.decode(value, { stream: true });

        // SSE can batch multiple events in one chunk — split them
        const lines = raw.split("\n\n").filter(Boolean);

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;

          // handle both "data: {}" and "data:{}" (with or without space)
          const jsonStr = line.replace(/^data:\s*/, "").trim();
          const parsed = JSON.parse(jsonStr);

          //"start": event 
          if (parsed.type === "start") {
            // Update resolvedChatId — this is what "done" will also use
            resolvedChatId = chatId || parsed.chatId;

            // New chat — add it to Redux + sidebar
            if (!chatId) {
              dispatch(
                createNewChat({
                  chatId: resolvedChatId,
                  title: parsed.title,
                }),
              );
            }

            // Add user message to Redux immediately
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

          //"token": event
          if (parsed.type === "token") {
            streamingBufferRef.current += parsed.token;

            // requestAnimationFrame batches rapid token updates
            // avoids re-rendering on every single token
            if (!frame) {
              frame = requestAnimationFrame(() => {
                const buffer = streamingBufferRef.current;

                // Hide the Sources block while streaming
                // it gets added properly on "done"
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

          // "done": event 
          if (parsed.type === "done") {
            // resolvedChatId was set in "start" block above
            // parsed.aiMessage.chat also has it as fallback
            const finalChatId = resolvedChatId || parsed.aiMessage?.chat;

            dispatch(
              addNewMessage({
                chatId: finalChatId,
                content:
                  parsed.aiMessage?.content || streamingBufferRef.current,
                role: parsed.aiMessage?.role || "ai",
                citations: parsed.citations || [],
                hasCitations: parsed.hasCitations || false,
              }),
            );

            // Clear streaming state
            setStreamingText("");
            setIsStreaming(false);
            streamingBufferRef.current = "";
            dispatch(setLoading(false));
          }

          // "error": event
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
