import React, { useState } from "react";

const ErrorBanner = ({ message, onDismiss, errorCode, onRetry, onLogin }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Error categorization and configuration
  const getErrorConfig = () => {
    // Handle string messages without code
    const code = errorCode || (typeof message === 'object' ? message.code : null);
    const msg = typeof message === 'object' ? message.message : message;

    if (code === 'NETWORK_ERROR' || msg?.includes?.('network') || msg?.includes?.('fetch') || msg?.includes?.('connection')) {
      return {
        title: 'Connection Issue',
        message: 'Unable to connect to the AI service. Please check your internet connection.',
        icon: 'ri-wifi-off-line',
        variant: 'warning',
        showRetry: true,
        dismissible: true,
      };
    }

    if (code === 'AUTH_ERROR' || msg?.includes?.('unauthorized') || msg?.includes?.('authentication') || msg?.includes?.('login') || msg?.includes?.('token')) {
      return {
        title: 'Authentication Required',
        message: 'Your session has expired. Please log in to continue.',
        icon: 'ri-login-box-line',
        variant: 'error',
        showLogin: true,
        dismissible: true,
      };
    }

    if (code === 'QUOTA_EXCEEDED' || msg?.includes?.('quota') || msg?.includes?.('limit') || msg?.includes?.('rate')) {
      return {
        title: 'Usage Limit Reached',
        message: 'You\'ve reached your usage limit. Please wait a moment or upgrade your plan.',
        icon: 'ri-alert-line',
        variant: 'warning',
        dismissible: true,
      };
    }

    if (code === 'VALIDATION_ERROR' || msg?.includes?.('validation') || msg?.includes?.('invalid')) {
      return {
        title: 'Invalid Input',
        message: msg || 'Please check your input and try again.',
        icon: 'ri-error-warning-line',
        variant: 'error',
        dismissible: true,
      };
    }

    if (code === 'SERVER_ERROR' || code === '500' || msg?.includes?.('server') || msg?.includes?.('internal')) {
      return {
        title: 'Server Error',
        message: 'Something went wrong on our end. We\'ve been notified and are working on it.',
        icon: 'ri-server-line',
        variant: 'error',
        showRetry: true,
        dismissible: true,
      };
    }

    if (code === 'TIMEOUT_ERROR' || msg?.includes?.('timeout')) {
      return {
        title: 'Request Timeout',
        message: 'The request took too long. Please try again with a shorter query.',
        icon: 'ri-time-line',
        variant: 'warning',
        showRetry: true,
        dismissible: true,
      };
    }

    // Default error handling
    return {
      title: 'Something went wrong',
      message: msg || 'An unexpected error occurred. Please try again.',
      icon: 'ri-error-warning-line',
      variant: 'error',
      showRetry: true,
      dismissible: true,
    };
  };

  const config = getErrorConfig();

  const variantStyles = {
    error: 'bg-red-500/10 border-red-500/30 text-red-400',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
  };

  const handleRetry = () => {
    onRetry?.();
    onDismiss?.();
  };

  const handleLogin = () => {
    onLogin?.();
    onDismiss?.();
  };

  return (
    <div className={`mx-4 my-3 flex shrink-0 items-start gap-3 rounded-xl border px-4 py-3 text-sm animate-fadeInUp ${variantStyles[config.variant]}`}>
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <i className={`${config.icon} text-base shrink-0 ${config.variant === 'error' ? 'text-red-400' : config.variant === 'warning' ? 'text-amber-400' : 'text-blue-400'}`} />
        <div className="flex-1 min-w-0">
          <div className="mb-1 font-medium text-text-primary">{config.title}</div>
          <div className="truncate leading-snug text-text-secondary">{config.message}</div>
          {isExpanded && (
            <div className="mt-2 border-t border-border-default pt-2 text-xs text-text-muted">
              <pre className="whitespace-pre-wrap text-text-muted">{JSON.stringify({ errorCode, message }, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1.5 shrink-0">
        {config.showRetry && onRetry && (
          <button
            onClick={handleRetry}
            className="cursor-pointer rounded-lg border border-border-default bg-surface-secondary px-3 py-1.5 text-xs font-medium text-text-primary transition-colors hover:border-border-strong hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <i className="ri-refresh-line mr-1" />
            Retry
          </button>
        )}

        {config.showLogin && (
          <button
            onClick={handleLogin}
            className="cursor-pointer rounded-lg border border-blue-500/30 bg-blue-500/20 px-3 py-1.5 text-xs font-medium text-blue-300 transition-colors hover:border-blue-500/50 hover:bg-blue-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <i className="ri-login-box-line mr-1" />
            Log In
          </button>
        )}

        {config.dismissible && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? "Collapse error details" : "Expand error details"}
            className="shrink-0 cursor-pointer rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-surface-elevated hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary"
          >
            <i className={isExpanded ? "ri-arrow-up-line text-base" : "ri-arrow-down-line text-base"} />
          </button>
        )}

        <button
          onClick={onDismiss}
          aria-label="Dismiss error"
          className="shrink-0 cursor-pointer rounded-lg p-1.5 text-text-muted transition-colors hover:bg-surface-elevated hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary"
        >
          <i className="ri-close-line text-base" />
        </button>
      </div>
    </div>
  );
};

export default React.memo(ErrorBanner);