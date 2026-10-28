import { Router } from 'express';
import prisma from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

// Apply JWT authentication to all department routes
router.use(authenticateToken);

/**
 * GET /api/departments
 * Retrieve all clinical and non-clinical departments from PostgreSQL
 */
router.get('/', async (req, res, next) => {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { id: 'asc' },
    });

    return sendSuccess(res, departments, `Retrieved ${departments.length} department(s).`);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/departments/:id
 * Retrieve department by ID from PostgreSQL
 */
router.get('/:id', async (req, res, next) => {
  try {
    const dept = await prisma.department.findUnique({
      where: { id: req.params.id },
      include: { doctors: true },
    });

    if (!dept) {
      return sendError(res, `Department with ID '${req.params.id}' not found.`, 404);
    }

    return sendSuccess(res, dept, 'Department details retrieved.');
  } catch (error) {
    next(error);
  }
});

export default router;
