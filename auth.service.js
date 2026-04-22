'use strict';

const bcrypt = require('bcryptjs');
const UserModel = require('../models/user.model');
const { signToken } = require('../utils/jwt');

const SALT_ROUNDS = 12;

class AuthService {
  /**
   * Register a new user.
   * @param {{ name: string, email: string, password: string }} dto
   * @returns {Promise<{ user: Object, token: string }>}
   */
  static async signup({ name, email, password }) {
    const exists = await UserModel.emailExists(email);
    if (exists) {
      const err = new Error('Email address is already registered.');
      err.statusCode = 409;
      throw err;
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await UserModel.create({ name, email, password: hashed });

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    return { user, token };
  }

  /**
   * Authenticate a user and return a JWT.
   * @param {{ email: string, password: string }} dto
   * @returns {Promise<{ user: Object, token: string }>}
   */
  static async login({ email, password }) {
    const record = await UserModel.findByEmail(email);

    if (!record) {
      const err = new Error('Invalid email or password.');
      err.statusCode = 401;
      throw err;
    }

    const isMatch = await bcrypt.compare(password, record.password);
    if (!isMatch) {
      const err = new Error('Invalid email or password.');
      err.statusCode = 401;
      throw err;
    }

    // Strip password before returning
    const { password: _pw, ...user } = record;

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    return { user, token };
  }
}

module.exports = AuthService;
