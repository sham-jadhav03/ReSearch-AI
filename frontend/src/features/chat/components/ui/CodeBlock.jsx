import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const CodeBlock = ({ children, className }) => {
  const [copied, setCopied] = useState(false);
  const language = className?.replace("language-", "") || "plain";
  const languages = className?.replace("language-", "") || null;

  // Safely extract plain text from children for clipboard.
  // Handles string, array of strings/elements, and nested React elements.
  const getPlainText = (ch) => {
    if (typeof ch === "string") return ch;
    if (Array.isArray(ch)) {
      return ch.map(getPlainText).join("");
    }
    if (ch && typeof ch === "object" && ch.props) {
      return getPlainText(ch.props.children);
    }
    return "";
  };
  const plainText = getPlainText(children);

  const onCopy = async () => {
    await navigator.clipboard.writeText(plainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative my-6 overflow-hidden rounded-lg border border-border-default bg-code-bg shadow-lg shadow-black/20">
      <div className="flex items-center justify-between border-b border-border-default bg-surface-primary px-4 py-2.5 text-xs text-text-secondary">
        {languages && (
          <span className="font-mono uppercase tracking-wider">{language}</span>
        )}
        <button
          onClick={onCopy}
          className="flex items-center gap-1.5 rounded px-1.5 py-1 transition-colors hover:bg-surface-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary"
        >
          <i
            className={
              copied ? "ri-check-line text-emerald-400" : "ri-clipboard-line"
            }
          />
          {copied ? "Copied!" : "Copy code"}
        </button>
      </div>
      <div className="overflow-x-auto p-4">
        <SyntaxHighlighter
          language={language}
          style={oneDark}
          PreTag={"div"}
          customStyle={{
            margin: 0,
            background: "transparent",
            color: "var(--color-text-primary)",
          }}
        >
          {plainText}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default CodeBlock;
