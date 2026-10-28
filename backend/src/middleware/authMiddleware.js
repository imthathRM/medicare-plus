import jwt from 'jsonwebtoken';
import { config } from '../config/environment.js';

/**
 * Reusable JWT Authentication Middleware
 * 
 * Extracts and verifies the Bearer token from the HTTP Authorization header.
 * Attaches the verified user payload { id, email, name, role } to `req.user`.
 * 
 * Returns:
 * - 401 Unauthorized if token is missing, expired, or invalid.
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.',
      data: null,
    });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization format. Format must be "Bearer <token>".',
      data: null,
    });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Authentication session expired. Please log in again.',
        error: 'TOKEN_EXPIRED',
        data: null,
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token.',
      error: 'INVALID_TOKEN',
      data: null,
    });
  }
};

/**
 * Role-Based Access Control (RBAC) Middleware Factory
 * 
 * Enforces that the authenticated user possesses one of the allowed roles.
 * Note: 'ADMIN' is granted universal access across all modules.
 * 
 * Returns:
 * - 401 if unauthenticated.
 * - 403 Forbidden if user lacks required role.
 */
export const requireRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before checking permissions.',
        data: null,
      });
    }

    const userRole = (req.user.role || '').toUpperCase();
    const normalizedAllowed = allowedRoles.map((r) => r.toUpperCase());

    // ADMIN has universal permission
    if (userRole === 'ADMIN' || normalizedAllowed.includes(userRole)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access forbidden: Role '${req.user.role}' does not have permission to access this resource.`,
      error: 'FORBIDDEN_ROLE',
      data: null,
    });
  };
};

/**
 * Optional Authentication Middleware
 * 
 * Decodes token if present without rejecting the request if absent.
 */
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader) return next();

  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    try {
      const decoded = jwt.verify(parts[1], config.jwtSecret);
      req.user = {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
      };
    } catch {
      // Ignore token decode failures for optional auth
    }
  }
  next();
};
