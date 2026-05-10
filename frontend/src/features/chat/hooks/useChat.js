
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
  const [streamingParts, setStreamingParts] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const streamingPartsRef = useRef([]);

  useEffect(() => {
    if (!user?._id) return;
    // Real-time events are now handled via SSE
  }, [user?._id]);

  async function handleSendMessage({ message, chatId }) {
    try {
      dispatch(setLoading(true));

      // Reset streaming state
      streamingPartsRef.current = [];
      setStreamingParts([]);
      setIsStreaming(false);

      const data = await sendMessage({ message, chatId });
      const reader = data.body.getReader();
      const decoder = new TextDecoder();
      let frame = null;

      // KEY FIX: declare resolvedChatId outside the loop
      // so both "start" and "done" blocks share the same value
      let resolvedChatId = chatId;

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        // SSE chunks are separated by \n\n
        const chunkParts = buffer.split("\n\n");
        // The last element might be an incomplete chunk, keep it in the buffer
        buffer = chunkParts.pop() || "";

        for (const line of chunkParts) {
          if (!line.startsWith("data:")) continue;

          const jsonStr = line.replace(/^data:\s*/, "").trim();
          if (!jsonStr) continue;

          let parsed;
          try {
            parsed = JSON.parse(jsonStr);
          } catch (err) {
            console.error("Failed to parse SSE JSON:", jsonStr, err);
            continue;
          }

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

          // "text-delta": event
          if (parsed.type === "text-delta") {
            const partsArray = streamingPartsRef.current;
            const lastPart = partsArray[partsArray.length - 1];

            if (lastPart && lastPart.type === "text") {
              // Create a new object to avoid mutating React state directly
              partsArray[partsArray.length - 1] = { ...lastPart, text: lastPart.text + parsed.delta };
            } else {
              partsArray.push({ type: "text", text: parsed.delta });
            }

            if (!frame) {
              frame = requestAnimationFrame(() => {
                setStreamingParts([...streamingPartsRef.current]);
                frame = null;
              });
            }
          }

          // "tool-call-start": event
          if (parsed.type === "tool-call-start") {
            streamingPartsRef.current.push({
              type: "dynamic-tool",
              toolName: parsed.toolName,
              state: "streaming",
              output: null,
            });

            if (!frame) {
              frame = requestAnimationFrame(() => {
                setStreamingParts([...streamingPartsRef.current]);
                frame = null;
              });
            }
          }

          // "tool-call-result": event
          if (parsed.type === "tool-call-result") {
            const partsArray = streamingPartsRef.current;
            const activeToolIndex = partsArray.findLastIndex(
              (p) => p.type === "dynamic-tool" && p.toolName === parsed.toolName && p.state === "streaming"
            );

            if (activeToolIndex !== -1) {
              partsArray[activeToolIndex] = {
                ...partsArray[activeToolIndex],
                state: "done",
                output: parsed.result
              };
            } else {
               partsArray.push({
                 type: "dynamic-tool",
                 toolName: parsed.toolName,
                 state: "done",
                 output: parsed.result,
               });
            }

            if (!frame) {
              frame = requestAnimationFrame(() => {
                setStreamingParts([...streamingPartsRef.current]);
                frame = null;
              });
            }
          }

          // "done": event 
          if (parsed.type === "done") {
            const finalChatId = resolvedChatId || parsed.aiMessage?.chat;

            dispatch(
              addNewMessage({
                chatId: finalChatId,
                content: parsed.aiMessage?.content || "",
                role: parsed.aiMessage?.role || "ai",
                citations: parsed.citations || [],
                hasCitations: parsed.hasCitations || false,
                parts: [...streamingPartsRef.current],
              }),
            );

            // Clear streaming state
            setStreamingParts([]);
            setIsStreaming(false);
            streamingPartsRef.current = [];
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
    handleSendMessage,
    handleGetChats,
    handleOpenChat,
    handleDeleteChat,
    isStreaming,
    streamingParts,
  };
};
