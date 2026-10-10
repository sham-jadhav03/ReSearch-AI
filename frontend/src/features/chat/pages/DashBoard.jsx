import { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router";
import "remixicon/fonts/remixicon.css";
import { useChat } from "../hooks/useChat";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentChatId, setError } from "../state/chat.slices";
import Sidebar from "../components/Sidebar";
import ChatInput from "../components/ChatInput";
import ErrorBanner from "../components/ErrorBanner";
import EmptyState from "../components/EmptyState";
import { SUGGESTIONS } from "../shared/global";
import MessageList from "../components/MessageList";
import ThinkingIndicator from "../components/ThinkingIndicator";
import StreamingBubble from "../components/StreamingBubble";

const DashBoard = () => {
  const chat = useChat();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { streamingParts, isStreaming, handleGetChats } = chat;

  const [chatInput, setChatInput] = useState("");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const messageEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const textAreaRef = useRef(null);

  const chats = useSelector((state) => state.chat.chats);
  const currentChatId = useSelector((state) => state.chat.currentChatId);
  const isLoading = useSelector((state) => state.chat.isLoading);
  const error = useSelector((state) => state.chat.error);

  const currentMessages = useMemo(
    () => chats[currentChatId]?.messages || [],
    [chats, currentChatId]
  );

  const currentChatTitle = useMemo(
    () => chats[currentChatId]?.title || null,
    [chats, currentChatId]
  );

  // Smart auto-scroll logic
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <= 100;

    if (isStreaming) {
      if (isNearBottom) {
        container.scrollTop = container.scrollHeight;
      }
    } else {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [currentMessages, streamingParts, isStreaming]);

  useEffect(() => {
    handleGetChats();
  }, [handleGetChats]);

  // Stream elapsed-time ticker (seconds) — drives StreamingProgress stats.
  // Reset lives in the cleanup (runs when isStreaming flips) rather than in the
  // effect body, per react-hooks/set-state-in-effect.
  useEffect(() => {
    if (!isStreaming) return;
    const start = Date.now();
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => {
      clearInterval(interval);
      setElapsedTime(0);
    };
  }, [isStreaming]);

  const handleSubmit = (e) => {
    e?.preventDefault();

    const trimmedMessage = chatInput.trim();
    if (!trimmedMessage || isLoading) {
      return;
    }

    chat.handleSendMessage({ message: trimmedMessage, chatId: currentChatId });
    setChatInput("");
    if (textAreaRef.current) textAreaRef.current.style.height = "auto";
  };

  const openChat = (chatId) => {
    chat.handleOpenChat(chatId);
  };

  const handleSuggestion = (text) => {
    chat.handleSendMessage({ message: text, chatId: null });
  };

  const deleteChat = (e, chatId) => {
    e.stopPropagation();
    chat.handleDeleteChat(chatId);
  };

  const startNewChat = () => {
    dispatch(setCurrentChatId(null));
  };

  const handleDismissError = () => {
    dispatch(setError(null));
  };

  const isEmpty = currentMessages.length === 0 && !isStreaming && !isLoading;

  return (
    <main className="flex h-screen w-full overflow-hidden bg-app text-white">
      {/* Sidebar*/}
      <Sidebar
        deleteChat={deleteChat}
        startNewChat={startNewChat}
        openChat={openChat}
        chats={chats}
        currentChatId={currentChatId}
        isMobileOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Chat Area */}
      <section className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-border-default bg-surface-primary shrink-0">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            aria-label="Open sidebar"
            className="md:hidden p-1.5 -ml-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <i className="ri-menu-line text-lg" />
          </button>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
          <span className="text-[13px] text-text-secondary truncate">
            {currentChatTitle || "New Chat"}
          </span>
        </div>

        {/* Error Banner — error may be a plain string (non-stream paths) or
            { message, code } from send failures; ErrorBanner reads both. */}
        {error && (
          <ErrorBanner
            message={error}
            errorCode={typeof error === "object" ? error.code : undefined}
            onDismiss={handleDismissError}
            onRetry={chat.retryPayload ? chat.retryLastMessage : undefined}
            onLogin={() => navigate("/login")}
          />
        )}

        {/* Messages */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full"
        >
          <div className="max-w-3xl mx-auto px-4 py-7 flex flex-col gap-1">
            {/* Empty state */}
            {isEmpty && <EmptyState handleSuggestion={handleSuggestion} />}

            {/* Message list */}
            {currentMessages.length > 0 && (
              <MessageList messages={currentMessages} />
            )}

            {/* Thinking dots — before first token */}
            {isLoading && !isStreaming && <ThinkingIndicator />}

            {/* Streaming bubble */}
            {isStreaming && <StreamingBubble streamingParts={streamingParts} elapsedTime={elapsedTime} />}

            <div ref={messageEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="shrink-0 px-4 pb-5 pt-3 bg-app border-t border-border-default">
          <ChatInput
            chatInput={chatInput}
            setChatInput={setChatInput}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            textAreaRef={textAreaRef}
            suggestions={SUGGESTIONS}
          />
        </div>
      </section>

      {/* Blinking cursor keyframe */}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </main>
  );
};

export default DashBoard;
