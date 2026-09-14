import React, { useState } from 'react';
import {
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  Users,
  PieChart,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileDown,
  ExternalLink,
  Plus,
  Minus,
  Target,
  FileText,
  ShieldCheck,
  Building,
  RefreshCw,
  Eye,
  Check,
  X,
  Database,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DashboardView: React.FC = () => {
  const {
    currentProfile,
    setActiveTab,
    theme,
    setTheme,
    isLiveSyncing,
    triggerLiveSync,
    backupDataToJSON,
    openAddTxModal,
    openReceiptModal,
    openSubmitDuesModal,
    openAddActivityModal,
    verificationRequests,
    approveVerification,
    rejectVerification,
    transactions,
    activities,
    totalSaldo,
    totalPemasukan2026,
    totalPengeluaran2026,
    pemasukanReguler2026,
    pelunasan2025,
    complianceRate,
    totalLunasCount,
    totalPendingCount,
    totalTertunggakCount,
    totalPindahSatkerCount,
  } = useApp();

  const [txFilter, setTxFilter] = useState('');

  const pendingList = verificationRequests.filter((v) => v.status === 'pending');

  const filteredTransactions = transactions.filter((t) => {
    if (!txFilter) return true;
    const q = txFilter.toLowerCase();
    return (
      t.noRef.toLowerCase().includes(q) ||
      t.uraian.toLowerCase().includes(q) ||
      t.puskesmasAtauSatker.toLowerCase().includes(q) ||
      t.kategori.toLowerCase().includes(q)
    );
  });

  // Monthly cash flow dummy bars data matching preview: Jan to Sep 2026
  const monthlyData = [
    { month: 'Jan', in: 950000, out: 300000, trend: 650000 },
    { month: 'Feb', in: 850000, out: 250000, trend: 600000 },
    { month: 'Mar', in: 900000, out: 450000, trend: 450000 },
    { month: 'Apr', in: 750000, out: 350000, trend: 400000 },
    { month: 'Mei', in: 1200000, out: 5200000, trend: -4000000 }, // Musda peak
    { month: 'Jun', in: 900000, out: 300000, trend: 600000 },
    { month: 'Jul', in: 950000, out: 400000, trend: 550000 },
    { month: 'Agu', in: 950000, out: 1100000, trend: -150000 },
    { month: 'Sep', in: 1000000, out: 650000, trend: 350000 },
  ];

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-6 bg-red-600 rounded-full inline-block"></span>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Dashboard Utama SIPAG
            </h1>
            <span
              onClick={triggerLiveSync}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 cursor-pointer hover:bg-emerald-100 transition"
              title="Klik untuk menyinkronkan ulang dengan Google Sheets"
            >
              <span className={`w-1.5 h-1.5 rounded-full bg-emerald-500 ${isLiveSyncing ? 'animate-ping' : ''}`}></span>
              <span>{isLiveSyncing ? 'Menyinkronkan...' : 'Live Sync GSheets'}</span>
              <RefreshCw className={`w-3 h-3 ml-0.5 ${isLiveSyncing ? 'animate-spin' : ''}`} />
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-3.5">
            Tata Kelola Keuangan & Akuntabilitas Fungsional Promkeser Kabupaten Malang
          </p>
        </div>

        {/* Theme & Backup Toolbar */}
        <div className="flex items-center gap-2.5">
          {/* Theme Switcher Button Group */}
          <div className="flex items-center bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs shadow-2xs">
            <button
              onClick={() => setTheme('light')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold cursor-pointer transition ${
                theme === 'light' ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-500'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Light</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold cursor-pointer transition ${
                theme === 'dark' ? 'bg-slate-700 text-white' : 'text-slate-500'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Dark</span>
            </button>
          </div>

          {/* Backup Button */}
          <button
            onClick={backupDataToJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 shadow-2xs cursor-pointer transition"
          >
            <Database className="w-3.5 h-3.5 text-orange-500" />
            <span>Cadangkan Data</span>
          </button>
        </div>
      </div>

      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-slate-850 dark:via-slate-900 dark:to-slate-850 rounded-2xl p-6 border border-red-100 dark:border-slate-800 shadow-xs relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              TAHUN ANGGARAN 2026
            </span>
            <span className="text-slate-400 text-[11px]">•</span>
            <span className="text-slate-500 dark:text-slate-400 text-xs flex items-center gap-1">
              <Clock className="w-3 h-3" /> Terakhir diperbarui: 18 Okt 2026, 09:42 WIB
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Selamat Datang, <span className="text-red-600 dark:text-red-400">{currentProfile.name}</span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                Portal operasional keuangan kas Paguyuban Promosi Kesehatan dan Ilmu Perilaku (Promkeser) Kabupaten Malang.
                Seluruh iuran anggota dan realisasi anggaran RAB terekonsiliasi otomatis dengan bukti digital.
              </p>
            </div>

            {/* Quick Action Buttons on Banner */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={() => setActiveTab('iuran')}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 cursor-pointer transition transform hover:-translate-y-0.5"
              >
                <span>Verifikasi Pembayaran</span>
                {totalPendingCount > 0 && (
                  <span className="bg-white text-red-600 text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center">
                    {totalPendingCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => openAddTxModal('pengeluaran')}
                className="px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer transition"
              >
                <Wallet className="w-4 h-4 text-orange-500" />
                <span>Catat Transaksi Kas</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Financial KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Saldo Kas Terekonsiliasi */}
        <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Saldo Kas Terekonsiliasi</span>
            <span className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 text-xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
            Rp {totalSaldo.toLocaleString('id-ID')}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Otomatis Match
            </span>
            <span className="text-slate-400">Bank Jatim Rek. 034</span>
          </div>
        </div>

        {/* Card 2: Total Pemasukan 2026 */}
        <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Pemasukan 2026</span>
            <span className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowDownRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 text-xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
            Rp {totalPemasukan2026.toLocaleString('id-ID')}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span>Reguler 2026: <b className="text-slate-700 dark:text-slate-300">Rp 7.730.000</b></span>
            <span className="text-emerald-600 font-bold">+Rp 720.000 (Pelunasan 2025)</span>
          </div>
        </div>

        {/* Card 3: Total Pengeluaran 2026 */}
        <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Pengeluaran 2026</span>
            <span className="w-6 h-6 rounded-md bg-red-50 text-red-600 flex items-center justify-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 text-xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
            Rp {totalPengeluaran2026.toLocaleString('id-ID')}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span>Musda & Pelatihan KIE</span>
            <span className="text-orange-600 font-bold">68.5% Rasio Kas</span>
          </div>
        </div>

        {/* Card 4: Tingkat Kepatuhan */}
        <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tingkat Kepatuhan</span>
            <span className="w-6 h-6 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
              <PieChart className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 text-xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
            {complianceRate}%
          </div>
          {/* Visual Progress Bar */}
          <div className="mt-2.5 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${complianceRate}%` }}></div>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>{totalLunasCount} Lunas</span>
            <span className="text-red-500 font-bold">{totalTertunggakCount} Tertunggak</span>
          </div>
        </div>

        {/* Card 5: Total Anggota Terdaftar */}
        <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Anggota Terdaftar</span>
            <span className="w-6 h-6 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            51 <span className="text-xs font-normal text-slate-500">Jiwa</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span>44 Aktif Lapangan</span>
            <span className="text-slate-700 dark:text-slate-300 font-semibold">39 Puskesmas Induk</span>
          </div>
        </div>
      </div>

      {/* Middle Grid: Charts (Left) and Approvals/RAB (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col (7 of 12): Arus Kas Chart & Kepatuhan Donut */}
        <div className="lg:col-span-7 space-y-6">
          {/* Chart 1: Arus Kas Bulanan T.A. 2026 */}
          <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Arus Kas Bulanan T.A. 2026
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Realisasi Debet dan Kredit Paguyuban Promkeser (Januari – September 2026)
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-[11px]">
                  <span className="w-2.5 h-2.5 rounded bg-orange-600 inline-block"></span>
                  <span>Pemasukan</span>
                </span>
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-[11px]">
                  <span className="w-2.5 h-2.5 rounded bg-red-600 inline-block"></span>
                  <span>Pengeluaran</span>
                </span>
              </div>
            </div>

            {/* Custom Responsive SVG Chart */}
            <div className="mt-6 pt-4">
              <div className="h-56 flex items-end justify-between gap-2 sm:gap-4 px-2 border-b border-slate-100 dark:border-slate-800">
                {monthlyData.map((d, idx) => {
                  // Normalize height with max 5.200.000 = 100%
                  const maxVal = 5200000;
                  const inHeight = Math.max(12, Math.min(100, (d.in / maxVal) * 100));
                  const outHeight = Math.max(8, Math.min(100, (d.out / maxVal) * 100));

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group relative">
                      {/* Tooltip */}
                      <div className="absolute -top-14 opacity-0 group-hover:opacity-100 pointer-events-none transition bg-slate-900 text-white text-[10px] p-2 rounded shadow-lg whitespace-nowrap z-20">
                        <div className="font-bold">{d.month} 2026</div>
                        <div className="text-orange-400">Masuk: Rp {d.in.toLocaleString('id-ID')}</div>
                        <div className="text-red-400">Keluar: Rp {d.out.toLocaleString('id-ID')}</div>
                      </div>

                      {/* Bars Group */}
                      <div className="w-full flex items-end justify-center gap-1 h-full">
                        {/* Pemasukan Bar */}
                        <div
                          style={{ height: `${inHeight}%` }}
                          className="w-2.5 sm:w-3.5 bg-orange-500 rounded-t-sm transition-all hover:brightness-110"
                        ></div>
                        {/* Pengeluaran Bar */}
                        <div
                          style={{ height: `${outHeight}%` }}
                          className={`w-2.5 sm:w-3.5 rounded-t-sm transition-all hover:brightness-110 ${
                            d.month === 'Mei' ? 'bg-red-600 ring-2 ring-red-300' : 'bg-red-500'
                          }`}
                        ></div>
                      </div>

                      {/* Month Label */}
                      <span className="text-[10px] font-semibold text-slate-500 mt-2">{d.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* May Peak Expense Callout Box */}
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="text-amber-900 dark:text-amber-300 text-[11px]">
                  Lonjakan pengeluaran tertinggi terjadi pada <b>Mei 2026</b> untuk Musyawarah Daerah & Advokasi Fungsional.
                </span>
              </div>
              <span className="text-[10px] font-bold bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded-md shrink-0 ml-2">
                RAB Terpenuhi
              </span>
            </div>
          </div>

          {/* Chart 2: Sebaran Kepatuhan Iuran Bulanan */}
          <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Sebaran Kepatuhan Iuran Bulanan
                </h3>
                <p className="text-[11px] text-slate-500">
                  Total 51 Anggota Terdata dalam Master Database Keuangan
                </p>
              </div>
              <button
                onClick={() => setActiveTab('iuran')}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
              >
                <span>Buku Iuran Lengkap</span>
                <span>&rarr;</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              {/* Donut Visual */}
              <div className="sm:col-span-5 flex flex-col items-center justify-center relative">
                <div className="w-36 h-36 relative flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    {/* Background Ring */}
                    <path
                      className="text-slate-100 dark:text-slate-800 stroke-current"
                      strokeWidth="3.8"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    {/* Lunas Stroke: 78.4% */}
                    <path
                      className="text-emerald-500 stroke-current"
                      strokeDasharray="78.4, 100"
                      strokeWidth="3.8"
                      strokeLinecap="round"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-xl font-extrabold text-slate-900 dark:text-white font-mono leading-none">
                      78.4%
                    </span>
                    <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 mt-1">
                      Efektivitas
                    </span>
                  </div>
                </div>
              </div>

              {/* Breakdown Legend */}
              <div className="sm:col-span-7 space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">Lunas s.d. Bulan Ini</span>
                  </div>
                  <span className="font-extrabold text-slate-900 dark:text-white font-mono">{totalLunasCount} Orang</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">Menunggu Verifikasi Bukti</span>
                  </div>
                  <span className="font-extrabold text-amber-600 font-mono">{totalPendingCount} Slip</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">Tunggakan Iuran (&gt;2 Bln)</span>
                  </div>
                  <span className="font-extrabold text-red-600 font-mono">{totalTertunggakCount} Orang</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">Pindah Satker / Tugas Belajar</span>
                  </div>
                  <span className="font-extrabold text-slate-500 font-mono">{totalPindahSatkerCount} Historis</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col (5 of 12): Verifikasi Setoran Iuran & Kontrol RAB */}
        <div className="lg:col-span-5 space-y-6">
          {/* Section: Verifikasi Setoran Iuran */}
          <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600"></span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Verifikasi Setoran Iuran
                </h3>
              </div>
              <span className="text-[11px] font-bold text-red-600 bg-red-50 dark:bg-red-950 px-2 py-0.5 rounded-full">
                {pendingList.length} Perlu Approval
              </span>
            </div>

            <p className="text-[11px] text-slate-500 mt-2 mb-3">
              Struk transfer diunggah oleh anggota via Form SIPAG. Bendahara wajib memeriksa kecocokan mutasi bank sebelum approve.
            </p>

            <div className="space-y-3">
              {pendingList.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 hover:border-orange-300 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 text-xs font-bold flex items-center justify-center shrink-0">
                        {item.memberName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                          {item.memberName}, {item.gelar}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {item.puskesmas} • <span className="font-medium text-slate-700 dark:text-slate-300">{item.periodeLabel}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-extrabold text-xs text-slate-900 dark:text-white">
                        Rp {item.nominal.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  {/* Attachment link & Action Buttons */}
                  <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <button
                      onClick={() =>
                        openReceiptModal({
                          title: `Struk Transfer - ${item.memberName}`,
                          file: item.fileBukti,
                          type: item.fileType,
                          nominal: item.nominal,
                          member: `${item.memberName}, ${item.gelar}`,
                          puskesmas: item.puskesmas,
                          uraian: item.periodeLabel,
                        })
                      }
                      className="text-[11px] text-orange-600 dark:text-orange-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer truncate max-w-[140px]"
                    >
                      <FileText className="w-3 h-3" />
                      <span className="truncate">{item.fileBukti}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => rejectVerification(item.id)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-red-600 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition"
                      >
                        Tolak
                      </button>
                      <button
                        onClick={() => approveVerification(item.id)}
                        className="px-3 py-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md flex items-center gap-1 cursor-pointer transition shadow-2xs"
                      >
                        <Check className="w-3 h-3" />
                        <span>Setujui</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {pendingList.length === 0 && (
                <div className="py-8 text-center bg-slate-50 dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Semua Setoran Telah Terverifikasi!
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Tidak ada antrean approval pembayaran iuran saat ini.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Section: Kontrol RAB & Kegiatan */}
          <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-orange-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Kontrol RAB & Kegiatan
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('kegiatan')}
                className="text-xs font-bold text-orange-600 hover:underline cursor-pointer"
              >
                Rincian Kegiatan
              </button>
            </div>

            <div className="mt-3 space-y-3">
              {/* Activity 1: Musda & Temu Ilmiah Promkeser */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                    Musda & Temu Ilmiah Promkeser
                  </h4>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Selesai
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                  <span>RAB: Rp 6.500.000</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Realisasi: Rp 5.200.000
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-2">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '80%' }}></div>
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Efisiensi Kas: Rp 1.300.000 (20%)
                  </span>
                  <span>14 Mei 2026</span>
                </div>
              </div>

              {/* Activity 2: Workshop Komunikasi Antar Pribadi */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                    Workshop Komunikasi Antar Pribadi (KAP)
                  </h4>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    Berjalan
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                  <span>RAB Disetujui: Rp 3.200.000</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Realisasi: Rp 1.100.000
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-2">
                  <div className="bg-orange-500 h-full rounded-full" style={{ width: '34.3%' }}></div>
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Terserap 34.3%</span>
                  <span>Kab. Malang Barat</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lower Section: Buku Kas & Mutasi Terkini Table */}
      <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-red-600" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Buku Kas & Mutasi Terkini
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Catatan transaksi real-time tervalidasi Bendahara dengan berkas lampiran digital Google Drive
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={txFilter}
              onChange={(e) => setTxFilter(e.target.value)}
              placeholder="Filter mutasi atau puskesmas..."
              className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
            <button
              onClick={handleExportPDF}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Ekspor PDF</span>
            </button>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                <th className="py-3 px-3">NO. REF / ID</th>
                <th className="py-3 px-3">TANGGAL</th>
                <th className="py-3 px-3">URAIAN / KETERANGAN TRANSAKSI</th>
                <th className="py-3 px-3">SATUAN KERJA (PUSKESMAS)</th>
                <th className="py-3 px-3 text-right">DEBET / KREDIT</th>
                <th className="py-3 px-3 text-center">STATUS AUDIT</th>
                <th className="py-3 px-3 text-center">BUKTI DIGITAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filteredTransactions.slice(0, 5).map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3 font-mono font-bold text-red-600 dark:text-red-400">
                    {tx.noRef}
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {tx.tanggal}
                  </td>
                  <td className="py-3 px-3 text-slate-900 dark:text-white">
                    <div>{tx.uraian}</div>
                    <div className="text-[10px] text-slate-400">{tx.kategori}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    {tx.puskesmasAtauSatker}
                  </td>
                  <td
                    className={`py-3 px-3 text-right font-mono font-bold whitespace-nowrap ${
                      tx.jenis === 'pemasukan' ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {tx.jenis === 'pemasukan' ? '+ ' : '- '}
                    Rp {tx.nominal.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3 h-3" /> Tervalidasi
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() =>
                        openReceiptModal({
                          title: `Bukti Transaksi - ${tx.noRef}`,
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
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Menampilkan 5 dari total {transactions.length} transaksi terekonsiliasi tahun 2026</span>
          <button
            onClick={() => setActiveTab('keuangan')}
            className="text-orange-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>Buka Buku Kas Selengkapnya</span>
            <span>&rarr;</span>
          </button>
        </div>
      </div>

      {/* Bottom Section: Quick Action Cards (Left) & 5 Pillars Falsafah (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Quick Actions (5 of 12) */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Aksi Cepat Pengurus
          </h3>
          <p className="text-[11px] text-slate-400 -mt-1">
            Pintasan administrasi bendahara & pelaporan kegiatan
          </p>

          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Action 1: Catat Pemasukan */}
            <button
              onClick={() => openAddTxModal('pemasukan')}
              className="p-4 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-400 text-left cursor-pointer transition shadow-2xs group"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-110 transition">
                <Plus className="w-4 h-4" />
              </div>
              <div className="font-bold text-xs text-slate-900 dark:text-white">Catat Pemasukan</div>
              <p className="text-[10px] text-slate-400 mt-0.5">Iuran, hibah & sponsorship</p>
            </button>

            {/* Action 2: Catat Pengeluaran */}
            <button
              onClick={() => openAddTxModal('pengeluaran')}
              className="p-4 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-red-400 text-left cursor-pointer transition shadow-2xs group"
            >
              <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mb-2 group-hover:scale-110 transition">
                <Minus className="w-4 h-4" />
              </div>
              <div className="font-bold text-xs text-slate-900 dark:text-white">Catat Pengeluaran</div>
              <p className="text-[10px] text-slate-400 mt-0.5">Kwitansi & belanja program</p>
            </button>

            {/* Action 3: Ajukan Usul RAB */}
            <button
              onClick={openAddActivityModal}
              className="p-4 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-orange-400 text-left cursor-pointer transition shadow-2xs group"
            >
              <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center mb-2 group-hover:scale-110 transition">
                <Target className="w-4 h-4" />
              </div>
              <div className="font-bold text-xs text-slate-900 dark:text-white">Ajukan Usul RAB</div>
              <p className="text-[10px] text-slate-400 mt-0.5">Proposal kegiatan profesi</p>
            </button>

            {/* Action 4: Data Anggota */}
            <button
              onClick={() => setActiveTab('anggota')}
              className="p-4 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 text-left cursor-pointer transition shadow-2xs group"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition">
                <Users className="w-4 h-4" />
              </div>
              <div className="font-bold text-xs text-slate-900 dark:text-white">Data Anggota</div>
              <p className="text-[10px] text-slate-400 mt-0.5">Status satker 39 PKM</p>
            </button>
          </div>

          {/* Audit Trail info card */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                Integritas & Audit Trail
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Setiap catatan mutasi dihubungkan dengan Google Drive bukti setor dan memiliki cap waktu otomatis tak terhapus.
              </p>
            </div>
          </div>
        </div>

        {/* 5 Pillars Falsafah Gerakan (7 of 12) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-850 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider">
                Falsafah Gerakan • Makna Lambang Paguyuban
              </span>
              <span className="text-[10px] bg-red-50 text-red-700 px-2 py-0.5 rounded font-semibold">
                Kabupaten Malang
              </span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
              5 Pilar Strategi Promosi Kesehatan
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Sesuai dengan lambang 5 figur yang saling terhubung dalam lingkaran harmoni, melambangkan sinergi tanpa henti tenaga promkes di 39 Puskesmas:
            </p>

            {/* 5 Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-xs">
              <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <span className="w-6 h-6 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  1
                </span>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">Pendidikan Kesehatan</span>
                  <p className="text-[11px] text-slate-500">
                    Pembelajaran terus menerus untuk meningkatkan kesadaran dan literasi sehat masyarakat.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <span className="w-6 h-6 rounded-full bg-orange-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  2
                </span>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">Komunikasi Perilaku</span>
                  <p className="text-[11px] text-slate-500">
                    Perubahan perilaku hidup sehat berkesinambungan melalui interaksi dan pesan efektif.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  3
                </span>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">Pemberdayaan Masyarakat</span>
                  <p className="text-[11px] text-slate-500">
                    Menggali dan menguatkan kemandirian kesehatan yang bersumber dari inisiatif warga desa.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  4
                </span>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">Advokasi Kebijakan</span>
                  <p className="text-[11px] text-slate-500">
                    Keberanian menyuarakan hak kesehatan dan mendorong regulasi pro-kesehatan di pemda.
                  </p>
                </div>
              </div>
            </div>

            {/* Pillar 5 Full width */}
            <div className="mt-3 flex items-start gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs">
              <span className="w-6 h-6 rounded-full bg-red-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                5
              </span>
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  Lingkungan yang Mendukung (Supportive Environment)
                </span>
                <p className="text-[11px] text-slate-500">
                  Menciptakan ruang fisik, sosial, dan fasilitas pelayanan yang aman, sehat, dan inklusif bagi seluruh warga Kabupaten Malang.
                </p>
              </div>
            </div>
          </div>

          {/* Slogan Quote Card */}
          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="font-bold italic text-slate-800 dark:text-slate-200">
              "Menghubungkan Gagasan, Menyampaikan Harapan"
            </span>
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-orange-600">
              PAGUYUBAN PROMKESER
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
