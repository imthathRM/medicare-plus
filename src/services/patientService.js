import { delay, createApiResponse } from './api';
import { initialPatients } from '../data/mockPatients';

export const patientService = {
  async getAll() {
    await delay();
    return createApiResponse(initialPatients);
  },

  async getById(id) {
    await delay();
    const patient = initialPatients.find((p) => p.id === id);
    if (!patient) throw new Error('Patient not found');
    return createApiResponse(patient);
  },

  async create(patientData) {
    await delay();
    return createApiResponse({ ...patientData, id: `PAT-${Date.now()}` }, true, 'Patient registered successfully');
  },

  async update(id, patientData) {
    await delay();
    return createApiResponse({ ...patientData, id }, true, 'Patient details updated successfully');
  },

  async delete(id) {
    await delay();
    return createApiResponse({ id }, true, 'Patient record archived');
  },
};
