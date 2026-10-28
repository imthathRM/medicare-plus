import { Router } from 'express';
import prisma from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { authenticateToken, requireRoles, optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * ==============================================================================
 * User Theme Preference Endpoints (PostgreSQL Backed via Prisma)
 * ==============================================================================
 *
 * Each authenticated user independently selects Light or Dark Theme.
 * Authenticated user identity is derived from verified JWT token.
 * Accepts ONLY 'light' or 'dark'.
 *
 * Each user ID has its own isolated record in the `user_settings` table.
 * Themes are NOT shared across users globally.
 * ==============================================================================
 */

/**
 * GET /api/settings/theme
 * Retrieve current user's theme preference from PostgreSQL.
 */
router.get('/theme', optionalAuth, async (req, res, next) => {
  try {
    const userId = req.user?.id || req.devUser?.id || 'default-user';

    const setting = await prisma.userSetting.findUnique({
      where: { userId },
    });

    const themeMode = setting?.themeMode || 'light';

    return sendSuccess(
      res,
      {
        userId,
        themeMode,
        isAuthenticated: !!req.user,
      },
      `Theme preference for user '${userId}' retrieved successfully.`
    );
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/settings/theme
 * Update theme preference for current user in PostgreSQL.
 * Accepts only 'light' or 'dark'.
 */
router.put('/theme', optionalAuth, async (req, res, next) => {
  try {
    const userId = req.user?.id || req.devUser?.id || 'default-user';
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

    // Persist per-user preference in PostgreSQL via upsert
    const updated = await prisma.userSetting.upsert({
      where: { userId },
      update: { themeMode: requestedTheme },
      create: { userId, themeMode: requestedTheme },
    });

    return sendSuccess(
      res,
      {
        userId: updated.userId,
        themeMode: updated.themeMode,
        isAuthenticated: !!req.user,
      },
      `Theme preference for user '${userId}' successfully updated to '${updated.themeMode}'.`
    );
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/settings/hospital
 * Retrieve institutional hospital profile from PostgreSQL.
 */
router.get('/hospital', async (req, res, next) => {
  try {
    let profile = await prisma.hospitalProfile.findUnique({
      where: { id: 'default-hospital' },
    });

    if (!profile) {
      profile = await prisma.hospitalProfile.create({
        data: {
          id: 'default-hospital',
          name: 'MediCare Plus Hospital',
          currency: 'LKR',
          timezone: 'Asia/Colombo (UTC+05:30)',
          operatingBeds: 180,
          operatingTheaters: 6,
          icuBeds: 16,
        },
      });
    }

    return sendSuccess(res, profile, 'Hospital profile retrieved successfully.');
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/settings/hospital
 * Update institutional hospital profile in PostgreSQL (ADMIN only).
 */
router.put('/hospital', authenticateToken, requireRoles('ADMIN'), async (req, res, next) => {
  try {
    const updates = req.body;
    if (!updates || typeof updates !== 'object') {
      return sendError(res, 'Invalid payload for hospital profile update.', 400);
    }

    const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...allowedUpdates } = updates;

    const profile = await prisma.hospitalProfile.upsert({
      where: { id: 'default-hospital' },
      update: allowedUpdates,
      create: { id: 'default-hospital', ...allowedUpdates },
    });

    return sendSuccess(res, profile, 'Hospital profile updated successfully in PostgreSQL.');
  } catch (error) {
    next(error);
  }
});

export default router;
