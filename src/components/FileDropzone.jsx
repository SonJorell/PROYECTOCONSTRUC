import React, { useState, useRef } from 'react';
import { FiUploadCloud, FiCheckCircle, FiAlertCircle, FiLoader } from 'react-icons/fi';
import Papa from 'papaparse';
import supabase from '../config/supabaseClient';
import toast from 'react-hot-toast';

const FileDropzone = ({ onUploadSuccess }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({ speed: 0, remaining: 0, total: 0, processed: 0 });
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  const normalizeNumber = (value) => {
    if (!value) return 0;
    // Remueve espacios, quita puntos de miles (asumiendo formato europeo a veces) y cambia comas por puntos decimales.
    const cleaned = String(value).replace(/\s/g, '').replace(/\.(?=\d{3})/g, '').replace(',', '.');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  const processChunk = async (chunk) => {
    // Normalizar datos
    const normalizedChunk = chunk
      .map(row => ({
        sku: String(row.SKU || row.sku || '').trim(),
        stock: normalizeNumber(row.Stock || row.stock || row.STOCK),
        price: normalizeNumber(row.Precio || row.precio || row.PRECIO),
      }))
      .filter(r => r.sku); // Omitir filas corruptas o vacías sin SKU

    if (normalizedChunk.length === 0) return;

    const skusInChunk = normalizedChunk.map(r => r.sku);

    // 1. Detectar SKUs en `products`
    const { data: existingProducts, error: prodErr } = await supabase
      .from('products')
      .select('sku')
      .in('sku', skusInChunk);

    if (prodErr) throw new Error('Error al validar SKUs en tabla products.');

    const existingSkus = new Set(existingProducts.map(p => p.sku));
    const missingSkus = [...new Set(skusInChunk.filter(sku => !existingSkus.has(sku)))]; // SKUs huérfanos

    // 2. Insertar SKUs faltantes preventivamente en `products`
    if (missingSkus.length > 0) {
      const newProducts = missingSkus.map(sku => ({
        sku,
        name: 'PRODUCTO NUEVO PENDIENTE DE CLASIFICACIÓN',
        category: 'NO MAPEADO',
        status: 'Active'
      }));

      const { error: insertErr } = await supabase
        .from('products')
        .insert(newProducts);

      if (insertErr) throw new Error('Error insertando SKUs huérfanos preventivamente.');
    }

    // 3. Upsert masivo en `inventory`
    // Deduplicar dentro del chunk para que onConflict no falle (prevalece el último del chunk)
    const inventoryMap = new Map();
    for (const item of normalizedChunk) {
        inventoryMap.set(item.sku, { 
          sku: item.sku, 
          current_stock: item.stock,
          free_stock_value: item.stock * item.price,
          last_updated: new Date().toISOString()
        });
    }

    const { error: upsertErr } = await supabase
      .from('inventory')
      .upsert(Array.from(inventoryMap.values()), { onConflict: 'sku' });

    if (upsertErr) throw new Error('Error al actualizar tabla inventory.');
  };

  const processFile = (file) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Por favor, selecciona un archivo .csv válido.');
      return;
    }

    setFileName(file.name);
    setFileSize((file.size / 1024 / 1024).toFixed(2));
    setUploadStatus('uploading');
    setProgress(0);
    setStats({ speed: 0, remaining: 0, total: 0, processed: 0 });

    const CHUNK_SIZE = 1500;
    let chunkBuffer = [];
    let totalProcessed = 0;
    let startTime = Date.now();
    let isError = false;

    // PapaParse en modo stream (paso a paso) previene sobrecarga de RAM con 68,000 registros
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
            
            // Lógica para progreso fluido
            const elapsedSeconds = (Date.now() - startTime) / 1000;
            const currentSpeed = Math.floor(totalProcessed / Math.max(elapsedSeconds, 1));
            const estimatedTotalRows = (file.size / 50); // Ratio estimado para un CSV típico de inventario
            const pct = Math.min(Math.round((totalProcessed / estimatedTotalRows) * 100), 99);
            
            setProgress(pct);
            setStats({
                processed: totalProcessed,
                speed: currentSpeed,
                remaining: Math.max(0, Math.floor((estimatedTotalRows - totalProcessed) / currentSpeed))
            });

            chunkBuffer = [];
            parser.resume();
          } catch (err) {
            isError = true;
            parser.abort();
            setUploadStatus('error');
            toast.error(err.message || 'Error en el procesamiento del lote.');
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
          setStats(s => ({ ...s, processed: totalProcessed, speed: 0, remaining: 0 }));
          setUploadStatus('success');
          toast.success('Inventario actualizado masivamente con éxito.');
          if (onUploadSuccess) onUploadSuccess();
        } catch (err) {
          setUploadStatus('error');
          toast.error(err.message || 'Error en la subida final.');
        }
      },
      error: (error) => {
        setUploadStatus('error');
        toast.error(`Error al leer CSV: ${error.message}`);
      }
    });
  };

  const getBorderColor = () => {
    if (uploadStatus === 'error') return 'border-red-500';
    if (uploadStatus === 'success') return 'border-emerald-500';
    if (dragActive || uploadStatus === 'uploading') return 'border-teal-500';
    return 'border-slate-700';
  };

  const resetUpload = (e) => {
      e.stopPropagation();
      setUploadStatus('idle');
      setProgress(0);
      setFileName('');
  };

  return (
    <div 
        className={`relative bg-slate-800/50 border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all ${getBorderColor()} ${uploadStatus === 'idle' ? 'cursor-pointer hover:bg-slate-800 hover:border-teal-500 group' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={uploadStatus === 'idle' ? onButtonClick : undefined}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleChange}
      />
      
      {uploadStatus === 'idle' && (
          <>
            <div className={`w-14 h-14 bg-slate-900 rounded-full flex items-center justify-center text-slate-400 group-hover:text-teal-400 group-hover:scale-110 transition-transform mb-4 shadow-inner ${dragActive ? 'text-teal-400 scale-110' : ''}`}>
                <FiUploadCloud size={28} />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Carga Masiva de Inventario</h3>
            <p className="text-sm text-slate-400 max-w-md">
                Arrastra un archivo <span className="text-slate-300 font-mono text-xs bg-slate-900 px-1 rounded">.csv</span> o haz clic para subir. 
                Se procesará en lotes automáticamente (Upsert en <span className="font-mono text-xs">inventory</span>).
            </p>
          </>
      )}

      {uploadStatus === 'uploading' && (
          <div className="w-full max-w-md flex flex-col items-center">
            <FiLoader size={36} className="text-teal-500 animate-spin mb-4" />
            <h3 className="text-base font-medium text-white mb-1">Procesando {fileName}</h3>
            <p className="text-xs text-slate-400 mb-6">Tamaño: {fileSize} MB | Registros: {stats.processed.toLocaleString()}</p>
            
            <div className="w-full bg-slate-900 rounded-full h-2.5 mb-2 overflow-hidden shadow-inner">
                <div className="bg-teal-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
            
            <div className="w-full flex justify-between text-xs text-slate-500 font-medium">
                <span>{progress}% Completado</span>
                <span>~ {stats.remaining}s restantes ({stats.speed.toLocaleString()} reg/s)</span>
            </div>
          </div>
      )}

      {uploadStatus === 'success' && (
          <div className="flex flex-col items-center">
              <FiCheckCircle size={48} className="text-emerald-500 mb-4" />
              <h3 className="text-lg font-medium text-emerald-400 mb-1">¡Carga Completada!</h3>
              <p className="text-sm text-slate-400 mb-6">Se procesaron {stats.processed.toLocaleString()} registros correctamente.</p>
              <button onClick={resetUpload} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-sm transition-colors border border-slate-700">
                  Subir otro archivo
              </button>
          </div>
      )}

      {uploadStatus === 'error' && (
          <div className="flex flex-col items-center">
              <FiAlertCircle size={48} className="text-red-500 mb-4" />
              <h3 className="text-lg font-medium text-red-400 mb-1">Error en la carga</h3>
              <p className="text-sm text-slate-400 mb-6">Ocurrió un problema procesando el archivo CSV. Revisa tus logs o intenta de nuevo.</p>
              <button onClick={resetUpload} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm transition-colors border border-red-500/30">
                  Reintentar
              </button>
          </div>
      )}

    </div>
  );
};

export default FileDropzone;
