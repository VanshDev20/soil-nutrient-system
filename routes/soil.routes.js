'use strict';

const router = require('express').Router();
const { body } = require('express-validator');

const SoilController = require('../controllers/soil.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validate }     = require('../middlewares/validate.middleware');

/* ── Validators ────────────────────────────────────────────────────── */

const analyzeValidators = [
  body('nitrogen')
    .notEmpty().withMessage('Nitrogen value is required.')
    .isFloat({ min: 0, max: 1000 }).withMessage('Nitrogen must be a number between 0 and 1000 mg/kg.'),

  body('phosphorus')
    .notEmpty().withMessage('Phosphorus value is required.')
    .isFloat({ min: 0, max: 500 }).withMessage('Phosphorus must be a number between 0 and 500 mg/kg.'),

  body('potassium')
    .notEmpty().withMessage('Potassium value is required.')
    .isFloat({ min: 0, max: 2000 }).withMessage('Potassium must be a number between 0 and 2000 mg/kg.'),

  body('ph')
    .notEmpty().withMessage('pH value is required.')
    .isFloat({ min: 0, max: 14 }).withMessage('pH must be a number between 0 and 14.'),

  body('notes')
    .optional({ nullable: true })
    .isString().withMessage('Notes must be a string.')
    .isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters.'),
];

/* ── Routes (all protected) ────────────────────────────────────────── */

router.use(authenticate);

router.post('/analyze', analyzeValidators, validate, SoilController.analyze);
router.get('/history',  SoilController.history);

module.exports = router;
