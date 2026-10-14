import { delay, createApiResponse } from './api';
import { initialAdmissions } from '../data/mockAdmissions';

export const admissionService = {
  async getAll() {
    await delay();
    return createApiResponse(initialAdmissions);
  },

  async create(admissionData) {
    await delay();
    return createApiResponse({ ...admissionData, id: `ADM-${Date.now()}` }, true, 'Patient admitted successfully');
  },

  async discharge(id, dischargeDate, summary) {
    await delay();
    return createApiResponse({ id, status: 'Discharged', dischargeDate, summary }, true, 'Patient discharged successfully');
  },
};
