import { apiClient } from './api';

export const admissionService = {
  async getAll(params = {}) {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'ALL') query.append('status', params.status);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiClient.get(`/admissions${queryString}`);
  },

  async getById(id) {
    return apiClient.get(`/admissions/${encodeURIComponent(id)}`);
  },

  async create(admissionData) {
    return apiClient.post('/admissions', admissionData);
  },

  async update(id, admissionData) {
    return apiClient.put(`/admissions/${encodeURIComponent(id)}`, admissionData);
  },

  async discharge(id, dischargeDate, summary) {
    return apiClient.put(`/admissions/${encodeURIComponent(id)}`, {
      status: 'Discharged',
      dischargeDate: dischargeDate || new Date().toISOString().slice(0, 10),
      dischargeNotes: summary || 'Discharged in stable condition.',
    });
  },

  async delete(id) {
    return apiClient.delete(`/admissions/${encodeURIComponent(id)}`);
  },
};
