import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import { config } from '../config/environment.js';
import { authenticateToken, requireRoles } from '../middleware/authMiddleware.js';
import { loginRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

/**
 * POST /api/auth/login
 * Public endpoint protected by rate limiter
 */
router.post('/login', loginRateLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required.',
        error: 'VALIDATION_ERROR',
        data: null,
      });
    }

    if (!password || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Password is required.',
        error: 'VALIDATION_ERROR',
        data: null,
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Query user in PostgreSQL
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Uniform response to prevent username enumeration
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password.',
        error: 'INVALID_CREDENTIALS',
        data: null,
      });
    }

    // Verify password hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password.',
        error: 'INVALID_CREDENTIALS',
        data: null,
      });
    }

    // Check account status
    if (user.status !== 'Active') {
      return res.status(403).json({
        success: false,
        message: `Account is currently ${user.status}. Please contact the hospital administrator.`,
        error: 'ACCOUNT_INACTIVE',
        data: null,
      });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Generate JWT Token
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const token = jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    });

    return res.status(200).json({
      success: true,
      message: 'Authentication successful.',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          avatar: user.avatar,
          status: user.status,
          lastLogin: new Date().toISOString(),
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/auth/me
 * Protected: Retrieves profile of currently authenticated user
 */
router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        avatar: true,
        status: true,
        lastLogin: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Authenticated user record not found.',
        error: 'USER_NOT_FOUND',
        data: null,
      });
    }

    if (user.status !== 'Active') {
      return res.status(403).json({
        success: false,
        message: `Account is ${user.status}. Session invalidated.`,
        error: 'ACCOUNT_INACTIVE',
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/logout
 * Protected: Invalidate current user session
 */
router.post('/logout', authenticateToken, (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'User successfully logged out.',
    data: null,
  });
});

/**
 * GET /api/auth/users
 * Protected: ADMIN only user directory
 */
router.get('/users', authenticateToken, requireRoles('ADMIN'), async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        status: true,
        lastLogin: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/users
 * Protected: ADMIN only creation of new system users with specific roles
 */
router.post('/users', authenticateToken, requireRoles('ADMIN'), async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
        error: 'VALIDATION_ERROR',
        data: null,
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check existing email
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email address already exists.',
        error: 'EMAIL_EXISTS',
        data: null,
      });
    }

    const validRoles = ['ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PHARMACIST'];
    const assignedRole = validRoles.includes((role || '').toUpperCase())
      ? role.toUpperCase()
      : 'RECEPTIONIST';

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: passwordHash,
        role: assignedRole,
        phone: phone || null,
        status: 'Active',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        status: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'User created successfully.',
      data: newUser,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
