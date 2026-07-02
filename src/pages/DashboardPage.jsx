import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiPackage, FiAlertTriangle, FiLock, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import KPIGrid from '../components/dashboard/KPIGrid';
import { useInventory } from '../hooks/useInventory';
import { fetchDashboardAnalytics } from '../services/inventoryService';
import { formatNumber, formatCurrency, titleCase } from '../utils/formatters';

const PIE_COLORS = ['#EF4444', '#F59E0B', '#478B8D', '#22C55E', '#E4D329'];
const BAR_COLORS = ['#478B8D', '#E4D329', '#294669', '#6366F1', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-800 border border-surface-600/50 rounded-lg px-3 py-2 shadow-xl text-xs">
      <p className="text-white font-medium">{payload[0].name}</p>
      <p className="text-slate-300">{formatNumber(payload[0].value)}</p>
    </div>
  );
};

const DashboardPage = () => {
  const { kpis, loading } = useInventory();
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setAnalyticsLoading(true);
        const data = await fetchDashboardAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.warn('Analytics RPC no disponible:', err.message);
      } finally {
        setAnalyticsLoading(false);
      }
    };
    load();
  }, []);

  // Preparar datos para gráficos
  const stockDistData = analytics?.stock_distribution ? [
    { name: 'Agotado (0)', value: analytics.stock_distribution.out_of_stock },
    { name: 'Crítico (1-9)', value: analytics.stock_distribution.critical },
    { name: 'Bajo (10-99)', value: analytics.stock_distribution.low },
    { name: 'Normal (100-999)', value: analytics.stock_distribution.normal },
    { name: 'Alto (1000+)', value: analytics.stock_distribution.high },
  ].filter(d => d.value > 0) : [];

  const categoryData = (analytics?.category_stats || []).slice(0, 10).map(c => ({
    name: c.name ? (c.name.length > 12 ? c.name.substring(0, 12) + '…' : c.name) : 'N/A',
    stock: Math.round(c.total_stock),
    products: c.product_count,
  }));

  const SkeletonChart = () => (
    <div className="h-64 bg-surface-600/10 rounded-lg animate-pulse" />
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Resumen ejecutivo del inventario</p>
      </div>

      {/* KPIs */}
      <KPIGrid kpis={kpis} loading={loading} />

      {/* Fila 1: Distribución de Stock + Stock por Categoría */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6">
        {/* Donut: Distribución de Stock */}
        <div className="lg:col-span-2 glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Distribución de Stock</h3>
          {analyticsLoading ? <SkeletonChart /> : stockDistData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={stockDistData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3} stroke="none">
                    {stockDistData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 justify-center">
                {stockDistData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    {d.name}: {formatNumber(d.value)}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-600 text-xs">
              Ejecuta la función SQL <code className="text-brand-accent">get_dashboard_analytics</code>
            </div>
          )}
        </div>

        {/* Barras: Stock por Categoría */}
        <div className="lg:col-span-3 glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Stock por Categoría (Top 10)</h3>
          {analyticsLoading ? <SkeletonChart /> : categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={categoryData} margin={{ top: 5, right: 5, bottom: 50, left: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94A3B8' }} axisLine={false} tickLine={false} angle={-40} textAnchor="end" />
                <YAxis tick={{ fontSize: 9, fill: '#64748B' }} axisLine={false} tickLine={false} width={50} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(71,139,141,0.08)' }} />
                <Bar dataKey="stock" radius={[4, 4, 0, 0]} maxBarSize={36}>
                  {categoryData.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-600 text-xs">Sin datos</div>
          )}
        </div>
      </div>

      {/* Fila 2: Top productos + Productos críticos + Stock bloqueado */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Top 10 con más stock */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <FiArrowUp className="text-emerald-400" size={15} />
            <h3 className="text-sm font-semibold text-white">Mayor Stock</h3>
          </div>
          {analyticsLoading ? (
            <div className="space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="h-10 bg-surface-600/20 rounded animate-pulse" />)}</div>
          ) : (
            <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
              {(analytics?.top_products || []).map((p, i) => (
                <div key={p.sku} className="flex items-center gap-2 p-2 rounded-lg bg-surface-900/40 hover:bg-surface-900/60 transition-colors">
                  <span className="text-[10px] text-slate-600 w-4 text-right">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-white truncate">{titleCase(p.description)}</p>
                    <p className="text-[9px] text-slate-500 font-mono">{p.sku}</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 flex-shrink-0">{formatNumber(p.current_stock)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Productos críticos */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <FiArrowDown className="text-amber-400" size={15} />
            <h3 className="text-sm font-semibold text-white">Stock Crítico</h3>
          </div>
          {analyticsLoading ? (
            <div className="space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="h-10 bg-surface-600/20 rounded animate-pulse" />)}</div>
          ) : (
            <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
              {(analytics?.low_products || []).map((p, i) => (
                <div key={p.sku} className="flex items-center gap-2 p-2 rounded-lg bg-surface-900/40 hover:bg-surface-900/60 transition-colors">
                  <span className="text-[10px] text-slate-600 w-4 text-right">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-white truncate">{titleCase(p.description)}</p>
                    <p className="text-[9px] text-slate-500 font-mono">{p.sku}</p>
                  </div>
                  <span className="text-xs font-bold text-amber-400 flex-shrink-0">{formatNumber(p.current_stock)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stock Bloqueado */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <FiLock className="text-red-400" size={15} />
            <h3 className="text-sm font-semibold text-white">Stock Bloqueado</h3>
          </div>
          {analyticsLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-surface-600/20 rounded animate-pulse" />)}</div>
          ) : analytics?.blocked_summary ? (
            <div className="space-y-4 mt-2">
              <div className="text-center p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                <p className="text-3xl font-bold text-red-400">{formatNumber(analytics.blocked_summary.total_blocked_items)}</p>
                <p className="text-[11px] text-slate-500 mt-1">Productos Bloqueados</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-surface-900/50">
                <p className="text-2xl font-bold text-white">{formatNumber(analytics.blocked_summary.total_blocked_units)}</p>
                <p className="text-[11px] text-slate-500 mt-1">Unidades Bloqueadas</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-surface-900/50">
                <p className="text-xl font-bold text-slate-300">{formatCurrency(analytics.blocked_summary.total_blocked_value)}</p>
                <p className="text-[11px] text-slate-500 mt-1">Valor Bloqueado</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-600 text-xs">Sin datos de bloqueo</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
