const validate = (schema) => (req, res, next) => {
  try {
    const validated = schema.parse(req.body);
    req.body = validated;
    next();
  } catch (error) {
    const issues = error.errors ? error.errors.map(e => ({ field: e.path.join('.'), message: e.message })) : [];
    return res.status(400).json({
      error: 'Validation failed',
      message: issues.length > 0 ? issues[0].message : 'Invalid request data',
      issues
    });
  }
};

module.exports = validate;
