import rateLimit, { ipKeyGenerator } from "express-rate-limit";

export const chatMessageLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  // Key by user id when authenticated (fix 4.3 guarantees both `id` and `_id`
  // on req.user); fall back to ipKeyGenerator(req.ip) — ipKeyGenerator expects
  // the IP STRING, not the request object.
  keyGenerator: (req) => {
    const userId = req.user?.id || req.user?._id;
    return userId ? String(userId) : ipKeyGenerator(req.ip);
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Flat envelope consistent with the auth limiters and every JSON error
  // response in the app; clients read `response.data.message` as a string.
  message: {
    message: "Too many messages sent. Please slow down.",
    success: false,
  },
});
