import React from 'react';
import { FiX, FiHome, FiBox, FiSettings, FiPieChart } from 'react-icons/fi';

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}
      
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-slate-950 border-r border-slate-800
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <span className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-teal-500">Stock</span>Sync
          </span>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
            <FiX size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          <a href="#" className="flex items-center gap-3 px-4 py-3 bg-teal-500/10 text-teal-400 rounded-lg">
            <FiHome size={20} />
            <span className="font-medium">Dashboard</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors">
            <FiBox size={20} />
            <span className="font-medium">Inventario</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors">
            <FiPieChart size={20} />
            <span className="font-medium">Reportes</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors">
            <FiSettings size={20} />
            <span className="font-medium">Configuración</span>
          </a>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
