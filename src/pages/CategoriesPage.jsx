import React, { useState, useEffect } from 'react';
import { FiSearch, FiGrid, FiPackage, FiAlertTriangle, FiXCircle, FiTrendingUp } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { fetchDashboardAnalytics } from '../services/inventoryService';
import { formatNumber, formatCurrency, titleCase } from '../utils/formatters';

const COLORS = ['#478B8D', '#E4D329', '#294669', '#6366F1', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#0D0B61', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];

const CategoriesPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('stock');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchDashboardAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.warn('Analytics no disponible:', err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const categories = (analytics?.category_stats || [])
    .filter(c => c.name && c.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortBy === 'stock' ? b.total_stock - a.total_stock : b.product_count - a.product_count);

  const chartData = categories.slice(0, 12).map(c => ({
    name: c.name.length > 10 ? c.name.substring(0, 10) + '…' : c.name,
    value: sortBy === 'stock' ? Math.round(c.total_stock) : c.product_count,
  }));

  const totalProducts = categories.reduce((s, c) => s + c.product_count, 0);
  const totalStock = categories.reduce((s, c) => s + c.total_stock, 0);
  const totalValue = categories.reduce((s, c) => s + c.total_value, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Análisis por Categoría</h1>
        <p className="text-slate-400 text-sm mt-0.5">{categories.length} líneas de negocio</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card p-4 text-center">
          <p className="text-xl font-bold text-brand-accent">{formatNumber(totalProducts)}</p>
          <p className="text-[11px] text-slate-500 mt-1">Productos Totales</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-xl font-bold text-brand-tertiary">{formatNumber(totalStock)}</p>
          <p className="text-[11px] text-slate-500 mt-1">Stock Total</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-xl font-bold text-white">{formatCurrency(totalValue)}</p>
          <p className="text-[11px] text-slate-500 mt-1">Valorización</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input type="text" placeholder="Buscar categoría..." value={search}
            onChange={(e) => setSearch(e.target.value)} className="input-field pl-9" />
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => setSortBy('stock')} className={`px-3 py-2 text-xs rounded-lg border transition-all ${sortBy === 'stock' ? 'bg-brand-accent/15 text-brand-accent border-brand-accent/30' : 'bg-surface-800/50 text-slate-400 border-surface-600/20'}`}>
            Por Stock
          </button>
          <button onClick={() => setSortBy('count')} className={`px-3 py-2 text-xs rounded-lg border transition-all ${sortBy === 'count' ? 'bg-brand-accent/15 text-brand-accent border-brand-accent/30' : 'bg-surface-800/50 text-slate-400 border-surface-600/20'}`}>
            Por Productos
          </button>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-4">{sortBy === 'stock' ? 'Stock' : 'Productos'} por Categoría</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 90 }}>
              <XAxis type="number" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={85} />
              <Tooltip
                contentStyle={{ background: '#0D0B61', border: '1px solid rgba(41,70,105,0.3)', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#94A3B8' }}
                formatter={(val) => formatNumber(val)}
                cursor={{ fill: 'rgba(71,139,141,0.08)' }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={20}>
                {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Category cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass-card p-5 animate-pulse">
              <div className="h-5 bg-surface-600/30 rounded w-2/3 mb-4" />
              <div className="space-y-2">
                <div className="h-4 bg-surface-600/20 rounded" />
                <div className="h-4 bg-surface-600/20 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((cat, i) => {
            const stockPct = totalStock > 0 ? (cat.total_stock / totalStock) * 100 : 0;
            return (
              <div key={cat.name} className="glass-card p-5 hover:border-surface-500/40 transition-all">
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 rounded-lg flex-shrink-0" style={{ background: `${COLORS[i % COLORS.length]}15` }}>
                    <FiGrid size={16} style={{ color: COLORS[i % COLORS.length] }} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-white truncate">{titleCase(cat.name)}</h3>
                    <p className="text-[10px] text-slate-500">{stockPct.toFixed(1)}% del stock total</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-surface-900 rounded-full h-1.5 mb-4">
                  <div className="h-1.5 rounded-full transition-all" style={{ width: `${Math.min(stockPct, 100)}%`, background: COLORS[i % COLORS.length] }} />
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2 rounded bg-surface-900/50">
                    <p className="text-sm font-bold text-white">{formatNumber(cat.product_count)}</p>
                    <p className="text-[9px] text-slate-500 flex items-center justify-center gap-0.5"><FiPackage size={8} /> SKUs</p>
                  </div>
                  <div className="p-2 rounded bg-surface-900/50">
                    <p className="text-sm font-bold text-brand-tertiary">{formatNumber(cat.total_stock)}</p>
                    <p className="text-[9px] text-slate-500 flex items-center justify-center gap-0.5"><FiTrendingUp size={8} /> Stock</p>
                  </div>
                  <div className="p-2 rounded bg-surface-900/50">
                    <p className="text-sm font-bold text-amber-400">{formatNumber(cat.critical_count)}</p>
                    <p className="text-[9px] text-slate-500 flex items-center justify-center gap-0.5"><FiAlertTriangle size={8} /> Críticos</p>
                  </div>
                  <div className="p-2 rounded bg-surface-900/50">
                    <p className="text-sm font-bold text-red-400">{formatNumber(cat.out_of_stock_count)}</p>
                    <p className="text-[9px] text-slate-500 flex items-center justify-center gap-0.5"><FiXCircle size={8} /> Agotados</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
