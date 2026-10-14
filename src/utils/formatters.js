/**
 * Formatting utilities for MediCare Plus Hospital Management System
 * Currency: Sri Lankan Rupees (LKR)
 */

export const formatLKR = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return 'LKR 0.00';
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount).replace('LKR', 'LKR ');
};

export const formatDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

export const formatTime = (timeString) => {
  if (!timeString) return '—';
  // Handle HH:mm or full ISO date
  if (timeString.includes(':') && timeString.length <= 8) {
    const [hours, minutes] = timeString.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedHours = h % 12 || 12;
    return `${formattedHours}:${minutes} ${ampm}`;
  }
  const date = new Date(timeString);
  if (isNaN(date.getTime())) return timeString;
  return new Intl.DateTimeFormat('en-GB', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(date);
};

export const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return '—';
  return `${formatDate(dateTimeString)} at ${formatTime(dateTimeString)}`;
};

export const calculateAge = (dobString) => {
  if (!dobString) return '';
  const dob = new Date(dobString);
  const diffMs = Date.now() - dob.getTime();
  const ageDate = new Date(diffMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

export const generateId = (prefix = 'ID') => {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${randomNum}`;
};
