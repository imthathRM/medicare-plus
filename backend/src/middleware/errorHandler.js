import { sendError } from '../utils/response.js';

export const errorHandler = (err, req, res, _next) => {
  console.error(`[Error] ${req.method} ${req.url}:`, err.message || err);

  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  const message = err.message || 'An unexpected internal server error occurred';

  return sendError(res, message, statusCode, err.stack);
};
