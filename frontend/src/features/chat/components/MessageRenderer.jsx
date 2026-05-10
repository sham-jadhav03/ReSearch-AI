import React from "react";
import ReactMarkDown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { markdownComponents, buildMarkdownComponents } from "./MarkdownComponents";

export const MessageRenderer = ({ parts, citations = [] }) => {
  const components = citations.length > 0 ? buildMarkdownComponents(citations) : markdownComponents;

  if (!parts || parts.length === 0) return null;

  return (
    <>
      {parts.map((part, index) => {
        if (part.type === "text") {
          return (
            <ReactMarkDown
              key={index}
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={components}
            >
              {part.text}
            </ReactMarkDown>
          );
        }

        if (part.type === "dynamic-tool") {
          if (part.state === "streaming") {
            return (
              <div
                key={index}
                className="flex items-center gap-2 p-3 my-2 bg-white/5 rounded-lg text-sm text-white/60 animate-pulse"
              >
                <i className="ri-loader-4-line animate-spin"></i>
                Using {part.toolName}...
              </div>
            );
          } else if (part.state === "done") {
            if (part.toolName === "internetSearch") {
              let results = [];
              try {
                results = JSON.parse(part.output);
              } catch (e) {
                console.error("Failed to parse tool output:", e);
              }

              return (
                <div key={index} className="my-4 animate-fadeInUp">
                  <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-white/40 uppercase tracking-widest">
                    <i className="ri-global-line" />
                    Sources Found
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
                    {results.map((src, i) => {
                      let hostname = src.url;
                      try {
                        hostname = new URL(src.url).hostname.replace("www.", "");
                      } catch (e) {}

                      return (
                        <a
                          key={i}
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-col gap-1 min-w-[200px] max-w-[240px] p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all shrink-0 cursor-pointer"
                        >
                          <div className="text-[13px] text-white/80 font-medium line-clamp-2 leading-snug">
                            {src.title}
                          </div>
                          <div className="text-[11px] text-white/40 truncate flex items-center gap-1.5 mt-auto pt-2">
                            <div className="w-3 h-3 rounded-full bg-white/10 flex items-center justify-center text-[8px]">
                              {i + 1}
                            </div>
                            {hostname}
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              );
            }

            // Fallback for other tools
            return (
              <div
                key={index}
                className="p-3 my-2 bg-green-500/10 border border-green-500/20 rounded-lg text-sm text-green-400 flex flex-col gap-1"
              >
                <div className="flex items-center gap-2 font-medium">
                  <i className="ri-check-line"></i>
                  {part.toolName} complete
                </div>
              </div>
            );
          }
        }
        return null;
      })}
    </>
  );
};
