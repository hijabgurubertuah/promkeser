import React, { useState } from 'react';
import { X, Upload, CreditCard, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SubmitDuesModal: React.FC = () => {
  const { isSubmitDuesModalOpen, closeSubmitDuesModal, submitMemberDues, currentProfile, members } = useApp();

  const [memberId, setMemberId] = useState(
    currentProfile.role === 'anggota'
      ? members.find((m) => m.nama.includes('Dina'))?.id || members[0]?.id
      : members[0]?.id || ''
  );
  const [periode, setPeriode] = useState('Triwulan III - 2026 (Jul - Sep)');
  const [nominal, setNominal] = useState(150000);
  const [catatan, setCatatan] = useState('');
  const [fileName, setFileName] = useState('');

  if (!isSubmitDuesModalOpen) return null;

  const selectedMem = members.find((m) => m.id === memberId) || members[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMem) return;

    submitMemberDues({
      memberId: selectedMem.id,
      memberName: selectedMem.nama,
      puskesmas: selectedMem.puskesmas,
      nominal: Number(nominal),
      periode,
      fileBukti: fileName || 'Bukti_Transfer_Slip.jpg',
      catatan: catatan || 'Setoran iuran ditransfer via rekening Bank Jatim',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-orange-600" />
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Form Setor Iuran Kas Paguyuban
              </h3>
              <p className="text-[11px] text-slate-500">
                Unggah bukti transfer untuk diverifikasi oleh Bendahara
              </p>
            </div>
          </div>
          <button
            onClick={closeSubmitDuesModal}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {/* Target Rekening Bank Jatim */}
          <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-4 rounded-xl shadow-xs text-xs space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-orange-200 block">
              Rekening Kas Resmi Paguyuban
            </span>
            <div className="text-base font-extrabold tracking-wide">
              Bank Jatim: 034-291829-01
            </div>
            <p className="text-[11px] text-orange-100">
              A.n. Paguyuban Promkeser Kabupaten Malang
            </p>
          </div>

          {/* Pilih Anggota */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Nama Anggota & Satker Puskesmas
            </label>
            <select
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none font-medium"
            >
              {members
                .filter((m) => m.status === 'aktif' || m.status === 'baru')
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nama}, {m.gelar} — {m.puskesmas}
                  </option>
                ))}
            </select>
          </div>

          {/* Periode Iuran */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Periode Iuran yang Disetor
            </label>
            <select
              value={periode}
              onChange={(e) => {
                setPeriode(e.target.value);
                if (e.target.value.includes('Tahun')) {
                  setNominal(600000);
                } else if (e.target.value.includes('Pelunasan')) {
                  setNominal(150000);
                } else {
                  setNominal(150000);
                }
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
            >
              <option value="Triwulan III - 2026 (Jul - Sep)">Triwulan III - 2026 (Rp 150.000)</option>
              <option value="Triwulan IV - 2026 (Okt - Des) Early Bird">Triwulan IV - 2026 Early Bird (Rp 150.000)</option>
              <option value="Pelunasan Tunggakan Iuran Kas 2025">Pelunasan Tunggakan Iuran Kas 2025 (Rp 150.000)</option>
              <option value="Iuran 1 Tahun Penuh 2026">Iuran 1 Tahun Penuh 2026 (Rp 600.000)</option>
            </select>
          </div>

          {/* Nominal */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Nominal Transfer (Rp)
            </label>
            <input
              type="number"
              required
              value={nominal}
              onChange={(e) => setNominal(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          {/* File Bukti Transfer */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Unggah File Struk / Bukti M-Banking
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Pilih file gambar atau PDF bukti setor..."
                className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
              <label className="px-3 py-2 bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300 border border-orange-200 dark:border-orange-800 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5 shrink-0">
                <Upload className="w-3.5 h-3.5" />
                <span>Pilih File</span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setFileName(f.name);
                  }}
                />
              </label>
            </div>
          </div>

          {/* Catatan Tambahan */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Catatan / Referensi Transfer (Opsional)
            </label>
            <input
              type="text"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Contoh: Ditransfer via M-Banking Bank Jatim a.n. Siti"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Setelah diajukan, status setoran akan menjadi "Menunggu Verifikasi" dan diverifikasi oleh Bendahara.</span>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={closeSubmitDuesModal}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white rounded-lg cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Kirimkan Bukti Setor</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
