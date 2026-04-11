import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const CodeBlock = ({ children, className }) => {
  const [copied, setCopied] = useState(false);
  const language = className?.replace("language-", "") || "plain";
  const languages = className?.replace("language-", "") || null;

  const onCopy = async () => {
    const text = Array.isArray(children) ? children.join("") : children;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative my-6 overflow-hidden rounded-xl bg-[#0d0d0f] border border-white/10 shadow-lg">
      <div className="flex items-center justify-between bg-[#161617] px-4 py-2.5 text-xs text-white/50 border-b border-white/5">
        {languages && (
          <span className="font-mono uppercase tracking-wider">{language}</span>
        )}
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
        <SyntaxHighlighter language={language} style={oneDark} PreTag={"div"}>
          {text}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default CodeBlock;
