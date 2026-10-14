import { delay, createApiResponse } from './api';
import { initialMedicines } from '../data/mockMedicines';

export const pharmacyService = {
  async getAll() {
    await delay();
    return createApiResponse(initialMedicines);
  },

  async create(medicineData) {
    await delay();
    return createApiResponse({ ...medicineData, id: `MED-${Date.now()}` }, true, 'Medicine item added to inventory');
  },

  async update(id, medicineData) {
    await delay();
    return createApiResponse({ ...medicineData, id }, true, 'Inventory item updated');
  },

  async adjustStock(id, newQuantity) {
    await delay();
    return createApiResponse({ id, quantity: newQuantity }, true, 'Stock quantity updated');
  },
};
