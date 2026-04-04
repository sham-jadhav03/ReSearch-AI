import { useEffect, useRef, useState } from "react";
import ReactMarkDown from "react-markdown";
import "remixicon/fonts/remixicon.css";
import { useChat } from "../hooks/useChat";
import { useDispatch, useSelector } from "react-redux";
import remarkGfm from "remark-gfm";
import { setCurrentChatId } from "../slices/chat.slices";
import LogoIcon from "../shared/LogoIcon";
import Sidebar from "../components/Sidebar";

const markdownComponents = {
  p: ({ children }) => (
    <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mb-2 list-disc pl-5 space-y-1">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-2 list-decimal pl-5 space-y-1">{children}</ol>
  ),
  code: ({ children }) => (
    <code className="rounded-2xl text-lg px-1.5 py-0.5 font-mono text-[13px] text-blue-200">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="mb-2 overflow-x-auto rounded-xl bg-[#0d0d0f] border-white/8 p-4 text-[13px]">
      {children}
    </pre>
  ),
  h1: ({ children }) => (
    <h1 className=" text-lg font-medium mb-2 text-white">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className=" text-base font-medium mb-2 text-white">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className=" text-sm font-medium mb-2 text-white/90">{children}</h3>
  ),
  strong: ({ children }) => (
    <strong className="font-medium text-white">{children}</strong>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-1-2 border-blue-500/50 pl-3 text-white/60 italic my-2">
      {children}
    </blockquote>
  ),
};

const SUGGESTIONS = [
  "Latest breakthroughs in AI",
  "How does RAG work?",
  "Explain transformers",
  "Best practices in Node.js",
];

