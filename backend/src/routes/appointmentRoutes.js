import { Router } from 'express';
import { appointments } from '../data/memoryStore.js';
import { sendSuccess, sendError } from '../utils/response.js';

const router = Router();

/**
 * GET /api/appointments
 * Retrieve all appointments (supports ?status=, ?date=)
 */
router.get('/', (req, res) => {
  const { status, date } = req.query;
  let result = [...appointments];

  if (status) {
    result = result.filter(
      (a) => a.status.toLowerCase() === String(status).toLowerCase()
    );
  }

  if (date) {
    result = result.filter((a) => a.date === String(date));
  }

  return sendSuccess(res, result, `Retrieved ${result.length} appointment(s).`);
});

/**
 * GET /api/appointments/:id
 * Retrieve appointment by ID
 */
router.get('/:id', (req, res) => {
  const apt = appointments.find((a) => a.id === req.params.id);
  if (!apt) {
    return sendError(res, `Appointment with ID '${req.params.id}' not found.`, 404);
  }
  return sendSuccess(res, apt, 'Appointment retrieved.');
});

/**
 * POST /api/appointments
 * Book a new appointment (In-Memory Stage 5 Prototype)
 */
router.post('/', (req, res) => {
  const data = req.body;
  if (!data || !data.patientName || !data.doctorName) {
    return sendError(res, 'Patient name and Doctor name are required.', 400);
  }

  const newApt = {
    id: `APT-${Date.now()}`,
    patientId: data.patientId || `PAT-${Date.now()}`,
    patientName: data.patientName,
    patientPhone: data.patientPhone || '',
    doctorId: data.doctorId || '',
    doctorName: data.doctorName,
    department: data.department || 'General Medicine',
    date: data.date || new Date().toISOString().slice(0, 10),
    time: data.time || '10:00 AM',
    room: data.room || 'Consultation Room 1',
    status: data.status || 'Confirmed',
    type: data.type || 'Consultation',
    feeLKR: data.feeLKR || 3500,
  };

  appointments.unshift(newApt);
  return sendSuccess(res, newApt, 'Appointment scheduled successfully (in-memory).', 201);
});

/**
 * PATCH & PUT /api/appointments/:id/status
 * Update appointment status (e.g. Confirmed, Completed, Cancelled, Waiting)
 */
const updateStatus = (req, res) => {
  const index = appointments.findIndex((a) => a.id === req.params.id);
  if (index === -1) {
    return sendError(res, `Appointment with ID '${req.params.id}' not found.`, 404);
  }

  const { status } = req.body;
  if (!status) {
    return sendError(res, 'Status is required.', 400);
  }

  appointments[index].status = status;
  return sendSuccess(res, appointments[index], `Appointment status updated to '${status}'.`);
};

router.patch('/:id/status', updateStatus);
router.put('/:id/status', updateStatus);

export default router;
