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
          className={`border-2 border-white/20 border-t-white rounded-full animate-spin ${sizeClasses[size]}`}
          role="status"
          aria-label="Loading"
        />
        {text && size !== "small" && (
          <span className={`ml-2 text-white/60 ${textSizes[size]}`}>{text}</span>
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
            className={`w-2 h-2 rounded-full bg-white/40 animate-bounce ${size === "large" ? "w-3 h-3" : size === "small" ? "w-1.5 h-1.5" : "w-2 h-2"}`}
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
        {text && size !== "small" && (
          <span className={`ml-2 text-white/60 ${textSizes[size]}`}>{text}</span>
        )}
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div className={`flex items-center justify-center ${className}`} role="status" aria-label="Loading">
        <div
          className={`bg-blue-500/20 rounded-full ${sizeClasses[size]} animate-pulse`}
          role="status"
          aria-label="Loading"
        />
        {text && size !== "small" && (
          <span className={`ml-2 text-white/60 ${textSizes[size]}`}>{text}</span>
        )}
      </div>
    );
  }

  if (variant === "gradient") {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div
          className={`rounded-full bg-gradient-to-r from-blue-400 to-purple-500 animate-gradient ${sizeClasses[size]}`}
          role="status"
          aria-label="Loading"
        />
        {text && size !== "small" && (
          <span className={`ml-2 text-white/60 ${textSizes[size]}`}>{text}</span>
        )}
      </div>
    );
  }

  // Default fallback
  return (
    <div className={`flex items-center justify-center ${className}`} role="status" aria-label="Loading">
      <div className={`border-2 border-white/20 border-t-white rounded-full animate-spin ${sizeClasses[size]}`}/>
      {text && size !== "small" && (
        <span className={`ml-2 text-white/60 ${textSizes[size]}`}>{text}</span>
      )}
    </div>
  );
};

export default React.memo(LoadingIndicator);