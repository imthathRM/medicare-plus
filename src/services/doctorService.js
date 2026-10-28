import { apiClient } from './api';

export const doctorService = {
  async getAll(params = {}) {
    const query = new URLSearchParams();
    if (params.department && params.department !== 'ALL') query.append('department', params.department);
    if (params.status && params.status !== 'ALL') query.append('status', params.status);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiClient.get(`/doctors${queryString}`);
  },

  async getById(id) {
    return apiClient.get(`/doctors/${encodeURIComponent(id)}`);
  },

  async create(doctorData) {
    const payload = {
      ...doctorData,
      specialization: doctorData.specialization || doctorData.specialty || '',
      consultationFeeLKR: Number(doctorData.consultationFeeLKR || doctorData.consultationFee || 3500),
      consultationRoom: doctorData.consultationRoom || doctorData.roomNumber || 'OPD-101',
    };
    return apiClient.post('/doctors', payload);
  },

  async update(id, doctorData) {
    const payload = {
      ...doctorData,
      specialization: doctorData.specialization || doctorData.specialty,
      consultationFeeLKR: doctorData.consultationFeeLKR !== undefined || doctorData.consultationFee !== undefined
        ? Number(doctorData.consultationFeeLKR || doctorData.consultationFee)
        : undefined,
      consultationRoom: doctorData.consultationRoom || doctorData.roomNumber,
    };
    return apiClient.put(`/doctors/${encodeURIComponent(id)}`, payload);
  },

  async delete(id) {
    return apiClient.delete(`/doctors/${encodeURIComponent(id)}`);
  },
};
