import app from './src/app.js';
import { env } from './src/config/env.js';
import { connectDB } from './src/config/db.js';
import { logger } from './src/utils/logger.js';

const startServer = async () => {
  await connectDB();

  app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
  });
};

startServer();