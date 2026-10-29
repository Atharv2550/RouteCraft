import mongoose from 'mongoose';
import { config } from './env.js';
import { logger } from '../utils/logger.js';

export async function connectDB() {
  try {
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true
    });
    logger.info(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    logger.error(`MongoDB connection error: ${err.message}`);
    throw err;
  }
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
