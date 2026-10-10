import React from "react";
import ReactMarkDown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import LogoIcon from "../shared/LogoIcon";
import { MessageRenderer } from "./MessageRenderer";
import { buildMarkdownComponents } from "./MarkdownComponents";

const MessageItem = React.memo(({ message }) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-2`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-[#10a37f] border border-white/10 flex items-center justify-center shrink-0 mr-4 mt-0.5 self-start shadow-sm">
          <LogoIcon size={16} color="white" />
        </div>
      )}
      <div className={`flex flex-col ${isUser ? "max-w-[70%]" : "max-w-[85%]"}`}>
        {/* Bubble */}
        <div
          className={`rounded-2xl px-1 py-1 text-[16px] leading-relaxed
            ${
              isUser
                ? "bg-surface-secondary border-border-default text-text-primary px-5 py-3 rounded-2xl shadow-sm"
                : "bg-transparent text-text-primary"
            }`}
        >
          {isUser ? (
            <p>{message.content}</p>
          ) : message.parts && message.parts.length > 0 ? (
            <MessageRenderer parts={message.parts} citations={message.citations || []} />
          ) : (
            <ReactMarkDown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={buildMarkdownComponents(message.citations || [])}
            >
              {message.content}
            </ReactMarkDown>
          )}
        </div>

        {/* Citation summary section (GPT-like sources footer) */}
        {!isUser && message.hasCitations && message.citations?.length > 0 && (
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
  );
});

const MessageList = ({ messages }) => {
  return (
    <>
      {messages.map((message, index) => (
        <MessageItem key={index} message={message} />
      ))}
    </>
  );
};

export default React.memo(MessageList);
