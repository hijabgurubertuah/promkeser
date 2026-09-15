import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  UserProfile,
  MasterPengguna,
  Member,
  CashTransaction,
  VerificationRequest,
  ActivityRAB,
  OrgDocument,
  HeritageItem,
  AuditLogItem,
  MemberStatus,
  MasterPuskesmas,
} from '../types';
import {
  initialProfiles,
  initialMembers,
  initialPuskesmasList,
  initialTransactions,
  initialVerificationRequests,
  initialActivities,
  initialDocuments,
  initialHeritageItems,
  initialAuditLogs,
} from '../data/initialData';

export type NavigationTab =
  | 'beranda'
  | 'tentang'
  | 'anggota'
  | 'pengguna'
  | 'iuran'
  | 'keuangan'
  | 'kegiatan'
  | 'dokumen'
  | 'pusaka'
  | 'pengaturan';

interface ReceiptModalInfo {
  title: string;
  file: string;
  type?: string;
  nominal?: number;
  date?: string;
  member?: string;
  puskesmas?: string;
  uraian?: string;
}

interface AppContextType {
  // Authentication & Session
  isAuthenticated: boolean;
  loginWithGoogle: (email: string) => { success: boolean; message?: string };
  logout: () => void;
  currentProfile: MasterPengguna;
  setCurrentProfile: (profile: MasterPengguna) => void;
  masterUsers: MasterPengguna[];
  addMasterUser: (user: MasterPengguna) => void;
  updateMasterUser: (id: string, user: Partial<MasterPengguna>) => void;
  deleteMasterUser: (id: string) => void;

  // RBAC Helpers
  isMasterAdmin: boolean;
  isKetua: boolean;
  isBendahara: boolean;
  isPengurus: boolean;
  isAnggotaOnly: boolean;

  // Navigation & General
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
  toggleMobileSidebar: () => void;
  profiles: MasterPengguna[];
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  // Master Data
  members: Member[];
  puskesmasList: MasterPuskesmas[];
  transactions: CashTransaction[];
  verificationRequests: VerificationRequest[];
  activities: ActivityRAB[];
  documents: OrgDocument[];
  heritageItems: HeritageItem[];
  auditLogs: AuditLogItem[];

  // Computed Financial Metrics
  totalSaldo: number;
  totalPemasukan2026: number;
  totalPengeluaran2026: number;
  pemasukanReguler2026: number;
  pelunasan2025: number;
  complianceRate: number;
  totalLunasCount: number;
  totalPendingCount: number;
  totalTertunggakCount: number;
  totalPindahSatkerCount: number;

  // Operations
  approveVerification: (id: string) => void;
  rejectVerification: (id: string, reason?: string) => void;
  addTransaction: (tx: Omit<CashTransaction, 'id' | 'noRef' | 'statusAudit' | 'dibuatOleh'>) => void;
  deleteTransaction: (id: string) => void;
  addMember: (member: Omit<Member, 'id' | 'noAnggota'>) => void;
  addMembersBatch: (batch: Omit<Member, 'id' | 'noAnggota'>[]) => void;
  importMembers: (newMembers: Member[]) => void;
  updateMemberStatus: (id: string, newStatus: MemberStatus, keterangan?: string) => void;
  addActivity: (activity: Omit<ActivityRAB, 'id' | 'efisiensi'>) => void;
  addDocument: (doc: Omit<OrgDocument, 'id'>) => void;
  toggleDocPublication: (id: string) => void;
  backupDataToJSON: () => void;
  submitMemberDues: (data: {
    memberId: string;
    memberName: string;
    puskesmas: string;
    nominal: number;
    periode: string;
    fileBukti: string;
    catatan: string;
  }) => void;

  // Modals
  receiptModal: ReceiptModalInfo | null;
  openReceiptModal: (info: ReceiptModalInfo) => void;
  closeReceiptModal: () => void;

  isAddTxModalOpen: boolean;
  txDefaultType: 'pemasukan' | 'pengeluaran';
  openAddTxModal: (type?: 'pemasukan' | 'pengeluaran') => void;
  closeAddTxModal: () => void;

