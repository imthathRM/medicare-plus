import { Router } from 'express';
import prisma from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { authenticateToken, requireRoles } from '../middleware/authMiddleware.js';

const router = Router();

// Apply JWT authentication to all billing routes
router.use(authenticateToken);

/**
 * GET /api/billing (or /api/invoices)
 * Retrieve all hospital bills & invoices from PostgreSQL
 */
router.get('/', requireRoles('ADMIN', 'RECEPTIONIST', 'DOCTOR'), async (req, res, next) => {
  try {
    const { status, patientId } = req.query;
    const where = {};

    if (status) {
      where.status = { equals: String(status), mode: 'insensitive' };
    }

    if (patientId) {
      where.patientId = String(patientId);
    }

    const invoices = await prisma.invoice.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { patient: true },
    });

    const normalizedInvoices = invoices.map((inv) => ({
      ...inv,
      totalAmount: inv.totalLKR,
      paidAmount: inv.amountPaid || 0,
      subtotal: inv.subtotalLKR,
      tax: inv.taxLKR,
      patientName: inv.patientName || inv.patient?.name || 'Patient',
    }));

    return sendSuccess(res, normalizedInvoices, `Retrieved ${normalizedInvoices.length} billing invoice(s).`);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/billing/:id
 * Retrieve invoice by ID from PostgreSQL
 */
router.get('/:id', async (req, res, next) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id },
      include: { patient: true },
    });

    if (!invoice) {
      return sendError(res, `Invoice with ID '${req.params.id}' not found.`, 404);
    }

    const normalizedInvoice = {
      ...invoice,
      totalAmount: invoice.totalLKR,
      paidAmount: invoice.amountPaid || 0,
      subtotal: invoice.subtotalLKR,
      tax: invoice.taxLKR,
      patientName: invoice.patientName || invoice.patient?.name || 'Patient',
    };

    return sendSuccess(res, normalizedInvoice, 'Invoice retrieved.');
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/billing
 * Generate new invoice in PostgreSQL (ADMIN, RECEPTIONIST only)
 */
router.post('/', requireRoles('ADMIN', 'RECEPTIONIST'), async (req, res, next) => {
  try {
    const data = req.body;
    const total = Number(data.totalLKR ?? data.totalAmount);
    if (!data || !data.patientName || isNaN(total) || total <= 0) {
      return sendError(res, 'Patient name and a valid total amount are required.', 400);
    }

    const subtotal = Number(data.subtotalLKR ?? data.subtotal ?? total);
    const tax = Number(data.taxLKR ?? data.tax ?? 0);
    const amountPaid = Number(data.amountPaid ?? data.paidAmount ?? 0);

    const newInvoice = await prisma.invoice.create({
      data: {
        id: data.id || `INV-${Date.now()}`,
        invoiceNumber: data.invoiceNumber || `INV-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        patientId: data.patientId || null,
        patientName: data.patientName,
        date: data.date || new Date().toISOString().slice(0, 10),
        dueDate: data.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
        subtotalLKR: subtotal,
        taxLKR: tax,
        totalLKR: total,
        amountPaid: amountPaid,
        status: data.status || (amountPaid >= total ? 'Paid' : amountPaid > 0 ? 'Partially Paid' : 'Pending'),
        paymentMethod: data.paymentMethod || (amountPaid > 0 ? 'Cash' : null),
      },
    });

    return sendSuccess(res, newInvoice, 'Invoice generated successfully in PostgreSQL.', 201);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/billing/:id
 * Update invoice details in PostgreSQL (ADMIN, RECEPTIONIST only)
 */
router.put('/:id', requireRoles('ADMIN', 'RECEPTIONIST'), async (req, res, next) => {
  try {
    const existing = await prisma.invoice.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return sendError(res, `Invoice with ID '${req.params.id}' not found.`, 404);
    }

    const allowedKeys = [
      'invoiceNumber',
      'patientId',
      'patientName',
      'date',
      'dueDate',
      'subtotalLKR',
      'taxLKR',
      'totalLKR',
      'amountPaid',
      'status',
      'paymentMethod',
      'paidAt',
    ];
    const updateData = {};
    for (const key of allowedKeys) {
      if (req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    }

    if (req.body.totalAmount !== undefined && updateData.totalLKR === undefined) {
      updateData.totalLKR = Number(req.body.totalAmount) || 0;
    }
    if (req.body.subtotal !== undefined && updateData.subtotalLKR === undefined) {
      updateData.subtotalLKR = Number(req.body.subtotal) || 0;
    }
    if (req.body.tax !== undefined && updateData.taxLKR === undefined) {
      updateData.taxLKR = Number(req.body.tax) || 0;
    }
    if (req.body.paidAmount !== undefined && updateData.amountPaid === undefined) {
      updateData.amountPaid = Number(req.body.paidAmount) || 0;
    }

    const updated = await prisma.invoice.update({
      where: { id: req.params.id },
      data: updateData,
    });

    return sendSuccess(res, updated, 'Invoice updated successfully.');
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/billing/:id
 * Delete invoice from PostgreSQL (ADMIN only)
 */
router.delete('/:id', requireRoles('ADMIN'), async (req, res, next) => {
  try {
    const existing = await prisma.invoice.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return sendError(res, `Invoice with ID '${req.params.id}' not found.`, 404);
    }

    await prisma.invoice.delete({
      where: { id: req.params.id },
    });

    return sendSuccess(res, { id: req.params.id }, `Invoice '${existing.invoiceNumber}' deleted.`);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/billing/:id/payment
 * Record payment against an invoice using a database transaction (ADMIN, RECEPTIONIST only)
 */
router.post('/:id/payment', requireRoles('ADMIN', 'RECEPTIONIST'), async (req, res, next) => {
  try {
    const { paymentMethod, amountPaid } = req.body;

    // Execute atomic transaction for payment recording
    const updatedInvoice = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({
        where: { id: req.params.id },
      });

      if (!invoice) {
        throw new Error(`Invoice with ID '${req.params.id}' not found.`);
      }

      return tx.invoice.update({
        where: { id: req.params.id },
        data: {
          status: 'Paid',
          paymentMethod: paymentMethod || 'Cash',
          amountPaid: amountPaid ? Number(amountPaid) : invoice.totalLKR,
          paidAt: new Date(),
        },
      });
    });

    return sendSuccess(
      res,
      updatedInvoice,
      `Payment recorded successfully for invoice '${updatedInvoice.invoiceNumber}'.`
    );
  } catch (error) {
    if (error.message.includes('not found')) {
      return sendError(res, error.message, 404);
    }
    next(error);
  }
});

export default router;
