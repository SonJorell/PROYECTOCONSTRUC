import React, { useState, useCallback } from 'react';
import { FiSearch, FiFilter, FiEye, FiCamera, FiPackage, FiAlertTriangle, FiXCircle, FiLock } from 'react-icons/fi';
import { useInventory } from '../hooks/useInventory';
import { BUSINESS_LINES } from '../utils/constants';
import { formatNumber, formatCurrency, titleCase } from '../utils/formatters';
import ScannerModal from '../components/scanner/ScannerModal';
import ProductDetailModal from '../components/products/ProductDetailModal';

const STATUS_FILTERS = [
  { key: 'all',          label: 'Todos',      icon: FiPackage,        color: 'text-slate-300' },
  { key: 'out_of_stock', label: 'Agotados',   icon: FiXCircle,        color: 'text-red-400' },
  { key: 'critical',     label: 'Críticos',   icon: FiAlertTriangle,  color: 'text-amber-400' },
  { key: 'blocked',      label: 'Bloqueados', icon: FiLock,           color: 'text-orange-400' },
];

const InventoryPage = () => {
  const {
    data, loading, searchQuery, setSearchQuery,
    businessLine, setBusinessLine,
    currentPage, setCurrentPage, totalPages, totalCount,
    refresh,
  } = useInventory();

  const [stockFilter, setStockFilter] = useState('all');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Filtro de stock local sobre la página actual
  const filteredData = data.filter(item => {
    if (stockFilter === 'out_of_stock') return item.current_stock <= 0;
    if (stockFilter === 'critical') return item.current_stock > 0 && item.current_stock < 10;
    if (stockFilter === 'blocked') return item.blocked_stock > 0;
    return true;
  });

  const handleViewProduct = useCallback((product) => {
    setSelectedProduct(product);
    setDetailOpen(true);
  }, []);

  const handleScanResult = useCallback((product) => {
    setScannerOpen(false);
    if (product) { setSelectedProduct(product); setDetailOpen(true); }
  }, []);

  const getStockBadge = (stock) => {
    if (stock <= 0) return <span className="badge bg-red-500/15 text-red-400">Agotado</span>;
    if (stock < 10) return <span className="badge bg-amber-500/15 text-amber-400">Crítico</span>;
    if (stock < 100) return <span className="badge bg-brand-tertiary/15 text-brand-tertiary">Bajo</span>;
    return <span className="badge bg-emerald-500/15 text-emerald-400">OK</span>;
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Control de Stock</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Gestión de niveles de inventario · {formatNumber(totalCount)} registros
          </p>
        </div>
        <button onClick={() => setScannerOpen(true)} className="btn-primary flex items-center gap-2">
          <FiCamera size={16} /> Escanear Código
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {STATUS_FILTERS.map(({ key, label, icon: Icon, color }) => (
          <button
            key={key}
            onClick={() => setStockFilter(key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap
              ${stockFilter === key 
                ? 'bg-brand-accent/15 text-brand-accent border border-brand-accent/30' 
                : 'bg-surface-800/50 text-slate-400 border border-surface-600/20 hover:border-surface-500/30'
              }`}
          >
            <Icon size={13} className={stockFilter === key ? 'text-brand-accent' : color} />
            {label}
          </button>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
        {/* Search + Filter */}
        <div className="p-3 md:p-4 border-b border-surface-600/20 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input type="text" placeholder="Buscar por descripción o SKU..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} className="input-field pl-9" aria-label="Buscar" />
          </div>
          <div className="flex items-center gap-2">
            <FiFilter className="text-slate-500 flex-shrink-0" size={14} />
            <select value={businessLine} onChange={(e) => setBusinessLine(e.target.value)} className="input-field w-full sm:w-48" aria-label="Categoría">
              <option value="All">Todas las Categorías</option>
              {BUSINESS_LINES.map(l => <option key={l} value={l}>{titleCase(l)}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[11px] uppercase bg-surface-900/50 text-slate-500 border-b border-surface-600/20">
              <tr>
                <th className="px-4 py-3 font-medium">SKU</th>
                <th className="px-4 py-3 font-medium">Descripción</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Categoría</th>
                <th className="px-4 py-3 font-medium text-right">Stock Actual</th>
                <th className="px-4 py-3 font-medium text-right hidden sm:table-cell">Valor Libre</th>
                <th className="px-4 py-3 font-medium text-right hidden lg:table-cell">Bloqueado</th>
                <th className="px-4 py-3 font-medium text-right hidden lg:table-cell">Valor Bloq.</th>
                <th className="px-4 py-3 font-medium text-center">Estado</th>
                <th className="px-4 py-3 font-medium text-right w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-600/10">
              {loading ? Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 9 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-surface-600/20 rounded w-full" /></td>
                  ))}
                </tr>
              )) : filteredData.length === 0 ? (
                <tr><td colSpan="9" className="px-4 py-16 text-center text-slate-500 text-sm">
                  {stockFilter !== 'all' ? `No hay productos ${STATUS_FILTERS.find(f=>f.key===stockFilter)?.label.toLowerCase()} en esta página.` : 'No se encontraron productos.'}
                </td></tr>
              ) : filteredData.map((item) => (
                <tr key={item.sku} className={`hover:bg-surface-700/20 transition-colors ${item.blocked_stock > 0 ? 'bg-orange-500/[0.03]' : ''}`}>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{item.sku}</td>
                  <td className="px-4 py-3 text-white font-medium text-xs max-w-[180px] lg:max-w-xs truncate">{titleCase(item.description)}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-[11px] bg-brand-secondary/20 text-slate-300 px-2 py-0.5 rounded">{titleCase(item.business_line)}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-sm">
                    <span className={item.current_stock <= 0 ? 'text-red-400' : item.current_stock < 10 ? 'text-amber-400' : 'text-white'}>
                      {formatNumber(item.current_stock)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-slate-300 hidden sm:table-cell">{formatCurrency(item.free_stock_value)}</td>
                  <td className="px-4 py-3 text-right text-xs hidden lg:table-cell">
                    <span className={item.blocked_stock > 0 ? 'text-orange-400 font-medium' : 'text-slate-600'}>{formatNumber(item.blocked_stock)}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-slate-400 hidden lg:table-cell">{item.blocked_stock > 0 ? formatCurrency(item.blocked_stock_value) : '—'}</td>
                  <td className="px-4 py-3 text-center">{getStockBadge(item.current_stock)}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleViewProduct(item)} className="text-slate-400 hover:text-brand-accent p-1.5 rounded-lg hover:bg-surface-700/50 transition-colors" aria-label={`Ver ${item.sku}`}>
                      <FiEye size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-3 md:p-4 border-t border-surface-600/20 flex items-center justify-between text-sm">
          <span className="text-slate-500 text-xs">Pág. {currentPage}/{totalPages || 1} · {formatNumber(totalCount)} total</span>
          <div className="flex gap-1.5">
            <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}
              className="px-3 py-1.5 text-xs bg-surface-800 hover:bg-surface-700 disabled:opacity-30 text-white rounded-lg border border-surface-600/30">Anterior</button>
            <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage >= totalPages}
              className="px-3 py-1.5 text-xs bg-surface-800 hover:bg-surface-700 disabled:opacity-30 text-white rounded-lg border border-surface-600/30">Siguiente</button>
          </div>
        </div>
      </div>

      {scannerOpen && <ScannerModal isOpen onClose={() => setScannerOpen(false)} onScan={handleScanResult} />}
      {detailOpen && selectedProduct && (
        <ProductDetailModal isOpen product={selectedProduct}
          onClose={() => { setDetailOpen(false); setSelectedProduct(null); }}
          onSave={() => { setDetailOpen(false); setSelectedProduct(null); refresh(); }} />
      )}
    </div>
  );
};

export default InventoryPage;
