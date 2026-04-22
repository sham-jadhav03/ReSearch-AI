import { tavily } from "./model.js";

export const internetSearch = async ({ query }) => {
  const results = await tavily.search(query, {
    maxResults: 5,
  });

  const updateResult = results.results.map((item) => ({
    title: item.title,
    url: item.url,
    content: item.content?.slice(0, 500),
  }));

  return updateResult
    .map((r, i) =>
      `
       Source ${i + 1}
       Title: ${r.title}
       URL: ${r.url}
       Summary: ${r.content}
      `.trim(),
    )
    .join("\n\n");
};
