import React from "react";

const GoogleIcon = (props) => {
  return (
    <div>
      <div className="my-5 flex items-center gap-3 text-xs text-text-muted">
        <span className="h-px flex-1 bg-border-default" />
        <span>OR</span>
        <span className="h-px flex-1 bg-border-default" />
      </div>

      <a
        href={props.googleLoginUrl}
        className="flex w-full items-center justify-center gap-3 rounded-lg border border-border-default bg-surface-primary px-4 py-3 font-semibold text-text-primary transition hover:bg-app focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary"
      >
        <svg
          aria-hidden="true"
          className="h-5 w-5 shrink-0"
          viewBox="0 0 24 24"
        >
          <path
            fill="#4285F4"
            d="M23.49 12.27c0-.78-.07-1.53-.2-2.27H12v4.51h6.44c-.28 1.45-1.11 2.68-2.35 3.51v2.93h3.8c2.22-2.04 3.6-5.05 3.6-8.68Z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.93l-3.8-2.93c-1.08.72-2.46 1.15-4.13 1.15-3.17 0-5.86-2.14-6.82-5.02H1.26v3.02A12 12 0 0 0 12 24Z"
          />
          <path
            fill="#FBBC05"
            d="M5.18 14.27a7.2 7.2 0 0 1 0-4.54V6.71H1.26a12 12 0 0 0 0 10.58l3.92-3.02Z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.36.61 4.61 1.82l3.42-3.42C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.26 6.71l3.92 3.02C6.14 6.89 8.83 4.75 12 4.75Z"
          />
        </svg>
        Continue with Google
      </a>
    </div>
  );
};

export default GoogleIcon;
