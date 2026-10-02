import app from "./src/app.js";
import { config } from "./src/config/config.js";
import connectDB from "./src/config/db.js";

const PORT = config.PORT || 4000;

// Await database connection before accepting requests
try {
  await connectDB();
  console.log("Database connection successful");

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
} catch (error) {
  console.error("Failed to connect to database:", error);
  process.exit(1);
}