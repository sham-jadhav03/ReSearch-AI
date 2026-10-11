import CodeBlock from "../components/ui/CodeBlock";
import CitationChip from "./ui/CitationChip";
const processStringWithCitations = (text, citations) => {
  if (typeof text !== "string") return text;

  const parts = text.split(/(\[\d+\])/g);
  if (parts.length === 1) return text;
  
  return parts.map((part, i) => {
    const match = part.match(/\[(\d+)\]/);
    if (match) {
      const citationIndex = parseInt(match[1]);
      const citation = citations?.find(
        (c) => c.index === citationIndex,
      );

      if (citation) {
        return <CitationChip key={i} citation={citation} index={citationIndex} />;
      } else {
        return (
          <span key={`placeholder-${i}`} className="mx-0.5 inline-flex h-5 w-5 shrink-0 cursor-default items-center justify-center rounded-full border border-border-default bg-surface-secondary text-[10px] font-semibold text-text-muted">
            {citationIndex}
          </span>
        );
      }
    }

    return <span key={i}>{part}</span>;
  });
};

export const renderWithCitations = (children, citations) => {
  if (typeof children === "string") {
    return processStringWithCitations(children, citations);
  }

  if (Array.isArray(children)) {
    return children.map((child, i) => {
      if (typeof child === "string") {
        return <span key={i}>{processStringWithCitations(child, citations)}</span>;
      }
      return child;
    });
  }

  return children;
};

const DEFAULT_CITATIONS = [];

const createMarkdownComponents = (citations = DEFAULT_CITATIONS) => ({
  p: ({ children }) => (
    <div className="mb-5 last:mb-0 leading-[1.7] text-text-primary">
      {renderWithCitations(children, citations)}
    </div>
  ),
  ul: ({ children }) => (
    <ul className="mb-5 list-disc space-y-2 pl-6 text-text-primary">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-5 list-decimal space-y-2 pl-6 text-text-primary">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="leading-relaxed text-text-primary">
      {renderWithCitations(children, citations)}
    </li>
  ),
  code: ({ children, className }) => {
    const isBlock =
      className?.includes("language-") ||
      (typeof children === "string" && children.includes("\n"));
    return isBlock ? (
      <CodeBlock className={className}>{children}</CodeBlock>
    ) : (
      <code className="rounded border border-border-default bg-code-bg px-1 py-0.5 font-mono text-sm text-text-primary">
        {children}
      </code>
    );
  },
  pre: ({ children }) => <>{children}</>,
  h1: ({ children }) => (
    <h1 className="mb-6 mt-8 text-2xl font-semibold tracking-tight text-text-primary">
      {(children)}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-4 mt-6 text-xl font-semibold tracking-tight text-text-primary">
      {renderWithCitations(children, citations)}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-3 mt-4 text-lg font-semibold text-text-primary">
      {renderWithCitations(children, citations)}
    </h3>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-text-primary">{renderWithCitations(children, citations)}</strong>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-6 rounded-r-lg border-l-4 border-border-strong bg-surface-primary py-1 pl-4 italic text-text-secondary">
      {children}
    </blockquote>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="break-all font-medium text-text-primary underline decoration-border-strong underline-offset-4 transition-colors hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary"
    >
      {children}
    </a>
  ),
  table: ({ children }) => (
    <div className="my-6 overflow-x-auto rounded-lg border border-border-default">
      <table className="w-full text-sm text-left border-collapse">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-surface-secondary font-medium text-text-primary">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="border-b border-border-default px-4 py-3 text-text-primary">{children}</th>
  ),
  td: ({ children }) => (
    <td className="border-b border-border-default px-4 py-3 text-text-secondary">
      {children}
    </td>
  ),
  hr: () => <hr className="my-8 border-border-default" />,
});

const memoizeByCitations = (fn) => {
  const cache = new Map();
  return (citations = DEFAULT_CITATIONS) => {
    const key = citations ?? DEFAULT_CITATIONS;
    if (!cache.has(key)) {
      cache.set(key, fn(key));
    }
    return cache.get(key);
  };
};

// Prevents MessageRenderer/ReactMarkdown from treating `components` as changed on every streaming frame.
export const buildMarkdownComponents = memoizeByCitations(createMarkdownComponents);

export const markdownComponents = buildMarkdownComponents([]);
