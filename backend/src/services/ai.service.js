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
You are ResearchAI, a precise and reliable answer engine.

BEHAVIOR:
- Answer clearly, concisely, and in well-structured markdown
- If the question needs current or real-world information, always use the "internetSearch" tool
- Never make up facts or guess URLs

CITATION RULES (follow strictly when you use internetSearch):
- Cite sources inline in your answer using [1], [2], [3] format
- After your answer, always add a "Sources" section in this exact format:

**Sources**
[1] Title - URL
[2] Title - URL

FORMATTING RULES:
- Use markdown headers, bullet points, and code blocks where appropriate
- Keep answers focused — avoid unnecessary padding
- If you don't know something and cannot search, say so clearly
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
}

export const parseCitations = (rawResponse) => {
  if(!rawResponse) return {answer:"", citations: []};

  const sourceSplit = rawResponse.split(/\*\*Sources\*\*|##\s*Sources|Sources:/i)

  const answer = sourceSplit[0].trim()
  const sourceBlock = sourceSplit[1]?.trim() || "";

  if(!sourceBlock) {
    return {answer, citations: []}
  }

  const citations = [];
  const lines = sourceBlock.split("\n").filter((line) => line.trim())

  for(const line of lines){
    const match = line.match(/\[(\d+)\]\s+(.+?)\s+-\s+(https?:\/\/\S+)/)

    if(match){
      citations.push({
        index: parseInt(match[1]),
        title: match[2].trim(),
        url:match[3].trim()
      })
    }
  }

  return {answer, citations}
}
