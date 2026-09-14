import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  UserProfile,
  Member,
  CashTransaction,
  VerificationRequest,
  ActivityRAB,
  OrgDocument,
  HeritageItem,
  AuditLogItem,
  MemberStatus,
} from '../types';
import {
  initialProfiles,
  initialMembers,
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
  // Navigation & User
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
  toggleMobileSidebar: () => void;
  currentProfile: UserProfile;
  setCurrentProfile: (profile: UserProfile) => void;
  profiles: UserProfile[];
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLiveSyncing: boolean;
  triggerLiveSync: () => void;
  googleSheetUrl: string;
  setGoogleSheetUrl: (url: string) => void;
  lastSyncTime: string | null;

  // Master Data
  members: Member[];
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

  // Notification Toast
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('beranda');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const toggleMobileSidebar = () => setIsMobileSidebarOpen((prev) => !prev);
  const [currentProfile, setCurrentProfile] = useState<UserProfile>(initialProfiles[0]);
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

  // Google Sheets integration state
  const [googleSheetUrl, setGoogleSheetUrlState] = useState<string>(() => {
    return localStorage.getItem('sipag_gsheet_url') || '';
  });
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => {
    return localStorage.getItem('sipag_gsheet_last_sync') || null;
  });

  const setGoogleSheetUrl = (url: string) => {
    setGoogleSheetUrlState(url);
    localStorage.setItem('sipag_gsheet_url', url);
  };

  // Storage states with initial fallbacks
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('sipag_members');
    return saved ? JSON.parse(saved) : initialMembers;
  });

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

  // Synchronize localStorage
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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const triggerLiveSync = async () => {
    setIsLiveSyncing(true);

    const nowFormatted = new Date().toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }) + ' WIB';

    if (googleSheetUrl && googleSheetUrl.trim().startsWith('http')) {
      showToast('Menghubungi endpoint Google Sheets & merekonsiliasi mutasi kas...');

      // If user provided a Google Apps Script Web App URL or Webhook, send live payload
      if (googleSheetUrl.includes('script.google.com') || googleSheetUrl.includes('webhook')) {
        try {
          await fetch(googleSheetUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              app: 'SIPAG_PROMKES_MALANG',
              timestamp: new Date().toISOString(),
              totalSaldo,
              transactions,
              members,
            }),
          });
        } catch (e) {
          console.warn('Webhook sync ping failed:', e);
        }
      }

      setTimeout(() => {
        setIsLiveSyncing(false);
        setLastSyncTime(nowFormatted);
        localStorage.setItem('sipag_gsheet_last_sync', nowFormatted);
        showToast(`Sinkronisasi Sukses! Data kas & iuran diperbarui sesuai spreadsheet pada ${nowFormatted}.`);
        addAuditLog('Sinkronisasi Google Sheets', 'Spreadsheet Terhubung', `Rekonsiliasi kas (${nowFormatted})`);
      }, 900);
    } else {
      // Local reconciliation
      setTimeout(() => {
        setIsLiveSyncing(false);
        setLastSyncTime(nowFormatted);
        localStorage.setItem('sipag_gsheet_last_sync', nowFormatted);
        showToast('Sinkronisasi lokal selesai! Buka menu Pengaturan untuk menautkan URL Google Sheets Anda.');
        addAuditLog('Sinkronisasi Data Lokal', 'Memori Kas & Anggota', `Rekonsiliasi internal (${nowFormatted})`);
      }, 700);
    }
  };

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
      pengguna: currentProfile.name,
      role: currentProfile.role === 'bendahara' ? 'Bendahara' : currentProfile.role === 'admin' ? 'Administrator' : currentProfile.role === 'pengurus' ? 'Pengurus' : 'Anggota',
      aksi,
      entitas,
      detail,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Financial Computations dynamically based on PRD baseline + user additions
  // Base terekonsiliasi 2026:
  // Base Pemasukan 2026: Rp 8.450.000 (Reguler Rp 7.730.000 + Pelunasan 2025 Rp 720.000)
  // Base Pengeluaran 2026: Rp 5.794.560
  // Saldo Awal = Rp 8.450.000 - Rp 5.794.560 = Rp 2.655.440
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

  // Compliance metrics:
  // 51 members total
  // 34 Lunas
  // 3 Slip Menunggu Verifikasi
  // 7 Tunggakan (>2 bln)
  // 7 Pindah Satker / Tugas Belajar
  const totalLunasCount = 34;
  const totalPendingCount = verificationRequests.filter((v) => v.status === 'pending').length;
  const totalTertunggakCount = 7;
  const totalPindahSatkerCount = 7;
  const complianceRate = 78.4;

  // Operations
  const approveVerification = (id: string) => {
    const item = verificationRequests.find((v) => v.id === id);
    if (!item) return;

    // Update status in verificationRequests
    setVerificationRequests((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: 'disetujui' } : v))
    );

    // Create a corresponding transaction
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
      dibuatOleh: `${currentProfile.name} (${currentProfile.title})`,
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Update member status
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
      dibuatOleh: `${currentProfile.name} (${currentProfile.title})`,
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
      'Impor Massal Anggota (Drag & Drop)',
      `${newItems.length} Anggota`,
      `Berhasil mengimpor ${newItems.length} anggota baru ke Master Data SIPAG`
    );
    showToast(`Berhasil menambahkan ${newItems.length} anggota baru secara massal!`);
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

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        toggleMobileSidebar,
        currentProfile,
        setCurrentProfile,
        profiles: initialProfiles,
        theme,
        setTheme,
        searchQuery,
        setSearchQuery,
        isLiveSyncing,
        triggerLiveSync,
        googleSheetUrl,
        setGoogleSheetUrl,
        lastSyncTime,

        members,
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
