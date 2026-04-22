'use strict';

const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Sign a JWT payload and return the token string.
 * @param {{ id: number, email: string, role: string }} payload
 * @returns {string}
 */
const signToken = (payload) => {
  if (!SECRET) throw new Error('JWT_SECRET is not configured');
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
};

/**
 * Verify and decode a JWT.
 * @param {string} token
 * @returns {Object} decoded payload
 */
const verifyToken = (token) => {
  if (!SECRET) throw new Error('JWT_SECRET is not configured');
  return jwt.verify(token, SECRET);
};

module.exports = { signToken, verifyToken };
