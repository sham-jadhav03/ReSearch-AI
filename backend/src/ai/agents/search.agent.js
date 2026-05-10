import { createAgent } from "langchain";
import { searchInternetTool } from "../tools/internet.tool.js"
import { geminiModel } from "../model.js";

export const searchAgent = createAgent({
  model: geminiModel,
  tools: [searchInternetTool],
});
