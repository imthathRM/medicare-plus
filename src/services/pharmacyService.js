import { apiClient } from './api';

export const pharmacyService = {
  async getAll(params = {}) {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'ALL') query.append('category', params.category);
    if (params.status && params.status !== 'ALL') query.append('status', params.status);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiClient.get(`/pharmacy${queryString}`);
  },

  async getById(id) {
    return apiClient.get(`/pharmacy/${encodeURIComponent(id)}`);
  },

  async create(medicineData) {
    const payload = {
      ...medicineData,
      stockQuantity: Number(medicineData.stockQuantity || medicineData.quantity || 0),
      reorderLevel: Number(medicineData.reorderLevel || medicineData.minThreshold || 50),
      unitPriceLKR: Number(medicineData.unitPriceLKR || medicineData.unitPrice || 0),
      dosageForm: medicineData.dosageForm || medicineData.form || 'Tablet',
    };
    return apiClient.post('/pharmacy', payload);
  },

  async update(id, medicineData) {
    return apiClient.put(`/pharmacy/${encodeURIComponent(id)}`, medicineData);
  },

  async adjustStock(id, payload) {
    // Accepts number (newQuantity or adjustment) or object { adjustment, newQuantity }
    const body = typeof payload === 'number'
      ? { newQuantity: payload }
      : payload;
    return apiClient.put(`/pharmacy/${encodeURIComponent(id)}/stock`, body);
  },

  async delete(id) {
    return apiClient.delete(`/pharmacy/${encodeURIComponent(id)}`);
  },
};
