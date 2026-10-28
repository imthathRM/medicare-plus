import { apiClient } from './api';

export const departmentService = {
  async getAll() {
    return apiClient.get('/departments');
  },

  async getById(id) {
    return apiClient.get(`/departments/${encodeURIComponent(id)}`);
  },

  async create(deptData) {
    const payload = {
      ...deptData,
      doctorCount: Number(deptData.doctorCount) || 0,
      bedCount: Number(deptData.bedCount) || 0,
    };
    return apiClient.post('/departments', payload);
  },

  async update(id, deptData) {
    const payload = {
      ...deptData,
      doctorCount: deptData.doctorCount !== undefined ? Number(deptData.doctorCount) : undefined,
      bedCount: deptData.bedCount !== undefined ? Number(deptData.bedCount) : undefined,
    };
    return apiClient.put(`/departments/${encodeURIComponent(id)}`, payload);
  },

  async delete(id) {
    return apiClient.delete(`/departments/${encodeURIComponent(id)}`);
  },
};
