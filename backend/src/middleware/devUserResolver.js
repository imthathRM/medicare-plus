/**
 * DEVELOPMENT-ONLY User Identification Resolver (Stage 5 Scaffolding)
 * 
 * IMPORTANT ARCHITECTURAL NOTE:
 * Full authentication and authorization (JWT tokens, secure user sessions,
 * password hashing, role-based access control) is strictly scheduled for Stage 7.
 * 
 * This middleware provides temporary mock user identification for development
 * and testing in Stage 5 so that per-user settings (such as independent Light/Dark
 * theme preferences) can be tested per individual user ID without using a single
 * shared global variable.
 * 
 * In this stage:
 * - A client can send `x-user-id` HTTP header (e.g. `x-user-id: doctor-01`)
 * - Or a query parameter `?userId=doctor-01`
 * - Defaults to `default-user` if unspecified.
 * 
 * DO NOT use this for production security. This is temporary scaffolding.
 */
export const devUserResolver = (req, res, next) => {
  const userId = req.headers['x-user-id'] || req.query.userId || 'default-user';
  
  // Attach dev user object to request
  req.devUser = {
    id: String(userId).trim(),
    isDevMock: true,
  };

  next();
};
