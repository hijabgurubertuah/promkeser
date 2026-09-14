import React from 'react';
import { ShieldCheck, HeartPulse } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-slate-100 dark:border-slate-800">
          {/* Col 1: Brand & Slogan */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block"></span>
              <span className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight">
                PAGUYUBAN PROMKESER
              </span>
            </div>
            <p className="font-semibold text-slate-800 dark:text-slate-200 mb-2 italic">
              "Menghubungkan Gagasan, Menyampaikan Harapan"
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
              Terhubung dalam data, transparan dalam tata kelola, bersama dalam Paguyuban.
              Wadah silaturahmi, advokasi profesi, dan akuntabilitas fungsional Promosi Kesehatan
              dan Ilmu Perilaku se-Kabupaten Malang.
            </p>
          </div>

          {/* Col 2: Cakupan Wilayah Kerja */}
          <div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider mb-2">
              Cakupan Wilayah Kerja
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
              Dinas Kesehatan Kabupaten Malang • 39 Unit Puskesmas Induk se-Kabupaten Malang • Rumah Sakit Daerah • Jejaring Kader Promkes Desa.
            </p>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-medium border border-slate-200 dark:border-slate-700">
                Pemberdayaan
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-medium border border-slate-200 dark:border-slate-700">
                Kemitraan
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-medium border border-slate-200 dark:border-slate-700">
                Advokasi
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-medium border border-slate-200 dark:border-slate-700">
                KIE Kesehatan
              </span>
            </div>
          </div>

          {/* Col 3: Sekretariat & Layanan */}
          <div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider mb-2">
              Sekretariat & Layanan
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Jl. Panji No. 120, Kepanjen, Kabupaten Malang, Jawa Timur
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              E-mail:{' '}
              <a href="mailto:sekretariat@promkeser-malangkab.org" className="text-orange-600 hover:underline">
                sekretariat@promkeser-malangkab.org
              </a>
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Sistem Terverifikasi DKK Kabupaten Malang</span>
            </div>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
          <div className="flex items-center gap-1.5">
            <HeartPulse className="w-3.5 h-3.5 text-red-500" />
            <span>&copy; 2026 Paguyuban Promkeser Kabupaten Malang. Hak Cipta Dilindungi.</span>
          </div>
          <div className="flex items-center gap-3">
            <span>SIPAG v1.0 Enterprise</span>
            <span>•</span>
            <span>Fiduciary Audit Trail</span>
            <span>•</span>
            <span>5 Pilar Promkes</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
