import React, { useState, useEffect } from "react";
import LogoIcon from "../shared/LogoIcon";
import StreamingProgress from "./StreamingProgress";
import MessageRenderer from "./MessageRenderer"

// Tool visualization component for better UX
const ToolCallDisplay = ({ toolName, args, isComplete }) => {
  if (!toolName) return null;

  const getToolIcon = (toolName) => {
    const iconMap = {
      'internetSearch': 'ri-global-line',
      'calculator': 'ri-function-line',
      'codeInterpreter': 'ri-code-box-line',
      'fileSearch': 'ri-folder-line',
      'webScrape': 'ri-spam-line',
      'default': 'ri-tools-line'
    };
    return iconMap[toolName] || iconMap.default;
  };

  return (
    <div className="my-3 animate-fadeInUp rounded-lg border border-border-default bg-surface-primary p-3">
      <div className="flex items-center gap-2 mb-2">
        <i className={`${getToolIcon(toolName)} text-sm text-text-primary`} />
        <span className="text-sm font-medium text-text-primary">
          {isComplete ? '✓ ' : '🔍 '}{toolName} called
        </span>
        {!isComplete && (
          <span className="ml-auto text-xs text-text-muted">
            Processing...
          </span>
        )}
      </div>
      {args && (
        <div className="ml-6 border-l border-border-default pl-2">
          <span className="text-xs text-text-muted">Query:</span>
          <p className="mt-1 line-clamp-2 text-sm text-text-secondary">
            {typeof args === 'string' ? args : JSON.stringify(args, null, 2).slice(0, 100)}
          </p>
        </div>
      )}
      {!isComplete && (
        <div className="ml-6 mt-2">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            <span className="text-xs text-text-muted">Executing</span>
          </div>
        </div>
      )}
    </div>
  );
};

const StreamingBubble = ({ streamingParts, isStreaming, elapsedTime }) => {
  const [showAdvancedLoader, setShowAdvancedLoader] = useState(false);

  // Show advanced loader after 2 seconds; the cleanup resets it when
  // streaming stops or the component re-runs — avoiding setState directly in
  // the effect body (react-hooks/set-state-in-effect), which causes cascades.
  useEffect(() => {
    if (!isStreaming) return;
    const timer = setTimeout(() => setShowAdvancedLoader(true), 2000);
    return () => {
      clearTimeout(timer);
      setShowAdvancedLoader(false);
    };
  }, [isStreaming]);

  // Process streaming parts and extract text for typing effect
  const processStreamingParts = () => {
    if (!streamingParts || streamingParts.length === 0) return null;

    const textParts = streamingParts.filter(part => part.type === 'text');
    const toolParts = streamingParts.filter(part => part.type === 'dynamic-tool');

    return {
      textParts,
      toolParts,
      hasText: textParts.length > 0,
      hasTools: toolParts.length > 0,
      activeTools: toolParts.filter(tool => !tool.state || tool.state === 'streaming'),
      completedTools: toolParts.filter(tool => tool.state === 'done')
    };
  };

  const processed = processStreamingParts();
  // charCount computed directly from accumulated text for the progress indicator
  const charCount = processed?.textParts?.reduce((sum, part) => sum + (part.text?.length || 0), 0) || 0;

  if (streamingParts.length === 0 && !isStreaming) return null;

  return (
    <div className="flex justify-start mb-2 relative">
      <div className="mr-4 mt-0.5 flex h-8 w-8 shrink-0 self-start items-center justify-center rounded-lg border border-border-strong bg-primary">
        <LogoIcon size={16} color="var(--color-primary-fg)" />
      </div>

      <div className="flex flex-col max-w-[85%] relative">
        {/* Main bubble content */}
        <div
          className="rounded-lg border border-border-default bg-transparent px-5 py-4 text-[16px] leading-relaxed text-text-primary"
        >
          {/* Display tool calls — unchanged UI */}
          {processed?.toolParts?.map((part, index) => (
            <ToolCallDisplay
              key={index}
              toolName={part.toolName}
              args={part.args}
              toolCallId={part.toolCallId}
              isComplete={part.state === 'done'}
            />
          ))}

          {/* Display streaming text with Markdown rendering — same path as completed messages */}
          {processed?.textParts.length > 0 && (
            <MessageRenderer
              parts={processed.textParts}
              citations={[]}
            />
          )}

          {/* Simple cursor for very short streaming or when no text parts */}
          {isStreaming && (!processed?.hasText || streamingParts.length === 0) && (
            <span
              className="ml-1 inline-block h-5 w-2 animate-pulse rounded-[1px] bg-text-primary align-text-bottom"
              style={{ animation: 'blink 1.5s step-end infinite' }}
            />
          )}
        </div>

        {/* Streaming progress indicator — a stream has no knowable total, so
            the bar is indeterminate and the card shows real stats (chars/s,
            elapsed) rather than a fake percentage. */}
        {isStreaming && showAdvancedLoader && charCount > 0 && (
          <StreamingProgress
            className="absolute bottom-16 left-4 right-4"
            current={charCount}
            total={0}
            elapsedTime={elapsedTime}
          />
        )}

        {/* Enhanced loading indicator when no content but streaming */}
        {isStreaming && !streamingParts.length && showAdvancedLoader && (
          <div className="mt-3 flex animate-fadeInUp items-center gap-3 text-text-muted">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-default bg-surface-secondary">
              <LogoIcon size={14} color="var(--color-text-primary)" />
            </div>
            <span className="text-sm">AI is thinking</span>
            <div className="flex gap-1">
              {[0, 150, 300].map((delay, i) => (
                <span
                  key={i}
                  className="h-2 w-2 animate-bounce rounded-full bg-text-muted"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(StreamingBubble);
