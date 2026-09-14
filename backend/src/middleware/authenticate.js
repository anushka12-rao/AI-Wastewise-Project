const { verifyToken } = require('../services/authService');
const { COOKIE_NAME } = require('../utils/cookies');
const logger = require('../utils/logger');

function authenticate(req, res, next) {
  let token = null;

  // 1. Check HttpOnly cookie
  if (req.cookies && req.cookies[COOKIE_NAME]) {
    token = req.cookies[COOKIE_NAME];
  }
  // 2. Or Bearer header as fallback
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication session required to access this resource'
    });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Session is invalid or has expired'
    });
  }

  req.user = payload;
  next();
}

module.exports = authenticate;
