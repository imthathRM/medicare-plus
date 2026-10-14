/**
 * MediCare Plus - Centralized API Service Foundation
 * 
 * In this Part 1 Frontend Foundation phase, this service layer mimics async
 * API interactions with local simulated latency and standardized response envelopes.
 * When real backend endpoints are wired in Part 2, swap endpoints here without
 * touching UI components.
 */

export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
};

/**
 * Standard simulated API delay helper
 */
export const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Standard API response wrapper
 */
export const createApiResponse = (data, success = true, message = 'Success') => ({
  success,
  message,
  data,
  timestamp: new Date().toISOString(),
});
