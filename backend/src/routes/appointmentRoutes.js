import { Router } from 'express';
import prisma from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { authenticateToken, requireRoles } from '../middleware/authMiddleware.js';

const router = Router();

// Apply JWT authentication to all appointment routes
router.use(authenticateToken);

/**
 * GET /api/appointments
 * Retrieve all appointments from PostgreSQL (supports ?status=, ?date=)
 */
router.get('/', async (req, res, next) => {
  try {
    const { status, date } = req.query;
    const where = {};

    if (status) {
      where.status = { equals: String(status), mode: 'insensitive' };
    }

    if (date) {
      where.date = String(date);
    }

    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: { date: 'asc' },
    });

    return sendSuccess(res, appointments, `Retrieved ${appointments.length} appointment(s).`);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/appointments/:id
 * Retrieve appointment by ID from PostgreSQL
 */
router.get('/:id', async (req, res, next) => {
  try {
    const apt = await prisma.appointment.findUnique({
      where: { id: req.params.id },
      include: { patient: true, doctor: true },
    });

    if (!apt) {
      return sendError(res, `Appointment with ID '${req.params.id}' not found.`, 404);
    }

    return sendSuccess(res, apt, 'Appointment retrieved.');
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/appointments
 * Book a new appointment in PostgreSQL
 */
router.post('/', requireRoles('ADMIN', 'DOCTOR', 'RECEPTIONIST'), async (req, res, next) => {
  try {
    const data = req.body;
    if (!data || !data.patientName || !data.doctorName) {
      return sendError(res, 'Patient name and Doctor name are required.', 400);
    }

    const newApt = await prisma.appointment.create({
      data: {
        id: data.id || `APT-${Date.now()}`,
        patientId: data.patientId || null,
        patientName: data.patientName,
        patientPhone: data.patientPhone || '',
        doctorId: data.doctorId || null,
        doctorName: data.doctorName,
        department: data.department || 'General Medicine',
        date: data.date || new Date().toISOString().slice(0, 10),
        time: data.time || '10:00 AM',
        room: data.room || 'Consultation Room 1',
        status: data.status || 'Confirmed',
        type: data.type || 'Consultation',
        feeLKR: typeof data.feeLKR === 'number' ? data.feeLKR : 3500,
      },
    });

    return sendSuccess(res, newApt, 'Appointment scheduled successfully in PostgreSQL.', 201);
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH & PUT /api/appointments/:id/status
 * Update appointment status in PostgreSQL
 */
const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) {
      return sendError(res, 'Status is required.', 400);
    }

    const existing = await prisma.appointment.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return sendError(res, `Appointment with ID '${req.params.id}' not found.`, 404);
    }

    const updated = await prisma.appointment.update({
      where: { id: req.params.id },
      data: { status },
    });

    return sendSuccess(res, updated, `Appointment status updated to '${status}'.`);
  } catch (error) {
    next(error);
  }
};

router.patch('/:id/status', requireRoles('ADMIN', 'DOCTOR', 'RECEPTIONIST'), updateStatus);
router.put('/:id/status', requireRoles('ADMIN', 'DOCTOR', 'RECEPTIONIST'), updateStatus);

/**
 * PUT /api/appointments/:id
 * Full update for an appointment in PostgreSQL
 */
router.put('/:id', requireRoles('ADMIN', 'DOCTOR', 'RECEPTIONIST'), async (req, res, next) => {
  try {
    const existing = await prisma.appointment.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return sendError(res, `Appointment with ID '${req.params.id}' not found.`, 404);
    }

    const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, patient: _patient, doctor: _doctor, fee, ...updateData } = req.body;
    if (fee !== undefined && updateData.feeLKR === undefined) {
      updateData.feeLKR = Number(fee) || 3500;
    }

    const updated = await prisma.appointment.update({
      where: { id: req.params.id },
      data: updateData,
    });

    return sendSuccess(res, updated, 'Appointment updated successfully.');
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/appointments/:id
 * Cancel or delete appointment in PostgreSQL
 */
router.delete('/:id', requireRoles('ADMIN', 'RECEPTIONIST'), async (req, res, next) => {
  try {
    const existing = await prisma.appointment.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return sendError(res, `Appointment with ID '${req.params.id}' not found.`, 404);
    }

    await prisma.appointment.delete({
      where: { id: req.params.id },
    });

    return sendSuccess(res, { id: req.params.id }, `Appointment '${req.params.id}' cancelled/deleted.`);
  } catch (error) {
    next(error);
  }
});

export default router;
