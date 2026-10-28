import { Router } from 'express';
import prisma from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { authenticateToken, requireRoles } from '../middleware/authMiddleware.js';

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

/**
 * POST /api/departments
 * Create a new department in PostgreSQL (ADMIN only)
 */
router.post('/', requireRoles('ADMIN'), async (req, res, next) => {
  try {
    const data = req.body;
    if (!data || !data.name) {
      return sendError(res, 'Department name is required.', 400);
    }

    const code = (data.code || data.name.replace(/[^a-zA-Z]/g, '').slice(0, 4) || 'DEPT').toUpperCase();

    const newDept = await prisma.department.create({
      data: {
        id: data.id || `DEP-${Date.now()}`,
        name: data.name.trim(),
        code,
        headOfDepartment: data.headOfDepartment || '',
        doctorCount: Number(data.doctorCount) || 0,
        bedCount: Number(data.bedCount) || 0,
        phone: data.phone || '',
        location: data.location || '',
        description: data.description || '',
        status: data.status || 'Active',
      },
    });

    return sendSuccess(res, newDept, 'Department created successfully in PostgreSQL.', 201);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/departments/:id
 * Update an existing department in PostgreSQL (ADMIN only)
 */
router.put('/:id', requireRoles('ADMIN'), async (req, res, next) => {
  try {
    const existing = await prisma.department.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return sendError(res, `Department with ID '${req.params.id}' not found.`, 404);
    }

    const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, doctors: _doctors, ...updateData } = req.body;

    if (updateData.doctorCount !== undefined) updateData.doctorCount = Number(updateData.doctorCount) || 0;
    if (updateData.bedCount !== undefined) updateData.bedCount = Number(updateData.bedCount) || 0;
    if (updateData.code) updateData.code = updateData.code.trim().toUpperCase();

    const updated = await prisma.department.update({
      where: { id: req.params.id },
      data: updateData,
    });

    return sendSuccess(res, updated, 'Department updated successfully.');
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/departments/:id
 * Delete a department in PostgreSQL (ADMIN only)
 */
router.delete('/:id', requireRoles('ADMIN'), async (req, res, next) => {
  try {
    const existing = await prisma.department.findUnique({
      where: { id: req.params.id },
      include: { doctors: true },
    });

    if (!existing) {
      return sendError(res, `Department with ID '${req.params.id}' not found.`, 404);
    }

    if (existing.doctors && existing.doctors.length > 0) {
      return sendError(
        res,
        `Cannot delete department '${existing.name}' because it currently has ${existing.doctors.length} assigned doctor(s). Please reassign them first.`,
        400
      );
    }

    await prisma.department.delete({
      where: { id: req.params.id },
    });

    return sendSuccess(res, { id: req.params.id }, `Department '${existing.name}' deleted successfully.`);
  } catch (error) {
    next(error);
  }
});

export default router;
