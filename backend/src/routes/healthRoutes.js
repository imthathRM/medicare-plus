import { Router } from 'express';
import { sendSuccess } from '../utils/response.js';
import { config } from '../config/environment.js';

const router = Router();

/**
 * GET /api/health
 * Public health-check endpoint for server monitoring and readiness checks.
 */
router.get('/', (req, res) => {
  return sendSuccess(
    res,
    {
      status: 'healthy',
      service: 'medicare-plus-backend',
      version: config.version,
      environment: config.nodeEnv,
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    },
    'MediCare Plus Backend service is healthy and operational'
  );
});

export default router;
