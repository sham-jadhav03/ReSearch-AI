import { useEffect, useRef, useState } from "react";
import ReactMarkDown from "react-markdown";
import "remixicon/fonts/remixicon.css";
import { useChat } from "../hooks/useChat";
import { useSelector } from "react-redux";
import remarkGfm from "remark-gfm";

const markdownComponents = {
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="mb-2 list-disc pl-5">{children}</ul>,
  ol: ({ children }) => <ol className="mb-2 list-decimal pl-5">{children}</ol>,
  code: ({ children }) => (
    <code className="rounded bg-white/10 py-0.5">{children}</code>
  ),
  pre: ({ children }) => (
    <pre className="mb-2 overflow-x-auto rounded-xl bg-black/30 p-3">
      {children}
    </pre>
  ),
};

const DashBoard = () => {
  const chat = useChat();
  const { streamingText, isStreaming } = chat;

  const [chatInput, setChatInput] = useState("");
  const messageEndRef = useRef(null);

  const chats = useSelector((state) => state.chat.chats);
  const currentChatId = useSelector((state) => state.chat.currentChatId);
  const streamingBuffer = useSelector((state) => state.chat.streamingBuffer);
  const isLoading = useSelector((state) => state.chat.isLoading);
  const currentMessages = chats[currentChatId]?.messages || [];

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages, streamingText]);

  useEffect(() => {
    // chat.intializeSocketConnect();  // handle inside useChat
    chat.handleGetChats();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedMessage = chatInput.trim();
    if (!trimmedMessage) {
      return;
    }

    chat.handleSendMessage({ message: trimmedMessage, chatId: currentChatId });
    setChatInput("");
  };

  const openChat = (chatId) => {
    chat.handleOpenChat(chatId, chats);
  };

  const deleteChat = (e, chatId) => {
    e.stopPropagation();
    chat.handleDeleteChat(chatId);
  };
  return (
    <main className="min-h-screen w-full bg-[#191a1b] p-3 text-white md:p-5">
      <section className="mx-auto flex h-[calc(100vh-1.5rem)] w-full gap-4 rounded-3xl border p-1 md:h-[calc(100vh-2.5rem)] md:gap-6 md:p-1 border-none">
        {/* Sidebar */}
        <aside className="hidden h-full w-72 shrink-0 rounded-3xl bg-[#202020] p-4 md:flex md:flex-col">
          <h1 className="md-5 text-2xl font-semibold tracking-tight">
            ReSearchAI
          </h1>

          <div className="space-y-2">
            <button className="w-full cursor-pointer rounded-xl mt-4 border-white/60 bg-transparent px-3 py-2 text-left text-base font-medium text-white/90 transition hover:bg-[#282727] hover:text-white">
              <div>
                <i className="ri-edit-line">
                  <span className="chat ml-3 text-white font-bold">
                    New Chat
                  </span>
                </i>
              </div>
            </button>
            {Object.values(chats ?? {}).map((chat, index) => (
              <button
                key={index}
                onClick={() => {
                  openChat(chat.id);
                }}
                className="group w-full cursor-pointer rounded-xl mt-4 border-white/60 bg-transparent px-3 py-2 text-left text-base font-medium text-white/90 transition hover:bg-[#3b3b3b] hover:text-white flex items-center justify-between"
              >
                <span>{chat.title}</span>

                <i
                  onClick={(e) => {
                    deleteChat(e, chat.id);
                  }}
                  className="ri-delete-bin-3-line opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white hover:text-red-300"
                ></i>
              </button>
            ))}
          </div>
        </aside>

        {/* Chat Area */}
        <section className="relative max-w-3/5 mx-auto flex h-full min-w-0 flex-1 flex-col gap-4">
          <div className="messages flex-1 space-y-3 overflow-y-auto pr-1 pb-30">
            {currentMessages.map((message, index) => (
              <div key={index}>
                <div
                  className={`max-w-[82%] w-fit rounded-2xl px-4 py-3 text-sm md:text-base ${
                    message.role === "user"
                      ? "ml-auto rounded-br-none bg-white/12 text-white"
                      : "mr-auto border-none text-white/90"
                  }`}
                >
                  {message.role === "user" ? (
                    <p>{message.content}</p>
                  ) : (
                    <ReactMarkDown
                      remarkPlugins={[remarkGfm]}
                      components={markdownComponents}
                    >
                      {message.content}
                    </ReactMarkDown>
                  )}
                </div>
                {message.role === "ai" && message.citations?.length > 0 && (
                  <div className="mt-2 ml-1 flex flex-wrap gap-2">
                    {message.citations.map((citation) => (
                      <a
                        key={citation.index}
                        href={citation.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-lg bg-white/8 px-3 py-1.5 text-xs text-white/70 hover:bg-white/15 hover:text-white transition border border-white/10"
                      >
                        <span className="text-blue-400 font-semibold">
                          [{citation.index}]
                        </span>
                        <span className="truncate max-w-xs">{citation.title}</span>
                        <i className="ri-external-link-line text-white/40" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {/* Thinking indicator  */}
            {isLoading && !streamingText && (
              <div className="mr-auto flex items-center gap-1 px-4 py-3">
                <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            )}

            {/* streaming bubble */}
            {isStreaming && streamingText && (
              <div className="mr-auto max-w-[82%] w-fit rounded-2xl px-4 py-3 text-sm md:text-base border-none text-white/90">
                <ReactMarkDown
                  remarkPlugins={[remarkGfm]}
                  components={markdownComponents}
                >
                  {streamingText}
                </ReactMarkDown>

                <span className="inline-block w-2 h-4 bg-white/70 ml-1 animate-pulse rounded-sm" />
              </div>
            )}

            <div ref={messageEndRef} />
          </div>

          {/* Input-field */}
          <div className="rounded-3xl w-full absolute bottom-2 border border-white/60 bg-[#2b2b2b] p-30 md:p-5">
            <form
              onSubmit={handleSubmit}
              className="rounded-full bg-[#2f2f2f] px-4 py-3 flex items-center shadow-lg"
            >
              <button
                type="submit"
                className="text-white text-2xl mr-4 hover:rounded-full cursor-pointer hover:opacity-80 hover:w-10 hover:h-10 hover:bg-[#3b3b3b]"
              >
                <i className="ri-add-line"></i>
              </button>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => {
                  setChatInput(e.target.value);
                }}
                placeholder="Ask Anything..."
                className="w-full flex-1 bg-transparent text-lg text-white outline-none transition placeholder:text-gray-300 focus:text-white/90"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isLoading}
                className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg hover:bg-blue-700 cursor-pointer"
              >
                <i className="ri-arrow-up-line"></i>
              </button>
            </form>
          </div>
        </section>
      </section>
    </main>
  );
};

export default DashBoard;
