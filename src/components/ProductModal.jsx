import React from 'react';
import { FiX } from 'react-icons/fi';

const ProductModal = ({ isOpen, product, onClose, onSave }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white">
            {product ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <FiX size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">SKU</label>
              <input type="text" defaultValue={product?.sku} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-teal-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Categoría</label>
              <select defaultValue={product?.category} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-teal-500 focus:outline-none">
                <option>Herramientas</option>
                <option>Materiales</option>
                <option>Ferretería</option>
                <option>Pinturas</option>
                <option>Seguridad</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Nombre del Producto</label>
            <input type="text" defaultValue={product?.name} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-teal-500 focus:outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Precio ($)</label>
              <input type="number" defaultValue={product?.price} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-teal-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Stock Actual</label>
              <input type="number" defaultValue={product?.stock} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-teal-500 focus:outline-none" />
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Cancelar
          </button>
          <button onClick={() => { onSave(); onClose(); }} className="px-4 py-2 text-sm font-medium bg-teal-600 hover:bg-teal-500 text-white rounded-lg shadow-lg shadow-teal-900/20 transition-colors">
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
