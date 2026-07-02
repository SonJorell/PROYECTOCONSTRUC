import React, { useEffect, useRef, useState } from 'react';
import { FiX, FiCamera, FiAlertCircle } from 'react-icons/fi';
import { Html5Qrcode } from 'html5-qrcode';
import supabase from '../config/supabaseClient';
import toast from 'react-hot-toast';

const ScannerModal = ({ isOpen, onClose, onScan }) => {
  const [errorMsg, setErrorMsg] = useState(null);
  const [scanning, setScanning] = useState(true);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const html5QrCode = new Html5Qrcode("reader");

    const startScanner = async () => {
      try {
        setScanning(true);
        setErrorMsg(null);
        await html5QrCode.start(
          { facingMode: "environment" }, // Prioriza cámara trasera en móviles
          {
            fps: 10,
            qrbox: { width: 250, height: 150 },
            aspectRatio: 1.0,
          },
          async (decodedText) => {
            // Evitamos múltiples lecturas parando inmediatamente
            if (!scanning) return;
            setScanning(false);
            
            // Vibrar dispositivo si es posible (solo móviles)
            if (navigator.vibrate) navigator.vibrate(200);

            try {
              await html5QrCode.stop();
            } catch (err) {
              console.warn("Fallo al detener la cámara suavemente", err);
            }

            processScannedCode(decodedText);
          },
          (errorMessage) => {
            // Se ignora: html5-qrcode lanza errores continuamente cuando no detecta un código
          }
        );
        scannerRef.current = html5QrCode;
      } catch (err) {
        console.error("Camera error", err);
        setErrorMsg("No se pudo iniciar la cámara. Verifica permisos o compatibilidad del dispositivo.");
        setScanning(false);
      }
    };

    startScanner();

    // Cleanup: detiene cámara al desmontar para evitar fugas de memoria
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(e => console.warn("Error cleaning up scanner:", e));
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const processScannedCode = async (barcode) => {
    try {
        const loadingToast = toast.loading('Buscando producto...');

        // 1. Traducir EAN-13/Código de barras a SKU consultando product_barcodes
        const { data: barcodeData, error: barcodeErr } = await supabase
            .from('product_barcodes')
            .select('sku')
            .eq('barcode', barcode)
            .maybeSingle();

        if (barcodeErr) throw barcodeErr;

        if (!barcodeData) {
            toast.dismiss(loadingToast);
            toast.error('El código de barras escaneado no está registrado.');
            onClose(); 
            return;
        }

        const sku = barcodeData.sku;

        // 2. Traer información relacional simultáneamente de products e inventory
        const [prodResult, invResult] = await Promise.all([
            supabase.from('products').select('*').eq('sku', sku).maybeSingle(),
            supabase.from('inventory').select('current_stock').eq('sku', sku).maybeSingle()
        ]);

        if (prodResult.error) throw prodResult.error;

        if (!prodResult.data) {
            toast.dismiss(loadingToast);
            toast.error(`El SKU asignado (${sku}) no se encuentra en el maestro de productos.`);
            onClose();
            return;
        }

        toast.dismiss(loadingToast);
        toast.success('Producto encontrado exitosamente.');

        // Construir objeto para el orquestador App.jsx (App espera .stock)
        const fullProduct = {
            ...prodResult.data,
            stock: invResult.data ? invResult.data.current_stock : 0
        };

        // Enviar resultado para que App abra el ProductModal automáticamente
        onScan(fullProduct); 

    } catch (error) {
        console.error('Error al procesar el código:', error);
        toast.dismiss();
        toast.error('Error del servidor al procesar la información.');
        onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col items-center">
        
        <div className="w-full flex justify-between items-center p-4 border-b border-slate-800">
            <div className="flex items-center gap-2 text-teal-400">
                <FiCamera size={20} />
                <span className="font-semibold">Escáner de Código</span>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white bg-slate-800 rounded-full p-1.5 transition-colors">
            <FiX size={20} />
            </button>
        </div>

        <div className="w-full p-6 flex flex-col items-center">
            {errorMsg ? (
                <div className="text-center flex flex-col items-center justify-center p-8 text-red-400">
                    <FiAlertCircle size={48} className="mb-4" />
                    <p className="text-sm font-medium">{errorMsg}</p>
                </div>
            ) : (
                <>
                    <p className="text-slate-400 text-sm text-center mb-6">
                        Apunta la cámara al código de barras físico del producto.
                    </p>
                    
                    <div 
                        id="reader" 
                        className="w-full rounded-lg overflow-hidden border-2 border-teal-500/50 shadow-lg"
                        style={{ minHeight: '250px', background: '#000' }}
                    ></div>

                    {!scanning && !errorMsg && (
                         <p className="mt-4 text-teal-400 text-sm font-medium animate-pulse">
                           Traduciendo código a SKU...
                         </p>
                    )}
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default ScannerModal;
