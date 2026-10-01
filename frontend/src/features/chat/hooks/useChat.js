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
import { useCallback, useRef, useState } from "react";

export const useChat = () => {
  const dispatch = useDispatch();
  const chats = useSelector((state) => state.chat.chats);
  const [streamingParts, setStreamingParts] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const streamingPartsRef = useRef([]);

  const handleSendMessage = useCallback(
    async ({ message, chatId }) => {
      let resolvedChatId = chatId;
      let isDone = false;

      dispatch(setError(null));
      dispatch(setLoading(true));
      streamingPartsRef.current = [];
      setStreamingParts([]);
      setIsStreaming(false);

      try {
        const data = await sendMessage({ message, chatId: resolvedChatId });

          const reader = data.body.getReader();
          const decoder = new TextDecoder();
          let frame = null;
          let buffer = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const chunkParts = buffer.split("\n\n");
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

              if (parsed.type === "start") {
                resolvedChatId = resolvedChatId || parsed.chatId;

                if (!chatId) {
                  dispatch(
                    createNewChat({
                      chatId: resolvedChatId,
                      title: parsed.title,
                    }),
                  );
                  dispatch(
                    addNewMessage({
                      chatId: resolvedChatId,
                      content: message,
                      role: "user",
                    }),
                  );
                }

                dispatch(setCurrentChatId(resolvedChatId));
                setIsStreaming(true);
              }

              if (parsed.type === "text-delta") {
                const partsArray = streamingPartsRef.current;
                const lastPart = partsArray[partsArray.length - 1];

                if (lastPart && lastPart.type === "text") {
                  partsArray[partsArray.length - 1] = {
                    ...lastPart,
                    text: lastPart.text + parsed.delta,
                  };
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

              if (parsed.type === "tool-call-start") {
                const exists = streamingPartsRef.current.some(
                  (p) =>
                    p.type === "dynamic-tool" &&
                    p.toolCallId === parsed.toolCallId,
                );
                if (!exists) {
                  streamingPartsRef.current.push({
                    type: "dynamic-tool",
                    toolName: parsed.toolName,
                    toolCallId: parsed.toolCallId,
                    state: "streaming",
                    args: "",
                    output: null,
                  });
                  if (!frame) {
                    frame = requestAnimationFrame(() => {
                      setStreamingParts([...streamingPartsRef.current]);
                      frame = null;
                    });
                  }
                }
              }

              if (parsed.type === "tool-call-delta") {
                const partsArray = streamingPartsRef.current;
                const activeToolIndex = partsArray.findLastIndex(
                  (p) =>
                    p.type === "dynamic-tool" &&
                    p.toolCallId === parsed.toolCallId &&
                    p.state === "streaming",
                );
                const lastPart = partsArray[activeToolIndex];
                if (
                  lastPart &&
                  lastPart.type === "dynamic-tool" &&
                  lastPart.state === "streaming"
                ) {
                  partsArray[activeToolIndex] = {
                    ...lastPart,
                    args: (lastPart.args || "") + parsed.args,
                  };
                }
                if (!frame) {
                  frame = requestAnimationFrame(() => {
                    setStreamingParts([...streamingPartsRef.current]);
                    frame = null;
                  });
                }
              }

              if (parsed.type === "tool-call-result") {
                const partsArray = streamingPartsRef.current;
                const activeToolIndex = partsArray.findLastIndex(
                  (p) =>
                    p.type === "dynamic-tool" &&
                    p.toolCallId === parsed.toolCallId &&
                    p.state === "streaming",
                );
                if (activeToolIndex !== -1) {
                  partsArray[activeToolIndex] = {
                    ...partsArray[activeToolIndex],
                    state: "done",
                    output: parsed.result,
                  };
                } else {
                  const alreadyDone = partsArray.some(
                    (p) =>
                      p.type === "dynamic-tool" &&
                      p.toolCallId === parsed.toolCallId &&
                      p.state === "done",
                  );
                  if (!alreadyDone) {
                    partsArray.push({
                      type: "dynamic-tool",
                      toolName: parsed.toolName,
                      toolCallId: parsed.toolCallId,
                      state: "done",
                      output: parsed.result,
                    });
                  }
                }
                if (!frame) {
                  frame = requestAnimationFrame(() => {
                    setStreamingParts([...streamingPartsRef.current]);
                    frame = null;
                  });
                }
              }

              if (parsed.type === "done") {
                isDone = true;
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

                setStreamingParts([]);
                setIsStreaming(false);
                streamingPartsRef.current = [];
                dispatch(setLoading(false));
              }

              if (parsed.type === "error") {
                const error = new Error(
                  parsed.message || "The AI response could not be completed.",
                );
                error.code = parsed.code;
                throw error;
              }
            }
        }

        if (!isDone) {
          throw new Error("The response stream ended before completion.");
        }
      } catch (error) {
        console.error("SSE connection failed:", error);
        setIsStreaming(false);
        dispatch(setError(error.message || "Connection lost. Please try again."));
        dispatch(setLoading(false));
      }
    },
    [dispatch],
  );

  const handleGetChats = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const data = await getChats();
      const fetchedChats = data?.chats || [];
      dispatch(
        setChats(
          fetchedChats.reduce((acc, chat) => {
            if (!chat?._id) return acc;
            acc[chat._id] = {
              id: chat._id,
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
        setError(error.response?.data?.message || "Failed to fetch user data"),
      );
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const handleOpenChat = useCallback(
    async (chatId) => {
      try {
        if (!chats[chatId]?.messages?.length) {
          const data = await getMessages({ chatId });
          const { messages } = data;

          const formattedMessages = messages.map((msg) => ({
            content: msg.content,
            role: msg.role,
            citations: msg.citations || [],
            hasCitations: msg.hasCitations || false,
            parts: msg.parts || [],
          }));

          dispatch(addMessages({ chatId, messages: formattedMessages }));
        }
        dispatch(setCurrentChatId(chatId));
      } catch (error) {
        dispatch(
          setError(error.response?.data?.message || "Failed to load message"),
        );
      }
    },
    [chats, dispatch],
  );

  const handleDeleteChat = useCallback(
    async (chatId) => {
      try {
        dispatch(setLoading(true));
        await deleteChatApi({ chatId });
        dispatch(deleteChat({ chatId }));
      } catch (error) {
        dispatch(
          setError(error.response?.data?.message || "Unable to delete chat."),
        );
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch],
  );

  return {
    handleSendMessage,
    handleGetChats,
    handleOpenChat,
    handleDeleteChat,
    isStreaming,
    streamingParts,
  };
};
