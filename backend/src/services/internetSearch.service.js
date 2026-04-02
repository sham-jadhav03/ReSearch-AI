import { tavily as Tavily } from "@tavily/core";

const tavily = Tavily({
  apiKey: process.env.TAVILY_API_KEY,
});

export const internetSearch = async ({ query }) => {
  const results = await tavily.search(query, {
    maxResults: 5,
  });

  const updateResult = results.results.map((item) => ({
    title: item.title,
    url: item.url,
    content: item.content,
  }));

  return updateResult
    .map((r, i) => `[${i + 1}] ${r.title}\nURL: ${r.url}\n${r.content}`)
    .join("\n\n");
};
