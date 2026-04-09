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

const geminiModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: process.env.GEMINI_API_KEY,
});

const mistralModel = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: process.env.MISTRAL_API_KEY,
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
You are ResearchAI, a professional and precise web-powered answer engine. Your goal is to provide deep, structured, and insight-driven answers.

RESPONSE STRUCTURE:
1.  **Summary/Direct Answer**: Start with a concise 1-2 sentence direct answer to the user's query.
2.  **Key Points/Headlines**: Use numbered or bulleted headings for main sections (e.g., "1) Topic Name").
3.  **Analysis Sections**: Use "Why this matters:" or "In simple terms:" to provide deeper context or accessibility.
4.  **Bold Results**: Always bold key numbers, names, and critical terms.

FORMATTING RULES:
- Use ## for large headers and ### for sub-headers.
- Keep paragraphs very short (max 2-3 sentences).
- Use bullet points liberally to improve scannability.
- Use > blockquotes for important quotes or key synthesis of ideas.
- Never dump raw URLs in the text.

CITATION RULES:
- Cite EVERY fact inline as [1], [2], [3] immediately after the sentence or point.
- Multiple citations should be shown like [1][2].
- DO NOT add a "Sources" section yourself at the end of the text body; the system will handle parsing and displaying them. Just provide the answer content.
- Ensure all facts are backed by the internetSearch tool results.

BEHAVIOR:
- Maintain a neutral, professional, and authoritative tone.
- If data is conflicting, present both sides.
- If no information is found, state it clearly.
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
    /\*\*Sources\*\*|##\s*Sources|Sources:/i,
  );

  const answer = sourceSplit[0].trim();
  const sourceBlock = sourceSplit[1]?.trim() || "";

  if (!sourceBlock) {
    return { answer, citations: [] };
  }

  const citations = [];
  const lines = sourceBlock.split("\n").filter((line) => line.trim());

  for (const line of lines) {
    const match = line.match(/\[(\d+)\]\s+(.+?)\s+-\s+(https?:\/\/\S+)/);

    if (match) {
      citations.push({
        index: parseInt(match[1]),
        title: match[2].trim(),
        url: match[3].trim(),
      });
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
