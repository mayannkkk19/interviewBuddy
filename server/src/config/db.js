import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI);
    logger.info({ host: conn.connection.host, database: conn.connection.name }, 'MongoDB connected successfully');
  } catch (error) {
    logger.error({ err: error.message }, 'MongoDB connection failed');
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB connection lost');
});