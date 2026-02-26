const rateLimit = require('express-rate-limit');

/**
 * Global Rate Limiter
 * Limits all requests to 1000 per 15 minutes window
 */
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        message: 'Too many requests from this IP, please try again after 15 minutes'
    }
});

/**
 * Auth Rate Limiter
 * Stricter limit for login/register to prevent brute force
 */
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // Limit each IP to 20 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        message: 'Too many authentication attempts, please try again after an hour'
    }
});

/**
 * AI/Valuation Rate Limiter
 * Prevents abuse of expensive AI endpoints
 */
const aiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 valuations per hour
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        message: 'Valuation limit reached. Please try again later.'
    }
});

module.exports = {
    globalLimiter,
    authLimiter,
    aiLimiter
};
