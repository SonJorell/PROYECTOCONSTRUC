import React from 'react';
import { FiBox, FiAlertTriangle, FiDollarSign, FiActivity } from 'react-icons/fi';

const DashboardKPIs = ({ kpis, loading }) => {
  const cards = [
    { title: 'Total Productos', value: kpis.totalProducts, icon: FiBox, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Stock Total', value: kpis.totalStock, icon: FiActivity, color: 'text-teal-500', bg: 'bg-teal-500/10' },
    { title: 'Stock Crítico', value: kpis.criticalStock, icon: FiAlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { title: 'Valor Inventario', value: `$${kpis.inventoryValue.toLocaleString()}`, icon: FiDollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ];

  if (loading) {
    return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {[1,2,3,4].map(i => <div key={i} className="h-28 bg-slate-800 rounded-xl border border-slate-700"></div>)}
    </div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div key={index} className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-sm flex items-center gap-4">
          <div className={`p-4 rounded-lg ${card.bg}`}>
            <card.icon className={`w-6 h-6 ${card.color}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">{card.title}</p>
            <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardKPIs;
