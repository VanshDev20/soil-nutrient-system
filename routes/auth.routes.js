'use strict';

const router = require('express').Router();
const { body } = require('express-validator');

const AuthController = require('../controllers/auth.controller');
const { authenticate }  = require('../middlewares/auth.middleware');
const { validate }      = require('../middlewares/validate.middleware');

/* ── Validators ────────────────────────────────────────────────────── */

const signupValidators = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters.'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
    .matches(/[0-9]/).withMessage('Password must contain at least one number.'),
];

const loginValidators = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required.'),
];

/* ── Routes ────────────────────────────────────────────────────────── */

router.post('/signup', signupValidators, validate, AuthController.signup);
router.post('/login',  loginValidators,  validate, AuthController.login);
router.get('/me', authenticate, AuthController.me);

module.exports = router;
