import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import config from '../config';

export const dbConnectionMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    if (mongoose.connection.readyState === 0) {
      console.log('🔄 Serverless cold start: Connecting to MongoDB...');
      if (!config.database_url) {
        throw new Error('DATABASE_URL is not defined in environment variables!');
      }
      await mongoose.connect(config.database_url as string);
      console.log('🚀 Database connected successfully!');
    }
    next();
  } catch (err: any) {
    console.error('❌ Database connection error:', err.message);
    next(err);
  }
};
