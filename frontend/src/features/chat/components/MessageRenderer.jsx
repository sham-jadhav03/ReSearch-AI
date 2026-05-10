import React from "react";
import ReactMarkDown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { markdownComponents } from "./MarkdownComponents";

export const MessageRenderer = ({ parts }) => {
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
              components={markdownComponents}
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
            // Placeholder: Here you would render a specific React Component (e.g. <SourcesList />) 
            // based on part.toolName and part.output, exactly like Generative UI.
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
