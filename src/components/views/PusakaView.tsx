import React from 'react';
import { Landmark, Award, Shield, FileCheck, BookOpen, Music, HeartHandshake } from 'lucide-react';

export const PusakaView: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-850 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-1.5 h-6 bg-red-600 rounded-full inline-block"></span>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Pusaka & Lambang Kehormatan Paguyuban
          </h1>
        </div>
        <p className="text-xs text-slate-500 pl-3.5 leading-relaxed">
          Simbol persatuan, himne profesi, piagam kehormatan, dan warisan nilai perjuangan Promkeser Kabupaten Malang
        </p>
      </div>

      {/* Top Banner Emblem */}
      <div className="bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 text-white rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center gap-6">
        <div className="w-24 h-24 rounded-2xl bg-white p-3 shadow-md flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" className="w-full h-full fill-none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="5" r="3" className="fill-red-600" />
            <circle cx="18.5" cy="10" r="3" className="fill-orange-500" />
            <circle cx="16" cy="18" r="3" className="fill-amber-500" />
            <circle cx="8" cy="18" r="3" className="fill-emerald-600" />
            <circle cx="5.5" cy="10" r="3" className="fill-red-500" />
            <path d="M12 5L18.5 10L16 18L8 18L5.5 10Z" stroke="#F97316" strokeWidth="1.2" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="text-center md:text-left space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-widest bg-white/20 px-2.5 py-0.5 rounded-full inline-block">
            Makna Lambang Resmi Paguyuban
          </span>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Lima Lingkaran Harmoni Promkeser Malang
          </h2>
          <p className="text-xs text-orange-100 max-w-2xl leading-relaxed">
            Lambang resmi Paguyuban terdiri atas lima figur yang saling bergandengan tangan membentuk lingkaran sempurna.
            Warna Merah melambangkan keberanian advokasi kebijakan, Oranye melambangkan kehangatan komunikasi perilaku,
            dan Kuning Emas melambangkan kemuliaan pengabdian bagi derajat kesehatan masyarakat Kabupaten Malang.
          </p>
        </div>
      </div>

      {/* Grid: Mars & Hymne Promkeser & Nilai Luhur */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hymne Promkeser */}
        <div className="bg-white dark:bg-slate-850 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-orange-600" />
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Lirik Mars Tenaga Promosi Kesehatan
            </h3>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs italic text-slate-700 dark:text-slate-300 space-y-2 leading-relaxed font-serif">
            <p>Di bawah naungan bumi Kanjuruhan tercinta,</p>
            <p>Kami melangkah derap penuh cita-cita.</p>
            <p>Menyapa pelosok desa, mengayomi keluarga,</p>
            <p>Menebar benih sehat, budayakan hidup bermakna.</p>
            <p className="pt-2 font-bold not-italic font-sans text-orange-600 dark:text-orange-400">
              Reff: Bersatu Promkeser Kabupaten Malang,
            </p>
            <p>Jembatan nurani, penyampai kabar terang!</p>
          </div>
          <p className="text-[11px] text-slate-400">
            Dikumandangkan pada setiap pembukaan Musda dan Pertemuan Ilmiah Fungsional.
          </p>
        </div>

        {/* Piagam & Penghargaan Paguyuban */}
        <div className="bg-white dark:bg-slate-850 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Piagam & Prestasi Kolektif Paguyuban
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 font-bold">
                1
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  Juara I Inovasi KIE Germas Tingkat Provinsi Jawa Timur (2024)
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Kampanye Edukasi Kesehatan Reproduksi Remaja & Cegah Stunting Berbasis Budaya Lokal.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 font-bold">
                2
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  Penghargaan Organisasi Profesi Terakuntabel Dinas Kesehatan Kab. Malang (2025)
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Implementasi sistem keuangan berbasis digital dan rekonsiliasi kas tanpa selisih.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
