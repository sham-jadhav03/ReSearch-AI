import z from "zod";
import { tool } from "langchain";
import { tavily } from "../model.js";

export const internetSearch = async ({ query }) => {
  const results = await tavily.search(query, {
    maxResults: 5,
  });

  const updateResult = results.results.map((item) => ({
    title: item.title,
    url: item.url,
    content: item.content?.slice(0, 500),
  }));

  return JSON.stringify(updateResult);
};

export const searchInternetTool = tool(internetSearch, {
  name: "internetSearch",
  description: "Use this tool to get the latest information from the internet.",
  schema: z.object({
    query: z.string().describe("The search query to look up on the internet."),
  }),
});
