import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiX, FiHome, FiPackage, FiBox, FiGrid, FiUploadCloud, FiPieChart } from 'react-icons/fi';

const navItems = [
  { to: '/',            icon: FiHome,        label: 'Dashboard' },
  { to: '/inventory',   icon: FiPackage,     label: 'Inventario' },
  { to: '/products',    icon: FiBox,         label: 'Productos' },
  { to: '/categories',  icon: FiGrid,        label: 'Categorías' },
  { to: '/bulk-upload', icon: FiUploadCloud, label: 'Carga Masiva' },
  { to: '/reports',     icon: FiPieChart,    label: 'Reportes' },
];

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm animate-fade-in" onClick={onClose} />
      )}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-brand-primary border-r border-surface-600/30 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-surface-600/20 flex-shrink-0">
          <span className="text-xl font-bold text-white tracking-tight">
            <span className="text-brand-accent">Stock</span>Sync
          </span>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-surface-700/50 transition-colors" aria-label="Cerrar menú">
            <FiX size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'} onClick={onClose}
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group
                ${isActive ? 'bg-brand-accent/15 text-brand-accent' : 'text-slate-300 hover:text-white hover:bg-surface-700/40'}`}>
              <Icon size={18} className="flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-surface-600/20 flex-shrink-0">
          <div className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-400">
            <div className="w-8 h-8 rounded-full bg-brand-secondary flex items-center justify-center text-white font-semibold text-xs">SS</div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">StockSync</p>
              <p className="text-slate-500 text-[10px]">v2.0.0</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default React.memo(Sidebar);
