import React, { useState } from 'react';
import { FiX, FiSave, FiPackage, FiHash, FiLayers } from 'react-icons/fi';
import { updateProduct, updateInventory } from '../../services/inventoryService';
import { formatNumber, formatCurrency, titleCase } from '../../utils/formatters';
import { BUSINESS_LINES } from '../../utils/constants';
import toast from 'react-hot-toast';

const ProductDetailModal = ({ isOpen, product, onClose, onSave }) => {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    description: product?.description || '',
    business_line: product?.business_line || '',
    unit_of_measure: product?.unit_of_measure || 'C/U',
    current_stock: product?.current_stock ?? 0,
  });

  if (!isOpen || !product) return null;

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Actualizar producto
      await updateProduct(product.sku, {
        description: form.description,
        business_line: form.business_line,
        unit_of_measure: form.unit_of_measure,
      });

      // Actualizar stock si cambió
      if (form.current_stock !== product.current_stock) {
        await updateInventory(product.sku, {
          current_stock: Number(form.current_stock),
        });
      }

      toast.success('Producto actualizado exitosamente.');
      onSave();
    } catch (err) {
      toast.error('Error al guardar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-surface-950/90 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div 
        className="relative glass-card w-full max-w-lg overflow-hidden animate-slide-up"
        role="dialog"
        aria-modal="true"
        aria-label={`Detalle del producto ${product.sku}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-surface-600/20">
          <div className="flex items-center gap-2">
            <FiPackage className="text-brand-accent" size={18} />
            <h2 className="text-sm font-bold text-white">
              {product.sku ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-surface-700/50 transition-colors"
            aria-label="Cerrar"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* SKU (solo lectura) */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-900/50 border border-surface-600/20">
            <FiHash className="text-brand-accent flex-shrink-0" size={16} />
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">SKU</p>
              <p className="text-sm font-mono font-medium text-white">{product.sku}</p>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Descripción</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="input-field"
            />
          </div>

          {/* Grid 2 cols */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Categoría</label>
              <select
                value={form.business_line}
                onChange={(e) => handleChange('business_line', e.target.value)}
                className="input-field"
              >
                {BUSINESS_LINES.map(line => (
                  <option key={line} value={line}>{titleCase(line)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Unidad</label>
              <select
                value={form.unit_of_measure}
                onChange={(e) => handleChange('unit_of_measure', e.target.value)}
                className="input-field"
              >
                {['C/U','M','M2','M3','KG','PAA','CJ','BOL','ROL','L','ML','T','G'].map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Stock */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Stock Actual</label>
              <input
                type="number"
                step="0.01"
                value={form.current_stock}
                onChange={(e) => handleChange('current_stock', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Valor Libre</label>
              <p className="input-field bg-surface-950 text-slate-400 cursor-not-allowed">
                {formatCurrency(product.free_stock_value)}
              </p>
            </div>
          </div>

          {/* Info adicional */}
          {product.barcodes && product.barcodes.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Códigos de Barras</label>
              <div className="flex flex-wrap gap-1.5">
                {product.barcodes.map(bc => (
                  <span key={bc} className="badge bg-surface-900 text-slate-300 font-mono">{bc}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-surface-600/20 flex justify-end gap-2">
          <button onClick={onClose} className="btn-ghost">Cancelar</button>
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <FiLoader className="animate-spin" size={14} /> : <FiSave size={14} />}
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
