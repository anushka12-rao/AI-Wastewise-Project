const logger = require('../utils/logger');
const env = require('../config/environment');

function errorHandler(err, req, res, next) {
  let status = err.status || err.statusCode || 500;
  
  // Handle Multer upload errors cleanly as 400 Bad Request
  if (err.name === 'MulterError' || err.code === 'LIMIT_FILE_SIZE') {
    status = 400;
  }

  // Log full error details securely on the server
  logger.error(`[UnhandledError] ${req.method} ${req.originalUrl}: ${err.message}`, {
    stack: env.NODE_ENV !== 'production' ? err.stack : undefined
  });

  // Client response is safe and does not leak stack traces or internal secrets
  res.status(status).json({
    error: err.name || 'InternalServerError',
    message: err.message || 'An unexpected error occurred while processing your request',
    status
  });
}

module.exports = errorHandler;
