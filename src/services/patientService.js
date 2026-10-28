import { apiClient } from './api';

export const patientService = {
  async getAll(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiClient.get(`/patients${queryString}`);
  },

  async getById(id) {
    return apiClient.get(`/patients/${encodeURIComponent(id)}`);
  },

  async create(patientData) {
    return apiClient.post('/patients', patientData);
  },

  async update(id, patientData) {
    return apiClient.put(`/patients/${encodeURIComponent(id)}`, patientData);
  },

  async delete(id) {
    return apiClient.delete(`/patients/${encodeURIComponent(id)}`);
  },
};
