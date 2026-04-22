'use strict';

const logger = require('../utils/logger');
const { errorResponse } = require('../utils/response');

/**
 * Central error-handling middleware.
 * Must be registered LAST in app.js (four-argument signature required by Express).
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  logger.error(err.stack || err.message);

  // MySQL duplicate-entry error
  if (err.code === 'ER_DUP_ENTRY') {
    return errorResponse(res, 409, 'A record with that value already exists.');
  }

  // Handle generic operational errors forwarded from controllers
  if (err.statusCode) {
    return errorResponse(res, err.statusCode, err.message);
  }

  return errorResponse(
    res,
    500,
    process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred. Please try again later.'
      : err.message
  );
};

/**
 * 404 catch-all — register before errorHandler.
 */
const notFound = (req, res) => {
  return errorResponse(res, 404, `Route ${req.method} ${req.originalUrl} not found.`);
};

module.exports = { errorHandler, notFound };
