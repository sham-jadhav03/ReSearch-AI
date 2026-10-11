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
      className={`z-10 rounded-lg border border-border-default bg-surface-primary p-3 shadow-lg shadow-black/20 transition-all duration-300 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-medium text-text-primary">Streaming</span>
        </div>
        {hasTotal && (
          <div className="text-xs text-text-muted">
            {Math.round(percentage)}% complete
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-surface-elevated">
        {hasTotal ? (
          <div
            className="h-2 rounded-full bg-primary transition-all duration-300 ease-linear"
            style={{ width: `${percentage}%` }}
          />
        ) : (
          <div className="h-2 rounded-full bg-primary/80 animate-pulse" />
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <div className="mb-1 text-text-muted">Characters</div>
          <div className="font-mono text-text-secondary">{current}</div>
        </div>
        <div>
          <div className="mb-1 text-text-muted">Speed</div>
          <div className="font-mono text-text-secondary">{typingSpeed} chars/s</div>
        </div>
        <div>
          <div className="mb-1 text-text-muted">Elapsed</div>
          <div className="font-mono text-text-secondary">{elapsedTime ?? 0}s</div>
        </div>
      </div>

      {/* Current text preview */}
      {streamingText && (
        <div className="mt-3 border-t border-border-default pt-3">
          <div className="mb-1 text-xs text-text-muted">Current text</div>
          <div className="line-clamp-2 font-mono text-xs text-text-secondary">
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
