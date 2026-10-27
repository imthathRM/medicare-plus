import { Router } from 'express';
import { medicines } from '../data/memoryStore.js';
import { sendSuccess, sendError } from '../utils/response.js';

const router = Router();

/**
 * GET /api/pharmacy (or /api/inventory)
 * Retrieve pharmacy medicine inventory
 */
router.get('/', (req, res) => {
  const { category, status } = req.query;
  let result = [...medicines];

  if (category) {
    result = result.filter(
      (m) => m.category.toLowerCase() === String(category).toLowerCase()
    );
  }

  if (status) {
    result = result.filter(
      (m) => m.status.toLowerCase() === String(status).toLowerCase()
    );
  }

  return sendSuccess(res, result, `Retrieved ${result.length} pharmacy item(s).`);
});

/**
 * GET /api/pharmacy/:id
 * Retrieve medicine item by ID
 */
router.get('/:id', (req, res) => {
  const item = medicines.find((m) => m.id === req.params.id);
  if (!item) {
    return sendError(res, `Pharmacy item with ID '${req.params.id}' not found.`, 404);
  }
  return sendSuccess(res, item, 'Pharmacy item retrieved.');
});

/**
 * POST /api/pharmacy
 * Add new medicine to inventory
 */
router.post('/', (req, res) => {
  const data = req.body;
  if (!data || !data.name || !data.category) {
    return sendError(res, 'Medicine name and category are required.', 400);
  }

  const stock = Number(data.stockQuantity || 0);
  const reorder = Number(data.reorderLevel || 50);

  const newItem = {
    id: `MED-${Date.now()}`,
    name: data.name,
    brand: data.brand || '',
    category: data.category,
    dosageForm: data.dosageForm || 'Tablet',
    unitPriceLKR: Number(data.unitPriceLKR || 0),
    stockQuantity: stock,
    reorderLevel: reorder,
    status: stock <= reorder ? 'Low Stock' : 'In Stock',
  };

  medicines.unshift(newItem);
  return sendSuccess(res, newItem, 'Medicine added to inventory (in-memory).', 201);
});

/**
 * PUT /api/pharmacy/:id/stock
 * Adjust medicine stock level
 */
router.put('/:id/stock', (req, res) => {
  const item = medicines.find((m) => m.id === req.params.id);
  if (!item) {
    return sendError(res, `Medicine with ID '${req.params.id}' not found.`, 404);
  }

  const { adjustment, newQuantity } = req.body;
  if (typeof newQuantity === 'number') {
    item.stockQuantity = Math.max(0, newQuantity);
  } else if (typeof adjustment === 'number') {
    item.stockQuantity = Math.max(0, item.stockQuantity + adjustment);
  } else {
    return sendError(res, 'Valid adjustment or newQuantity number is required.', 400);
  }

  item.status = item.stockQuantity <= item.reorderLevel ? 'Low Stock' : 'In Stock';

  return sendSuccess(res, item, `Stock updated for '${item.name}'. Current stock: ${item.stockQuantity}`);
});

export default router;
