import rateLimit from "express-rate-limit";

export const chatMessageLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  keyGenerator: (req) => req.user?.id ?? req.ip,
  validate: { keyGeneratorIpFallback: false },
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: {
      message: "Too many messages sent. Please slow down.",
      success: false,
    },
  },
});
