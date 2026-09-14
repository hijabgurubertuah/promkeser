import React from 'react';
import {
  ShieldCheck,
  Building2,
  HeartHandshake,
  MapPin,
  Award,
  Users,
  Calendar,
  CheckCircle,
  FileCheck,
} from 'lucide-react';

export const AboutView: React.FC = () => {
  const wilayahPuskesmas = [
    {
      wilayah: 'Malang Utara',
      koordinator: 'Siti Rahmawati, S.KM (PKM Lawang)',
      puskesmas: ['PKM Lawang', 'PKM Singosari', 'PKM Karangploso'],
      fokus: 'Kawasan industri, gerbang pariwisata & padat penduduk',
    },
    {
      wilayah: 'Malang Barat',
      koordinator: 'Agus Setiawan, S.KM (PKM Pujon)',
      puskesmas: ['PKM Pujon', 'PKM Ngantang', 'PKM Kasembon', 'PKM Dau', 'PKM Wagir', 'PKM Wonosari', 'PKM Ngajum'],
      fokus: 'Kawasan agrowisata, lereng pegunungan & desa siaga',
    },
    {
      wilayah: 'Malang Timur',
      koordinator: 'Dina Novita, S.KM (PKM Tumpang)',
      puskesmas: ['PKM Tumpang', 'PKM Pakis', 'PKM Jabung', 'PKM Poncokusumo', 'PKM Wajak', 'PKM Tajinan'],
      fokus: 'Kawasan pertanian, lereng Gunung Bromo & sentra UKBM',
    },
    {
      wilayah: 'Malang Selatan',
      koordinator: 'Hendra Gunawan, S.KM (PKM Dampit)',
      puskesmas: [
        'PKM Kepanjen', 'PKM Pakisaji', 'PKM Bululawang', 'PKM Gondanglegi', 'PKM Pagelaran',
        'PKM Sumberpucung', 'PKM Kromengan', 'PKM Kalipare', 'PKM Donomulyo', 'PKM Pagak',
        'PKM Bantur', 'PKM Gedangan', 'PKM Sumbermanjing Wetan', 'PKM Dampit', 'PKM Tirtoyudo', 'PKM Ampelgading'
      ],
      fokus: 'Pusat pemerintahan Kepanjen, pesisir pantai & perbatasan selatan',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-850 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-1.5 h-6 bg-red-600 rounded-full inline-block"></span>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Tentang Paguyuban Promkeser Kabupaten Malang
          </h1>
        </div>
        <p className="text-xs text-slate-500 pl-3.5 leading-relaxed">
          Wadah pemersatu profesi Tenaga Promosi Kesehatan dan Ilmu Perilaku (Promkeser) se-Kabupaten Malang.
          Berdiri sejak 2015 dengan semangat silaturahmi, advokasi profesi, transparansi akuntabilitas, dan pelayanan prima.
        </p>
      </div>

      {/* Visi, Misi & Slogan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-red-600 to-orange-600 text-white p-6 rounded-2xl shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-base font-extrabold tracking-tight">Falsafah Gerakan</h3>
          <p className="text-xs text-orange-100 italic leading-relaxed">
            "Menghubungkan Gagasan, Menyampaikan Harapan. Terhubung dalam data, transparan dalam tata kelola, bersama dalam Paguyuban."
          </p>
          <div className="pt-2 border-t border-white/20 text-[11px] text-orange-200">
            Nilai Kehormatan Fungsional Promkeser
          </div>
        </div>

        <div className="bg-white dark:bg-slate-850 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">Visi Utama</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Mewujudkan korps tenaga promosi kesehatan yang profesional, adaptif, akuntabel, dan berdaya saing tinggi
            dalam menggerakkan masyarakat Kabupaten Malang menuju kemandirian hidup bersih dan sehat.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-850 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">Misi Strategis</h3>
          <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
            <li>Memperkuat silaturahmi & solidaritas anggota di 39 Puskesmas.</li>
            <li>Melakukan advokasi hak & peningkatan jenjang fungsional.</li>
            <li>Menjamin transparansi tata kelola iuran & kas berbasis digital.</li>
          </ul>
        </div>
      </div>

      {/* Sejarah Berdirinya Paguyuban */}
      <div className="bg-white dark:bg-slate-850 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-orange-600" />
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
            Kilas Balik & Sejarah Perintisan (2015 – 2026)
          </h2>
        </div>

        <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
          <p>
            Paguyuban Promkeser Kabupaten Malang dirintis pada tahun <b>2015</b> oleh <b>Bapak Siswoko, S.KM, M.Kes</b>{' '}
            bersama 18 tenaga fungsional penyuluh kesehatan masyarakat angkatan pertama di lingkungan Dinas Kesehatan
            Kabupaten Malang. Pada saat itu, tenaga promkes bertugas di wilayah kerja yang amat luas—meliputi 33 kecamatan
            dan 390 desa/kelurahan—namun belum memiliki wadah koordinasi mandiri yang berkesinambungan.
          </p>
          <p>
            Pada tahun <b>2018</b>, diselenggarakan Musyawarah Daerah (Musda) I yang melahirkan Anggaran Dasar & Anggaran
            Rumah Tangga (AD/ART) serta menyepakati iuran gotong royong untuk mendukung kegiatan ilmiah, advokasi, dan
            kesetiakawanan sosial bagi anggota yang sakit atau tertimpa musibah.
          </p>
          <p>
            Periode kepengurusan <b>Arik Agung, S.KM (2023–2026)</b> menandai era baru modernisasi tata kelola: menyatukan
            seluruh spreadsheet keuangan yang tersebar menjadi sistem informasi terpadu (SIPAG), mengaitkan setiap bukti
            transfer ke Google Drive cloud, serta memastikan seluruh anggota memiliki transparansi penuh atas dana kas organisasi.
          </p>
        </div>
      </div>

      {/* 5 Pilar Promosi Kesehatan */}
      <div className="bg-white dark:bg-slate-850 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white mb-2">
          Makna Filosofis Lambang 5 Pilar Promkeser
        </h2>
        <p className="text-xs text-slate-500 mb-5">
          Logo Paguyuban berupa 5 simpul melingkar dengan paduan warna Merah, Oranye, dan Kuning melambangkan keterhubungan
          tanpa sekat antar tenaga promkes di seluruh penjuru Kabupaten Malang:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 text-xs space-y-1">
            <span className="text-[10px] font-extrabold text-red-600 uppercase">Pilar 1</span>
            <h4 className="font-extrabold text-slate-900 dark:text-white">Pendidikan Kesehatan</h4>
            <p className="text-[11px] text-slate-500">Meningkatkan literasi sehat dan pemahaman preventif keluarga.</p>
          </div>

          <div className="p-4 rounded-xl border border-orange-200 dark:border-orange-900/50 bg-orange-50/50 dark:bg-orange-950/20 text-xs space-y-1">
            <span className="text-[10px] font-extrabold text-orange-600 uppercase">Pilar 2</span>
            <h4 className="font-extrabold text-slate-900 dark:text-white">Komunikasi Perilaku</h4>
            <p className="text-[11px] text-slate-500">Konseling antar pribadi dan kampanye media KIE berdaya guna.</p>
          </div>

          <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 text-xs space-y-1">
            <span className="text-[10px] font-extrabold text-amber-600 uppercase">Pilar 3</span>
            <h4 className="font-extrabold text-slate-900 dark:text-white">Pemberdayaan Warga</h4>
            <p className="text-[11px] text-slate-500">Kemandirian UKBM, Posyandu Siklus Hidup & Desa Siaga Sehat.</p>
          </div>

          <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 text-xs space-y-1">
            <span className="text-[10px] font-extrabold text-emerald-600 uppercase">Pilar 4</span>
            <h4 className="font-extrabold text-slate-900 dark:text-white">Advokasi Kebijakan</h4>
            <p className="text-[11px] text-slate-500">Menggalang komitmen lintas sektor kepala desa, camat & bupati.</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-xs space-y-1">
            <span className="text-[10px] font-extrabold text-slate-600 uppercase">Pilar 5</span>
            <h4 className="font-extrabold text-slate-900 dark:text-white">Lingkungan Sehat</h4>
            <p className="text-[11px] text-slate-500">Menciptakan tatanan bebas asap rokok dan sanitasi aman.</p>
          </div>
        </div>
      </div>

      {/* Struktur Wilayah Koordinasi 39 Puskesmas */}
      <div className="bg-white dark:bg-slate-850 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-red-600" />
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              Struktur 4 Wilayah Koordinasi (39 Puskesmas Induk)
            </h2>
          </div>
          <span className="text-xs font-bold text-orange-600 bg-orange-50 dark:bg-orange-950 px-2.5 py-1 rounded-lg">
            Total 39 Satker Terhubung
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {wilayahPuskesmas.map((w, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-900 dark:text-white text-sm">{w.wilayah}</span>
                <span className="text-[10px] text-slate-500 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  {w.puskesmas.length} Puskesmas
                </span>
              </div>
              <div className="text-[11px] text-orange-600 dark:text-orange-400 font-semibold">
                Koorwil: {w.koordinator}
              </div>
              <p className="text-[11px] text-slate-500">{w.fokus}</p>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-1">
                {w.puskesmas.map((pkm, pIdx) => (
                  <span key={pIdx} className="px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-[10px] text-slate-700 dark:text-slate-300">
                    {pkm}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
