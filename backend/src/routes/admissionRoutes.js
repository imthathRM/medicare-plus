import { Router } from 'express';
import prisma from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { authenticateToken, requireRoles } from '../middleware/authMiddleware.js';

const router = Router();

// Apply JWT authentication to all admission routes
router.use(authenticateToken);

/**
 * GET /api/admissions
 * Retrieve all inpatient admissions from PostgreSQL
 */
router.get('/', async (req, res, next) => {
  try {
    const { status } = req.query;
    const where = {};

    if (status) {
      where.status = { equals: String(status), mode: 'insensitive' };
    }

    const admissions = await prisma.admission.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { patient: true },
    });

    return sendSuccess(res, admissions, `Retrieved ${admissions.length} admission record(s).`);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admissions/:id
 * Retrieve admission record by ID from PostgreSQL
 */
router.get('/:id', async (req, res, next) => {
  try {
    const admission = await prisma.admission.findUnique({
      where: { id: req.params.id },
      include: { patient: true },
    });

    if (!admission) {
      return sendError(res, `Admission record with ID '${req.params.id}' not found.`, 404);
    }

    return sendSuccess(res, admission, 'Admission record retrieved.');
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admissions
 * Register a new inpatient admission in PostgreSQL
 */
router.post('/', requireRoles('ADMIN', 'DOCTOR', 'RECEPTIONIST'), async (req, res, next) => {
  try {
    const data = req.body;
    if (!data || !data.patientName || !data.ward) {
      return sendError(res, 'Patient name and ward are required.', 400);
    }

    const newAdmission = await prisma.admission.create({
      data: {
        id: data.id || `ADM-${Date.now()}`,
        patientId: data.patientId || null,
        patientName: data.patientName,
        ward: data.ward,
        bedNumber: data.bedNumber || 'TBD',
        admissionDate: data.admissionDate || new Date().toISOString().slice(0, 10),
        status: data.status || 'Admitted',
        admittingDoctor: data.admittingDoctor || 'Dr. On Duty',
        diagnosis: data.diagnosis || 'Under Evaluation',
      },
    });

    return sendSuccess(res, newAdmission, 'Patient admitted successfully in PostgreSQL.', 201);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/admissions/:id
 * Update admission details in PostgreSQL
 */
router.put('/:id', requireRoles('ADMIN', 'DOCTOR', 'RECEPTIONIST'), async (req, res, next) => {
  try {
    const existing = await prisma.admission.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return sendError(res, `Admission record with ID '${req.params.id}' not found.`, 404);
    }

    const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, patient: _patient, ...updateData } = req.body;

    const updated = await prisma.admission.update({
      where: { id: req.params.id },
      data: updateData,
    });

    return sendSuccess(res, updated, 'Admission record updated successfully.');
  } catch (error) {
    next(error);
  }
});

export default router;
