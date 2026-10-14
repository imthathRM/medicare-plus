import { delay, createApiResponse } from './api';
import { initialDepartments } from '../data/mockDepartments';

export const departmentService = {
  async getAll() {
    await delay();
    return createApiResponse(initialDepartments);
  },

  async create(deptData) {
    await delay();
    return createApiResponse({ ...deptData, id: `DEP-${Date.now()}` }, true, 'Department added successfully');
  },

  async update(id, deptData) {
    await delay();
    return createApiResponse({ ...deptData, id }, true, 'Department updated successfully');
  },
};
