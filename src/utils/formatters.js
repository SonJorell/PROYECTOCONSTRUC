/**
 * Formatea un número como moneda CLP/USD.
 * @param {number} value
 * @param {string} currency - 'CLP' o 'USD'
 */
export const formatCurrency = (value, currency = 'CLP') => {
  if (value == null || isNaN(value)) return '$0';
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Formatea un número con separadores de miles.
 */
export const formatNumber = (value) => {
  if (value == null || isNaN(value)) return '0';
  return new Intl.NumberFormat('es-CL').format(value);
};

/**
 * Formatea una fecha ISO a formato legible.
 */
export const formatDate = (isoString) => {
  if (!isoString) return '—';
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoString));
};

/**
 * Trunca un texto a N caracteres con ellipsis.
 */
export const truncate = (text, maxLength = 40) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '…' : text;
};

/**
 * Capitaliza la primera letra de cada palabra.
 */
export const titleCase = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};
