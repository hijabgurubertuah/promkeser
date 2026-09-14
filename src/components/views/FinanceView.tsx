import React, { useState } from 'react';
import {
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  Search,
  Filter,
  FileDown,
  Plus,
  Minus,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Building,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TransactionType } from '../../types';

export const FinanceView: React.FC = () => {
  const {
    transactions,
    totalSaldo,
    totalPemasukan2026,
    totalPengeluaran2026,
    openAddTxModal,
    openReceiptModal,
    triggerLiveSync,
    isLiveSyncing,
  } = useApp();

  const [filterType, setFilterType] = useState<'all' | 'pemasukan' | 'pengeluaran'>('all');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredTransactions = transactions.filter((t) => {
    const matchType = filterType === 'all' || t.jenis === filterType;
    const matchCat = categoryFilter === 'all' || t.kategori === categoryFilter;
    const matchSearch =
      t.uraian.toLowerCase().includes(search.toLowerCase()) ||
      t.noRef.toLowerCase().includes(search.toLowerCase()) ||
      t.puskesmasAtauSatker.toLowerCase().includes(search.toLowerCase());
    return matchType && matchCat && matchSearch;
  });

  const categories = Array.from(new Set(transactions.map((t) => t.kategori)));

  const handleExportCSV = () => {
    const headers = 'No Ref,Tanggal,Jenis,Kategori,Uraian,Satker,Nominal,Saldo,Status\n';
    const rows = transactions
      .map(
        (t) =>
          `"${t.noRef}","${t.tanggal}","${t.jenis}","${t.kategori}","${t.uraian}","${t.puskesmasAtauSatker}",${t.nominal},${t.saldoSetelah},"${t.statusVerifikasi}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Buku_Kas_SIPAG_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-6 bg-red-600 rounded-full inline-block"></span>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Buku Kas & Mutasi Rekening
            </h1>
          </div>
          <p className="text-xs text-slate-500 pl-3.5">
            Pencatatan Debet-Kredit ganda real-time dengan bukti lampiran digital terverifikasi
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => openAddTxModal('pemasukan')}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Pemasukan</span>
          </button>
          <button
            onClick={() => openAddTxModal('pengeluaran')}
            className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition"
          >
            <Minus className="w-4 h-4" />
            <span>Catat Pengeluaran</span>
          </button>
        </div>
      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-850 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Saldo Kas Riil Saat Ini</span>
            <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
            Rp {totalSaldo.toLocaleString('id-ID')}
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Terekonsiliasi dengan Bank Jatim Rek. 034
          </div>
        </div>

        <div className="bg-white dark:bg-slate-850 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Akumulasi Debet (Masuk)</span>
            <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-extrabold font-mono text-emerald-600">
            Rp {totalPemasukan2026.toLocaleString('id-ID')}
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Iuran Triwulan & Pelunasan Tunggakan
          </div>
        </div>

        <div className="bg-white dark:bg-slate-850 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Akumulasi Kredit (Keluar)</span>
            <span className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-extrabold font-mono text-red-600">
            Rp {totalPengeluaran2026.toLocaleString('id-ID')}
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Realisasi Musda, Pelatihan KAP & Konsumsi
          </div>
        </div>
      </div>

      {/* Filter and Ledger Table */}
      <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-semibold overflow-x-auto no-scrollbar max-w-full">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-md cursor-pointer transition whitespace-nowrap ${
                filterType === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Semua ({transactions.length})
            </button>
            <button
              onClick={() => setFilterType('pemasukan')}
              className={`px-3 py-1.5 rounded-md cursor-pointer transition whitespace-nowrap ${
                filterType === 'pemasukan'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Debet
            </button>
            <button
              onClick={() => setFilterType('pengeluaran')}
              className={`px-3 py-1.5 rounded-md cursor-pointer transition whitespace-nowrap ${
                filterType === 'pengeluaran'
                  ? 'bg-white dark:bg-slate-700 text-red-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Kredit
            </button>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-52 min-w-[140px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari uraian..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300"
            >
              <option value="all">Kategori</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
              title="Unduh file Excel/CSV"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* Mutasi Ledger Table */}
        <div className="overflow-x-auto -mx-5 px-5 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[760px] text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                <th className="py-3 px-3">NO. REF</th>
                <th className="py-3 px-3">TANGGAL</th>
                <th className="py-3 px-3">URAIAN TRANSAKSI</th>
                <th className="py-3 px-3">KATEGORI</th>
                <th className="py-3 px-3">SATUAN KERJA</th>
                <th className="py-3 px-3 text-right">MUTASI (RP)</th>
                <th className="py-3 px-3 text-right">SALDO KAS (RP)</th>
                <th className="py-3 px-3 text-center">BUKTI STRUK</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3 font-mono font-bold text-red-600 dark:text-red-400 whitespace-nowrap">
                    {tx.noRef}
                  </td>
                  <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                    {tx.tanggal}
                  </td>
                  <td className="py-3 px-3 text-slate-900 dark:text-white max-w-xs">
                    <div className="font-semibold">{tx.uraian}</div>
                    <div className="text-[10px] text-slate-400">Dicatat oleh {tx.dicatatOleh}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {tx.kategori}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {tx.puskesmasAtauSatker}
                  </td>
                  <td
                    className={`py-3 px-3 text-right font-mono font-extrabold whitespace-nowrap ${
                      tx.jenis === 'pemasukan' ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {tx.jenis === 'pemasukan' ? '+' : '-'} Rp {tx.nominal.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                    Rp {tx.saldoSetelah.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <button
                      onClick={() =>
                        openReceiptModal({
                          title: `Kwitansi Bukti - ${tx.noRef}`,
                          file: tx.buktiFile || 'Bukti_Digital.pdf',
                          nominal: tx.nominal,
                          puskesmas: tx.puskesmasAtauSatker,
                          uraian: tx.uraian,
                          date: tx.tanggal,
                        })
                      }
                      className="p-1 text-slate-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-slate-700 rounded transition cursor-pointer"
                      title="Lihat Bukti Berkas Google Drive"
                    >
                      <ExternalLink className="w-3.5 h-3.5 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="py-10 text-center text-xs text-slate-500">
            Tidak ada data transaksi yang cocok dengan filter pencarian.
          </div>
        )}
      </div>
    </div>
  );
};
