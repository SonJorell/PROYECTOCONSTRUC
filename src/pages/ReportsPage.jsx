import React, { useState, useEffect } from 'react';
import { FiPieChart, FiBarChart2, FiLock, FiPackage } from 'react-icons/fi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { fetchDashboardAnalytics } from '../services/inventoryService';
import { useInventory } from '../hooks/useInventory';
import { formatNumber, formatCurrency, titleCase } from '../utils/formatters';

const COLORS = ['#478B8D', '#E4D329', '#294669', '#6366F1', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

const ReportsPage = () => {
  const { kpis } = useInventory();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchDashboardAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.warn(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stockDist = analytics?.stock_distribution ? [
    { name: 'Agotado', value: analytics.stock_distribution.out_of_stock, color: '#EF4444' },
    { name: 'Crítico', value: analytics.stock_distribution.critical, color: '#F59E0B' },
    { name: 'Bajo', value: analytics.stock_distribution.low, color: '#478B8D' },
    { name: 'Normal', value: analytics.stock_distribution.normal, color: '#22C55E' },
    { name: 'Alto', value: analytics.stock_distribution.high, color: '#E4D329' },
  ] : [];

  const unitData = (analytics?.unit_stats || []).map(u => ({
    name: u.name,
    count: u.count,
  }));

  const categoryData = (analytics?.category_stats || []).map(c => ({
    name: c.name?.length > 12 ? c.name.substring(0, 12) + '…' : c.name,
    value: c.total_value,
  })).sort((a, b) => b.value - a.value).slice(0, 10);

  const totalItems = stockDist.reduce((s, d) => s + d.value, 0);

  const SkeletonBox = () => <div className="h-64 bg-surface-600/10 rounded-lg animate-pulse" />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Reportes y Análisis</h1>
        <p className="text-slate-400 text-sm mt-0.5">Estadísticas detalladas del inventario</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-brand-accent">{formatNumber(kpis.totalProducts)}</p>
          <p className="text-[11px] text-slate-500">SKUs</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-brand-tertiary">{formatNumber(kpis.totalStock)}</p>
          <p className="text-[11px] text-slate-500">Unidades</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{formatCurrency(kpis.inventoryValue)}</p>
          <p className="text-[11px] text-slate-500">Valorización</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-red-400">{kpis.totalProducts > 0 ? ((kpis.outOfStock / kpis.totalProducts) * 100).toFixed(1) : 0}%</p>
          <p className="text-[11px] text-slate-500">Tasa Agotamiento</p>
        </div>
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock distribution pie */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <FiPieChart className="text-brand-tertiary" size={16} />
            <h3 className="text-sm font-semibold text-white">Distribución de Stock</h3>
          </div>
          {loading ? <SkeletonBox /> : (
            <>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={stockDist} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={2} stroke="none">
                    {stockDist.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0D0B61', border: '1px solid rgba(41,70,105,0.3)', borderRadius: 8, fontSize: 12 }}
                    formatter={(val) => [formatNumber(val), 'Productos']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {stockDist.map(d => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                    <span className="text-xs text-slate-400 flex-1">{d.name}</span>
                    <span className="text-xs font-medium text-white">{formatNumber(d.value)}</span>
                    <span className="text-[10px] text-slate-500 w-10 text-right">{totalItems > 0 ? ((d.value / totalItems) * 100).toFixed(1) : 0}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Units distribution */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <FiPackage className="text-brand-accent" size={16} />
            <h3 className="text-sm font-semibold text-white">Distribución por Unidad de Medida</h3>
          </div>
          {loading ? <SkeletonBox /> : (
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={unitData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 35 }}>
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={30} />
                <Tooltip contentStyle={{ background: '#0D0B61', border: '1px solid rgba(41,70,105,0.3)', borderRadius: 8, fontSize: 12 }}
                  formatter={(val) => [formatNumber(val), 'Productos']}
                  cursor={{ fill: 'rgba(71,139,141,0.08)' }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={18}>
                  {unitData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Value by category */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <FiBarChart2 className="text-emerald-400" size={16} />
            <h3 className="text-sm font-semibold text-white">Valorización por Categoría (Top 10)</h3>
          </div>
          {loading ? <SkeletonBox /> : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 90 }}>
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false}
                  tickFormatter={(val) => `$${(val / 1000000).toFixed(1)}M`} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={85} />
                <Tooltip contentStyle={{ background: '#0D0B61', border: '1px solid rgba(41,70,105,0.3)', borderRadius: 8, fontSize: 12 }}
                  formatter={(val) => [formatCurrency(val), 'Valor']}
                  cursor={{ fill: 'rgba(71,139,141,0.08)' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={18}>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Blocked stock analysis */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <FiLock className="text-red-400" size={16} />
            <h3 className="text-sm font-semibold text-white">Análisis de Stock Bloqueado</h3>
          </div>
          {loading ? <SkeletonBox /> : analytics?.blocked_summary ? (
            <div className="space-y-4 mt-4">
              <div className="p-5 rounded-xl bg-red-500/5 border border-red-500/20 text-center">
                <p className="text-4xl font-bold text-red-400">{formatNumber(analytics.blocked_summary.total_blocked_items)}</p>
                <p className="text-xs text-slate-500 mt-2">Productos con Stock Bloqueado</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-lg bg-surface-900/50 text-center">
                  <p className="text-xl font-bold text-orange-400">{formatNumber(analytics.blocked_summary.total_blocked_units)}</p>
                  <p className="text-[10px] text-slate-500 mt-1">Unidades Bloqueadas</p>
                </div>
                <div className="p-4 rounded-lg bg-surface-900/50 text-center">
                  <p className="text-xl font-bold text-white">{formatCurrency(analytics.blocked_summary.total_blocked_value)}</p>
                  <p className="text-[10px] text-slate-500 mt-1">Valor Inmovilizado</p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                <p className="text-[11px] text-amber-300">
                  ⚠️ El stock bloqueado representa inventario no disponible para venta. Revisar causas de bloqueo.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-600 text-sm">Sin datos de bloqueo</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
