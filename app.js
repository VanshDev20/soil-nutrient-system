'use strict';

const express    = require('express');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');

const authRoutes = require('./routes/auth.routes');
const soilRoutes = require('./routes/soil.routes');
const { errorHandler, notFound } = require('./middlewares/error.middleware');
const { successResponse }        = require('./utils/response');
const logger                     = require('./utils/logger');

const app = express();

/* ─────────────────────── Security Middleware ──────────────────────── */

app.use(helmet());
app.disable('x-powered-by');

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 min
  max:      parseInt(process.env.RATE_LIMIT_MAX, 10)        || 100,
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again later.',
  },
});

// Stricter limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20,
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
  },
});

app.use(limiter);

/* ─────────────────────── Body Parsing ────────────────────────────── */

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

/* ─────────────────────── Request Logger ──────────────────────────── */

app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.originalUrl} — IP: ${req.ip}`);
  next();
});

/* ─────────────────────── Health Check ────────────────────────────── */

app.get('/health', (_req, res) => {
  return successResponse(res, 200, 'Soil Nutrient Analysis API is running.', {
    environment: process.env.NODE_ENV || 'development',
    timestamp:   new Date().toISOString(),
  });
});

/* ─────────────────────── API Routes ──────────────────────────────── */

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/soil', soilRoutes);

/* ─────────────────────── Error Handling ──────────────────────────── */

app.use(notFound);
app.use(errorHandler);

module.exports = app;
