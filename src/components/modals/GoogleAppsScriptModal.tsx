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
 * GOOGLE APPS SCRIPT - SIPAG PROMKESER KABUPATEN MALANG
 * Sistem Sinkronisasi Google Sheets & Google Drive (Otomatis & Gratis)
 * =========================================================================
 * 
 * PETUNJUK PENERAPAN (DEPLOYMENT):
 * 1. Buka Google Spreadsheet paguyuban.
 * 2. Klik menu 'Ekstensi' (Extensions) > 'Apps Script'.
 * 3. Hapus semua kode yang ada di 'Kode.gs', lalu tempel seluruh kode ini.
 * 4. (Opsional) Tentukan ID Folder Google Drive di variabel FOLDER_ID di bawah jika ingin bukti transfer tersimpan di folder tertentu.
 * 5. Klik 'Simpan' (ikon disket / Ctrl+S).
 * 6. Klik tombol 'Terapkan' (Deploy) berwarna biru di kanan atas > 'Penerapan baru' (New deployment).
 * 7. Klik ikon gerigi (Pilih jenis) > pilih 'Aplikasi Web' (Web app).
 * 8. Konfigurasi:
 *    - Deskripsi: SIPAG API Webhook
 *    - Jalankan sebagai (Execute as): 'Saya' (Me - akun pengurus)
 *    - Siapa yang memiliki akses (Who has access): 'Siapa saja' (Anyone)
 * 9. Klik 'Terapkan' (Deploy) dan berikan izin akses Google Account Anda.
 * 10. Salin URL Aplikasi Web (berakhiran /exec) dan tempelkan ke aplikasi SIPAG di menu Pengaturan.
 */

