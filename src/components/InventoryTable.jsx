import React from 'react';
import { FiSearch, FiFilter, FiEdit2, FiTrash2 } from 'react-icons/fi';

const InventoryTable = ({ 
  data, loading, searchQuery, onSearchChange, 
  selectedCategory, onCategoryChange, currentPage, totalPages, onPageChange, onEditProduct 
}) => {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-900/50">
        <div className="relative w-full sm:max-w-xs">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder="Buscar por nombre o SKU..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <FiFilter className="text-slate-400" />
          <select 
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full sm:w-auto bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-teal-500"
          >
            <option value="All">Todas las Categorías</option>
            <option value="Herramientas">Herramientas</option>
            <option value="Materiales">Materiales</option>
            <option value="Ferretería">Ferretería</option>
            <option value="Pinturas">Pinturas</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="text-xs uppercase bg-slate-900/50 text-slate-400 border-b border-slate-800">
            <tr>
              <th className="px-6 py-4 font-medium">SKU</th>
              <th className="px-6 py-4 font-medium">Producto</th>
              <th className="px-6 py-4 font-medium">Categoría</th>
              <th className="px-6 py-4 font-medium text-right">Precio</th>
              <th className="px-6 py-4 font-medium text-right">Stock</th>
              <th className="px-6 py-4 font-medium text-center">Estado</th>
              <th className="px-6 py-4 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-slate-500">Cargando inventario...</td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-slate-500">No se encontraron productos.</td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-slate-400">{item.sku}</td>
                  <td className="px-6 py-4 font-medium text-white">{item.name}</td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-800 px-2 py-1 rounded text-xs">{item.category}</span>
                  </td>
                  <td className="px-6 py-4 text-right">${Number(item.price).toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`font-medium ${item.stock < 10 ? 'text-amber-500' : 'text-slate-300'}`}>
                      {item.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === 'Active' ? 'bg-teal-500/10 text-teal-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => onEditProduct(item)} className="text-slate-400 hover:text-teal-400 p-1">
                      <FiEdit2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-900/50 text-sm">
        <span className="text-slate-400">Página {currentPage} de {totalPages || 1}</span>
        <div className="flex gap-2">
          <button 
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded border border-slate-700"
          >
            Anterior
          </button>
          <button 
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded border border-slate-700"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryTable;
