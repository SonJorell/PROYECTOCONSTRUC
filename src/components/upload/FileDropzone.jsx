import React, { useState, useRef } from 'react';
import { FiUploadCloud, FiCheckCircle, FiAlertCircle, FiLoader } from 'react-icons/fi';
import Papa from 'papaparse';
import supabase from '../../config/supabaseClient';
import { DB, CHUNK_SIZE } from '../../utils/constants';
import toast from 'react-hot-toast';

const FileDropzone = ({ onUploadSuccess }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({ speed: 0, remaining: 0, processed: 0 });
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };

  const normalizeNumber = (value) => {
    if (!value) return 0;
    const cleaned = String(value).replace(/\s/g, '').replace(/\.(?=\d{3})/g, '').replace(',', '.');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  const processChunk = async (chunk) => {
    const normalized = chunk
      .map(row => ({
        sku: String(row.SKU || row.sku || '').trim(),
        current_stock: normalizeNumber(row.current_stock || row.Stock || row.stock || row.STOCK),
        free_stock_value: normalizeNumber(row.free_stock_value || row.Valor || row.valor || 0),
        blocked_stock: normalizeNumber(row.blocked_stock || 0),
        blocked_stock_value: normalizeNumber(row.blocked_stock_value || 0),
      }))
      .filter(r => r.sku);

    if (normalized.length === 0) return;

    const skus = normalized.map(r => r.sku);

    // Verificar SKUs huérfanos
    const { data: existing } = await supabase.from(DB.PRODUCTS).select('sku').in('sku', skus);
    const existingSet = new Set((existing || []).map(p => p.sku));
    const missing = [...new Set(skus.filter(s => !existingSet.has(s)))];

    if (missing.length > 0) {
      await supabase.from(DB.PRODUCTS).insert(
        missing.map(sku => ({
          sku,
          description: 'PRODUCTO NUEVO PENDIENTE DE CLASIFICACIÓN',
          business_line: 'NO MAPEADO',
          unit_of_measure: 'C/U',
          article_group: '000000',
        }))
      );
    }

    // Deduplicar y upsert
    const map = new Map();
    for (const item of normalized) map.set(item.sku, item);

    const { error } = await supabase
      .from(DB.INVENTORY)
      .upsert(Array.from(map.values()), { onConflict: 'sku' });

    if (error) throw new Error('Error al actualizar inventario.');
  };

  const processFile = (file) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Selecciona un archivo .csv válido.');
      return;
    }

    setFileName(file.name);
    setFileSize((file.size / 1024 / 1024).toFixed(2));
    setUploadStatus('uploading');
    setProgress(0);

    let chunkBuffer = [];
    let totalProcessed = 0;
    let startTime = Date.now();
    let isError = false;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      step: async (results, parser) => {
        if (isError) return;
        chunkBuffer.push(results.data);

        if (chunkBuffer.length >= CHUNK_SIZE) {
          parser.pause();
          try {
            await processChunk(chunkBuffer);
            totalProcessed += chunkBuffer.length;
            const elapsed = (Date.now() - startTime) / 1000;
            const speed = Math.floor(totalProcessed / Math.max(elapsed, 1));
            const est = file.size / 50;
            setProgress(Math.min(Math.round((totalProcessed / est) * 100), 99));
            setStats({ processed: totalProcessed, speed, remaining: Math.max(0, Math.floor((est - totalProcessed) / speed)) });
            chunkBuffer = [];
            parser.resume();
          } catch (err) {
            isError = true;
            parser.abort();
            setUploadStatus('error');
            toast.error(err.message);
          }
        }
      },
      complete: async () => {
        if (isError) return;
        try {
          if (chunkBuffer.length > 0) {
            await processChunk(chunkBuffer);
            totalProcessed += chunkBuffer.length;
          }
          setProgress(100);
          setStats(s => ({ ...s, processed: totalProcessed }));
          setUploadStatus('success');
          toast.success('Inventario actualizado exitosamente.');
          if (onUploadSuccess) onUploadSuccess();
        } catch (err) {
          setUploadStatus('error');
          toast.error(err.message);
        }
      },
      error: (error) => {
        setUploadStatus('error');
        toast.error(`Error CSV: ${error.message}`);
      },
    });
  };

  const resetUpload = (e) => {
    e.stopPropagation();
    setUploadStatus('idle');
    setProgress(0);
    setFileName('');
  };

  const borderColor = {
    error: 'border-red-500/50',
    success: 'border-emerald-500/50',
    uploading: 'border-brand-accent/50',
    idle: 'border-surface-600/30',
  }[uploadStatus];

  return (
    <div
      className={`relative glass-card border-2 border-dashed p-8 flex flex-col items-center justify-center text-center transition-all ${borderColor} ${uploadStatus === 'idle' ? 'cursor-pointer hover:border-brand-tertiary/50 group' : ''} ${dragActive ? 'border-brand-accent/60 bg-brand-accent/5' : ''}`}
      onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
      onClick={uploadStatus === 'idle' ? () => fileInputRef.current?.click() : undefined}
      role="button"
      aria-label="Zona de carga de archivos CSV"
    >
      <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleChange} />

      {uploadStatus === 'idle' && (
        <>
          <div className={`w-14 h-14 bg-surface-900 rounded-full flex items-center justify-center text-slate-400 group-hover:text-brand-accent group-hover:scale-110 transition-transform mb-4 ${dragActive ? 'text-brand-accent scale-110' : ''}`}>
            <FiUploadCloud size={28} />
          </div>
          <h3 className="text-base font-semibold text-white mb-1">Carga Masiva de Inventario</h3>
          <p className="text-xs text-slate-400 max-w-sm">
            Arrastra un <span className="font-mono text-brand-accent">.csv</span> o haz clic para subir. Se procesará en lotes de {CHUNK_SIZE.toLocaleString()} registros.
          </p>
        </>
      )}

      {uploadStatus === 'uploading' && (
        <div className="w-full max-w-md flex flex-col items-center">
          <FiLoader size={32} className="text-brand-accent animate-spin mb-4" />
          <h3 className="text-sm font-medium text-white mb-1">Procesando {fileName}</h3>
          <p className="text-[11px] text-slate-400 mb-5">{fileSize} MB · {stats.processed.toLocaleString()} registros</p>
          <div className="w-full bg-surface-900 rounded-full h-2 mb-2 overflow-hidden">
            <div className="bg-brand-accent h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <div className="w-full flex justify-between text-[10px] text-slate-500 font-medium">
            <span>{progress}%</span>
            <span>~{stats.remaining}s ({stats.speed.toLocaleString()} reg/s)</span>
          </div>
        </div>
      )}

      {uploadStatus === 'success' && (
        <div className="flex flex-col items-center">
          <FiCheckCircle size={40} className="text-emerald-400 mb-3" />
          <h3 className="text-base font-semibold text-emerald-400 mb-1">¡Carga Completada!</h3>
          <p className="text-xs text-slate-400 mb-4">{stats.processed.toLocaleString()} registros procesados.</p>
          <button onClick={resetUpload} className="btn-ghost text-xs">Subir otro archivo</button>
        </div>
      )}

      {uploadStatus === 'error' && (
        <div className="flex flex-col items-center">
          <FiAlertCircle size={40} className="text-red-400 mb-3" />
          <h3 className="text-base font-semibold text-red-400 mb-1">Error</h3>
          <p className="text-xs text-slate-400 mb-4">Revisa el archivo e intenta de nuevo.</p>
          <button onClick={resetUpload} className="btn-ghost text-xs border-red-500/20">Reintentar</button>
        </div>
      )}
    </div>
  );
};

export default FileDropzone;
