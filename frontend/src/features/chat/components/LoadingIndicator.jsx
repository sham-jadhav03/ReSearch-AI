import React from "react";

const LoadingIndicator = ({
  variant = "spinner",
  size = "medium",
  text = "Loading...",
  className = ""
}) => {
  const sizeClasses = {
    small: "w-6 h-6 border-2",
    medium: "w-8 h-8 border-2",
    large: "w-12 h-12 border-3",
  };

  const textSizes = {
    small: "text-xs",
    medium: "text-sm",
    large: "text-base",
  };

  if (variant === "spinner") {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div
          className={`animate-spin rounded-full border-2 border-border-strong border-t-text-primary ${sizeClasses[size]}`}
          role="status"
          aria-label="Loading"
        />
        {text && size !== "small" && (
          <span className={`ml-2 text-text-secondary ${textSizes[size]}`}>{text}</span>
        )}
      </div>
    );
  }

  if (variant === "dots") {
    return (
      <div className={`flex items-center justify-center gap-1 ${className}`} role="status" aria-label="Loading">
        {[0, 150, 300].map((delay, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full bg-text-secondary animate-bounce ${size === "large" ? "w-3 h-3" : size === "small" ? "w-1.5 h-1.5" : "w-2 h-2"}`}
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
        {text && size !== "small" && (
          <span className={`ml-2 text-text-secondary ${textSizes[size]}`}>{text}</span>
        )}
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div className={`flex items-center justify-center ${className}`} role="status" aria-label="Loading">
        <div
          className={`rounded-full bg-surface-elevated ${sizeClasses[size]} animate-pulse`}
          role="status"
          aria-label="Loading"
        />
        {text && size !== "small" && (
          <span className={`ml-2 text-text-secondary ${textSizes[size]}`}>{text}</span>
        )}
      </div>
    );
  }

  if (variant === "gradient") {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div
          className={`rounded-full bg-linear-to-r from-text-secondary to-text-primary animate-gradient ${sizeClasses[size]}`}
          role="status"
          aria-label="Loading"
        />
        {text && size !== "small" && (
          <span className={`ml-2 text-text-secondary ${textSizes[size]}`}>{text}</span>
        )}
      </div>
    );
  }

  // Default fallback
  return (
    <div className={`flex items-center justify-center ${className}`} role="status" aria-label="Loading">
      <div className={`animate-spin rounded-full border-2 border-border-strong border-t-text-primary ${sizeClasses[size]}`} />
      {text && size !== "small" && (
        <span className={`ml-2 text-text-secondary ${textSizes[size]}`}>{text}</span>
      )}
    </div>
  );
};

export default React.memo(LoadingIndicator);