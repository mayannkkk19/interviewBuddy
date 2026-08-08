import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

let isIntentionalDisconnect = false;

/**
 * Connects to MongoDB via Mongoose.
 */
export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection.db;
  }

  try {
    isIntentionalDisconnect = false;
    const conn = await mongoose.connect(env.MONGO_URI);
    logger.info(
      { host: conn.connection.host, database: conn.connection.name },
      'MongoDB connected successfully'
    );
    return conn.connection.db;
  } catch (error) {
    logger.error({ err: error.message }, 'MongoDB connection failed');
    process.exit(1);
  }
};

/**
 * Returns the underlying native MongoDB Db instance 
 * (used for raw collection vector search aggregations).
 */
export const getDb = () => {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('Database is not connected. Call connectDB() first.');
  }
  return mongoose.connection.db;
};

/**
 * Gracefully closes the connection.
 */
export const closeDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    isIntentionalDisconnect = true;
    await mongoose.disconnect();
    logger.info('MongoDB connection closed');
  }
};

mongoose.connection.on('disconnected', () => {
  if (!isIntentionalDisconnect) {
    logger.warn('MongoDB connection lost');
  }
});