function notFound(req, res, next) {
  res.status(404).json({
    error: 'NotFound',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
}

module.exports = notFound;
