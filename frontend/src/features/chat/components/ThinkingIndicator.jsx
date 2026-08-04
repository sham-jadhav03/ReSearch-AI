import React from "react";

const ThinkingIndicator = () => {
  return (
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
  );
};

export default React.memo(ThinkingIndicator);
