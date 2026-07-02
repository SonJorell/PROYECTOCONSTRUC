import React from 'react';
import clsx from 'clsx';
import { FiBox, FiActivity, FiAlertTriangle, FiDollarSign, FiXCircle } from 'react-icons/fi';
import { formatCurrency, formatNumber } from '../../utils/formatters';

const kpiConfig = [
  { 
    key: 'totalProducts', 
    label: 'Productos', 
    icon: FiBox, 
    color: 'text-brand-tertiary', 
    bg: 'bg-brand-tertiary/10',
    format: formatNumber,
  },
  { 
    key: 'totalStock', 
    label: 'Stock Total', 
    icon: FiActivity, 
    color: 'text-brand-accent', 
    bg: 'bg-brand-accent/10',
    format: formatNumber,
  },
  { 
    key: 'criticalStock', 
    label: 'Stock Crítico', 
    icon: FiAlertTriangle, 
    color: 'text-amber-400', 
    bg: 'bg-amber-400/10',
    format: formatNumber,
  },
  { 
    key: 'inventoryValue', 
    label: 'Valor Inventario', 
    icon: FiDollarSign, 
    color: 'text-emerald-400', 
    bg: 'bg-emerald-400/10',
    format: formatCurrency,
  },
  { 
    key: 'outOfStock', 
    label: 'Agotados', 
    icon: FiXCircle, 
    color: 'text-red-400', 
    bg: 'bg-red-400/10',
    format: formatNumber,
  },
];

const KPIGrid = ({ kpis, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
        {kpiConfig.map((_, i) => (
          <div key={i} className="glass-card p-4 lg:p-5 animate-pulse">
            <div className="h-4 bg-surface-600/50 rounded w-20 mb-3" />
            <div className="h-7 bg-surface-600/50 rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
      {kpiConfig.map(({ key, label, icon: Icon, color, bg, format }) => (
        <div 
          key={key} 
          className="glass-card p-4 lg:p-5 hover:border-surface-500/40 transition-all duration-200 animate-slide-up group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</span>
            <div className={clsx('p-1.5 rounded-lg', bg)}>
              <Icon className={clsx('w-3.5 h-3.5', color)} />
            </div>
          </div>
          <p className="text-xl lg:text-2xl font-bold text-white tracking-tight">
            {format(kpis[key])}
          </p>
        </div>
      ))}
    </div>
  );
};

export default React.memo(KPIGrid);
