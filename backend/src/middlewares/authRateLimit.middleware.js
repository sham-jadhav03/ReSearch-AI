import rateLimit, { ipKeyGenerator } from "express-rate-limit";
/**
 * @desc Rate limit for registration (max 5 attempts per minute)
 */
export const registerLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  keyGenerator: (req) => ipKeyGenerator(req.ip),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many registration attempts. Please try again later.",
    success: false,
  },
});

/**
 * @desc Rate limit for login (max 10 attempts per minute)
 */
export const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator: (req) => ipKeyGenerator(req.ip),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many login attempts. Please try again later.",
    success: false,
  },
});

/**
 * @desc Rate limit for resend-verification (max 3 attempts per minute)
 */
export const resendVerificationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  keyGenerator: (req) => ipKeyGenerator(req.ip),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many verification email requests. Please try again later.",
    success: false,
  },
});
