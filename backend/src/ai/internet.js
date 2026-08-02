import { z } from "zod";
import { tavily } from "./model";
import { JSONSchema } from "zod/v4/core";

export const internetSearchOutSchema = z.array(
  z.object({
    title: z.string(),
    url: z.string().url(),
    content: z.string(),
  }),
);

export const internetSearch = async ({ query }) => {
  const results = await tavily.search(query, {
    maxResults: 5,
  });

  const updateResult = results.results.map((item) => ({
    title: item.title,
    url: item.url,
    content: item.content?.slice(0, 500) ?? "",
  }));

  return JSON.stringify(updateResult);
};
