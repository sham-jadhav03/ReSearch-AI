import express from "express";
import cookieParser from 'cookie-parser';
import cors from "cors";
import morgan from "morgan";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);

import authRouter from "./routes/auth.routes.js";
import chatRouter from "./routes/chat.routes.js";

app.use("/api/auth", authRouter);
app.use("/api/chat", chatRouter);

export default app;
