import { Router } from 'express';
import { patients } from '../data/memoryStore.js';
import { sendSuccess, sendError } from '../utils/response.js';

const router = Router();

/**
 * GET /api/patients
 * Retrieve all patients (supports query filter: ?search=)
 */
router.get('/', (req, res) => {
  const { search } = req.query;
  let result = [...patients];

  if (search) {
    const term = String(search).toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.id.toLowerCase().includes(term) ||
        p.nationalId?.toLowerCase().includes(term) ||
        p.phone?.toLowerCase().includes(term)
    );
  }

  return sendSuccess(res, result, `Retrieved ${result.length} patient record(s).`);
});

/**
 * GET /api/patients/:id
 * Retrieve a single patient by ID
 */
router.get('/:id', (req, res) => {
  const patient = patients.find((p) => p.id === req.params.id);
  if (!patient) {
    return sendError(res, `Patient with ID '${req.params.id}' not found.`, 404);
  }
  return sendSuccess(res, patient, 'Patient record retrieved.');
});

/**
 * POST /api/patients
 * Create a new patient record (In-Memory Stage 5 Prototype)
 */
router.post('/', (req, res) => {
  const data = req.body;
  if (!data || !data.name) {
    return sendError(res, 'Patient name is required.', 400);
  }

  const newPatient = {
    id: `PAT-${Date.now()}`,
    name: data.name,
    gender: data.gender || 'Other',
    dob: data.dob || '',
    age: data.age || null,
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
  };

  patients.unshift(newPatient);
  return sendSuccess(res, newPatient, 'Patient registered successfully (in-memory).', 201);
});

/**
 * PUT /api/patients/:id
 * Update an existing patient record
 */
router.put('/:id', (req, res) => {
  const index = patients.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return sendError(res, `Patient with ID '${req.params.id}' not found.`, 404);
  }

  patients[index] = {
    ...patients[index],
    ...req.body,
    id: req.params.id, // Immutable ID
  };

  return sendSuccess(res, patients[index], 'Patient record updated successfully.');
});

/**
 * DELETE /api/patients/:id
 * Delete or archive a patient record
 */
router.delete('/:id', (req, res) => {
  const index = patients.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return sendError(res, `Patient with ID '${req.params.id}' not found.`, 404);
  }

  const [removed] = patients.splice(index, 1);
  return sendSuccess(res, { id: removed.id }, `Patient record '${removed.id}' archived successfully.`);
});

export default router;
