import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI } from "@langchain/mistralai";
import {
  HumanMessage,
  SystemMessage,
  AIMessage,
  tool,
  createAgent,
} from "langchain";
import * as z from "zod";
import { internetSearch } from "./internetSearch.service.js";
import { config } from "../config/config.js";

const geminiModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: config.GEMINI_API_KEY,
});

const mistralModel = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: config.MISTRAL_API_KEY,
});

const searchInternetTool = tool(internetSearch, {
  name: "internetSearch",
  description: "Use this tool to get the latest information from the internet.",
  schema: z.object({
    query: z.string().describe("The search query to look up on the internet."),
  }),
});

const agent = createAgent({
  model: geminiModel,
  tools: [searchInternetTool],
});

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

CONTENT RULES:
- Short paragraphs (2–3 sentences max)
- Explain not only facts, but why they matter
- For technical answers include:
  - concept
  - practical implication
  - key insight
- Present conflicting information if sources differ
- Never fabricate facts

CITATION RULES:
- Cite factual claims inline using [1], [2]
- Multiple sources allowed: [1][2]
- Only use citation numbers that exist in Sources
- Reuse same citation number for same source
- Never invent citations

SOURCE RULES:
Always end with exactly:

**Sources**
[1] Title - URL
[2] Title - URL

Use exact source title when available.
Do not fabricate source titles.

URL RULE:
Never place raw URLs inside answer body.

TONE:
Clear, authoritative, concise, insight-driven.
`;

export const generateResponse = async (message, onChunk) => {
  console.log(message);

  const response = await agent.stream(
    {
      messages: [
        new SystemMessage(System_Prompt),
        ...message.map((msg) => {
          if (msg.role == "user") {
            return new HumanMessage(msg.content);
          } else if (msg.role == "ai") {
            return new AIMessage(msg.content);
          }
        }),
      ],
    },
    { streamMode: "messages" },
  );

  let finalMessage = "";

  for await (const [chunk, metadata] of response) {
    const msgType = typeof chunk?.getType === "function" ? chunk.getType() : chunk?.type;
    const isAIMessage = msgType === "ai" || chunk?.constructor?.name?.includes("AIMessage");

    if (!isAIMessage) {
      continue;
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
      finalMessage += text;
      if (onChunk) onChunk(text);
    }
  }

  return finalMessage;
};

export const generateChatTitle = async (message) => {
  const response = await mistralModel.invoke([
    new SystemMessage(`
            You are a helpful assistant that generates concise and description title for chat conversations.
            User will provide you with the first message of a chat conversation, and you will generate a title that captures the essence of the conversation in 2-4 words.
            The title should be clear, relevant, and engaging, giving users a quick understanding of the chat's topic.    
        `),
    new HumanMessage(`
            Generate a title for a chat conversation based on the following first message:
            "${message}"
            `),
  ]);

  return response.text;
};

const MAX_MESSAGES = 10;

export const buildContext = (message) => {
  /*
  Take last 10 messages only
   */
  const recentMessages = message.slice(-MAX_MESSAGES);

  return recentMessages;
};

export const parseCitations = (rawResponse) => {
  if (!rawResponse) return { answer: "", citations: [] };

  const sourceSplit = rawResponse.split(
    /(?:\n\s*)?(?:\*\*Sources\*\*|##\s*Sources|Sources:)/i,
  );

  const answer = sourceSplit[0].trim();
  const sourceBlock = sourceSplit[1]?.trim() || "";

  if (!sourceBlock) {
    return { answer: rawResponse, citations: [] };
  }

  const citations = [];
  const seen = new Set();

  const lines = sourceBlock.split("\n").filter((line) => line.trim());

  for (const line of lines) {
    const match = line.match(/\[(\d+)\]\s*(.*?)\s*(?:[-–—:]\s*)?(https?:\/\/\S+)/);

    if (match) {
      const url = match[3].trim();

      if (!seen.has(url)) {
        seen.add(url);

        let domain = "";

        try {
          domain = new URL(url).hostname.replace("www.", "");
        } catch {
          domain = url;
        }

        citations.push({
          index: parseInt(match[1]),
          title: match[2].trim(),
          url: match[3].trim(),
        });
      }
    }
  }

  return { answer, citations };
};

export const formatResponse = ({ answer, citations }) => {
  if (!answer) {
    return { answer: "", citations: [], hasCitations: false };
  }

  const cleanAnswer = answer
    .trim()
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+$/gm, "");

  return {
    answer: cleanAnswer,
    citations: citations || [],
    hasCitations: citations?.length > 0,
  };
};
