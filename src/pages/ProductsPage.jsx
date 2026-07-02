import React, { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiFilter, FiEdit2, FiBox } from 'react-icons/fi';
import { fetchProductsCatalog, updateProduct } from '../services/inventoryService';
import { BUSINESS_LINES } from '../utils/constants';
import { titleCase } from '../utils/formatters';
import { useDebounce } from '../hooks/useDebounce';
import toast from 'react-hot-toast';

const ProductsPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [businessLine, setBusinessLine] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [editProduct, setEditProduct] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetchProductsCatalog({ page: currentPage, search: debouncedSearch, businessLine });
      setData(result.data);
      setTotalPages(result.totalPages);
      setTotalCount(result.count);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, businessLine]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { setCurrentPage(1); }, [debouncedSearch, businessLine]);

  const startEdit = (product) => {
    setEditProduct(product);
    setEditForm({
      description: product.description,
      business_line: product.business_line,
      unit_of_measure: product.unit_of_measure,
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateProduct(editProduct.sku, editForm);
      toast.success('Producto actualizado.');
      setEditProduct(null);
      loadData();
    } catch (err) {
      toast.error('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Catálogo de Productos</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Información del maestro de productos · {totalCount.toLocaleString()} SKUs
          </p>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-3 md:p-4 border-b border-surface-600/20 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input type="text" placeholder="Buscar producto..." value={search}
              onChange={(e) => setSearch(e.target.value)} className="input-field pl-9" />
          </div>
          <select value={businessLine} onChange={(e) => setBusinessLine(e.target.value)} className="input-field sm:w-48">
            <option value="All">Todas las Líneas</option>
            {BUSINESS_LINES.map(l => <option key={l} value={l}>{titleCase(l)}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[11px] uppercase bg-surface-900/50 text-slate-500 border-b border-surface-600/20">
              <tr>
                <th className="px-4 py-3 font-medium">SKU</th>
                <th className="px-4 py-3 font-medium">Descripción</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Unidad</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Grupo Artículo</th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell">Línea de Negocio</th>
                <th className="px-4 py-3 font-medium text-right w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-600/10">
              {loading ? Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-surface-600/20 rounded" /></td>
                  ))}
                </tr>
              )) : data.length === 0 ? (
                <tr><td colSpan="6" className="px-4 py-16 text-center text-slate-500">No se encontraron productos.</td></tr>
              ) : data.map((item) => (
                <tr key={item.sku} className="hover:bg-surface-700/20 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{item.sku}</td>
                  <td className="px-4 py-3 text-white font-medium text-xs max-w-[200px] lg:max-w-sm truncate">{titleCase(item.description)}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="badge bg-brand-tertiary/10 text-brand-tertiary">{item.unit_of_measure}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-xs text-slate-400 font-mono">{item.article_group}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-[11px] bg-brand-secondary/20 text-slate-300 px-2 py-0.5 rounded">{titleCase(item.business_line)}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => startEdit(item)} className="text-slate-400 hover:text-brand-accent p-1.5 rounded-lg hover:bg-surface-700/50 transition-colors" aria-label="Editar">
                      <FiEdit2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-3 md:p-4 border-t border-surface-600/20 flex items-center justify-between text-sm">
          <span className="text-slate-500 text-xs">Pág. {currentPage}/{totalPages || 1}</span>
          <div className="flex gap-1.5">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
              className="px-3 py-1.5 text-xs bg-surface-800 hover:bg-surface-700 disabled:opacity-30 text-white rounded-lg border border-surface-600/30">Anterior</button>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}
              className="px-3 py-1.5 text-xs bg-surface-800 hover:bg-surface-700 disabled:opacity-30 text-white rounded-lg border border-surface-600/30">Siguiente</button>
          </div>
        </div>
      </div>

      {/* Inline edit modal */}
      {editProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-surface-950/90 backdrop-blur-sm" onClick={() => setEditProduct(null)} />
          <div className="relative glass-card w-full max-w-md p-5 space-y-4 animate-slide-up" role="dialog" aria-modal="true">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2"><FiBox className="text-brand-accent" size={16} /> Editar Producto</h3>
              <span className="text-xs font-mono text-slate-500">{editProduct.sku}</span>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Descripción</label>
              <input value={editForm.description} onChange={e => setEditForm(f => ({...f, description: e.target.value}))} className="input-field" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Línea de Negocio</label>
                <select value={editForm.business_line} onChange={e => setEditForm(f => ({...f, business_line: e.target.value}))} className="input-field">
                  {BUSINESS_LINES.map(l => <option key={l} value={l}>{titleCase(l)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Unidad</label>
                <select value={editForm.unit_of_measure} onChange={e => setEditForm(f => ({...f, unit_of_measure: e.target.value}))} className="input-field">
                  {['C/U','M','M2','M3','KG','PAA','CJ','BOL','ROL','L','ML','T','G','UN'].map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditProduct(null)} className="btn-ghost">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-50">{saving ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
