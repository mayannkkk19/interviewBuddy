import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  logger.error({ err: err.message, stack: err.stack }, 'Unhandled API error');

  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
};