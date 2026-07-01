import express from 'express'
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.routes.js'
import chatRouter from './routes/chat.routes.js'
import morgan from 'morgan'
import cors from 'cors'
import { config } from './config/config.js';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"))
app.use(cors({
  origin: config.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}))

app.use('/api/auth', authRouter)
app.use('/api/chat', chatRouter)

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
});

export default app;
