import { Router } from 'express';
import { userThemes, hospitalProfile } from '../data/memoryStore.js';
import { sendSuccess, sendError } from '../utils/response.js';

const router = Router();

/**
 * ==============================================================================
 * User Theme Preference Endpoints
 * ==============================================================================
 * 
 * Requirement:
 * Each authenticated user independently selects Light or Dark Theme.
 * Accepts ONLY 'light' or 'dark'.
 * 
 * NOTE (Stage 5 Dev-Only Scaffolding):
 * Full JWT authentication is scheduled for Stage 7.
 * For now, the user ID is resolved via the `devUserResolver` middleware
 * (checking `x-user-id` HTTP header or `?userId=` query parameter,
 * defaulting to 'default-user').
 * 
 * Each user ID has its own isolated entry in the in-memory `userThemes` Map.
 * Themes are NOT shared across users globally.
 * ==============================================================================
 */

/**
 * GET /api/settings/theme
 * Retrieve the current user's theme preference.
 */
router.get('/theme', (req, res) => {
  const userId = req.devUser?.id || 'default-user';
  const themeMode = userThemes.get(userId) || 'light';

  return sendSuccess(
    res,
    {
      userId,
      themeMode,
      isDevelopmentStub: true,
    },
    `Theme preference for user '${userId}' retrieved successfully.`
  );
});

/**
 * PUT /api/settings/theme
 * Request a theme preference update for the current user.
 * Accepts only 'light' or 'dark'.
 */
router.put('/theme', (req, res) => {
  const userId = req.devUser?.id || 'default-user';
  const { themeMode, theme } = req.body;
  const requestedTheme = themeMode || theme;

  // Strict validation: must be 'light' or 'dark'
  if (!requestedTheme || (requestedTheme !== 'light' && requestedTheme !== 'dark')) {
    return sendError(
      res,
      "Invalid theme preference. Theme mode must be strictly 'light' or 'dark'.",
      400
    );
  }

  // Update in-memory user preference map
  userThemes.set(userId, requestedTheme);

  return sendSuccess(
    res,
    {
      userId,
      themeMode: requestedTheme,
      isDevelopmentStub: true,
    },
    `Theme preference for user '${userId}' successfully updated to '${requestedTheme}'.`
  );
});

/**
 * GET /api/settings/hospital
 * Retrieve institutional hospital profile.
 */
router.get('/hospital', (req, res) => {
  return sendSuccess(res, hospitalProfile, 'Hospital profile retrieved successfully.');
});

/**
 * PUT /api/settings/hospital
 * Update institutional hospital profile (Stage 5 in-memory).
 */
router.put('/hospital', (req, res) => {
  const updates = req.body;
  if (!updates || typeof updates !== 'object') {
    return sendError(res, 'Invalid payload for hospital profile update.', 400);
  }

  Object.assign(hospitalProfile, updates);
  return sendSuccess(res, hospitalProfile, 'Hospital profile updated successfully (in-memory).');
});

export default router;
