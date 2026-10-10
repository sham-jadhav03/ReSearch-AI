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
      <div className="w-full bg-white/10 rounded-full h-1 overflow-hidden">
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
      className="group px-3 py-2 rounded-full border border-white/10 bg-white/5 text-xs text-white/50 hover:border-blue-500/50 hover:text-blue-400 hover:bg-blue-500/10 transition-all duration-200 cursor-pointer flex items-center gap-1.5"
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
                <div className={`flex items-end gap-2.5 bg-surface-secondary border rounded-2xl px-4 py-3 transition-all duration-200
                    ${isFocused ? 'border-blue-500/50 shadow-[0_0_0_3px_rgba(79,142,247,0.1)]' : 'border-border-default'}
                    ${isOverLimit ? 'border-red-500/30 bg-red-500/5' : ''}
                    ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}
                `}>

                    {/* Attach button */}
                    <button
                        type="button"
                        className="w-7 h-7 flex items-center justify-center rounded-lg border border-border-default text-white/30 hover:text-white/60 hover:border-white/15 hover:bg-white/5 transition-all duration-150 shrink-0 self-end mb-0.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading}
                    >
                        <i className="ri-attachment-2 text-sm" />
                    </button>

                    {/* Textarea */}
                    <div className="relative flex-1">
                        <textarea
                            ref={textAreaRef}
                            value={chatInput}
                            onChange={handleInputChange}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey  && !isLoading) {
                                    e.preventDefault();
                                    handleSubmitWithCleanup(e);
                                }
                            }}
                            placeholder="Ask anything..."
                            rows={1}
                            className="flex-1 bg-transparent text-[14px] text-text-primary outline-none resize-none leading-relaxed placeholder-white/25 max-h-30 self-center py-0.5 w-full disabled:opacity-50 disabled:cursor-not-allowed"
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
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 self-end transition-all duration-200 cursor-pointer
                            ${canSend
                                ? 'bg-blue-500 hover:bg-blue-400 hover:scale-105 shadow-[0_2px_8px_rgba(59,130,246,0.3)]'
                                : 'bg-white/6 cursor-not-allowed opacity-50'
                            }
                        "
                    >
                        <i className="ri-arrow-up-line text-sm text-white" />
                    </button>
                </div>

                {/* Status bar */}
                <div className="flex items-center justify-between mt-2 px-1">
                    {/* Keyboard shortcuts hint */}
                    <div className="text-[10px] text-white/20 hidden sm:block">
                        <kbd className="px-1 py-0.5 bg-white/10 rounded text-text-muted">Ctrl</kbd>
                        <kbd className="px-1 py-0.5 bg-white/10 rounded text-text-muted ml-1">Enter</kbd>
                        <span className="ml-1">to send</span>
                    </div>

                    {/* Character count */}
                    {showCharacterCount && (
                        <div className="text-[10px] text-white/30 ml-auto hidden md:block">
                            {maxChars} characters limit
                        </div>
                    )}
                </div>

                {/* Quick suggestions (powered by AI) */}
                {showSuggestions && suggestions.length > 0 && (
                    <div
                        ref={suggestionRef}
                        className="absolute bottom-full left-4 right-4 mb-2 p-3 bg-surface-secondary border border-white/10 rounded-xl shadow-lg z-10
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

                <p className="text-center text-[11px] text-white/20 mt-3 tracking-[0.2px]">
                    ResearchAI searches the web in real-time · Sources cited inline
                </p>
            </div>
        </>
    );
}

export default ChatInput;