  isSubmitDuesModalOpen: boolean;
  openSubmitDuesModal: () => void;
  closeSubmitDuesModal: () => void;

  isAddActivityModalOpen: boolean;
  openAddActivityModal: () => void;
  closeAddActivityModal: () => void;

  selectedMember: Member | null;
  openMemberDetailModal: (member: Member) => void;
  closeMemberDetailModal: () => void;

  isImportModalOpen: boolean;
  openImportModal: () => void;
  closeImportModal: () => void;

  isExportModalOpen: boolean;
  openExportModal: () => void;
  closeExportModal: () => void;

  // Notification Toast
  toastMessage: string | null;
  showToast: (msg: string, type?: 'success' | 'error') => void;

  importCsvData: (members: Member[], transactions: CashTransaction[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem('sipag_is_authenticated');
    return saved !== null ? saved === 'true' : true;
  });

  const [masterUsers, setMasterUsers] = useState<MasterPengguna[]>(() => {
    const saved = localStorage.getItem('sipag_master_users');
    return saved ? JSON.parse(saved) : initialProfiles;
  });

  const [currentProfile, setCurrentProfile] = useState<MasterPengguna>(() => {
    const savedEmail = localStorage.getItem('sipag_current_user_email');
    if (savedEmail) {
      const found = masterUsers.find((u) => u.email.toLowerCase() === savedEmail.toLowerCase());
      if (found) return found;
    }
    return masterUsers[0] || initialProfiles[0];
  });