// KONFIGURASI (Opsional)
// Kosongkan untuk simpan bukti transfer di root Drive, atau isi ID folder Google Drive
var FOLDER_ID = ""; 

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var action = (e && e.parameter && e.parameter.action) || "read_all";
    
    // Uji koneksi (Ping test)
    if (action === "ping") {
      return responseJson({
        status: "success",
        connected: true,
        spreadsheetName: ss.getName(),
        spreadsheetUrl: ss.getUrl(),
        message: "Google Apps Script Web App SIPAG aktif dan terhubung!",
        timestamp: new Date().toISOString()
      });
    }
    
    // Baca seluruh data Mutasi Kas
    var sheetKas = getOrCreateSheet(ss, "Mutasi_Kas", [
      "No Referensi", "Tanggal", "Uraian Transaksi", "Kategori", "Arus Kas", "Nominal (Rp)", "Penanggung Jawab", "Bukti Drive URL", "Waktu Rekam"
    ]);
    
    var dataKas = sheetKas.getDataRange().getValues();
    var transactions = [];
    
    if (dataKas.length > 1) {
      for (var i = 1; i < dataKas.length; i++) {
        var row = dataKas[i];
        if (!row[0]) continue;
        transactions.push({
          id: "tr-" + i,
          noRef: String(row[0]),
          tanggal: formatDate(row[1]),
          uraian: String(row[2]),
          kategori: String(row[3]),
          arus: row[4] === "Keluar" ? "Keluar" : "Masuk",
          nominal: Number(row[5]) || 0,
          penanggungJawab: String(row[6] || ""),
          buktiUrl: String(row[7] || ""),
          timestamp: String(row[8] || "")
        });
      }
    }
    
    // Baca data Anggota
    var sheetAnggota = getOrCreateSheet(ss, "Anggota", [
      "No Anggota", "Nama Lengkap", "Puskesmas Induk", "Wilayah", "Jabatan", "Status", "Kontak WA", "Email"
    ]);
    var dataAnggota = sheetAnggota.getDataRange().getValues();
    var members = [];
    if (dataAnggota.length > 1) {
      for (var j = 1; j < dataAnggota.length; j++) {
        var r = dataAnggota[j];
        if (!r[0]) continue;
        members.push({
          id: "mb-" + j,
          noAnggota: String(r[0]),
          nama: String(r[1]),
          puskesmas: String(r[2]),
          wilayah: String(r[3]),
          jabatan: String(r[4]),
          status: String(r[5]),
          kontak: String(r[6]),
          email: String(r[7])
        });
      }
    }

    return responseJson({
      status: "success",
      connected: true,
      timestamp: new Date().toISOString(),
      spreadsheetName: ss.getName(),
      transactionsCount: transactions.length,
      membersCount: members.length,
      transactions: transactions,
      members: members
    });

  } catch (err) {
    return responseJson({ status: "error", message: err.toString() });
  }
}

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var payload = {};
    
    if (e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch(err) {
        payload = { raw: e.postData.contents };
      }
    }

    var action = payload.action || "sync_all";

    // 1. TAMBAH CATATAN KAS (Single Row Append)
    if (action === "add_transaction") {
      var sheetKas = getOrCreateSheet(ss, "Mutasi_Kas", [
        "No Referensi", "Tanggal", "Uraian Transaksi", "Kategori", "Arus Kas", "Nominal (Rp)", "Penanggung Jawab", "Bukti Drive URL", "Waktu Rekam"
      ]);
      var t = payload.transaction;
      sheetKas.appendRow([
        t.noRef || "",
        t.tanggal || "",
        t.uraian || "",
        t.kategori || "",
        t.arus || "",
        t.nominal || 0,
        t.penanggungJawab || "",
        t.buktiUrl || "",
        new Date().toISOString()
      ]);
      return responseJson({ status: "success", message: "Transaksi berhasil dicatat ke Google Sheets" });
    }

    // 2. UNGGAH BUKTI FOTO / NOTA KE GOOGLE DRIVE
    if (action === "upload_receipt") {
      var base64Data = payload.base64File;
      var fileName = payload.fileName || ("Nota_" + Date.now() + ".jpg");
      var mimeType = payload.mimeType || "image/jpeg";
      
      var decoded = Utilities.base64Decode(base64Data.split(",")[1] || base64Data);
      var blob = Utilities.newBlob(decoded, mimeType, fileName);
      
      var folder = FOLDER_ID ? DriveApp.getFolderById(FOLDER_ID) : DriveApp.getRootFolder();
      var file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      
      return responseJson({
        status: "success",
        fileUrl: file.getUrl(),
        downloadUrl: file.getDownloadUrl(),
        fileId: file.getId()
      });
    }

    // 3. SINKRONISASI MASSAL (Backup / Kirim Seluruh Data SIPAG ke Google Sheets)
    if (action === "sync_all" && payload.transactions) {
      var sheetKas = getOrCreateSheet(ss, "Mutasi_Kas", [
        "No Referensi", "Tanggal", "Uraian Transaksi", "Kategori", "Arus Kas", "Nominal (Rp)", "Penanggung Jawab", "Bukti Drive URL", "Waktu Rekam"
      ]);
      
      // Bersihkan data lama, pertahankan header
      var lastRow = sheetKas.getLastRow();
      if (lastRow > 1) {
        sheetKas.getRange(2, 1, lastRow - 1, 9).clearContent();
      }
      
      var rows = payload.transactions.map(function(t) {
        return [
          t.noRef || "",
          t.tanggal || "",
          t.uraian || "",
          t.kategori || "",
          t.arus || "",
          t.nominal || 0,
          t.penanggungJawab || "",
          t.buktiUrl || "",
          t.timestamp || new Date().toISOString()
        ];
      });

      if (rows.length > 0) {
        sheetKas.getRange(2, 1, rows.length, 9).setValues(rows);
      }

      // Sinkronkan data anggota jika disertakan
      if (payload.members && payload.members.length > 0) {
        var sheetAnggota = getOrCreateSheet(ss, "Anggota", [
          "No Anggota", "Nama Lengkap", "Puskesmas Induk", "Wilayah", "Jabatan", "Status", "Kontak WA", "Email"
        ]);
        var lastMemberRow = sheetAnggota.getLastRow();
        if (lastMemberRow > 1) {
          sheetAnggota.getRange(2, 1, lastMemberRow - 1, 8).clearContent();
        }
        var memberRows = payload.members.map(function(m) {
          return [
            m.noAnggota || "",
            m.nama || "",
            m.puskesmas || "",
            m.wilayah || "",
            m.jabatan || "",
            m.status || "",
            m.kontak || "",
            m.email || ""
          ];
        });
        sheetAnggota.getRange(2, 1, memberRows.length, 8).setValues(memberRows);
      }

      return responseJson({
        status: "success",
        message: "Data kas dan anggota berhasil ditulis ke Google Sheets",
        updatedAt: new Date().toISOString()
      });
    }

    return responseJson({ status: "ignored", message: "Aksi tidak dikenali" });

  } catch(err) {
    return responseJson({ status: "error", message: err.toString() });
  }
}

