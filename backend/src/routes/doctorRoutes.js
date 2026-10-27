import { Router } from 'express';
import { doctors } from '../data/memoryStore.js';
import { sendSuccess, sendError } from '../utils/response.js';

const router = Router();

/**
 * GET /api/doctors
 * Retrieve all doctors (supports query filter: ?department=)
 */
router.get('/', (req, res) => {
  const { department, status } = req.query;
  let result = [...doctors];

  if (department) {
    result = result.filter(
      (d) => d.department.toLowerCase() === String(department).toLowerCase()
    );
  }

  if (status) {
    result = result.filter(
      (d) => d.status.toLowerCase() === String(status).toLowerCase()
    );
  }

  return sendSuccess(res, result, `Retrieved ${result.length} doctor profile(s).`);
});

/**
 * GET /api/doctors/:id
 * Retrieve a doctor profile by ID
 */
router.get('/:id', (req, res) => {
  const doctor = doctors.find((d) => d.id === req.params.id);
  if (!doctor) {
    return sendError(res, `Doctor with ID '${req.params.id}' not found.`, 404);
  }
  return sendSuccess(res, doctor, 'Doctor profile retrieved.');
});

/**
 * POST /api/doctors
 * Register a new doctor (In-Memory Stage 5 Prototype)
 */
router.post('/', (req, res) => {
  const data = req.body;
  if (!data || !data.name || !data.department) {
    return sendError(res, 'Doctor name and department are required.', 400);
  }

  const newDoctor = {
    id: `DOC-${Date.now()}`,
    name: data.name,
    slmcRegNo: data.slmcRegNo || 'Pending',
    department: data.department,
    departmentId: data.departmentId || '',
    specialization: data.specialization || '',
    qualification: data.qualification || '',
    phone: data.phone || '',
    email: data.email || '',
    status: data.status || 'Available',
    consultationRoom: data.consultationRoom || '',
    consultationFeeLKR: data.consultationFeeLKR || 3500,
  };

  doctors.push(newDoctor);
  return sendSuccess(res, newDoctor, 'Doctor registered successfully (in-memory).', 201);
});

/**
 * PUT /api/doctors/:id
 * Update an existing doctor profile
 */
router.put('/:id', (req, res) => {
  const index = doctors.findIndex((d) => d.id === req.params.id);
  if (index === -1) {
    return sendError(res, `Doctor with ID '${req.params.id}' not found.`, 404);
  }

  doctors[index] = {
    ...doctors[index],
    ...req.body,
    id: req.params.id,
  };

  return sendSuccess(res, doctors[index], 'Doctor profile updated successfully.');
});

export default router;
