import React, { useState } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Download,
  Check,
  AlertCircle,
  FileText,
  Trash2,
  RefreshCw,
  Database,
  Building2,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Member, MemberStatus } from '../../types';

interface RawRow {
  [key: string]: any;
}

interface ValidationResult {
  rowIdx: number;
  original: RawRow;
  memberData: Partial<Member>;
  status: 'valid' | 'warning' | 'error';
  messages: string[];
}

export const MemberImportWizardModal: React.FC = () => {
  const {
    isImportModalOpen,
    closeImportModal,
    members,
    importMembers,
    puskesmasList,
  } = useApp();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [fileName, setFileName] = useState('');
  const [rawRows, setRawRows] = useState<RawRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  
  // Mapping
  const [fieldMapping, setFieldMapping] = useState<{
    noAnggota: string;
    nama: string;
    gelar: string;
    puskesmas: string;
    jabatanSatker: string;
    kontak: string;
    email: string;
    status: string;
    tahunBergabung: string;
  }>({
    noAnggota: '',
    nama: '',
    gelar: '',
    puskesmas: '',
    jabatanSatker: '',
    kontak: '',
    email: '',
    status: '',
    tahunBergabung: '',
  });

  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isImportModalOpen) return null;

  // Sample data fallback loader
  const loadSampleDataset = () => {
    const sample = [
      {
        'No. Anggota': 'PKM-MLG-052',
        'Nama Lengkap': 'Kurnia Putri Rahayu',
        Gelar: 'S.KM',
        'Puskesmas Satker': 'Puskesmas Kepanjen',
        Jabatan: 'Pranata Promkes Pertama',
        'No. Handphone': '0812-3344-9988',
        'Email Google': 'kurnia.promkes@gmail.com',
        Status: 'aktif',
        'Tahun Bergabung': 2024,
      },
      {
        'No. Anggota': 'PKM-MLG-053',
        'Nama Lengkap': 'Bagus Prasetyo',
        Gelar: 'A.Md.Kes',
        'Puskesmas Satker': 'Puskesmas Pujon',
        Jabatan: 'Pengelola Media Promkes',
        'No. Handphone': '0857-1122-3344',
        'Email Google': 'bagus.pujon@yahoo.com',
        Status: 'baru',
        'Tahun Bergabung': 2026,
      },
      {
        'No. Anggota': 'PKM-MLG-001', // duplicate intentional
        'Nama Lengkap': 'Arik Agung',
        Gelar: 'S.KM',
        'Puskesmas Satker': 'Sekretariat DKK',
        Jabatan: 'Ketua',
        'No. Handphone': '0812-3456-7801',
        'Email Google': 'arik.agung@promkeser-malangkab.org',
        Status: 'aktif',
        'Tahun Bergabung': 2016,
      },
      {
        'No. Anggota': 'PKM-MLG-054',
        'Nama Lengkap': 'Siti Khodijah',
        Gelar: 'S.KM',
        'Puskesmas Satker': 'Puskesmas Unknown XYZ', // invalid puskesmas
        Jabatan: 'Promkes Desa',
        'No. Handphone': '0813-9988-7766',
        'Email Google': 'khodijah@gmail.com',
        Status: 'aktif',
        'Tahun Bergabung': 2023,
      },
      {
        'No. Anggota': '',
        'Nama Lengkap': '', // empty required
        Gelar: 'S.KM',
        'Puskesmas Satker': 'Puskesmas Turen',
        Jabatan: 'Staff',
        'No. Handphone': '123',
        'Email Google': 'invalid-mail',
        Status: 'aktif',
        'Tahun Bergabung': 2022,
      },
    ];

    setFileName('Master_Anggota_Promkes_2026.xlsx');
    setRawRows(sample);
    const cols = Object.keys(sample[0]);
    setColumns(cols);

    // Auto-map based on similar names
    setFieldMapping({
      noAnggota: cols.find((c) => /no|kode|nomor/i.test(c)) || '',
      nama: cols.find((c) => /nama/i.test(c)) || '',
      gelar: cols.find((c) => /gelar/i.test(c)) || '',
      puskesmas: cols.find((c) => /puskesmas|satker/i.test(c)) || '',
      jabatanSatker: cols.find((c) => /jabatan|posisi/i.test(c)) || '',
      kontak: cols.find((c) => /hp|telepon|kontak|wa/i.test(c)) || '',
      email: cols.find((c) => /email|mail/i.test(c)) || '',
      status: cols.find((c) => /status/i.test(c)) || '',
      tahunBergabung: cols.find((c) => /tahun|bergabung/i.test(c)) || '',
    });

    setStep(2);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    // Read CSV or Text
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      try {
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setRawRows(parsed);
            const cols = Object.keys(parsed[0]);
            setColumns(cols);
            autoMapColumns(cols);
            setStep(2);
            return;
          }
        }

        // CSV parsing
        const lines = content.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
        if (lines.length > 0) {
          const delimiter = lines[0].includes(';') ? ';' : ',';
          const header = lines[0].split(delimiter).map((h) => h.trim().replace(/^["']|["']$/g, ''));
          setColumns(header);

          const rows: RawRow[] = [];
          for (let i = 1; i < lines.length; i++) {
            const vals = lines[i].split(delimiter).map((v) => v.trim().replace(/^["']|["']$/g, ''));
            const rowObj: RawRow = {};
            header.forEach((h, idx) => {
              rowObj[h] = vals[idx] || '';
            });
            rows.push(rowObj);
          }

          setRawRows(rows);
          autoMapColumns(header);
          setStep(2);
        }
      } catch (err) {
        alert('Gagal membaca berkas. Pastikan format berkas valid.');
      }
    };

    reader.readAsText(file);
  };

  const autoMapColumns = (cols: string[]) => {
    setFieldMapping({
      noAnggota: cols.find((c) => /no|kode|nomor/i.test(c)) || cols[0] || '',
      nama: cols.find((c) => /nama/i.test(c)) || cols[1] || '',
      gelar: cols.find((c) => /gelar/i.test(c)) || '',
      puskesmas: cols.find((c) => /puskesmas|satker/i.test(c)) || '',
      jabatanSatker: cols.find((c) => /jabatan|posisi/i.test(c)) || '',
      kontak: cols.find((c) => /hp|telepon|kontak|wa/i.test(c)) || '',
      email: cols.find((c) => /email|mail/i.test(c)) || '',
      status: cols.find((c) => /status/i.test(c)) || '',
      tahunBergabung: cols.find((c) => /tahun|bergabung/i.test(c)) || '',
    });
  };

  // Run Step 4: Validation Engine
  const runValidation = () => {
    setIsProcessing(true);

    setTimeout(() => {
      const results: ValidationResult[] = rawRows.map((row, idx) => {
        const noAnggota = String(row[fieldMapping.noAnggota] || '').trim();
        const nama = String(row[fieldMapping.nama] || '').trim();
        const puskesmas = String(row[fieldMapping.puskesmas] || '').trim();
        const email = String(row[fieldMapping.email] || '').trim();
        const kontak = String(row[fieldMapping.kontak] || '').trim();
        const rawStatus = String(row[fieldMapping.status] || 'aktif').toLowerCase().trim();

        const messages: string[] = [];
        let status: 'valid' | 'warning' | 'error' = 'valid';

        // 1. Mandatory Fields
        if (!nama) {
          status = 'error';
          messages.push('Nama anggota wajib diisi!');
        }
        if (!puskesmas) {
          status = 'error';
          messages.push('Puskesmas / Satker wajib diisi!');
        }

        // 2. Duplicate Check in Existing Database
        const existingByNo = members.find((m) => m.noAnggota.toLowerCase() === noAnggota.toLowerCase() && noAnggota !== '');
        if (existingByNo) {
          status = status === 'error' ? 'error' : 'warning';
          messages.push(`Nomor Anggota "${noAnggota}" sudah digunakan oleh: ${existingByNo.nama} (${existingByNo.puskesmas}).`);
        }

        const existingByName = members.find(
          (m) => m.nama.toLowerCase() === nama.toLowerCase() && m.puskesmas.toLowerCase() === puskesmas.toLowerCase()
        );
        if (existingByName) {
          status = status === 'error' ? 'error' : 'warning';
          messages.push(`Kemungkinan duplikasi nama & satker (${nama} di ${puskesmas}).`);
        }

        // 3. Check Puskesmas Satker Master
        const knownPuskesmas = puskesmasList.some(
          (p) => p.nama.toLowerCase().includes(puskesmas.toLowerCase()) || puskesmas.toLowerCase().includes(p.nama.toLowerCase())
        );
        if (puskesmas && !knownPuskesmas) {
          status = status === 'error' ? 'error' : 'warning';
          messages.push(`Satker "${puskesmas}" tidak persis cocok dengan daftar 39 Puskesmas Kabupaten Malang.`);
        }

        // 4. Format checks
        if (email && !email.includes('@')) {
          status = status === 'error' ? 'error' : 'warning';
          messages.push(`Format email "${email}" tidak valid.`);
        }

        let cleanStatus: MemberStatus = 'aktif';
        if (rawStatus.includes('baru')) cleanStatus = 'baru';
        else if (rawStatus.includes('tidak') || rawStatus.includes('non')) cleanStatus = 'tidak_aktif';
        else if (rawStatus.includes('pindah')) cleanStatus = 'pindah_satker';

        const memberData: Partial<Member> = {
          id: `MBR-IMP-${Date.now()}-${idx}`,
          noAnggota: noAnggota || `PKM-MLG-${Math.floor(100 + Math.random() * 900)}`,
          nama: nama || 'Tanpa Nama',
          gelar: row[fieldMapping.gelar] || 'S.KM',
          puskesmas: puskesmas || 'Puskesmas Kepanjen',
          wilayah: puskesmas.toLowerCase().includes('lawang') || puskesmas.toLowerCase().includes('singosari') ? 'Malang Utara' : 'Malang Selatan',
          jabatanSatker: row[fieldMapping.jabatanSatker] || 'Tenaga Promosi Kesehatan',
          status: cleanStatus,
          tahunBergabung: Number(row[fieldMapping.tahunBergabung]) || 2026,
          kontak: kontak || '0812-0000-0000',
          email: email || `${nama.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
          keteranganStatus: 'Hasil Import Batch Excel/CSV',
          histori: [
            {
              tanggal: new Date().toISOString().split('T')[0],
              aksi: 'Import Batch',
              catatan: `Diimpor melalui Admin Import Wizard (${fileName})`,
            },
          ],
        };

        return {
          rowIdx: idx + 1,
          original: row,
          memberData,
          status,
          messages,
        };
      });

      setValidationResults(results);
      setIsProcessing(false);
      setStep(4);
    }, 400);
  };

  const handleCommitSave = () => {
    // Only import valid and warning items (skip hard errors if desired, or sanitize)
    const validMembers: Member[] = validationResults
      .filter((r) => r.status !== 'error')
      .map((r) => r.memberData as Member);

    if (validMembers.length === 0) {
      alert('Tidak ada data valid yang dapat disimpan.');
      return;
    }

    importMembers(validMembers);
    setStep(6);
  };

  const countValid = validationResults.filter((r) => r.status === 'valid').length;
  const countWarning = validationResults.filter((r) => r.status === 'warning').length;
  const countError = validationResults.filter((r) => r.status === 'error').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-3xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-950 text-red-600 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <span>Wizard Import Data Anggota Promkeser</span>
                <span className="text-[10px] px-2 py-0.2 bg-red-600 text-white rounded-full font-bold">
                  Langkah {step} dari 6
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Alur 6 Tahap Terverifikasi: Upload &rarr; Preview &rarr; Mapping &rarr; Validasi &rarr; Konfirmasi &rarr; Simpan
              </p>
            </div>
          </div>
          <button
            onClick={closeImportModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <div className="bg-slate-100 dark:bg-slate-800/80 px-6 py-2.5 border-b border-slate-200 dark:border-slate-700/60 overflow-x-auto no-scrollbar">
          <div className="flex items-center justify-between min-w-[550px] text-[11px] font-bold">
            <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-red-600' : 'text-slate-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? 'bg-red-600 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-600'}`}>1</span>
              <span>1. Upload</span>
            </div>
            <span className="text-slate-300 dark:text-slate-600">&rarr;</span>

            <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-red-600' : 'text-slate-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-red-600 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-600'}`}>2</span>
              <span>2. Preview</span>
            </div>
            <span className="text-slate-300 dark:text-slate-600">&rarr;</span>

            <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-red-600' : 'text-slate-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 3 ? 'bg-red-600 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-600'}`}>3</span>
              <span>3. Mapping</span>
            </div>
            <span className="text-slate-300 dark:text-slate-600">&rarr;</span>

            <div className={`flex items-center gap-1.5 ${step >= 4 ? 'text-red-600' : 'text-slate-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 4 ? 'bg-red-600 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-600'}`}>4</span>
              <span>4. Validasi</span>
            </div>
            <span className="text-slate-300 dark:text-slate-600">&rarr;</span>

            <div className={`flex items-center gap-1.5 ${step >= 5 ? 'text-red-600' : 'text-slate-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 5 ? 'bg-red-600 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-600'}`}>5</span>
              <span>5. Konfirmasi</span>
            </div>
            <span className="text-slate-300 dark:text-slate-600">&rarr;</span>

            <div className={`flex items-center gap-1.5 ${step >= 6 ? 'text-emerald-600' : 'text-slate-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 6 ? 'bg-emerald-600 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-600'}`}>6</span>
              <span>6. Selesai</span>
            </div>
          </div>
        </div>

        {/* Modal Body per Step */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* STEP 1: UPLOAD */}
          {step === 1 && (
            <div className="space-y-5 text-center">
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-red-500 rounded-3xl p-8 transition bg-slate-50/50 dark:bg-slate-800/30 flex flex-col items-center justify-center cursor-pointer group relative">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls,.json,.txt"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Tarik & Lepas Berkas Excel / CSV / JSON ke Sini
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                  Dukung format .xlsx, .xls, .csv, dan .json. Kolom header akan dideteksi secara otomatis.
                </p>
                <div className="mt-4 px-4 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-red-600 shadow-2xs group-hover:bg-red-600 group-hover:text-white transition">
                  Pilih Berkas dari Komputer
                </div>
              </div>

              {/* Sample loader button */}
              <div className="p-4 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-5 h-5 text-orange-600 shrink-0" />
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white">
                      Uji Langsung dengan Contoh Data Paguyuban
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Memuat 5 baris anggota simulasi (termasuk validasi duplikat & kesalahan format).
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={loadSampleDataset}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold cursor-pointer transition shrink-0"
                >
                  Muat Contoh Data
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PREVIEW */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Tinjauan Baris Data (Preview): {fileName}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Terdeteksi {rawRows.length} baris data dan {columns.length} kolom header.
                  </p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300">
                  {rawRows.length} Baris
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-xl max-h-64">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0">
                    <tr>
                      <th className="p-2.5 font-bold text-slate-500 text-[10px]">#</th>
                      {columns.map((col, idx) => (
                        <th key={idx} className="p-2.5 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {rawRows.slice(0, 8).map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-2.5 text-slate-400 text-[10px]">{rIdx + 1}</td>
                        {columns.map((col, cIdx) => (
                          <td key={cIdx} className="p-2.5 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                            {String(row[col] || '-')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 3: MAPPING */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Pemetaan Kolom (Column Mapping)
                </h4>
                <p className="text-xs text-slate-500">
                  Cocokkan kolom tabel berkas Anda dengan struktur data <strong>MASTER_ANGGOTA</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Nomor Anggota (Kode ID)
                  </label>
                  <select
                    value={fieldMapping.noAnggota}
                    onChange={(e) => setFieldMapping({ ...fieldMapping, noAnggota: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
                  >
                    <option value="">-- Buat Otomatis PKM-MLG-xxx --</option>
                    {columns.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Nama Lengkap * (Wajib)
                  </label>
                  <select
                    value={fieldMapping.nama}
                    onChange={(e) => setFieldMapping({ ...fieldMapping, nama: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold text-red-600"
                  >
                    <option value="">-- Pilih Kolom Nama --</option>
                    {columns.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Gelar Akademik (S.KM / A.Md.Kes / dll)
                  </label>
                  <select
                    value={fieldMapping.gelar}
                    onChange={(e) => setFieldMapping({ ...fieldMapping, gelar: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="">-- Tanpa Gelar / Default S.KM --</option>
                    {columns.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Puskesmas / Satuan Kerja * (Wajib)
                  </label>
                  <select
                    value={fieldMapping.puskesmas}
                    onChange={(e) => setFieldMapping({ ...fieldMapping, puskesmas: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold"
                  >
                    <option value="">-- Pilih Kolom Puskesmas --</option>
                    {columns.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    No. Handphone / WhatsApp
                  </label>
                  <select
                    value={fieldMapping.kontak}
                    onChange={(e) => setFieldMapping({ ...fieldMapping, kontak: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="">-- Lewati Kolom Kontak --</option>
                    {columns.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Email Google Akun
                  </label>
                  <select
                    value={fieldMapping.email}
                    onChange={(e) => setFieldMapping({ ...fieldMapping, email: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="">-- Lewati Kolom Email --</option>
                    {columns.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Status Keanggotaan
                  </label>
                  <select
                    value={fieldMapping.status}
                    onChange={(e) => setFieldMapping({ ...fieldMapping, status: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="">-- Default Status: Aktif --</option>
                    {columns.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Tahun Bergabung
                  </label>
                  <select
                    value={fieldMapping.tahunBergabung}
                    onChange={(e) => setFieldMapping({ ...fieldMapping, tahunBergabung: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="">-- Default Tahun: 2026 --</option>
                    {columns.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: VALIDATION */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Hasil Validasi Otomatis Data
                </h4>
                <p className="text-xs text-slate-500">
                  Sistem memeriksa duplikasi nomor anggota, kesesuaian 39 Puskesmas, format email, dan kelengkapan kolom wajib.
                </p>
              </div>

              {/* Status Summary Pill */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl text-center">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 block">Valid Sempurna</span>
                  <span className="text-xl font-extrabold text-emerald-700 dark:text-emerald-300 font-mono">{countValid}</span>
                </div>
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-center">
                  <span className="text-[10px] uppercase font-bold text-amber-600 block">Peringatan (Warning)</span>
                  <span className="text-xl font-extrabold text-amber-700 dark:text-amber-300 font-mono">{countWarning}</span>
                </div>
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-center">
                  <span className="text-[10px] uppercase font-bold text-red-600 block">Error / Ditolak</span>
                  <span className="text-xl font-extrabold text-red-700 dark:text-red-300 font-mono">{countError}</span>
                </div>
              </div>

              {/* Validation Rows List */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {validationResults.map((res) => (
                  <div
                    key={res.rowIdx}
                    className={`p-3 rounded-xl border text-xs flex items-start justify-between gap-3 ${
                      res.status === 'valid'
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900'
                        : res.status === 'warning'
                        ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900'
                        : 'bg-red-50/60 dark:bg-red-950/30 border-red-200 dark:border-red-900'
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          Baris #{res.rowIdx}: {res.memberData.nama || '(Nama Kosong)'}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          • {res.memberData.puskesmas} ({res.memberData.noAnggota})
                        </span>
                      </div>

                      {res.messages.length > 0 && (
                        <div className="space-y-0.5">
                          {res.messages.map((m, mIdx) => (
                            <div key={mIdx} className="text-[11px] font-medium flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              {res.status === 'error' ? (
                                <AlertCircle className="w-3 h-3 text-red-600 shrink-0" />
                              ) : (
                                <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                              )}
                              <span>{m}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 ${
                        res.status === 'valid'
                          ? 'bg-emerald-600 text-white'
                          : res.status === 'warning'
                          ? 'bg-amber-500 text-white'
                          : 'bg-red-600 text-white'
                      }`}
                    >
                      {res.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: ADMIN CONFIRMATION */}
          {step === 5 && (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950 text-red-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <h4 className="font-black text-base text-slate-900 dark:text-white">
                Konfirmasi Penyimpanan ke MASTER_ANGGOTA
              </h4>

              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                Anda akan menyimpan <strong>{countValid + countWarning}</strong> data anggota ke database <strong>MASTER_ANGGOTA</strong>.
                {countError > 0 && ` Terdapat ${countError} baris error yang akan dilewati secara otomatis.`}
              </p>

              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-left text-xs space-y-2 border border-slate-200 dark:border-slate-700 max-w-lg mx-auto">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total data yang akan ditambahkan:</span>
                  <span className="font-extrabold text-slate-900 dark:text-white font-mono">
                    {countValid + countWarning} Anggota
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pencatatan Riwayat:</span>
                  <span className="font-bold text-emerald-600">Histori Audit Log Terintegrasi</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Kewenangan Eksekutor:</span>
                  <span className="font-bold text-red-600">Administrator Master / Pengurus</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: SUCCESS */}
          {step === 6 && (
            <div className="space-y-4 text-center py-6">
              <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 mx-auto flex items-center justify-center animate-bounce">
                <Check className="w-10 h-10" />
              </div>

              <h4 className="font-black text-lg text-slate-900 dark:text-white">
                Import Data Anggota Berhasil!
              </h4>

              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Seluruh data anggota telah berhasil diselaraskan ke dalam database <strong>MASTER_ANGGOTA</strong> Paguyuban Promkeser Kabupaten Malang.
              </p>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={closeImportModal}
                  className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition"
                >
                  Tutup & Lihat Data Anggota
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        {step < 6 && (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
            <div>
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep((prev) => (prev - 1) as any)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Kembali</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeImportModal}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Batal
              </button>

              {step === 2 && (
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Lanjut Pemetaan Kolom</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {step === 3 && (
                <button
                  type="button"
                  onClick={runValidation}
                  disabled={!fieldMapping.nama || !fieldMapping.puskesmas || isProcessing}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <span>{isProcessing ? 'Memvalidasi...' : 'Jalankan Validasi'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {step === 4 && (
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  disabled={countValid + countWarning === 0}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Lanjut ke Konfirmasi</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {step === 5 && (
                <button
                  type="button"
                  onClick={handleCommitSave}
                  className="px-6 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <span>Simpan ke MASTER_ANGGOTA</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
