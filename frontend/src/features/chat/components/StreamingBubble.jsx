import React from "react";
import LogoIcon from "../shared/LogoIcon";
import { MessageRenderer } from "./MessageRenderer";

const StreamingBubble = ({ streamingParts }) => {
  return (
    <div className="flex justify-start mb-2">
      <div className="w-6 h-6 rounded-lg bg-blue-500 flex items-center justify-center shrink-0 mr-3 mt-1 self-start">
        <LogoIcon size={13} />
      </div>
      <div className="max-w-[85%] text-[15px] leading-relaxed text-[#d8d8e0]">
        {streamingParts && streamingParts.length > 0 ? (
          <MessageRenderer parts={streamingParts} />
        ) : null}
        {/* Blinking cursor */}
        <span
          className="inline-block w-1.5 h-4 bg-blue-400 ml-1 rounded-[1px] align-text-bottom"
          style={{ animation: "blink 1s step-end infinite" }}
        />
      </div>
    </div>
  );
};

export default React.memo(StreamingBubble);
