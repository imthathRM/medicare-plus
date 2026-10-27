import { Router } from 'express';
import prisma from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';

const router = Router();

/**
 * GET /api/doctors
 * Retrieve all doctors from PostgreSQL (supports query filter: ?department=, ?status=)
 */
router.get('/', async (req, res, next) => {
  try {
    const { department, status } = req.query;
    const where = {};

    if (department) {
      where.department = { equals: String(department), mode: 'insensitive' };
    }

    if (status) {
      where.status = { equals: String(status), mode: 'insensitive' };
    }

    const doctors = await prisma.doctor.findMany({
      where,
      orderBy: { id: 'asc' },
    });

    return sendSuccess(res, doctors, `Retrieved ${doctors.length} doctor profile(s).`);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/doctors/:id
 * Retrieve a doctor profile by ID from PostgreSQL
 */
router.get('/:id', async (req, res, next) => {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id: req.params.id },
      include: { departmentRef: true },
    });

    if (!doctor) {
      return sendError(res, `Doctor with ID '${req.params.id}' not found.`, 404);
    }

    return sendSuccess(res, doctor, 'Doctor profile retrieved.');
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/doctors
 * Register a new doctor in PostgreSQL
 */
router.post('/', async (req, res, next) => {
  try {
    const data = req.body;
    if (!data || !data.name || !data.department) {
      return sendError(res, 'Doctor name and department are required.', 400);
    }

    const newDoctor = await prisma.doctor.create({
      data: {
        id: data.id || `DOC-${Date.now()}`,
        name: data.name,
        slmcRegNo: data.slmcRegNo || 'Pending',
        department: data.department,
        departmentId: data.departmentId || null,
        specialization: data.specialization || '',
        qualification: data.qualification || '',
        phone: data.phone || '',
        email: data.email || '',
        status: data.status || 'Available',
        consultationRoom: data.consultationRoom || '',
        consultationFeeLKR: typeof data.consultationFeeLKR === 'number' ? data.consultationFeeLKR : 3500,
      },
    });

    return sendSuccess(res, newDoctor, 'Doctor registered successfully in PostgreSQL.', 201);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/doctors/:id
 * Update an existing doctor profile in PostgreSQL
 */
router.put('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.doctor.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return sendError(res, `Doctor with ID '${req.params.id}' not found.`, 404);
    }

    const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, departmentRef: _departmentRef, ...updateData } = req.body;

    const updated = await prisma.doctor.update({
      where: { id: req.params.id },
      data: updateData,
    });

    return sendSuccess(res, updated, 'Doctor profile updated successfully.');
  } catch (error) {
    next(error);
  }
});

export default router;
