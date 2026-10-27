import { Router } from 'express';
import { admissions } from '../data/memoryStore.js';
import { sendSuccess, sendError } from '../utils/response.js';

const router = Router();

/**
 * GET /api/admissions
 * Retrieve all inpatient admissions
 */
router.get('/', (req, res) => {
  const { status } = req.query;
  let result = [...admissions];

  if (status) {
    result = result.filter(
      (a) => a.status.toLowerCase() === String(status).toLowerCase()
    );
  }

  return sendSuccess(res, result, `Retrieved ${result.length} admission record(s).`);
});

/**
 * GET /api/admissions/:id
 * Retrieve admission record by ID
 */
router.get('/:id', (req, res) => {
  const admission = admissions.find((a) => a.id === req.params.id);
  if (!admission) {
    return sendError(res, `Admission record with ID '${req.params.id}' not found.`, 404);
  }
  return sendSuccess(res, admission, 'Admission record retrieved.');
});

/**
 * POST /api/admissions
 * Register a new inpatient admission
 */
router.post('/', (req, res) => {
  const data = req.body;
  if (!data || !data.patientName || !data.ward) {
    return sendError(res, 'Patient name and ward are required.', 400);
  }

  const newAdmission = {
    id: `ADM-${Date.now()}`,
    patientId: data.patientId || `PAT-${Date.now()}`,
    patientName: data.patientName,
    ward: data.ward,
    bedNumber: data.bedNumber || 'TBD',
    admissionDate: data.admissionDate || new Date().toISOString().slice(0, 10),
    status: data.status || 'Admitted',
    admittingDoctor: data.admittingDoctor || 'Dr. On Duty',
    diagnosis: data.diagnosis || 'Under Evaluation',
  };

  admissions.unshift(newAdmission);
  return sendSuccess(res, newAdmission, 'Patient admitted successfully (in-memory).', 201);
});

/**
 * PUT /api/admissions/:id
 * Update admission details (e.g. transfer ward, discharge)
 */
router.put('/:id', (req, res) => {
  const index = admissions.findIndex((a) => a.id === req.params.id);
  if (index === -1) {
    return sendError(res, `Admission record with ID '${req.params.id}' not found.`, 404);
  }

  admissions[index] = {
    ...admissions[index],
    ...req.body,
    id: req.params.id,
  };

  return sendSuccess(res, admissions[index], 'Admission record updated successfully.');
});

export default router;
