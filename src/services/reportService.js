import { delay, createApiResponse } from './api';

export const reportService = {
  async getSummaryMetrics() {
    await delay();
    return createApiResponse({
      totalPatients: 1428,
      totalDoctors: 48,
      todayAppointments: 42,
      activeAdmissions: 28,
      monthlyRevenueLKR: 8750000,
      bedOccupancyRate: 78.5,
    });
  },

  async getMonthlyAppointmentTrends() {
    await delay();
    return createApiResponse([
      { month: 'May', completed: 620, cancelled: 45, newRegistrations: 110 },
      { month: 'Jun', completed: 710, cancelled: 52, newRegistrations: 135 },
      { month: 'Jul', completed: 780, cancelled: 38, newRegistrations: 142 },
      { month: 'Aug', completed: 840, cancelled: 40, newRegistrations: 160 },
      { month: 'Sep', completed: 890, cancelled: 48, newRegistrations: 175 },
      { month: 'Oct', completed: 940, cancelled: 34, newRegistrations: 190 },
    ]);
  },

  async getDepartmentPatientDistribution() {
    await delay();
    return createApiResponse([
      { name: 'Cardiology', patients: 380, color: '#0284c7' },
      { name: 'General Surgery', patients: 290, color: '#0d9488' },
      { name: 'Pediatrics', patients: 260, color: '#3b82f6' },
      { name: 'Orthopedics', patients: 220, color: '#10b981' },
      { name: 'Neurology', patients: 170, color: '#f59e0b' },
      { name: 'Gynecology', patients: 190, color: '#ec4899' },
      { name: 'Others', patients: 110, color: '#64748b' },
    ]);
  },
};
