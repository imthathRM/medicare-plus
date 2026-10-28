import { Router } from 'express';
import prisma from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { authenticateToken, requireRoles } from '../middleware/authMiddleware.js';

const router = Router();

// Apply JWT authentication to all doctor routes
router.use(authenticateToken);

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

    const normalizedDoctors = doctors.map((d) => ({
      ...d,
      specialty: d.specialization || d.department || '',
      consultationFee: d.consultationFeeLKR || 3500,
      roomNumber: d.consultationRoom || 'OPD-101',
    }));

    return sendSuccess(res, normalizedDoctors, `Retrieved ${normalizedDoctors.length} doctor profile(s).`);
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

    const normalizedDoctor = {
      ...doctor,
      specialty: doctor.specialization || doctor.department || '',
      consultationFee: doctor.consultationFeeLKR || 3500,
      roomNumber: doctor.consultationRoom || 'OPD-101',
    };

    return sendSuccess(res, normalizedDoctor, 'Doctor profile retrieved.');
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/doctors
 * Register a new doctor in PostgreSQL (ADMIN only)
 */
router.post('/', requireRoles('ADMIN'), async (req, res, next) => {
  try {
    const data = req.body;
    if (!data || !data.name || !data.department) {
      return sendError(res, 'Doctor name and department are required.', 400);
    }

    const fee = data.consultationFeeLKR !== undefined 
      ? Number(data.consultationFeeLKR) 
      : (data.consultationFee !== undefined ? Number(data.consultationFee) : 3500);

    const newDoctor = await prisma.doctor.create({
      data: {
        id: data.id || `DOC-${Date.now()}`,
        name: data.name.trim(),
        slmcRegNo: data.slmcRegNo || 'Pending',
        department: data.department,
        departmentId: data.departmentId || null,
        specialization: data.specialization || data.specialty || '',
        qualification: data.qualification || '',
        phone: data.phone || '',
        email: data.email || '',
        status: data.status || 'Available',
        consultationRoom: data.consultationRoom || data.roomNumber || '',
        consultationFeeLKR: isNaN(fee) ? 3500 : fee,
      },
    });

    return sendSuccess(res, newDoctor, 'Doctor registered successfully in PostgreSQL.', 201);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/doctors/:id
 * Update an existing doctor profile in PostgreSQL (ADMIN only)
 */
router.put('/:id', requireRoles('ADMIN'), async (req, res, next) => {
  try {
    const existing = await prisma.doctor.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return sendError(res, `Doctor with ID '${req.params.id}' not found.`, 404);
    }

    const allowedKeys = [
      'name',
      'slmcRegNo',
      'department',
      'departmentId',
      'specialization',
      'qualification',
      'phone',
      'email',
      'status',
      'consultationRoom',
      'consultationFeeLKR',
    ];
    const updateData = {};
    for (const key of allowedKeys) {
      if (req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    }
    if (req.body.specialty && !updateData.specialization) {
      updateData.specialization = req.body.specialty;
    }
    if (req.body.roomNumber && !updateData.consultationRoom) {
      updateData.consultationRoom = req.body.roomNumber;
    }
    if (req.body.consultationFee !== undefined && updateData.consultationFeeLKR === undefined) {
      updateData.consultationFeeLKR = Number(req.body.consultationFee) || 3500;
    }

    const updated = await prisma.doctor.update({
      where: { id: req.params.id },
      data: updateData,
    });

    return sendSuccess(res, updated, 'Doctor profile updated successfully.');
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/doctors/:id
 * Delete doctor profile from PostgreSQL (ADMIN only)
 */
router.delete('/:id', requireRoles('ADMIN'), async (req, res, next) => {
  try {
    const existing = await prisma.doctor.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return sendError(res, `Doctor with ID '${req.params.id}' not found.`, 404);
    }

    await prisma.doctor.delete({
      where: { id: req.params.id },
    });

    return sendSuccess(res, { id: req.params.id }, `Doctor '${existing.name}' removed from roster.`);
  } catch (error) {
    next(error);
  }
});

export default router;
