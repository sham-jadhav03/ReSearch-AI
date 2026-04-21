import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI } from "@langchain/mistralai";
import { tavily as Tavily } from "@tavily/core";
import { config } from "./config.js";

export const geminiModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: config.GEMINI_API_KEY,
});

export const mistralModel = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: config.MISTRAL_API_KEY,
});

export const tavily = Tavily({
  apiKey: config.TAVILY_API_KEY,
});
