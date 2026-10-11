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
      <div className="mb-2 flex items-start justify-between">
        <div className="flex items-center gap-2 text-xs font-medium text-text-secondary">
          <i className="ri-code-s-slash-line text-text-primary" />
          <span className="text-sm">{language || 'plaintext'}</span>
        </div>
        <button
          onClick={handleCopy}
          className="rounded border border-border-default bg-surface-secondary px-2 py-1 text-xs text-text-primary transition-colors hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary"
        >
          {isCopied ? (
            <i className="ri-check-line text-green-400" />
          ) : (
            <i className="ri-file-copy-line text-text-primary" />
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
      <div className="mb-4 last:mb-0 leading-[1.7] text-text-primary">
        {children}
      </div>
    ),
    ul: ({ children }) => (
      <ul className="mb-4 list-disc space-y-1 pl-5 text-text-primary">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="mb-4 list-decimal space-y-1 pl-5 text-text-primary">{children}</ol>
    ),
    li: ({ children }) => (
      <li className="leading-relaxed text-text-primary">{children}</li>
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
        <code className="inline-flex items-center rounded border border-border-default bg-code-bg px-1.5 py-0.5 text-xs font-mono text-text-primary">
          {children}
        </code>
      );
    },
    pre: ({ children }) => <>{children}</>,
    h1: ({ children }) => (
      <h1 className="mb-4 mt-6 text-2xl font-bold tracking-tight text-text-primary">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="mb-3 mt-5 text-xl font-bold tracking-tight text-text-primary">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mb-2 mt-4 text-lg font-bold text-text-primary">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="mb-1 mt-3 text-base font-semibold text-text-secondary">
        {children}
      </h4>
    ),
    strong: ({ children }) => (
      <strong className="font-bold text-text-primary">{children}</strong>
    ),
    em: ({ children }) => (
      <em className="italic text-text-secondary">{children}</em>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-4 rounded-r-lg border-l-4 border-border-strong bg-surface-primary py-2 pl-4 italic text-text-secondary">
        {children}
      </blockquote>
    ),
    a: ({ children, href }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="break-all font-medium text-text-primary underline decoration-border-strong underline-offset-2 transition-colors hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary"
      >
        {children}
      </a>
    ),
    table: ({ children }) => (
      <div className="my-4 overflow-x-auto rounded-lg border border-border-default">
        <table className="w-full text-sm text-left border-collapse">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="border-b border-border-default bg-surface-secondary font-medium text-text-primary">{children}</thead>
    ),
    tbody: ({ children }) => <tbody className="divide-y divide-border-default">{children}</tbody>,
    th: ({ children }) => (
      <th className="border-b border-border-default px-3 py-2 text-left font-medium text-text-primary">{children}</th>
    ),
    td: ({ children }) => (
      <td className="border-b border-border-default px-3 py-2 text-left text-text-secondary">{children}</td>
    ),
    hr: () => <hr className="my-4 border-border-default" />,
    img: ({ src, alt, title }) => (
      <div className="my-4 text-center">
        <img
          src={src}
          alt={alt}
          title={title}
          className="max-w-full rounded-lg border border-border-default"
          style={{ maxHeight: '400px' }}
        />
        {title && <div className="mt-1 text-xs text-text-muted">{title}</div>}
      </div>
    )
  };

  // Add citation support to relevant components
  const componentsWithCitations = {
    ...baseComponents,
    p: ({ children }) => (
      <div className="mb-4 last:mb-0 leading-[1.7] text-text-primary">
        {children}
      </div>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-4 rounded-r-lg border-l-4 border-border-strong bg-surface-primary py-2 pl-4 italic text-text-secondary">
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
                <span key={`placeholder-${index}`} className="mx-0.5 inline-flex h-5 w-5 shrink-0 cursor-default items-center justify-center rounded-full border border-border-default bg-surface-secondary text-[10px] font-semibold text-text-muted">
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
                className="my-3 flex animate-pulse items-center gap-2 rounded-lg border border-border-default bg-surface-primary p-3 text-sm text-text-secondary"
              >
                <div className="flex items-center gap-2">
                  <i className="ri-loader-4-line animate-spin text-text-primary" />
                  <span className="font-medium">Thinking...</span>
                </div>
                {query && (
                  <div className="ml-4 text-sm text-text-muted">
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
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-text-muted">
                    <i className="ri-global-line" />
                    Sources Found ({results.length})
                  </div>
                  <div className="space-y-2">
                    {results.map((src, i) => (
                      <div
                        key={i}
                        className="cursor-pointer rounded-lg border border-border-default bg-surface-primary p-3 transition-colors duration-150 hover:border-border-strong hover:bg-surface-secondary"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-strong bg-surface-secondary text-[9px] font-medium text-text-primary">
                              {i + 1}
                            </div>
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex justify-between items-start">
                              <h3 className="line-clamp-2 text-sm font-medium text-text-primary">
                                {src.title || 'Untitled'}
                              </h3>
                              <span className="text-xs text-text-secondary">
                                Source {i + 1}
                              </span>
                            </div>
                            <p className="line-clamp-2 text-xs text-text-secondary">
                              {src.content?.substring(0, 100) || 'No preview available'}
                            </p>
                            <a
                              href={src.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-text-primary hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary"
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
                className="my-3 rounded-lg border border-border-default bg-surface-primary p-3"
              >
                <div className="flex items-center gap-2 mb-2">
                  <i className="ri-check-line text-green-400" />
                  <span className="text-sm font-medium text-text-primary">
                    {part.toolName} completed successfully
                  </span>
                </div>
                {part.args && (
                  <div className="ml-4">
                    <div className="mb-1 text-xs text-text-muted">Input:</div>
                    <pre className="max-h-24 overflow-auto rounded border border-border-default bg-code-bg p-2 text-xs text-text-secondary">
                      {typeof part.args === 'string' ? part.args.length > 200
                        ? part.args.substring(0, 200) + '...'
                        : part.args
                      : JSON.stringify(part.args, null, 2)}
                    </pre>
                  </div>
                )}
                {part.output && (
                  <div className="mt-3">
                    <div className="mb-1 text-xs text-text-muted">Output:</div>
                    <pre className="max-h-24 overflow-auto rounded border border-border-default bg-code-bg p-2 text-xs text-text-secondary">
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
