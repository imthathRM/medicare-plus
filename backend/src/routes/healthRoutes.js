import { Router } from 'express';
import prisma from '../config/prisma.js';
import { sendSuccess } from '../utils/response.js';
import { config } from '../config/environment.js';

const router = Router();

/**
 * GET /api/health
 * Public health-check endpoint for server monitoring and readiness checks.
 * Includes PostgreSQL connectivity probe.
 */
router.get('/', async (req, res) => {
  let dbStatus = 'disconnected';
  let dbError = null;

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch (err) {
    dbStatus = 'error';
    dbError = err.message;
  }

  return sendSuccess(
    res,
    {
      status: 'healthy',
      service: 'medicare-plus-backend',
      version: config.version,
      environment: config.nodeEnv,
      database: {
        status: dbStatus,
        provider: 'postgresql',
        ...(dbError && process.env.NODE_ENV !== 'production' ? { error: dbError } : {}),
      },
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    },
    'MediCare Plus Backend service is healthy and operational'
  );
});

export default router;
