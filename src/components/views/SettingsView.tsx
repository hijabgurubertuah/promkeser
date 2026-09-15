import React, { useState } from 'react';
import {
  Settings,
  Database,
  RefreshCw,
  Shield,
  Download,
  Upload,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  ExternalLink,
  Copy,
  Check,
  Link2,
  Code2,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GoogleAppsScriptModal } from '../modals/GoogleAppsScriptModal';

export const SettingsView: React.FC = () => {
  const {
    currentProfile,
    setCurrentProfile,
    profiles,
    backupDataToJSON,
    restoreDataFromJSON,
    triggerLiveSync,
    isLiveSyncing,
    resetToInitialData,
    googleSheetUrl,
    setGoogleSheetUrl,
    lastSyncTime,
    showToast,
    transactions,
  } = useApp();

  const [restoreSuccess, setRestoreSuccess] = useState(false);
  const [inputUrl, setInputUrl] = useState(googleSheetUrl || '');
  const [copiedGSheetData, setCopiedGSheetData] = useState(false);
  const [isAppsScriptModalOpen, setIsAppsScriptModalOpen] = useState(false);

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setGoogleSheetUrl(inputUrl.trim());
    showToast('Tautan Google Spreadsheet berhasil disimpan!');
  };

  const handleCopyGSheetsFormattedData = () => {
    const headers = ['No Ref', 'Tanggal', 'Uraian Transaksi', 'Kategori', 'Arus Kas', 'Nominal (Rp)', 'Penanggung Jawab'];
    const rows = transactions.map((t) => [
      t.noRef,
      t.tanggal,
      t.uraian,
      t.kategori,
      t.arus,
      t.nominal,
      t.penanggungJawab,
    ]);

    const tsvContent = [headers.join('\t'), ...rows.map((r) => r.join('\t'))].join('\n');
    navigator.clipboard.writeText(tsvContent).then(() => {
      setCopiedGSheetData(true);
      setTimeout(() => setCopiedGSheetData(false), 2500);
      showToast('Data tabel kas berhasil disalin! Silakan buka Google Sheet dan tekan Paste (Ctrl+V).');
    });
  };

  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = restoreDataFromJSON(content);
      if (success) {
        setRestoreSuccess(true);
        setTimeout(() => setRestoreSuccess(false), 3000);
      } else {
        alert('Gagal memulihkan cadangan: format file tidak valid.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-850 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-1.5 h-6 bg-red-600 rounded-full inline-block"></span>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Pengaturan Sistem & Tata Kelola Data SIPAG
          </h1>
        </div>
        <p className="text-xs text-slate-500 pl-3.5 leading-relaxed">
          Manajemen integrasi Google Drive, pencadangan database lokal, dan pengujian otorisasi peran (RBAC)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backup & Restore Data */}
        <div className="bg-white dark:bg-slate-850 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-orange-600" />
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Cadangkan & Pulihkan Database
            </h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Data disimpan aman di browser dan dapat diekspor menjadi berkas JSON untuk arsip mandiri pengurus.
          </p>

          <div className="space-y-3 pt-1">
            <button
              onClick={backupDataToJSON}
              className="w-full py-2.5 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Cadangan Lengkap (.JSON)</span>
            </button>

            <div>
              <label className="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer border border-slate-200 dark:border-slate-700 transition">
                <Upload className="w-4 h-4 text-slate-500" />
                <span>Pulihkan Data dari Berkas JSON</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleFileRestore}
                />
              </label>
            </div>

            {restoreSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2 border border-emerald-200 dark:border-emerald-800 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Database berhasil dipulihkan dari berkas cadangan!</span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => {
                if (confirm('Yakin ingin mereset data aplikasi ke data bawaan awal?')) {
                  resetToInitialData();
                }
              }}
              className="text-xs text-red-600 hover:text-red-700 font-semibold cursor-pointer"
            >
              Reset ke Pengaturan & Data Awal Bawaan
            </button>
          </div>
        </div>
      </div>

      {/* Role Switcher in Settings */}
      <div className="bg-white dark:bg-slate-850 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-red-600" />
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            Simulasi Hak Akses Pengguna (Role-Based Access Control)
          </h3>
        </div>
        <p className="text-xs text-slate-500">
          Uji coba fungsionalitas dengan berganti profil pengguna antara Bendahara, Admin, Pengurus, dan Anggota:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {profiles.map((p) => {
            const isSelected = p.id === currentProfile.id;
            return (
              <div
                key={p.id}
                onClick={() => setCurrentProfile(p)}
                className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                  isSelected
                    ? 'border-orange-500 bg-orange-50/70 dark:bg-orange-950/40 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <img src={p.avatarUrl} alt={p.name} className="w-8 h-8 rounded-full object-cover" />
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-xs">{p.name}</h4>
                    <span className="text-[10px] uppercase font-bold text-orange-600 block">{p.role}</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">{p.title}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Google Apps Script Guide & Code Modal */}
      <GoogleAppsScriptModal
        isOpen={isAppsScriptModalOpen}
        onClose={() => setIsAppsScriptModalOpen(false)}
      />
    </div>
  );
};
