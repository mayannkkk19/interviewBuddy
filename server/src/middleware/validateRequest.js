import { logger } from '../utils/logger.js';

export const validateRequest = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    logger.warn({ errors: result.error.format() }, 'Request validation failed');
    return res.status(400).json({
      error: 'Invalid request payload',
      details: result.error.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
    });
  }
  req.body = result.data;
  next();
};