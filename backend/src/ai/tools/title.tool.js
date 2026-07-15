import { createAgent, toolStrategy } from "langchain";
import { mistralModel } from "../model.js";
import z from "zod";

const model = mistralModel

export const titleAgent = createAgent({
    model,
    tools: [],
    responseFormat: toolStrategy(z.object({
        chatTitle: z.string().describe("A concise title for the given message")
    }))
})