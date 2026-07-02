import React from 'react';
import { FiMenu, FiBell, FiUser } from 'react-icons/fi';

const Navbar = ({ onOpenMenu }) => {
  return (
    <nav className="bg-slate-950 border-b border-slate-800 h-16 flex items-center justify-between px-4 lg:px-8">
      <div className="flex items-center gap-4">
        <button onClick={onOpenMenu} className="lg:hidden text-slate-400 hover:text-white p-2">
          <FiMenu size={24} />
        </button>
      </div>
      <div className="flex items-center gap-4 text-slate-400">
        <button className="hover:text-white p-2 relative">
          <FiBell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-teal-500 rounded-full"></span>
        </button>
        <button className="flex items-center gap-2 hover:text-white p-2">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
            <FiUser size={16} />
          </div>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
