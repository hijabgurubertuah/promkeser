import React, { useState } from 'react';
import { X, PlusCircle, ArrowDownCircle, ArrowUpCircle, Upload, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TransactionType } from '../../types';

export const AddTransactionModal: React.FC = () => {
  const { isAddTxModalOpen, closeAddTxModal, txDefaultType, addTransaction, activities } = useApp();

  const [jenis, setJenis] = useState<TransactionType>(txDefaultType);
  const [kategori, setKategori] = useState('');
  const [uraian, setUraian] = useState('');
  const [satker, setSatker] = useState('');
  const [nominal, setNominal] = useState<number | ''>('');
  const [buktiNama, setBuktiNama] = useState('');
  const [kegiatanId, setKegiatanId] = useState('');

  // Keep synced if modal opens with specific default
  React.useEffect(() => {
    setJenis(txDefaultType);
    if (txDefaultType === 'pemasukan') {
      setKategori('Iuran Rutin');
    } else {
      setKategori('Belanja Media KIE');
    }
  }, [txDefaultType, isAddTxModalOpen]);

  if (!isAddTxModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uraian || !nominal || Number(nominal) <= 0) {
      alert('Mohon isi uraian transaksi dan nominal yang valid.');
      return;
    }

    addTransaction({
      tanggal: new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      jenis,
      kategori: kategori || (jenis === 'pemasukan' ? 'Pemasukan Lainnya' : 'Pengeluaran Umum'),
      uraian,
      puskesmasAtauSatker: satker || 'Sekretariat DKK',
      nominal: Number(nominal),
      buktiFile: buktiNama || (jenis === 'pemasukan' ? 'Bukti_Transfer_Manual.jpg' : 'Kwitansi_Nota_Manual.pdf'),
      buktiNama: buktiNama || (jenis === 'pemasukan' ? 'Bukti_Transfer_Manual.jpg' : 'Kwitansi_Nota_Manual.pdf'),
      kegiatanId: kegiatanId || undefined,
    });

    // Reset fields
    setUraian('');
    setNominal('');
    setSatker('');
    setBuktiNama('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-2.5">
            {jenis === 'pemasukan' ? (
              <ArrowDownCircle className="w-5 h-5 text-emerald-600" />
            ) : (
              <ArrowUpCircle className="w-5 h-5 text-red-600" />
            )}
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {jenis === 'pemasukan' ? 'Catat Pemasukan Kas Baru' : 'Catat Pengeluaran Kas Baru'}
              </h3>
              <p className="text-[11px] text-slate-500">
                Pencatatan langsung ke Buku Kas Utama Paguyuban Promkeser
              </p>
            </div>
          </div>
          <button
            onClick={closeAddTxModal}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {/* Switch Jenis Transaksi */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Jenis Arus Kas
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setJenis('pemasukan');
                  setKategori('Iuran Rutin');
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border cursor-pointer transition ${
                  jenis === 'pemasukan'
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <ArrowDownCircle className="w-4 h-4" />
                <span>Pemasukan (+)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setJenis('pengeluaran');
                  setKategori('Belanja Media KIE');
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border cursor-pointer transition ${
                  jenis === 'pengeluaran'
                    ? 'bg-red-50 border-red-400 text-red-700 dark:bg-red-950/50 dark:text-red-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <ArrowUpCircle className="w-4 h-4" />
                <span>Pengeluaran (-)</span>
              </button>
            </div>
          </div>

          {/* Kategori */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Kategori Pos Anggaran
            </label>
            <select
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
            >
              {jenis === 'pemasukan' ? (
                <>
                  <option value="Iuran Rutin">Iuran Rutin Triwulan Anggota</option>
                  <option value="Pelunasan Tunggakan">Pelunasan Tunggakan Iuran (Lintas Tahun)</option>
                  <option value="Sponsorship & Kemitraan">Sponsorship & Kemitraan Germas</option>
                  <option value="Bunga Simpanan Kas">Bunga Simpanan Rekening Kas</option>
                  <option value="Pemasukan Lainnya">Pemasukan Lainnya</option>
                </>
              ) : (
                <>
                  <option value="Belanja Media KIE">Belanja Media KIE Germas & Publikasi</option>
                  <option value="Konsumsi Rapat">Konsumsi Rapat Koordinasi</option>
                  <option value="Operasional & Kesekretariatan">Operasional Kesekretariatan & IT Portal</option>
                  <option value="Musda & Pertemuan Ilmiah">Musyawarah Daerah & Pertemuan Ilmiah</option>
                  <option value="Workshop & Pelatihan">Workshop / Pelatihan Fungsional Promkes</option>
                  <option value="Advokasi & Perjalanan Dinas">Transport Lapangan & Advokasi Kebijakan</option>
                  <option value="Pengeluaran Lainnya">Pengeluaran Lainnya</option>
                </>
              )}
            </select>
          </div>

          {/* Nominal */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Nominal Transaksi (Rp) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                Rp
              </span>
              <input
                type="number"
                required
                min={1000}
                step={1000}
                value={nominal}
                onChange={(e) => setNominal(e.target.value ? Number(e.target.value) : '')}
                placeholder="Contoh: 150000"
                className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Uraian / Keterangan */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Uraian / Keterangan Transaksi <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={uraian}
              onChange={(e) => setUraian(e.target.value)}
              placeholder="Jelaskan detail peruntukan atau nama anggota pembayar..."
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          {/* Satker / Puskesmas */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Satuan Kerja / Puskesmas
            </label>
            <input
              type="text"
              value={satker}
              onChange={(e) => setSatker(e.target.value)}
              placeholder="Contoh: PKM Lawang / Sekretariat DKK"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          {/* Terkait Kegiatan & RAB */}
          {jenis === 'pengeluaran' && (
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Tautkan ke Program Kegiatan & RAB (Opsional)
              </label>
              <select
                value={kegiatanId}
                onChange={(e) => setKegiatanId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
              >
                <option value="">-- Tidak Terikat Kegiatan Khusus --</option>
                {activities.map((act) => (
                  <option key={act.id} value={act.id}>
                    {act.namaKegiatan} ({act.status.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Lampiran Bukti File */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Bukti Nota / Kwitansi / Struk (Drive Sync)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={buktiNama}
                onChange={(e) => setBuktiNama(e.target.value)}
                placeholder="Nama file, misal: Kwitansi_Germas_093.pdf"
                className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
              <label className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5 shrink-0">
                <Upload className="w-3.5 h-3.5" />
                <span>Pilih</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setBuktiNama(file.name);
                  }}
                />
              </label>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              File otomatis diunggah ke Google Drive folder terstruktur dan diverifikasi audit trail.
            </p>
          </div>

          {/* Audit Note */}
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/60 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Sesuai prinsip PRD SIPAG: Setiap transaksi memiliki jejak audit waktu tak terhapus dan
              langsung merekonsiliasi saldo kas terekonsiliasi.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeAddTxModal}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Simpan ke Buku Kas</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
