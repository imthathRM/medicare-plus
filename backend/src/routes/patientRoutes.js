import { Router } from 'express';
import prisma from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { authenticateToken, requireRoles } from '../middleware/authMiddleware.js';

const router = Router();

// Apply JWT authentication to all patient routes
router.use(authenticateToken);

/**
 * GET /api/patients
 * Retrieve all patients from PostgreSQL (supports query filter: ?search=)
 */
router.get('/', requireRoles('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PHARMACIST'), async (req, res, next) => {
  try {
    const { search } = req.query;
    const where = search
      ? {
          OR: [
            { name: { contains: String(search), mode: 'insensitive' } },
            { id: { contains: String(search), mode: 'insensitive' } },
            { nationalId: { contains: String(search), mode: 'insensitive' } },
            { phone: { contains: String(search), mode: 'insensitive' } },
          ],
        }
      : {};

    const patients = await prisma.patient.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, patients, `Retrieved ${patients.length} patient record(s).`);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/patients/:id
 * Retrieve a single patient by ID from PostgreSQL
 */
router.get('/:id', async (req, res, next) => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: req.params.id },
    });

    if (!patient) {
      return sendError(res, `Patient with ID '${req.params.id}' not found.`, 404);
    }

    return sendSuccess(res, patient, 'Patient record retrieved.');
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/patients
 * Create a new patient record in PostgreSQL
 */
router.post('/', requireRoles('ADMIN', 'DOCTOR', 'RECEPTIONIST'), async (req, res, next) => {
  try {
    const data = req.body;
    if (!data || !data.name) {
      return sendError(res, 'Patient name is required.', 400);
    }

    const newPatient = await prisma.patient.create({
      data: {
        id: data.id || `PAT-${Date.now()}`,
        name: data.name,
        gender: data.gender || 'Other',
        dob: data.dob || '',
        age: typeof data.age === 'number' ? data.age : null,
        bloodGroup: data.bloodGroup || '',
        phone: data.phone || '',
        email: data.email || '',
        address: data.address || '',
        nationalId: data.nationalId || '',
        emergencyContact: data.emergencyContact || '',
        status: data.status || 'Outpatient',
        registeredDate: data.registeredDate || new Date().toISOString().slice(0, 10),
        attendingDoctor: data.attendingDoctor || '',
        department: data.department || '',
        allergies: data.allergies || 'None',
        medicalHistory: data.medicalHistory || '',
        lastVisit: new Date().toISOString().slice(0, 10),
      },
    });

    return sendSuccess(res, newPatient, 'Patient registered successfully in PostgreSQL.', 201);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/patients/:id
 * Update an existing patient record in PostgreSQL
 */
router.put('/:id', requireRoles('ADMIN', 'DOCTOR', 'RECEPTIONIST'), async (req, res, next) => {
  try {
    const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...updateData } = req.body;

    const existing = await prisma.patient.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return sendError(res, `Patient with ID '${req.params.id}' not found.`, 404);
    }

    const updatedPatient = await prisma.patient.update({
      where: { id: req.params.id },
      data: updateData,
    });

    return sendSuccess(res, updatedPatient, 'Patient record updated successfully.');
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/patients/:id
 * Delete or archive a patient record in PostgreSQL (ADMIN only)
 */
router.delete('/:id', requireRoles('ADMIN'), async (req, res, next) => {
  try {
    const existing = await prisma.patient.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return sendError(res, `Patient with ID '${req.params.id}' not found.`, 404);
    }

    await prisma.patient.delete({
      where: { id: req.params.id },
    });

    return sendSuccess(res, { id: req.params.id }, `Patient record '${req.params.id}' archived successfully.`);
  } catch (error) {
    next(error);
  }
});

export default router;
