import CodeBlock from "../components/ui/CodeBlock";
import CitationChip from "./ui/CitationChip";

export const renderWithCitations = (children, citations) => {
  if (!citations?.length || typeof children !== "string") return children;

  const parts = children.split(/(\[\d+\])/g);

  return parts.map((part, i) => {
    const match = part.match(/\[(\d+)\]/);
    if (match) {
      const citationIndex = match[1];
      const citation = citations.find(
        (c) => c.index === parseInt(citationIndex),
      );

      if (citation) {
        return <CitationChip key={i} citation={citation} index={match[1]} />;
      }
    }

    return part;
  });
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
      {typeof children === "string"
        ? renderWithCitations(children, citations)
        : children}
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
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-xl font-semibold mb-4 mt-6 text-white tracking-tight">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-lg font-semibold mb-3 mt-4 text-white/95">
      {children}
    </h3>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-white">{children}</strong>
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
      className="text-blue-400 hover:text-blue-300 underline underline-offset-4 decoration-blue-500/30 font-medium transition-colors"
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
