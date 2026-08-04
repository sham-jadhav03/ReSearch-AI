import { AIMessage, HumanMessage, SystemMessage } from "langchain";
import { FALLBACK_CHAIN, mistrilModel } from "../ai/model.js";
import { searchAgent } from "../ai/agent/search.agent.js";
import { internetSearchOutSchema } from "../ai/internet.js";

const System_Prompt = `
You are ResearchAI, a professional answer engine that produces reliable, structured, source-backed responses.

PRIMARY GOAL:
- Give clear, deep, well-structured answers using verified sources from tools.
- If the question requires up-to-date information, use the "searchInternet" tool to get the latest information from the internet and then answer based on the search results.

RESPONSE STRUCTURE:
1. Start with one direct answer sentence in bold
2. Use ## for major sections
3. Use ### for sub-sections when needed
4. Use bullets for facts, comparisons, steps
5. End with a Sources section

CITATION RULES:
- The internetSearch tool returns a numbered list of sources.
- Cite factual claims inline using [1], [2], matching the order sources
  appeared in the tool result.
- Do NOT write a "Sources" section yourself — it is generated separately.
- Never invent citation numbers that don't correspond to a returned source.

CONTENT RULES:
- Short paragraphs (2-3 sentences max)
- Explain not only facts, but why they matter
- Present conflicting information if sources differ
- Never fabricate facts

TONE:
Clear, authoritative, concise, insight-driven.
`;

const RECURSION_LIMIT = 6;
const MAX_MODEL_ATTEMPTS = FALLBACK_CHAIN.length;

const toLangchainMessages = (messages) => [
  new SystemMessage(System_Prompt),
  ...messages.map((msg) =>
    msg.role === "user"
      ? new HumanMessage(msg.content)
      : new AIMessage(msg.content),
  ),
];
export const generateResponse = async (messages, onChunk) => {
  let lasError;

  for (let attempt = 0; attempt < MAX_MODEL_ATTEMPTS; attempt++) {
    const modelId = FALLBACK_CHAIN[attempt];

    try {
      return await runAgent(modelId, messages, onChunk);

      console.log(runAgent);
    } catch (err) {
      lasError = err;
      console.error(`generateResponse: model "${modelId} failed"`, err);
    }
  }

  throw lasError;
};

const runAgent = async (modelId, messages, onChunk) => {
  const agent = searchAgent(modelId);

  const stream = await agent.stream(
    {
      messages: toLangchainMessages(messages),
    },
    {
      streamMode: "messages",
      recursionLimit: RECURSION_LIMIT,
    },
  );

  let finalMessage = "";

  const parts = [];
  for await (const item of stream) {
    const [chunk] = Array.isArray(item) ? item : [item];

    if (!chunk) {
      continue;
    }

    const msgType =
      typeof chunk?.getType === "function" ? chunk.getType() : chunk?.type;

    const isAIMessage =
      msgType === "ai" || chunk?.constructor?.name?.includes("AIMessage");

    const isToolMessage =
      msgType === "tool" || chunk?.constructor?.name?.includes("ToolMessage");

    if (isAIMessage) {
      handleAIChunk(chunk, parts, onChunk, (text) => (finalMessage += text));
    } else if (isToolMessage) {
      handleToolChunk(chunk, parts, onChunk);
    }
  }

  const citations = buildCitations(parts);

  return {
    finalMessage,
    parts,
    citations,
  };
};

const handleAIChunk = (chunk, parts, onChunk, appendText) => {
  const toolCallChunks = chunk.tool_call_chunks ?? [];

  if (toolCallChunks.length > 0) {
    for (const tc of toolCallChunks) {
      if (tc.name) {
        parts.push({
          type: "dynamic-tool",
          toolName: tc.name,
          state: "Streaming",
          args: "",
          output: null,
        });
        onChunk?.({
          type: "tool-call-start",
          toolName: tc.name,
          toolCallId: tc.id || tc.index,
        });
      }
      if (tc.args) {
        const lastPart = parts[parts.length - 1];

        if (
          lastPart?.type === "dynamic-tool" &&
          lastPart.state === "streaming"
        ) {
          lastPart.args = (lastPart.args || "") + tc.args;
        }
        onChunk?.({
          type: "tool-call-delta",
          toolName: tc.name || parts[parts.length - 1]?.toolName,
          args: tc.args,
        });
      }
    }
  }

  let text = "";
  if (typeof chunk?.content === "string" && chunk.content) {
    text = chunk.content;
  } else if (Array.isArray(chunk?.content)) {
    text = chunk.content
      .filter((c) => c.type === "text")
      .map((c) => c.text)
      .join("");
  }

  if (text) {
    appendText(text);
    const lastPart = parts[parts.length - 1];
    if (lastPart?.type === "text") {
      lastPart.text += text;
    } else {
      parts.push({ type: "text", text });
    }
    onChunk?.({ type: "text-delta", delta: text });
  }
};

const handleToolChunk = (chunk, parts, onChunk) => {
  const activeToolIndex = parts.findLastIndex(
    (p) => p.type === "dynamic-tool" && p.toolName === chunk.name
  );
  if (activeToolIndex !== -1) {
    parts[activeToolIndex].state = "done";
    parts[activeToolIndex].output = chunk.content;
  }
  onChunk?.({
    type: "tool-call-result",
    toolName: chunk.name,
    result: chunk.content,
  });
};

const buildCitations = (parts) => {
  const citations = [];

  for (const part of parts) {
    if (
      part.type !== "dynamic-tool" ||
      part.toolName !== "internetSearch" ||
      part.state !== "done"
    ) {
      continue;
    }

    let sources;
    try {
      const output =
        typeof part.output === "string" ? JSON.parse(part.output) : part.output;
      sources = internetSearchOutSchema.parse(output);
    } catch (err) {
      console.error(
        "buildCitations: malformed internetSearch output, skipping",
        err,
      );
      continue;
    }

    sources.forEach((source, i) => {
      citations.push({
        index: citations.length + 1,
        title: source.title,
        url: source.url,
      });
    });
  }

  return citations;
};

export const generateChatTitle = async (message) => {
  try {
    const response = await mistrilModel.invoke([
      new SystemMessage(
        `Generate a concise 2-4 word title for a chat conversation based on the user's first message.`,
      ),
      new HumanMessage(`First message: "${message}"`),
    ]);
    return response.text;
  } catch (err) {
    console.error("generateChatTitle failed, falling back to default", err);
    return "New Chat";
  }
};

const MAX_MESSAGES = 10;
export const buildContext = (messages) => messages.slice(-MAX_MESSAGES);
