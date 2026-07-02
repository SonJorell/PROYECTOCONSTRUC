import { useState, useEffect, useRef } from 'react';

/**
 * Hook de debounce — retrasa la actualización de un valor.
 * Ideal para campos de búsqueda que disparan queries a BD.
 * @param {*} value - El valor a debounce
 * @param {number} delay - Milisegundos de retraso
 */
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};
