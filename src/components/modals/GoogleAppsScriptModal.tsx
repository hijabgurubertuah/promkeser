import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  Check,
  Copy,
  ExternalLink,
  Code2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  FolderOpen,
  ArrowRight,
  ShieldCheck,
  Download,
  UploadCloud,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface GoogleAppsScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const APPS_SCRIPT_CODE = `/**
 * =========================================================================
 * GOOGLE APPS SCRIPT - SIPAG PROMKESER KABUPATEN MALANG (MULTI-SPREADSHEET)
 * Menghubungkan 3 File Spreadsheet:
 * 1. Master Anggota & Iuran (MASTER_ANGGOTA & IURAN_ANGGOTA 2023-2026)
 * 2. Buku Kas & Keuangan (BUKU_KAS / MUTASI_KAS)
 * 3. RAB & LPJ Kegiatan (RAB_KEGIATAN / PROGRAM_KERJA)
 * =========================================================================
 * 
 * PETUNJUK PENERAPAN:
 * 1. Buat satu Google Spreadsheet utama (atau buka salah satu spreadsheet paguyuban).
 * 2. Klik menu 'Ekstensi' (Extensions) > 'Apps Script'.
 * 3. Hapus semua isi 'Kode.gs', lalu tempel seluruh script ini.
 * 4. (Opsional) Jika Anda memisahkan 3 spreadsheet menjadi file terpisah,
 *    cukup isikan Spreadsheet ID masing-masing pada variabel CONFIG_SPREADSHEETS di bawah.
 * 5. Klik 'Simpan' (Ctrl+S).
 * 6. Klik 'Terapkan' (Deploy) di pojok kanan atas > 'Penerapan baru' (New deployment).
 * 7. Pilih jenis: 'Aplikasi Web' (Web app).
 *    - Jalankan sebagai (Execute as): 'Saya' (Me - Akun Google Pengurus)
 *    - Siapa yang memiliki akses (Who has access): 'Siapa saja' (Anyone)
 * 8. Klik 'Terapkan' & berikan otorisasi izin akses.
 * 9. Salin URL Aplikasi Web (berakhiran /exec) dan tempel ke SIPAG di menu Pengaturan.
 */

// KONFIGURASI ID SPREADSHEET (Kosongkan jika semua tab berada dalam 1 Spreadsheet yang sama)
var CONFIG_SPREADSHEETS = {
  // Jika dalam 1 file spreadsheet yang sama, biarkan kosong ""
  // Jika beda file, isikan ID file spreadsheet masing-masing (contoh: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms")
  SHEET_ANGGOTA_ID: "", 
  SHEET_KAS_ID: "", 
  SHEET_RAB_ID: "",
  DRIVE_FOLDER_BUKTI_ID: "" // ID Folder Google Drive untuk menyimpan nota/bukti transfer
};

function getTargetSpreadsheet(type) {
  var active = SpreadsheetApp.getActiveSpreadsheet();
  var targetId = "";
  if (type === "anggota") targetId = CONFIG_SPREADSHEETS.SHEET_ANGGOTA_ID;
  else if (type === "kas") targetId = CONFIG_SPREADSHEETS.SHEET_KAS_ID;
  else if (type === "rab") targetId = CONFIG_SPREADSHEETS.SHEET_RAB_ID;

  if (targetId && targetId.trim() !== "") {
    try {
      return SpreadsheetApp.openById(targetId.trim());
    } catch(e) {
      return active;
    }
  }
  return active;
}

function doGet(e) {
  try {
    var ssAnggota = getTargetSpreadsheet("anggota");
    var ssKas = getTargetSpreadsheet("kas");
    var ssRab = getTargetSpreadsheet("rab");
    var action = (e && e.parameter && e.parameter.action) || "read_all";
    
    // Ping test
    if (action === "ping") {
      return responseJson({
        status: "success",
        connected: true,
        spreadsheetName: ssKas.getName(),
        message: "Endpoint Web App SIPAG aktif dan siap menyinkronkan data!",
        timestamp: new Date().toISOString()
      });
    }

    // 1. BACA MASTER ANGGOTA
    var sheetAnggota = ssAnggota.getSheetByName("MASTER_ANGGOTA") || ssAnggota.getSheetByName("Anggota") || ssAnggota.getSheets()[0];
    var dataAnggota = sheetAnggota.getDataRange().getValues();
    var members = [];
    if (dataAnggota.length > 1) {
      for (var i = 1; i < dataAnggota.length; i++) {
        var r = dataAnggota[i];
        if (!r[0] && !r[1] && !r[2]) continue;
        members.push({
          id: "MBR-" + String(i).padStart(3, "0"),
          noAnggota: String(r[1] || ("PKM-MLG-" + String(i).padStart(3, "0"))),
          nama: String(r[2] || r[1] || ""),
          gelar: String(r[3] || "S.KM"),
          puskesmas: String(r[4] || r[2] || "Puskesmas"),
          wilayah: String(r[5] || "Malang"),
          jabatanSatker: String(r[6] || "Pelaksana Promkes"),
          status: String(r[7] || "aktif").toLowerCase().includes("non") ? "tidak_aktif" : (String(r[7]).toLowerCase().includes("pindah") ? "pindah_satker" : "aktif"),
          kontak: String(r[8] || ""),
          email: String(r[9] || ""),
          tahunBergabung: Number(r[10]) || 2023,
          keteranganStatus: String(r[11] || "Tercatat di Master Anggota")
        });
      }
    }

    // 2. BACA BUKU KAS
    var sheetKas = ssKas.getSheetByName("BUKU_KAS") || ssKas.getSheetByName("Mutasi_Kas") || ssKas.getSheetByName("Kas");
    var transactions = [];
    if (sheetKas) {
      var dataKas = sheetKas.getDataRange().getValues();
      if (dataKas.length > 1) {
        for (var k = 1; k < dataKas.length; k++) {
          var row = dataKas[k];
          if (!row[0] && !row[1] && !row[2]) continue;
          var debet = Number(row[4]) || 0;
          var kredit = Number(row[5]) || 0;
          var nominal = debet > 0 ? debet : kredit;
          var jenis = debet > 0 ? "pemasukan" : "pengeluaran";

          transactions.push({
            id: "trx-" + k,
            noRef: String(row[0] || ("KAS-" + k)),
            tanggal: formatDate(row[1]),
            uraian: String(row[2] || ""),
            kategori: String(row[3] || (jenis === "pemasukan" ? "Iuran Rutin" : "Operasional")),
            jenis: jenis,
            nominal: nominal,
            puskesmasAtauSatker: String(row[6] || "Paguyuban Promkeser"),
            statusAudit: "tervalidasi",
            dibuatOleh: String(row[7] || "Bendahara (Yustin)")
          });
        }
      }
    }

    // 3. BACA RAB KEGIATAN
    var sheetRab = ssRab.getSheetByName("RAB_KEGIATAN") || ssRab.getSheetByName("Kegiatan");
    var activities = [];
    if (sheetRab) {
      var dataRab = sheetRab.getDataRange().getValues();
      if (dataRab.length > 1) {
        for (var a = 1; a < dataRab.length; a++) {
          var rabRow = dataRab[a];
          if (!rabRow[0] && !rabRow[1]) continue;
          activities.push({
            id: "act-" + a,
            namaKegiatan: String(rabRow[1] || rabRow[0]),
            tanggalKegiatan: formatDate(rabRow[2]),
            lokasi: String(rabRow[3] || "Kabupaten Malang"),
            penanggungJawab: String(rabRow[4] || "Pengurus Paguyuban"),
            totalRAB: Number(rabRow[5]) || 0,
            totalRealisasi: Number(rabRow[6]) || 0,
            status: String(rabRow[7] || "selesai"),
            statusLPJ: "disahkan"
          });
        }
      }
    }

    return responseJson({
      status: "success",
      connected: true,
      timestamp: new Date().toISOString(),
      membersCount: members.length,
      transactionsCount: transactions.length,
      activitiesCount: activities.length,
      members: members,
      transactions: transactions,
      activities: activities
    });

  } catch (err) {
    return responseJson({ status: "error", message: err.toString() });
  }
}

function doPost(e) {
  try {
    var payload = {};
    if (e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch(err) {
        payload = { raw: e.postData.contents };
      }
    }

    var action = payload.action || "sync_all";
    var ssKas = getTargetSpreadsheet("kas");

    // Catat mutasi kas baru dari aplikasi SIPAG
    if (action === "add_transaction" && payload.transaction) {
      var sheetKas = ssKas.getSheetByName("BUKU_KAS") || ssKas.getSheetByName("Mutasi_Kas") || ssKas.getSheets()[0];
      var t = payload.transaction;
      sheetKas.appendRow([
        t.noRef || "",
        t.tanggal || "",
        t.uraian || "",
        t.kategori || "",
        t.jenis === "pemasukan" ? t.nominal : 0,
        t.jenis === "pengeluaran" ? t.nominal : 0,
        t.puskesmasAtauSatker || "",
        t.dibuatOleh || "Bendahara",
        new Date().toISOString()
      ]);
      return responseJson({ status: "success", message: "Transaksi berhasil dicatat ke Spreadsheet BUKU KAS" });
    }

    return responseJson({ status: "success", message: "Webhook diterima oleh Google Apps Script SIPAG" });
  } catch(err) {
    return responseJson({ status: "error", message: err.toString() });
  }
}

function formatDate(val) {
  if (!val) return "";
  if (val instanceof Date) {
    return Utilities.formatDate(val, "Asia/Jakarta", "dd MMM yyyy");
  }
  return String(val);
}

function responseJson(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;

export const GoogleAppsScriptModal: React.FC<GoogleAppsScriptModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    googleSheetUrl,
    setGoogleSheetUrl,
    showToast,
    triggerLiveSync,
    isLiveSyncing,
    transactions,
    members,
    totalSaldo,
  } = useApp();

  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'script' | 'guide' | 'test'>('script');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [testResult, setTestResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCopied(true);
    showToast('Kode Google Apps Script berhasil disalin ke clipboard!');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([APPS_SCRIPT_CODE], { type: 'text/javascript' });
    element.href = URL.createObjectURL(file);
    element.download = 'SIPAG_GoogleAppsScript_Sync.gs';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showToast('File SIPAG_GoogleAppsScript_Sync.gs berhasil diunduh!');
  };

  const handleTestConnection = async () => {
    if (!googleSheetUrl || !googleSheetUrl.startsWith('http')) {
      showToast('Masukkan URL Web App Google Apps Script yang valid terlebih dahulu.');
      return;
    }

    setTestStatus('testing');
    try {
      const pingUrl = `${googleSheetUrl}${googleSheetUrl.includes('?') ? '&' : '?'}action=ping`;
      const res = await fetch(pingUrl);
      const data = await res.json();
      setTestResult(data);
      setTestStatus('success');
      showToast('Koneksi ke Google Sheets Web App Berhasil!');
    } catch (e: any) {
      setTestStatus('failed');
      setTestResult({ error: e.message || 'Gagal menghubungi endpoint. Pastikan Web App diset "Who has access: Anyone".' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-850 rounded-2xl max-w-3xl w-full border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
        {/* Header Modal */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Integrasi Google Apps Script (Multi-Spreadsheet)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hubungkan 3 File Spreadsheet (Master Anggota, Iuran, Buku Kas & RAB) secara otomatis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-5 pt-3 bg-slate-50/50 dark:bg-slate-850">
          <button
            onClick={() => setActiveTab('script')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'script'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Kode Script Terpusat (Kode.gs)</span>
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'guide'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Panduan Pasang 3 Menit</span>
          </button>
          <button
            onClick={() => setActiveTab('test')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'test'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Uji Endpoint & Webhook</span>
          </button>
        </div>

        {/* Tab 1: Script Code */}
        {activeTab === 'script' && (
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Skrip ini cukup dipasang di <strong>1 tempat saja</strong> untuk mengakses 3 spreadsheet sekaligus.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh .gs</span>
                </button>
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition shadow-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Tersalin!' : 'Salin Semua Kode'}</span>
                </button>
              </div>
            </div>

            <div className="relative">
              <pre className="bg-slate-900 text-slate-200 text-[11px] font-mono p-4 rounded-xl max-h-96 overflow-y-auto leading-relaxed border border-slate-800 select-all">
                {APPS_SCRIPT_CODE}
              </pre>
            </div>
          </div>
        )}

        {/* Tab 2: Panduan Pasang */}
        {activeTab === 'guide' && (
          <div className="p-5 space-y-4 max-h-[460px] overflow-y-auto">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 rounded-xl">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Buka Google Sheets & Apps Script</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Buka Google Spreadsheet paguyuban Anda di browser. Klik menu <strong>Ekstensi (Extensions)</strong> &gt; <strong>Apps Script</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 rounded-xl">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Tempel Kode & Konfigurasi ID</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Hapus kode bawaan di tab <code>Kode.gs</code>, lalu tempelkan kode dari tab sebelah. Jika Anda memiliki 3 file spreadsheet terpisah, cukup isikan ID file pada bagian <code>CONFIG_SPREADSHEETS</code>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 rounded-xl">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Terapkan Sebagai Web App</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Klik tombol biru <strong>Terapkan (Deploy)</strong> di pojok kanan atas &gt; <strong>Penerapan baru (New deployment)</strong>. Pilih jenis <strong>Aplikasi Web</strong>.
                  </p>
                  <ul className="text-[11px] text-slate-600 dark:text-slate-300 mt-1.5 space-y-1 list-disc list-inside">
                    <li>Jalankan sebagai: <strong>Saya (Me / Akun Google Pengurus)</strong></li>
                    <li>Siapa yang memiliki akses: <strong>Siapa saja (Anyone)</strong></li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 rounded-xl">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  4
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Salin URL & Masukkan ke SIPAG</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Salin URL Aplikasi Web yang berakhiran <code>/exec</code>, lalu tempelkan ke kolom URL di menu <strong>Pengaturan SIPAG</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Uji Endpoint */}
        {activeTab === 'test' && (
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                URL Google Apps Script Web App (/exec)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={googleSheetUrl}
                  onChange={(e) => setGoogleSheetUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                />
                <button
                  onClick={handleTestConnection}
                  disabled={testStatus === 'testing'}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition shadow-xs cursor-pointer shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testStatus === 'testing' ? 'animate-spin' : ''}`} />
                  <span>{testStatus === 'testing' ? 'Menguji...' : 'Uji Koneksi'}</span>
                </button>
              </div>
            </div>

            {testStatus === 'success' && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Endpoint Aktif & Terhubung Sempurna!</span>
                </div>
                <pre className="text-[10px] font-mono bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-emerald-100 dark:border-emerald-900 text-slate-700 dark:text-slate-300 overflow-x-auto">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </div>
            )}

            {testStatus === 'failed' && (
              <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold text-xs">
                  <AlertCircle className="w-4 h-4" />
                  <span>Gagal Menghubungi Web App</span>
                </div>
                <p className="text-xs text-red-600 dark:text-red-300">
                  {testResult?.error || 'Pastikan Web App disetel ke "Anyone" saat deployment di Google Apps Script.'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Data akan otomatis diselaraskan setiap kali ada transaksi baru atau tombol sinkronisasi ditekan.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-white text-xs font-bold rounded-lg cursor-pointer transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
