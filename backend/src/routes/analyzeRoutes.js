const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const validate = require('../middleware/validate');
const { apiLimiter } = require('../middleware/rateLimiter');
const { analyzeSchema } = require('../validators/analyzeValidator');
const { handleAnalyze } = require('../controllers/analyzeController');

// Middleware to convert uploaded file buffer to base64 if sent as multipart/form-data
const handleUploadToBody = (req, res, next) => {
  if (req.file) {
    req.body.imageBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
  }
  next();
};

router.post(
  '/',
  apiLimiter,
  (req, res, next) => {
    // If multipart/form-data, process with multer upload
    if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
      return upload.single('image')(req, res, (err) => {
        if (err) return next(err);
        handleUploadToBody(req, res, next);
      });
    }
    next();
  },
  validate(analyzeSchema),
  handleAnalyze
);

module.exports = router;
