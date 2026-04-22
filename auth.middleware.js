'use strict';

const { verifyToken } = require('../utils/jwt');
const { errorResponse } = require('../utils/response');
const UserModel = require('../models/user.model');

/**
 * Protect routes — validates the Bearer token and attaches `req.user`.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 401, 'Access denied. No token provided.');
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return errorResponse(res, 401, 'Token expired. Please log in again.');
      }
      return errorResponse(res, 401, 'Invalid token.');
    }

    // Re-fetch from DB so revoked / deleted accounts are rejected.
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return errorResponse(res, 401, 'User no longer exists.');
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
};

/**
 * Restrict access to a specific role.
 * @param  {...string} roles
 */
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return errorResponse(res, 403, 'You do not have permission to perform this action.');
  }
  return next();
};

module.exports = { authenticate, authorize };
