import { apiClient, createApiResponse } from './api';

const THEME_STORAGE_KEY = 'medicare_global_theme';

export const themeService = {
  /**
   * Fetch current theme setting from PostgreSQL with localStorage fallback
   */
  async getGlobalTheme() {
    try {
      const response = await apiClient.get('/settings/theme');
      const themeMode = response.data?.themeMode || response.themeMode;
      if (themeMode) {
        localStorage.setItem(THEME_STORAGE_KEY, themeMode);
        return createApiResponse({ themeMode });
      }
    } catch {
      // Fallback to local storage if network or unauthenticated
    }

    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      return createApiResponse({ themeMode: savedTheme === 'dark' ? 'dark' : 'light' });
    } catch {
      return createApiResponse({ themeMode: 'light' });
    }
  },

  /**
   * Update theme preference in PostgreSQL and localStorage
   */
  async updateGlobalTheme(themeMode, _currentUser) {
    const isDark = themeMode === 'dark';
    const normalizedMode = isDark ? 'dark' : 'light';

    // Optimistically update localStorage and HTML attribute
    try {
      localStorage.setItem(THEME_STORAGE_KEY, normalizedMode);
      document.documentElement.classList.toggle('dark', isDark);
      document.documentElement.setAttribute('data-theme', normalizedMode);
    } catch (err) {
      console.warn('Unable to persist theme to localStorage', err);
    }

    try {
      await apiClient.put('/settings/theme', { themeMode: normalizedMode });
    } catch (err) {
      console.warn('Theme backend sync failed, cached locally', err);
    }

    return createApiResponse(
      { themeMode: normalizedMode },
      true,
      `Hospital appearance successfully updated to ${isDark ? 'Dark' : 'Light'} mode.`
    );
  },

  /**
   * Fetch institutional hospital profile from PostgreSQL
   */
  async getHospitalProfile() {
    return apiClient.get('/settings/hospital');
  },

  /**
   * Update institutional hospital profile in PostgreSQL
   */
  async updateHospitalProfile(profileData) {
    return apiClient.put('/settings/hospital', profileData);
  },
};
