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

export const generateResponse = async (message, onChunk) => {
  console.log(message);

  const response = await agent.stream(
    {
      messages: [
        new SystemMessage(`
        You are a helpful and precise assistant for answering questions.
        If you don't know the answer, say you don't know.
        If the question requires up-to-date information, use the "internetSearch" tool to get the latest information from the internet and then answer based on the search results`),
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

  for await (const [chunk, metadata] of response){
    let text = "";

    if(typeof chunk?.content === "string" && chunk.content){
      text = chunk.content
    }
    else if (Array.isArray(chunk?.content)){
      text = chunk.content
             .filter((c)=> c.type === "text")
             .map((c)=> c.text)
             .join("")
    }

    if(text){
      finalMessage += text;
      if(onChunk) onChunk(text);
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
