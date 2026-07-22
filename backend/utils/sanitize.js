import xss from 'xss';

// ── XSS Options ───────────────────────────────────────────────────────────────
const xssOptions = {
  whiteList: {}, // No tags allowed at all
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script', 'style', 'iframe', 'form', 'object'],
};

/**
 * Sanitize a single string value against XSS.
 * @param {string} value
 * @returns {string}
 */
export function sanitizeString(value) {
  if (typeof value !== 'string') return value;
  // 1. XSS stripping
  let clean = xss(value, xssOptions);
  // 2. Normalize whitespace
  clean = clean.replace(/\s+/g, ' ').trim();
  return clean;
}

/**
 * Recursively sanitize all string values in an object.
 * @param {object} obj
 * @returns {object}
 */
export function sanitizeObject(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitizeObject(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Sanitize an array of strings.
 * @param {string[]} arr
 * @returns {string[]}
 */
export function sanitizeArray(arr) {
  if (!Array.isArray(arr)) return arr;
  return arr.map((item) => (typeof item === 'string' ? sanitizeString(item) : item));
}
