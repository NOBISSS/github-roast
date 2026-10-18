import rateLimit from "express-rate-limit";

export const roastRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20, // Maximum 20 requests per IP per window
  standardHeaders: "draft-8",
  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many roast requests. Please try again in 15 minutes.",
  },
});