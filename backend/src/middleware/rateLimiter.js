import rateLimit from 'express-rate-limit';

/**
 * Login Rate Limiting Middleware
 * 
 * Protects login endpoints from brute-force attacks and credential stuffing.
 * Allows maximum 10 attempts per 15 minutes window per IP.
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per IP
  standardHeaders: true, // Return standard RateLimit headers
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts from this IP address. Please try again after 15 minutes.',
    error: 'TOO_MANY_REQUESTS',
    data: null,
  },
});
