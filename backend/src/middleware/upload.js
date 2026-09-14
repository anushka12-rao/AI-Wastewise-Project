const multer = require('multer');

// Store files strictly in memory storage (transient, never written to disk)
const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
    error.status = 400;
    cb(error, false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES
  },
  fileFilter
});

module.exports = upload;
