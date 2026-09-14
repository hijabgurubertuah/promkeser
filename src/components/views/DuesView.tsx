import React, { useState } from 'react';
import {
  CreditCard,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Upload,
  Filter,
  FileDown,
  ExternalLink,
  ShieldCheck,
  Check,
  X,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DuesView: React.FC = () => {
  const {
    verificationRequests,
    approveVerification,
    rejectVerification,
    openReceiptModal,
    openSubmitDuesModal,
    currentProfile,
    members,
    complianceRate,
    totalLunasCount,
    totalPendingCount,
    totalTertunggakCount,
  } = useApp();

  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [search, setSearch] = useState('');

  const canApprove = currentProfile.role === 'admin' || currentProfile.role === 'bendahara';

  const filteredRequests = verificationRequests.filter((item) => {
    const matchStatus = filterTab === 'all' || item.status === filterTab;
    const matchSearch =
      item.memberName.toLowerCase().includes(search.toLowerCase()) ||
      item.puskesmas.toLowerCase().includes(search.toLowerCase()) ||
      item.periodeLabel.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-6 bg-red-600 rounded-full inline-block"></span>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Buku Iuran & Verifikasi Pembayaran
            </h1>
          </div>
          <p className="text-xs text-slate-500 pl-3.5">
            Rekonsiliasi slip setoran kas anggota promkeser dengan mutasi rekening Bank Jatim
          </p>
        </div>

        <button
          onClick={openSubmitDuesModal}
          className="w-full sm:w-auto justify-center px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-xs transition transform hover:-translate-y-0.5"
        >
          <Upload className="w-4 h-4" />
          <span>Form Setor Iuran Kas</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Kepatuhan Iuran 2026</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono mt-1">
            {complianceRate}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{totalLunasCount} dari 51 Anggota Lunas</p>
        </div>

        <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-amber-600 block">Menunggu Approval</span>
          <div className="text-2xl font-extrabold text-amber-600 font-mono mt-1">
            {totalPendingCount} Slip
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Siap diverifikasi Bendahara</p>
        </div>

        <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-red-600 block">Tertunggak (&gt;2 Bln)</span>
          <div className="text-2xl font-extrabold text-red-600 font-mono mt-1">
            {totalTertunggakCount} Jiwa
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Perlu pemberitahuan santun</p>
        </div>

        <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-emerald-600 block">Rekening Penampung</span>
          <div className="text-sm font-extrabold text-slate-900 dark:text-white font-mono mt-1">
            034-291829-01
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Bank Jatim Cabang Kepanjen</p>
        </div>
      </div>

      {/* Verification Ledger & Filter */}
      <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-semibold overflow-x-auto no-scrollbar max-w-full">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1.5 rounded-md cursor-pointer transition whitespace-nowrap ${
                filterTab === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Semua ({verificationRequests.length})
            </button>
            <button
              onClick={() => setFilterTab('pending')}
              className={`px-3 py-1.5 rounded-md cursor-pointer transition flex items-center gap-1.5 whitespace-nowrap ${
                filterTab === 'pending'
                  ? 'bg-white dark:bg-slate-700 text-amber-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <span>Perlu Verifikasi</span>
              {totalPendingCount > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-500 text-white text-[10px] rounded-full font-bold">
                  {totalPendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setFilterTab('approved')}
              className={`px-3 py-1.5 rounded-md cursor-pointer transition whitespace-nowrap ${
                filterTab === 'approved'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Disetujui
            </button>
            <button
              onClick={() => setFilterTab('rejected')}
              className={`px-3 py-1.5 rounded-md cursor-pointer transition whitespace-nowrap ${
                filterTab === 'rejected'
                  ? 'bg-white dark:bg-slate-700 text-red-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Ditolak
            </button>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari anggota / puskesmas..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Requests Table */}
        <div className="overflow-x-auto -mx-5 px-5 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[780px] text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                <th className="py-3 px-3">TANGGAL PENGAJUAN</th>
                <th className="py-3 px-3">NAMA ANGGOTA & SATKER</th>
                <th className="py-3 px-3">PERIODE IURAN</th>
                <th className="py-3 px-3 text-right">NOMINAL (RP)</th>
                <th className="py-3 px-3 text-center">BERKAS BUKTI</th>
                <th className="py-3 px-3 text-center">STATUS VERIFIKASI</th>
                <th className="py-3 px-3 text-right">AKSI BENDAHARA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                    {req.tanggalPengajuan}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900 dark:text-white">{req.memberName}</div>
                    <div className="text-[11px] text-slate-400">{req.puskesmas}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                    <div>{req.periodeLabel}</div>
                    {req.catatan && (
                      <div className="text-[10px] text-slate-400 italic truncate max-w-xs">
                        "{req.catatan}"
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-extrabold text-slate-900 dark:text-white whitespace-nowrap">
                    Rp {req.nominal.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() =>
                        openReceiptModal({
                          title: `Slip Pembayaran - ${req.memberName}`,
                          file: req.fileBukti,
                          nominal: req.nominal,
                          member: req.memberName,
                          puskesmas: req.puskesmas,
                          uraian: req.periodeLabel,
                          date: req.tanggalPengajuan,
                        })
                      }
                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-orange-600 text-[11px] font-semibold cursor-pointer transition"
                    >
                      <FileText className="w-3 h-3 text-orange-500" />
                      <span className="truncate max-w-[100px]">{req.fileBukti}</span>
                    </button>
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    {req.status === 'approved' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3 h-3" /> Disetujui
                      </span>
                    ) : req.status === 'pending' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                        <Clock className="w-3 h-3" /> Menunggu
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-800">
                        <XCircle className="w-3 h-3" /> Ditolak
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    {req.status === 'pending' && canApprove ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => rejectVerification(req.id)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-red-600 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          Tolak
                        </button>
                        <button
                          onClick={() => approveVerification(req.id)}
                          className="px-3 py-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md flex items-center gap-1 cursor-pointer transition shadow-2xs"
                        >
                          <Check className="w-3 h-3" />
                          <span>Approve</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Selesai</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRequests.length === 0 && (
          <div className="py-10 text-center text-xs text-slate-500">
            Tidak ada data setoran iuran yang cocok dengan filter.
          </div>
        )}
      </div>

      {/* Matriks Kepatuhan Triwulan I - IV 2026 */}
      <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Matriks Kepatuhan Iuran Kas Fungsional T.A. 2026
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Besaran Iuran Rp 50.000 / bulan (Disetor Rp 150.000 per Triwulan). Hijau menandakan lunas terekonsiliasi.
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg flex items-center gap-1 cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Ekspor Matriks</span>
          </button>
        </div>

        {/* Matrix Sample */}
        <div className="overflow-x-auto -mx-5 px-5 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[750px] text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 text-[10px] uppercase font-bold">
                <th className="py-2.5 px-3">ANGGOTA</th>
                <th className="py-2.5 px-3">SATKER</th>
                <th className="py-2.5 px-3 text-center">TRIWULAN I (JAN-MAR)</th>
                <th className="py-2.5 px-3 text-center">TRIWULAN II (APR-JUN)</th>
                <th className="py-2.5 px-3 text-center">TRIWULAN III (JUL-SEP)</th>
                <th className="py-2.5 px-3 text-center">TRIWULAN IV (OKT-DES)</th>
                <th className="py-2.5 px-3 text-center">STATUS REKONSILIASI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {members.slice(0, 8).map((m, idx) => (
                <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                    {m.nama}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                    {m.puskesmas}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="inline-block w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 text-[10px] font-bold leading-6">
                      ✓
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="inline-block w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 text-[10px] font-bold leading-6">
                      ✓
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {idx === 2 ? (
                      <span className="inline-block px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                        Pending
                      </span>
                    ) : idx === 3 ? (
                      <span className="inline-block w-6 h-6 rounded-full bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 text-[10px] font-bold leading-6">
                        ✕
                      </span>
                    ) : (
                      <span className="inline-block w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 text-[10px] font-bold leading-6">
                        ✓
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="text-[10px] text-slate-400 italic">Dibuka Nov</span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        idx === 3
                          ? 'bg-red-50 text-red-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {idx === 3 ? 'Tunggakan' : 'Lancar'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
