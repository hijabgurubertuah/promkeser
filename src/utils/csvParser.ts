import { Member, CashTransaction } from '../types';

function parseCSVString(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentCell += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentCell.trim());
      if (currentRow.some((cell) => cell !== '')) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = '';
    } else {
      currentCell += char;
    }
  }
  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((cell) => cell !== '')) {
      rows.push(currentRow);
    }
  }
  return rows;
}

function normalizeDate(d: string): string {
  if (!d) return '';
  // Convert standard YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(d)) {
    try {
      const date = new Date(d);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
      }
    } catch (e) {
      // fallback
    }
  }
  return d;
}

export async function parsePromkeserCSV(file: File): Promise<{ newMembers: Member[]; newTransactions: CashTransaction[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const rows = parseCSVString(text);

        const newMembers: Member[] = [];
        const newTransactions: CashTransaction[] = [];

        for (const row of rows) {
          if (!row || row.length < 2) continue;

          const sheet = row[0] || '';

          // 1. MASTER ANGGOTA
          if (sheet.toUpperCase() === 'DAFTAR ANGGOTA') {
            const noStr = row[2];
            const pkm = row[3];
            const nama = row[5];
            const no = parseInt(noStr, 10);

            if (!isNaN(no) && pkm && nama && nama.toUpperCase() !== 'NAMA') {
              newMembers.push({
                id: `MBR-CSV-${no}`,
                noAnggota: `PKM-MLG-${no.toString().padStart(3, '0')}`,
                nama: nama,
                puskesmas: pkm,
                wilayah: 'TBD',
                status: 'aktif',
                jabatanSatker: 'Pelaksana Promkes',
                tahunBergabung: 2023,
                kontak: '',
                email: '',
              } as Member);
            }
          }

          // 2. PENGELUARAN
          if (sheet.toUpperCase().includes('PENGELUARAN')) {
            const noStr = row[2];
            const uraian = row[3];
            const tempat = row[4];
            const tanggal = row[5];
            const jumlahStr = row[9];

            const no = parseInt(noStr, 10);
            const jumlah = parseInt(jumlahStr, 10);

            if (!isNaN(no) && uraian && tanggal && !isNaN(jumlah) && jumlah > 0) {
              newTransactions.push({
                id: `trx-csv-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
                noRef: `KAS-CSV-${no}`,
                tanggal: normalizeDate(tanggal),
                uraian: uraian,
                jenis: 'pengeluaran',
                nominal: jumlah,
                kategori: 'Operasional',
                puskesmasAtauSatker: tempat || 'Paguyuban',
                statusAudit: 'tervalidasi',
                dibuatOleh: 'CSV Import',
              } as CashTransaction);
            }
          }

          // 3. PEMASUKAN / IURAN
          const isTrue = (val: string) => val.toUpperCase() === 'TRUE';
          if (isTrue(row[5]) || isTrue(row[6]) || isTrue(row[7])) {
            let jumlah = 0;
            let tanggal = '';
            let uraian = '';

            // Individual tabs like "1. Retno", "2.Akhlis"
            if (isTrue(row[7])) {
              jumlah = parseInt(row[3] || '0', 10);
              tanggal = row[5];
              const namaAnggota = sheet.replace(/^\d+\.\s*/, '').trim() || sheet;
              uraian = `Iuran ${namaAnggota} - ${row[4] || ''}`;
            } 
            // Rekap tabs like "! REKAP PEMASUKAN 2023 & 2024"
            else if (isTrue(row[5])) {
              jumlah = parseInt(row[6] || '0', 10);
              tanggal = row[4];
              uraian = `Iuran ${row[3] || ''}`;
            }

            if (!isNaN(jumlah) && jumlah > 0 && tanggal && tanggal.length > 4) {
              newTransactions.push({
                id: `trx-csv-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
                noRef: `IUR-CSV-${Math.floor(Math.random() * 1000)}`,
                tanggal: normalizeDate(tanggal),
                uraian: uraian.trim(),
                jenis: 'pemasukan',
                nominal: jumlah,
                kategori: 'Iuran Rutin',
                puskesmasAtauSatker: 'Anggota',
                statusAudit: 'tervalidasi',
                dibuatOleh: 'CSV Import',
              } as CashTransaction);
            }
          }
        }

        resolve({ newMembers, newTransactions });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Gagal membaca file CSV.'));
    };

    reader.readAsText(file);
  });
}
