import React from 'react';
import FileDropzone from '../components/upload/FileDropzone';

const BulkUploadPage = () => {
  const handleUploadSuccess = () => {
    // Futuro: Agregar a un historial de cargas
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Carga Masiva</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          Actualiza el inventario subiendo un archivo CSV con los datos del día
        </p>
      </div>

      <FileDropzone onUploadSuccess={handleUploadSuccess} />

      {/* Instrucciones */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Formato del archivo CSV</h3>
        <div className="overflow-x-auto">
          <table className="text-xs text-slate-300 w-full">
            <thead>
              <tr className="text-left text-slate-500 border-b border-surface-600/20">
                <th className="py-2 px-3">Columna</th>
                <th className="py-2 px-3">Descripción</th>
                <th className="py-2 px-3">Ejemplo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-600/10">
              <tr><td className="py-2 px-3 font-mono text-brand-accent">sku</td><td className="py-2 px-3">Código del producto</td><td className="py-2 px-3 text-slate-400">198752002</td></tr>
              <tr><td className="py-2 px-3 font-mono text-brand-accent">current_stock</td><td className="py-2 px-3">Stock actual</td><td className="py-2 px-3 text-slate-400">45.0</td></tr>
              <tr><td className="py-2 px-3 font-mono text-brand-accent">free_stock_value</td><td className="py-2 px-3">Valor libre</td><td className="py-2 px-3 text-slate-400">12500.00</td></tr>
              <tr><td className="py-2 px-3 font-mono text-brand-accent">blocked_stock</td><td className="py-2 px-3">Stock bloqueado</td><td className="py-2 px-3 text-slate-400">0.0</td></tr>
              <tr><td className="py-2 px-3 font-mono text-brand-accent">blocked_stock_value</td><td className="py-2 px-3">Valor bloqueado</td><td className="py-2 px-3 text-slate-400">0.0</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadPage;
