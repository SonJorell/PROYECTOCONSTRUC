import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CHART_COLORS = ['#478B8D', '#E4D329', '#294669', '#6366F1', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-800 border border-surface-600/50 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-sm font-semibold text-white">
        {Number(payload[0].value).toLocaleString('es-CL')} unidades
      </p>
    </div>
  );
};

const StockChart = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="glass-card p-5">
        <div className="h-4 bg-surface-600/50 rounded w-40 mb-6 animate-pulse" />
        <div className="h-64 bg-surface-600/20 rounded animate-pulse" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Stock por Categoría</h3>
        <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
          Sin datos de stock por categoría
        </div>
      </div>
    );
  }

  // Tomar las top 8 categorías
  const chartData = data.slice(0, 8).map(item => ({
    name: item.name.length > 14 ? item.name.substring(0, 14) + '…' : item.name,
    fullName: item.name,
    stock: Math.round(item.stock),
  }));

  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Stock por Categoría (Top 8)</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 10, fill: '#94A3B8' }} 
            axisLine={false} 
            tickLine={false}
            interval={0}
            angle={-35}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            tick={{ fontSize: 10, fill: '#64748B' }} 
            axisLine={false} 
            tickLine={false}
            width={50}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(71,139,141,0.1)' }} />
          <Bar dataKey="stock" radius={[4, 4, 0, 0]} maxBarSize={40}>
            {chartData.map((_, index) => (
              <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default React.memo(StockChart);
