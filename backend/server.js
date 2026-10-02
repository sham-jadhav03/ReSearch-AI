import app from "./src/app.js";
import { config } from "./src/config/config.js";
import connectDB from "./src/config/db.js";
import mongoose from "mongoose";

const PORT = config.PORT || 4000;

let server;

// Graceful shutdown handler
const shutdown = async (signal) => {
  console.log(`${signal} received, starting graceful shutdown...`);
  if (server) {
    server.close(async () => {
      console.log("HTTP server closed");
      try {
        await mongoose.connection.close();
        console.log("MongoDB connection closed");
        process.exit(0);
      } catch (err) {
        console.error("Error during shutdown:", err);
        process.exit(1);
      }
    });

    // Force close after 10 seconds
    setTimeout(() => {
      console.error("Forced shutdown after timeout");
      process.exit(1);
    }, 10_000);
  } else {
    process.exit(0);
  }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// Await database connection before accepting requests
try {
  await connectDB();
  console.log("Database connection successful");

  server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
} catch (error) {
  console.error("Failed to connect to database:", error);
  process.exit(1);
}