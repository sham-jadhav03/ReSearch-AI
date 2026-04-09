import { useState } from "react";

const CodeBlock = ({ children, className }) => {
  const [copied, setCopied] = useState(false);
  const language = className?.replace("language-", "") || "code";

  const onCopy = () => {
    const text = Array.isArray(children) ? children.join("") : children;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative my-6 overflow-hidden rounded-xl bg-[#0d0d0f] border border-white/10 shadow-lg">
      <div className="flex items-center justify-between bg-[#161617] px-4 py-2.5 text-xs text-white/50 border-b border-white/5">
        <span className="font-mono uppercase tracking-wider">{language}</span>
        <button
          onClick={onCopy}
          className="flex items-center gap-1.5 transition-colors hover:text-white"
        >
          <i
            className={
              copied ? "ri-check-line text-emerald-400" : "ri-clipboard-line"
            }
          />
          {copied ? "Copied!" : "Copy code"}
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <code
          className={`${className} block text-[#e0e0e0] font-mono leading-relaxed`}
        >
          {children}
        </code>
      </div>
    </div>
  );
};

export default CodeBlock;
