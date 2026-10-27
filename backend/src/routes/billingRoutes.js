import { Router } from 'express';
import { invoices } from '../data/memoryStore.js';
import { sendSuccess, sendError } from '../utils/response.js';

const router = Router();

/**
 * GET /api/billing (or /api/invoices)
 * Retrieve all hospital bills & invoices
 */
router.get('/', (req, res) => {
  const { status, patientId } = req.query;
  let result = [...invoices];

  if (status) {
    result = result.filter(
      (inv) => inv.status.toLowerCase() === String(status).toLowerCase()
    );
  }

  if (patientId) {
    result = result.filter((inv) => inv.patientId === String(patientId));
  }

  return sendSuccess(res, result, `Retrieved ${result.length} billing invoice(s).`);
});

/**
 * GET /api/billing/:id
 * Retrieve invoice by ID
 */
router.get('/:id', (req, res) => {
  const invoice = invoices.find((inv) => inv.id === req.params.id);
  if (!invoice) {
    return sendError(res, `Invoice with ID '${req.params.id}' not found.`, 404);
  }
  return sendSuccess(res, invoice, 'Invoice retrieved.');
});

/**
 * POST /api/billing
 * Generate new invoice
 */
router.post('/', (req, res) => {
  const data = req.body;
  if (!data || !data.patientName || !data.totalLKR) {
    return sendError(res, 'Patient name and total amount are required.', 400);
  }

  const newInvoice = {
    id: `INV-${Date.now()}`,
    invoiceNumber: `INV-2026-${Math.floor(10000 + Math.random() * 90000)}`,
    patientId: data.patientId || `PAT-${Date.now()}`,
    patientName: data.patientName,
    date: data.date || new Date().toISOString().slice(0, 10),
    dueDate: data.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    subtotalLKR: Number(data.subtotalLKR || data.totalLKR),
    taxLKR: Number(data.taxLKR || 0),
    totalLKR: Number(data.totalLKR),
    status: data.status || 'Pending',
    paymentMethod: data.paymentMethod || null,
  };

  invoices.unshift(newInvoice);
  return sendSuccess(res, newInvoice, 'Invoice generated successfully (in-memory).', 201);
});

/**
 * POST /api/billing/:id/payment
 * Record payment against an invoice
 */
router.post('/:id/payment', (req, res) => {
  const invoice = invoices.find((inv) => inv.id === req.params.id);
  if (!invoice) {
    return sendError(res, `Invoice with ID '${req.params.id}' not found.`, 404);
  }

  const { paymentMethod, amountPaid } = req.body;
  invoice.status = 'Paid';
  invoice.paymentMethod = paymentMethod || 'Cash';
  if (amountPaid) invoice.amountPaid = Number(amountPaid);
  invoice.paidAt = new Date().toISOString();

  return sendSuccess(res, invoice, `Payment recorded successfully for invoice '${invoice.invoiceNumber}'.`);
});

export default router;
