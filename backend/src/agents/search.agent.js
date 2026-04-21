import { createAgent, tool } from "langchain";
import { internetSearch } from "../services/internetSearch.service.js";
import z from "zod";
import { geminiModel } from "../config/model.js";

const searchInternetTool = tool(internetSearch, {
  name: "internetSearch",
  description: "Use this tool to get the latest information from the internet.",
  schema: z.object({
    query: z.string().describe("The search query to look up on the internet."),
  }),
});

export const searchAgent = createAgent({
  model: geminiModel,
  tools: [searchInternetTool],
});
