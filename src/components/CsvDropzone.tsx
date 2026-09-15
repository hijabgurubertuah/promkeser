import React, { useState, useEffect, useCallback } from 'react';
import { UploadCloud, FileSpreadsheet } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { parsePromkeserCSV } from '../utils/csvParser';

export const CsvDropzone: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { importCsvData, showToast } = useApp();

  const handleDragEnter = useCallback((e: React.DragEvent | DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer?.types.includes('Files')) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent | DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set dragging to false if we leave the actual window
    if (e.clientX === 0 && e.clientY === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent | DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent | DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer?.files;
      if (!files || files.length === 0) return;

      const file = files[0];
      if (!file.name.toLowerCase().endsWith('.csv')) {
        showToast('Hanya file CSV yang didukung untuk impor langsung!', 'error');
        return;
      }

      setIsProcessing(true);
      try {
        const { newMembers, newTransactions } = await parsePromkeserCSV(file);
        
        if (newMembers.length === 0 && newTransactions.length === 0) {
          showToast('Tidak ada data valid yang ditemukan dalam CSV.', 'error');
        } else {
          importCsvData(newMembers, newTransactions);
        }
      } catch (error) {
        console.error(error);
        showToast('Gagal memproses file CSV.', 'error');
      } finally {
        setIsProcessing(false);
      }
    },
    [importCsvData, showToast]
  );

  useEffect(() => {
    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, [handleDragEnter, handleDragLeave, handleDragOver, handleDrop]);

  return (
    <div className="relative w-full h-full min-h-screen">
      {children}

      {/* Drop Overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-emerald-900/40 backdrop-blur-sm border-8 border-emerald-500 border-dashed m-4 rounded-3xl animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4 animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center">
              <UploadCloud className="w-10 h-10" />
            </div>
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Lepaskan File CSV Di Sini</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Aplikasi akan otomatis mengurai tab, anggota, dan keuangan
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 px-6 py-5 rounded-2xl shadow-2xl flex items-center gap-4">
            <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Memproses Data CSV...</h3>
              <p className="text-xs text-slate-500">Mohon tunggu sebentar, data sedang disinkronisasi.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
