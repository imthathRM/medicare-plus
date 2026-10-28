import { apiClient } from './api';

export const reportService = {
  async getSummaryMetrics() {
    return apiClient.get('/reports/summary');
  },

  async getMonthlyAppointmentTrends() {
    return apiClient.get('/reports/trends');
  },

  async getDepartmentPatientDistribution() {
    return apiClient.get('/reports/distribution');
  },
};
