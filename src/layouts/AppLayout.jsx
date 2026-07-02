import React, { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';

/**
 * Layout principal de la aplicación autenticada.
 * Contiene Sidebar + Navbar + área de contenido con <Outlet>.
 */
const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleOpenMenu = useCallback(() => setSidebarOpen(true), []);
  const handleCloseMenu = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="flex h-screen bg-surface-950 text-slate-200 overflow-hidden font-sans">
      <Sidebar isOpen={sidebarOpen} onClose={handleCloseMenu} />

      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        <Navbar onOpenMenu={handleOpenMenu} />

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>

        <footer className="bg-brand-primary/50 border-t border-surface-600/20 py-3 px-6 text-center text-[11px] text-slate-500 flex-shrink-0">
          © {new Date().getFullYear()} StockSync — Sistema de Gestión de Inventarios
        </footer>
      </div>
    </div>
  );
};

export default AppLayout;
