import React from "react";

const ErrorFallback = ({ error, onReset }) => (
  <div className="flex h-screen w-full flex-col items-center justify-center bg-app px-6 text-text-primary">
    <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-surface-primary p-8 text-center shadow-2xl">
      <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/15">
        <i className="ri-error-warning-line text-2xl text-red-400" />
      </div>
      <h1 className="text-xl font-semibold text-text-primary">Something went wrong</h1>
      <p className="mt-2 text-sm leading-relaxed text-text-secondary">
        An unexpected error crashed this page. Your chats are saved — try
        reloading.
      </p>
      {error?.message && (
        <details className="mt-4 rounded-lg border border-border-default bg-code-bg p-3 text-left">
          <summary className="cursor-pointer text-xs text-text-muted">
            Error details
          </summary>
          <pre className="mt-2 whitespace-pre-wrap text-xs text-red-300/80">
            {error.message}
          </pre>
        </details>
      )}
      <div className="mt-6 flex gap-2.5">
        <button
          onClick={onReset}
          className="flex-1 cursor-pointer rounded-xl border border-border-default bg-surface-secondary px-4 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary"
        >
          Try again
        </button>
        <button
          onClick={() => window.location.reload()}
          className="flex-1 cursor-pointer rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-fg transition-colors hover:bg-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary"
        >
          Reload page
        </button>
      </div>
    </div>
  </div>
);

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return <ErrorFallback error={this.state.error} onReset={this.handleReset} />;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
