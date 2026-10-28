import { apiClient } from './api';

export const appointmentService = {
  async getAll(params = {}) {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'ALL') query.append('status', params.status);
    if (params.date) query.append('date', params.date);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiClient.get(`/appointments${queryString}`);
  },

  async getById(id) {
    return apiClient.get(`/appointments/${encodeURIComponent(id)}`);
  },

  async create(appointmentData) {
    const payload = {
      ...appointmentData,
      feeLKR: Number(appointmentData.feeLKR || appointmentData.fee || 3500),
    };
    return apiClient.post('/appointments', payload);
  },

  async update(id, appointmentData) {
    return apiClient.put(`/appointments/${encodeURIComponent(id)}`, appointmentData);
  },

  async updateStatus(id, status) {
    return apiClient.put(`/appointments/${encodeURIComponent(id)}`, { status });
  },

  async cancel(id, _reason = '') {
    return apiClient.put(`/appointments/${encodeURIComponent(id)}`, { status: 'Cancelled' });
  },

  async delete(id) {
    return apiClient.delete(`/appointments/${encodeURIComponent(id)}`);
  },
};
