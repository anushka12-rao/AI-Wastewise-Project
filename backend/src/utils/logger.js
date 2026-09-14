const env = require('../config/environment');

function formatMessage(level, message, meta) {
  const timestamp = new Date().toISOString();
  let metaStr = '';
  if (meta) {
    // Sanitize meta to ensure passwords, base64 images, and session secrets are never logged
    const sanitized = { ...meta };
    if (sanitized.password) sanitized.password = '[REDACTED]';
    if (sanitized.passwordHash) sanitized.passwordHash = '[REDACTED]';
    if (sanitized.imageBase64) sanitized.imageBase64 = `[BASE64_IMAGE_${sanitized.imageBase64.length}_CHARS]`;
    if (sanitized.SESSION_SECRET) sanitized.SESSION_SECRET = '[REDACTED]';
    if (sanitized.WATSONX_API_KEY) sanitized.WATSONX_API_KEY = '[REDACTED]';
    metaStr = ` ${JSON.stringify(sanitized)}`;
  }
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
}

const logger = {
  info: (msg, meta) => {
    if (env.NODE_ENV !== 'test') {
      console.log(formatMessage('info', msg, meta));
    }
  },
  warn: (msg, meta) => {
    if (env.NODE_ENV !== 'test') {
      console.warn(formatMessage('warn', msg, meta));
    }
  },
  error: (msg, meta) => {
    if (env.NODE_ENV !== 'test') {
      console.error(formatMessage('error', msg, meta));
    }
  },
  debug: (msg, meta) => {
    if (env.NODE_ENV === 'development') {
      console.log(formatMessage('debug', msg, meta));
    }
  }
};

module.exports = logger;
