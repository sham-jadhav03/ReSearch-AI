import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { config } from "../config/config.js";
import { ChatMistralAI } from "@langchain/mistralai";
import { tavily as createTavily } from "@tavily/core";

const Model_REGISTRY = {
  "gemini-3.5-flash-lite": {
    provider: "google",
    factory: () =>
      new ChatGoogleGenerativeAI({
        model: "gemini-3.5-flash-lite",
        apiKey: config.GEMINI_API_KEY,
      }),
  },
};

export const FALLBACK_CHAIN = ["gemini-3.5-flash-lite"];

const instanceCache = new Map();

export const getModel = (modelId) => {
  if (instanceCache.has(modelId)) return instanceCache.get(modelId);

  const entry = Model_REGISTRY[modelId];
  if (!entry) throw new Error(`Unknown model id: ${modelId}`);

  const instance = entry.factory();
  instanceCache.set(modelId, instance);
  return instance;
};

export const mistrilModel = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: config.MISTRAL_API_KEY,
});

export const tavily = createTavily({
  apiKey: config.TAVILY_API_KEY,
});
