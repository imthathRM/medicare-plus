import { sendError } from '../utils/response.js';

export const errorHandler = (err, req, res, _next) => {
  // Safe server-side error logging
  console.error(`[Error] ${req.method} ${req.url}:`, err.message || err);

  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  
  // Safe generic message for 500 errors to prevent leaking internal database / system details
  const message = statusCode >= 500 
    ? 'An unexpected internal server error occurred. Please try again later.'
    : err.message || 'Request failed';

  return sendError(res, message, statusCode);
};
