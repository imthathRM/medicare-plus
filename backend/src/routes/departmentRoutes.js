import { Router } from 'express';
import { departments } from '../data/memoryStore.js';
import { sendSuccess, sendError } from '../utils/response.js';

const router = Router();

/**
 * GET /api/departments
 * Retrieve all clinical and non-clinical departments
 */
router.get('/', (req, res) => {
  return sendSuccess(res, departments, `Retrieved ${departments.length} department(s).`);
});

/**
 * GET /api/departments/:id
 * Retrieve department by ID
 */
router.get('/:id', (req, res) => {
  const dept = departments.find((d) => d.id === req.params.id);
  if (!dept) {
    return sendError(res, `Department with ID '${req.params.id}' not found.`, 404);
  }
  return sendSuccess(res, dept, 'Department details retrieved.');
});

export default router;
