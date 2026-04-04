export const FEATURES = [
  {
    icon: "ri-search-eye-line",
    title: "Real-time web search",
    desc: "Every answer is grounded in live web data — not stale training knowledge.",
  },
  {
    icon: "ri-link-m",
    title: "Inline citations",
    desc: "Sources cited as [1][2][3] with clickable cards — full transparency on every answer.",
  },
  {
    icon: "ri-flashlight-line",
    title: "Token streaming",
    desc: "Answers appear token by token the moment they're generated. No waiting.",
  },
  {
    icon: "ri-file-pdf-2-line",
    title: "Document RAG",
    desc: "Upload PDFs and ask questions — AI answers grounded in your documents.",
  },
  {
    icon: "ri-image-ai-line",
    title: "Vision analysis",
    desc: "Upload images and get intelligent visual analysis powered by Gemini.",
  },
  {
    icon: "ri-brain-line",
    title: "Conversation memory",
    desc: "Multi-turn memory across sessions — context is never lost mid-conversation.",
  },
];

export const STATS = [
  { value: "2.5s", label: "Avg. response time" },
  { value: "5+", label: "Live sources per answer" },
  { value: "100%", label: "Source transparency" },
];

export const Pipeline = [
  { step: "01", label: "You ask", sub: "Any question" },
  { step: "02", label: "Web search", sub: "Tavily retrieval" },
  { step: "03", label: "LLM reasons", sub: "Gemini 2.5" },
  { step: "04", label: "Answer streams", sub: "Token by token" },
  { step: "05", label: "Sources cited", sub: "[1][2][3]" },
];

export const navLink = ["Features", "How it works", "About"]