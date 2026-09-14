import React, { useState } from 'react';
import {
  ShieldAlert,
  UserCheck,
  UserX,
  UserPlus,
  Search,
  Filter,
  Key,
  Shield,
  Link,
  Mail,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  AlertCircle,
  Lock,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MasterPengguna, UserRole } from '../../types';

export const UsersManagementView: React.FC = () => {
  const {
    masterUsers,
    members,
    addMasterUser,
    updateMasterUser,
    deleteMasterUser,
    currentProfile,
  } = useApp();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<MasterPengguna | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    email: string;
    nama: string;
    role: UserRole;
    statusAkun: 'aktif' | 'nonaktif' | 'pending';
    title: string;
    puskesmas: string;
    idAnggota: string;
    hakAkses: string[];
  }>({
    email: '',
    nama: '',
    role: 'anggota',
    statusAkun: 'aktif',
    title: 'Anggota Promkeser',
    puskesmas: '',
    idAnggota: '',
    hakAkses: ['profil_mandiri', 'iuran_mandiri'],
  });

  const isMasterAdmin = currentProfile.role === 'admin_master';

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      email: '',
      nama: '',
      role: 'anggota',
      statusAkun: 'aktif',
      title: 'Anggota Tenaga Promkes',
      puskesmas: members[0]?.puskesmas || '',
      idAnggota: '',
      hakAkses: ['profil_mandiri', 'iuran_mandiri', 'upload_bukti', 'dokumen_publik'],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: MasterPengguna) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      nama: user.nama,
      role: user.role,
      statusAkun: user.statusAkun,
      title: user.title,
      puskesmas: user.puskesmas || '',
      idAnggota: user.idAnggota || '',
      hakAkses: user.hakAkses || [],
    });
    setIsModalOpen(true);
  };

  const handleMemberSelect = (memberId: string) => {
    const found = members.find((m) => m.id === memberId);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        idAnggota: memberId,
        nama: found.nama + (found.gelar ? `, ${found.gelar}` : ''),
        puskesmas: found.puskesmas,
        email: prev.email || found.email,
      }));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.nama) return;

    if (editingUser) {
      updateMasterUser(editingUser.id, {
        ...formData,
      });
    } else {
      addMasterUser({
        id: `usr-${Date.now()}`,
        ...formData,
        avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80`,
        terakhirLogin: 'Belum pernah login',
      });
    }
    setIsModalOpen(false);
  };

  const filteredUsers = masterUsers.filter((u) => {
    const matchSearch =
      u.nama.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.puskesmas && u.puskesmas.toLowerCase().includes(search.toLowerCase()));
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchStatus = statusFilter === 'all' || u.statusAkun === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-6 bg-red-600 rounded-full inline-block"></span>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Master Pengguna & Hak Akses (RBAC)</span>
              <span className="px-2 py-0.5 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 text-[10px] font-black rounded-md uppercase">
                MASTER_PENGGUNA
              </span>
            </h1>
          </div>
          <p className="text-xs text-slate-500 pl-3.5">
            Dikelola khusus oleh <strong>Administrator Master (Yustin)</strong>. Menghubungkan akun Google dengan data identitas di <strong>MASTER_ANGGOTA</strong>.
          </p>
        </div>

        {isMasterAdmin && (
          <button
            onClick={handleOpenAdd}
            className="w-full sm:w-auto px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs transition transform hover:-translate-y-0.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Pengguna Google</span>
          </button>
        )}
      </div>

      {/* Info Card: Konsep Pemisahan Data */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 rounded-2xl shadow-xs space-y-1.5">
          <div className="flex items-center gap-2 text-orange-400">
            <Key className="w-4 h-4" />
            <span className="text-xs font-extrabold uppercase tracking-wide">Prinsip Login Google</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Pengguna tidak memasukkan password dan tidak memilih peran. Sistem membaca email Google secara otomatis, lalu mencocokkannya dengan tabel MASTER_PENGGUNA.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5">
          <div className="flex items-center gap-2 text-red-600">
            <Shield className="w-4 h-4" />
            <span className="text-xs font-extrabold uppercase tracking-wide">Status Akun ≠ Status Anggota</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Anggota aktif di MASTER_ANGGOTA belum tentu memiliki akses login sampai didaftarkan email Google-nya. Menonaktifkan akun pengguna tidak menghapus riwayat keanggotaannya.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5">
          <div className="flex items-center gap-2 text-emerald-600">
            <Link className="w-4 h-4" />
            <span className="text-xs font-extrabold uppercase tracking-wide">Relasi ID Anggota</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Akun peran 'Anggota' wajib ditautkan ke ID Anggota agar sistem dapat menampilkan tagihan, riwayat iuran, dan formulir bayar khusus dirinya secara otomatis.
          </p>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari email Google, nama, satker..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
          >
            <option value="all">Semua Peran (Role)</option>
            <option value="admin_master">Admin Master</option>
            <option value="ketua">Ketua</option>
            <option value="bendahara">Bendahara</option>
            <option value="pengurus">Pengurus</option>
            <option value="anggota">Anggota</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
          >
            <option value="all">Semua Status Akun</option>
            <option value="aktif">Akun Aktif</option>
            <option value="nonaktif">Akun Dinonaktifkan</option>
            <option value="pending">Pending Verifikasi</option>
          </select>
        </div>

        <span className="text-xs text-slate-400 self-end sm:self-center font-medium">
          Menampilkan {filteredUsers.length} dari {masterUsers.length} Pengguna
        </span>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 text-[10px] uppercase font-bold tracking-wider bg-slate-50 dark:bg-slate-900/50">
                <th className="py-3.5 px-4">PENGGUNA GOOGLE</th>
                <th className="py-3.5 px-3">ROLE (PERAN SISTEM)</th>
                <th className="py-3.5 px-3">RELASI MASTER_ANGGOTA</th>
                <th className="py-3.5 px-3">STATUS AKUN</th>
                <th className="py-3.5 px-3">TERAKHIR LOGIN</th>
                <th className="py-3.5 px-4 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filteredUsers.map((user) => {
                const linkedMember = members.find((m) => m.id === user.idAnggota);

                return (
                  <tr key={user.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatarUrl}
                          alt={user.nama}
                          className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-xs">{user.nama}</div>
                          <div className="text-[11px] text-orange-600 dark:text-orange-400 font-mono flex items-center gap-1">
                            <Mail className="w-3 h-3 shrink-0" />
                            <span>{user.email}</span>
                          </div>
                          <div className="text-[10px] text-slate-400">{user.title}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase ${
                          user.role === 'admin_master'
                            ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                            : user.role === 'ketua'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : user.role === 'bendahara'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : user.role === 'pengurus'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                        }`}
                      >
                        {user.role === 'admin_master' ? 'Admin Master' : user.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      {linkedMember ? (
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                            <Link className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>{linkedMember.nama}</span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {linkedMember.noAnggota} • {linkedMember.puskesmas}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Tanpa Tautan Anggota (Pengurus Khusus)</span>
                      )}
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          user.statusAkun === 'aktif'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : user.statusAkun === 'pending'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {user.statusAkun === 'aktif' && <CheckCircle2 className="w-3 h-3" />}
                        {user.statusAkun === 'pending' && <Clock className="w-3 h-3" />}
                        {user.statusAkun === 'nonaktif' && <UserX className="w-3 h-3" />}
                        <span className="capitalize">{user.statusAkun}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px]">
                      {user.terakhirLogin || '-'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {isMasterAdmin ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(user)}
                            className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition"
                            title="Ubah Pengguna & Hak Akses"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {user.email !== 'yustin.promkes@gmail.com' && (
                            <button
                              onClick={() => {
                                if (confirm(`Hapus akun pengguna ${user.nama} (${user.email})? Data MASTER_ANGGOTA tidak akan terhapus.`)) {
                                  deleteMasterUser(user.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg cursor-pointer transition"
                              title="Hapus Akun Pengguna"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Read-only</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add/Edit User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {editingUser ? 'Ubah Pengguna Google & Peran' : 'Tambah Pengguna Google Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Email Akun Google (Wajib & Unik) *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="nama.user@gmail.com"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Pengguna akan login menggunakan email Google ini.
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Tautkan ke Data MASTER_ANGGOTA (Opsional)
                </label>
                <select
                  value={formData.idAnggota}
                  onChange={(e) => handleMemberSelect(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="">-- Tanpa Relasi Anggota (Pengurus / Admin Saja) --</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.noAnggota} - {m.nama}, {m.gelar} ({m.puskesmas})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Nama Lengkap & Gelar *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Nama Pengguna"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Role (Kewenangan) *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold"
                  >
                    <option value="admin_master">Administrator Master</option>
                    <option value="ketua">Ketua Paguyuban</option>
                    <option value="bendahara">Bendahara Paguyuban</option>
                    <option value="pengurus">Pengurus / Koorwil</option>
                    <option value="anggota">Anggota</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Status Akun Login *
                  </label>
                  <select
                    value={formData.statusAkun}
                    onChange={(e) =>
                      setFormData({ ...formData, statusAkun: e.target.value as 'aktif' | 'nonaktif' | 'pending' })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold"
                  >
                    <option value="aktif">Aktif (Dapat Login)</option>
                    <option value="nonaktif">Nonaktif (Blokir Login)</option>
                    <option value="pending">Pending (Menunggu)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Jabatan / Deskripsi Tugas
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="misal: Koordinator Wilayah Malang Barat"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold cursor-pointer transition shadow-xs"
                >
                  {editingUser ? 'Simpan Perubahan' : 'Tambah Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
