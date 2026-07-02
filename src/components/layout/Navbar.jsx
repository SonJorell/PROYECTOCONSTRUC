import React from 'react';
import { useLocation } from 'react-router-dom';
import { FiMenu, FiBell, FiUser, FiSearch } from 'react-icons/fi';

const routeTitles = {
  '/': 'Dashboard',
  '/inventory': 'Inventario',
  '/products': 'Productos',
  '/categories': 'Categorías',
  '/bulk-upload': 'Carga Masiva',
  '/reports': 'Reportes',
  '/settings': 'Configuración',
};

const Navbar = ({ onOpenMenu }) => {
  const location = useLocation();
  const title = routeTitles[location.pathname] || 'StockSync';

  return (
    <nav 
      className="bg-brand-primary/90 backdrop-blur-md border-b border-surface-600/20 h-14 flex items-center justify-between px-4 lg:px-6 flex-shrink-0 sticky top-0 z-30"
      role="banner"
    >
      <div className="flex items-center gap-3">
        <button 
          onClick={onOpenMenu} 
          className="lg:hidden text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-surface-700/50 transition-colors"
          aria-label="Abrir menú"
        >
          <FiMenu size={20} />
        </button>
        <h1 className="text-base font-semibold text-white hidden sm:block">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Notificaciones */}
        <button 
          className="text-slate-300 hover:text-white p-2 rounded-lg hover:bg-surface-700/50 transition-colors relative"
          aria-label="Notificaciones"
        >
          <FiBell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-accent rounded-full" />
        </button>

        {/* Perfil */}
        <button 
          className="flex items-center gap-2 hover:bg-surface-700/50 p-1.5 rounded-lg transition-colors"
          aria-label="Perfil de usuario"
        >
          <div className="w-7 h-7 rounded-full bg-brand-tertiary/30 border border-brand-tertiary/50 flex items-center justify-center">
            <FiUser size={14} className="text-brand-tertiary" />
          </div>
        </button>
      </div>
    </nav>
  );
};

export default React.memo(Navbar);
