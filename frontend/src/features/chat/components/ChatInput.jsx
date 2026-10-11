import { useState, useEffect, useRef } from 'react';

// Character count display component
const CharacterCount = ({ current, max, className = "", showPercentage = true }) => {
  const percentage = Math.min((current / max) * 100, 100);
  const isOverLimit = current > max;

  const getColorClasses = () => {
    if (isOverLimit) return "text-red-400";
    if (percentage > 80) return "text-amber-400";
    return "text-text-muted";
  };

  return (
    <div className={`text-xs ${getColorClasses()} ${className}`}>
      <div className="flex justify-between mb-1">
        <span>{current} characters</span>
        <span className={isOverLimit ? "text-red-400 font-medium" : ""}>
          {showPercentage && `${Math.round(percentage)}%`} (limit {max})
        </span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-surface-elevated">
        <div
          className={`h-full transition-all duration-300 ${isOverLimit ? "bg-red-500" : percentage > 80 ? "bg-amber-500" : "bg-blue-500"}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
};
// Quick suggestions button component
const SuggestionButton = ({ text, onClick, icon }) => {
  return (
    <button
      onClick={() => onClick(text)}
      className="group flex cursor-pointer items-center gap-1.5 rounded-full border border-border-default bg-surface-primary px-3 py-2 text-xs text-text-secondary transition-colors hover:border-border-strong hover:bg-surface-elevated hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary"
      title={text}
    >
      {icon && <i className={`${icon} text-xs`} />}
      <span className="truncate max-w-30">{text}</span>
    </button>
  );};

// AI typing indicator component
const AITypingIndicator = ({ isActive }) => {
  if (!isActive) return null;

  return (
    <div className="flex items-center gap-2 text-xs text-text-muted animate-fadeInUp">
      <div className="w-6 h-6 rounded-full bg-[#10a37f]/20 flex items-center justify-center">
        <i className="ri-robot-line text-[#10a37f] text-xs" />
      </div>
      <div className="flex items-center gap-1">
        <span>AI is typing</span>
        <div className="flex gap-0.5 ml-1">
          {[0, 150, 300].map((delay, i) => (
            <span
              key={i}
              className="w-1 h-1 rounded-full bg-[#10a37f]/50 animate-bounce"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );};

const ChatInput = (props) => {
    const {
        chatInput,
        setChatInput,
        handleSubmit,
        isLoading,
        textAreaRef,
        suggestions = [],
        maxChars = 10000,
        onSuggestionClick,
        showCharacterCount = true
    } = props;

    const [isFocused, setIsFocused] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [textareaHeight, setTextareaHeight] = useState('auto');
    const suggestionRef = useRef(null);

    const charCount = chatInput.length;
    const isOverLimit = charCount > maxChars;
    const canSend = chatInput.trim() && !isLoading && !isOverLimit;

    // Auto-resize textarea
    useEffect(() => {
        if (textAreaRef?.current) {
            const ta = textAreaRef.current;
            ta.style.height = "auto";
            const maxHeight = 120;
            setTextareaHeight(Math.min(ta.scrollHeight, maxHeight));
            ta.style.height = `${textareaHeight}px`;
        }
    }, [chatInput, textAreaRef, textareaHeight]);

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (event) => {
            // Submit with Ctrl/Cmd + Enter
            if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                event.preventDefault();
                if (canSend) {
                    handleSubmit(event);
                }
            }

            // Clear input with Escape (when not focused on other elements)
            if (event.key === 'Escape' && !isFocused && chatInput) {
                setChatInput('');
                textAreaRef?.current?.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [canSend, handleSubmit, isFocused, chatInput, setChatInput, textAreaRef]);

    // Close suggestions on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setChatInput(value);

        // Show suggestions on minimum input
        if (value.trim().length >= 2) {
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const handleSubmitWithCleanup = (e) => {
        e?.preventDefault();
        if (canSend) {
            handleSubmit(e);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setChatInput(suggestion);
        setShowSuggestions(false);
        onSuggestionClick?.(suggestion);
        // Focus and select all text
        setTimeout(() => {
            textAreaRef?.current?.focus();
            const length = suggestion.length;
            textAreaRef.current?.setSelectionRange(length, length);
        }, 0);
    };

    const quickSuggestions = suggestions.length > 0 ? suggestions : [
        "Explain this concept in simple terms",
        "What are the latest developments in AI?",
        "Compare these two approaches",
        "Find recent research papers on"
    ];

    return (
        <>
            <div className="max-w-3xl mx-auto relative">
                {/* Character count and status */}
                {showCharacterCount && charCount > 0 && (
                    <div className="mb-2 flex items-center justify-between px-1">
                        <CharacterCount current={charCount} max={maxChars} className="" />
                        {isOverLimit && (
                            <div className="text-xs text-red-400 ml-3 animate-pulse">
                                Over limit!
                            </div>
                        )}
                    </div>
                )}

                {/* Input container */}
                <div className={`flex items-end gap-3 rounded-2xl border bg-surface-primary px-4 py-3 shadow-lg shadow-black/10 transition-all duration-200
                    ${isOverLimit ? 'border-red-500/50 bg-red-500/5' : isFocused ? 'border-border-strong shadow-[0_0_0_3px_rgba(245,245,245,0.06)]' : 'border-border-default hover:border-border-strong'}
                    ${isLoading ? 'cursor-not-allowed opacity-75' : ''}
                `}>
                    {/* Textarea */}
                    <div className="relative flex-1">
                        <textarea
                            aria-label="Write your research prompt"
                            ref={textAreaRef}
                            value={chatInput}
                            onChange={handleInputChange}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            onKeyDown={(e) => {
                                if (
                                    e.key === "Enter" &&
                                    !e.shiftKey &&
                                    !e.ctrlKey &&
                                    !e.metaKey &&
                                    !isLoading
                                ) {
                                    e.preventDefault();
                                    handleSubmitWithCleanup(e);
                                }
                            }}
                            placeholder="Ask anything..."
                            rows={1}
                            className="min-h-10 max-h-30 w-full flex-1 resize-none self-center bg-transparent py-2 text-[14px] leading-relaxed text-text-primary outline-none placeholder:text-text-muted disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={isLoading}
                            maxLength={maxChars}
                            style={{ height: textareaHeight, overflow: 'hidden' }}
                        />

                        {/* AI typing indicator (show when AI is responding to user input) */}
                        <AITypingIndicator isActive={isLoading && !!chatInput} />
                    </div>

                    {/* Send button */}
                    <button
                        type="button"
                        onClick={handleSubmitWithCleanup}
                        disabled={!canSend}
                        aria-label={canSend ? "Send message" : "Enter a prompt to send"}
                        title={canSend ? "Send message" : "Enter a prompt to send"}
                        className={`flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center self-end rounded-full transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-primary ${
                            canSend
                                ? "bg-primary text-primary-fg hover:scale-105 hover:bg-text-secondary"
                                : "cursor-not-allowed bg-surface-elevated text-text-muted"
                        }`}
                    >
                        <i className="ri-arrow-up-line text-base" />
                    </button>
                </div>

                {/* Status bar */}
                <div className="mt-2 flex min-h-5 items-center justify-between gap-3 px-1">
                    {/* Keyboard shortcuts hint */}
                    <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
                        <kbd className="rounded border border-border-default bg-surface-primary px-1.5 py-0.5 font-mono text-text-secondary">Enter</kbd>
                        <span>to send</span>
                        <span className="mx-0.5 text-border-strong">·</span>
                        <span className="hidden sm:inline">
                            <kbd className="rounded border border-border-default bg-surface-primary px-1.5 py-0.5 font-mono text-text-secondary">Shift + Enter</kbd>
                            <span className="ml-1">for a new line</span>
                        </span>
                    </div>

                    {/* Character count */}
                    <div className="ml-auto hidden items-center gap-1.5 text-[10px] text-text-muted md:flex">
                        <i className="ri-global-line" aria-hidden="true" />
                        <span>Web research</span>
                        {showCharacterCount && (
                            <>
                                <span className="text-border-strong">·</span>
                                <span>{maxChars.toLocaleString()} character limit</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Quick suggestions (powered by AI) */}
                {showSuggestions && suggestions.length > 0 && (
                    <div
                        ref={suggestionRef}
                        className="absolute bottom-full left-4 right-4 z-10 mb-2 rounded-xl border border-border-default bg-surface-secondary p-3 shadow-lg
                            animate-fadeInUp
                        "
                    >
                        <div className="text-xs text-text-muted mb-2">Quick suggestions</div>
                        <div className="flex flex-wrap gap-1.5">
                            {quickSuggestions.map((suggestion, index) => (
                                <SuggestionButton
                                    key={index}
                                    text={suggestion}
                                    onClick={handleSuggestionClick}
                                    icon="ri-sparkling-line"
                                />
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </>
    );
}

export default ChatInput;