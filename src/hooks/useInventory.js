import { useState, useEffect, useCallback } from 'react';
import { fetchProducts, fetchKPIs } from '../services/inventoryService';
import { useDebounce } from './useDebounce';
import { SEARCH_DEBOUNCE_MS } from '../utils/constants';

/**
 * Hook principal para la gestión de inventario.
 * Encapsula: paginación, búsqueda, filtros, KPIs.
 */
export const useInventory = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [businessLine, setBusinessLine] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [kpis, setKpis] = useState({
    totalProducts: 0,
    totalStock: 0,
    criticalStock: 0,
    inventoryValue: 0,
    outOfStock: 0,
  });

  const debouncedSearch = useDebounce(searchQuery, SEARCH_DEBOUNCE_MS);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await fetchProducts({
        page: currentPage,
        search: debouncedSearch,
        businessLine,
      });

      setData(result.data);
      setTotalPages(result.totalPages);
      setTotalCount(result.count);

    } catch (err) {
      console.error('Error al cargar inventario:', err.message);
      setError(err.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, businessLine]);

  const loadKPIs = useCallback(async () => {
    try {
      const kpiData = await fetchKPIs();
      setKpis(kpiData);
    } catch (err) {
      console.warn('KPIs no disponibles:', err.message);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    loadKPIs();
  }, [loadKPIs]);

  // Reset de página al cambiar filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, businessLine]);

  const refresh = useCallback(() => {
    loadData();
    loadKPIs();
  }, [loadData, loadKPIs]);

  return {
    data,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    businessLine,
    setBusinessLine,
    currentPage,
    setCurrentPage,
    totalPages,
    totalCount,
    kpis,
    refresh,
  };
};
