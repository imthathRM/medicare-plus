import { delay, createApiResponse } from './api';
import { initialInvoices } from '../data/mockInvoices';

export const billingService = {
  async getAll() {
    await delay();
    return createApiResponse(initialInvoices);
  },

  async create(invoiceData) {
    await delay();
    return createApiResponse({ ...invoiceData, id: `INV-${Date.now()}` }, true, 'Invoice generated successfully');
  },

  async recordPayment(id, paymentData) {
    await delay();
    return createApiResponse({ id, ...paymentData, status: 'Paid' }, true, 'Payment recorded successfully');
  },
};
