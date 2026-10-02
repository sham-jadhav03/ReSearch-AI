import express from "express";
import mongoose from "mongoose";
import { config } from "../config/config.js";

const router = express.Router();

router.get("/health", async (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = ["disconnected", "connected", "connecting", "disconnecting"][dbState] || "unknown";

  const isHealthy = dbState === 1;

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    database: dbStatus,
    version: process.env.npm_package_version || "unknown",
    environment: config.NODE_ENV || "development",
  });
});

export default router;