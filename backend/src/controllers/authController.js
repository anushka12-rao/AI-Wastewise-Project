const { authenticateAdmin, verifyToken } = require('../services/authService');
const { setSessionCookie, clearSessionCookie, COOKIE_NAME } = require('../utils/cookies');
const logger = require('../utils/logger');

async function handleLogin(req, res, next) {
  try {
    const { email, password } = req.body;

    const authResult = await authenticateAdmin(email, password);
    if (!authResult) {
      return res.status(401).json({
        error: 'AuthenticationFailed',
        message: 'Invalid email or password'
      });
    }

    setSessionCookie(res, authResult.token);

    return res.status(200).json({
      authenticated: true,
      email: authResult.user.email,
      token: authResult.token,
      message: 'Login successful'
    });
  } catch (error) {
    logger.error('Login error:', { error: error.message });
    return next(error);
  }
}

async function handleLogout(req, res, next) {
  try {
    clearSessionCookie(res);
    return res.status(200).json({
      authenticated: false,
      message: 'Logged out successfully'
    });
  } catch (error) {
    return next(error);
  }
}

async function handleGetMe(req, res, next) {
  try {
    let token = null;
    if (req.cookies && req.cookies[COOKIE_NAME]) {
      token = req.cookies[COOKIE_NAME];
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(200).json({ authenticated: false });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return res.status(200).json({ authenticated: false });
    }

    return res.status(200).json({
      authenticated: true,
      email: payload.email,
      role: payload.role
    });
  } catch (error) {
    return res.status(200).json({ authenticated: false });
  }
}

module.exports = {
  handleLogin,
  handleLogout,
  handleGetMe
};
