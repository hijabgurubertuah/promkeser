import React, { useState } from 'react';
import { X, Target, PlusCircle, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ActivityStatus, ActivityRABItem } from '../../types';

export const AddActivityModal: React.FC = () => {
  const { isAddActivityModalOpen, closeAddActivityModal, addActivity } = useApp();

  const [namaKegiatan, setNamaKegiatan] = useState('');
  const [tanggalKegiatan, setTanggalKegiatan] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [penanggungJawab, setPenanggungJawab] = useState('');
  const [wilayah, setWilayah] = useState('Kabupaten Malang');
  const [status, setStatus] = useState<ActivityStatus>('direncanakan');

  const [items, setItems] = useState<ActivityRABItem[]>([
    {
      id: 'item-1',
      namaItem: 'Konsumsi & Snack Rapat',
      volume: '30 Porsi',
      hargaSatuan: 25000,
      totalAnggaran: 750000,
      totalRealisasi: 0,
    },
    {
      id: 'item-2',
      namaItem: 'Spanduk & Materi KIE Germas',
      volume: '1 Paket',
      hargaSatuan: 500000,
      totalAnggaran: 500000,
      totalRealisasi: 0,
    },
  ]);

  if (!isAddActivityModalOpen) return null;

  const totalRAB = items.reduce((sum, it) => sum + it.totalAnggaran, 0);

  const addItem = () => {
    setItems([
      ...items,
      {
        id: `item-${Date.now()}`,
        namaItem: '',
        volume: '1 Paket',
        hargaSatuan: 0,
        totalAnggaran: 0,
        totalRealisasi: 0,
      },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(items.filter((it) => it.id !== id));
  };

  const updateItem = (id: string, field: keyof ActivityRABItem, value: any) => {
    setItems(
      items.map((it) => {
        if (it.id !== id) return it;
        const updated = { ...it, [field]: value };
        if (field === 'hargaSatuan') {
          updated.totalAnggaran = Number(value);
        }
        return updated;
      })
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaKegiatan || totalRAB <= 0) {
      alert('Mohon masukkan nama kegiatan dan item anggaran yang valid.');
      return;
    }

    addActivity({
      namaKegiatan,
      tanggalKegiatan: tanggalKegiatan || 'Bulan Depan 2026',
      lokasi: lokasi || 'Puskesmas se-Kabupaten Malang',
      penanggungJawab: penanggungJawab || 'Pengurus Paguyuban Promkeser',
      status,
      wilayah,
      totalRAB,
      totalRealisasi: 0,
      statusLPJ: 'belum_ada',
      items,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-red-600" />
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Ajukan Usul Kegiatan & Rencana Anggaran Biaya (RAB)
              </h3>
              <p className="text-[11px] text-slate-500">Program Kerja Fungsional Promkeser Kabupaten Malang</p>
            </div>
          </div>
          <button
            onClick={closeAddActivityModal}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Nama Kegiatan / Program Kerja <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={namaKegiatan}
              onChange={(e) => setNamaKegiatan(e.target.value)}
              placeholder="Contoh: Workshop Komunikasi Efektif Antar Pribadi Fungsional"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Waktu Pelaksanaan
              </label>
              <input
                type="text"
                value={tanggalKegiatan}
                onChange={(e) => setTanggalKegiatan(e.target.value)}
                placeholder="Contoh: 15 Nov 2026"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Wilayah Sasaran
              </label>
              <select
                value={wilayah}
                onChange={(e) => setWilayah(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
              >
                <option value="Kabupaten Malang (Semua)">Kabupaten Malang (Semua Wilayah)</option>
                <option value="Kab. Malang Barat">Kab. Malang Barat</option>
                <option value="Kab. Malang Utara">Kab. Malang Utara</option>
                <option value="Kab. Malang Timur">Kab. Malang Timur</option>
                <option value="Kab. Malang Selatan">Kab. Malang Selatan</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Lokasi Kegiatan
              </label>
              <input
                type="text"
                value={lokasi}
                onChange={(e) => setLokasi(e.target.value)}
                placeholder="Contoh: Aula Pertemuan PKM Pakisaji"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Penanggung Jawab
              </label>
              <input
                type="text"
                value={penanggungJawab}
                onChange={(e) => setPenanggungJawab(e.target.value)}
                placeholder="Contoh: Siti Rahmawati, S.KM"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Rincian Item Anggaran (RAB) */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Rincian Item Anggaran RAB
              </label>
              <button
                type="button"
                onClick={addItem}
                className="text-xs text-orange-600 dark:text-orange-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Tambah Item</span>
              </button>
            </div>

            <div className="space-y-2">
              {items.map((it, idx) => (
                <div key={it.id} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 w-4">{idx + 1}.</span>
                  <input
                    type="text"
                    placeholder="Nama item anggaran..."
                    value={it.namaItem}
                    onChange={(e) => updateItem(it.id, 'namaItem', e.target.value)}
                    className="flex-1 px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded"
                  />
                  <input
                    type="text"
                    placeholder="Volume"
                    value={it.volume}
                    onChange={(e) => updateItem(it.id, 'volume', e.target.value)}
                    className="w-20 px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded"
                  />
                  <input
                    type="number"
                    placeholder="Total Rp"
                    value={it.totalAnggaran || ''}
                    onChange={(e) => updateItem(it.id, 'hargaSatuan', Number(e.target.value))}
                    className="w-28 px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded font-mono font-semibold"
                  />
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(it.id)}
                      className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Total RAB Indicator */}
            <div className="flex items-center justify-between p-3 mt-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl">
              <span className="text-xs font-bold text-red-900 dark:text-red-200">TOTAL USULAN RAB:</span>
              <span className="text-base font-extrabold text-red-600 dark:text-red-400 font-mono">
                Rp {totalRAB.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={closeAddActivityModal}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Daftarkan Usulan RAB</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
