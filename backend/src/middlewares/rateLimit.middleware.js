import rateLimit, { ipKeyGenerator } from "express-rate-limit";

export const chatMessageLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  keyGenerator: (req) => req.user?.id ?? ipKeyGenerator(req),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: {
      message: "Too many messages sent. Please slow down.",
      success: false,
    },
  },
});
