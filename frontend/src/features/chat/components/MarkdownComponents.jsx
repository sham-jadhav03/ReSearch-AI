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
          <span key={`placeholder-${i}`} className="inline-flex items-center justify-center w-5 h-5 mx-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-semibold text-white/50 shrink-0 cursor-default">
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

export const buildMarkdownComponents = (citations = []) => ({
  p: ({ children }) => (
    <p className="mb-5 last:mb-0 leading-[1.7] text-[#ececf1]">
      {renderWithCitations(children, citations)}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="mb-5 list-disc pl-6 space-y-2 text-[#ececf1]">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-5 list-decimal pl-6 space-y-2 text-[#ececf1]">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="leading-relaxed text-[#ececf1]">
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
      <code className="rounded border border-white/10 bg-white/5 px-1 py-0.5 font-mono text-sm text-[#ef4444]">
        {children}
      </code>
    );
  },
  pre: ({ children }) => <>{children}</>,
  h1: ({ children }) => (
    <h1 className="text-2xl font-semibold mb-6 mt-8 text-white tracking-tight">
      {(children)}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-xl font-semibold mb-4 mt-6 text-white tracking-tight">
      {renderWithCitations(children, citations)}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-lg font-semibold mb-3 mt-4 text-white/95">
      {renderWithCitations(children, citations)}
    </h3>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-white">{renderWithCitations(children, citations)}</strong>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-white/20 pl-4 my-6 italic text-[#d1d1d6] py-1 bg-white/3 rounded-r-lg">
      {children}
    </blockquote>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-400 hover:text-blue-300 underline underline-offset-4 decoration-blue-500/30 font-medium transition-colors break-all"
    >
      {children}
    </a>
  ),
  table: ({ children }) => (
    <div className="my-6 overflow-x-auto rounded-lg border border-white/10">
      <table className="w-full text-sm text-left border-collapse">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-white/5 text-white font-medium">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="px-4 py-3 border-b border-white/10">{children}</th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-3 border-b border-white/5 text-[#d1d1d6]">
      {children}
    </td>
  ),
  hr: () => <hr className="my-8 border-white/10" />,
});

export const markdownComponents = buildMarkdownComponents([]);
