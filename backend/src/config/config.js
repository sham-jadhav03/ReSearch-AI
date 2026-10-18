import dotenv from "dotenv";
dotenv.config();

if (!process.env.PORT) {
  throw new Error("PORT is not defined in environment variables");
}

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is not defined in environment variables");
}

if (!process.env.GOOGLE_CLIENT_ID) {
  throw new Error("GOOGLE_CLIENT_ID is not defined in environment variables");
}

if (!process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error(
    "GOOGLE_CLIENT_SECRET is not defined in environment variables",
  );
}

if (!process.env.GOOGLE_REFRESH_TOKEN) {
  throw new Error(
    "GOOGLE_REFRESH_TOKEN is not defined in environment variables",
  );
}

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

if (!process.env.EMAIL_SECRET) {
  throw new Error("EMAIL_SECRET is not defined in environment variables");
}

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined in environment variables");
}

if (!process.env.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY is not defined in environment variables");
}

if (!process.env.TAVILY_API_KEY) {
  throw new Error("TAVILY_API_KEY is not defined in environment variables");
}

const NODE_ENV =
  process.env.NODE_ENV ||
  (process.env.npm_lifecycle_event === "dev" ? "development" : undefined);
const SERVER_URL = process.env.SERVER_URL || "http://localhost:4000";

if (!NODE_ENV) {
  throw new Error("NODE_ENV is not defined in environment variables");
}

if (!["production", "development", "test"].includes(NODE_ENV)) {
  throw new Error("NODE_ENV must be production, development, or test");
}

export const config = {
  NODE_ENV,
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
  EMAIL_SECRET: process.env.EMAIL_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL:
    process.env.GOOGLE_CALLBACK_URL ||
    new URL("/api/auth/google/callback", SERVER_URL).toString(),
  GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN,
  GOOGLE_USER: process.env.GOOGLE_USER,
  JWT_SECRET: process.env.JWT_SECRET,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  TAVILY_API_KEY: process.env.TAVILY_API_KEY,
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  SERVER_URL,
  // AI provider call configuration (see src/ai/model.js). Optional env overrides;
  // defaults keep single requests bounded without changing current behavior.
  AI_REQUEST_TIMEOUT_MS: process.env.AI_REQUEST_TIMEOUT_MS
    ? Number(process.env.AI_REQUEST_TIMEOUT_MS)
    : 120_000,
  AI_MAX_OUTPUT_TOKENS: process.env.AI_MAX_OUTPUT_TOKENS
    ? Number(process.env.AI_MAX_OUTPUT_TOKENS)
    : 8192,
};
