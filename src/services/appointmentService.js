import { delay, createApiResponse } from './api';
import { initialAppointments } from '../data/mockAppointments';

export const appointmentService = {
  async getAll() {
    await delay();
    return createApiResponse(initialAppointments);
  },

  async create(appointmentData) {
    await delay();
    return createApiResponse({ ...appointmentData, id: `APT-${Date.now()}` }, true, 'Appointment scheduled');
  },

  async updateStatus(id, status) {
    await delay();
    return createApiResponse({ id, status }, true, `Appointment marked as ${status}`);
  },

  async cancel(id, reason = '') {
    await delay();
    return createApiResponse({ id, status: 'Cancelled', reason }, true, 'Appointment cancelled');
  },
};
