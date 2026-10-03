import React, { useState } from "react";
import ReactMarkDown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import { markdownComponents } from "./MarkdownComponents";
import CodeBlock from "./ui/CodeBlock";
import CitationChip from "./ui/CitationChip";

const fixIncompleteMarkdown = (text) => {
  if (!text) return text;
  const backticks = text.match(/```/g);
  if (backticks && backticks.length % 2 !== 0) {
    return text + '\n```';
  }
  return text;
};

const getToolQuery = (args) => {
  if (!args) return "";
  try {
    const parsed = JSON.parse(args);
    return parsed.query || parsed.input || "";
  } catch {
    const match = args.match(/"(?:query|input)"\s*:\s*"([^"]*)"?/);
    return match ? match[1] : "";
  }
};

// Enhanced code block with copy functionality
const EnhancedCodeBlock = ({ children, className, language }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className="relative mb-4">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2 text-xs font-medium">
          <i className="ri-code-s-slash-line text-blue-400" />
          <span className="text-sm">{language || 'plaintext'}</span>
        </div>
        <button
          onClick={handleCopy}
          className="text-xs px-2 py-1 rounded bg-blue-500/20 hover:bg-blue-500/30 transition-colors"
        >
          {isCopied ? (
            <i className="ri-check-line text-green-400" />
          ) : (
            <i className="ri-file-copy-line text-blue-300" />
          )}
          <span className="ml-1">{isCopied ? 'Copied!' : 'Copy code'}</span>
        </button>
      </div>
      <CodeBlock className={className} language={language}>
        {children}
      </CodeBlock>
    </div>
  );
};