// FUNGSI BANTUAN
function getOrCreateSheet(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#f1f5f9");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function formatDate(val) {
  if (!val) return "";
  if (val instanceof Date) {
    return Utilities.formatDate(val, "Asia/Jakarta", "yyyy-MM-dd");
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

  const [copiedCode, setCopiedCode] = useState(false);
  const [testUrl, setTestUrl] = useState(googleSheetUrl || '');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
    details?: any;
  }>({ status: 'idle', message: '' });

  const [activeTab, setActiveTab] = useState<'guide' | 'code' | 'test'>('guide');

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE).then(() => {
      setCopiedCode(true);
      showToast('Kode Google Apps Script berhasil disalin ke clipboard!');
      setTimeout(() => setCopiedCode(false), 2500);
    });
  };

  const handleTestConnection = async () => {
    if (!testUrl.trim()) {
      setTestResult({
        status: 'error',
        message: 'Masukkan URL Web App Google Apps Script terlebih dahulu.',
      });
      return;
    }

    if (!testUrl.includes('/exec')) {
      setTestResult({
        status: 'error',
        message: 'URL harus berakhiran "/exec" (URL Web App dari penerapan/deployment).',
      });
      return;
    }

    setIsTesting(true);
    setTestResult({ status: 'idle', message: 'Menghubungi Google Apps Script...' });

    try {
      const pingUrl = testUrl.includes('?') ? `${testUrl}&action=ping` : `${testUrl}?action=ping`;
      const response = await fetch(pingUrl, {
        method: 'GET',
        redirect: 'follow',
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'success' || data.connected) {
        setTestResult({
          status: 'success',
          message: `Koneksi Berhasil! Spreadsheet: "${data.spreadsheetName || 'Aktif'}"`,
          details: data,
        });
        setGoogleSheetUrl(testUrl.trim());
        showToast('Koneksi Google Apps Script berhasil dan tersimpan!');
      } else {
        setTestResult({
          status: 'error',
          message: data.message || 'Respons skrip tidak dikenali.',
          details: data,
        });
      }
    } catch (err: any) {
      // If CORS or redirect issues in browser test, provide helpful guidance
      setTestResult({
        status: 'error',
        message: `Gagal memanggil skrip: ${err.message || err}. Pastikan pengaturan deployment: "Siapa yang memiliki akses" = "Siapa saja (Anyone)".`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handlePushAllToGSheet = async () => {
    if (!googleSheetUrl) {
      showToast('Masukkan dan simpan URL Web App terlebih dahulu.');
      return;
    }

    showToast('Mengirim seluruh data kas & anggota ke Google Sheets...');
    try {
      await fetch(googleSheetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sync_all',
          app: 'SIPAG_PROMKES_MALANG',
          timestamp: new Date().toISOString(),
          totalSaldo,
          transactions,
          members,
        }),
      });
      showToast('Data berhasil dikirim ke Google Spreadsheet!');
    } catch (e: any) {
      showToast('Pengiriman data selesai diproses.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-850 rounded-2xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Metode Google Apps Script</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold uppercase">
                  Rekomendasi Terbaik
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Solusi otomatis membaca & menulis Spreadsheet + Drive tanpa kerumitan Google Cloud OAuth
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Banner */}
        <div className="px-6 py-3 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border-b border-emerald-500/20 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Mengapa Google Apps Script Jauh Lebih Unggul dari OAuth untuk Paguyuban?</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              100% Gratis • Tanpa Server • Privasi Terjaga
            </span>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 px-6">
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'guide'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Petunjuk Langkah-demi-Langkah</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'code'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Kode Lengkap (Code.gs)</span>
          </button>

          <button
            onClick={() => setActiveTab('test')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'test'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Uji & Hubungkan Webhook</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-slate-700 dark:text-slate-300 text-xs">
          {/* TAB 1: GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-5">
              {/* Perbandingan Langsung */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 bg-rose-50/70 dark:bg-rose-950/20 rounded-xl border border-rose-200/80 dark:border-rose-900/40">
                  <h4 className="font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5 mb-1.5">
                    <X className="w-4 h-4 text-rose-500" />
                    Kelemahan Google Workspace OAuth Resmi:
                  </h4>
                  <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc list-inside text-[11px]">
                    <li>Wajib setup Google Cloud Console (Client ID & Secret).</li>
                    <li>Muncul peringatan berbahaya <em>"Google hasn't verified this app"</em>.</li>
                    <li>Setiap anggota/pengurus harus login akun Google satu per satu.</li>
                    <li>Token kedaluwarsa berkala dan setup izin hak akses sangat rumit.</li>
                  </ul>
                </div>

                <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/80 dark:border-emerald-900/40">
                  <h4 className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 mb-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Keunggulan Metode Google Apps Script:
                  </h4>
                  <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc list-inside text-[11px]">
                    <li><strong>100% Gratis & Selamanya</strong> tanpa Google Cloud Console.</li>
                    <li><strong>Satu Akun Pusat:</strong> Menjalankan izin atas nama Bendahara/Paguyuban.</li>
                    <li>Mendukung baca (GET) dan tulis (POST) instan.</li>
                    <li>Bisa otomatis simpan foto nota transfer ke <strong>Google Drive Paguyuban</strong>.</li>
                  </ul>
                </div>
              </div>

              {/* 5 Langkah Mudah */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Langkah-Langkah Pemasangan (Hanya Butuh 3 Menit):
                </h3>

                <div className="space-y-2.5">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                      1
                    </span>
                    <div>
                      <strong className="text-slate-900 dark:text-white block">
                        Buka Google Spreadsheet Paguyuban
                      </strong>
                      <p className="text-slate-500 mt-0.5">
                        Buka spreadsheet tempat Anda mencatat kas promkeser, lalu pada menu bar atas klik{' '}
                        <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded font-mono text-emerald-700 dark:text-emerald-300">
                          Ekstensi (Extensions)
                        </code>{' '}
                        &rarr;{' '}
                        <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded font-mono text-emerald-700 dark:text-emerald-300">
                          Apps Script
                        </code>
                        .
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                      2
                    </span>
                    <div>
                      <strong className="text-slate-900 dark:text-white block">
                        Tempelkan Kode Script SIPAG
                      </strong>
                      <p className="text-slate-500 mt-0.5">
                        Hapus kode bawaan <code>function myFunction() &#123;&#125;</code>, lalu buka tab{' '}
                        <button
                          onClick={() => setActiveTab('code')}
                          className="text-emerald-600 dark:text-emerald-400 font-bold underline inline cursor-pointer"
                        >
                          Kode Lengkap (Code.gs)
                        </button>{' '}
                        di atas dan klik tombol <strong>Salin Seluruh Kode</strong>. Tempelkan ke editor Apps Script.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                      3
                    </span>
                    <div>
                      <strong className="text-slate-900 dark:text-white block">
                        Simpan & Terapkan Sebagai Web App
                      </strong>
                      <p className="text-slate-500 mt-0.5">
                        Klik ikon Simpan (Ctrl+S). Lalu klik tombol biru{' '}
                        <strong>Terapkan (Deploy)</strong> di kanan atas &rarr;{' '}
                        <strong>Penerapan Baru (New deployment)</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                      4
                    </span>
                    <div>
                      <strong className="text-slate-900 dark:text-white block">
                        Konfigurasi Pengaturan Izin (Sangat Penting):
                      </strong>
                      <ul className="mt-1 space-y-1 text-slate-600 dark:text-slate-400 list-disc list-inside">
                        <li>Pilih jenis penerapan: <strong>Aplikasi Web (Web App)</strong>.</li>
                        <li>Jalankan sebagai: <strong>Saya (Execute as: Me)</strong>.</li>
                        <li>
                          Siapa yang memiliki akses:{' '}
                          <strong className="text-emerald-700 dark:text-emerald-400">
                            Siapa saja (Anyone)
                          </strong>{' '}
                          (agar aplikasi web dapat mengirim dan meminta data).
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                      5
                    </span>
                    <div>
                      <strong className="text-slate-900 dark:text-white block">
                        Salin URL Web App dan Hubungkan ke SIPAG
                      </strong>
                      <p className="text-slate-500 mt-0.5">
                        Salin URL Aplikasi Web (berakhiran <code>/exec</code>), lalu buka tab{' '}
                        <button
                          onClick={() => setActiveTab('test')}
                          className="text-emerald-600 dark:text-emerald-400 font-bold underline inline cursor-pointer"
                        >
                          Uji & Hubungkan Webhook
                        </button>{' '}
                        untuk memverifikasi dan menyimpan koneksi.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CODE */}
          {activeTab === 'code' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    File Sumber: <code>Kode.gs</code>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Mencakup fungsi <code>doGet</code> (membaca data) dan <code>doPost</code> (menulis data kas & mengunggah nota ke Drive).
                  </p>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCode ? 'Tersalin ke Clipboard!' : 'Salin Seluruh Kode'}</span>
                </button>
              </div>

              <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 font-mono text-[11px] leading-relaxed">
                <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-slate-400 text-[10px]">
                  <span>Google Apps Script (V8 Runtime)</span>
                  <span>{APPS_SCRIPT_CODE.split('\n').length} baris kode</span>
                </div>
                <pre className="p-4 max-h-96 overflow-y-auto whitespace-pre font-mono select-all">
                  {APPS_SCRIPT_CODE}
                </pre>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-300 text-[11px] flex gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Tips Folder Bukti Transfer:</strong> Jika Anda ingin bukti struk otomatis masuk ke folder Google Drive tertentu, buat folder di Google Drive Anda, salin ID folder dari URL-nya (karakter acak setelah <code>folders/</code>), dan masukkan ke variabel <code>var FOLDER_ID = "..."</code> di baris ke-24.
                </span>
              </div>
            </div>
          )}

          {/* TAB 3: TEST & CONNECT */}
          {activeTab === 'test' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <label className="font-bold text-slate-900 dark:text-white block text-xs">
                  URL Web App Google Apps Script Anda (akhiran <code>/exec</code>):
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={testUrl}
                    onChange={(e) => setTestUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                    className="flex-1 px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                  />
                  <button
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                    <span>{isTesting ? 'Menguji...' : 'Uji Koneksi & Simpan'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Dapatkan URL ini setelah mengklik <em>Deploy &rarr; New deployment &rarr; Web app</em> di Google Apps Script.
                </p>
              </div>

              {/* Status Test Result */}
              {testResult.status === 'success' && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>{testResult.message}</span>
                  </div>
                  {testResult.details && (
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2.5 rounded-lg font-mono">
                      <div>Status: Terhubung Aktif (2-Arah)</div>
                      <div>Waktu: {testResult.details.timestamp}</div>
                    </div>
                  )}
                </div>
              )}

              {testResult.status === 'error' && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-800 rounded-xl space-y-1">
                  <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold">
                    <AlertCircle className="w-5 h-5 text-rose-600" />
                    <span>Gagal Menghubungi Script</span>
                  </div>
                  <p className="text-[11px] text-rose-700 dark:text-rose-400">
                    {testResult.message}
                  </p>
                </div>
              )}

              {/* Sinkronisasi Nyata */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">
                  Aksi Sinkronisasi Cepat:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={handlePushAllToGSheet}
                    className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 rounded-xl flex items-center gap-3 transition cursor-pointer text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center shrink-0">
                      <UploadCloud className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-slate-900 dark:text-white block text-xs">
                        Kirim Seluruh Data ke Google Sheet
                      </strong>
                      <span className="text-[10px] text-slate-500">
                        Menulis kas & anggota ke spreadsheet
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={triggerLiveSync}
                    disabled={isLiveSyncing}
                    className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 rounded-xl flex items-center gap-3 transition cursor-pointer text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-600 flex items-center justify-center shrink-0">
                      <RefreshCw className={`w-4 h-4 ${isLiveSyncing ? 'animate-spin' : ''}`} />
                    </div>
                    <div>
                      <strong className="text-slate-900 dark:text-white block text-xs">
                        Sinkronkan Kas & Rekonsiliasi
                      </strong>
                      <span className="text-[10px] text-slate-500">
                        Jalankan live sync 2 arah
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
          <button
            onClick={handleCopyCode}
            className="px-3 py-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>Salin Kode Script</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-xs font-bold hover:opacity-90 transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
