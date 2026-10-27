import { Router } from 'express';
import prisma from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';

const router = Router();

/**
 * GET /api/billing (or /api/invoices)
 * Retrieve all hospital bills & invoices from PostgreSQL
 */
router.get('/', async (req, res, next) => {
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

    return sendSuccess(res, invoices, `Retrieved ${invoices.length} billing invoice(s).`);
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

    return sendSuccess(res, invoice, 'Invoice retrieved.');
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/billing
 * Generate new invoice in PostgreSQL
 */
router.post('/', async (req, res, next) => {
  try {
    const data = req.body;
    if (!data || !data.patientName || !data.totalLKR) {
      return sendError(res, 'Patient name and total amount are required.', 400);
    }

    const newInvoice = await prisma.invoice.create({
      data: {
        id: data.id || `INV-${Date.now()}`,
        invoiceNumber: data.invoiceNumber || `INV-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        patientId: data.patientId || null,
        patientName: data.patientName,
        date: data.date || new Date().toISOString().slice(0, 10),
        dueDate: data.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
        subtotalLKR: Number(data.subtotalLKR || data.totalLKR),
        taxLKR: Number(data.taxLKR || 0),
        totalLKR: Number(data.totalLKR),
        status: data.status || 'Pending',
        paymentMethod: data.paymentMethod || null,
      },
    });

    return sendSuccess(res, newInvoice, 'Invoice generated successfully in PostgreSQL.', 201);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/billing/:id/payment
 * Record payment against an invoice using a database transaction
 */
router.post('/:id/payment', async (req, res, next) => {
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
