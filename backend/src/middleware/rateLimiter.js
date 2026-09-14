const rateLimit = require('express-rate-limit');

// Rate limiter for login endpoint: 10 attempts per 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests',
    message: 'Too many login attempts from this IP. Please try again after 15 minutes.'
  }
});

// Rate limiter for AI analysis and query endpoints: 60 requests per minute
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests',
    message: 'Rate limit exceeded. Please wait a moment before submitting another request.'
  }
});

module.exports = {
  loginLimiter,
  apiLimiter
};
