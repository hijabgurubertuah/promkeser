import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  Lock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Users,
  Sparkles,
  HelpCircle,
  KeyRound,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MasterPengguna } from '../../types';

export const LoginView: React.FC = () => {
  const { masterUsers, loginWithGoogle, theme, setTheme } = useApp();

  const [inputEmail, setInputEmail] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showAccountChooser, setShowAccountChooser] = useState(false);

  const handleGoogleSignIn = (targetEmail?: string) => {
    const emailToUse = targetEmail || inputEmail.trim();

    if (!emailToUse) {
      setShowAccountChooser(true);
      return;
    }

    setIsAuthenticating(true);
    setLoginError(null);

    setTimeout(() => {
      const result = loginWithGoogle(emailToUse);
      setIsAuthenticating(false);

      if (!result.success) {
        setLoginError(result.message || 'Akun Google Anda belum terdaftar dalam sistem MASTER_PENGGUNA.');
      }
    }, 600);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-gradient-to-br from-slate-50 via-orange-50/30 to-amber-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 transition-colors selection:bg-orange-500 selection:text-white">
      {/* Top Bar Minimalis */}
      <div className="max-w-5xl w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-orange-500 p-0.5 shadow-xs flex items-center justify-center">
            <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[6px] flex items-center justify-center p-1">
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
          <span className="text-xs font-black tracking-wider text-slate-800 dark:text-slate-200 uppercase">
            SIPAG KAB. MALANG
          </span>
        </div>

        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs cursor-pointer transition"
        >
          {theme === 'light' ? '🌙 Mode Gelap' : '☀️ Mode Terang'}
        </button>
      </div>

      {/* Main Login Card Center */}
      <div className="max-w-md w-full mx-auto my-auto py-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 space-y-6 relative overflow-hidden backdrop-blur-md">
          {/* Subtle Top Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1.5 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 rounded-full" />

          {/* Logo & Header Title */}
          <div className="text-center space-y-3 pt-2">
            {/* 5-Pillar Stylized Emblem */}
            <div className="w-16 h-16 sm:w-18 sm:h-18 mx-auto rounded-2xl bg-gradient-to-br from-red-600 via-orange-500 to-amber-500 p-1 shadow-lg flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[12px] flex items-center justify-center p-2">
                <svg viewBox="0 0 24 24" className="w-full h-full fill-none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="5" r="3" className="fill-red-600" />
                  <circle cx="18.5" cy="10" r="3" className="fill-orange-500" />
                  <circle cx="16" cy="18" r="3" className="fill-amber-500" />
                  <circle cx="8" cy="18" r="3" className="fill-emerald-600" />
                  <circle cx="5.5" cy="10" r="3" className="fill-red-500" />
                  <path d="M12 5L18.5 10L16 18L8 18L5.5 10Z" stroke="#F97316" strokeWidth="1.4" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-extrabold tracking-widest text-orange-600 dark:text-orange-400 uppercase">
                SISTEM INFORMASI TERPADU
              </span>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                PAGUYUBAN PROMKESER<br />KABUPATEN MALANG
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                Rumah Digital Pengelolaan Anggota, Iuran Kas, Kegiatan, RAB & Transparansi Organisasi
              </p>
            </div>
          </div>

          {/* Slogan Banner */}
          <div className="p-3 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl text-center space-y-0.5">
            <p className="text-[11px] font-bold text-orange-900 dark:text-orange-300 italic">
              "TERHUBUNG DALAM DATA, TRANSPARAN DALAM TATA KELOLA, BERSAMA DALAM PAGUYUBAN."
            </p>
            <p className="text-[9px] text-slate-400">Sederhana di tampilan, kuat di belakang.</p>
          </div>

          {/* Primary Action: Masuk Dengan Google */}
          <div className="space-y-3">
            <button
              id="btn-login-google"
              type="button"
              disabled={isAuthenticating}
              onClick={() => handleGoogleSignIn()}
              className="w-full py-3.5 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 border-2 border-slate-200 dark:border-slate-700 hover:border-orange-500 dark:hover:border-orange-500 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {/* Official Google 'G' Vector Icon */}
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isAuthenticating ? 'Menghubungkan Akun Google...' : 'MASUK DENGAN GOOGLE'}</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
            </button>

            {/* Error Notification */}
            {loginError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-start gap-2.5 animate-shake">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <div>
                  <span className="font-bold block">Akses Ditolak</span>
                  <span className="text-[11px] leading-tight block mt-0.5">{loginError}</span>
                  <p className="text-[10px] text-red-500 dark:text-red-400 mt-1">
                    Silakan hubungi <strong>Administrator Master (Yustin)</strong> untuk mendaftarkan email Google Anda ke MASTER_PENGGUNA.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Account Chooser / Simulation Box */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-orange-600" />
                <span>Pilih Akun Google Terdaftar (RBAC)</span>
              </span>
              <button
                type="button"
                onClick={() => setShowAccountChooser(!showAccountChooser)}
                className="text-[11px] text-orange-600 hover:text-orange-700 font-semibold cursor-pointer"
              >
                {showAccountChooser ? 'Tutup Pilihan' : 'Lihat Akun'}
              </button>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
              Sistem akan otomatis membaca email Google, mencocokkan dengan <strong>MASTER_PENGGUNA</strong>, membaca Role & Status Akun, lalu membatasi menu sesuai kewenangan.
            </p>

            {showAccountChooser ? (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {masterUsers.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleGoogleSignIn(user.email)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/80 hover:bg-orange-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 hover:border-orange-300 rounded-xl text-left text-xs transition cursor-pointer flex items-center justify-between gap-2.5 group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={user.avatarUrl}
                        alt={user.nama}
                        className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-slate-300"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                          <span>{user.nama}</span>
                          <span
                            className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase ${
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
                            {user.role === 'admin_master' ? 'Admin Master' : user.role.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-600 shrink-0" />
                  </button>
                ))}

                {/* Custom Google Email Input */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Atau Masukkan Email Google Lain:
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="email"
                      value={inputEmail}
                      onChange={(e) => setInputEmail(e.target.value)}
                      placeholder="contoh: anggota@gmail.com"
                      className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleGoogleSignIn()}
                      className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-lg cursor-pointer transition"
                    >
                      Login
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">Yustin, S.KM</span>
                  <span className="text-[10px] text-red-600 font-bold block">Admin Master & Bendahara</span>
                </div>
                <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">Arik Agung, S.KM</span>
                  <span className="text-[10px] text-amber-600 font-bold block">Ketua Paguyuban</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Credentials Info */}
      <div className="max-w-xl w-full mx-auto text-center space-y-1 text-[11px] text-slate-400 dark:text-slate-500 py-2">
        <p>
          Paguyuban Tenaga Promosi Kesehatan dan Ilmu Perilaku (Promkeser) Kabupaten Malang
        </p>
        <p className="text-[10px]">
          Ketua: <strong>Arik Agung</strong> • Bendahara: <strong>Yustin</strong> • Rekening Kas: <strong>Bank Jatim 0602305341</strong>
        </p>
      </div>
    </div>
  );
};
