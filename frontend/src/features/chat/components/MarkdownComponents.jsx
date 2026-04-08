export const markdownComponents = {
  p: ({ children }) => (
    <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mb-2 list-disc pl-5 space-y-1">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-2 list-decimal pl-5 space-y-1">{children}</ol>
  ),
  code: ({ children }) => (
    <code className="rounded-2xl text-lg px-1.5 py-0.5 font-mono text-[13px] text-blue-200">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="mb-2 overflow-x-auto rounded-xl bg-[#0d0d0f] border-white/8 p-4 text-[13px]">
      {children}
    </pre>
  ),
  h1: ({ children }) => (
    <h1 className=" text-lg font-medium mb-2 text-white">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className=" text-base font-medium mb-2 text-white">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className=" text-sm font-medium mb-2 text-white/90">{children}</h3>
  ),
  strong: ({ children }) => (
    <strong className="font-medium text-white">{children}</strong>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-1-2 border-blue-500/50 pl-3 text-white/60 italic my-2">
      {children}
    </blockquote>
  ),
};