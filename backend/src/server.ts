import { Server } from 'http';
import mongoose from 'mongoose';
import app from './app';
import config from './config';
import { seedDatabase } from './utils/seedDatabase';

let server: Server;

// Connect to MongoDB immediately at module load time
if (config.database_url) {
  mongoose.connect(config.database_url as string)
    .then(() => {
      console.log('🚀 Database connected successfully');
      seedDatabase();
    })
    .catch((err) => {
      console.error('❌ Database connection error:', err);
    });
} else {
  console.warn('⚠️ Warning: DATABASE_URL is not set!');
}

// Start listening locally (skip port binding if hosted on Vercel serverless)
if (!process.env.VERCEL) {
  server = app.listen(config.port || 8000, () => {
    console.log(`app is listening on port ${config.port || 8000}`);
  });
}

process.on('unhandledRejection', (err) => {
  console.log(`😈 unhandledRejection is detected, shutting down ...`, err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

process.on('uncaughtException', (err) => {
  console.log(`😈 uncaughtException is detected, shutting down ...`, err);
  process.exit(1);
});

// Export app as default handler for Vercel
export default app;
