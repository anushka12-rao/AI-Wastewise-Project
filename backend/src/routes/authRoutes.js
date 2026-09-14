const express = require('express');
const router = express.Router();
const validate = require('../middleware/validate');
const { loginLimiter } = require('../middleware/rateLimiter');
const { loginSchema } = require('../validators/authValidator');
const { handleLogin, handleLogout, handleGetMe } = require('../controllers/authController');

router.post('/login', loginLimiter, validate(loginSchema), handleLogin);
router.post('/logout', handleLogout);
router.get('/me', handleGetMe);

module.exports = router;
