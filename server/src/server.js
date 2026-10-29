import http from 'http';
import app from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { initSocketIO } from './services/socketService.js';
import { config } from './config/env.js';
import { logger } from './utils/logger.js';

const server = http.createServer(app);

// Initialize Socket.IO
initSocketIO(server, config.clientUrl);

async function startServer() {
  try {
    await connectDB();

    server.listen(config.port, () => {
      logger.info(`🚀 RouteCraft Server running on port ${config.port} in ${config.nodeEnv} mode`);
      logger.info(`🌐 Health check available at http://localhost:${config.port}/api/health`);
    });
  } catch (err) {
    logger.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
}

// Graceful shutdown handling
function handleGracefulShutdown(signal) {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    try {
      await disconnectDB();
      logger.info('Database connection closed.');
      process.exit(0);
    } catch (err) {
      logger.error(`Error during shutdown: ${err.message}`);
      process.exit(1);
    }
  });
}

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

startServer();

export { server, app };

