'use strict';

const AuthService = require('../services/auth.service');
const { successResponse, errorResponse } = require('../utils/response');

class AuthController {
  /**
   * POST /api/auth/signup
   */
  static async signup(req, res, next) {
    try {
      const { name, email, password } = req.body;
      const { user, token } = await AuthService.signup({ name, email, password });

      return successResponse(res, 201, 'Account created successfully.', { user, token });
    } catch (error) {
      if (error.statusCode) {
        return errorResponse(res, error.statusCode, error.message);
      }
      return next(error);
    }
  }

  /**
   * POST /api/auth/login
   */
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const { user, token } = await AuthService.login({ email, password });

      return successResponse(res, 200, 'Login successful.', { user, token });
    } catch (error) {
      if (error.statusCode) {
        return errorResponse(res, error.statusCode, error.message);
      }
      return next(error);
    }
  }

  /**
   * GET /api/auth/me  (protected)
   */
  static async me(req, res) {
    return successResponse(res, 200, 'Authenticated user profile.', { user: req.user });
  }
}

module.exports = AuthController;
