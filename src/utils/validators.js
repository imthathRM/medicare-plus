/**
 * Form validation helper functions
 */

export const validateEmail = (email) => {
  if (!email || !email.trim()) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) return 'Invalid email address format';
  return null;
};

export const validateRequired = (value, fieldName = 'Field') => {
  if (value === undefined || value === null || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} is required`;
  }
  return null;
};

export const validatePhone = (phone) => {
  if (!phone || !phone.trim()) return 'Phone number is required';
  // Allow international and local Sri Lankan formats (e.g. +94 77 123 4567 or 0771234567)
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  if (!phoneRegex.test(phone.trim().replace(/\s+/g, ''))) {
    return 'Enter a valid phone number (e.g., +94 77 123 4567)';
  }
  return null;
};

export const validateNumber = (value, fieldName = 'Value', min = 0) => {
  if (value === undefined || value === null || value === '') return `${fieldName} is required`;
  const num = Number(value);
  if (isNaN(num)) return `${fieldName} must be a number`;
  if (num < min) return `${fieldName} cannot be less than ${min}`;
  return null;
};
