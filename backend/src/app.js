import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/environment.js';
import apiRouter from './routes/index.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';

export const createApp = () => {
  const app = express();

  // Secure HTTP Headers
  app.use(helmet({ contentSecurityPolicy: false }));

  // CORS configuration allowing existing Vite frontend
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, postman)
        if (!origin) return callback(null, true);
        
        // Accept configured origin, localhost, or 127.0.0.1
        const allowedOrigins = [
          config.corsOrigin,
          'http://localhost:5173',
          'http://127.0.0.1:5173',
        ];

        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        // For dev flexibility, allow any localhost port
        if (/^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) {
          return callback(null, true);
        }

        return callback(new Error(`CORS blocked for origin: ${origin}`));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Request Body Parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Mount Centralized API Routes
  app.use('/api', apiRouter);

  // Fallback 404 Handler
  app.use(notFoundHandler);

  // Centralized Error Handling Middleware
  app.use(errorHandler);

  return app;
};

export default createApp;
