import React from "react";

const ErrorBanner = ({ message, onDismiss }) => {
  if (!message) return null;

  return (
    <div className="mx-4 my-3 flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fadeInUp shrink-0">
      <div className="flex items-center gap-2.5 min-w-0">
        <i className="ri-error-warning-line text-base shrink-0 text-red-400" />
        <span className="truncate leading-snug">{message}</span>
      </div>
      <button
        onClick={onDismiss}
        aria-label="Dismiss error"
        className="p-1 rounded-lg hover:bg-red-500/20 transition-colors text-red-400/70 hover:text-red-400 shrink-0 cursor-pointer"
      >
        <i className="ri-close-line text-base" />
      </button>
    </div>
  );
};

export default ErrorBanner;
