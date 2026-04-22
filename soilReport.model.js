'use strict';

const { pool } = require('../config/db');

class SoilReportModel {
  /**
   * Persist a new soil analysis report.
   * @param {{
   *   user_id: number,
   *   nitrogen: number, phosphorus: number, potassium: number, ph: number,
   *   soil_type: string, fertilizer_suggestion: string, crop_recommendation: string,
   *   notes?: string
   * }} data
   * @returns {Promise<Object>}
   */
  static async create(data) {
    const {
      user_id,
      nitrogen,
      phosphorus,
      potassium,
      ph,
      soil_type,
      fertilizer_suggestion,
      crop_recommendation,
      notes = null,
    } = data;

    const [result] = await pool.query(
      `INSERT INTO soil_reports
        (user_id, nitrogen, phosphorus, potassium, ph, soil_type,
         fertilizer_suggestion, crop_recommendation, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        nitrogen,
        phosphorus,
        potassium,
        ph,
        soil_type,
        fertilizer_suggestion,
        crop_recommendation,
        notes,
      ]
    );

    return this.findById(result.insertId);
  }

  /**
   * Retrieve a single report by its ID.
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  static async findById(id) {
    const [rows] = await pool.query(
      'SELECT * FROM soil_reports WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Retrieve all reports for a specific user, newest first.
   * @param {number} userId
   * @param {{ limit?: number, offset?: number }} options
   * @returns {Promise<{ data: Object[], total: number }>}
   */
  static async findByUserId(userId, { limit = 20, offset = 0 } = {}) {
    const [countRows] = await pool.query(
      'SELECT COUNT(*) AS total FROM soil_reports WHERE user_id = ?',
      [userId]
    );
    const total = countRows[0].total;

    const [data] = await pool.query(
      `SELECT * FROM soil_reports
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    return { data, total };
  }
}

module.exports = SoilReportModel;