// Enhanced markdown components with better styling
const createEnhancedMarkdownComponents = (citations = []) => {
  const baseComponents = {
    p: ({ children }) => (
      <div className="mb-4 last:mb-0 leading-[1.7] text-[#ececf1]">
        {children}
      </div>
    ),
    ul: ({ children }) => (
      <ul className="mb-4 list-disc pl-5 space-y-1 text-[#ececf1]">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="mb-4 list-decimal pl-5 space-y-1 text-[#ececf1]">{children}</ol>
    ),
    li: ({ children }) => (
      <li className="leading-relaxed text-[#ececf1]">{children}</li>
    ),
    code: ({ children, className, language }) => {
      const isBlock =
        className?.includes("language-") ||
        (typeof children === "string" && children.includes("\n"));
      return isBlock ? (
        <EnhancedCodeBlock
          children={children}
          className={className}
          language={language}
        />
      ) : (
        <code className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono bg-white/5 border border-white/10 text-blue-300">
          {children}
        </code>
      );
    },
    pre: ({ children }) => <>{children}</>,
    h1: ({ children }) => (
      <h1 className="text-2xl font-bold mb-4 mt-6 text-white tracking-tight">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-xl font-bold mb-3 mt-5 text-white tracking-tight">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-lg font-bold mb-2 mt-4 text-white/90">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-base font-semibold mb-1 mt-3 text-white/80">
        {children}
      </h4>
    ),
    strong: ({ children }) => (
      <strong className="font-bold text-white">{children}</strong>
    ),
    em: ({ children }) => (
      <em className="italic text-white/90">{children}</em>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-blue-500/30 pl-4 my-4 italic text-[#d1d1d6] py-2 bg-white/5 rounded-r-lg">
        {children}
      </blockquote>
    ),
    a: ({ children, href }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 hover:text-blue-300 underline underline-offset-2 decoration-blue-500/20 font-medium transition-colors break-all"
      >
        {children}
      </a>
    ),
    table: ({ children }) => (
      <div className="my-4 overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full text-sm text-left border-collapse">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-white/5 text-white font-medium border-b border-white/10">{children}</thead>
    ),
    tbody: ({ children }) => <tbody className="divide-y divide-white/10">{children}</tbody>,
    th: ({ children }) => (
      <th className="px-3 py-2 text-left font-medium text-white border-b border-white/10">{children}</th>
    ),
    td: ({ children }) => (
      <td className="px-3 py-2 text-left text-white/90 border-b border-white/10">{children}</td>
    ),
    hr: () => <hr className="my-4 border-white/10" />,
    img: ({ src, alt, title }) => (
      <div className="my-4 text-center">
        <img
          src={src}
          alt={alt}
          title={title}
          className="max-w-full rounded-lg border border-white/10"
          style={{ maxHeight: '400px' }}
        />
        {title && <div className="mt-1 text-xs text-white/50">{title}</div>}
      </div>
    )
  };

  // Add citation support to relevant components
  const componentsWithCitations = {
    ...baseComponents,
    p: ({ children }) => (
      <div className="mb-4 last:mb-0 leading-[1.7] text-[#ececf1]">
        {children}
      </div>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-blue-500/30 pl-4 my-4 italic text-[#d1d1d6] py-2 bg-white/5 rounded-r-lg">
        {children}
      </blockquote>
    )
  };

  // Wrap components that should render citations
  const finalComponents = Object.entries(componentsWithCitations).reduce((acc, [key, Component]) => {
    const renderWrapper = (props) => {
      // For components that might contain text with citations, we need special handling
      if (['p', 'blockquote', 'li', 'td', 'th'].includes(key)) {
        return React.createElement(Component, props, typeof props.children === 'string' ?
          props.children.split(/(\[\d+\])/g).map((part, index) => {
            if (!part) return null;
            const match = part.match(/\[(\d+)\]/);
            if (match) {
              const citationIndex = parseInt(match[1]);
              const citation = citations.find(c => c.index === citationIndex);
              return citation ? (
                <CitationChip key={index} citation={citation} index={citationIndex} />
              ) : (
                <span key={`placeholder-${index}`} className="inline-flex items-center justify-center w-5 h-5 mx-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-semibold text-white/50 shrink-0 cursor-default">
                  {citationIndex}
                </span>
              );
            }
            return <span key={index}>{part}</span>;
          }) :
          props.children);
      }
      return React.createElement(Component, props);
    };
    acc[key] = renderWrapper;
    return acc;
  }, {});

  return finalComponents;
};

// Prevents MessageRenderer/ReactMarkdown from treating `components` as changed on every streaming frame.
const memoizeByCitations = (fn) => {
  const cache = new Map();
  return (citations = []) => {
    const key = JSON.stringify(citations);
    if (!cache.has(key)) {
      cache.set(key, fn(citations));
    }
    return cache.get(key);
  };
};

const buildMarkdownComponents = memoizeByCitations(createEnhancedMarkdownComponents);

export const MessageRenderer = ({ parts, citations = [] }) => {
  const components = citations.length > 0 ? buildMarkdownComponents(citations) : markdownComponents;

  if (!parts || parts.length === 0) return null;

  return (
    <>
      {parts.map((part, index) => {
        if (part.type === "text") {
          return (
            <ReactMarkDown
              key={index}
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeHighlight]}
              components={components}
            >
              {fixIncompleteMarkdown(part.text)}
            </ReactMarkDown>
          );
        }

        if (part.type === "dynamic-tool") {
          if (part.state === "streaming") {
            const query = getToolQuery(part.args);
            return (
              <div
                key={index}
                className="flex items-center gap-2 p-3 my-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-white/10 rounded-lg text-sm text-white/60 animate-pulse"
              >
                <div className="flex items-center gap-2">
                  <i className="ri-loader-4-line animate-spin text-blue-400" />
                  <span className="font-medium">Thinking...</span>
                </div>
                {query && (
                  <div className="ml-4 text-sm text-white/50">
                    Searching for: "{query}"
                  </div>
                )}
              </div>
            );
          } else if (part.state === "done") {
            if (part.toolName === "internetSearch") {
              let results = [];
              try {
                results = JSON.parse(part.output);
              } catch (e) {
                console.error("Failed to parse tool output:", e);
              }

              return (
                <div key={index} className="my-4 animate-fadeInUp">
                  <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-white/40 uppercase tracking-widest">
                    <i className="ri-global-line" />
                    Sources Found ({results.length})
                  </div>
                  <div className="space-y-2">
                    {results.map((src, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/10 transition-all duration-200 cursor-pointer"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-[9px] font-medium text-blue-400">
                              {i + 1}
                            </div>
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex justify-between items-start">
                              <h3 className="text-sm font-medium text-white line-clamp-2">
                                {src.title || 'Untitled'}
                              </h3>
                              <span className="text-xs text-blue-400">
                                Source {i + 1}
                              </span>
                            </div>
                            <p className="text-xs text-white/60 line-clamp-2">
                              {src.content?.substring(0, 100) || 'No preview available'}
                            </p>
                            <a
                              href={src.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-blue-300 hover:text-blue-200"
                            >
                              <i className="ri-external-link-line" />
                              <span className="truncate max-w-[200px]">
                                {new URL(src.url).hostname.replace('www.', '')}
                              </span>
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            // Fallback for other tools with enhanced display
            return (
              <div
                key={index}
                className="p-3 my-3 rounded-lg bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-white/10"
              >
                <div className="flex items-center gap-2 mb-2">
                  <i className="ri-check-line text-green-400" />
                  <span className="text-sm font-medium text-green-400">
                    {part.toolName} completed successfully
                  </span>
                </div>
                {part.args && (
                  <div className="ml-4">
                    <div className="text-xs text-white/60 mb-1">Input:</div>
                    <pre className="text-xs text-white/80 bg-white/5 p-2 rounded overflow-auto max-h-24">
                      {typeof part.args === 'string' ? part.args.length > 200
                        ? part.args.substring(0, 200) + '...'
                        : part.args
                      : JSON.stringify(part.args, null, 2)}
                    </pre>
                  </div>
                )}
                {part.output && (
                  <div className="mt-3">
                    <div className="text-xs text-white/60 mb-1">Output:</div>
                    <pre className="text-xs text-white-80 bg-white/5 p-2 rounded overflow-auto max-h-24">
                      {typeof part.output === 'string' ? part.output.length > 200
                        ? part.output.substring(0, 200) + '...'
                        : part.output
                      : JSON.stringify(part.output, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          }
        }
        return null;
      })}
    </>
  );
};

export default React.memo(MessageRenderer);