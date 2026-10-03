import React, { useState, useEffect, useRef } from "react";
import LogoIcon from "../shared/LogoIcon";
import StreamingProgress from "./StreamingProgress";

// Typed text effect component for realistic streaming simulation.
// - Prefix-continuation: when the part's `text` grows with the same prefix
//   (normal SSE append), typing continues from where it left off instead of
//   restarting from 0. A replaced text (different prefix) restarts cleanly.
// - Tick batching: all owed characters are applied in one setState per tick
//   (backlog catch-up), not one setState per character.
const TypedText = ({ text, speed = 30, onComplete, onUpdate }) => {
  const [displayText, setDisplayText] = useState("");
  const posRef = useRef(0);         // chars currently displayed
  const startTimeRef = useRef(null);
  const prevTextRef = useRef("");

  useEffect(() => {
    if (!text) {
      onComplete?.();
      return;
    }

    const typedPrefix = prevTextRef.current.slice(0, posRef.current);
    if (!text.startsWith(typedPrefix)) {
      posRef.current = 0;
      startTimeRef.current = null;
    }
    prevTextRef.current = text;

    // Preserve pacing across effect re-runs so typing speed stays uniform.
    if (!startTimeRef.current) {
      startTimeRef.current = Date.now() - posRef.current * speed;
    }

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const typed = Math.min(Math.floor(elapsed / speed), text.length);

      if (typed > posRef.current) {
        posRef.current = typed;
        setDisplayText(text.slice(0, typed));
        onUpdate?.(typed, text.length);
      }

      if (typed >= text.length) {
        clearInterval(timer);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, onComplete, onUpdate]);

  // Cursor is derived from state, not effect-set — no setState in render path.
  const isTyping = displayText.length < (text?.length ?? 0);

  return (
    <span>
      {displayText}
      {isTyping && (
        <span className="inline-block w-1.5 h-5 bg-blue-400 ml-1 animate-pulse rounded-[1px] align-text-bottom" />
      )}
    </span>
  );
};

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
    <div className="my-3 p-3 rounded-lg bg-linear-to-r from-purple-500/10 to-blue-500/10 border border-white/10 animate-fadeInUp">
      <div className="flex items-center gap-2 mb-2">
        <i className={`${getToolIcon(toolName)} text-purple-400 text-sm`} />
        <span className="text-sm font-medium text-purple-300">
          {isComplete ? '✓ ' : '🔍 '}{toolName} called
        </span>
        {!isComplete && (
          <span className="text-xs text-white/40 ml-auto">
            Processing...
          </span>
        )}
      </div>
      {args && (
        <div className="ml-6 pl-2 border-l border-white/10">
          <span className="text-xs text-white/60">Query:</span>
          <p className="text-sm text-white/80 mt-1 line-clamp-2">
            {typeof args === 'string' ? args : JSON.stringify(args, null, 2).slice(0, 100)}
          </p>
        </div>
      )}
      {!isComplete && (
        <div className="ml-6 mt-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-xs text-white/50">Executing</span>
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
  const [charCount, setCharCount] = useState(0);

  // onUpdate is called once per typing tick with the typed count — batched,
  // not per character.
  const handleTextUpdate = (current) => {
    setCharCount(current);
  };

  if (streamingParts.length === 0 && !isStreaming) return null;

  return (
    <div className="flex justify-start mb-2 relative">
      <div className="w-8 h-8 rounded-full bg-[#10a37f] border border-white/10 flex items-center justify-center shrink-0 mr-4 mt-0.5 self-start shadow-sm">
        <LogoIcon size={16} color="white" />
      </div>

      <div className="flex flex-col max-w-[85%] relative">
        {/* Main bubble content */}
        <div
          className="rounded-2xl px-5 py-4 text-[16px] leading-relaxed bg-transparent text-[#ececf1] border border-white/5 backdrop-blur-sm"
          style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)' }}
        >
          {/* Display tool calls */}
          {processed?.toolParts?.map((part, index) => (
            <ToolCallDisplay
              key={index}
              toolName={part.toolName}
              args={part.args}
              toolCallId={part.toolCallId}
              isComplete={part.state === 'done'}
            />
          ))}

          {/* Display streaming text with typing effect */}
          {processed?.textParts?.map((part, index) => (
            <div key={index} className="mb-2 last:mb-0">
              <TypedText
                text={part.text}
                speed={30}
                onUpdate={handleTextUpdate}
              />
            </div>
          ))}

          {/* Simple cursor for very short streaming or when no text parts */}
          {isStreaming && (!processed?.hasText || streamingParts.length === 0) && (
            <span
              className="inline-block w-2 h-5 bg-blue-400 ml-1 animate-pulse rounded-[1px] align-text-bottom"
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
          <div className="mt-3 flex items-center gap-3 text-white/50 animate-fadeInUp">
            <div className="w-8 h-8 rounded-full bg-[#10a37f]/20 flex items-center justify-center">
              <LogoIcon size={14} color="#10a37f" />
            </div>
            <span className="text-sm">AI is thinking</span>
            <div className="flex gap-1">
              {[0, 150, 300].map((delay, i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full bg-[#10a37f]/50 animate-bounce"
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