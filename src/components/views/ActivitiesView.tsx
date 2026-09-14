import React, { useState } from 'react';
import {
  Target,
  PlusCircle,
  Calendar,
  MapPin,
  User,
  CheckCircle2,
  Clock,
  FileText,
  AlertCircle,
  TrendingDown,
  PieChart,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Activity } from '../../types';

export const ActivitiesView: React.FC = () => {
  const { activities, openAddActivityModal, currentProfile } = useApp();
  const [selectedActivity, setSelectedActivity] = useState<Activity>(activities[0] || null);

  const totalPaguRAB = activities.reduce((sum, a) => sum + a.totalRAB, 0);
  const totalSerapanRiil = activities.reduce((sum, a) => sum + a.totalRealisasi, 0);
  const totalEfisiensi = activities
    .filter((a) => a.status === 'selesai')
    .reduce((sum, a) => sum + Math.max(0, a.totalRAB - a.totalRealisasi), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-6 bg-red-600 rounded-full inline-block"></span>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              RAB & Realisasi Program Kerja Fungsional
            </h1>
          </div>
          <p className="text-xs text-slate-500 pl-3.5">
            Perencanaan Anggaran Biaya (RAB), serapan dana kas, dan transparansi Laporan Pertanggungjawaban (LPJ)
          </p>
        </div>

        <button
          onClick={openAddActivityModal}
          className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition transform hover:-translate-y-0.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Ajukan Usul Kegiatan & RAB</span>
        </button>
      </div>

      {/* 3 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-850 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Pagu Alokasi RAB 2026</span>
            <span className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
            Rp {totalPaguRAB.toLocaleString('id-ID')}
          </div>
          <p className="mt-2 text-[11px] text-slate-400">Dari {activities.length} mata kegiatan teragendakan</p>
        </div>

        <div className="bg-white dark:bg-slate-850 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Serapan Riil Kas</span>
            <span className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-extrabold font-mono text-orange-600">
            Rp {totalSerapanRiil.toLocaleString('id-ID')}
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            Rasio Serapan: {((totalSerapanRiil / (totalPaguRAB || 1)) * 100).toFixed(1)}% dari total pagu
          </p>
        </div>

        <div className="bg-white dark:bg-slate-850 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Efisiensi & Sisa Pagu Terjaga</span>
            <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-extrabold font-mono text-emerald-600">
            Rp {totalEfisiensi.toLocaleString('id-ID')}
          </div>
          <p className="mt-2 text-[11px] text-emerald-600 font-semibold">
            Saldo sisa dikembalikan utuh ke kas induk
          </p>
        </div>
      </div>

      {/* Main Content Grid: Activity Cards List (Left) + Detail Breakdown (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col (5 of 12): List of Program Kerja */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Daftar Kegiatan T.A. 2026 ({activities.length})
          </h3>

          <div className="space-y-3">
            {activities.map((act) => {
              const isSelected = selectedActivity?.id === act.id;
              const percentage = Math.min(100, Math.round((act.totalRealisasi / act.totalRAB) * 100));

              return (
                <div
                  key={act.id}
                  onClick={() => setSelectedActivity(act)}
                  className={`p-4 rounded-xl border cursor-pointer transition shadow-2xs ${
                    isSelected
                      ? 'bg-red-50/70 border-red-500 dark:bg-red-950/30 dark:border-red-600'
                      : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                      {act.namaKegiatan}
                    </h4>
                    <span
                      className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                        act.status === 'selesai'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : act.status === 'berjalan'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      }`}
                    >
                      {act.status}
                    </span>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span>Pagu RAB: Rp {act.totalRAB.toLocaleString('id-ID')}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      Realisasi: Rp {act.totalRealisasi.toLocaleString('id-ID')}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-2 w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        act.status === 'selesai' ? 'bg-emerald-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {act.tanggalKegiatan}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {act.wilayah}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col (7 of 12): Detail Breakdown of Selected Activity */}
        <div className="lg:col-span-7">
          {selectedActivity ? (
            <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                      selectedActivity.status === 'selesai'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : selectedActivity.status === 'berjalan'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    }`}
                  >
                    STATUS: {selectedActivity.status.toUpperCase()}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <FileText className="w-3 h-3" /> LPJ: {selectedActivity.statusLPJ.toUpperCase()}
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {selectedActivity.namaKegiatan}
                </h3>
              </div>

              {/* Quick Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Waktu Pelaksanaan</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {selectedActivity.tanggalKegiatan}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Lokasi / Tempat</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {selectedActivity.lokasi}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 col-span-2 sm:col-span-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Penanggung Jawab</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {selectedActivity.penanggungJawab}
                  </p>
                </div>
              </div>

              {/* Rincian Pos Anggaran (RAB Items) */}
              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  Rincian Pos Anggaran Biaya (RAB)
                </h4>

                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 text-[10px] uppercase font-bold">
                      <tr>
                        <th className="py-2.5 px-3">Item Belanja</th>
                        <th className="py-2.5 px-3">Volume</th>
                        <th className="py-2.5 px-3 text-right">Pagu RAB</th>
                        <th className="py-2.5 px-3 text-right">Realisasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                      {selectedActivity.items.map((it) => (
                        <tr key={it.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="py-2.5 px-3 text-slate-900 dark:text-white font-semibold">
                            {it.namaItem}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 text-[11px]">{it.volume}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-semibold">
                            Rp {it.totalAnggaran.toLocaleString('id-ID')}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-600 dark:text-slate-400">
                            {it.totalRealisasi > 0
                              ? `Rp ${it.totalRealisasi.toLocaleString('id-ID')}`
                              : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 dark:bg-slate-800 font-extrabold text-xs">
                      <tr>
                        <td colSpan={2} className="py-3 px-3 text-slate-900 dark:text-white">
                          TOTAL KESELURUHAN
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-red-600 dark:text-red-400">
                          Rp {selectedActivity.totalRAB.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400">
                          Rp {selectedActivity.totalRealisasi.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Status LPJ & Berkas */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-red-600" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      Berkas LPJ & Dokumentasi Kegiatan
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {selectedActivity.lpjDocRef || 'Belum ada berkas LPJ final yang diunggah'}
                    </span>
                  </div>
                </div>

                {selectedActivity.lpjDocRef ? (
                  <button
                    onClick={() =>
                      alert(`Membuka berkas LPJ: ${selectedActivity.lpjDocRef} dari arsip cloud SIPAG`)
                    }
                    className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg font-bold text-orange-600 hover:text-orange-700 cursor-pointer shadow-2xs"
                  >
                    Unduh LPJ
                  </button>
                ) : (
                  <span className="text-[11px] text-amber-600 font-semibold">Dalam Proses</span>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800">
              Pilih kegiatan di sebelah kiri untuk melihat rincian pos anggaran RAB.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
