import { Router } from 'express';
import { staff } from '../data/memoryStore.js';
import { sendSuccess, sendError } from '../utils/response.js';

const router = Router();

/**
 * GET /api/staff
 * Retrieve all hospital administrative, nursing, and clinical staff
 */
router.get('/', (req, res) => {
  const { department, role } = req.query;
  let result = [...staff];

  if (department) {
    result = result.filter(
      (s) => s.department.toLowerCase() === String(department).toLowerCase()
    );
  }

  if (role) {
    result = result.filter(
      (s) => s.role.toLowerCase() === String(role).toLowerCase()
    );
  }

  return sendSuccess(res, result, `Retrieved ${result.length} staff member(s).`);
});

/**
 * GET /api/staff/:id
 * Retrieve staff member by ID
 */
router.get('/:id', (req, res) => {
  const member = staff.find((s) => s.id === req.params.id);
  if (!member) {
    return sendError(res, `Staff member with ID '${req.params.id}' not found.`, 404);
  }
  return sendSuccess(res, member, 'Staff member retrieved.');
});

/**
 * POST /api/staff
 * Register a new staff member (In-Memory Stage 5 Prototype)
 */
router.post('/', (req, res) => {
  const data = req.body;
  if (!data || !data.name || !data.role) {
    return sendError(res, 'Staff name and role are required.', 400);
  }

  const newStaff = {
    id: `STF-${Date.now()}`,
    name: data.name,
    role: data.role,
    department: data.department || 'General Services',
    phone: data.phone || '',
    email: data.email || '',
    status: data.status || 'Active',
    shift: data.shift || 'General',
  };

  staff.push(newStaff);
  return sendSuccess(res, newStaff, 'Staff member registered successfully (in-memory).', 201);
});

export default router;
