import React, { useState } from 'react';
import { X, User, Phone, Mail, Building2, MapPin, Calendar, ShieldCheck, Edit3, CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MemberStatus } from '../../types';

export const MemberDetailModal: React.FC = () => {
  const { selectedMember, closeMemberDetailModal, updateMemberStatus, currentProfile } = useApp();
  const [editingStatus, setEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<MemberStatus>(selectedMember?.status || 'aktif');
  const [keterangan, setKeterangan] = useState(selectedMember?.keteranganStatus || '');

  if (!selectedMember) return null;

  const canEdit = currentProfile.role === 'admin' || currentProfile.role === 'bendahara';

  const handleSaveStatus = () => {
    updateMemberStatus(selectedMember.id, newStatus, keterangan);
    setEditingStatus(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-orange-600" />
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Detail Profil Anggota Paguyuban
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">{selectedMember.noAnggota}</p>
            </div>
          </div>
          <button
            onClick={closeMemberDetailModal}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Member Card */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400 font-bold text-base flex items-center justify-center shrink-0">
              {selectedMember.nama.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                {selectedMember.nama}, {selectedMember.gelar}
              </h4>
              <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 mt-0.5">
                {selectedMember.jabatanSatker}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    selectedMember.status === 'aktif'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400'
                      : selectedMember.status === 'baru'
                      ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400'
                      : selectedMember.status === 'pindah_satker'
                      ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-400'
                      : 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {selectedMember.status.replace('_', ' ').toUpperCase()}
                </span>
                <span className="text-[11px] text-slate-400">
                  Bergabung sejak {selectedMember.tahunBergabung}
                </span>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                <Building2 className="w-3 h-3" /> PUSKESMAS INDUK
              </span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mt-1">{selectedMember.puskesmas}</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                <MapPin className="w-3 h-3" /> WILAYAH KOORDINASI
              </span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mt-1">{selectedMember.wilayah}</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                <Phone className="w-3 h-3" /> KONTAK TELEPON / WA
              </span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mt-1">{selectedMember.kontak}</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                <Mail className="w-3 h-3" /> SURAT ELEKTRONIK
              </span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mt-1 truncate">{selectedMember.email}</p>
            </div>
          </div>

          {/* Status Keuangan & Catatan */}
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/60 text-xs">
            <span className="font-bold text-amber-900 dark:text-amber-300 block mb-1">
              Catatan Status Fungsional & Iuran
            </span>
            <p className="text-amber-800 dark:text-amber-200">{selectedMember.keteranganStatus || 'Semua kewajiban iuran lancar terekonsiliasi.'}</p>
          </div>

          {/* Admin / Bendahara Status Change Section */}
          {canEdit && (
            <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
              {!editingStatus ? (
                <button
                  onClick={() => {
                    setNewStatus(selectedMember.status);
                    setKeterangan(selectedMember.keteranganStatus || '');
                    setEditingStatus(true);
                  }}
                  className="w-full py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Ubah Status Keanggotaan (Historis Tetap Terjaga)</span>
                </button>
              ) : (
                <div className="space-y-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    Perbarui Status Anggota
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">Pilih Status Baru:</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as MemberStatus)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
                    >
                      <option value="aktif">Aktif Lapangan</option>
                      <option value="baru">Anggota Baru</option>
                      <option value="pindah_satker">Pindah Satker / Mutasi</option>
                      <option value="tidak_aktif">Tidak Aktif / Tugas Belajar / Purna</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">Keterangan Tambahan:</label>
                    <input
                      type="text"
                      value={keterangan}
                      onChange={(e) => setKeterangan(e.target.value)}
                      placeholder="Contoh: Pindah satker ke RSUD / Tugas Belajar"
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setEditingStatus(false)}
                      className="px-3 py-1 text-xs text-slate-500 hover:text-slate-700"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveStatus}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Simpan Perubahan</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Data historis terlindungi
          </span>
          <button
            onClick={closeMemberDetailModal}
            className="px-4 py-1.5 text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
