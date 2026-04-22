'use strict';

require('dotenv').config();

const app                   = require('./app');
const { testConnection }    = require('./config/db');
const logger                = require('./utils/logger');

const PORT = parseInt(process.env.PORT, 10) || 3000;

const startServer = async () => {
  // Verify DB connectivity before accepting traffic
  await testConnection();

  const server = app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    logger.info(`📍 Health: http://localhost:${PORT}/health`);
  });

  /* ── Graceful shutdown ─────────────────────────────────────────── */

  const shutdown = (signal) => {
    logger.info(`${signal} received — shutting down gracefully...`);
    server.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });

    // Force exit after 10 s if connections hang
    setTimeout(() => {
      logger.error('Forced shutdown after timeout.');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection:', reason);
    shutdown('unhandledRejection');
  });

  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err);
    shutdown('uncaughtException');
  });
};

startServer();
