import { sendError } from '../utils/response.js';

export const notFoundHandler = (req, res, _next) => {
  return sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
};
