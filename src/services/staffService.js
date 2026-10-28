import { apiClient } from './api';

export const staffService = {
  async getAll(params = {}) {
    const query = new URLSearchParams();
    if (params.department && params.department !== 'ALL') query.append('department', params.department);
    if (params.role && params.role !== 'ALL') query.append('role', params.role);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiClient.get(`/staff${queryString}`);
  },

  async getById(id) {
    return apiClient.get(`/staff/${encodeURIComponent(id)}`);
  },

  async create(staffData) {
    return apiClient.post('/staff', staffData);
  },

  async update(id, staffData) {
    return apiClient.put(`/staff/${encodeURIComponent(id)}`, staffData);
  },

  async delete(id) {
    return apiClient.delete(`/staff/${encodeURIComponent(id)}`);
  },
};
