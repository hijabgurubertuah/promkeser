import React, { useState } from 'react';
import {
  FolderArchive,
  Search,
  FileText,
  ExternalLink,
  Upload,
  Download,
  ShieldCheck,
  Cloud,
  CheckCircle2,
  HardDrive,
  Clock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DocumentItem } from '../../types';

export const DocumentsView: React.FC = () => {
  const { documents, openReceiptModal } = useApp();
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filteredDocs = documents.filter((doc) => {
    const matchCat = filterCategory === 'all' || doc.kategori === filterCategory;
    const matchSearch =
      doc.judul.toLowerCase().includes(search.toLowerCase()) ||
      (doc.nomorSurat && doc.nomorSurat.toLowerCase().includes(search.toLowerCase())) ||
      doc.diunggahOleh.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-6 bg-red-600 rounded-full inline-block"></span>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Arsip Digital & Google Drive Vault
            </h1>
          </div>
          <p className="text-xs text-slate-500 pl-3.5">
            Penyimpanan terpusat seluruh bukti setor, kwitansi belanja, proposal RAB, dan dokumen legal paguyuban
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5">
            <Cloud className="w-4 h-4 text-emerald-500" />
            <span>Google Drive Terkoneksi</span>
          </div>
        </div>
      </div>

      {/* Cloud Storage Status Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Total Berkas Terindeks</span>
          <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white mt-1">
            {documents.length} File
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Tersimpan dalam 4 kategori arsip</p>
        </div>

        <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Kapasitas Cloud Terpakai</span>
          <div className="text-2xl font-extrabold font-mono text-orange-600 mt-1">
            18.4 MB
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Google Workspace Dinkes Malang</p>
        </div>

        <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-emerald-600 block">Integritas Hash Bukti</span>
          <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-1 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>100% SHA-256 Valid</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Bebas manipulasi & anti-duplikasi</p>
        </div>
      </div>

      {/* Filter and Documents Table */}
      <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1.5 rounded-md cursor-pointer transition ${
                filterCategory === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Semua ({documents.length})
            </button>
            <button
              onClick={() => setFilterCategory('LPJ')}
              className={`px-3 py-1.5 rounded-md cursor-pointer transition ${
                filterCategory === 'LPJ'
                  ? 'bg-white dark:bg-slate-700 text-red-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              LPJ
            </button>
            <button
              onClick={() => setFilterCategory('Laporan Keuangan')}
              className={`px-3 py-1.5 rounded-md cursor-pointer transition ${
                filterCategory === 'Laporan Keuangan'
                  ? 'bg-white dark:bg-slate-700 text-orange-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Laporan Keuangan
            </button>
            <button
              onClick={() => setFilterCategory('AD/ART')}
              className={`px-3 py-1.5 rounded-md cursor-pointer transition ${
                filterCategory === 'AD/ART'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              AD/ART
            </button>
            <button
              onClick={() => setFilterCategory('SK')}
              className={`px-3 py-1.5 rounded-md cursor-pointer transition ${
                filterCategory === 'SK'
                  ? 'bg-white dark:bg-slate-700 text-purple-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              SK & Kepengurusan
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama berkas, nomor surat..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                <th className="py-3 px-3">NAMA DOKUMEN & NOMOR SURAT</th>
                <th className="py-3 px-3">KATEGORI</th>
                <th className="py-3 px-3">UKURAN FILE</th>
                <th className="py-3 px-3">TANGGAL BERKAS</th>
                <th className="py-3 px-3">DIUNGGAH OLEH</th>
                <th className="py-3 px-3 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950 text-orange-600 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {doc.judul}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {doc.nomorSurat || 'Arsip-Digital.pdf'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {doc.kategori}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-500 font-mono whitespace-nowrap">
                    {doc.ukuranFile}
                  </td>
                  <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                    {doc.tanggal}
                  </td>
                  <td className="py-3 px-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    {doc.diunggahOleh}
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <button
                      onClick={() =>
                        openReceiptModal({
                          title: doc.judul,
                          file: doc.nomorSurat || 'Dokumen_Resmi.pdf',
                          date: doc.tanggal,
                          uraian: `Kategori: ${doc.kategori} • Diunggah oleh ${doc.diunggahOleh}`,
                        })
                      }
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-orange-600 text-xs font-semibold cursor-pointer transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-orange-500" />
                      <span>Buka Berkas</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredDocs.length === 0 && (
          <div className="py-10 text-center text-xs text-slate-500">
            Tidak ada dokumen yang sesuai dengan kriteria pencarian.
          </div>
        )}
      </div>
    </div>
  );
};
