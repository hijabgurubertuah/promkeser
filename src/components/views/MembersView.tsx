import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Phone,
  Mail,
  Building2,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  FileDown,
  Info,
  UploadCloud,
  FileSpreadsheet,
  Download,
  Copy,
  ChevronDown,
  Printer,
  FileText,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Member, MemberStatus } from '../../types';

export const MembersView: React.FC = () => {
  const {
    members,
    openMemberDetailModal,
    currentProfile,
    addMember,
    showToast,
    openImportModal,
    openExportModal,
    isMasterAdmin,
    isBendahara,
    isPengurus,
  } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [wilayahFilter, setWilayahFilter] = useState<string>('all');
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isQuickDragOver, setIsQuickDragOver] = useState(false);

  // New member form states
  const [newNama, setNewNama] = useState('');
  const [newGelar, setNewGelar] = useState('S.KM');
  const [newPuskesmas, setNewPuskesmas] = useState('');
  const [newWilayah, setNewWilayah] = useState<'Malang Utara' | 'Malang Selatan' | 'Malang Barat' | 'Malang Timur' | 'Sekretariat DKK'>('Malang Utara');
  const [newJabatan, setNewJabatan] = useState('Pelaksana Promkes Puskesmas');
  const [newKontak, setNewKontak] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const canManage = isMasterAdmin || isBendahara || isPengurus;

  const filteredMembers = members.filter((m) => {
    const matchSearch =
      m.nama.toLowerCase().includes(search.toLowerCase()) ||
      m.puskesmas.toLowerCase().includes(search.toLowerCase()) ||
      m.noAnggota.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === 'all' || m.status === statusFilter;
    const matchWilayah = wilayahFilter === 'all' || m.wilayah === wilayahFilter;

    return matchSearch && matchStatus && matchWilayah;
  });

  const countAktif = members.filter((m) => m.status === 'aktif').length;
  const countBaru = members.filter((m) => m.status === 'baru').length;
  const countPindah = members.filter((m) => m.status === 'pindah_satker').length;
  const countNonAktif = members.filter((m) => m.status === 'tidak_aktif').length;

  // Export Data to CSV (Excel compatible with UTF-8 BOM)
  const handleExportCSV = () => {
    const headers = [
      'No',
      'Nomor Anggota',
      'Nama Lengkap',
      'Gelar Akademik',
      'Puskesmas Induk',
      'Wilayah Koordinasi',
      'Jabatan Satker',
      'Status Keanggotaan',
      'Kontak WhatsApp',
      'Email',
      'Tahun Bergabung',
      'Keterangan Status',
    ];

    const rows = filteredMembers.map((m, idx) => [
      idx + 1,
      `"${m.noAnggota}"`,
      `"${m.nama}"`,
      `"${m.gelar}"`,
      `"${m.puskesmas}"`,
      `"${m.wilayah}"`,
      `"${m.jabatanSatker}"`,
      `"${m.status}"`,
      `"${m.kontak}"`,
      `"${m.email}"`,
      m.tahunBergabung,
      `"${m.keteranganStatus || ''}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `Data_Identitas_Anggota_SIPAG_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsExportMenuOpen(false);
    showToast(`Berhasil mengekspor ${filteredMembers.length} data anggota ke file CSV (Excel)!`);
  };

  // Export Data to JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredMembers, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    const dateStr = new Date().toISOString().split('T')[0];
    downloadAnchor.setAttribute('download', `Data_Identitas_Anggota_SIPAG_${dateStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setIsExportMenuOpen(false);
    showToast(`Berhasil mengekspor ${filteredMembers.length} data anggota ke format JSON!`);
  };

  // Copy Identity List to Clipboard (WhatsApp friendly)
  const handleCopyWhatsAppText = () => {
    const today = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    let text = `📋 *DATA IDENTITAS ANGGOTA PAGUYUBAN TENAGA PROMOSI KESEHATAN (SIPAG)*\n`;
    text += `Kabupaten Malang • Per: ${today}\n`;
    text += `Total Anggota: ${filteredMembers.length} Personel\n\n`;

    filteredMembers.forEach((m, idx) => {
      text += `${idx + 1}. *${m.nama}, ${m.gelar}* (${m.noAnggota})\n`;
      text += `   🏥 Satker: ${m.puskesmas} (${m.wilayah})\n`;
      text += `   💼 Jabatan: ${m.jabatanSatker}\n`;
      text += `   📱 WA: ${m.kontak}\n`;
      text += `   🟢 Status: ${m.status.toUpperCase()}\n\n`;
    });

    navigator.clipboard.writeText(text).then(() => {
      setIsExportMenuOpen(false);
      showToast('Daftar nama dan identitas anggota berhasil disalin ke clipboard!');
    });
  };

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNama || !newPuskesmas) {
      alert('Nama dan Puskesmas wajib diisi.');
      return;
    }

    addMember({
      nama: newNama,
      gelar: newGelar,
      puskesmas: newPuskesmas,
      wilayah: newWilayah,
      jabatanSatker: newJabatan,
      status: 'baru',
      tahunBergabung: 2026,
      kontak: newKontak || '0812-0000-0000',
      email: newEmail || `${newNama.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      keteranganStatus: 'Anggota Baru (Masa Orientasi)',
    });

    setIsAddFormOpen(false);
    setNewNama('');
    setNewPuskesmas('');
    setNewKontak('');
    setNewEmail('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title Banner */}
      <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-6 bg-red-600 rounded-full inline-block"></span>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Master Data Anggota Paguyuban
            </h1>
            <span className="text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950 px-2 py-0.5 rounded-full">
              {members.length} Terdaftar
            </span>
          </div>
          <p className="text-xs text-slate-500 pl-3.5">
            Database 39 Puskesmas Induk Kabupaten Malang • Menjaga riwayat historis keanggotaan
          </p>
        </div>

        {/* Action Buttons: Import, Export, Add */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Export Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs border border-slate-200 dark:border-slate-700 transition"
              title="Ekspor Data Identitas Anggota"
            >
              <Download className="w-3.5 h-3.5 text-orange-600" />
              <span>Ekspor Data</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isExportMenuOpen && (
              <div className="absolute right-0 mt-2 w-68 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl py-2 z-40 animate-fade-in text-xs">
                <div className="px-3.5 py-1.5 border-b border-slate-100 dark:border-slate-700 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Pilihan Format Ekspor
                </div>

                <button
                  onClick={() => {
                    setIsExportMenuOpen(false);
                    openExportModal();
                  }}
                  className="w-full px-3.5 py-2.5 text-left flex items-start gap-2.5 bg-orange-50/70 dark:bg-orange-950/40 hover:bg-orange-100 dark:hover:bg-orange-900/60 transition cursor-pointer text-slate-900 dark:text-white border-b border-orange-100 dark:border-orange-900/30"
                >
                  <Download className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-bold text-orange-700 dark:text-orange-400">Modal Ekspor & Filter Lengkap</div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Pilih format, filter status, dan preview data real-time
                    </p>
                  </div>
                </button>

                <button
                  onClick={handleExportCSV}
                  className="w-full px-3.5 py-2 text-left flex items-start gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition cursor-pointer text-slate-800 dark:text-slate-200"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Unduh CSV / Excel (.csv)</div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Tabel lengkap siap olah di Excel / Sheets
                    </p>
                  </div>
                </button>

                <button
                  onClick={handleExportJSON}
                  className="w-full px-3.5 py-2 text-left flex items-start gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition cursor-pointer text-slate-800 dark:text-slate-200"
                >
                  <FileText className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Unduh Backup JSON (.json)</div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Format terstruktur untuk backup
                    </p>
                  </div>
                </button>

                <button
                  onClick={handleCopyWhatsAppText}
                  className="w-full px-3.5 py-2 text-left flex items-start gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition cursor-pointer text-slate-800 dark:text-slate-200"
                >
                  <Copy className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Salin Teks WhatsApp</div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Format daftar rapi siap kirim ke WA
                    </p>
                  </div>
                </button>

                <div className="my-1 border-t border-slate-100 dark:border-slate-700" />

                <button
                  onClick={() => {
                    setIsExportMenuOpen(false);
                    window.print();
                  }}
                  className="w-full px-3.5 py-2 text-left flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer text-slate-700 dark:text-slate-300 font-semibold"
                >
                  <Printer className="w-4 h-4 text-slate-400" />
                  <span>Cetak Dokumen Fisik / PDF</span>
                </button>
              </div>
            )}
          </div>

          {/* Import Drag & Drop Button for Admin & Bendahara */}
          {canManage && (
            <button
              onClick={openImportModal}
              className="px-3.5 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition"
              title="Unggah dan impor file CSV / Excel data anggota"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Impor Wizard</span>
            </button>
          )}

          {/* Add Manual Member Button */}
          {canManage && (
            <button
              onClick={() => setIsAddFormOpen(!isAddFormOpen)}
              className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah Manual</span>
            </button>
          )}
        </div>
      </div>

      {/* Admin Drag & Drop Quick Zone */}
      {canManage && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsQuickDragOver(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsQuickDragOver(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setIsQuickDragOver(false);
            setIsImportModalOpen(true);
          }}
          onClick={() => setIsImportModalOpen(true)}
          className={`p-4 rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-2xs ${
            isQuickDragOver
              ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/40 ring-4 ring-orange-500/20 scale-[1.005]'
              : 'border-slate-300 dark:border-slate-700 bg-gradient-to-r from-red-50/50 via-orange-50/40 to-amber-50/40 dark:from-slate-850 dark:to-slate-800/80 hover:border-orange-400 dark:hover:border-orange-500'
          }`}
        >
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <UploadCloud className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2 justify-center sm:justify-start">
                <span>Area Seret-dan-Lepas (Drag & Drop) Data Anggota</span>
                <span className="bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-200 dark:border-orange-800">
                  Khusus Admin
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Tarik file CSV / Excel / JSON ke sini untuk mengunggah dan memvalidasi daftar nama anggota fungsional secara instan
              </p>
            </div>
          </div>

          <button
            type="button"
            className="text-[11px] font-bold text-orange-700 dark:text-orange-300 bg-white dark:bg-slate-800 px-3.5 py-1.5 rounded-xl border border-orange-200 dark:border-orange-800 shadow-2xs hover:bg-orange-50 dark:hover:bg-slate-700 transition shrink-0 cursor-pointer"
          >
            Buka Panel Impor &rarr;
          </button>
        </div>
      )}

      {/* Add Member Form (Accordion / Collapsible) */}
      {isAddFormOpen && (
        <form onSubmit={handleCreateMember} className="bg-white dark:bg-slate-850 p-5 rounded-2xl border-2 border-red-200 dark:border-red-900/60 shadow-md space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-red-600" />
              <span>Pendaftaran Anggota Fungsional Baru</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsAddFormOpen(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Tutup ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nama Lengkap *</label>
              <input
                type="text"
                required
                value={newNama}
                onChange={(e) => setNewNama(e.target.value)}
                placeholder="Contoh: Rina Amalia"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Gelar Akademik</label>
              <input
                type="text"
                value={newGelar}
                onChange={(e) => setNewGelar(e.target.value)}
                placeholder="S.KM / S.Kep / A.Md.Kes"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Puskesmas Induk *</label>
              <input
                type="text"
                required
                value={newPuskesmas}
                onChange={(e) => setNewPuskesmas(e.target.value)}
                placeholder="Contoh: Puskesmas Turen"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Wilayah Koordinasi</label>
              <select
                value={newWilayah}
                onChange={(e) => setNewWilayah(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="Malang Utara">Malang Utara</option>
                <option value="Malang Selatan">Malang Selatan</option>
                <option value="Malang Barat">Malang Barat</option>
                <option value="Malang Timur">Malang Timur</option>
                <option value="Sekretariat DKK">Sekretariat DKK</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">No. Kontak / WA</label>
              <input
                type="text"
                value={newKontak}
                onChange={(e) => setNewKontak(e.target.value)}
                placeholder="0812-xxxx-xxxx"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Email</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddFormOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-lg"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg cursor-pointer"
            >
              Daftarkan Anggota
            </button>
          </div>
        </form>
      )}

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => setStatusFilter('all')}
          className={`p-3.5 rounded-xl border cursor-pointer transition ${
            statusFilter === 'all'
              ? 'bg-orange-50 border-orange-400 text-orange-950 dark:bg-orange-950/40 dark:text-orange-200'
              : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-600'
          }`}
        >
          <span className="text-[11px] font-semibold block">Semua Terdata</span>
          <span className="text-xl font-extrabold font-mono text-slate-900 dark:text-white">
            {members.length}
          </span>
        </div>

        <div
          onClick={() => setStatusFilter('aktif')}
          className={`p-3.5 rounded-xl border cursor-pointer transition ${
            statusFilter === 'aktif'
              ? 'bg-emerald-50 border-emerald-400 text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-200'
              : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-600'
          }`}
        >
          <span className="text-[11px] font-semibold block text-emerald-600">Aktif Lapangan</span>
          <span className="text-xl font-extrabold font-mono text-slate-900 dark:text-white">
            {countAktif}
          </span>
        </div>

        <div
          onClick={() => setStatusFilter('baru')}
          className={`p-3.5 rounded-xl border cursor-pointer transition ${
            statusFilter === 'baru'
              ? 'bg-blue-50 border-blue-400 text-blue-950 dark:bg-blue-950/40 dark:text-blue-200'
              : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-600'
          }`}
        >
          <span className="text-[11px] font-semibold block text-blue-600">Anggota Baru</span>
          <span className="text-xl font-extrabold font-mono text-slate-900 dark:text-white">
            {countBaru}
          </span>
        </div>

        <div
          onClick={() => setStatusFilter('pindah_satker')}
          className={`p-3.5 rounded-xl border cursor-pointer transition ${
            statusFilter === 'pindah_satker'
              ? 'bg-purple-50 border-purple-400 text-purple-950 dark:bg-purple-950/40 dark:text-purple-200'
              : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-600'
          }`}
        >
          <span className="text-[11px] font-semibold block text-purple-600">Pindah Satker / Tugas</span>
          <span className="text-xl font-extrabold font-mono text-slate-900 dark:text-white">
            {countPindah + countNonAktif}
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, satker puskesmas..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={wilayahFilter}
            onChange={(e) => setWilayahFilter(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300"
          >
            <option value="all">Semua Wilayah</option>
            <option value="Malang Utara">Malang Utara</option>
            <option value="Malang Selatan">Malang Selatan</option>
            <option value="Malang Barat">Malang Barat</option>
            <option value="Malang Timur">Malang Timur</option>
            <option value="Sekretariat DKK">Sekretariat DKK</option>
          </select>

          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cetak Rekap</span>
          </button>
        </div>
      </div>

      {/* Members Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map((member) => (
          <div
            key={member.id}
            onClick={() => openMemberDetailModal(member)}
            className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-orange-400 dark:hover:border-orange-500 shadow-2xs hover:shadow-xs transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-600 to-orange-500 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                    {member.nama.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xs text-slate-900 dark:text-white leading-tight">
                      {member.nama}, {member.gelar}
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400">{member.noAnggota}</span>
                  </div>
                </div>

                {/* Status Badge */}
                <span
                  className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${
                    member.status === 'aktif'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400'
                      : member.status === 'baru'
                      ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400'
                      : member.status === 'pindah_satker'
                      ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-400'
                      : 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {member.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              {/* Puskesmas & Satker info */}
              <div className="mt-3 space-y-1 text-xs">
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{member.puskesmas}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{member.wilayah}</span>
                </div>
              </div>
            </div>

            {/* Bottom Status note */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 truncate max-w-[180px]">
                {member.keteranganStatus || 'Terdaftar Aktif'}
              </span>
              <span className="text-orange-600 font-bold hover:underline shrink-0">
                Detail &rarr;
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="bg-white dark:bg-slate-850 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
          Tidak ada anggota yang cocok dengan kata kunci pencarian.
        </div>
      )}

      {/* Historical Data Policy Callout */}
      <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-800 dark:text-slate-200 block">
            Prinsip Ketat Master Data SIPAG (PRD US-13)
          </span>
          <p className="text-[11px] mt-0.5 leading-relaxed">
            Data anggota yang mutasi atau purna tugas tidak pernah dihapus dari sistem agar riwayat pembukuan iuran masa lampau
            tetap valid dan dapat diaudit secara hukum. Status anggota dapat dialihkan ke "Pindah Satker" atau "Tidak Aktif".
          </p>
        </div>
      </div>
    </div>
  );
};
