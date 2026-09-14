function authorizeAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required'
    });
  }

  // Check role is 'admin'
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Access denied: Admin role required'
    });
  }

  next();
}

module.exports = authorizeAdmin;
