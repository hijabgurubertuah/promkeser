import React, { useState, useMemo, useEffect } from 'react';
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
  Printer,
  Trash2,
  Eye,
  Calendar,
  AlertCircle,
  Info,
  Tag,
  X,
  Copy,
  Check,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CashTransaction, TransactionType } from '../../types';

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
    currentProfile,
    deleteTransaction,
    searchQuery,
  } = useApp();

  const [filterType, setFilterType] = useState<'all' | 'pemasukan' | 'pengeluaran'>('all');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [selectedTx, setSelectedTx] = useState<(CashTransaction & { calculatedBalance: number }) | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  // Sync global search from header if present
  useEffect(() => {
    if (searchQuery) {
      setSearch(searchQuery);
    }
  }, [searchQuery]);

  // Compute rolling balance (saldoSetelah) mathematically for each transaction
  // Transactions are ordered latest first (descending)
  const transactionsWithBalance = useMemo(() => {
    let currentBal = totalSaldo;
    return transactions.map((t) => {
      const balanceAfterThis = currentBal;
      // Reverse-calculate balance before this transaction for the older transaction
      currentBal = currentBal - (t.jenis === 'pemasukan' ? t.nominal : -t.nominal);
      return {
        ...t,
        calculatedBalance: balanceAfterThis,
      };
    });
  }, [transactions, totalSaldo]);

  // Extract distinct months from transactions (e.g., 'Okt 2026', 'Sep 2026')
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    transactions.forEach((t) => {
      // t.tanggal typically '17 Okt 2026' or '17/10/2026'
      const parts = t.tanggal.split(' ');
      if (parts.length >= 3) {
        months.add(`${parts[1]} ${parts[2]}`);
      }
    });
    return Array.from(months);
  }, [transactions]);

  const categories = useMemo(() => {
    return Array.from(new Set(transactions.map((t) => t.kategori)));
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactionsWithBalance.filter((t) => {
      const matchType = filterType === 'all' || t.jenis === filterType;
      const matchCat = categoryFilter === 'all' || t.kategori === categoryFilter;
      const matchMonth =
        monthFilter === 'all' ||
        t.tanggal.toLowerCase().includes(monthFilter.toLowerCase());
      const query = search.trim().toLowerCase();
      const matchSearch =
        !query ||
        t.uraian.toLowerCase().includes(query) ||
        t.noRef.toLowerCase().includes(query) ||
        t.puskesmasAtauSatker.toLowerCase().includes(query) ||
        t.kategori.toLowerCase().includes(query) ||
        (t.dibuatOleh && t.dibuatOleh.toLowerCase().includes(query));

      return matchType && matchCat && matchMonth && matchSearch;
    });
  }, [transactionsWithBalance, filterType, categoryFilter, monthFilter, search]);

  // Filtered totals
  const filteredDebet = useMemo(
    () =>
      filteredTransactions
        .filter((t) => t.jenis === 'pemasukan')
        .reduce((sum, t) => sum + t.nominal, 0),
    [filteredTransactions]
  );

  const filteredKredit = useMemo(
    () =>
      filteredTransactions
        .filter((t) => t.jenis === 'pengeluaran')
        .reduce((sum, t) => sum + t.nominal, 0),
    [filteredTransactions]
  );

  const handleCopyRef = (refText: string) => {
    navigator.clipboard.writeText(refText);
    setCopiedRef(refText);
    setTimeout(() => setCopiedRef(null), 2000);
  };

  const handleExportCSV = () => {
    const headers = 'No Ref,Tanggal,Jenis,Kategori,Uraian,Satker / Puskesmas,Mutasi (Rp),Saldo Setelah (Rp),Dibuat Oleh,Status Audit\n';
    const rows = filteredTransactions
      .map((t) => {
        const jenisLabel = t.jenis === 'pemasukan' ? 'Debet (Masuk)' : 'Kredit (Keluar)';
        const signedNominal = t.jenis === 'pemasukan' ? t.nominal : -t.nominal;
        const cleanUraian = t.uraian.replace(/"/g, '""');
        const cleanSatker = t.puskesmasAtauSatker.replace(/"/g, '""');
        const pembuat = (t.dibuatOleh || 'Arik Agung, S.KM').replace(/"/g, '""');
        return `"${t.noRef}","${t.tanggal}","${jenisLabel}","${t.kategori}","${cleanUraian}","${cleanSatker}",${signedNominal},${t.calculatedBalance},"${pembuat}","${t.statusAudit}"`;
      })
      .join('\n');

    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Buku_Kas_Mutasi_Promkeser_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const canManage = currentProfile.role === 'bendahara' || currentProfile.role === 'admin';

  return (
    <div className="space-y-6 pb-12 print:p-0 print:space-y-3">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-6 bg-red-600 rounded-full inline-block"></span>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Buku Kas & Mutasi Rekening
            </h1>
            <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Ledger
            </span>
          </div>
          <p className="text-xs text-slate-500 pl-3.5">
            Pencatatan Debet-Kredit ganda real-time dengan rekonsiliasi kas dan bukti digital terlampir
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={triggerLiveSync}
            disabled={isLiveSyncing}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700 transition"
            title="Sinkronisasi dengan Google Sheets API"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLiveSyncing ? 'animate-spin text-orange-500' : ''}`} />
            <span className="hidden sm:inline">Sinkronisasi</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700 transition"
            title="Cetak format laporan Buku Kas"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cetak</span>
          </button>

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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print:grid-cols-3 print:gap-2">
        <div className="bg-white dark:bg-slate-850 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Saldo Kas Riil Saat Ini</span>
            <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
            Rp {totalSaldo.toLocaleString('id-ID')}
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Terekonsiliasi Bank Jatim Rek. 034
          </div>
        </div>

        <div className="bg-white dark:bg-slate-850 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Akumulasi Debet (Masuk)</span>
            <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
            Rp {totalPemasukan2026.toLocaleString('id-ID')}
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Iuran Rutin Triwulan & Pelunasan Tunggakan
          </div>
        </div>

        <div className="bg-white dark:bg-slate-850 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Akumulasi Kredit (Keluar)</span>
            <span className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-extrabold font-mono text-red-600 dark:text-red-400">
            Rp {totalPengeluaran2026.toLocaleString('id-ID')}
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Realisasi Musda, Pelatihan KAP & Operasional
          </div>
        </div>
      </div>

      {/* Filter and Ledger Table */}
      <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4">
        {/* Controls Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800 print:hidden">
          {/* Filter Type Pills */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold overflow-x-auto no-scrollbar max-w-full">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition whitespace-nowrap ${
                filterType === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              Semua ({transactions.length})
            </button>
            <button
              onClick={() => setFilterType('pemasukan')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition whitespace-nowrap flex items-center gap-1 ${
                filterType === 'pemasukan'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600" />
              <span>Debet (Masuk)</span>
            </button>
            <button
              onClick={() => setFilterType('pengeluaran')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition whitespace-nowrap flex items-center gap-1 ${
                filterType === 'pengeluaran'
                  ? 'bg-white dark:bg-slate-700 text-red-600 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-red-600" />
              <span>Kredit (Keluar)</span>
            </button>
          </div>

          {/* Search and Dropdown Filters */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-56 min-w-[140px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari uraian, ref, satker..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Month Filter */}
            {availableMonths.length > 0 && (
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">Semua Periode</option>
                {availableMonths.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            )}

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0 border border-slate-200 dark:border-slate-700"
              title="Unduh data dalam format Excel/CSV"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Unduh CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Recap Bar */}
        {(filterType !== 'all' || categoryFilter !== 'all' || monthFilter !== 'all' || search) && (
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Filter className="w-3.5 h-3.5 text-orange-500" />
              <span>
                Filter aktif menampilkan <b className="text-slate-900 dark:text-white">{filteredTransactions.length}</b> dari {transactions.length} mutasi:
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-emerald-600 font-bold">
                Debet: +Rp {filteredDebet.toLocaleString('id-ID')}
              </span>
              <span className="text-red-600 font-bold">
                Kredit: -Rp {filteredKredit.toLocaleString('id-ID')}
              </span>
              <span className="text-slate-700 dark:text-slate-200 font-bold">
                Net: Rp {(filteredDebet - filteredKredit).toLocaleString('id-ID')}
              </span>
              <button
                onClick={() => {
                  setFilterType('all');
                  setCategoryFilter('all');
                  setMonthFilter('all');
                  setSearch('');
                }}
                className="text-xs text-orange-600 dark:text-orange-400 hover:underline font-sans cursor-pointer ml-1"
              >
                Reset Filter
              </button>
            </div>
          </div>
        )}

        {/* Mutasi Ledger Table */}
        <div className="overflow-x-auto -mx-5 px-5 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[780px] text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                <th className="py-3 px-3">NO. REF</th>
                <th className="py-3 px-3">TANGGAL</th>
                <th className="py-3 px-3">URAIAN TRANSAKSI</th>
                <th className="py-3 px-3">KATEGORI POS</th>
                <th className="py-3 px-3">SATKER / ASAL</th>
                <th className="py-3 px-3 text-right">MUTASI (RP)</th>
                <th className="py-3 px-3 text-right">SALDO KAS (RP)</th>
                <th className="py-3 px-3 text-center print:hidden">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filteredTransactions.map((tx) => (
                <tr
                  key={tx.id}
                  onClick={() => setSelectedTx(tx)}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition cursor-pointer group"
                >
                  <td className="py-3 px-3 font-mono font-bold text-red-600 dark:text-red-400 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span>{tx.noRef}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyRef(tx.noRef);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        title="Salin No Ref"
                      >
                        {copiedRef === tx.noRef ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {tx.tanggal}
                  </td>
                  <td className="py-3 px-3 text-slate-900 dark:text-white max-w-xs">
                    <div className="font-semibold line-clamp-1">{tx.uraian}</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <span>Dicatat oleh: {tx.dibuatOleh || 'Arik Agung (Bendahara)'}</span>
                      {tx.statusAudit === 'tervalidasi' && (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                          • <CheckCircle2 className="w-2.5 h-2.5 inline" /> Valid
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {tx.kategori}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {tx.puskesmasAtauSatker}
                  </td>
                  <td
                    className={`py-3 px-3 text-right font-mono font-extrabold whitespace-nowrap ${
                      tx.jenis === 'pemasukan'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    <span className="inline-block mr-1">{tx.jenis === 'pemasukan' ? '+' : '-'}</span>
                    Rp {tx.nominal.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                    Rp {tx.calculatedBalance.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap print:hidden" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1">
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
                        className="p-1.5 text-slate-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-slate-750 rounded-lg transition cursor-pointer"
                        title="Buka Berkas Bukti Digital"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setSelectedTx(tx)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-750 rounded-lg transition cursor-pointer"
                        title="Lihat Detail Transaksi"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {canManage && (
                        <button
                          onClick={() => setDeleteConfirmId(tx.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-750 rounded-lg transition cursor-pointer"
                          title="Hapus / Void Mutasi Kas"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              Tidak ada data transaksi yang cocok dengan filter.
            </p>
            <p className="text-[11px] text-slate-400">
              Coba sesuaikan kata kunci pencarian atau ubah filter periode/kategori.
            </p>
          </div>
        )}

        {/* Footer Summary */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>
            Menampilkan <b>{filteredTransactions.length}</b> dari total <b>{transactions.length}</b> transaksi kas terekonsiliasi tahun 2026
          </span>
          <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
            Posisi Kas Akhir: Rp {totalSaldo.toLocaleString('id-ID')}
          </span>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in print:hidden">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    selectedTx.jenis === 'pemasukan'
                      ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300'
                      : 'bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-300'
                  }`}
                >
                  {selectedTx.jenis === 'pemasukan' ? (
                    <ArrowDownRight className="w-4 h-4" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Detail Mutasi Buku Kas
                  </h3>
                  <p className="text-[11px] font-mono text-red-600 dark:text-red-400 font-bold">
                    {selectedTx.noRef}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Nominal Banner */}
              <div
                className={`p-4 rounded-xl border ${
                  selectedTx.jenis === 'pemasukan'
                    ? 'bg-emerald-50/70 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800/50'
                    : 'bg-red-50/70 border-red-200 dark:bg-red-950/30 dark:border-red-800/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold">
                    {selectedTx.jenis === 'pemasukan' ? 'Debet (Pemasukan Kas)' : 'Kredit (Pengeluaran Kas)'}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      selectedTx.jenis === 'pemasukan'
                        ? 'bg-emerald-200 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                        : 'bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}
                  >
                    {selectedTx.jenis === 'pemasukan' ? '+ MASUK' : '- KELUAR'}
                  </span>
                </div>
                <div
                  className={`mt-1 text-2xl font-mono font-extrabold ${
                    selectedTx.jenis === 'pemasukan'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {selectedTx.jenis === 'pemasukan' ? '+' : '-'} Rp {selectedTx.nominal.toLocaleString('id-ID')}
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                  <span>Posisi Saldo Setelah Mutasi:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    Rp {selectedTx.calculatedBalance.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Data Grid */}
              <div className="space-y-2.5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Tanggal Transaksi</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                      {selectedTx.tanggal}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Status Audit</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Tervalidasi BPK
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Uraian / Deskripsi Lengkap</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-1 leading-relaxed">
                    {selectedTx.uraian}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Kategori Pos</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                      {selectedTx.kategori}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Satuan Kerja / Asal</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                      {selectedTx.puskesmasAtauSatker}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Pencatat Mutasi</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                    {selectedTx.dibuatOleh || 'Arik Agung, S.KM (Bendahara Paguyuban)'}
                  </span>
                </div>
              </div>

              {/* Bukti File Button */}
              <div className="p-3.5 bg-orange-50 dark:bg-orange-950/30 rounded-xl border border-orange-200 dark:border-orange-800/50 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-orange-600" />
                    <span>Lampiran Bukti Digital</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {selectedTx.buktiFile || 'Kwitansi_Nota_Digital.pdf'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    openReceiptModal({
                      title: `Kwitansi Bukti - ${selectedTx.noRef}`,
                      file: selectedTx.buktiFile || 'Bukti_Digital.pdf',
                      nominal: selectedTx.nominal,
                      puskesmas: selectedTx.puskesmasAtauSatker,
                      uraian: selectedTx.uraian,
                      date: selectedTx.tanggal,
                    });
                  }}
                  className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer transition shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka Bukti</span>
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between">
              {canManage && (
                <button
                  onClick={() => {
                    const idToDelete = selectedTx.id;
                    setSelectedTx(null);
                    setDeleteConfirmId(idToDelete);
                  }}
                  className="text-red-600 hover:text-red-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Mutasi</span>
                </button>
              )}
              <div className="ml-auto">
                <button
                  onClick={() => setSelectedTx(null)}
                  className="px-4 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold cursor-pointer transition"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in print:hidden">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-sm w-full p-5 space-y-4">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Hapus Entri Transaksi Kas?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tindakan ini akan membatalkan transaksi dari Buku Kas dan memperbarui saldo kas riil secara otomatis.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl cursor-pointer transition"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  deleteTransaction(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl cursor-pointer transition shadow-xs"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
