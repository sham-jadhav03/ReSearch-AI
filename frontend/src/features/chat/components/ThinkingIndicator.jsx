import React from "react";

const ThinkingIndicator = ({ text = "AI is thinking", className = "" }) => {
  return (
    <div className={`flex items-center gap-2 pl-9 py-2 animate-fadeInUp ${className}`}>
      {/* Pulsing logo/robot icon */}
      <div className="flex items-center gap-2 mr-2">
        <div className="relative w-8 h-8">
          <div className="absolute inset-0 rounded-full bg-[#10a37f]/20 animate-ping" />
          <div className="relative w-8 h-8 rounded-full bg-[#10a37f]/30 flex items-center justify-center">
            <i className="ri-robot-line text-[#10a37f] text-xl" />
          </div>
        </div>
      </div>

      {/* Text and animated dots */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-white/80 font-medium">{text}</span>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-[#10a37f]/70 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-[#10a37f]/70 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-[#10a37f]/70 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>

      {/* Status tooltip text */}
      <div className="hidden lg:flex items-center gap-2 pl-4 ml-2 border-l border-white/10">
        <div className="w-1 h-1 rounded-full bg-[#10a37f] animate-pulse" />
        <span className="text-xs text-white/40">Searching and reasoning</span>
      </div>
    </div>
  );
};

export default React.memo(ThinkingIndicator);