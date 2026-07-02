import React, { useEffect, useRef, useState } from 'react';
import { FiX, FiCamera, FiAlertCircle } from 'react-icons/fi';
import { Html5Qrcode } from 'html5-qrcode';
import { lookupBarcode } from '../../services/inventoryService';
import toast from 'react-hot-toast';

const ScannerModal = ({ isOpen, onClose, onScan }) => {
  const [errorMsg, setErrorMsg] = useState(null);
  const [scanning, setScanning] = useState(true);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const html5QrCode = new Html5Qrcode("scanner-reader");

    const startScanner = async () => {
      try {
        setScanning(true);
        setErrorMsg(null);
        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 150 }, aspectRatio: 1.0 },
          async (decodedText) => {
            if (!scanning) return;
            setScanning(false);
            if (navigator.vibrate) navigator.vibrate(200);
            try { await html5QrCode.stop(); } catch (err) { /* ignore */ }
            processScannedCode(decodedText);
          },
          () => {} // Ignore continuous scan errors
        );
        scannerRef.current = html5QrCode;
      } catch (err) {
        console.error("Camera error", err);
        setErrorMsg("No se pudo iniciar la cámara. Verifica permisos.");
        setScanning(false);
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [isOpen]);

  const processScannedCode = async (barcode) => {
    const loadingId = toast.loading('Buscando producto...');
    try {
      const product = await lookupBarcode(barcode);
      toast.dismiss(loadingId);

      if (!product) {
        toast.error('Código de barras no registrado en el sistema.');
        onClose();
        return;
      }

      toast.success('Producto encontrado.');
      onScan(product);
    } catch (error) {
      toast.dismiss(loadingId);
      toast.error('Error al consultar el producto.');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-surface-950/95 backdrop-blur-md animate-fade-in" onClick={onClose} />
      <div className="relative glass-card w-full max-w-sm overflow-hidden animate-slide-up" role="dialog" aria-modal="true" aria-label="Escáner de código">
        <div className="flex justify-between items-center p-4 border-b border-surface-600/20">
          <div className="flex items-center gap-2 text-brand-accent">
            <FiCamera size={18} />
            <span className="font-semibold text-sm">Escáner de Código</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-surface-700/50 transition-colors" aria-label="Cerrar escáner">
            <FiX size={18} />
          </button>
        </div>

        <div className="p-5 flex flex-col items-center">
          {errorMsg ? (
            <div className="text-center py-8 text-red-400">
              <FiAlertCircle size={40} className="mx-auto mb-3" />
              <p className="text-sm">{errorMsg}</p>
            </div>
          ) : (
            <>
              <p className="text-slate-400 text-xs text-center mb-4">
                Apunta la cámara al código de barras del producto.
              </p>
              <div id="scanner-reader" className="w-full rounded-lg overflow-hidden border-2 border-brand-tertiary/40" style={{ minHeight: '250px', background: '#000' }} />
              {!scanning && !errorMsg && (
                <p className="mt-4 text-brand-accent text-xs font-medium animate-pulse">
                  Procesando código...
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
