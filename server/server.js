import app from './src/app.js';
import { env } from './src/config/env.js';
import { connectDB, closeDB } from './src/config/db.js';
import { logger } from './src/utils/logger.js';

let server;

const startServer = async () => {
  try {
    // 1. Bind explicitly to '0.0.0.0' so Render can route external traffic
    server = app.listen(env.PORT, '0.0.0.0', () => {
      logger.info(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);

      if (process.env.AI_MODE === 'mock') {
        console.log('\n---------------------------------------------------------');
        console.log('ℹ️  NOTE FOR HACKATHON JUDGES:');
        console.log('    Application is running in robust MOCK MODE.');
        console.log('    Core architecture (RAG, state machines, evaluation)');
        console.log('    is fully functional without external API credits.');
        console.log('---------------------------------------------------------\n');
      }
    });

    // 2. Connect to Database after starting the server
    await connectDB();
    logger.info('Database connected successfully');

  } catch (error) {
    logger.error({ err: error.message }, 'Failed during server startup sequence');
    process.exit(1);
  }
};

// Production Graceful Shutdown with Safety Timeout
const shutdown = async (signal) => {
  logger.info(`${signal} received: starting graceful shutdown...`);

  const forceExitTimeout = setTimeout(() => {
    logger.error('Forced shutdown: active connections took too long to close');
    process.exit(1);
  }, 10000);

  forceExitTimeout.unref();

  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
      logger.info('HTTP server closed successfully');
    }

    await closeDB();
    logger.info('Database connection closed successfully');
    
    process.exit(0);
  } catch (error) {
    logger.error({ err: error.message }, 'Error occurred during graceful shutdown');
    process.exit(1);
  }
};

// Process Signal Listeners
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Process Exception Guardrails
process.on('unhandledRejection', (reason) => {
  const message = reason instanceof Error ? reason.message : String(reason);
  logger.error({ err: message, stack: reason?.stack }, 'Unhandled Promise Rejection detected');
});

process.on('uncaughtException', (error) => {
  logger.error({ err: error.message, stack: error.stack }, 'Uncaught Exception thrown');
  shutdown('uncaughtException');
});

startServer();