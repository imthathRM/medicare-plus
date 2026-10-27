import { createApp } from './app.js';
import { config } from './config/environment.js';

const app = createApp();

const server = app.listen(config.port, () => {
  console.log('====================================================');
  console.log(` MediCare Plus Backend (Stage 5) is running!`);
  console.log(` Environment : ${config.nodeEnv}`);
  console.log(` Port        : ${config.port}`);
  console.log(` Health URL  : http://localhost:${config.port}/api/health`);
  console.log(` CORS Origin : ${config.corsOrigin}`);
  console.log('====================================================');
});

// Graceful process shutdown handling
const shutdown = (signal) => {
  console.log(`\nReceived ${signal}. Gracefully shutting down MediCare Plus backend...`);
  server.close(() => {
    console.log('HTTP server closed. Exiting process.');
    process.exit(0);
  });

  // Force close after 5 seconds if hanging
  setTimeout(() => {
    console.error('Forcefully terminating hanging connections.');
    process.exit(1);
  }, 5000).unref();
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

export default server;
