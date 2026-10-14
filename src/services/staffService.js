import { delay, createApiResponse } from './api';
import { initialStaff } from '../data/mockStaff';

export const staffService = {
  async getAll() {
    await delay();
    return createApiResponse(initialStaff);
  },

  async create(staffData) {
    await delay();
    return createApiResponse({ ...staffData, id: `STF-${Date.now()}` }, true, 'Staff member registered');
  },

  async update(id, staffData) {
    await delay();
    return createApiResponse({ ...staffData, id }, true, 'Staff details updated');
  },
};
