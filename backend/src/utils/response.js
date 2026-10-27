/**
 * Standard API Response Envelope
 * Matches frontend createApiResponse contract in src/services/api.js:
 * { success: boolean, message: string, data: any, timestamp: string }
 */
export const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

export const sendError = (res, message = 'Internal Server Error', statusCode = 500, details = null) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };

  if (details && process.env.NODE_ENV !== 'production') {
    response.details = details;
  }

  return res.status(statusCode).json(response);
};
