import { Router } from 'express';
import prisma from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { authenticateToken, requireRoles } from '../middleware/authMiddleware.js';

const router = Router();

// Apply JWT authentication to all staff routes
router.use(authenticateToken);

/**
 * GET /api/staff
 * Retrieve all hospital administrative, nursing, and clinical staff from PostgreSQL
 */
router.get('/', requireRoles('ADMIN', 'DOCTOR', 'RECEPTIONIST'), async (req, res, next) => {
  try {
    const { department, role } = req.query;
    const where = {};

    if (department) {
      where.department = { equals: String(department), mode: 'insensitive' };
    }

    if (role) {
      where.role = { equals: String(role), mode: 'insensitive' };
    }

    const staffList = await prisma.staff.findMany({
      where,
      orderBy: { id: 'asc' },
    });

    return sendSuccess(res, staffList, `Retrieved ${staffList.length} staff member(s).`);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/staff/:id
 * Retrieve staff member by ID from PostgreSQL
 */
router.get('/:id', async (req, res, next) => {
  try {
    const member = await prisma.staff.findUnique({
      where: { id: req.params.id },
    });

    if (!member) {
      return sendError(res, `Staff member with ID '${req.params.id}' not found.`, 404);
    }

    return sendSuccess(res, member, 'Staff member retrieved.');
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/staff
 * Register a new staff member in PostgreSQL (ADMIN only)
 */
router.post('/', requireRoles('ADMIN'), async (req, res, next) => {
  try {
    const data = req.body;
    if (!data || !data.name || !data.role) {
      return sendError(res, 'Staff name and role are required.', 400);
    }

    const newStaff = await prisma.staff.create({
      data: {
        id: data.id || `STF-${Date.now()}`,
        name: data.name,
        role: data.role,
        department: data.department || 'General Services',
        phone: data.phone || '',
        email: data.email || '',
        status: data.status || 'Active',
        shift: data.shift || 'General',
      },
    });

    return sendSuccess(res, newStaff, 'Staff member registered successfully in PostgreSQL.', 201);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/staff/:id
 * Update an existing staff member in PostgreSQL (ADMIN only)
 */
router.put('/:id', requireRoles('ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const existing = await prisma.staff.findUnique({ where: { id } });
    if (!existing) {
      return sendError(res, `Staff member with ID '${id}' not found.`, 404);
    }

    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.department !== undefined) updateData.department = data.department;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.shift !== undefined) updateData.shift = data.shift;

    const updated = await prisma.staff.update({
      where: { id },
      data: updateData,
    });

    return sendSuccess(res, updated, 'Staff member updated successfully in PostgreSQL.');
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/staff/:id
 * Remove staff member from PostgreSQL (ADMIN only)
 */
router.delete('/:id', requireRoles('ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.staff.findUnique({ where: { id } });
    if (!existing) {
      return sendError(res, `Staff member with ID '${id}' not found.`, 404);
    }

    await prisma.staff.delete({ where: { id } });
    return sendSuccess(res, null, `Staff member '${id}' deleted successfully.`);
  } catch (error) {
    next(error);
  }
});

export default router;
