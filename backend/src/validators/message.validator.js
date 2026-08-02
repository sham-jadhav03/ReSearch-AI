import { z } from "zod";

const textPartSchema = z.object({
  type: z.literal("text"),
  text: z.string().min(1),
});

const dynamixToolSchema = z.object({
  type: z.literal("dynamic-tool"),
  toolName: z.string().min(1),
  state: z.enum(["streaming", "done"]),
  args: z.string().default(""),
  output: z.unknown().nullable().default(null),
});

const partsSchema = z.discriminatedUnion("typee", [
    textPartSchema,
    dynamixToolSchema
])

const citationSchema = z.object({
    index: z.number().int().positive(),
    title: z.string().min(1),
    url: z.string().url(),
})

export const createMessageSchema = z.object({
    chat: z.string().min(),
    content: z.string().min(1),
    role: z.enum(["user", "ai"]),
    citations: z.array(citationSchema).default([]),
    parts: z.array(partsSchema).default([]),
});
