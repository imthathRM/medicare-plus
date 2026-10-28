/**
 * MediCare Plus - Centralized API Service Foundation
 *
 * Provides a standardized HTTP client (`apiClient`) configured with:
 * - Base URL resolution from `VITE_API_URL` or fallback to `http://localhost:5000/api`
 * - Automatic JWT bearer token extraction from localStorage/sessionStorage
 * - Consistent error extraction and response normalization
 * - Dual compatibility helpers (`createApiResponse`, `delay`) for safe transitions
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
 * Retrieve the active JWT token from persistent or session storage
 */
export const getAuthToken = () => {
  try {
    return (
      localStorage.getItem('medicare_token') ||
      sessionStorage.getItem('medicare_token') ||
      null
    );
  } catch {
    return null;
  }
};

/**
 * Centralized HTTP Client
 */
export const apiClient = {
  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http')
      ? endpoint
      : `${API_CONFIG.baseURL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    const token = getAuthToken();

    const headers = {
      ...API_CONFIG.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };

    const config = {
      ...options,
      headers,
    };

    const response = await fetch(url, config);
    let json;
    try {
      json = await response.json();
    } catch {
      json = null;
    }

    if (!response.ok) {
      const errorMsg =
        json?.message ||
        json?.error ||
        `Request failed with status ${response.status} (${response.statusText})`;
      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = json;
      throw error;
    }

    return json;
  },

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  },

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  patch(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
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
