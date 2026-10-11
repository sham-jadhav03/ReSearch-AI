import React from "react";
import ReactMarkDown from "react-markdown";
import remarkGfm from "remark-gfm";
import LogoIcon from "../shared/LogoIcon";
import { MessageRenderer } from "./MessageRenderer";
import { buildMarkdownComponents } from "./MarkdownComponents";
import { getSafeExternalUrl } from "../shared/safeExternalUrl";

const MessageItem = React.memo(({ message }) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-2`}>
      {!isUser && (
        <div className="mr-4 mt-0.5 flex h-8 w-8 shrink-0 self-start items-center justify-center rounded-full border border-border-default bg-[#10a37f] shadow-sm">
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
              components={buildMarkdownComponents(message.citations || [])}
            >
              {message.content}
            </ReactMarkDown>
          )}
        </div>

        {/* Citation summary section (GPT-like sources footer) */}
        {!isUser && message.hasCitations && message.citations?.length > 0 && (
          <div className="mt-8 border-t border-border-default pt-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-text-muted">
              <i className="ri-quote-line" />
              Sources
            </div>
            <div className="flex flex-wrap gap-2 animate-fadeInUp">
              {message.citations.map((citation, i) => {
                const safeUrl = getSafeExternalUrl(citation.url);
                const content = (
                  <>
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-surface-elevated text-[9px] font-bold text-text-secondary transition-colors group-hover:text-text-primary">
                      {citation.index}
                    </span>
                    <span className="max-w-[150px] truncate text-[12px] text-text-secondary transition-colors group-hover:text-text-primary">
                      {citation.title}
                    </span>
                  </>
                );
                const className =
                  "group flex items-center gap-2 rounded-lg border border-border-default bg-surface-primary px-3 py-1.5 transition-colors hover:bg-surface-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary animate-fadeInUp";

                return safeUrl ? (
                  <a
                    key={citation.index}
                    href={safeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ animationDelay: `${i * 70}ms` }}
                    className={`${className} cursor-pointer`}
                  >
                    {content}
                  </a>
                ) : (
                  <span
                    key={citation.index}
                    aria-label={`${citation.title || "Source"} (link unavailable)`}
                    style={{ animationDelay: `${i * 70}ms` }}
                    className={`${className} opacity-60`}
                  >
                    {content}
                  </span>
                );
              })}
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
