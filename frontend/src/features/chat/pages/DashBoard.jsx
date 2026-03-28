import { useEffect, useState } from "react";
import ReactMarkDown from "react-markdown";
import "remixicon/fonts/remixicon.css";
import { useChat } from "../hooks/useChat";
import { useSelector } from "react-redux";

const DashBoard = () => {
  const chat = useChat();
  const [chatInput, setChatInput] = useState("");

  const chats = useSelector((state) => state.chat.chats);
  const currentChatId = useSelector((state)=> state.chat.currentChatId);

  useEffect(() => {
    chat.intializeSocketConnect();
    chat.handleGetChats();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedMessage = chatInput.trim();
    if (!trimmedMessage) {
      return;
    }

    chat.handleSendMessage({ messages: trimmedMessage, chatId: currentChatId });
    setChatInput("");
  };

  const openChat = (chatId) => {
    chat.handleGetChats(chatId);
  };
  return (
    <main className="min-h-screen w-full bg-[#191a1b] p-3 text-white md:p-5">
      <section className="mx-auto flex h-[calc(100vh-1.5rem)] w-full gap-4 rounded-3xl border p-1 md:h-[calc(100vh-2.5rem)] md:gap-6 md:p-1 border-none">
        <aside className="hidden h-full w-72 shrink-0 rounded-3xl bg-[#202020] p-4 md:flex md:flex-col">
          <h1 className="md-5 text-2xl font-semibold tracking-tight">
            ReSearchAI
          </h1>

          <div className="space-y-2">
            {Object.values(chats ?? {}).map((chat, index) => (
              <button
                key={index}
                onClick={() => {
                  openChat(chat.id);
                }}
                className="w-full cursor-pointer rounded-xl mt-4 border border-white/60 bg-transparent px-3 py-2 text-left text-base font-medium text-white/90 transition hover:border-white hover:text-white"
              >
                {chat.title}
              </button>
            ))}
          </div>
        </aside>

        <section className="relative max-w-3/5 mx-auto flex h-full min-w-0 flex-1 flex-col gap-4">
          <div className="messages flex-1 space-y-3 overflow-y-auto pr-1 pb-30">
            {chats[currentChatId]?.messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[82%] w-fit rounded-2xl px-4 py-3 text-sm md:text-base ${
                  message.role === "user"
                    ? "ml-auto rounded-br-none bg-white/12 text-white"
                    : "mr-auto border border-white/25 bg-[#0f1626] text-white/90"
                }`}
              >
                {message.role === "user" ? (
                  <p>{message.content}</p>
                ) : (
                  <ReactMarkDown
                    components={{
                      p: ({ children }) => (
                        <p className="mb-2 last:mb-0">{children}</p>
                      ),
                      ul: ({ children }) => (
                        <ul className="mb-2 list-disc pl-5">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="mb-2 list-decimal pl-5">{children}</ol>
                      ),
                      code: ({ children }) => (
                        <code className="rounded bg-white/10 py-0.5">
                          {children}
                        </code>
                      ),
                      pre: ({ children }) => (
                        <pre className="mb-2 overflow-x-auto rounded-xl bg-black/30 p-3">
                          {children}
                        </pre>
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkDown>
                )}
              </div>
            ))}
          </div>

          <div className="rounded-3xl w-full absolute bottom-2 border border-white/60 bg-[#080b12] p-4 md:p-5">
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
                disabled={!chatInput.trim()}
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
