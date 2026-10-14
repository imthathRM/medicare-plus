import { delay, createApiResponse } from './api';
import { initialDoctors } from '../data/mockDoctors';

export const doctorService = {
  async getAll() {
    await delay();
    return createApiResponse(initialDoctors);
  },

  async getById(id) {
    await delay();
    const doc = initialDoctors.find((d) => d.id === id);
    if (!doc) throw new Error('Doctor not found');
    return createApiResponse(doc);
  },

  async create(doctorData) {
    await delay();
    return createApiResponse({ ...doctorData, id: `DOC-${Date.now()}` }, true, 'Doctor profile registered');
  },

  async update(id, doctorData) {
    await delay();
    return createApiResponse({ ...doctorData, id }, true, 'Doctor profile updated');
  },
};
