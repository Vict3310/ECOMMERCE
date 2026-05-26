/**
 * SECURITY UTILITIES - IFECO GADGETS HARDENING
 * Purpose: FBI-Grade Input Validation & XSS Prevention
 */

export const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  // Remove script tags, angle brackets, and potentially dangerous characters
  return str
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
    .replace(/[<>]/g, "")
    .trim();
};

export const validateEmail = (email) => {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
};

export const validatePhone = (phone) => {
  // Supports international format e.g. +234... or local 081...
  const regex = /^\+?(\d{1,3})?[-. ]?\(?(\d{3})\)?[-. ]?(\d{3})[-. ]?(\d{4})$/;
  return regex.test(phone) || (phone.length >= 10 && phone.length <= 15 && /^\+?\d+$/.test(phone));
};

export const validateName = (name) => {
  // At least 2 characters, only letters, spaces, and hyphens/apostrophes
  const regex = /^[a-zA-Z\s\-']{2,50}$/;
  return regex.test(name);
};

export const sanitizeObject = (obj) => {
  const sanitized = {};
  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === 'string') {
      sanitized[key] = sanitizeString(obj[key]);
    } else {
      sanitized[key] = obj[key];
    }
  });
  return sanitized;
};
