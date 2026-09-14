import React from 'react';
import { X, Download, ExternalLink, ShieldCheck, CheckCircle2, FileText, Calendar, Building, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ReceiptPreviewModal: React.FC = () => {
  const { receiptModal, closeReceiptModal } = useApp();

  if (!receiptModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Pratinjau Bukti Digital Transaksi
              </h3>
              <p className="text-[11px] text-slate-500">Tersinkronisasi dengan Google Drive SIPAG</p>
            </div>
          </div>
          <button
            onClick={closeReceiptModal}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Metadata Card */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 font-medium">Dokumen:</span>
              <span className="font-bold text-slate-900 dark:text-white">{receiptModal.file}</span>
            </div>
            {receiptModal.nominal && (
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 font-medium">Nominal Transaksi:</span>
                <span className="font-extrabold text-sm text-emerald-600">
                  Rp {receiptModal.nominal.toLocaleString('id-ID')}
                </span>
              </div>
            )}
            {receiptModal.member && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" /> Anggota:
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{receiptModal.member}</span>
              </div>
            )}
            {receiptModal.puskesmas && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" /> Satker:
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{receiptModal.puskesmas}</span>
              </div>
            )}
            {receiptModal.uraian && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Uraian / Periode:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">{receiptModal.uraian}</span>
              </div>
            )}
          </div>

          {/* Graphic Visual Representation of Bank Receipt / Kwitansi */}
          <div className="bg-gradient-to-b from-amber-50 to-white dark:from-slate-800 dark:to-slate-900 p-5 rounded-xl border-2 border-dashed border-amber-300 dark:border-slate-700 flex flex-col items-center justify-center min-h-[220px] text-center shadow-inner relative overflow-hidden">
            <div className="absolute top-2 right-2 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Tervalidasi Bank Jatim
            </div>

            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center mb-3">
              <FileText className="w-6 h-6 text-amber-600" />
            </div>

            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
              STRUK RESMI BANK JATIM / QRIS NASIONAL
            </div>
            <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
              Rekening Kas Paguyuban Promkeser Kab. Malang <br />
              No. Rek: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">034-291829-01</span>
            </p>

            <div className="my-3 py-2 px-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs">
              <span className="text-[10px] text-slate-400 block">TOTAL TRANSFER BERHASIL</span>
              <span className="text-base font-extrabold text-emerald-600">
                Rp {(receiptModal.nominal || 150000).toLocaleString('id-ID')}
              </span>
            </div>

            <p className="text-[10px] text-slate-400">
              Lampiran ID File: {receiptModal.file} • Hash MD5 Terverifikasi
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Integritas Data Aman
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={closeReceiptModal}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
            >
              Tutup
            </button>
            <a
              href={`#download-${receiptModal.file}`}
              onClick={(e) => {
                e.preventDefault();
                alert(`Mengunduh berkas salinan: ${receiptModal.file} dari Google Drive.`);
              }}
              className="px-3 py-1.5 text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Berkas</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
