import { Router } from 'express';
import prisma from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { authenticateToken, requireRoles } from '../middleware/authMiddleware.js';

const router = Router();

// Apply JWT authentication to all pharmacy routes
router.use(authenticateToken);

/**
 * GET /api/pharmacy (or /api/inventory)
 * Retrieve pharmacy medicine inventory from PostgreSQL
 */
router.get('/', async (req, res, next) => {
  try {
    const { category, status } = req.query;
    const where = {};

    if (category) {
      where.category = { equals: String(category), mode: 'insensitive' };
    }

    if (status) {
      where.status = { equals: String(status), mode: 'insensitive' };
    }

    const medicines = await prisma.medicine.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return sendSuccess(res, medicines, `Retrieved ${medicines.length} pharmacy item(s).`);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/pharmacy/:id
 * Retrieve medicine item by ID from PostgreSQL
 */
router.get('/:id', async (req, res, next) => {
  try {
    const item = await prisma.medicine.findUnique({
      where: { id: req.params.id },
    });

    if (!item) {
      return sendError(res, `Pharmacy item with ID '${req.params.id}' not found.`, 404);
    }

    return sendSuccess(res, item, 'Pharmacy item retrieved.');
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/pharmacy
 * Add new medicine to inventory in PostgreSQL (ADMIN, PHARMACIST only)
 */
router.post('/', requireRoles('ADMIN', 'PHARMACIST'), async (req, res, next) => {
  try {
    const data = req.body;
    if (!data || !data.name || !data.category) {
      return sendError(res, 'Medicine name and category are required.', 400);
    }

    const stock = Number(data.stockQuantity || 0);
    const reorder = Number(data.reorderLevel || 50);

    const newItem = await prisma.medicine.create({
      data: {
        id: data.id || `MED-${Date.now()}`,
        name: data.name,
        brand: data.brand || '',
        category: data.category,
        dosageForm: data.dosageForm || 'Tablet',
        unitPriceLKR: Number(data.unitPriceLKR || 0),
        stockQuantity: stock,
        reorderLevel: reorder,
        status: stock <= reorder ? 'Low Stock' : 'In Stock',
      },
    });

    return sendSuccess(res, newItem, 'Medicine added to inventory in PostgreSQL.', 201);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/pharmacy/:id/stock
 * Adjust medicine stock level atomically via transaction (ADMIN, PHARMACIST only)
 */
router.put('/:id/stock', requireRoles('ADMIN', 'PHARMACIST'), async (req, res, next) => {
  try {
    const { adjustment, newQuantity } = req.body;
    if (typeof newQuantity !== 'number' && typeof adjustment !== 'number') {
      return sendError(res, 'Valid adjustment or newQuantity number is required.', 400);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const item = await tx.medicine.findUnique({
        where: { id: req.params.id },
      });

      if (!item) {
        throw new Error(`Medicine with ID '${req.params.id}' not found.`);
      }

      let finalStock = item.stockQuantity;
      if (typeof newQuantity === 'number') {
        finalStock = Math.max(0, newQuantity);
      } else if (typeof adjustment === 'number') {
        finalStock = Math.max(0, item.stockQuantity + adjustment);
      }

      const status = finalStock <= item.reorderLevel ? 'Low Stock' : 'In Stock';

      return tx.medicine.update({
        where: { id: req.params.id },
        data: {
          stockQuantity: finalStock,
          status,
        },
      });
    });

    return sendSuccess(
      res,
      updated,
      `Stock updated for '${updated.name}'. Current stock: ${updated.stockQuantity}`
    );
  } catch (error) {
    if (error.message.includes('not found')) {
      return sendError(res, error.message, 404);
    }
    next(error);
  }
});

export default router;
