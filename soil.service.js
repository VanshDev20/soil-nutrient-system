'use strict';

const SoilReportModel = require('../models/soilReport.model');

/* ─────────────────────────── Thresholds ──────────────────────────── */

const NUTRIENT_LEVELS = {
  nitrogen: { low: 140, high: 280 },     // mg/kg
  phosphorus: { low: 10, high: 30 },     // mg/kg
  potassium: { low: 120, high: 250 },    // mg/kg
};

/* ─────────────────────────── Helpers ─────────────────────────────── */

const classifyNutrient = (value, { low, high }) => {
  if (value < low) return 'low';
  if (value > high) return 'high';
  return 'optimal';
};

/**
 * Determine soil type from pH.
 * @param {number} ph
 * @returns {{ type: string, description: string }}
 */
const classifySoil = (ph) => {
  if (ph < 5.5) return { type: 'Strongly Acidic', description: 'pH below 5.5 — highly acidic soil' };
  if (ph < 6.5) return { type: 'Mildly Acidic',   description: 'pH 5.5–6.5 — mildly acidic soil' };
  if (ph <= 7.5) return { type: 'Neutral',          description: 'pH 6.5–7.5 — neutral, ideal for most crops' };
  if (ph <= 8.5) return { type: 'Mildly Alkaline', description: 'pH 7.5–8.5 — mildly alkaline soil' };
  return             { type: 'Strongly Alkaline', description: 'pH above 8.5 — highly alkaline soil' };
};

/**
 * Suggest fertilizer based on nutrient levels and pH.
 */
const suggestFertilizer = ({ nitrogenLevel, phosphorusLevel, potassiumLevel, ph }) => {
  const suggestions = [];

  if (nitrogenLevel === 'low')    suggestions.push('Apply Urea (46-0-0) or Ammonium Nitrate to boost nitrogen.');
  if (nitrogenLevel === 'high')   suggestions.push('Reduce nitrogen inputs; avoid nitrogen-rich fertilizers.');

  if (phosphorusLevel === 'low')  suggestions.push('Apply Single Super Phosphate (SSP) or DAP to increase phosphorus.');
  if (phosphorusLevel === 'high') suggestions.push('Skip phosphorus fertilizers this season.');

  if (potassiumLevel === 'low')   suggestions.push('Apply Muriate of Potash (MOP) or Sulphate of Potash (SOP).');
  if (potassiumLevel === 'high')  suggestions.push('Potassium is sufficient; no additional potash needed.');

  if (ph < 5.5) suggestions.push('Lime application recommended to raise pH (dolomitic limestone preferred).');
  if (ph > 8.0) suggestions.push('Apply elemental sulphur or acidifying fertilizers to lower pH.');

  if (suggestions.length === 0) suggestions.push('Soil nutrients are balanced. Maintain with a general NPK fertilizer (e.g., 10-10-10).');

  return suggestions.join(' ');
};

/**
 * Recommend crops based on pH and nutrient profile.
 */
const recommendCrops = ({ ph, nitrogenLevel, phosphorusLevel, potassiumLevel }) => {
  const crops = [];

  // pH-based primary recommendations
  if (ph >= 6.0 && ph <= 7.0) {
    crops.push('Wheat', 'Maize', 'Soybean', 'Sunflower', 'Barley');
  } else if (ph >= 5.5 && ph < 6.0) {
    crops.push('Rice', 'Potato', 'Tea', 'Blueberry', 'Oats');
  } else if (ph > 7.0 && ph <= 8.0) {
    crops.push('Sorghum', 'Cotton', 'Sugarbeet', 'Alfalfa', 'Asparagus');
  } else if (ph < 5.5) {
    crops.push('Cassava', 'Sweet Potato', 'Rye');
  } else {
    crops.push('Barley', 'Mustard', 'Date Palm');
  }

  // Nutrient-aware additions
  if (nitrogenLevel === 'optimal' && phosphorusLevel === 'optimal') {
    crops.push('Tomato', 'Cabbage', 'Cauliflower');
  }
  if (potassiumLevel === 'optimal') {
    crops.push('Banana', 'Sugarcane');
  }
  if (nitrogenLevel === 'high') {
    crops.push('Spinach', 'Lettuce', 'Brassica');
  }

  return [...new Set(crops)].join(', ');
};

/* ─────────────────────────── Service ─────────────────────────────── */

class SoilService {
  /**
   * Run analysis, persist result, and return full report.
   * @param {{ nitrogen: number, phosphorus: number, potassium: number, ph: number, notes?: string }} input
   * @param {number} userId
   * @returns {Promise<Object>}
   */
  static async analyze({ nitrogen, phosphorus, potassium, ph, notes }, userId) {
    const nitrogenLevel   = classifyNutrient(nitrogen,   NUTRIENT_LEVELS.nitrogen);
    const phosphorusLevel = classifyNutrient(phosphorus, NUTRIENT_LEVELS.phosphorus);
    const potassiumLevel  = classifyNutrient(potassium,  NUTRIENT_LEVELS.potassium);

    const soilClassification = classifySoil(ph);
    const fertilizer_suggestion = suggestFertilizer({ nitrogenLevel, phosphorusLevel, potassiumLevel, ph });
    const crop_recommendation   = recommendCrops({ ph, nitrogenLevel, phosphorusLevel, potassiumLevel });

    const report = await SoilReportModel.create({
      user_id: userId,
      nitrogen,
      phosphorus,
      potassium,
      ph,
      soil_type: soilClassification.type,
      fertilizer_suggestion,
      crop_recommendation,
      notes: notes || null,
    });

    return {
      ...report,
      analysis_summary: {
        nitrogen_level:   nitrogenLevel,
        phosphorus_level: phosphorusLevel,
        potassium_level:  potassiumLevel,
        soil_description: soilClassification.description,
      },
    };
  }

  /**
   * Retrieve paginated soil history for a user.
   * @param {number} userId
   * @param {number} page
   * @param {number} limit
   */
  static async getHistory(userId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const { data, total } = await SoilReportModel.findByUserId(userId, { limit, offset });
    const totalPages = Math.ceil(total / limit);

    return {
      reports: data,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }
}

module.exports = SoilService;
