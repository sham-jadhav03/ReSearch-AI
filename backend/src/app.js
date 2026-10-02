import express from "express";
import cookieParser from 'cookie-parser';
import cors from "cors";
import morgan from "morgan";

const app = express();

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());
app.use(morgan("dev", {
  skip: (req, res) => {
    // Skip logging the query string for /verify-email to prevent verification tokens from being logged
    return req.path.includes('/verify-email') && req.query.token;
  },
}));
app.use(
  cors({
    origin: config.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);

// Centralized JSON 404 handler for API paths not matched by routers
app.use((req, res) => {
  res.status(404).json({
    message: "API endpoint not found.",
    success: false,
    err: "not_found",
  });
});

// Global error handler for async errors in route handlers
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    message: "Internal server error.",
    success: false,
    err: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

import authRouter from "./routes/auth.routes.js";
import chatRouter from "./routes/chat.routes.js";
import { config } from "./config/config.js";

app.use("/api/auth", authRouter);
app.use("/api/chat", chatRouter);

export default app;
