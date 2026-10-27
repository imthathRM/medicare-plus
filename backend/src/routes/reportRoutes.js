import { Router } from 'express';
import { reportMetrics } from '../data/memoryStore.js';
import { sendSuccess } from '../utils/response.js';

const router = Router();

/**
 * GET /api/reports/summary
 * Retrieve top-level KPI metrics for executive and clinical dashboard
 */
router.get('/summary', (req, res) => {
  return sendSuccess(res, reportMetrics.summary, 'Summary KPI metrics retrieved.');
});

/**
 * GET /api/reports/trends
 * Retrieve monthly appointment trend dataset
 */
router.get('/trends', (req, res) => {
  return sendSuccess(res, reportMetrics.monthlyTrends, 'Monthly appointment trends retrieved.');
});

/**
 * GET /api/reports/distribution
 * Retrieve department-wise patient distribution dataset
 */
router.get('/distribution', (req, res) => {
  return sendSuccess(res, reportMetrics.departmentDistribution, 'Department patient distribution retrieved.');
});

export default router;
