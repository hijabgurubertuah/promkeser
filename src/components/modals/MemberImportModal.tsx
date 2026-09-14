import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Users,
  ArrowRight,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Member, MemberStatus } from '../../types';

interface MemberImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedCandidate {
  id: string;
  nama: string;
  gelar: string;
  puskesmas: string;
  wilayah: 'Malang Utara' | 'Malang Selatan' | 'Malang Barat' | 'Malang Timur' | 'Sekretariat DKK';
  jabatanSatker: string;
  status: MemberStatus;
  tahunBergabung: number;
  kontak: string;
  email: string;
  keteranganStatus: string;
  isValid: boolean;
  validationError?: string;
}

export const MemberImportModal: React.FC<MemberImportModalProps> = ({ isOpen, onClose }) => {
  const { addMembersBatch, showToast } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<ParsedCandidate[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState<MemberStatus>('baru');

  if (!isOpen) return null;

  // Download Sample CSV Template
  const handleDownloadTemplate = () => {
    const csvHeader = 'Nama Lengkap,Gelar,Puskesmas Induk,Wilayah Koordinasi,Jabatan Satker,No Kontak WA,Email,Status,Keterangan\n';
    const sampleRows = [
      'Ahmad Fauzi,S.KM,Puskesmas Turen,Malang Selatan,Pelaksana Promkes,0812-3456-7890,ahmad.fauzi@gmail.com,aktif,Koordinator Promkes Lapangan',
      'Siti Rahmawati,S.Kep,Puskesmas Kepanjen,Malang Selatan,Tenaga Promosi Kesehatan,0813-9876-5432,siti.rahma@gmail.com,baru,Orientasi Pegawai Baru 2026',
      'Budi Santoso,A.Md.Kes,Puskesmas Lawang,Malang Utara,Pengelola Advokasi Promkes,0821-1122-3344,budi.lawang@gmail.com,aktif,Fasilitator Desa Siaga',
      'Nurul Hidayah,S.KM,Puskesmas Pujon,Malang Barat,Pelaksana Promkes,0857-4433-2211,nurul.pujon@gmail.com,aktif,Pengelola SBH Saka Bakti Husada',
    ].join('\n');

    const csvContent = '\uFEFF' + csvHeader + sampleRows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Template_Import_Anggota_SIPAG.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Template CSV berhasil diunduh. Silakan isi dan drag-and-drop ke sini!');
  };

  // Helper to parse line with CSV quotes
  const parseCSVLine = (line: string, delimiter: string): string[] => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        values.push(current.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
    return values;
  };

  // Process File Content
  const processFileContent = (text: string, name: string) => {
    setFileName(name);
    setParseError(null);

    try {
      // 1. Check if it's JSON
      if (name.endsWith('.json') || text.trim().startsWith('[')) {
        const parsed = JSON.parse(text);
        if (!Array.isArray(parsed)) {
          throw new Error('File JSON harus berisi array daftar anggota.');
        }

        const list: ParsedCandidate[] = parsed.map((item, idx) => {
          const nama = item.nama || item.name || item['Nama Lengkap'] || '';
          const puskesmas = item.puskesmas || item['Puskesmas Induk'] || item.satker || '';
          const isValid = Boolean(nama.trim() && puskesmas.trim());

          return {
            id: `cand-${Date.now()}-${idx}`,
            nama: nama.trim(),
            gelar: item.gelar || item.degree || 'S.KM',
            puskesmas: puskesmas.trim(),
            wilayah: item.wilayah || 'Malang Utara',
            jabatanSatker: item.jabatanSatker || item.jabatan || 'Pelaksana Promkes Puskesmas',
            status: item.status || defaultStatus,
            tahunBergabung: item.tahunBergabung || 2026,
            kontak: item.kontak || item.phone || item.noHp || '0812-xxxx-xxxx',
            email: item.email || (nama ? `${nama.toLowerCase().replace(/\s+/g, '.')}@gmail.com` : ''),
            keteranganStatus: item.keteranganStatus || item.keterangan || 'Impor Massal JSON',
            isValid,
            validationError: !isValid ? 'Nama dan Puskesmas wajib terisi' : undefined,
          };
        });

        if (list.length === 0) {
          throw new Error('Tidak ada data anggota yang terdeteksi di dalam file JSON.');
        }

        setCandidates(list);
        return;
      }

      // 2. CSV / TSV / TXT parsing
      const rawLines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (rawLines.length < 2) {
        throw new Error('File CSV kosong atau hanya memiliki baris header tanpa data anggota.');
      }

      // Detect delimiter (, or ; or \t)
      const firstLine = rawLines[0];
      let delimiter = ',';
      if (firstLine.includes(';') && firstLine.split(';').length >= 3) {
        delimiter = ';';
      } else if (firstLine.includes('\t') && firstLine.split('\t').length >= 3) {
        delimiter = '\t';
      }

      const headers = parseCSVLine(firstLine, delimiter).map((h) => h.toLowerCase().trim());

      // Find column indices
      const idxNama = headers.findIndex((h) => h.includes('nama') || h.includes('name'));
      const idxGelar = headers.findIndex((h) => h.includes('gelar') || h.includes('degree') || h.includes('title'));
      const idxPkm = headers.findIndex((h) => h.includes('puskesmas') || h.includes('satker') || h.includes('unit'));
      const idxWilayah = headers.findIndex((h) => h.includes('wilayah') || h.includes('zona') || h.includes('daerah'));
      const idxJabatan = headers.findIndex((h) => h.includes('jabatan') || h.includes('role') || h.includes('posisi'));
      const idxKontak = headers.findIndex((h) => h.includes('kontak') || h.includes('hp') || h.includes('wa') || h.includes('telp') || h.includes('phone'));
      const idxEmail = headers.findIndex((h) => h.includes('email') || h.includes('surel') || h.includes('mail'));
      const idxStatus = headers.findIndex((h) => h.includes('status'));
      const idxKet = headers.findIndex((h) => h.includes('ket') || h.includes('catatan') || h.includes('note'));

      const list: ParsedCandidate[] = [];

      for (let i = 1; i < rawLines.length; i++) {
        const cols = parseCSVLine(rawLines[i], delimiter);
        if (cols.length === 0 || (cols.length === 1 && cols[0] === '')) continue;

        const nama = idxNama !== -1 && cols[idxNama] ? cols[idxNama].trim() : (cols[0] || '').trim();
        const puskesmas = idxPkm !== -1 && cols[idxPkm] ? cols[idxPkm].trim() : (cols[2] || '').trim();
        const gelar = idxGelar !== -1 && cols[idxGelar] ? cols[idxGelar].trim() : (cols[1] || 'S.KM').trim();

        // Wilayah normalization
        let rawWilayah = idxWilayah !== -1 && cols[idxWilayah] ? cols[idxWilayah].trim() : 'Malang Utara';
        let wilayah: 'Malang Utara' | 'Malang Selatan' | 'Malang Barat' | 'Malang Timur' | 'Sekretariat DKK' = 'Malang Utara';
        if (rawWilayah.toLowerCase().includes('selatan')) wilayah = 'Malang Selatan';
        else if (rawWilayah.toLowerCase().includes('barat')) wilayah = 'Malang Barat';
        else if (rawWilayah.toLowerCase().includes('timur')) wilayah = 'Malang Timur';
        else if (rawWilayah.toLowerCase().includes('dkk') || rawWilayah.toLowerCase().includes('dinkes')) wilayah = 'Sekretariat DKK';

        const jabatanSatker = idxJabatan !== -1 && cols[idxJabatan] ? cols[idxJabatan].trim() : 'Pelaksana Promkes Puskesmas';
        const kontak = idxKontak !== -1 && cols[idxKontak] ? cols[idxKontak].trim() : '0812-xxxx-xxxx';
        const email = idxEmail !== -1 && cols[idxEmail] ? cols[idxEmail].trim() : (nama ? `${nama.toLowerCase().replace(/[^a-z0-9]/g, '.')}@gmail.com` : '');

        // Status normalization
        let status: MemberStatus = defaultStatus;
        if (idxStatus !== -1 && cols[idxStatus]) {
          const s = cols[idxStatus].toLowerCase();
          if (s.includes('aktif') && !s.includes('tidak')) status = 'aktif';
          else if (s.includes('baru')) status = 'baru';
          else if (s.includes('pindah')) status = 'pindah_satker';
          else if (s.includes('tidak')) status = 'tidak_aktif';
        }

        const keteranganStatus = idxKet !== -1 && cols[idxKet] ? cols[idxKet].trim() : `Impor Massal File (${name})`;
        const isValid = Boolean(nama.length > 1 && puskesmas.length > 1);

        list.push({
          id: `cand-${Date.now()}-${i}`,
          nama,
          gelar: gelar || 'S.KM',
          puskesmas,
          wilayah,
          jabatanSatker: jabatanSatker || 'Pelaksana Promkes Puskesmas',
          status,
          tahunBergabung: 2026,
          kontak: kontak || '0812-0000-0000',
          email: email || `${nama.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
          keteranganStatus,
          isValid,
          validationError: !isValid ? 'Nama atau Puskesmas tidak boleh kosong' : undefined,
        });
      }

      if (list.length === 0) {
        throw new Error('Tidak ada baris data anggota yang valid ditemukan dalam file.');
      }

      setCandidates(list);
    } catch (err: any) {
      setParseError(err.message || 'Gagal membaca isi file. Pastikan format file sesuai.');
      setCandidates([]);
    }
  };

  // Drag Event Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelected(files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        processFileContent(content, file.name);
      }
    };
    reader.onerror = () => {
      setParseError('Terjadi kesalahan saat membaca file dari sistem.');
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleRemoveCandidate = (id: string) => {
    setCandidates((prev) => prev.filter((c) => c.id !== id));
  };

  const handleApplyDefaultStatusToAll = (status: MemberStatus) => {
    setDefaultStatus(status);
    setCandidates((prev) => prev.map((c) => ({ ...c, status })));
  };

  const handleConfirmImport = () => {
    const validCandidates = candidates.filter((c) => c.isValid);
    if (validCandidates.length === 0) {
      alert('Tidak ada data anggota valid yang siap diimpor.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const batchData: Omit<Member, 'id' | 'noAnggota'>[] = validCandidates.map((c) => ({
        nama: c.nama,
        gelar: c.gelar,
        puskesmas: c.puskesmas,
        wilayah: c.wilayah,
        jabatanSatker: c.jabatanSatker,
        status: c.status,
        tahunBergabung: c.tahunBergabung,
        kontak: c.kontak,
        email: c.email,
        keteranganStatus: c.keteranganStatus,
      }));

      addMembersBatch(batchData);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  const validCount = candidates.filter((c) => c.isValid).length;
  const invalidCount = candidates.filter((c) => !c.isValid).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-3xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-red-50/50 via-white to-orange-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-850 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-orange-500 text-white flex items-center justify-center shadow-xs">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  Impor Massal Data Anggota (Drag & Drop)
                </h3>
                <span className="bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-200 dark:border-red-900">
                  Admin & Bendahara
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Tarik dan lepaskan file CSV atau JSON identitas anggota fungsional promkes se-Kabupaten Malang
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Action Row: Download Template & Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/60 rounded-xl text-xs">
            <div className="flex items-center gap-2 text-orange-900 dark:text-orange-200">
              <HelpCircle className="w-4 h-4 text-orange-600 shrink-0" />
              <span>
                Format yang didukung: <strong>.CSV</strong>, <strong>.TXT</strong>, atau <strong>.JSON</strong>.
              </span>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-orange-300 dark:border-orange-700 hover:bg-orange-100/50 dark:hover:bg-slate-700 text-orange-700 dark:text-orange-300 font-bold rounded-lg text-xs transition cursor-pointer shrink-0 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Format CSV Template</span>
            </button>
          </div>

          {/* DRAG & DROP ZONE */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2.5 ${
              isDragging
                ? 'border-orange-500 bg-orange-50/70 dark:bg-orange-950/40 scale-[1.01] ring-4 ring-orange-500/20'
                : fileName
                ? 'border-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20'
                : 'border-slate-300 dark:border-slate-700 hover:border-orange-400 dark:hover:border-orange-500 bg-slate-50/60 dark:bg-slate-800/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt,.tsv,.json"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileSelected(e.target.files[0]);
                }
              }}
            />

            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform ${
                isDragging
                  ? 'bg-orange-600 text-white scale-110 shadow-lg'
                  : fileName
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {fileName ? <FileSpreadsheet className="w-6 h-6" /> : <UploadCloud className="w-6 h-6" />}
            </div>

            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {isDragging
                  ? 'Lepaskan file di sini sekarang...'
                  : fileName
                  ? `Berkas Terpilih: ${fileName}`
                  : 'Drag & Drop file CSV / JSON di sini, atau klik untuk memilih file'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Membaca otomatis kolom Nama Lengkap, Gelar, Puskesmas, Wilayah, Jabatan, dan Nomor Kontak
              </p>
            </div>

            {fileName && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFileName(null);
                  setCandidates([]);
                  setParseError(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="text-[11px] text-red-600 hover:text-red-700 font-bold underline mt-1"
              >
                Ganti dengan file lain
              </button>
            )}
          </div>

          {/* Parse Error Notification */}
          {parseError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Gagal Memproses File</span>
                <span>{parseError}</span>
              </div>
            </div>
          )}

          {/* PREVIEW OF CANDIDATES */}
          {candidates.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-orange-600" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Preview Data Anggota yang Terbaca ({candidates.length} baris)
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                    {validCount} Siap Impor
                  </span>
                  {invalidCount > 0 && (
                    <span className="text-[10px] bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 font-bold px-2 py-0.5 rounded-full">
                      {invalidCount} Perlu Perbaikan
                    </span>
                  )}
                </div>

                {/* Batch status changer */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 text-[11px]">Set Status Massal:</span>
                  <select
                    value={defaultStatus}
                    onChange={(e) => handleApplyDefaultStatusToAll(e.target.value as MemberStatus)}
                    className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200"
                  >
                    <option value="baru">Anggota Baru</option>
                    <option value="aktif">Aktif Lapangan</option>
                    <option value="pindah_satker">Pindah Satker</option>
                  </select>
                </div>
              </div>

              {/* Scrollable Preview Table */}
              <div className="max-h-64 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0 text-[11px] font-bold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-2.5">No</th>
                      <th className="p-2.5">Nama & Gelar</th>
                      <th className="p-2.5">Puskesmas</th>
                      <th className="p-2.5">Wilayah</th>
                      <th className="p-2.5">Kontak / WA</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {candidates.map((cand, idx) => (
                      <tr
                        key={cand.id}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                          !cand.isValid ? 'bg-red-50/40 dark:bg-red-950/20' : ''
                        }`}
                      >
                        <td className="p-2.5 font-mono text-[11px] text-slate-400">{idx + 1}</td>
                        <td className="p-2.5">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {cand.nama || <span className="text-red-500">[Kosong]</span>}
                            {cand.gelar ? `, ${cand.gelar}` : ''}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{cand.jabatanSatker}</div>
                        </td>
                        <td className="p-2.5">
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {cand.puskesmas || <span className="text-red-500">[Wajib Diisi]</span>}
                          </span>
                        </td>
                        <td className="p-2.5 text-[11px] text-slate-600 dark:text-slate-400">
                          {cand.wilayah}
                        </td>
                        <td className="p-2.5 text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                          {cand.kontak}
                        </td>
                        <td className="p-2.5">
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              cand.status === 'aktif'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : cand.status === 'baru'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                            }`}
                          >
                            {cand.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveCandidate(cand.id)}
                            className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition cursor-pointer"
                            title="Hapus baris ini dari daftar impor"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-500">
            {candidates.length > 0
              ? `${validCount} dari ${candidates.length} anggota valid akan dimasukkan ke database.`
              : 'Silakan unggah berkas untuk melihat preview data.'}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={validCount === 0 || isSubmitting}
              onClick={handleConfirmImport}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Memproses...' : `Impor ${validCount} Anggota Sekarang`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
