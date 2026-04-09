import React from 'react'

const ChatInput = (props) => {

    const { chatInput, setChatInput, handleSubmit, isLoading, textAreaRef } = props

    return (
        <>
            <div className="max-w-3xl mx-auto">
                <div className="flex items-end gap-2.5 bg-[#1a1a1d] border border-white/8 rounded-2xl px-4 py-3 transition-all duration-200 focus-within:border-blue-500/50 focus-within:shadow-[0_0_0_3px_rgba(79,142,247,0.1)]">
                    {/* Attach button->file send */}
                    <button
                        type="button"
                        className="w-7 h-7 flex items-center justify-center rounded-lg border border-white/8 text-white/30 hover:text-white/60 hover:border-white/15 hover:bg-white/5 transition-all duration-150 shrink-0 self-end mb-0.5 cursor-pointer"
                    >
                        <i className="ri-attachment-2 text-sm" />
                    </button>

                    {/* Textarea */}
                    <textarea
                        ref={textAreaRef}
                        value={chatInput}
                        onChange={(e) => {
                            setChatInput(e.target.value);
                            const ta = textAreaRef.current;
                            if (ta) {
                                ta.style.height = "auto";
                                ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
                            }
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e?.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                        placeholder="Ask anything..."
                        rows={1}
                        className="flex-1 bg-transparent text-[14px] text-white outline-none resize-none leading-relaxed placeholder-white/25 max-h-30 self-center py-0.5"
                    />

                    {/* Send button */}
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!chatInput.trim() || isLoading}
                        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 self-end transition-all duration-200 cursor-pointer
                  bg-blue-500 hover:bg-blue-400 hover:scale-105
                  disabled:bg-white/6 disabled:cursor-not-allowed disabled:scale-100"
                    >
                        <i className="ri-arrow-up-line text-sm text-white" />
                    </button>
                </div>

                <p className="text-center text-[11px] text-white/20 mt-1 tracking-[0.2px]">
                    ResearchAI searches the web in real-time · Sources cited inline
                </p>
            </div>
        </>
    )
}

export default ChatInput