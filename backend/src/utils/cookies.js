const env = require('../config/environment');

const COOKIE_NAME = 'wastewise_session';

function getCookieOptions() {
  const isProd = env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd, // HTTPS only in production
    sameSite: isProd ? 'none' : 'lax', // Required for cross-domain cookie exchange
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/'
  };
}

function setSessionCookie(res, token) {
  res.cookie(COOKIE_NAME, token, getCookieOptions());
}

function clearSessionCookie(res) {
  const isProd = env.NODE_ENV === 'production';
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/'
  });
}

module.exports = {
  COOKIE_NAME,
  getCookieOptions,
  setSessionCookie,
  clearSessionCookie
};
