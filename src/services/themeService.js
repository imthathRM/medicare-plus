import { delay, createApiResponse } from './api';

const THEME_STORAGE_KEY = 'medicare_global_theme';

export const themeService = {
  /**
   * Fetch current global hospital theme setting
   */
  async getGlobalTheme() {
    await delay(50);
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      return createApiResponse({ themeMode: savedTheme === 'dark' ? 'dark' : 'light' });
    } catch {
      return createApiResponse({ themeMode: 'light' });
    }
  },

  /**
   * Update hospital-wide global theme (Restricted to authorized administrators)
   * 
   * Pre-configured for future Node.js/Express backend integration:
   * PUT /api/settings/theme
   * Protected with JWT Admin Authorization
   */
  async updateGlobalTheme(themeMode, currentUser) {
    await delay(50);

    // Verify authorized administrator rights
    const isAdmin =
      !currentUser ||
      currentUser.role === 'Hospital Administrator' ||
      currentUser.role === 'Superadmin' ||
      currentUser.role === 'admin';

    if (!isAdmin) {
      throw new Error('Unauthorized: Only authorized hospital administrators can modify system theme settings.');
    }

    try {
      localStorage.setItem(THEME_STORAGE_KEY, themeMode);
    } catch (err) {
      console.warn('Unable to persist theme to localStorage', err);
    }

    return createApiResponse(
      { themeMode },
      true,
      `Hospital-wide appearance successfully updated to ${themeMode === 'dark' ? 'Dark' : 'Light'} mode.`
    );
  },
};
