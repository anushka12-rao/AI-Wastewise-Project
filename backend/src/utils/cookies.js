const env = require('../config/environment');

const COOKIE_NAME = 'wastewise_session';

function getCookieOptions() {
  const isProd = env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd, // HTTPS only in production
    sameSite: isProd ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/'
  };
}

function setSessionCookie(res, token) {
  res.cookie(COOKIE_NAME, token, getCookieOptions());
}

function clearSessionCookie(res) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
    path: '/'
  });
}

module.exports = {
  COOKIE_NAME,
  getCookieOptions,
  setSessionCookie,
  clearSessionCookie
};
