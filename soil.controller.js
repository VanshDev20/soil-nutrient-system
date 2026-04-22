'use strict';

const SoilService = require('../services/soil.service');
const { successResponse, errorResponse } = require('../utils/response');

class SoilController {
  /**
   * POST /api/soil/analyze
   */
  static async analyze(req, res, next) {
    try {
      const { nitrogen, phosphorus, potassium, ph, notes } = req.body;
      const userId = req.user.id;

      const report = await SoilService.analyze(
        { nitrogen: +nitrogen, phosphorus: +phosphorus, potassium: +potassium, ph: +ph, notes },
        userId
      );

      return successResponse(res, 201, 'Soil analysis completed successfully.', { report });
    } catch (error) {
      if (error.statusCode) {
        return errorResponse(res, error.statusCode, error.message);
      }
      return next(error);
    }
  }

  /**
   * GET /api/soil/history
   */
  static async history(req, res, next) {
    try {
      const userId = req.user.id;
      const page  = Math.max(1, parseInt(req.query.page,  10) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));

      const result = await SoilService.getHistory(userId, page, limit);

      return successResponse(
        res,
        200,
        'Soil analysis history retrieved successfully.',
        { reports: result.reports },
        result.pagination
      );
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = SoilController;
