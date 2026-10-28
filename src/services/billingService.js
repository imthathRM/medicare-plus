import { apiClient } from './api';

export const billingService = {
  async getAll(params = {}) {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'ALL') query.append('status', params.status);
    if (params.patientId) query.append('patientId', params.patientId);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiClient.get(`/billing${queryString}`);
  },

  async getById(id) {
    return apiClient.get(`/billing/${encodeURIComponent(id)}`);
  },

  async create(invoiceData) {
    const total = Number(invoiceData.totalAmount || invoiceData.totalLKR || 0);
    const subtotal = Number(invoiceData.subtotal || invoiceData.subtotalLKR || total);
    const tax = Number(invoiceData.tax || invoiceData.taxLKR || 0);
    const paidAmount = Number(invoiceData.paidAmount || invoiceData.amountPaid || 0);

    const payload = {
      ...invoiceData,
      subtotalLKR: subtotal,
      taxLKR: tax,
      totalLKR: total,
      amountPaid: paidAmount,
    };
    return apiClient.post('/billing', payload);
  },

  async update(id, invoiceData) {
    return apiClient.put(`/billing/${encodeURIComponent(id)}`, invoiceData);
  },

  async recordPayment(id, paymentData) {
    const amount = typeof paymentData === 'object' ? paymentData.amountPaid || paymentData.amount : paymentData;
    const method = typeof paymentData === 'object' ? paymentData.paymentMethod || paymentData.method : 'Cash';
    return apiClient.post(`/billing/${encodeURIComponent(id)}/payment`, {
      amountPaid: amount ? Number(amount) : undefined,
      paymentMethod: method || 'Cash',
    });
  },

  async delete(id) {
    return apiClient.delete(`/billing/${encodeURIComponent(id)}`);
  },
};
