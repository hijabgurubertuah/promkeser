import React, { useEffect } from 'react';
import {
  X,
  Menu,
  Building2,
  ShieldCheck,
  Users,
  CreditCard,
  Wallet,
  Target,
  FileText,
  Landmark,
  Settings,
  Sun,
  Moon,
  RefreshCw,
  Search,
  Calendar,
  UserCheck,
} from 'lucide-react';
import { useApp, NavigationTab } from '../context/AppContext';

export const MobileSidebar: React.FC = () => {
  const {
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    toggleMobileSidebar,
    activeTab,
    setActiveTab,
    currentProfile,
    setCurrentProfile,
    profiles,
    theme,
    setTheme,
    searchQuery,
    setSearchQuery,
    verificationRequests,
    isLiveSyncing,
    triggerLiveSync,
  } = useApp();

  const pendingCount = verificationRequests.filter((v) => v.status === 'pending').length;

  const navItems: { id: NavigationTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'beranda', label: 'Beranda Utama', icon: <Building2 className="w-4 h-4" /> },
    { id: 'tentang', label: 'Tentang Paguyuban', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'anggota', label: 'Master Data Anggota', icon: <Users className="w-4 h-4" /> },
    {
      id: 'iuran',
      label: 'Iuran & Verifikasi Kas',
      icon: <CreditCard className="w-4 h-4" />,
      badge: pendingCount,
    },
    { id: 'keuangan', label: 'Buku Kas & Mutasi', icon: <Wallet className="w-4 h-4" /> },
    { id: 'kegiatan', label: 'RAB & Kegiatan Organisasi', icon: <Target className="w-4 h-4" /> },
    { id: 'dokumen', label: 'Arsip & Transparansi', icon: <FileText className="w-4 h-4" /> },
    { id: 'pusaka', label: 'Pusaka Paguyuban', icon: <Landmark className="w-4 h-4" /> },
    { id: 'pengaturan', label: 'Pengaturan & RBAC', icon: <Settings className="w-4 h-4" /> },
  ];

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileSidebarOpen) {
      const scrollY = window.scrollY;
      const originalPosition = document.body.style.position;
      const originalTop = document.body.style.top;
      const originalWidth = document.body.style.width;
      const originalOverflow = document.body.style.overflow;
      const originalTouchAction = document.body.style.touchAction;

      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsMobileSidebarOpen(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.position = originalPosition;
        document.body.style.top = originalTop;
        document.body.style.width = originalWidth;
        document.body.style.overflow = originalOverflow;
        document.body.style.touchAction = originalTouchAction;
        window.scrollTo(0, scrollY);
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isMobileSidebarOpen, setIsMobileSidebarOpen]);

  return (
    <>
      {/* 
        TRIGGER BUTTON ON MOBILE:
        Fixed at middle-left of the phone screen.
        Cukup hamburger di tengah dan garis tegak atas dan bawah. Yang lain hapus.
      */}
      {!isMobileSidebarOpen && (
        <button
          id="mobile-sidebar-toggle-btn"
          onClick={toggleMobileSidebar}
          aria-label="Buka Menu Navigasi SIPAG"
          title="Buka Menu Navigasi"
          className="fixed left-0 top-1/2 -translate-y-1/2 z-40 md:hidden w-[22px] h-[84px] bg-gradient-to-b from-red-600 via-orange-500 to-amber-500 text-white rounded-r-xl shadow-lg shadow-orange-600/30 flex flex-col items-center justify-between py-2.5 border-y border-r border-orange-300/40 hover:brightness-110 active:scale-95 transition-all duration-200 cursor-pointer select-none group"
        >
          {/* Garis tegak atas */}
          <span className="w-0.5 flex-1 bg-white/75 rounded-full" />

          {/* Hamburger di tengah */}
          <Menu className="w-3.5 h-3.5 text-white my-1 shrink-0 group-hover:scale-110 transition-transform" />

          {/* Garis tegak bawah */}
          <span className="w-0.5 flex-1 bg-white/75 rounded-full" />
        </button>
      )}

      {/* Backdrop: automatically closes sidebar when clicked outside */}
      {isMobileSidebarOpen && (
        <div
          id="mobile-sidebar-backdrop"
          onClick={() => setIsMobileSidebarOpen(false)}
          onTouchMove={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs z-50 md:hidden transition-opacity duration-300 animate-fade-in"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Drawer Container */}
      <aside
        id="mobile-sidebar-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Menu Navigasi Mobile"
        onTouchMove={(e) => e.stopPropagation()}
        className={`fixed top-0 bottom-0 left-0 z-50 w-[82vw] max-w-[310px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col md:hidden transition-transform duration-300 ease-out overscroll-contain ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-red-50/50 via-white to-orange-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-850 shrink-0">
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => {
              setActiveTab('beranda');
              setIsMobileSidebarOpen(false);
            }}
          >
            {/* Logo Emblem */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 via-orange-500 to-amber-500 p-0.5 shadow-md flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[10px] flex items-center justify-center p-1">
                <svg viewBox="0 0 24 24" className="w-full h-full fill-none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="5" r="3" className="fill-red-600" />
                  <circle cx="18.5" cy="10" r="3" className="fill-orange-500" />
                  <circle cx="16" cy="18" r="3" className="fill-amber-500" />
                  <circle cx="8" cy="18" r="3" className="fill-emerald-600" />
                  <circle cx="5.5" cy="10" r="3" className="fill-red-500" />
                  <path d="M12 5L18.5 10L16 18L8 18L5.5 10Z" stroke="#F97316" strokeWidth="1.2" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">
                  PROMKESER
                </span>
                <span className="bg-orange-100 dark:bg-orange-950/80 text-orange-700 dark:text-orange-400 text-[9px] font-bold px-1.5 py-0.2 rounded border border-orange-200 dark:border-orange-800">
                  SIPAG
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-none mt-0.5">
                Kabupaten Malang
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body: Navigation & Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-3.5 space-y-4">
          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari menu, anggota, iuran..."
              className="w-full pl-8.5 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* User Profile Mini Card */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src={currentProfile.avatarUrl}
                alt={currentProfile.name}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-orange-500 shrink-0"
              />
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {currentProfile.name}
                </div>
                <div className="text-[10px] text-orange-600 dark:text-orange-400 font-bold uppercase mt-0.5">
                  {currentProfile.role} • {currentProfile.title}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Items List */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-2 block mb-1.5">
              Menu Navigasi
            </span>

            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-white text-red-600'
                          : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick RBAC Role Switcher */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-2 block">
              Ganti Peran Pengguna (RBAC)
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {profiles.map((p) => {
                const isSelected = p.id === currentProfile.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setCurrentProfile(p);
                    }}
                    className={`p-2 rounded-lg text-left text-[11px] font-semibold border transition cursor-pointer flex flex-col ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-bold truncate">{p.name.split(' ')[0]}</span>
                    <span className="text-[9px] uppercase text-slate-400">{p.role}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Utilities (Theme & Live Sync) */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900 shrink-0 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium text-[11px]">Tema Tampilan:</span>
            <div className="flex items-center bg-white dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs">
              <button
                id="mobile-theme-light-btn"
                onClick={() => setTheme('light')}
                aria-label="Mode Terang"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition ${
                  theme === 'light'
                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <Sun className="w-3 h-3 text-amber-500" />
                <span>Terang</span>
              </button>
              <button
                id="mobile-theme-dark-btn"
                onClick={() => setTheme('dark')}
                aria-label="Mode Gelap"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition ${
                  theme === 'dark'
                    ? 'bg-slate-700 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <Moon className="w-3 h-3 text-indigo-300" />
                <span>Gelap</span>
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              triggerLiveSync();
            }}
            disabled={isLiveSyncing}
            className="w-full py-2 px-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLiveSyncing ? 'animate-spin' : ''}`} />
            <span>{isLiveSyncing ? 'Menyinkronkan...' : 'Sinkronkan Google Sheets'}</span>
          </button>

          <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 pt-1">
            <span>T.A. 2026 • Dinkes Malang</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Online</span>
          </div>
        </div>
      </aside>
    </>
  );
};
