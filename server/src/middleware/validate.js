const { validationResult } = require('express-validator');

/**
 * Middleware to check express-validator results.
 * Returns 400 with error details if validation fails.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
      value: err.value,
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors: extractedErrors,
    });
  }

  next();
};

module.exports = { validate };