const DashBoard = () => {
  const chat = useChat();
  const dispatch = useDispatch();
  const { streamingText, isStreaming } = chat;

  const [chatInput, setChatInput] = useState("");
  const messageEndRef = useRef(null);
  const textAreaRef = useRef(null);

  const chats = useSelector((state) => state.chat.chats);
  const currentChatId = useSelector((state) => state.chat.currentChatId);
  const isLoading = useSelector((state) => state.chat.isLoading);
  const currentMessages = chats[currentChatId]?.messages || [];
  const currentChatTitle = chats[currentChatId]?.title || null;

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages, streamingText]);

  useEffect(() => {
    // chat.intializeSocketConnect();  // handle inside useChat
    chat.handleGetChats();
  }, []);

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
    chat.handleOpenChat(chatId, chats);
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

  const isEmpty = currentMessages.length === 0 && !isStreaming && !isLoading;

  return (
    <main className="flex h-screen w-full overflow-hidden bg-[#0f0f10] text-white">
      {/* Sidebar*/}
      <Sidebar
        deleteChat={deleteChat}
        startNewChat={startNewChat}
        openChat={openChat}
        chats={chats}
        currentChatId ={currentChatId}
      />

      {/* Main Chat Area */}
      <section className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-white/[0.07] bg-[#161618] shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
          <span className="text-[13px] text-[#888892]">
            {currentChatTitle || "New Chat"}
          </span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto scroll-smooth [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
          <div className="max-w-3xl mx-auto px-4 py-7 flex flex-col gap-1">
            {/* Empty state */}
            {isEmpty && (
              <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/12 border border-blue-500/20 flex items-center justify-center">
                  <LogoIcon size={22} />
                </div>
                <div>
                  <p className="text-lg font-medium text-white mb-1">
                    What do you want to research?
                  </p>
                  <p className="text-[13px] text-white/30 max-w-xs leading-relaxed">
                    Ask anything — I'll search the web and give you
                    source-backed answers.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSuggestion(s)}
                      className="px-4 py-2 rounded-full border border-white/10 bg-white/4 text-[12px] text-white/50 hover:border-blue-500/50 hover:text-blue-400 hover:bg-blue-500/8 transition-all duration-150 cursor-pointer"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message list */}
            {currentMessages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} mb-2`}
              >
                {message.role === "ai" && (
                  <div className="w-6 h-6 rounded-lg bg-blue-500 flex items-center justify-center shrink-0 mr-3 mt-1 self-start">
                    <LogoIcon size={13} />
                  </div>
                )}
                <div className="flex flex-col max-w-[78%]">
                  {/* Bubble */}
                  <div
                    className={`rounded-2xl px-4 py-3 text-[14px] leading-relaxed
                      ${
                        message.role === "user"
                          ? "bg-[#1e2a3d] border border-blue-500/2 text-[#c8d8f4] rounded-br-sm"
                          : "bg-transparent text-[#d8d8e0]"
                      }`}
                  >
                    {message.role === "user" ? (
                      <p>{message.content}</p>
                    ) : (
                      <ReactMarkDown
                        remarkPlugins={[remarkGfm]}
                        components={markdownComponents}
                      >
                        {typeof message.content === "string"
                          ? message.content
                          : message.content?.content ||
                            JSON.stringify(message.content)}
                      </ReactMarkDown>
                    )}
                  </div>

                  {/* Citation chips */}
                  {message.role === "ai" &&
                    message.hasCitations &&
                    message.citations?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5 pl-0.5">
                        {message.citations.map((citation) => (
                          <a
                            key={citation.index}
                            href={citation.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1c1c1f] border border-white/8 text-[11px] text-white/50 hover:border-blue-500/40 hover:text-blue-400 transition-all duration-150 cursor-pointer"
                          >
                            <span className="text-blue-400 font-medium font-mono text-[10px]">
                              [{citation.index}]
                            </span>
                            <span className="truncate max-w-32.5">
                              {citation.title}
                            </span>
                            <i className="ri-external-link-line text-white/25 text-[10px]" />
                          </a>
                        ))}
                      </div>
                    )}
                </div>
              </div>
            ))}

            {/* Thinking dots — before first token */}
            {isLoading && !isStreaming && (
              <div className="flex items-center gap-1.5 pl-9 py-2">
                {[0, 150, 300].map((delay, i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-white/25 animate-bounce"
                    style={{
                      animationDelay: `${delay}ms`,
                      animationDuration: "1s",
                    }}
                  />
                ))}
              </div>
            )}

            {/* Streaming bubble */}
            {isStreaming && (
              <div className="flex justify-start mb-2">
                <div className="w-6 h-6 rounded-lg bg-blue-500 flex items-center justify-center shrink-0 mr-3 mt-1 self-start">
                  <LogoIcon size={13} />
                </div>
                <div className="max-w-[78%] text-[14px] leading-relaxed text-[#d8d8e0]">
                  {streamingText ? (
                    <ReactMarkDown
                      remarkPlugins={[remarkGfm]}
                      components={markdownComponents}
                    >
                      {streamingText}
                    </ReactMarkDown>
                  ) : null}
                  {/* Blinking cursor */}
                  <span
                    className="inline-block w-0.5 h-3.75 bg-blue-400 ml-0.5 rounded-sm align-text-bottom"
                    style={{ animation: "blink 0.9s step-end infinite" }}
                  />
                </div>
              </div>
            )}

            <div ref={messageEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="shrink-0 px-4 pb-5 pt-3 bg-[#0f0f10] border-t border-white/5">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-2.5 bg-[#1a1a1d] border border-white/8 rounded-2xl px-4 py-3 transition-all duration-200 focus-within:border-blue-500/50 focus-within:shadow-[0_0_0_3px_rgba(79,142,247,0.1)]">
              {/* Attach button->file send */}
              <button
                type="button"
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-white/8 text-white/30 hover:text-white/60 hover:border-white/15 hover:bg-white/5 transition-all duration-150 shrink-0 self-end mb-0.5 cursor-pointer"
              >
                <i className="ri-attachment-2 text-sm" />
              </button>

              {/* Textarea */}
              <textarea
                ref={textAreaRef}
                value={chatInput}
                onChange={(e) => {
                  setChatInput(e.target.value);
                  const ta = textAreaRef.current;
                  if (ta) {
                    ta.style.height = "auto";
                    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e?.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Ask anything..."
                rows={1}
                className="flex-1 bg-transparent text-[14px] text-white outline-none resize-none leading-relaxed placeholder-white/25 max-h-30 self-center py-0.5"
              />

              {/* Send button */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!chatInput.trim() || isLoading}
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 self-end transition-all duration-200 cursor-pointer
                  bg-blue-500 hover:bg-blue-400 hover:scale-105
                  disabled:bg-white/6 disabled:cursor-not-allowed disabled:scale-100"
              >
                <i className="ri-arrow-up-line text-sm text-white" />
              </button>
            </div>

            <p className="text-center text-[11px] text-white/20 mt-2.5 tracking-[0.2px]">
              ResearchAI searches the web in real-time · Sources cited inline
            </p>
          </div>
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
