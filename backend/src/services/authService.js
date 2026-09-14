const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { AdminUser } = require('../models/AdminUser');
const env = require('../config/environment');
const logger = require('../utils/logger');

const TOKEN_EXPIRY = '7d';

async function authenticateAdmin(email, password) {
  const user = await AdminUser.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    logger.warn(`Login failed: user not found for ${email}`);
    return null;
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    logger.warn(`Login failed: incorrect password for ${email}`);
    return null;
  }

  const token = jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
      role: 'admin'
    },
    env.SESSION_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );

  logger.info(`Admin logged in successfully: ${email}`);
  return { token, user: { id: user._id, email: user.email } };
}

function verifyToken(token) {
  try {
    return jwt.verify(token, env.SESSION_SECRET);
  } catch (err) {
    return null;
  }
}

module.exports = {
  authenticateAdmin,
  verifyToken
};
