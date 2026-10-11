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
  setChatsLoading,
  setCurrentChatId,
  setError,
  setLoadingChatId,
  setDeletingChatId,
} from "../state/chat.slices";
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useRef, useState } from "react";

export const useChat = () => {
  const dispatch = useDispatch();
  const chats = useSelector((state) => state.chat.chats);
  const [streamingParts, setStreamingParts] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [streamingChatId, setStreamingChatId] = useState(null);
  const isSendingRef = useRef(false);
  const streamingPartsRef = useRef([]);
  const chatLoadRequestRef = useRef(0);
  const pendingChatLoadsRef = useRef(new Map());
  const activeChatLoadRef = useRef(null);
  // Holds { message, chatId } of the last FAILED send attempt — only when the
  // stream never produced a "start" event, i.e. the backend almost certainly
  // never persisted the user message, so re-sending cannot duplicate it.
  const [retryPayload, setRetryPayload] = useState(null);

  const handleSendMessage = useCallback(
    async ({ message, chatId }) => {
      if (isSendingRef.current) return;
      isSendingRef.current = true;
      let resolvedChatId = chatId;
      let isDone = false;
      let streamStarted = false;

      dispatch(setError(null));
      setIsSending(true);
      setRetryPayload(null);
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
            buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
            const chunkParts = buffer.split(/\r?\n\r?\n/);
            buffer = done ? "" : chunkParts.pop() || "";

            for (const eventBlock of chunkParts) {
              const jsonStr = eventBlock
                .split(/\r?\n/)
                .filter((line) => line.startsWith("data:"))
                .map((line) => line.slice(5).replace(/^ /, ""))
                .join("\n")
                .trim();
              if (!jsonStr) continue;

              let parsed;
              try {
                parsed = JSON.parse(jsonStr);
              } catch (err) {
                console.error("Failed to parse SSE JSON event:", err);
                continue;
              }

              if (parsed.type === "start") {
                streamStarted = true;
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
                setStreamingChatId(resolvedChatId);
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

                if (frame) {
                  cancelAnimationFrame(frame);
                  frame = null;
                }
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
                setIsSending(false);
                isSendingRef.current = false;
                setStreamingChatId(null);
                streamingPartsRef.current = [];
              }

              if (parsed.type === "error") {
                const error = new Error(
                  parsed.message || "The AI response could not be completed.",
                );
                error.code = parsed.code;
                throw error;
              }
            }
            if (done) break;
        }

        if (!isDone) {
          throw new Error("The response stream ended before completion.");
        }
      } catch (error) {
        console.error("SSE connection failed:", error);
        setIsStreaming(false);
        setIsSending(false);
        isSendingRef.current = false;
        setStreamingChatId(null);

        // Pre-start failures leave no persisted user message on the backend,
        // so a Retry can safely re-send the same payload without doubling the
        // chat history. Once "start" arrived, the backend already wrote the
        // user message — retry is disabled to avoid duplicates.
        if (!streamStarted && !isDone) {
          setRetryPayload({ message, chatId: resolvedChatId });
        }

        // Errors flow into the slice as { message, code } so ErrorBanner can
        // categorize by code first and fall back to message-text heuristics.
        const code =
          error.code ||
          (error.status === 429
            ? "QUOTA_EXCEEDED"
            : error.status >= 500
              ? "SERVER_ERROR"
              : error.status
                ? "NETWORK_ERROR"
                : error.name === "TypeError"
                  ? "NETWORK_ERROR"
                  : undefined);

        dispatch(
          setError({
            message: error.message || "Connection lost. Please try again.",
            code,
          }),
        );
      }
    },
    [dispatch],
  );

  // Re-sends `retryPayload`. Safe because the payload is only captured for
  // sends that failed before the SSE "start" event (nothing persisted).
  const retryLastMessage = useCallback(() => {
    if (!retryPayload) return;
    handleSendMessage(retryPayload);
  }, [retryPayload, handleSendMessage]);

  const handleGetChats = useCallback(async () => {
    try {
      dispatch(setChatsLoading(true));
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
              messagesLoaded: false,
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
      dispatch(setChatsLoading(false));
    }
  }, [dispatch]);

  const handleOpenChat = useCallback(
    async (chatId) => {
      dispatch(setCurrentChatId(chatId));

      if (chats[chatId]?.messagesLoaded) {
        activeChatLoadRef.current = null;
        dispatch(setLoadingChatId(null));
        return;
      }

      const existingRequestId = pendingChatLoadsRef.current.get(chatId);
      if (existingRequestId) {
        activeChatLoadRef.current = existingRequestId;
        dispatch(setLoadingChatId(chatId));
        return;
      }

      const requestId = ++chatLoadRequestRef.current;
      pendingChatLoadsRef.current.set(chatId, requestId);
      activeChatLoadRef.current = requestId;
      dispatch(setLoadingChatId(chatId));

      try {
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
      } catch (error) {
        dispatch(
          setError(error.response?.data?.message || "Failed to load message"),
        );
      } finally {
        pendingChatLoadsRef.current.delete(chatId);
        if (activeChatLoadRef.current === requestId) {
          activeChatLoadRef.current = null;
          dispatch(setLoadingChatId(null));
        }
      }
    },
    [chats, dispatch],
  );

  const handleDeleteChat = useCallback(
    async (chatId) => {
      try {
        dispatch(setDeletingChatId(chatId));
        await deleteChatApi({ chatId });
        dispatch(deleteChat({ chatId }));
      } catch (error) {
        dispatch(
          setError(error.response?.data?.message || "Unable to delete chat."),
        );
      } finally {
        dispatch(setDeletingChatId(null));
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
    isSending,
    streamingChatId,
    streamingParts,
    retryPayload,
    retryLastMessage,
  };
};
