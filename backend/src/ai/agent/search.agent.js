import { createAgent, tool } from "langchain";
import { z } from "zod";
import { getModel } from "../model.js";
import { internetSearch } from "../internet.js";

const searchInternetTool = tool(internetSearch, {
  name: "internetSearch",
  description: "Use this to get the latest information from the internet.",
  schema: z.object({
    query: z.string().describe("The search query to look up on the internet."),
  }),
});

const agentCache = new Map();

export const searchAgent = (modelId) => {
  if (!agentCache.has(modelId)) {
    agentCache.set(
      modelId,
      createAgent({
        model: getModel(modelId),
        tools: [searchInternetTool],
      }),
    );
  }

  return agentCache.get(modelId);
};
