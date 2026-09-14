import React, { useState } from 'react';
import {
  X,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  CheckCircle2,
  Building2,
  Users,
  Copy,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Member } from '../../types';

interface MemberExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MemberExportModal: React.FC<MemberExportModalProps> = ({ isOpen, onClose }) => {
  const { members, puskesmasList } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [puskesmasFilter, setPuskesmasFilter] = useState<string>('all');
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'text'>('csv');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const filteredMembers = members.filter((m) => {
    const matchStatus = statusFilter === 'all' || m.status === statusFilter;
    const matchPuskesmas = puskesmasFilter === 'all' || m.puskesmas === puskesmasFilter;
    return matchStatus && matchPuskesmas;
  });

  const handleDownload = () => {
    if (filteredMembers.length === 0) {
      alert('Tidak ada data anggota yang sesuai dengan filter.');
      return;
    }

    if (exportFormat === 'csv') {
      const headers = ['No Anggota', 'Nama Lengkap', 'Gelar', 'Puskesmas Satker', 'Wilayah', 'Jabatan', 'Status', 'Tahun Bergabung', 'No HP', 'Email'];
      const rows = filteredMembers.map((m) => [
        `"${m.noAnggota}"`,
        `"${m.nama}"`,
        `"${m.gelar || ''}"`,
        `"${m.puskesmas}"`,
        `"${m.wilayah}"`,
        `"${m.jabatanSatker}"`,
        `"${m.status}"`,
        `"${m.tahunBergabung}"`,
        `"${m.kontak}"`,
        `"${m.email}"`,
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `MASTER_ANGGOTA_PROMKESER_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (exportFormat === 'json') {
      const jsonContent = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredMembers, null, 2));
      const link = document.createElement('a');
      link.setAttribute('href', jsonContent);
      link.setAttribute('download', `MASTER_ANGGOTA_PROMKESER_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (exportFormat === 'text') {
      const text = generateTextSummary(filteredMembers);
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const generateTextSummary = (data: Member[]) => {
    let out = `*REKAP MASTER ANGGOTA PAGUYUBAN PROMKESER KAB. MALANG*\n`;
    out += `Tanggal Unduh: ${new Date().toLocaleDateString('id-ID')}\n`;
    out += `Total Terpilih: ${data.length} Anggota\n`;
    out += `------------------------------------\n`;
    data.forEach((m, idx) => {
      out += `${idx + 1}. [${m.noAnggota}] ${m.nama}, ${m.gelar || 'S.KM'} - ${m.puskesmas} (${m.status.toUpperCase()})\n`;
    });
    out += `------------------------------------\n`;
    out += `Sistem Informasi Paguyuban Promkeser (SIPAG)`;
    return out;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950 text-orange-600 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Export Data MASTER_ANGGOTA
              </h3>
              <p className="text-[11px] text-slate-500">
                Unduh atau salin data anggota sesuai kriteria filter pilihan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls */}
        <div className="p-6 space-y-4 overflow-y-auto text-xs">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Filter Status Keanggotaan
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
            >
              <option value="all">Semua Status Keanggotaan</option>
              <option value="aktif">Hanya Anggota Aktif</option>
              <option value="baru">Hanya Anggota Baru</option>
              <option value="tidak_aktif">Hanya Anggota Tidak Aktif</option>
              <option value="pindah_satker">Hanya Anggota Pindah Satker</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Filter Satker Puskesmas
            </label>
            <select
              value={puskesmasFilter}
              onChange={(e) => setPuskesmasFilter(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
            >
              <option value="all">Semua Satuan Kerja (39 Puskesmas + Sekretariat DKK)</option>
              {puskesmasList.map((p) => (
                <option key={p.id} value={p.nama}>
                  {p.nama} ({p.wilayah})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Pilih Format Export
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setExportFormat('csv')}
                className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                  exportFormat === 'csv'
                    ? 'bg-orange-50 dark:bg-orange-950/40 border-orange-500 text-orange-600 dark:text-orange-400 font-bold'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <FileSpreadsheet className="w-5 h-5 mx-auto mb-1" />
                <span>Excel / CSV</span>
              </button>

              <button
                type="button"
                onClick={() => setExportFormat('json')}
                className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                  exportFormat === 'json'
                    ? 'bg-orange-50 dark:bg-orange-950/40 border-orange-500 text-orange-600 dark:text-orange-400 font-bold'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <FileText className="w-5 h-5 mx-auto mb-1" />
                <span>JSON API</span>
              </button>

              <button
                type="button"
                onClick={() => setExportFormat('text')}
                className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                  exportFormat === 'text'
                    ? 'bg-orange-50 dark:bg-orange-950/40 border-orange-500 text-orange-600 dark:text-orange-400 font-bold'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Copy className="w-5 h-5 mx-auto mb-1" />
                <span>Salin WA / Teks</span>
              </button>
            </div>
          </div>

          {/* Export Preview Counter */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <span className="text-slate-500">Jumlah data yang akan diexport:</span>
            <span className="font-extrabold text-sm text-slate-900 dark:text-white font-mono">
              {filteredMembers.length} Anggota
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2 bg-slate-50 dark:bg-slate-850">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="px-5 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition"
          >
            {exportFormat === 'text' ? (
              copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Tersalin ke Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Salin Ringkasan Teks</span>
                </>
              )
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Unduh File ({exportFormat.toUpperCase()})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
