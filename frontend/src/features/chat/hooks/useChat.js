
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
    let resolvedChatId = chatId;
    let isDone = false;
    let retryCount = 0;
    const MAX_RETRIES = 3;

    dispatch(setLoading(true));
    // Reset streaming state ONLY on first attempt
    streamingPartsRef.current = [];
    setStreamingParts([]);
    setIsStreaming(false);

    while (!isDone && retryCount < MAX_RETRIES) {
      try {
        // Calculate how much text we already have to resume correctly
        const receivedTextLength = streamingPartsRef.current
          .filter((p) => p.type === "text")
          .reduce((acc, p) => acc + p.text.length, 0);

        const data = await sendMessage({
          message,
          chatId: resolvedChatId,
          resumeFromIndex: receivedTextLength > 0 ? receivedTextLength : undefined,
        });

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

            // "start": event
            if (parsed.type === "start") {
              resolvedChatId = resolvedChatId || parsed.chatId;

              // Only add UI state if this is the VERY first start (not a resume)
              if (!chatId && receivedTextLength === 0) {
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

            // "text-delta": event
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

            // "tool-call-start": event
            if (parsed.type === "tool-call-start") {
              // Avoid duplicate tool UI if resuming
              const exists = streamingPartsRef.current.some(
                (p) => p.type === "dynamic-tool" && p.toolName === parsed.toolName
              );

              if (!exists) {
                streamingPartsRef.current.push({
                  type: "dynamic-tool",
                  toolName: parsed.toolName,
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

            // "tool-call-delta": event
            if (parsed.type === "tool-call-delta") {
              const partsArray = streamingPartsRef.current;
              const lastPart = partsArray[partsArray.length - 1];
              if (
                lastPart &&
                lastPart.type === "dynamic-tool" &&
                lastPart.state === "streaming"
              ) {
                lastPart.args = (lastPart.args || "") + parsed.args;
              }

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
                (p) =>
                  p.type === "dynamic-tool" &&
                  p.toolName === parsed.toolName &&
                  p.state === "streaming",
              );

              if (activeToolIndex !== -1) {
                partsArray[activeToolIndex] = {
                  ...partsArray[activeToolIndex],
                  state: "done",
                  output: parsed.result,
                };
              } else {
                // If we missed the start or it already finished, ensure it's in the state as done
                const alreadyDone = partsArray.some(
                  (p) => p.type === "dynamic-tool" && p.toolName === parsed.toolName && p.state === "done"
                );
                if (!alreadyDone) {
                   partsArray.push({
                     type: "dynamic-tool",
                     toolName: parsed.toolName,
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

            // "done": event
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

              // Clear streaming state
              setStreamingParts([]);
              setIsStreaming(false);
              streamingPartsRef.current = [];
              dispatch(setLoading(false));
            }

            // "error": event
            if (parsed.type === "error") {
              throw new Error("AI Stream Error");
            }
          }
        }
      } catch (error) {
        console.error("SSE Connection failed, retrying...", error);
        retryCount++;
        if (retryCount >= MAX_RETRIES) {
          setIsStreaming(false);
          dispatch(setLoading(false));
          dispatch(setError("Connection lost. Please try again."));
          break;
        }
        // Wait before retrying (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount));
      }
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
