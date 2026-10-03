import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { config } from "../config/config.js";
import { tavily as createTavily } from "@tavily/core";
import { ChatGroq } from "@langchain/groq";

const REQUEST_TIMEOUT_MS = config.AI_REQUEST_TIMEOUT_MS ?? 120_000;
const MAX_OUTPUT_TOKENS = config.AI_MAX_OUTPUT_TOKENS ?? 8192;

const Model_REGISTRY = {
  "gemini-3.5-flash-lite": {
    provider: "google",
    factory: () =>
      new ChatGoogleGenerativeAI({
        model: "gemini-3.5-flash-lite",
        apiKey: config.GEMINI_API_KEY,
        timeout: REQUEST_TIMEOUT_MS,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
      }),
  },
  "gemini-3.5-flash": {
    provider: "google",
    factory: () =>
      new ChatGoogleGenerativeAI({
        model: "gemini-3.5-flash",
        apiKey: config.GEMINI_API_KEY,
        timeout: REQUEST_TIMEOUT_MS,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
      }),
  },
};

export const FALLBACK_CHAIN = ["gemini-3.5-flash-lite", "gemini-3.5-flash"];

const instanceCache = new Map();

export const getModel = (modelId) => {
  if (instanceCache.has(modelId)) return instanceCache.get(modelId);

  const entry = Model_REGISTRY[modelId];
  if (!entry) throw new Error(`Unknown model id: ${modelId}`);

  const instance = entry.factory();
  instanceCache.set(modelId, instance);
  return instance;
};

export const groqModel = new ChatGroq({
  model: "openai/gpt-oss-120b",
  apiKey: config.GROQ_API_KEY,
  timeout: REQUEST_TIMEOUT_MS,
  maxTokens: MAX_OUTPUT_TOKENS,
});

export const tavily = createTavily({
  apiKey: config.TAVILY_API_KEY,
});
