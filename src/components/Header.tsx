import React, { useState } from 'react';
import {
  Search,
  Bell,
  Calendar,
  ChevronDown,
  ShieldCheck,
  Building2,
  Users,
  CreditCard,
  Wallet,
  Target,
  FileText,
  Landmark,
  Settings,
  Sun,
  Moon,
  CheckCircle2,
} from 'lucide-react';
import { useApp, NavigationTab } from '../context/AppContext';

export const Header: React.FC = () => {
  const {
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
    openReceiptModal,
  } = useApp();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const pendingCount = verificationRequests.filter((v) => v.status === 'pending').length;

  const navItems: { id: NavigationTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'beranda', label: 'Beranda', icon: <Building2 className="w-4 h-4" /> },
    { id: 'tentang', label: 'Tentang Paguyuban', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'anggota', label: 'Data Anggota', icon: <Users className="w-4 h-4" /> },
    { id: 'iuran', label: 'Iuran Anggota', icon: <CreditCard className="w-4 h-4" />, badge: pendingCount },
    { id: 'keuangan', label: 'Buku Kas & Mutasi', icon: <Wallet className="w-4 h-4" /> },
    { id: 'kegiatan', label: 'Kegiatan & RAB', icon: <Target className="w-4 h-4" /> },
    { id: 'dokumen', label: 'Dokumen & Transparansi', icon: <FileText className="w-4 h-4" /> },
    { id: 'pusaka', label: 'Pusaka Paguyuban', icon: <Landmark className="w-4 h-4" /> },
    { id: 'pengaturan', label: 'Pengaturan', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors w-full">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-2 sm:gap-4">
          {/* Brand Logo */}
          <div
            className="flex items-center gap-2 sm:gap-3 cursor-pointer min-w-0"
            onClick={() => setActiveTab('beranda')}
          >
            {/* 5-Pillar Stylized Emblem */}
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-red-600 via-orange-500 to-amber-500 p-0.5 shadow-md flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[8px] sm:rounded-[10px] flex items-center justify-center p-1 sm:p-1.5">
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

            <div className="min-w-0">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white truncate">
                  PROMKESER
                </span>
                <span className="bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded border border-orange-200 dark:border-orange-800 shrink-0">
                  SIPAG
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight mt-0.5 truncate max-w-[135px] xs:max-w-[200px] sm:max-w-none">
                <span className="sm:hidden">Kab. Malang • Promkes</span>
                <span className="hidden sm:inline">Kabupaten Malang • Tenaga Promosi Kesehatan</span>
              </p>
            </div>
          </div>

          {/* Center: Search & T.A. Badge (Desktop) */}
          <div className="hidden md:flex items-center gap-3 flex-1 max-w-xl">
            {/* T.A. Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>T.A. 2026</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">Aktif</span>
            </div>

            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari anggota, iuran, RAB, mutasi..."
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right Controls: Theme, Notifications & User Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Theme Toggle Button */}
            <button
              id="header-theme-toggle"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-1.5 sm:p-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-amber-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors relative"
              aria-label={theme === 'light' ? 'Beralih ke Mode Gelap (Dark Mode)' : 'Beralih ke Mode Terang (Light Mode)'}
              title={theme === 'light' ? 'Beralih ke Dark Mode' : 'Beralih ke Light Mode'}
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-slate-600 hover:text-slate-900 transition-transform hover:-rotate-12" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400 hover:text-amber-300 transition-transform hover:rotate-45" />
              )}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-1.5 sm:p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                title="Pemberitahuan Sistem"
              >
                <Bell className="w-4 h-4" />
                {pendingCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-red-600 text-white text-[9px] sm:text-[10px] font-extrabold w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 animate-pulse">
                    {pendingCount}
                  </span>
                )}
              </button>

              {/* Notification Popup Dropdown */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-1.5rem)] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-2 z-50 animate-fade-in">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Pemberitahuan Sistem</span>
                    <span className="text-[10px] bg-red-50 text-red-700 px-2 py-0.5 rounded-full font-semibold">
                      {pendingCount} Perlu Verifikasi
                    </span>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
                    {verificationRequests
                      .filter((v) => v.status === 'pending')
                      .map((item) => (
                        <div
                          key={item.id}
                          className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition cursor-pointer text-xs"
                          onClick={() => {
                            setIsNotifOpen(false);
                            setActiveTab('iuran');
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-900 dark:text-white">{item.memberName}</span>
                            <span className="text-[10px] text-amber-600 font-bold">Rp {item.nominal.toLocaleString('id-ID')}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{item.puskesmas} • {item.periodeLabel}</p>
                          <div className="mt-1.5 flex items-center justify-between">
                            <span className="text-[10px] text-slate-400">{item.tanggalUpload}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsNotifOpen(false);
                                openReceiptModal({
                                  title: `Bukti Setor - ${item.memberName}`,
                                  file: item.fileBukti,
                                  type: item.fileType,
                                  nominal: item.nominal,
                                  member: `${item.memberName}, ${item.gelar}`,
                                  puskesmas: item.puskesmas,
                                  uraian: item.periodeLabel,
                                });
                              }}
                              className="text-[10px] text-orange-600 font-bold hover:underline"
                            >
                              Lihat Struk
                            </button>
                          </div>
                        </div>
                      ))}
                    {pendingCount === 0 && (
                      <div className="p-4 text-center text-xs text-slate-400">
                        Tidak ada antrean verifikasi saat ini.
                      </div>
                    )}
                  </div>
                  <div className="p-2 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-center">
                    <button
                      onClick={() => {
                        setIsNotifOpen(false);
                        setActiveTab('iuran');
                      }}
                      className="text-xs font-semibold text-orange-600 hover:text-orange-700"
                    >
                      Buka Antrean Verifikasi Iuran &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Pill & Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 sm:pl-2 sm:pr-2.5 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer bg-white dark:bg-slate-850 shadow-2xs"
                title={`Profil: ${currentProfile.name} (${currentProfile.role})`}
                aria-label="Menu Profil dan Hak Akses"
              >
                <img
                  src={currentProfile.avatarUrl}
                  alt={currentProfile.name}
                  className="w-7 h-7 sm:w-7 sm:h-7 rounded-full object-cover ring-2 ring-orange-500 shrink-0"
                />
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {currentProfile.name}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                    {currentProfile.title}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              {/* Role Switcher Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-1.5rem)] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-2 z-50 animate-fade-in">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700">
                    <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                      Simulasi Pengguna & RBAC
                    </p>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 font-medium">
                      Pilih peran untuk menguji hak akses:
                    </p>
                  </div>

                  <div className="py-1">
                    {profiles.map((profile) => {
                      const isSelected = profile.id === currentProfile.id;
                      return (
                        <button
                          key={profile.id}
                          onClick={() => {
                            setCurrentProfile(profile);
                            setIsProfileMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2.5 text-left text-xs transition cursor-pointer ${
                            isSelected
                              ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 font-bold'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <img
                              src={profile.avatarUrl}
                              alt={profile.name}
                              className="w-7 h-7 rounded-full object-cover shrink-0"
                            />
                            <div>
                              <div className="font-semibold">{profile.name}</div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                {profile.role.toUpperCase()} • {profile.title}
                              </div>
                            </div>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="p-2 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
                    <p className="text-[10px] text-slate-500 text-center">
                      Fungsi hak akses (RBAC) diterapkan secara ketat sesuai PRD Final.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Second Row: Navigation Tabs (Desktop) */}
      <div className="hidden md:block bg-white dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-1 py-1.5 overflow-x-auto no-scrollbar">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    isActive
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-white text-red-600' : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
