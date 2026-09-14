const express = require('express');
const router = express.Router();
const validate = require('../middleware/validate');
const { apiLimiter } = require('../middleware/rateLimiter');
const { querySchema } = require('../validators/queryValidator');
const { handleQuery } = require('../controllers/queryController');

router.post(
  '/',
  apiLimiter,
  validate(querySchema),
  handleQuery
);

module.exports = router;
