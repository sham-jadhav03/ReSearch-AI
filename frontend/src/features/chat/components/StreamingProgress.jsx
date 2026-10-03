import React, { useState, useEffect } from "react";

const StreamingProgress = ({
  current,
  total,
  elapsedTime,
  speed,
  streamingText,
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Calculate typing speed inline to avoid setState in effect
  const typingSpeed = current > 0 && elapsedTime > 0
    ? Math.round(current / elapsedTime)
    : (speed || 0);

  if (!isVisible) return null;

  const hasTotal = total > 0;
  const percentage = hasTotal ? Math.min((current / total) * 100, 100) : 0;

  return (
    <div
      className={`bg-[#1a1a1d]/80 backdrop-blur-sm rounded-lg border border-white/10 p-3 z-10 transition-all duration-300 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-medium text-white/90">Streaming</span>
        </div>
        {hasTotal && (
          <div className="text-xs text-white/50">
            {Math.round(percentage)}% complete
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-white/10 rounded-full h-2 mb-3 overflow-hidden">
        {hasTotal ? (
          <div
            className="bg-linear-to-r from-green-400 via-blue-400 to-purple-500 h-2 rounded-full transition-all duration-300 ease-linear"
            style={{ width: `${percentage}%` }}
          />
        ) : (
          <div className="h-2 rounded-full bg-linear-to-r from-green-400 via-blue-400 to-purple-500 animate-pulse" />
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <div className="text-white/50 mb-1">Characters</div>
          <div className="text-white/80 font-mono">{current}</div>
        </div>
        <div>
          <div className="text-white/50 mb-1">Speed</div>
          <div className="text-white/80 font-mono">{typingSpeed} chars/s</div>
        </div>
        <div>
          <div className="text-white/50 mb-1">Elapsed</div>
          <div className="text-white/80 font-mono">{elapsedTime ?? 0}s</div>
        </div>
      </div>

      {/* Current text preview */}
      {streamingText && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="text-xs text-white/50 mb-1">Current text</div>
          <div className="text-xs text-white/80 line-clamp-2 font-mono">
            {streamingText.length > 80
              ? streamingText.substring(0, 80) + "..."
              : streamingText}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(StreamingProgress);
