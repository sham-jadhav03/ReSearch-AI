import { z } from "zod";
import { tavily } from "./model.js";

export const internetSearchSourceSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  content: z.string(),
});

export const internetSearchOutSchema = z.array(internetSearchSourceSchema);

export const internetSearch = async ({ query }) => {
  try {
    const results = await tavily.search(query, {
      maxResults: 5,
      searchDepth: "advanced",
    });

    const sources = (results.results ?? [])
      .filter((item) => typeof item.url === "string" && item.url)
      .map((item) => ({
        title: item.title || "Untitled source",
        url: item.url,
        content: item.content?.slice(0, 500) ?? "",
      }));

    return JSON.stringify(sources);
  } catch (err) {
    console.error("internetSearch failed:", err);
    return JSON.stringify([]);
  }
};
