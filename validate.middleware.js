'use strict';

const { validationResult } = require('express-validator');
const { errorResponse } = require('../utils/response');

/**
 * Run express-validator results and short-circuit with 422 on failure.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map(({ path, msg }) => ({ field: path, message: msg }));
    return errorResponse(res, 422, 'Validation failed.', formatted);
  }
  return next();
};

module.exports = { validate };
