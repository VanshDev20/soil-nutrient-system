'use strict';

const { pool } = require('../config/db');

class UserModel {
  /**
   * Find a user by email address.
   * @param {string} email
   * @returns {Promise<Object|null>}
   */
  static async findByEmail(email) {
    const [rows] = await pool.query(
      'SELECT id, name, email, password, role, created_at FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    return rows[0] || null;
  }

  /**
   * Find a user by primary key (without password).
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  static async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Create a new user record.
   * @param {{ name: string, email: string, password: string }} data
   * @returns {Promise<{ id: number, name: string, email: string, role: string }>}
   */
  static async create({ name, email, password }) {
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, password]
    );

    return {
      id: result.insertId,
      name,
      email,
      role: 'user',
    };
  }

  /**
   * Check whether an email is already registered.
   * @param {string} email
   * @returns {Promise<boolean>}
   */
  static async emailExists(email) {
    const [rows] = await pool.query(
      'SELECT 1 FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    return rows.length > 0;
  }
}

module.exports = UserModel;
