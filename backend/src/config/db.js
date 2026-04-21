import mongoose from "mongoose";
import { config } from "./config.js";

const connectDB = async () => {
  mongoose.connect(config.MONGO_URI).then(() => {
    console.log("Connected to DB");
  });
};

export default connectDB;
