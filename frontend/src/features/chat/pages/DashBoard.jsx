import { useEffect, useRef, useState, useDeferredValue } from "react";
import ReactMarkDown from "react-markdown";
import "remixicon/fonts/remixicon.css";
import { useChat } from "../hooks/useChat";
import { useDispatch, useSelector } from "react-redux";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { setCurrentChatId } from "../state/chat.slices";
import LogoIcon from "../shared/LogoIcon";
import Sidebar from "../components/Sidebar";
import { SUGGESTIONS } from "../shared/global";
import {
  markdownComponents,
  buildMarkdownComponents,
} from "../components/MarkdownComponents";
import ChatInput from "../components/ChatInput";

const DashBoard = () => {
  const chat = useChat();
  const dispatch = useDispatch();
  const { streamingText, isStreaming, handleGetChats } = chat;

  const deferredStreamingText = useDeferredValue(streamingText);

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
    handleGetChats();
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
        currentChatId={currentChatId}
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
                  <div className="w-8 h-8 rounded-full bg-[#10a37f] border border-white/10 flex items-center justify-center shrink-0 mr-4 mt-0.5 self-start shadow-sm">
                    <LogoIcon size={16} color="white" />
                  </div>
                )}
                <div
                  className={`flex flex-col ${message.role === "user" ? "max-w-[70%]" : "max-w-[85%]"}`}
                >
                  {/* Bubble */}
                  <div
                    className={`rounded-2xl px-1 py-1 text-[16px] leading-relaxed
                      ${
                        message.role === "user"
                          ? "bg-[#2f2f2f] border border-white/5 text-[#ececf1] px-5 py-3 rounded-2xl shadow-sm"
                          : "bg-transparent text-[#ececf1]"
                      }`}
                  >
                    {message.role === "user" ? (
                      <p>{message.content}</p>
                    ) : (
                      <ReactMarkDown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={buildMarkdownComponents(
                          message.citations || [],
                        )}
                      >
                        {message.content}
                      </ReactMarkDown>
                    )}
                  </div>

                  {/* Citation summary section (GPT-like sources footer) */}
                  {message.role === "ai" &&
                    message.hasCitations &&
                    message.citations?.length > 0 && (
                      <div className="mt-8 pt-4 border-t border-white/5">
                        <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-white/40 uppercase tracking-widest">
                          <i className="ri-quote-line" />
                          Sources
                        </div>
                        <div className="flex flex-wrap gap-2 animate-fadeInUp">
                          {message.citations.map((citation, i) => (
                            <a
                              key={citation.index}
                              href={citation.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ animationDelay: `${i * 70}ms` }}
                              className="group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all cursor-pointer animate-fadeInUp"
                            >
                              <span className="flex items-center justify-center w-4 h-4 rounded-full bg-white/10 text-[9px] font-bold text-white/50 group-hover:text-white transition-colors">
                                {citation.index}
                              </span>
                              <span className="text-[12px] text-white/50 group-hover:text-white/80 transition-colors truncate max-w-[150px]">
                                {citation.title}
                              </span>
                            </a>
                          ))}
                        </div>
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
                <div className="max-w-[85%] text-[15px] leading-relaxed text-[#d8d8e0]">
                  {streamingText ? (
                    <ReactMarkDown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                      components={markdownComponents}
                    >
                      {deferredStreamingText}
                    </ReactMarkDown>
                  ) : null}
                  {/* Blinking cursor */}
                  <span
                    className="inline-block w-1.5 h-4 bg-blue-400 ml-1 rounded-[1px] align-text-bottom"
                    style={{ animation: "blink 1s step-end infinite" }}
                  />
                </div>
              </div>
            )}

            <div ref={messageEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="shrink-0 px-4 pb-5 pt-3 bg-[#0f0f10] border-t border-white/5">
          <ChatInput
            chatInput={chatInput}
            setChatInput={setChatInput}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            textAreaRef={textAreaRef}
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
