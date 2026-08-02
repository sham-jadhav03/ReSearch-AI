import { createAgent, tool } from "langchain";
import { z } from "zod";
import { getModel } from "../model";
import { internetSearch } from "../internet";

const searchInternetTool = tool(internetSearch, {
  name: "internetSearch",
  description: "User this to get the latest information from the internet.",
  schema: z.object({
    query: z.string().describe("The search query to look up on the internet."),
  }),
});

export const searchAgent = (modelId) =>
  createAgent({
    model: getModel(modelId),
    tools: [searchInternetTool],
  });
