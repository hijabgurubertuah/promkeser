export type UserRole = 'bendahara' | 'admin' | 'pengurus' | 'anggota';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  puskesmas?: string;
  avatarUrl?: string;
}

export type MemberStatus = 'aktif' | 'baru' | 'tidak_aktif' | 'pindah_satker';

export interface Member {
  id: string;
  noAnggota: string;
  nama: string;
  gelar?: string;
  puskesmas: string;
  wilayah: 'Malang Utara' | 'Malang Selatan' | 'Malang Barat' | 'Malang Timur' | 'Sekretariat DKK';
  jabatanSatker: string;
  status: MemberStatus;
  tahunBergabung: number;
  kontak: string;
  email: string;
  keteranganStatus?: string;
}

export type DuesStatus = 'lunas' | 'menunggu_verifikasi' | 'tertunggak';

export interface DuesPeriod {
  id: string;
  memberId: string;
  tahun: number;
  periode: 'Triwulan I' | 'Triwulan II' | 'Triwulan III' | 'Triwulan IV' | 'Tahunan';
  nominal: number;
  status: DuesStatus;
  tanggalBayar?: string;
  buktiRef?: string;
  verifiedBy?: string;
}

export interface VerificationRequest {
  id: string;
  memberId: string;
  memberName: string;
  gelar: string;
  puskesmas: string;
  periodeLabel: string;
  nominal: number;
  tanggalUpload: string;
  fileBukti: string;
  fileType: 'image' | 'pdf';
  catatanAnggota?: string;
  status: 'pending' | 'disetujui' | 'ditolak';
  kategoriIuran: 'reguler_2026' | 'pelunasan_2025' | 'early_bird_2026';
}

export type TransactionType = 'pemasukan' | 'pengeluaran';

export interface CashTransaction {
  id: string;
  noRef: string;
  tanggal: string;
  jenis: TransactionType;
  kategori: string;
  uraian: string;
  puskesmasAtauSatker: string;
  nominal: number;
  statusAudit: 'tervalidasi' | 'menunggu_persetujuan' | 'draft';
  buktiFile?: string;
  buktiNama?: string;
  kegiatanId?: string;
  dibuatOleh: string;
}

export type ActivityStatus = 'direncanakan' | 'berjalan' | 'selesai';

export interface ActivityRABItem {
  id: string;
  namaItem: string;
  volume: string;
  hargaSatuan: number;
  totalAnggaran: number;
  totalRealisasi: number;
}

export interface ActivityRAB {
  id: string;
  namaKegiatan: string;
  tanggalKegiatan: string;
  lokasi: string;
  penanggungJawab: string;
  status: ActivityStatus;
  wilayah: string;
  totalRAB: number;
  totalRealisasi: number;
  efisiensi: number; // sisa kas positif atau negatif
  statusLPJ: 'belum_ada' | 'dalam_penyusunan' | 'disahkan';
  lpjDocRef?: string;
  items: ActivityRABItem[];
}

export interface OrgDocument {
  id: string;
  judul: string;
  nomorSurat?: string;
  kategori: 'LPJ' | 'Laporan Keuangan' | 'Rekap Iuran' | 'AD/ART' | 'SK' | 'Notulen';
  tanggal: string;
  tahun: number;
  fileUrl: string;
  ukuranFile: string;
  statusPublikasi: 'publik' | 'internal';
  diunggahOleh: string;
  kegiatanId?: string;
}

export type Activity = ActivityRAB;
export type DocumentItem = OrgDocument;

export interface HeritageItem {
  id: string;
  judul: string;
  tahun: number;
  era: string;
  deskripsi: string;
  tokohKunci: string;
  fotoUrl: string;
  kategoriArsip: 'Perintisan' | 'Musda' | 'Aksi Germas' | 'Advokasi' | 'Penghargaan';
}

export interface AuditLogItem {
  id: string;
  waktu: string;
  pengguna: string;
  role: string;
  aksi: string;
  entitas: string;
  detail: string;
}
