export function validateBody(schema) {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req.body);
      req.body = parsed;
      next();
    } catch (err) {
      if (err.errors) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: err.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Invalid request payload'
      });
    }
  };
}
