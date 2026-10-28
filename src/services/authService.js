import { API_CONFIG } from './api';

/**
 * Authentication Service (Stage 7)
 * Communicates with backend Express /api/auth endpoints
 */
export const authService = {
  /**
   * Log in user with credentials
   */
  async login(email, password) {
    const response = await fetch(`${API_CONFIG.baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Authentication failed. Please verify your credentials.');
    }

    return data.data; // { token, user }
  },

  /**
   * Verify token and fetch current authenticated user profile
   */
  async getCurrentUser(token) {
    const response = await fetch(`${API_CONFIG.baseURL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Session expired or invalid.');
    }

    return data.data.user;
  },

  /**
   * Logout session
   */
  async logout(token) {
    if (!token) return;
    try {
      await fetch(`${API_CONFIG.baseURL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      // Ignore network errors on logout
    }
  },
};