  const [activeTab, setActiveTab] = useState<NavigationTab>('beranda');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const toggleMobileSidebar = () => setIsMobileSidebarOpen((prev) => !prev);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('sipag_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isLiveSyncing, setIsLiveSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string, type?: 'success' | 'error') => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  }, []);

  // Storage states with initial fallbacks
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('sipag_members');
    return saved ? JSON.parse(saved) : initialMembers;
  });

  const [puskesmasList] = useState<MasterPuskesmas[]>(initialPuskesmasList);

  const [transactions, setTransactions] = useState<CashTransaction[]>(() => {
    const saved = localStorage.getItem('sipag_transactions');
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>(() => {
    const saved = localStorage.getItem('sipag_verifications');
    return saved ? JSON.parse(saved) : initialVerificationRequests;
  });

  const [activities, setActivities] = useState<ActivityRAB[]>(() => {
    const saved = localStorage.getItem('sipag_activities');
    return saved ? JSON.parse(saved) : initialActivities;
  });

  const [documents, setDocuments] = useState<OrgDocument[]>(() => {
    const saved = localStorage.getItem('sipag_documents');
    return saved ? JSON.parse(saved) : initialDocuments;
  });

  const [heritageItems] = useState<HeritageItem[]>(initialHeritageItems);

  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(() => {
    const saved = localStorage.getItem('sipag_auditlogs');
    return saved ? JSON.parse(saved) : initialAuditLogs;
  });

  // Modals state
  const [receiptModal, setReceiptModal] = useState<ReceiptModalInfo | null>(null);
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const [txDefaultType, setTxDefaultType] = useState<'pemasukan' | 'pengeluaran'>('pemasukan');
  const [isSubmitDuesModalOpen, setIsSubmitDuesModalOpen] = useState(false);
  const [isAddActivityModalOpen, setIsAddActivityModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Synchronize localStorage
  useEffect(() => {
    localStorage.setItem('sipag_master_users', JSON.stringify(masterUsers));
  }, [masterUsers]);

  useEffect(() => {
    localStorage.setItem('sipag_is_authenticated', String(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    if (currentProfile?.email) {
      localStorage.setItem('sipag_current_user_email', currentProfile.email);
    }
  }, [currentProfile]);

  useEffect(() => {
    localStorage.setItem('sipag_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('sipag_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('sipag_verifications', JSON.stringify(verificationRequests));
  }, [verificationRequests]);

  useEffect(() => {
    localStorage.setItem('sipag_activities', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem('sipag_documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('sipag_auditlogs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Handle Dark Theme Class on <html> and body, and persist
  useEffect(() => {
    localStorage.setItem('sipag_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [theme]);

  const importCsvData = useCallback((newMembers: Member[], newTransactions: CashTransaction[]) => {
    // 1. Deduplicate members by name
    setMembers((prev) => {
      const map = new Map(prev.map((m) => [m.nama.toLowerCase().trim(), m]));
      let added = 0;
      newMembers.forEach((nm) => {
        if (!map.has(nm.nama.toLowerCase().trim())) {
          map.set(nm.nama.toLowerCase().trim(), nm);
          added++;
        }
      });
      return Array.from(map.values());
    });

    // 2. Deduplicate transactions by combination of tanggal + uraian + nominal
    setTransactions((prev) => {
      const map = new Map(prev.map((t) => [`${t.tanggal}-${t.uraian.toLowerCase().trim()}-${t.nominal}`, t]));
      let added = 0;
      newTransactions.forEach((nt) => {
        const key = `${nt.tanggal}-${nt.uraian.toLowerCase().trim()}-${nt.nominal}`;
        if (!map.has(key)) {
          map.set(key, nt);
          added++;
        }
      });
      
      const newMergedTrx = Array.from(map.values()) as CashTransaction[];
      newMergedTrx.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
      
      showToast(`Berhasil menyinkronkan data CSV! (${added} transaksi baru ditambahkan)`, 'success');
      return newMergedTrx;
    });
  }, [showToast]);

  const addAuditLog = (aksi: string, entitas: string, detail: string) => {
    const newLog: AuditLogItem = {
      id: `log-${Date.now()}`,
      waktu: new Date().toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' WIB',
      pengguna: currentProfile.nama,
      role:
        currentProfile.role === 'admin_master'
          ? 'Admin Master'
          : currentProfile.role === 'ketua'
          ? 'Ketua'
          : currentProfile.role === 'bendahara'
          ? 'Bendahara'
          : currentProfile.role === 'pengurus'
          ? 'Pengurus'
          : 'Anggota',
      aksi,
      entitas,
      detail,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Google Authentication Engine
  const loginWithGoogle = (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const user = masterUsers.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return {
        success: false,
        message: `Email Google "${cleanEmail}" belum terdaftar dalam tabel MASTER_PENGGUNA. Hubungi Administrator Master (Yustin).`,
      };
    }

    if (user.statusAkun === 'nonaktif') {
      return {
        success: false,
        message: `Akun Google "${cleanEmail}" berstatus NONAKTIF. Hubungi Administrator Master untuk mengaktifkan kembali.`,
      };
    }

    if (user.statusAkun === 'pending') {
      return {
        success: false,
        message: `Akun Google "${cleanEmail}" masih menunggu persetujuan (PENDING) oleh Administrator Master.`,
      };
    }

    // Update login timestamp
    const nowStamp = new Date().toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }) + ' WIB';

    const updatedUser = { ...user, terakhirLogin: nowStamp };
    setMasterUsers((prev) => prev.map((u) => (u.id === user.id ? updatedUser : u)));
    setCurrentProfile(updatedUser);
    setIsAuthenticated(true);
    showToast(`Selamat datang kembali, ${user.nama}!`);
    addAuditLog('Login Google', `${user.email} (${user.role})`, `Login berhasil pada ${nowStamp}`);
    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    showToast('Anda telah keluar dari sesi aplikasi SIPAG.');
  };

  const addMasterUser = (user: MasterPengguna) => {
    setMasterUsers((prev) => [user, ...prev]);
    showToast(`Pengguna baru ${user.nama} (${user.email}) berhasil ditambahkan ke MASTER_PENGGUNA.`);
    addAuditLog('Tambah Pengguna', user.email, `Role: ${user.role}, Status: ${user.statusAkun}`);
  };

  const updateMasterUser = (id: string, updated: Partial<MasterPengguna>) => {
    setMasterUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const res = { ...u, ...updated };
          if (currentProfile.id === id) {
            setCurrentProfile(res);
          }
          return res;
        }
        return u;
      })
    );
    showToast('Data pengguna & hak akses berhasil diperbarui.');
    addAuditLog('Perbarui Pengguna', id, 'Perubahan data role / status akun pengguna');
  };

  const deleteMasterUser = (id: string) => {
    setMasterUsers((prev) => prev.filter((u) => u.id !== id));
    showToast('Pengguna berhasil dihapus dari MASTER_PENGGUNA.');
    addAuditLog('Hapus Pengguna', id, 'Menghapus akses akun Google dari sistem');
  };

  // RBAC Permission Computations
  const isMasterAdmin = currentProfile.role === 'admin_master';
  const isKetua = currentProfile.role === 'ketua';
  const isBendahara = currentProfile.role === 'bendahara' || currentProfile.role === 'admin_master';
  const isPengurus = ['admin_master', 'ketua', 'bendahara', 'pengurus'].includes(currentProfile.role);
  const isAnggotaOnly = currentProfile.role === 'anggota';

  const triggerLiveSync = async () => {
    setIsLiveSyncing(true);

    const nowFormatted = new Date().toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }) + ' WIB';

    setTimeout(() => {
      setIsLiveSyncing(false);
      showToast('Sinkronisasi lokal selesai!');
      addAuditLog('Sinkronisasi Data Lokal', 'Memori Kas & Anggota', `Rekonsiliasi internal (${nowFormatted})`);
    }, 700);
  };

  // Financial Computations dynamically based on PRD baseline + user additions
  const baselineInitialIds = useMemo(() => new Set(initialTransactions.map((t) => t.id)), []);
  const newTransactions = useMemo(
    () => transactions.filter((t) => !baselineInitialIds.has(t.id)),
    [transactions, baselineInitialIds]
  );

  const additionalPemasukan = useMemo(
    () =>
      newTransactions
        .filter((t) => t.jenis === 'pemasukan')
        .reduce((acc, curr) => acc + curr.nominal, 0),
    [newTransactions]
  );

  const additionalPengeluaran = useMemo(
    () =>
      newTransactions
        .filter((t) => t.jenis === 'pengeluaran')
        .reduce((acc, curr) => acc + curr.nominal, 0),
    [newTransactions]
  );

  const totalPemasukan2026 = 8450000 + additionalPemasukan;
  const totalPengeluaran2026 = 5794560 + additionalPengeluaran;
  const pemasukanReguler2026 = 7730000 + additionalPemasukan;
  const pelunasan2025 = 720000;
  const totalSaldo = totalPemasukan2026 - totalPengeluaran2026;

  const totalLunasCount = members.filter((m) => m.status === 'aktif' && m.keteranganStatus.toLowerCase().includes('lunas')).length || 34;
  const totalPendingCount = verificationRequests.filter((v) => v.status === 'pending').length;
  const totalTertunggakCount = members.filter((m) => m.keteranganStatus.toLowerCase().includes('tunggakan')).length || 7;
  const totalPindahSatkerCount = members.filter((m) => m.status === 'pindah_satker').length || 7;
  const complianceRate = members.length > 0 ? Math.round((totalLunasCount / members.length) * 1000) / 10 : 78.4;

  // Operations
  const approveVerification = (id: string) => {
    const item = verificationRequests.find((v) => v.id === id);
    if (!item) return;

    setVerificationRequests((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: 'disetujui' } : v))
    );

    const newTx: CashTransaction = {
      id: `trx-${Date.now()}`,
      noRef: `TRX-2026-${String(transactions.length + 93).padStart(3, '0')}`,
      tanggal: new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      jenis: 'pemasukan',
      kategori: item.kategoriIuran === 'pelunasan_2025' ? 'Pelunasan Tunggakan' : 'Iuran Rutin',
      uraian: `${item.periodeLabel} A.n. ${item.memberName}, ${item.gelar}`,
      puskesmasAtauSatker: item.puskesmas,
      nominal: item.nominal,
      statusAudit: 'tervalidasi',
      buktiFile: item.fileBukti,
      buktiNama: item.fileBukti,
      dibuatOleh: `${currentProfile.nama} (${currentProfile.jabatan})`,
    };

    setTransactions((prev) => [newTx, ...prev]);

    setMembers((prev) =>
      prev.map((m) =>
        m.id === item.memberId
          ? {
              ...m,
              keteranganStatus: `Lunas ${item.periodeLabel} (Tervalidasi)`,
            }
          : m
      )
    );

    addAuditLog(
      'Persetujuan Setoran Iuran',
      `${newTx.noRef} (${item.memberName})`,
      `Menyetujui pembayaran ${item.periodeLabel} sebesar Rp ${item.nominal.toLocaleString('id-ID')} dari ${item.puskesmas}`
    );

    showToast(`Pembayaran ${item.memberName} (${item.puskesmas}) berhasil disetujui & dicatat ke Buku Kas!`);
  };

  const rejectVerification = (id: string, reason?: string) => {
    const item = verificationRequests.find((v) => v.id === id);
    if (!item) return;

    setVerificationRequests((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: 'ditolak' } : v))
    );

    addAuditLog(
      'Penolakan Setoran Iuran',
      `${item.id} (${item.memberName})`,
      `Menolak pengajuan setoran: ${reason || 'Bukti transfer buram/nominal tidak sesuai mutasi bank'}`
    );

    showToast(`Setoran ${item.memberName} telah ditolak. Notifikasi dikirimkan.`);
  };

  const addTransaction = (
    tx: Omit<CashTransaction, 'id' | 'noRef' | 'statusAudit' | 'dibuatOleh'>
  ) => {
    const newTx: CashTransaction = {
      ...tx,
      id: `trx-${Date.now()}`,
      noRef: `TRX-2026-${String(transactions.length + 93).padStart(3, '0')}`,
      statusAudit: 'tervalidasi',
      dibuatOleh: `${currentProfile.nama} (${currentProfile.jabatan})`,
    };

    setTransactions((prev) => [newTx, ...prev]);

    addAuditLog(
      tx.jenis === 'pemasukan' ? 'Catat Pemasukan Kas' : 'Catat Pengeluaran Kas',
      newTx.noRef,
      `${tx.uraian} - Rp ${tx.nominal.toLocaleString('id-ID')} (${tx.puskesmasAtauSatker})`
    );

    showToast(`Transaksi ${newTx.noRef} berhasil dicatat ke Buku Kas Utama!`);
    setIsAddTxModalOpen(false);
  };

  const deleteTransaction = (id: string) => {
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    addAuditLog(
      'Hapus Transaksi Kas',
      tx.noRef,
      `Menghapus mutasi kas: ${tx.uraian} senilai Rp ${tx.nominal.toLocaleString('id-ID')}`
    );
    showToast(`Transaksi ${tx.noRef} berhasil dihapus dari Buku Kas.`);
  };

  const addMember = (memberData: Omit<Member, 'id' | 'noAnggota'>) => {
    const newNo = `PKM-MLG-${String(members.length + 1).padStart(3, '0')}`;
    const newMember: Member = {
      ...memberData,
      id: `MBR-${Date.now()}`,
      noAnggota: newNo,
    };
    setMembers((prev) => [...prev, newMember]);
    addAuditLog('Tambah Master Anggota', newMember.noAnggota, `Mendaftarkan ${newMember.nama} (${newMember.puskesmas})`);
    showToast(`Anggota baru ${newMember.nama} (${newNo}) berhasil ditambahkan!`);
  };

  const addMembersBatch = (batchData: Omit<Member, 'id' | 'noAnggota'>[]) => {
    if (batchData.length === 0) return;
    let nextNum = members.length + 1;
    const timestamp = Date.now();
    const newItems: Member[] = batchData.map((item, idx) => ({
      ...item,
      id: `MBR-${timestamp}-${idx}`,
      noAnggota: `PKM-MLG-${String(nextNum++).padStart(3, '0')}`,
    }));
    setMembers((prev) => [...prev, ...newItems]);
    addAuditLog(
      'Impor Massal Anggota',
      `${newItems.length} Anggota`,
      `Berhasil mengimpor ${newItems.length} anggota baru ke Master Data SIPAG`
    );
    showToast(`Berhasil menambahkan ${newItems.length} anggota baru secara massal!`);
  };

  const importMembers = (newMembers: Member[]) => {
    setMembers(newMembers);
    addAuditLog(
      'Sinkronisasi & Impor MASTER_ANGGOTA',
      `${newMembers.length} Anggota`,
      `Memperbarui seluruh database Master Anggota (${newMembers.length} record)`
    );
    showToast(`Database Master Anggota berhasil diperbarui (${newMembers.length} data anggota)!`);
  };

  const updateMemberStatus = (id: string, newStatus: MemberStatus, keterangan?: string) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              status: newStatus,
              keteranganStatus: keterangan || m.keteranganStatus,
            }
          : m
      )
    );
    const target = members.find((m) => m.id === id);
    if (target) {
      addAuditLog('Perubahan Status Anggota', target.noAnggota, `Mengubah status ${target.nama} menjadi ${newStatus}`);
      showToast(`Status keanggotaan ${target.nama} berhasil diperbarui.`);
    }
  };

  const addActivity = (actData: Omit<ActivityRAB, 'id' | 'efisiensi'>) => {
    const newAct: ActivityRAB = {
      ...actData,
      id: `act-${Date.now()}`,
      efisiensi: actData.totalRAB - actData.totalRealisasi,
    };
    setActivities((prev) => [newAct, ...prev]);
    addAuditLog('Usulan Kegiatan & RAB Baru', newAct.namaKegiatan, `Alokasi RAB: Rp ${newAct.totalRAB.toLocaleString('id-ID')}`);
    showToast(`Kegiatan "${newAct.namaKegiatan}" berhasil didaftarkan ke Kontrol RAB!`);
    setIsAddActivityModalOpen(false);
  };

  const addDocument = (docData: Omit<OrgDocument, 'id'>) => {
    const newDoc: OrgDocument = {
      ...docData,
      id: `doc-${Date.now()}`,
    };
    setDocuments((prev) => [newDoc, ...prev]);
    addAuditLog('Unggah Dokumen Paguyuban', newDoc.judul, `Kategori: ${newDoc.kategori}, Akses: ${newDoc.statusPublikasi}`);
    showToast(`Dokumen "${newDoc.judul}" berhasil diunggah.`);
  };

  const toggleDocPublication = (id: string) => {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              statusPublikasi: d.statusPublikasi === 'publik' ? 'internal' : 'publik',
            }
          : d
      )
    );
    const doc = documents.find((d) => d.id === id);
    if (doc) {
      const nextStatus = doc.statusPublikasi === 'publik' ? 'Internal' : 'Dipublikasikan ke Anggota';
      addAuditLog('Ubah Status Publikasi Dokumen', doc.judul, `Status diubah menjadi: ${nextStatus}`);
      showToast(`Status publikasi "${doc.judul}" diubah menjadi ${nextStatus}.`);
    }
  };

  const submitMemberDues = (data: {
    memberId: string;
    memberName: string;
    puskesmas: string;
    nominal: number;
    periode: string;
    fileBukti: string;
    catatan: string;
  }) => {
    const newVerif: VerificationRequest = {
      id: `verif-${Date.now()}`,
      memberId: data.memberId,
      memberName: data.memberName,
      gelar: 'S.KM',
      puskesmas: data.puskesmas,
      periodeLabel: data.periode,
      nominal: data.nominal,
      tanggalUpload: new Date().toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' WIB',
      fileBukti: data.fileBukti || 'Bukti_Setor_Manual.jpg',
      fileType: data.fileBukti.endsWith('.pdf') ? 'pdf' : 'image',
      catatanAnggota: data.catatan,
      status: 'pending',
      kategoriIuran: data.periode.includes('2025') ? 'pelunasan_2025' : 'reguler_2026',
    };

    setVerificationRequests((prev) => [newVerif, ...prev]);
    addAuditLog('Pengajuan Setoran Iuran Mandiri', `${data.memberName} (${data.puskesmas})`, `Mengunggah slip setoran Rp ${data.nominal.toLocaleString('id-ID')} untuk ${data.periode}`);
    showToast('Bukti setoran iuran Anda berhasil diunggah! Menunggu verifikasi dari Bendahara Paguyuban.');
    setIsSubmitDuesModalOpen(false);
  };

  const backupDataToJSON = () => {
    const backupObj = {
      app: 'SIPAG Promkeser Kabupaten Malang',
      exportDate: new Date().toISOString(),
      saldoTerekonsiliasi: totalSaldo,
      masterPengguna: masterUsers,
      members,
      transactions,
      verificationRequests,
      activities,
      documents,
      auditLogs,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `SIPAG_Backup_Data_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Cadangan data SIPAG berhasil diunduh ke format JSON!');
    addAuditLog('Cadangkan Data Sistem', 'Backup Utuh', 'Mengunduh salinan cadangan database lokal');
  };

  // Modal handlers
  const openReceiptModal = (info: ReceiptModalInfo) => setReceiptModal(info);
  const closeReceiptModal = () => setReceiptModal(null);

  const openAddTxModal = (type: 'pemasukan' | 'pengeluaran' = 'pemasukan') => {
    setTxDefaultType(type);
    setIsAddTxModalOpen(true);
  };
  const closeAddTxModal = () => setIsAddTxModalOpen(false);

  const openSubmitDuesModal = () => setIsSubmitDuesModalOpen(true);
  const closeSubmitDuesModal = () => setIsSubmitDuesModalOpen(false);

  const openAddActivityModal = () => setIsAddActivityModalOpen(true);
  const closeAddActivityModal = () => setIsAddActivityModalOpen(false);

  const openMemberDetailModal = (member: Member) => setSelectedMember(member);
  const closeMemberDetailModal = () => setSelectedMember(null);

  const openImportModal = () => setIsImportModalOpen(true);
  const closeImportModal = () => setIsImportModalOpen(false);

  const openExportModal = () => setIsExportModalOpen(true);
  const closeExportModal = () => setIsExportModalOpen(false);

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        loginWithGoogle,
        logout,
        currentProfile,
        setCurrentProfile,
        masterUsers,
        addMasterUser,
        updateMasterUser,
        deleteMasterUser,

        isMasterAdmin,
        isKetua,
        isBendahara,
        isPengurus,
        isAnggotaOnly,

        activeTab,
        setActiveTab,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        toggleMobileSidebar,
        profiles: masterUsers,
        theme,
        setTheme,
        searchQuery,
        setSearchQuery,

        members,
        puskesmasList,
        transactions,
        verificationRequests,
        activities,
        documents,
        heritageItems,
        auditLogs,

        totalSaldo,
        totalPemasukan2026,
        totalPengeluaran2026,
        pemasukanReguler2026,
        pelunasan2025,
        complianceRate,
        totalLunasCount,
        totalPendingCount,
        totalTertunggakCount,
        totalPindahSatkerCount,

        approveVerification,
        rejectVerification,
        addTransaction,
        deleteTransaction,
        addMember,
        addMembersBatch,
        importMembers,
        updateMemberStatus,
        addActivity,
        addDocument,
        toggleDocPublication,
        backupDataToJSON,
        submitMemberDues,

        receiptModal,
        openReceiptModal,
        closeReceiptModal,

        isAddTxModalOpen,
        txDefaultType,
        openAddTxModal,
        closeAddTxModal,

        isSubmitDuesModalOpen,
        openSubmitDuesModal,
        closeSubmitDuesModal,

        isAddActivityModalOpen,
        openAddActivityModal,
        closeAddActivityModal,

        selectedMember,
        openMemberDetailModal,
        closeMemberDetailModal,

        isImportModalOpen,
        openImportModal,
        closeImportModal,

        isExportModalOpen,
        openExportModal,
        closeExportModal,

        importCsvData,

        toastMessage,
        showToast,
      }}
    >
      {children}
      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 bg-[#0F172A] text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700 animate-slide-up text-sm font-medium">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white text-xs ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
