import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, Award, FileText,
  CheckCircle2, XCircle, Clock, AlertCircle, ChevronRight, ChevronDown,
  Plus, Edit2, Trash2, Search, Filter, Download, Upload, Send,
  Settings as SettingsIcon, LogOut, User, Shield, Briefcase,
  Brain, Network, MessageSquare, Database, Target, TrendingUp,
  Building2, Calendar, MapPin, DollarSign, ClipboardList, FileCheck,
  Eye, ArrowLeft, ArrowRight, Save, X, Menu, Bell, ChevronLeft,
  Sparkles, BarChart3, BookMarked, UserCog, FolderOpen, Printer,
  CheckSquare, History, Lightbulb, Zap, Layers, FileSignature
} from 'lucide-react';

// =====================================================================
// CONSTANTS & CONFIGURATION
// =====================================================================

const APP_VERSION = '2.0.0';
const APP_NAME = 'KMLS';
const APP_FULL_NAME = 'Knowledge Management & Learning System';
const ORGANIZATION = 'Badan Pengelola Keuangan Haji';

// ---- ROLES ----
const ROLES = {
  PEGAWAI: 'pegawai',
  KADIV: 'kadiv',
  DEPUTI: 'deputi',
  PELAKSANA_PSDM: 'pelaksana_psdm',
  KADIV_PSDM: 'kadiv_psdm',
  ADMIN: 'admin',
};

const ROLE_META = {
  [ROLES.PEGAWAI]:        { label: 'Pegawai',                  short: 'Pegawai',      icon: User,       color: 'bg-slate-100 text-slate-700' },
  [ROLES.KADIV]:          { label: 'Kepala Divisi',            short: 'Kadiv',        icon: Briefcase,  color: 'bg-blue-100 text-blue-700' },
  [ROLES.DEPUTI]:         { label: 'Deputi / Anggota BP',      short: 'Deputi',       icon: Shield,     color: 'bg-indigo-100 text-indigo-700' },
  [ROLES.PELAKSANA_PSDM]: { label: 'Pelaksana PSDM',           short: 'Pelaksana',    icon: ClipboardList, color: 'bg-teal-100 text-teal-700' },
  [ROLES.KADIV_PSDM]:     { label: 'Kadiv / Deputi PSDM',      short: 'Kadiv PSDM',   icon: UserCog,    color: 'bg-emerald-100 text-emerald-700' },
  [ROLES.ADMIN]:          { label: 'Admin Sistem',             short: 'Admin',        icon: SettingsIcon, color: 'bg-rose-100 text-rose-700' },
};

// ---- TRAINING CATEGORIES (sesuai 5 kategori BPKH + Membership + S2) ----
const CATEGORIES = {
  K1: { code: 'K1', label: 'Kelembagaan & Budaya Kerja', short: 'Kelembagaan',   color: 'bg-blue-50 text-blue-700 border-blue-200',       chip: 'bg-blue-600' },
  K2: { code: 'K2', label: 'Teknis Umum',                 short: 'Teknis Umum',   color: 'bg-cyan-50 text-cyan-700 border-cyan-200',       chip: 'bg-cyan-600' },
  K3: { code: 'K3', label: 'Teknis Fungsional',           short: 'Teknis Fung.',  color: 'bg-teal-50 text-teal-700 border-teal-200',       chip: 'bg-teal-600' },
  K4: { code: 'K4', label: 'Kepemimpinan Berjenjang',     short: 'Leadership',    color: 'bg-emerald-50 text-emerald-700 border-emerald-200', chip: 'bg-emerald-600' },
  K5: { code: 'K5', label: 'Learning Wallet',             short: 'Learning Wallet', color: 'bg-amber-50 text-amber-700 border-amber-200',  chip: 'bg-amber-600' },
  M1: { code: 'M1', label: 'Membership Profesi',          short: 'Membership',    color: 'bg-purple-50 text-purple-700 border-purple-200', chip: 'bg-purple-600' },
  S2: { code: 'S2', label: 'Dukungan Pendidikan Magister (S2)', short: 'S2',      color: 'bg-rose-50 text-rose-700 border-rose-200',       chip: 'bg-rose-600' },
};

const CATEGORY_RULES = {
  M1: { maxPerYear: 2, requiresTusiAlignment: true },
  S2: { requiresHighLevelApproval: true },
};

// ---- 10-STEP APPROVAL STATE MACHINE ----
const STAGES = [
  { key: 'draft',           order: 0,  label: 'Draft',                    short: 'Draft',         actor: ROLES.PEGAWAI,        icon: Edit2,        color: 'bg-slate-100 text-slate-700' },
  { key: 'submitted',       order: 1,  label: 'Diajukan ke Kadiv',        short: 'Submit',        actor: ROLES.PEGAWAI,        icon: Send,         color: 'bg-blue-100 text-blue-700' },
  { key: 'approved_kadiv',  order: 2,  label: 'Disetujui Kadiv',          short: 'Acc Kadiv',     actor: ROLES.KADIV,          icon: CheckCircle2, color: 'bg-cyan-100 text-cyan-700' },
  { key: 'approved_deputi', order: 3,  label: 'Disetujui Deputi/BP',      short: 'Acc Deputi',    actor: ROLES.DEPUTI,         icon: CheckCircle2, color: 'bg-indigo-100 text-indigo-700' },
  { key: 'analyzing_psdm',  order: 4,  label: 'Analisa Pelaksana PSDM',   short: 'Analisa',       actor: ROLES.PELAKSANA_PSDM, icon: ClipboardList,color: 'bg-teal-100 text-teal-700' },
  { key: 'approved_psdm',   order: 5,  label: 'Disetujui Kadiv/Deputi PSDM', short: 'Acc PSDM',   actor: ROLES.KADIV_PSDM,     icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-700' },
  { key: 'st_issued',       order: 6,  label: 'Surat Tugas Diterbitkan',  short: 'ST Issued',     actor: ROLES.PELAKSANA_PSDM, icon: FileSignature, color: 'bg-emerald-100 text-emerald-800' },
  { key: 'registered',      order: 7,  label: 'Terdaftar di Penyelenggara', short: 'Terdaftar',   actor: ROLES.PELAKSANA_PSDM, icon: BookMarked,   color: 'bg-amber-100 text-amber-700' },
  { key: 'in_progress',     order: 8,  label: 'Pelatihan Berlangsung',    short: 'Berlangsung',   actor: ROLES.PEGAWAI,        icon: Clock,        color: 'bg-orange-100 text-orange-700' },
  { key: 'paid',            order: 9,  label: 'Pembayaran Selesai',       short: 'Dibayar',       actor: ROLES.PELAKSANA_PSDM, icon: DollarSign,   color: 'bg-lime-100 text-lime-700' },
  { key: 'reported',        order: 10, label: 'Laporan + RTL Diserahkan', short: 'Laporan',       actor: ROLES.PEGAWAI,        icon: FileText,     color: 'bg-yellow-100 text-yellow-700' },
  { key: 'evaluated',       order: 11, label: 'Evaluasi Level 3 Selesai', short: 'Evaluasi',      actor: ROLES.KADIV,          icon: Award,        color: 'bg-fuchsia-100 text-fuchsia-700' },
  { key: 'completed',       order: 12, label: 'Closed-Loop (Sharing KM)', short: 'Closed',        actor: ROLES.PEGAWAI,        icon: CheckSquare,  color: 'bg-green-100 text-green-700' },
  { key: 'rejected',        order: -1, label: 'Ditolak',                  short: 'Ditolak',       actor: null,                 icon: XCircle,      color: 'bg-red-100 text-red-700' },
  { key: 'postponed',       order: -2, label: 'Ditunda',                  short: 'Ditunda',       actor: null,                 icon: AlertCircle,  color: 'bg-gray-100 text-gray-700' },
];

const stageByKey = (key) => STAGES.find(s => s.key === key) || STAGES[0];
const nextStageKey = (currentKey) => {
  const cur = stageByKey(currentKey);
  const next = STAGES.find(s => s.order === cur.order + 1);
  return next ? next.key : currentKey;
};

// ---- 4 KRITERIA APPROVAL (untuk Analisa PSDM) ----
const APPROVAL_CRITERIA = [
  { key: 'kompetensi',  label: 'Kesesuaian materi dengan peningkatan kompetensi pegawai' },
  { key: 'rtl',         label: 'Kejelasan rencana tindak lanjut pasca pelatihan' },
  { key: 'narasumber',  label: 'Kualitas susunan acara dan narasumber/fasilitator' },
  { key: 'biaya',       label: 'Kewajaran lokasi dan biaya pelatihan' },
];

// ---- DIVISI / UNIT KERJA ----
const DIVISIONS = [
  'Divisi Pengembangan SDM',
  'Divisi Keuangan',
  'Divisi Investasi Surat Berharga',
  'Divisi Investasi Langsung',
  'Divisi Akuntansi & Pelaporan',
  'Divisi Hukum & Kepatuhan',
  'Divisi Risiko & Audit Internal',
  'Divisi Teknologi Informasi',
  'Divisi Layanan Jemaah & Mitra',
  'Divisi Sekretariat',
];

// =====================================================================
// MOCK DATA (initial seed)
// =====================================================================

const seedEmployees = [
  { id: 'E001', nip: '199001012015011001', nama: 'Ahmad Hidayat',    jabatan: 'Anggota BP Bidang SDM',   role: ROLES.DEPUTI,          divisi: 'Sekretariat BP',              email: 'ahmad.h@bpkh.go.id',      status: 'aktif' },
  { id: 'E002', nip: '198507122012012005', nama: 'Sri Wahyuni',      jabatan: 'Kadiv Pengembangan SDM',  role: ROLES.KADIV_PSDM,      divisi: 'Divisi Pengembangan SDM',     email: 'sri.w@bpkh.go.id',        status: 'aktif' },
  { id: 'E003', nip: '198803152014031002', nama: 'Budi Santoso',     jabatan: 'Pelaksana PSDM Senior',   role: ROLES.PELAKSANA_PSDM,  divisi: 'Divisi Pengembangan SDM',     email: 'budi.s@bpkh.go.id',       status: 'aktif' },
  { id: 'E004', nip: '198209052010012003', nama: 'Dewi Lestari',     jabatan: 'Kadiv Keuangan',          role: ROLES.KADIV,           divisi: 'Divisi Keuangan',             email: 'dewi.l@bpkh.go.id',       status: 'aktif' },
  { id: 'E005', nip: '199112282016011004', nama: 'Rizky Pratama',    jabatan: 'Analis Keuangan Madya',   role: ROLES.PEGAWAI,         divisi: 'Divisi Keuangan',             email: 'rizky.p@bpkh.go.id',      status: 'aktif' },
  { id: 'E006', nip: '199406172017012006', nama: 'Anita Kusuma',     jabatan: 'Analis Investasi',        role: ROLES.PEGAWAI,         divisi: 'Divisi Investasi Surat Berharga', email: 'anita.k@bpkh.go.id',  status: 'aktif' },
  { id: 'E007', nip: '198706302013011007', nama: 'Hendra Wijaya',    jabatan: 'Kadiv Investasi',         role: ROLES.KADIV,           divisi: 'Divisi Investasi Surat Berharga', email: 'hendra.w@bpkh.go.id', status: 'aktif' },
  { id: 'E008', nip: '199309112018012008', nama: 'Putri Maharani',   jabatan: 'Auditor Internal',        role: ROLES.PEGAWAI,         divisi: 'Divisi Risiko & Audit Internal', email: 'putri.m@bpkh.go.id',   status: 'aktif' },
  { id: 'E009', nip: '198001012005011009', nama: 'MS Hadianto',      jabatan: 'Admin Sistem',            role: ROLES.ADMIN,           divisi: 'Divisi Teknologi Informasi',  email: 'admin@bpkh.go.id',         status: 'aktif' },
  { id: 'E010', nip: '199510202019012010', nama: 'Farhan Nugroho',   jabatan: 'Staf Hukum',              role: ROLES.PEGAWAI,         divisi: 'Divisi Hukum & Kepatuhan',    email: 'farhan.n@bpkh.go.id',     status: 'aktif' },
];

const seedTrainingCatalog = [
  { id: 'T001', judul: 'Audit Berbasis Risiko untuk Lembaga Keuangan',        kategori: 'K3', penyelenggara: 'IIA Indonesia',          jenis: 'eksternal', durasiHari: 3, biayaEstimasi: 7500000,  status: 'aktif' },
  { id: 'T002', judul: 'Leadership Development Program — Tier 2',             kategori: 'K4', penyelenggara: 'PPM Manajemen',          jenis: 'eksternal', durasiHari: 5, biayaEstimasi: 18000000, status: 'aktif' },
  { id: 'T003', judul: 'Budaya Kerja BPKH & Implementasi Core Values',        kategori: 'K1', penyelenggara: 'Internal BPKH',          jenis: 'inhouse',   durasiHari: 2, biayaEstimasi: 0,        status: 'aktif' },
  { id: 'T004', judul: 'Manajemen Investasi Sukuk dan Surat Berharga Syariah',kategori: 'K3', penyelenggara: 'OJK Institute',          jenis: 'eksternal', durasiHari: 4, biayaEstimasi: 12000000, status: 'aktif' },
  { id: 'T005', judul: 'Public Speaking & Komunikasi Efektif',                kategori: 'K2', penyelenggara: 'Talents Mapping',        jenis: 'eksternal', durasiHari: 2, biayaEstimasi: 4500000,  status: 'aktif' },
  { id: 'T006', judul: 'Certified Information Systems Auditor (CISA) Prep',   kategori: 'K5', penyelenggara: 'ISACA Indonesia',        jenis: 'mandiri',   durasiHari: 10, biayaEstimasi: 15000000, status: 'aktif' },
  { id: 'T007', judul: 'Knowledge Management Fundamentals',                   kategori: 'K2', penyelenggara: 'Internal BPKH',          jenis: 'inhouse',   durasiHari: 1, biayaEstimasi: 0,        status: 'aktif' },
  { id: 'T008', judul: 'PSAK Terkini & Konvergensi IFRS',                     kategori: 'K3', penyelenggara: 'IAI',                    jenis: 'eksternal', durasiHari: 3, biayaEstimasi: 8000000,  status: 'aktif' },
  // Histori (kategori dikategorikan, namun status arsip)
  { id: 'T101', judul: 'Pelatihan Excel Lanjut untuk Analis Keuangan',        kategori: 'K2', penyelenggara: 'Dunia Belajar',          jenis: 'eksternal', durasiHari: 2, biayaEstimasi: 3500000,  status: 'arsip' },
  { id: 'T102', judul: 'Risk Management Workshop 2024',                       kategori: 'K3', penyelenggara: 'Internal BPKH',          jenis: 'inhouse',   durasiHari: 2, biayaEstimasi: 0,        status: 'arsip' },
];

const seedProposals = [
  {
    id: 'P-2026-0001',
    pengajuId: 'E005',
    judul: 'Audit Berbasis Risiko untuk Lembaga Keuangan',
    kategori: 'K3',
    refTrainingId: 'T001',
    penyelenggara: 'IIA Indonesia',
    tanggalMulai: '2026-07-15',
    tanggalSelesai: '2026-07-17',
    durasiHari: 3,
    lokasi: 'Hotel Borobudur, Jakarta',
    peserta: [{ id: 'E005', nama: 'Rizky Pratama', jabatan: 'Analis Keuangan Madya' }],
    manfaatBPKH: 'Penguatan kapabilitas audit internal berbasis risiko untuk fungsi pengelolaan keuangan haji.',
    manfaatPegawai: 'Sertifikasi & peningkatan kompetensi pemeriksaan berbasis risiko.',
    rtl: [
      { kegiatan: 'Sharing knowledge ke tim Keuangan', waktu: '2 minggu pasca pelatihan', hasil: 'Tim memahami konsep RBA' },
      { kegiatan: 'Pilot project audit internal divisi', waktu: 'Q3 2026', hasil: 'Laporan pilot audit selesai' },
    ],
    biayaTuition: 7500000, biayaTiket: 0, biayaPenginapan: 0, biayaTaksi: 0, biayaUangSaku: 600000,
    totalBiaya: 8100000,
    stage: 'approved_kadiv',
    history: [
      { stage: 'draft',          by: 'E005', at: '2026-05-20 09:00', note: 'Dibuat' },
      { stage: 'submitted',      by: 'E005', at: '2026-05-20 11:30', note: 'Diajukan' },
      { stage: 'approved_kadiv', by: 'E004', at: '2026-05-21 14:15', note: 'Disetujui, lanjut ke Deputi' },
    ],
  },
  {
    id: 'P-2026-0002',
    pengajuId: 'E006',
    judul: 'Manajemen Investasi Sukuk dan Surat Berharga Syariah',
    kategori: 'K3',
    refTrainingId: 'T004',
    penyelenggara: 'OJK Institute',
    tanggalMulai: '2026-06-10',
    tanggalSelesai: '2026-06-13',
    durasiHari: 4,
    lokasi: 'OJK Institute, Bogor',
    peserta: [{ id: 'E006', nama: 'Anita Kusuma', jabatan: 'Analis Investasi' }],
    manfaatBPKH: 'Optimalisasi alokasi investasi sukuk korporasi & negara.',
    manfaatPegawai: 'Pemahaman analisis instrumen syariah jangka panjang.',
    rtl: [
      { kegiatan: 'Review portofolio sukuk eksisting', waktu: '1 bulan', hasil: 'Rekomendasi rebalancing' },
    ],
    biayaTuition: 12000000, biayaTiket: 0, biayaPenginapan: 1500000, biayaTaksi: 200000, biayaUangSaku: 800000,
    totalBiaya: 14500000,
    stage: 'analyzing_psdm',
    history: [
      { stage: 'draft',           by: 'E006', at: '2026-05-15 10:00', note: 'Dibuat' },
      { stage: 'submitted',       by: 'E006', at: '2026-05-15 13:00', note: 'Diajukan' },
      { stage: 'approved_kadiv',  by: 'E007', at: '2026-05-16 09:00', note: 'Disetujui' },
      { stage: 'approved_deputi', by: 'E001', at: '2026-05-18 11:00', note: 'Disetujui Deputi' },
    ],
  },
];

const seedReports = [];
const seedEvaluations = [];

const seedSME = [
  { id: 'SME001', employeeId: 'E003', bidang: 'Manajemen Pelatihan', level: 'Senior', sertifikasi: 'TLDP, MTT', sponsor: 'E002' },
  { id: 'SME002', employeeId: 'E007', bidang: 'Investasi Syariah',   level: 'Expert', sertifikasi: 'WPPE, CSP',  sponsor: 'E001' },
];

const seedKnowledgeAssets = [
  { id: 'KA001', judul: 'Pedoman Audit Berbasis Risiko BPKH',   tipe: 'Pedoman',     pemilik: 'Divisi RAI',         tahun: 2025 },
  { id: 'KA002', judul: 'Best Practice Pengelolaan Sukuk Haji', tipe: 'Best Practice', pemilik: 'Divisi Investasi', tahun: 2024 },
];

const seedCoP = [
  { id: 'COP001', nama: 'CoP Audit Internal',     anggota: 12, sponsor: 'E001', status: 'aktif',    engagement: 78 },
  { id: 'COP002', nama: 'CoP Investasi Syariah',  anggota: 18, sponsor: 'E001', status: 'aktif',    engagement: 85 },
  { id: 'COP003', nama: 'CoP Tata Kelola SDM',    anggota: 9,  sponsor: 'E002', status: 'revitalisasi', engagement: 45 },
];

// =====================================================================
// STORAGE HOOKS (localStorage-based)
// =====================================================================

const STORAGE_PREFIX = 'kmls_v2_';
const STORAGE_KEYS = {
  EMPLOYEES:        STORAGE_PREFIX + 'employees',
  TRAININGS:        STORAGE_PREFIX + 'trainings',
  PROPOSALS:        STORAGE_PREFIX + 'proposals',
  REPORTS:          STORAGE_PREFIX + 'reports',
  EVALUATIONS:      STORAGE_PREFIX + 'evaluations',
  SME:              STORAGE_PREFIX + 'sme',
  KNOWLEDGE_ASSETS: STORAGE_PREFIX + 'knowledge_assets',
  COP:              STORAGE_PREFIX + 'cop',
  SESSION:          STORAGE_PREFIX + 'session',
};

function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : defaultValue;
    } catch { return defaultValue; }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }, [key, value]);
  return [value, setValue];
}

// =====================================================================
// UTILITIES
// =====================================================================

const fmtIDR = (n) => 'Rp ' + (Number(n) || 0).toLocaleString('id-ID');
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
const fmtDateTime = (d) => d ? new Date(d).toLocaleString('id-ID') : '-';
const cls = (...xs) => xs.filter(Boolean).join(' ');
const uid = (prefix = 'X') => prefix + Date.now().toString(36).toUpperCase().slice(-6) + Math.random().toString(36).slice(2, 5).toUpperCase();
const newProposalId = (existing) => {
  const year = new Date().getFullYear();
  const seq = existing.filter(p => p.id.startsWith(`P-${year}-`)).length + 1;
  return `P-${year}-${String(seq).padStart(4, '0')}`;
};

// =====================================================================
// SHARED UI PRIMITIVES
// =====================================================================

function Badge({ children, className = '', as: Tag = 'span' }) {
  return <Tag className={cls('inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md border', className)}>{children}</Tag>;
}

function StageBadge({ stageKey }) {
  const s = stageByKey(stageKey);
  const Icon = s.icon;
  return (
    <Badge className={cls(s.color, 'border-current/10')}>
      <Icon className="w-3 h-3" />
      {s.short}
    </Badge>
  );
}

function CategoryBadge({ code }) {
  const c = CATEGORIES[code];
  if (!c) return null;
  return <Badge className={c.color}>{c.short}</Badge>;
}

function Card({ children, className = '', title, subtitle, action, padded = true }) {
  return (
    <div className={cls('bg-white border border-slate-200 rounded-xl shadow-sm', className)}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-slate-100">
          <div>
            {title && <h3 className="text-base font-semibold text-slate-900">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={padded ? 'p-5' : ''}>{children}</div>
    </div>
  );
}

function StatCard({ label, value, hint, icon: Icon, accent = 'emerald' }) {
  const accentMap = {
    emerald: 'from-emerald-500 to-teal-600',
    blue: 'from-blue-500 to-indigo-600',
    amber: 'from-amber-500 to-orange-600',
    rose: 'from-rose-500 to-pink-600',
    slate: 'from-slate-600 to-slate-800',
  };
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm relative overflow-hidden">
      <div className={cls('absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br opacity-10', accentMap[accent])} />
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs uppercase tracking-wide text-slate-500 font-medium">{label}</p>
          {Icon && <Icon className="w-4 h-4 text-slate-400" />}
        </div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
      </div>
    </div>
  );
}

function Button({ children, variant = 'primary', size = 'md', icon: Icon, className = '', ...props }) {
  const variants = {
    primary: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm',
    secondary: 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50',
    danger: 'bg-rose-600 text-white hover:bg-rose-700',
    ghost: 'text-slate-700 hover:bg-slate-100',
    dark: 'bg-slate-900 text-white hover:bg-slate-800',
  };
  const sizes = { sm: 'px-2.5 py-1.5 text-xs', md: 'px-3.5 py-2 text-sm', lg: 'px-4 py-2.5 text-sm' };
  return (
    <button className={cls('inline-flex items-center gap-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed', variants[variant], sizes[size], className)} {...props}>
      {Icon && <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />}
      {children}
    </button>
  );
}

function Input({ label, error, hint, className = '', ...props }) {
  return (
    <div className={className}>
      {label && <label className="block text-xs font-medium text-slate-700 mb-1">{label}</label>}
      <input className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" {...props} />
      {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
      {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
    </div>
  );
}

function Select({ label, options = [], className = '', ...props }) {
  return (
    <div className={className}>
      {label && <label className="block text-xs font-medium text-slate-700 mb-1">{label}</label>}
      <select className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" {...props}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Textarea({ label, className = '', ...props }) {
  return (
    <div className={className}>
      {label && <label className="block text-xs font-medium text-slate-700 mb-1">{label}</label>}
      <textarea className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" {...props} />
    </div>
  );
}

function Modal({ open, onClose, title, children, size = 'md', footer }) {
  if (!open) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl', xl: 'max-w-6xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}>
      <div className={cls('bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-hidden flex flex-col', sizes[size])} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
        {footer && <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon = FolderOpen, title, hint, action }) {
  return (
    <div className="text-center py-12 px-4">
      <div className="inline-flex p-3 rounded-full bg-slate-100 mb-3">
        <Icon className="w-6 h-6 text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-700">{title}</p>
      {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// =====================================================================
// LOGIN SCREEN
// =====================================================================

function LoginScreen({ employees, onLogin }) {
  const [selectedId, setSelectedId] = useState(employees[0]?.id || '');
  const emp = employees.find(e => e.id === selectedId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900 flex items-center justify-center p-6">
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      <div className="relative w-full max-w-4xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Brand panel */}
        <div className="text-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight">{APP_NAME}</div>
              <div className="text-xs text-emerald-200">{APP_FULL_NAME}</div>
            </div>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-4">
            Sistem Terpadu<br/>
            <span className="bg-gradient-to-r from-emerald-300 to-teal-200 bg-clip-text text-transparent">Pelatihan, KM &amp; Talent</span>
          </h1>
          <p className="text-emerald-100/80 text-sm leading-relaxed max-w-md">
            Pengelolaan end-to-end pelatihan pegawai BPKH, terintegrasi dengan 4 pilar Knowledge Management dan Talent Management 3-stage. Sesuai Prosedur Tetap Manajemen Pengetahuan BPKH.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-3 max-w-md">
            {[
              { icon: GraduationCap, label: '10-Step Approval' },
              { icon: Brain,         label: '4 Pilar KM' },
              { icon: Target,        label: 'TMS 3-Stage' },
            ].map((f, i) => (
              <div key={i} className="bg-white/10 backdrop-blur rounded-xl p-3 border border-white/10">
                <f.icon className="w-5 h-5 text-emerald-300 mb-2" />
                <div className="text-xs font-medium">{f.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Login panel */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">Masuk ke Sistem</h2>
            <p className="text-sm text-slate-500 mt-1">Mock login — pilih pegawai untuk simulasi peran</p>
          </div>

          <label className="block text-xs font-medium text-slate-700 mb-1.5">Pilih Pegawai (Role akan otomatis)</label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {employees.map(e => (
              <option key={e.id} value={e.id}>
                {e.nama} — {ROLE_META[e.role]?.short}
              </option>
            ))}
          </select>

          {emp && (
            <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-start gap-3">
                <div className={cls('w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold', 'bg-gradient-to-br from-emerald-500 to-teal-600')}>
                  {emp.nama.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-900 truncate">{emp.nama}</p>
                  <p className="text-xs text-slate-600 truncate">{emp.jabatan}</p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{emp.divisi}</p>
                  <Badge className={cls('mt-2', ROLE_META[emp.role]?.color)}>
                    {React.createElement(ROLE_META[emp.role]?.icon || User, { className: 'w-3 h-3' })}
                    {ROLE_META[emp.role]?.label}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          <Button onClick={() => onLogin(emp)} className="w-full mt-6 justify-center" size="lg" icon={ChevronRight}>
            Masuk Sebagai {emp ? emp.nama.split(' ')[0] : '...'}
          </Button>

          <p className="text-[10px] text-slate-400 text-center mt-6">
            {APP_NAME} v{APP_VERSION} · {ORGANIZATION} · © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// LAYOUT — SIDEBAR + TOPBAR
// =====================================================================

function getMenuForRole(role) {
  // Each role sees a tailored menu. Common items appear for most.
  const all = [
    { key: 'dashboard',  label: 'Dashboard',            icon: LayoutDashboard, roles: 'all',  group: 'Utama' },
    { key: 'pengajuan',  label: 'Pengajuan Pelatihan',  icon: ClipboardList,   roles: 'all',  group: 'Pelatihan' },
    { key: 'approval',   label: 'Antrian Approval',     icon: CheckSquare,     roles: [ROLES.KADIV, ROLES.DEPUTI, ROLES.PELAKSANA_PSDM, ROLES.KADIV_PSDM], group: 'Pelatihan' },
    { key: 'st',         label: 'Surat Tugas',          icon: FileSignature,   roles: [ROLES.PELAKSANA_PSDM, ROLES.KADIV_PSDM, ROLES.ADMIN, ROLES.PEGAWAI], group: 'Pelatihan' },
    { key: 'laporan',    label: 'Laporan & Evaluasi',   icon: FileText,        roles: 'all',  group: 'Pelatihan' },
    { key: 'katalog',    label: 'Katalog Pelatihan',    icon: BookOpen,        roles: 'all',  group: 'Master Data' },
    { key: 'pegawai',    label: 'Direktori Pegawai',    icon: Users,           roles: 'all',  group: 'Master Data' },
    { key: 'kategori',   label: 'Kategori Pelatihan',   icon: Layers,          roles: [ROLES.PELAKSANA_PSDM, ROLES.KADIV_PSDM, ROLES.ADMIN], group: 'Master Data' },
    { key: 'km',         label: 'Knowledge Management', icon: Brain,           roles: 'all',  group: 'KM & TMS' },
    { key: 'tms',        label: 'Talent Management',    icon: Target,          roles: [ROLES.KADIV, ROLES.DEPUTI, ROLES.PELAKSANA_PSDM, ROLES.KADIV_PSDM, ROLES.ADMIN], group: 'KM & TMS' },
    { key: 'settings',   label: 'Pengaturan',           icon: SettingsIcon,    roles: 'all',  group: 'Sistem' },
  ];
  return all.filter(m => m.roles === 'all' || m.roles.includes(role));
}

function Sidebar({ user, currentView, onNavigate, collapsed, onToggleCollapse }) {
  const menu = getMenuForRole(user.role);
  const grouped = menu.reduce((acc, m) => {
    (acc[m.group] = acc[m.group] || []).push(m);
    return acc;
  }, {});

  return (
    <aside className={cls('bg-slate-900 text-slate-200 flex flex-col transition-all', collapsed ? 'w-16' : 'w-64')}>
      <div className="px-4 py-4 border-b border-slate-800 flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0">
          <Brain className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <div className="text-sm font-bold">{APP_NAME}</div>
            <div className="text-[10px] text-slate-400">{ORGANIZATION}</div>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-3">
        {Object.entries(grouped).map(([group, items]) => (
          <div key={group} className="mb-4">
            {!collapsed && <div className="px-4 pb-1 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{group}</div>}
            {items.map(item => {
              const Icon = item.icon;
              const active = currentView === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => onNavigate(item.key)}
                  title={collapsed ? item.label : ''}
                  className={cls(
                    'w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors',
                    active ? 'bg-emerald-600/20 text-emerald-300 border-r-2 border-emerald-400' : 'text-slate-300 hover:bg-slate-800',
                    collapsed && 'justify-center'
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <button onClick={onToggleCollapse} className="border-t border-slate-800 px-4 py-3 text-xs text-slate-400 hover:bg-slate-800 flex items-center justify-center gap-2">
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /> Collapse</>}
      </button>
    </aside>
  );
}

function Topbar({ user, onLogout, onSwitchUser, notifications = 0 }) {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
      <div>
        <div className="text-xs text-slate-500">Selamat datang,</div>
        <div className="font-semibold text-slate-900">{user.nama}</div>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative p-2 text-slate-500 hover:text-slate-700">
          <Bell className="w-5 h-5" />
          {notifications > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />}
        </button>
        <div className="text-right">
          <div className="text-xs font-medium text-slate-900">{user.jabatan}</div>
          <Badge className={ROLE_META[user.role]?.color + ' text-[10px]'}>
            {ROLE_META[user.role]?.label}
          </Badge>
        </div>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-sm font-semibold">
          {user.nama.split(' ').map(n => n[0]).slice(0, 2).join('')}
        </div>
        <Button variant="ghost" size="sm" icon={LogOut} onClick={onLogout}>Logout</Button>
      </div>
    </header>
  );
}

// =====================================================================
// VIEW — DASHBOARD
// =====================================================================

function Dashboard({ user, employees, proposals, trainings, reports, onNavigate }) {
  const isPSDMSide = [ROLES.PELAKSANA_PSDM, ROLES.KADIV_PSDM, ROLES.ADMIN].includes(user.role);
  const mine = proposals.filter(p => p.pengajuId === user.id || p.peserta?.some(x => x.id === user.id));
  const pending = proposals.filter(p => {
    const s = stageByKey(p.stage);
    return s.actor === user.role;
  });
  const inProgress = proposals.filter(p => ['in_progress', 'st_issued', 'registered'].includes(p.stage));
  const completed = proposals.filter(p => p.stage === 'completed');

  // category distribution
  const catCounts = {};
  Object.keys(CATEGORIES).forEach(k => catCounts[k] = 0);
  proposals.forEach(p => { catCounts[p.kategori] = (catCounts[p.kategori] || 0) + 1; });
  const maxCat = Math.max(1, ...Object.values(catCounts));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Ringkasan aktivitas pelatihan, KM, dan TMS</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isPSDMSide ? (
          <>
            <StatCard label="Total Pengajuan" value={proposals.length} icon={ClipboardList} accent="emerald" />
            <StatCard label="Antrian Tugas" value={pending.length} hint="Menunggu aksi Anda" icon={Clock} accent="amber" />
            <StatCard label="Sedang Berlangsung" value={inProgress.length} icon={Zap} accent="blue" />
            <StatCard label="Selesai (Closed-Loop)" value={completed.length} icon={CheckCircle2} accent="emerald" />
          </>
        ) : (
          <>
            <StatCard label="Pengajuan Saya" value={mine.length} icon={ClipboardList} accent="emerald" />
            <StatCard label="Antrian Aksi Saya" value={pending.length} icon={Clock} accent="amber" />
            <StatCard label="Sedang Berlangsung" value={inProgress.filter(p => mine.some(m => m.id === p.id)).length} icon={Zap} accent="blue" />
            <StatCard label="Pelatihan Selesai" value={completed.filter(p => mine.some(m => m.id === p.id)).length} icon={Award} accent="emerald" />
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card title="Antrian Aksi Anda" subtitle={`Sebagai ${ROLE_META[user.role]?.label}`} className="lg:col-span-2">
          {pending.length === 0 ? (
            <EmptyState icon={CheckCircle2} title="Tidak ada aksi tertunda" hint="Semua sudah ditindaklanjuti" />
          ) : (
            <div className="space-y-2">
              {pending.slice(0, 6).map(p => {
                const pengaju = employees.find(e => e.id === p.pengajuId);
                return (
                  <button key={p.id} onClick={() => onNavigate('pengajuan', p.id)} className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/30 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium text-sm text-slate-900 truncate">{p.judul}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{p.id} · {pengaju?.nama || '-'}</div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <CategoryBadge code={p.kategori} />
                        <StageBadge stageKey={p.stage} />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </Card>

        <Card title="Distribusi Kategori" subtitle="Total pengajuan per kategori">
          <div className="space-y-2.5">
            {Object.entries(CATEGORIES).map(([code, cat]) => (
              <div key={code}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-700">{cat.short}</span>
                  <span className="font-semibold text-slate-900">{catCounts[code]}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={cls('h-full transition-all', cat.chip)} style={{ width: `${(catCounts[code] / maxCat) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Aktivitas Terbaru" subtitle="10 pengajuan terakhir">
          <div className="space-y-2">
            {proposals.slice(-10).reverse().map(p => {
              const pengaju = employees.find(e => e.id === p.pengajuId);
              return (
                <div key={p.id} className="flex items-center justify-between gap-3 py-2 border-b border-slate-100 last:border-0">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate">{p.judul}</div>
                    <div className="text-xs text-slate-500">{pengaju?.nama || '-'} · {fmtDate(p.history?.[p.history.length - 1]?.at)}</div>
                  </div>
                  <StageBadge stageKey={p.stage} />
                </div>
              );
            })}
          </div>
        </Card>

        <Card title="Quick Actions" subtitle="Aksi cepat yang sering Anda lakukan">
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => onNavigate('pengajuan')} className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-left hover:bg-emerald-100/60 transition-colors">
              <Plus className="w-5 h-5 text-emerald-700 mb-2" />
              <div className="text-sm font-semibold text-emerald-900">Buat Pengajuan</div>
              <div className="text-xs text-emerald-700/80 mt-0.5">Form pengajuan pelatihan baru</div>
            </button>
            <button onClick={() => onNavigate('katalog')} className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-left hover:bg-blue-100/60 transition-colors">
              <BookOpen className="w-5 h-5 text-blue-700 mb-2" />
              <div className="text-sm font-semibold text-blue-900">Katalog Pelatihan</div>
              <div className="text-xs text-blue-700/80 mt-0.5">Cari pelatihan tersedia</div>
            </button>
            <button onClick={() => onNavigate('km')} className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-left hover:bg-purple-100/60 transition-colors">
              <Brain className="w-5 h-5 text-purple-700 mb-2" />
              <div className="text-sm font-semibold text-purple-900">Knowledge Hub</div>
              <div className="text-xs text-purple-700/80 mt-0.5">SME, KMap, CoP, Asset</div>
            </button>
            <button onClick={() => onNavigate('laporan')} className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-left hover:bg-amber-100/60 transition-colors">
              <FileText className="w-5 h-5 text-amber-700 mb-2" />
              <div className="text-sm font-semibold text-amber-900">Laporan Saya</div>
              <div className="text-xs text-amber-700/80 mt-0.5">Susun laporan pasca pelatihan</div>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

// =====================================================================
// VIEW — DIREKTORI PEGAWAI (Admin: CRUD; lainnya: read-only)
// =====================================================================

function MasterPegawai({ user, employees, setEmployees }) {
  const canEdit = user.role === ROLES.ADMIN;
  const [q, setQ] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [editing, setEditing] = useState(null);

  const filtered = employees.filter(e =>
    (filterRole === 'all' || e.role === filterRole) &&
    (q === '' || e.nama.toLowerCase().includes(q.toLowerCase()) || e.nip.includes(q) || e.jabatan.toLowerCase().includes(q.toLowerCase()))
  );

  const handleSave = (data) => {
    if (data.id) {
      setEmployees(employees.map(e => e.id === data.id ? data : e));
    } else {
      setEmployees([...employees, { ...data, id: uid('E') }]);
    }
    setEditing(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Hapus pegawai ini? (akan ter-soft-delete: status non-aktif)')) {
      setEmployees(employees.map(e => e.id === id ? { ...e, status: 'non-aktif' } : e));
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Direktori Pegawai</h1>
          <p className="text-sm text-slate-500 mt-1">{employees.filter(e => e.status === 'aktif').length} pegawai aktif · {employees.length} total</p>
        </div>
        {canEdit && <Button icon={Plus} onClick={() => setEditing({})}>Tambah Pegawai</Button>}
      </div>

      <Card padded={false}>
        <div className="p-4 border-b border-slate-100 flex gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama, NIP, atau jabatan..." className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg" />
          </div>
          <Select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}
            options={[{ value: 'all', label: 'Semua Role' }, ...Object.entries(ROLE_META).map(([k, v]) => ({ value: k, label: v.label }))]} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">Pegawai</th>
                <th className="text-left px-4 py-3">NIP</th>
                <th className="text-left px-4 py-3">Jabatan</th>
                <th className="text-left px-4 py-3">Divisi</th>
                <th className="text-left px-4 py-3">Role</th>
                <th className="text-left px-4 py-3">Status</th>
                {canEdit && <th className="text-right px-4 py-3">Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-xs font-semibold shrink-0">
                        {e.nama.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-slate-900 truncate">{e.nama}</div>
                        <div className="text-xs text-slate-500 truncate">{e.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{e.nip}</td>
                  <td className="px-4 py-3">{e.jabatan}</td>
                  <td className="px-4 py-3 text-slate-600">{e.divisi}</td>
                  <td className="px-4 py-3"><Badge className={ROLE_META[e.role]?.color}>{ROLE_META[e.role]?.short}</Badge></td>
                  <td className="px-4 py-3">
                    <Badge className={e.status === 'aktif' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'}>{e.status}</Badge>
                  </td>
                  {canEdit && (
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setEditing(e)} className="text-slate-500 hover:text-emerald-600 mr-2"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(e.id)} className="text-slate-500 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={canEdit ? 7 : 6}><EmptyState title="Tidak ada pegawai sesuai filter" /></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {editing && (
        <PegawaiForm
          initial={editing}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function PegawaiForm({ initial, onSave, onCancel }) {
  const [data, setData] = useState({
    nip: '', nama: '', jabatan: '', divisi: DIVISIONS[0], role: ROLES.PEGAWAI, email: '', status: 'aktif',
    ...initial,
  });
  const set = (k, v) => setData(d => ({ ...d, [k]: v }));

  return (
    <Modal open={true} onClose={onCancel} title={initial.id ? 'Edit Pegawai' : 'Tambah Pegawai Baru'} size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>Batal</Button>
          <Button icon={Save} onClick={() => onSave(data)}>Simpan</Button>
        </>
      }>
      <div className="grid grid-cols-2 gap-4">
        <Input label="NIP" value={data.nip} onChange={(e) => set('nip', e.target.value)} placeholder="18 digit NIP" />
        <Input label="Email" type="email" value={data.email} onChange={(e) => set('email', e.target.value)} />
        <Input label="Nama Lengkap" value={data.nama} onChange={(e) => set('nama', e.target.value)} className="col-span-2" />
        <Input label="Jabatan" value={data.jabatan} onChange={(e) => set('jabatan', e.target.value)} className="col-span-2" />
        <Select label="Divisi" value={data.divisi} onChange={(e) => set('divisi', e.target.value)}
          options={DIVISIONS.map(d => ({ value: d, label: d }))} />
        <Select label="Role" value={data.role} onChange={(e) => set('role', e.target.value)}
          options={Object.entries(ROLE_META).map(([k, v]) => ({ value: k, label: v.label }))} />
        <Select label="Status" value={data.status} onChange={(e) => set('status', e.target.value)}
          options={[{ value: 'aktif', label: 'Aktif' }, { value: 'non-aktif', label: 'Non-Aktif' }]} className="col-span-2" />
      </div>
    </Modal>
  );
}

// =====================================================================
// VIEW — KATALOG PELATIHAN (Master Pelatihan: historis + baru, inhouse + mandiri)
// =====================================================================

function MasterPelatihan({ user, trainings, setTrainings }) {
  const canEdit = [ROLES.PELAKSANA_PSDM, ROLES.KADIV_PSDM, ROLES.ADMIN].includes(user.role);
  const [q, setQ] = useState('');
  const [filterKat, setFilterKat] = useState('all');
  const [filterJenis, setFilterJenis] = useState('all');
  const [filterStatus, setFilterStatus] = useState('aktif');
  const [editing, setEditing] = useState(null);

  const filtered = trainings.filter(t =>
    (filterKat === 'all' || t.kategori === filterKat) &&
    (filterJenis === 'all' || t.jenis === filterJenis) &&
    (filterStatus === 'all' || t.status === filterStatus) &&
    (q === '' || t.judul.toLowerCase().includes(q.toLowerCase()) || t.penyelenggara.toLowerCase().includes(q.toLowerCase()))
  );

  const handleSave = (data) => {
    if (data.id) setTrainings(trainings.map(t => t.id === data.id ? data : t));
    else setTrainings([...trainings, { ...data, id: uid('T') }]);
    setEditing(null);
  };

  const handleArchive = (id) => {
    setTrainings(trainings.map(t => t.id === id ? { ...t, status: 'arsip' } : t));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Katalog Pelatihan</h1>
          <p className="text-sm text-slate-500 mt-1">
            Repository pelatihan: in-house, mandiri, dan eksternal. Termasuk arsip historis.
          </p>
        </div>
        {canEdit && <Button icon={Plus} onClick={() => setEditing({})}>Tambah Pelatihan</Button>}
      </div>

      <Card padded={false}>
        <div className="p-4 border-b border-slate-100 grid md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari pelatihan..." className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg" />
          </div>
          <Select value={filterKat} onChange={(e) => setFilterKat(e.target.value)}
            options={[{ value: 'all', label: 'Semua Kategori' }, ...Object.entries(CATEGORIES).map(([k, v]) => ({ value: k, label: v.label }))]} />
          <Select value={filterJenis} onChange={(e) => setFilterJenis(e.target.value)}
            options={[
              { value: 'all', label: 'Semua Jenis' },
              { value: 'inhouse', label: 'In-house' },
              { value: 'mandiri', label: 'Mandiri' },
              { value: 'eksternal', label: 'Eksternal' },
            ]} />
          <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            options={[
              { value: 'aktif', label: 'Aktif' },
              { value: 'arsip', label: 'Arsip (Historis)' },
              { value: 'all', label: 'Semua' },
            ]} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">Judul Pelatihan</th>
                <th className="text-left px-4 py-3">Kategori</th>
                <th className="text-left px-4 py-3">Penyelenggara</th>
                <th className="text-left px-4 py-3">Jenis</th>
                <th className="text-right px-4 py-3">Durasi</th>
                <th className="text-right px-4 py-3">Biaya Est.</th>
                <th className="text-left px-4 py-3">Status</th>
                {canEdit && <th className="text-right px-4 py-3">Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{t.judul}</div>
                    <div className="text-xs text-slate-500 font-mono">{t.id}</div>
                  </td>
                  <td className="px-4 py-3"><CategoryBadge code={t.kategori} /></td>
                  <td className="px-4 py-3 text-slate-700">{t.penyelenggara}</td>
                  <td className="px-4 py-3">
                    <Badge className={
                      t.jenis === 'inhouse'   ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      t.jenis === 'mandiri'   ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                'bg-slate-50 text-slate-700 border-slate-200'
                    }>{t.jenis}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">{t.durasiHari} hari</td>
                  <td className="px-4 py-3 text-right font-medium">{fmtIDR(t.biayaEstimasi)}</td>
                  <td className="px-4 py-3">
                    <Badge className={t.status === 'aktif' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}>
                      {t.status === 'aktif' ? 'Aktif' : 'Arsip'}
                    </Badge>
                  </td>
                  {canEdit && (
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button onClick={() => setEditing(t)} className="text-slate-500 hover:text-emerald-600 mr-2"><Edit2 className="w-4 h-4" /></button>
                      {t.status === 'aktif' && <button onClick={() => handleArchive(t.id)} className="text-slate-500 hover:text-amber-600"><History className="w-4 h-4" /></button>}
                    </td>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={canEdit ? 8 : 7}><EmptyState title="Tidak ada pelatihan sesuai filter" /></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {editing && <PelatihanForm initial={editing} onSave={handleSave} onCancel={() => setEditing(null)} />}
    </div>
  );
}

function PelatihanForm({ initial, onSave, onCancel }) {
  const [data, setData] = useState({
    judul: '', kategori: 'K2', penyelenggara: '', jenis: 'eksternal',
    durasiHari: 1, biayaEstimasi: 0, status: 'aktif',
    ...initial,
  });
  const set = (k, v) => setData(d => ({ ...d, [k]: v }));

  return (
    <Modal open={true} onClose={onCancel} title={initial.id ? 'Edit Pelatihan' : 'Tambah Pelatihan'} size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>Batal</Button>
          <Button icon={Save} onClick={() => onSave(data)}>Simpan</Button>
        </>
      }>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Judul Pelatihan" value={data.judul} onChange={(e) => set('judul', e.target.value)} className="col-span-2" />
        <Select label="Kategori" value={data.kategori} onChange={(e) => set('kategori', e.target.value)}
          options={Object.entries(CATEGORIES).map(([k, v]) => ({ value: k, label: `${k} — ${v.label}` }))} />
        <Select label="Jenis Pelatihan" value={data.jenis} onChange={(e) => set('jenis', e.target.value)}
          options={[
            { value: 'inhouse', label: 'In-house (Internal BPKH)' },
            { value: 'mandiri', label: 'Mandiri (Self-paced)' },
            { value: 'eksternal', label: 'Eksternal (Penyedia luar)' },
          ]} />
        <Input label="Penyelenggara" value={data.penyelenggara} onChange={(e) => set('penyelenggara', e.target.value)} className="col-span-2" />
        <Input label="Durasi (hari)" type="number" value={data.durasiHari} onChange={(e) => set('durasiHari', Number(e.target.value))} />
        <Input label="Biaya Estimasi (Rp)" type="number" value={data.biayaEstimasi} onChange={(e) => set('biayaEstimasi', Number(e.target.value))} />
        <Select label="Status" value={data.status} onChange={(e) => set('status', e.target.value)}
          options={[
            { value: 'aktif', label: 'Aktif (tersedia untuk diajukan)' },
            { value: 'arsip', label: 'Arsip (data historis)' },
          ]} className="col-span-2" />
      </div>
    </Modal>
  );
}

// =====================================================================
// VIEW — KATEGORI PELATIHAN (Master)
// =====================================================================

function MasterKategori({ trainings, proposals }) {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Kategori Pelatihan</h1>
        <p className="text-sm text-slate-500 mt-1">
          5 kategori inti BPKH + 2 program khusus (Membership Profesi, Dukungan S2)
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {Object.entries(CATEGORIES).map(([code, cat]) => {
          const countCat = trainings.filter(t => t.kategori === code).length;
          const countProp = proposals.filter(p => p.kategori === code).length;
          const rule = CATEGORY_RULES[code];
          return (
            <Card key={code}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={cls('w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold', cat.chip)}>{code}</span>
                    <div>
                      <div className="font-semibold text-slate-900">{cat.label}</div>
                      <div className="text-xs text-slate-500">Kode {code}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500">Item di Katalog</div>
                  <div className="text-lg font-bold text-slate-900">{countCat}</div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500">Pengajuan</div>
                  <div className="text-lg font-bold text-slate-900">{countProp}</div>
                </div>
              </div>
              {rule && (
                <div className="text-xs bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-amber-800">
                  <div className="font-semibold mb-0.5">Aturan Khusus</div>
                  {rule.maxPerYear && <div>· Maksimal {rule.maxPerYear} kali per pegawai per tahun</div>}
                  {rule.requiresTusiAlignment && <div>· Wajib selaras dengan tugas & fungsi pegawai</div>}
                  {rule.requiresHighLevelApproval && <div>· Memerlukan persetujuan eselon tinggi (Anggota BP)</div>}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// =====================================================================
// VIEW — PENGAJUAN PELATIHAN (List + Form + Detail + 10-step Approval)
// =====================================================================

function PengajuanView({ user, employees, trainings, proposals, setProposals, focusId, onClearFocus }) {
  const [mode, setMode] = useState(focusId ? 'detail' : 'list');
  const [selectedId, setSelectedId] = useState(focusId || null);

  useEffect(() => {
    if (focusId) { setMode('detail'); setSelectedId(focusId); }
  }, [focusId]);

  const openDetail = (id) => { setSelectedId(id); setMode('detail'); };
  const goList = () => { setMode('list'); setSelectedId(null); onClearFocus && onClearFocus(); };
  const goCreate = () => { setMode('create'); setSelectedId(null); };

  if (mode === 'create') return <PengajuanForm user={user} employees={employees} trainings={trainings} proposals={proposals} setProposals={setProposals} onDone={goList} />;
  if (mode === 'detail' && selectedId) {
    const p = proposals.find(x => x.id === selectedId);
    if (!p) return <EmptyState title="Pengajuan tidak ditemukan" action={<Button onClick={goList}>Kembali</Button>} />;
    return <PengajuanDetail user={user} employees={employees} trainings={trainings} proposal={p} setProposals={setProposals} onBack={goList} />;
  }
  return <PengajuanList user={user} employees={employees} proposals={proposals} onOpen={openDetail} onCreate={goCreate} />;
}

function PengajuanList({ user, employees, proposals, onOpen, onCreate }) {
  const [scope, setScope] = useState('mine'); // mine | inbox | all
  const [filterStage, setFilterStage] = useState('all');
  const [filterKat, setFilterKat] = useState('all');
  const [q, setQ] = useState('');

  const canCreateNew = true;
  const isPSDMSide = [ROLES.PELAKSANA_PSDM, ROLES.KADIV_PSDM, ROLES.ADMIN].includes(user.role);

  const filtered = proposals
    .filter(p => {
      if (scope === 'mine') return p.pengajuId === user.id || p.peserta?.some(x => x.id === user.id);
      if (scope === 'inbox') return stageByKey(p.stage).actor === user.role;
      return true;
    })
    .filter(p => filterStage === 'all' || p.stage === filterStage)
    .filter(p => filterKat === 'all' || p.kategori === filterKat)
    .filter(p => q === '' || p.judul.toLowerCase().includes(q.toLowerCase()) || p.id.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pengajuan Pelatihan</h1>
          <p className="text-sm text-slate-500 mt-1">Alur 10 tahap: Pengusulan → Approval Berjenjang → ST → Pelaksanaan → Laporan → Evaluasi → Sharing KM</p>
        </div>
        {canCreateNew && <Button icon={Plus} onClick={onCreate}>Buat Pengajuan Baru</Button>}
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        {[
          { v: 'mine',  label: 'Pengajuan Saya' },
          ...(isPSDMSide || [ROLES.KADIV, ROLES.DEPUTI].includes(user.role) ? [{ v: 'inbox', label: 'Inbox Aksi Saya' }] : []),
          ...(isPSDMSide ? [{ v: 'all', label: 'Semua Pengajuan' }] : []),
        ].map(t => (
          <button key={t.v} onClick={() => setScope(t.v)}
            className={cls('px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              scope === t.v ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700')}>
            {t.label}
          </button>
        ))}
      </div>

      <Card padded={false}>
        <div className="p-4 border-b border-slate-100 grid md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari ID atau judul..." className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg" />
          </div>
          <Select value={filterKat} onChange={(e) => setFilterKat(e.target.value)}
            options={[{ value: 'all', label: 'Semua Kategori' }, ...Object.entries(CATEGORIES).map(([k, v]) => ({ value: k, label: v.label }))]} />
          <Select value={filterStage} onChange={(e) => setFilterStage(e.target.value)}
            options={[{ value: 'all', label: 'Semua Tahap' }, ...STAGES.filter(s => s.order >= 0).map(s => ({ value: s.key, label: s.label }))]} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">ID</th>
                <th className="text-left px-4 py-3">Judul</th>
                <th className="text-left px-4 py-3">Pengaju</th>
                <th className="text-left px-4 py-3">Kategori</th>
                <th className="text-left px-4 py-3">Tanggal</th>
                <th className="text-right px-4 py-3">Total Biaya</th>
                <th className="text-left px-4 py-3">Tahap</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const pengaju = employees.find(e => e.id === p.pengajuId);
                return (
                  <tr key={p.id} onClick={() => onOpen(p.id)} className="border-t border-slate-100 hover:bg-emerald-50/40 cursor-pointer">
                    <td className="px-4 py-3 font-mono text-xs">{p.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{p.judul}</div>
                      <div className="text-xs text-slate-500">{p.penyelenggara}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{pengaju?.nama || '-'}</td>
                    <td className="px-4 py-3"><CategoryBadge code={p.kategori} /></td>
                    <td className="px-4 py-3 text-xs text-slate-600">{fmtDate(p.tanggalMulai)}</td>
                    <td className="px-4 py-3 text-right font-medium">{fmtIDR(p.totalBiaya)}</td>
                    <td className="px-4 py-3"><StageBadge stageKey={p.stage} /></td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7}><EmptyState icon={ClipboardList} title="Belum ada pengajuan" action={<Button onClick={onCreate} icon={Plus}>Buat Pengajuan Baru</Button>} /></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// =====================================================================
// PENGAJUAN FORM — Multi-step sesuai template BPKH
// =====================================================================

function PengajuanForm({ user, employees, trainings, proposals, setProposals, onDone }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    judul: '', kategori: 'K2', refTrainingId: '', penyelenggara: '',
    tanggalMulai: '', tanggalSelesai: '', durasiHari: 1, lokasi: '',
    peserta: [{ id: user.id, nama: user.nama, jabatan: user.jabatan }],
    manfaatBPKH: '', manfaatPegawai: '',
    rtl: [{ kegiatan: '', waktu: '', hasil: '' }],
    biayaTuition: 0, biayaTiket: 0, biayaPenginapan: 0, biayaTaksi: 0, biayaUangSaku: 0,
  });
  const set = (k, v) => setData(d => ({ ...d, [k]: v }));
  const setRTL = (i, k, v) => setData(d => ({ ...d, rtl: d.rtl.map((r, ix) => ix === i ? { ...r, [k]: v } : r) }));
  const addRTL = () => setData(d => ({ ...d, rtl: [...d.rtl, { kegiatan: '', waktu: '', hasil: '' }] }));
  const removeRTL = (i) => setData(d => ({ ...d, rtl: d.rtl.filter((_, ix) => ix !== i) }));
  const addPeserta = (empId) => {
    const e = employees.find(x => x.id === empId);
    if (!e || data.peserta.some(p => p.id === e.id)) return;
    setData(d => ({ ...d, peserta: [...d.peserta, { id: e.id, nama: e.nama, jabatan: e.jabatan }] }));
  };
  const removePeserta = (id) => {
    if (data.peserta.length <= 1) return;
    setData(d => ({ ...d, peserta: d.peserta.filter(p => p.id !== id) }));
  };

  const totalBiaya = ['biayaTuition', 'biayaTiket', 'biayaPenginapan', 'biayaTaksi', 'biayaUangSaku']
    .reduce((sum, k) => sum + (Number(data[k]) || 0), 0);

  const onPickCatalog = (id) => {
    const t = trainings.find(x => x.id === id);
    if (!t) return;
    setData(d => ({ ...d, refTrainingId: id, judul: t.judul, kategori: t.kategori, penyelenggara: t.penyelenggara, durasiHari: t.durasiHari, biayaTuition: t.biayaEstimasi }));
  };

  const cat = CATEGORIES[data.kategori];
  const rule = CATEGORY_RULES[data.kategori];
  const warningM1 = rule && rule.maxPerYear ? (() => {
    const year = new Date().getFullYear();
    const count = proposals.filter(p =>
      p.kategori === 'M1' &&
      p.peserta?.some(ps => ps.id === user.id) &&
      new Date(p.tanggalMulai).getFullYear() === year &&
      !['rejected'].includes(p.stage)
    ).length;
    return count >= rule.maxPerYear ? `Anda sudah mengajukan ${count} Membership tahun ini. Maksimal ${rule.maxPerYear}/tahun.` : null;
  })() : null;

  const submit = (asDraft) => {
    const newId = newProposalId(proposals);
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newP = {
      ...data,
      id: newId,
      pengajuId: user.id,
      totalBiaya,
      stage: asDraft ? 'draft' : 'submitted',
      history: [
        { stage: 'draft', by: user.id, at: now, note: 'Pengajuan dibuat' },
        ...(asDraft ? [] : [{ stage: 'submitted', by: user.id, at: now, note: 'Diajukan ke Kadiv' }]),
      ],
    };
    setProposals([...proposals, newP]);
    onDone();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" icon={ArrowLeft} onClick={onDone}>Kembali</Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Form Pengajuan Pelatihan</h1>
          <p className="text-sm text-slate-500">Mengacu pada Format Formulir Pengajuan Program Pengembangan Pegawai BPKH</p>
        </div>
      </div>

      {/* Stepper */}
      <Card>
        <div className="flex items-center justify-between gap-2">
          {['Identitas Program', 'Peserta', 'Manfaat & RTL', 'Estimasi Biaya', 'Review'].map((label, i) => {
            const n = i + 1;
            const active = step === n;
            const done = step > n;
            return (
              <React.Fragment key={n}>
                <div className="flex items-center gap-2 flex-1">
                  <div className={cls('w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0',
                    done ? 'bg-emerald-600 text-white' :
                    active ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-600' :
                    'bg-slate-100 text-slate-500')}>
                    {done ? <CheckCircle2 className="w-4 h-4" /> : n}
                  </div>
                  <div className={cls('text-xs font-medium hidden md:block', active ? 'text-emerald-700' : 'text-slate-500')}>{label}</div>
                </div>
                {n < 5 && <div className={cls('h-0.5 flex-1', done ? 'bg-emerald-500' : 'bg-slate-200')} />}
              </React.Fragment>
            );
          })}
        </div>
      </Card>

      {/* STEP 1 — Identitas Program */}
      {step === 1 && (
        <Card title="Identitas Program yang Diajukan" subtitle="Pilih dari katalog atau isi manual untuk pelatihan baru">
          <div className="space-y-4">
            <Select label="Pilih dari Katalog Pelatihan (opsional)"
              value={data.refTrainingId} onChange={(e) => onPickCatalog(e.target.value)}
              options={[{ value: '', label: '— Isi manual (pelatihan baru / belum ada di katalog) —' },
                ...trainings.filter(t => t.status === 'aktif').map(t => ({ value: t.id, label: `${t.judul} — ${t.penyelenggara}` }))]} />

            <Select label="Kategori Pelatihan" value={data.kategori} onChange={(e) => set('kategori', e.target.value)}
              options={Object.entries(CATEGORIES).map(([k, v]) => ({ value: k, label: `${k} — ${v.label}` }))} />
            {cat && (
              <div className={cls('px-3 py-2 rounded-lg border text-xs', cat.color)}>
                Kategori: <span className="font-semibold">{cat.label}</span>
                {warningM1 && <div className="mt-1 text-rose-700 font-medium">⚠ {warningM1}</div>}
                {rule?.requiresHighLevelApproval && <div className="mt-1">⚡ Memerlukan persetujuan eselon tinggi (Anggota BP).</div>}
              </div>
            )}

            <Input label="Judul / Jenis Pengembangan Pelatihan" value={data.judul} onChange={(e) => set('judul', e.target.value)} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Tanggal Mulai" type="date" value={data.tanggalMulai} onChange={(e) => set('tanggalMulai', e.target.value)} />
              <Input label="Tanggal Selesai" type="date" value={data.tanggalSelesai} onChange={(e) => set('tanggalSelesai', e.target.value)} />
              <Input label="Durasi (hari)" type="number" value={data.durasiHari} onChange={(e) => set('durasiHari', Number(e.target.value))} />
              <Input label="Penyelenggara" value={data.penyelenggara} onChange={(e) => set('penyelenggara', e.target.value)} />
              <Input label="Lokasi Pelaksanaan" value={data.lokasi} onChange={(e) => set('lokasi', e.target.value)} className="col-span-2" />
            </div>
          </div>
        </Card>
      )}

      {/* STEP 2 — Peserta */}
      {step === 2 && (
        <Card title="Peserta Pelatihan">
          <div className="space-y-3">
            <div className="space-y-2">
              {data.peserta.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <div className="font-medium text-sm text-slate-900">{p.nama}</div>
                    <div className="text-xs text-slate-500">{p.jabatan}</div>
                  </div>
                  {data.peserta.length > 1 && (
                    <button onClick={() => removePeserta(p.id)} className="text-rose-500 hover:text-rose-700"><Trash2 className="w-4 h-4" /></button>
                  )}
                </div>
              ))}
            </div>
            <Select label="Tambah Peserta" value="" onChange={(e) => e.target.value && addPeserta(e.target.value)}
              options={[{ value: '', label: '— Pilih pegawai —' },
                ...employees.filter(e => e.status === 'aktif' && !data.peserta.some(p => p.id === e.id))
                  .map(e => ({ value: e.id, label: `${e.nama} — ${e.jabatan}` }))]} />
          </div>
        </Card>
      )}

      {/* STEP 3 — Manfaat & RTL */}
      {step === 3 && (
        <Card title="Manfaat Program & Rencana Tindak Lanjut (RTL)" subtitle="Wajib jelas dan terukur — kriteria approval PSDM">
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Textarea label="Manfaat bagi BPKH" rows={4} value={data.manfaatBPKH} onChange={(e) => set('manfaatBPKH', e.target.value)} placeholder="Bagaimana pelatihan ini mendukung tugas & fungsi unit Anda dan tujuan BPKH?" />
              <Textarea label="Manfaat bagi Pegawai" rows={4} value={data.manfaatPegawai} onChange={(e) => set('manfaatPegawai', e.target.value)} placeholder="Kompetensi spesifik yang akan diperoleh / ditingkatkan" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-800">Rencana Kegiatan Pasca Pelatihan</label>
                <Button size="sm" icon={Plus} variant="secondary" onClick={addRTL}>Tambah Baris</Button>
              </div>
              <div className="space-y-2">
                {data.rtl.map((r, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-start">
                    <Input className="col-span-5" placeholder="Rencana kegiatan/aktivitas" value={r.kegiatan} onChange={(e) => setRTL(i, 'kegiatan', e.target.value)} />
                    <Input className="col-span-3" placeholder="Waktu" value={r.waktu} onChange={(e) => setRTL(i, 'waktu', e.target.value)} />
                    <Input className="col-span-3" placeholder="Hasil yang diharapkan" value={r.hasil} onChange={(e) => setRTL(i, 'hasil', e.target.value)} />
                    <button onClick={() => removeRTL(i)} disabled={data.rtl.length <= 1} className="col-span-1 text-slate-400 hover:text-rose-600 disabled:opacity-30 mt-2"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 4 — Biaya */}
      {step === 4 && (
        <Card title="Perkiraan Biaya" subtitle="Komponen biaya pelatihan & perjalanan dinas">
          <div className="space-y-3 max-w-2xl">
            <BiayaRow label="Registration / Tuition Fee"     value={data.biayaTuition}    onChange={(v) => set('biayaTuition', v)} />
            <BiayaRow label="Tiket Pesawat"                   value={data.biayaTiket}      onChange={(v) => set('biayaTiket', v)} />
            <BiayaRow label="Penginapan"                      value={data.biayaPenginapan} onChange={(v) => set('biayaPenginapan', v)} />
            <BiayaRow label="Taksi Bandara / Transportasi"    value={data.biayaTaksi}      onChange={(v) => set('biayaTaksi', v)} />
            <BiayaRow label="Uang Saku Pelatihan"             value={data.biayaUangSaku}   onChange={(v) => set('biayaUangSaku', v)} />
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <div className="font-semibold text-slate-900">Total Estimasi Biaya</div>
              <div className="text-xl font-bold text-emerald-700">{fmtIDR(totalBiaya)}</div>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 5 — Review */}
      {step === 5 && (
        <Card title="Review Sebelum Pengajuan">
          <div className="space-y-4 text-sm">
            <ReviewRow label="Judul" value={data.judul} />
            <ReviewRow label="Kategori" value={CATEGORIES[data.kategori]?.label} />
            <ReviewRow label="Penyelenggara" value={data.penyelenggara} />
            <ReviewRow label="Tanggal" value={`${fmtDate(data.tanggalMulai)} — ${fmtDate(data.tanggalSelesai)} (${data.durasiHari} hari)`} />
            <ReviewRow label="Lokasi" value={data.lokasi} />
            <ReviewRow label="Peserta" value={data.peserta.map(p => p.nama).join(', ')} />
            <ReviewRow label="Total Biaya" value={fmtIDR(totalBiaya)} />
            <div className="pt-3 border-t border-slate-200">
              <div className="text-xs text-slate-500 mb-1">Manfaat bagi BPKH</div>
              <div className="text-sm text-slate-800">{data.manfaatBPKH || <span className="text-rose-500">— belum diisi —</span>}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">Manfaat bagi Pegawai</div>
              <div className="text-sm text-slate-800">{data.manfaatPegawai || <span className="text-rose-500">— belum diisi —</span>}</div>
            </div>
          </div>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="secondary" icon={ArrowLeft} disabled={step === 1} onClick={() => setStep(s => s - 1)}>Sebelumnya</Button>
        <div className="flex gap-2">
          {step === 5 ? (
            <>
              <Button variant="secondary" onClick={() => submit(true)}>Simpan sebagai Draft</Button>
              <Button icon={Send} onClick={() => submit(false)} disabled={!!warningM1}>Ajukan ke Kadiv</Button>
            </>
          ) : (
            <Button icon={ArrowRight} onClick={() => setStep(s => s + 1)}>Selanjutnya</Button>
          )}
        </div>
      </div>
    </div>
  );
}

function BiayaRow({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="text-sm text-slate-700">{label}</div>
      <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))}
        className="w-48 px-3 py-1.5 text-sm text-right border border-slate-300 rounded-lg" />
    </div>
  );
}

function ReviewRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 border-b border-slate-100">
      <div className="text-slate-500">{label}</div>
      <div className="text-slate-900 font-medium text-right">{value || '-'}</div>
    </div>
  );
}

// =====================================================================
// PENGAJUAN DETAIL + APPROVAL PANEL
// =====================================================================

function PengajuanDetail({ user, employees, trainings, proposal, setProposals, onBack }) {
  const pengaju = employees.find(e => e.id === proposal.pengajuId);
  const stage = stageByKey(proposal.stage);
  const canAct = stage.actor === user.role && !['rejected', 'completed', 'postponed'].includes(proposal.stage);

  const [showApprove, setShowApprove] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [showAnalyze, setShowAnalyze] = useState(false);
  const [showST, setShowST] = useState(false);

  const advance = (toKey, note = '') => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const updated = {
      ...proposal,
      stage: toKey,
      history: [...(proposal.history || []), { stage: toKey, by: user.id, at: now, note }],
    };
    setProposals(prev => prev.map(p => p.id === proposal.id ? updated : p));
  };

  const handleApprove = (note) => { advance(nextStageKey(proposal.stage), note || 'Disetujui'); setShowApprove(false); };
  const handleReject = (note) => { advance('rejected', note); setShowReject(false); };
  const handlePostpone = (note) => { advance('postponed', note); };
  const handleAnalyze = (criteria, recommendation) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const updated = {
      ...proposal,
      analisaPSDM: { by: user.id, at: now, criteria, recommendation },
      stage: 'approved_psdm', // analyzed & forwarded to Kadiv PSDM for final
      history: [...(proposal.history || []), { stage: 'approved_psdm', by: user.id, at: now, note: `Analisa selesai — rekomendasi: ${recommendation}` }],
    };
    // Actually let it move to approved_psdm by Kadiv PSDM step; analyzing→pending Kadiv PSDM approval
    // For simplicity: after analysis, move forward.
    setProposals(prev => prev.map(p => p.id === proposal.id ? updated : p));
    setShowAnalyze(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Button variant="ghost" icon={ArrowLeft} onClick={onBack}>Daftar Pengajuan</Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">{proposal.judul}</h1>
              <CategoryBadge code={proposal.kategori} />
            </div>
            <p className="text-sm text-slate-500 font-mono">{proposal.id} · diajukan oleh {pengaju?.nama}</p>
          </div>
        </div>
        <StageBadge stageKey={proposal.stage} />
      </div>

      {/* Approval Action Bar */}
      {canAct && (
        <Card className="border-emerald-300 bg-emerald-50/40">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center"><AlertCircle className="w-5 h-5 text-emerald-700" /></div>
              <div>
                <div className="font-semibold text-emerald-900">Aksi Anda Diperlukan</div>
                <div className="text-xs text-emerald-700">{stage.label} — sebagai {ROLE_META[user.role]?.label}</div>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {/* STAGE-SPECIFIC ACTIONS */}
              {proposal.stage === 'submitted' && (
                <>
                  <Button icon={CheckCircle2} onClick={() => setShowApprove(true)}>Setujui &amp; Teruskan ke Deputi</Button>
                  <Button variant="secondary" onClick={() => handlePostpone('Ditunda Kadiv')}>Tunda</Button>
                  <Button variant="danger" onClick={() => setShowReject(true)}>Tolak</Button>
                </>
              )}
              {proposal.stage === 'approved_kadiv' && (
                <>
                  <Button icon={CheckCircle2} onClick={() => setShowApprove(true)}>Setujui &amp; Teruskan ke PSDM</Button>
                  <Button variant="secondary" onClick={() => handlePostpone('Ditunda Deputi')}>Tunda</Button>
                  <Button variant="danger" onClick={() => setShowReject(true)}>Tolak</Button>
                </>
              )}
              {proposal.stage === 'approved_deputi' && (
                <>
                  <Button icon={ClipboardList} onClick={() => setShowAnalyze(true)}>Mulai Analisa PSDM</Button>
                </>
              )}
              {proposal.stage === 'analyzing_psdm' && (
                <>
                  <Button icon={ClipboardList} onClick={() => setShowAnalyze(true)}>Lengkapi Analisa</Button>
                </>
              )}
              {proposal.stage === 'approved_psdm' && (
                <>
                  <Button icon={FileSignature} onClick={() => setShowST(true)}>Terbitkan ST &amp; Lanjutkan</Button>
                  <Button variant="danger" onClick={() => setShowReject(true)}>Tolak</Button>
                </>
              )}
              {proposal.stage === 'st_issued' && (
                <Button icon={BookMarked} onClick={() => advance('registered', 'Pegawai didaftarkan ke penyelenggara')}>Tandai Terdaftar</Button>
              )}
              {proposal.stage === 'registered' && (
                <Button icon={Clock} onClick={() => advance('in_progress', 'Pelatihan dimulai')}>Tandai Pelatihan Berlangsung</Button>
              )}
              {proposal.stage === 'in_progress' && user.role === ROLES.PEGAWAI && (
                <Button icon={CheckCircle2} onClick={() => advance('paid', 'Pelatihan selesai, menunggu pembayaran')}>Tandai Selesai (Lanjut Pembayaran)</Button>
              )}
              {proposal.stage === 'paid' && (
                <Button icon={DollarSign} onClick={() => advance('reported', 'Pembayaran diproses, menunggu laporan')}>Tandai Pembayaran Selesai</Button>
              )}
              {proposal.stage === 'reported' && user.role === ROLES.PEGAWAI && (
                <Button icon={FileText} onClick={onBack}>Buat Laporan (menu Laporan &amp; Evaluasi)</Button>
              )}
              {proposal.stage === 'evaluated' && user.role === ROLES.PEGAWAI && (
                <Button icon={Brain} onClick={() => advance('completed', 'Sharing knowledge ke CoP & upload Knowledge Asset')}>Selesaikan via Sharing KM</Button>
              )}
            </div>
          </div>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* MAIN */}
        <div className="lg:col-span-2 space-y-5">
          <Card title="Identitas Program">
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <div className="text-slate-500">Penyelenggara</div><div className="text-slate-900">{proposal.penyelenggara}</div>
              <div className="text-slate-500">Tanggal</div><div className="text-slate-900">{fmtDate(proposal.tanggalMulai)} — {fmtDate(proposal.tanggalSelesai)}</div>
              <div className="text-slate-500">Durasi</div><div className="text-slate-900">{proposal.durasiHari} hari</div>
              <div className="text-slate-500">Lokasi</div><div className="text-slate-900">{proposal.lokasi}</div>
            </div>
          </Card>

          <Card title="Peserta">
            <div className="space-y-2">
              {proposal.peserta?.map(p => (
                <div key={p.id} className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-xs font-semibold">
                    {p.nama.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <div className="font-medium text-sm text-slate-900">{p.nama}</div>
                    <div className="text-xs text-slate-500">{p.jabatan}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Manfaat Program">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Bagi BPKH</div>
                <div className="text-slate-800 whitespace-pre-line">{proposal.manfaatBPKH || '-'}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Bagi Pegawai</div>
                <div className="text-slate-800 whitespace-pre-line">{proposal.manfaatPegawai || '-'}</div>
              </div>
            </div>
          </Card>

          <Card title="Rencana Tindak Lanjut (RTL)">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-slate-500 uppercase">
                  <tr><th className="text-left py-2">Kegiatan</th><th className="text-left py-2">Waktu</th><th className="text-left py-2">Hasil Diharapkan</th></tr>
                </thead>
                <tbody>
                  {proposal.rtl?.map((r, i) => (
                    <tr key={i} className="border-t border-slate-100">
                      <td className="py-2">{r.kegiatan || '-'}</td>
                      <td className="py-2 text-slate-600">{r.waktu || '-'}</td>
                      <td className="py-2 text-slate-600">{r.hasil || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card title="Perkiraan Biaya">
            <div className="space-y-1.5 text-sm">
              <BiayaSummaryRow label="Tuition Fee" value={proposal.biayaTuition} />
              <BiayaSummaryRow label="Tiket" value={proposal.biayaTiket} />
              <BiayaSummaryRow label="Penginapan" value={proposal.biayaPenginapan} />
              <BiayaSummaryRow label="Taksi" value={proposal.biayaTaksi} />
              <BiayaSummaryRow label="Uang Saku" value={proposal.biayaUangSaku} />
              <div className="flex justify-between pt-2 border-t border-slate-200 font-semibold">
                <div>Total</div>
                <div className="text-emerald-700">{fmtIDR(proposal.totalBiaya)}</div>
              </div>
            </div>
          </Card>

          {proposal.analisaPSDM && (
            <Card title="Analisa Pelaksana PSDM" className="border-teal-300">
              <div className="space-y-3 text-sm">
                <div className="text-xs text-slate-500">Dianalisa oleh {employees.find(e => e.id === proposal.analisaPSDM.by)?.nama || '-'} · {fmtDateTime(proposal.analisaPSDM.at)}</div>
                <div className="grid grid-cols-2 gap-3">
                  {APPROVAL_CRITERIA.map(c => {
                    const score = proposal.analisaPSDM.criteria?.[c.key] || 0;
                    return (
                      <div key={c.key} className="p-2.5 bg-teal-50 rounded-lg border border-teal-200">
                        <div className="text-xs text-teal-800">{c.label}</div>
                        <div className="flex items-center gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map(n => (
                            <div key={n} className={cls('w-5 h-5 rounded text-[10px] font-semibold flex items-center justify-center',
                              n <= score ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-400')}>{n}</div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="p-3 bg-teal-50 rounded-lg border border-teal-200">
                  <div className="text-xs font-semibold text-teal-800 mb-1">Rekomendasi</div>
                  <div className="text-sm text-teal-900">{proposal.analisaPSDM.recommendation}</div>
                </div>
              </div>
            </Card>
          )}

          {proposal.suratTugas && (
            <Card title="Surat Tugas Pelatihan" className="border-emerald-300" action={<Button size="sm" variant="secondary" icon={Printer} onClick={() => window.print()}>Cetak</Button>}>
              <div className="space-y-2 text-sm">
                <div className="text-xs text-slate-500">No. ST: <span className="font-mono text-slate-900">{proposal.suratTugas.nomor}</span></div>
                <div className="text-xs text-slate-500">Terbit: {fmtDate(proposal.suratTugas.tanggal)}</div>
                <div className="text-xs text-slate-500">Ditandatangani: {employees.find(e => e.id === proposal.suratTugas.signedBy)?.nama || '-'}</div>
                <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-900 whitespace-pre-line">{proposal.suratTugas.isi}</div>
              </div>
            </Card>
          )}
        </div>

        {/* TIMELINE */}
        <div className="space-y-5">
          <Card title="Timeline Approval 10-Tahap" padded={false}>
            <div className="p-4">
              <ApprovalTimeline proposal={proposal} employees={employees} />
            </div>
          </Card>

          <Card title="Riwayat Aksi">
            <div className="space-y-3">
              {(proposal.history || []).slice().reverse().map((h, i) => {
                const actor = employees.find(e => e.id === h.by);
                return (
                  <div key={i} className="flex gap-3">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <div className="text-xs">
                      <div className="font-medium text-slate-800">{stageByKey(h.stage).label}</div>
                      <div className="text-slate-500">{actor?.nama || 'Sistem'} · {h.at}</div>
                      {h.note && <div className="text-slate-600 italic mt-0.5">"{h.note}"</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* MODALS */}
      <ApprovalModal open={showApprove} onClose={() => setShowApprove(false)} onConfirm={handleApprove}
        title="Setujui Pengajuan" confirmLabel="Setujui" variant="primary" />
      <ApprovalModal open={showReject} onClose={() => setShowReject(false)} onConfirm={handleReject}
        title="Tolak Pengajuan" confirmLabel="Tolak" variant="danger" requireNote />
      {showAnalyze && <AnalisaModal proposal={proposal} onClose={() => setShowAnalyze(false)} onSubmit={handleAnalyze} />}
      {showST && <SuratTugasModal proposal={proposal} user={user} onClose={() => setShowST(false)} onIssue={(st) => {
        const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
        setProposals(prev => prev.map(p => p.id === proposal.id
          ? { ...p, stage: 'st_issued', suratTugas: st, history: [...(p.history || []), { stage: 'st_issued', by: user.id, at: now, note: `ST diterbitkan: ${st.nomor}` }] }
          : p));
        setShowST(false);
      }} />}
    </div>
  );
}

function BiayaSummaryRow({ label, value }) {
  return (
    <div className="flex justify-between">
      <div className="text-slate-600">{label}</div>
      <div className="text-slate-900">{fmtIDR(value)}</div>
    </div>
  );
}

function ApprovalTimeline({ proposal, employees }) {
  const positiveStages = STAGES.filter(s => s.order >= 0);
  const currentStage = stageByKey(proposal.stage);
  const isTerminated = ['rejected', 'postponed'].includes(proposal.stage);

  return (
    <div className="space-y-1">
      {positiveStages.map(s => {
        const done = !isTerminated && currentStage.order >= s.order;
        const current = currentStage.order === s.order;
        const Icon = s.icon;
        return (
          <div key={s.key} className="flex items-start gap-2.5">
            <div className={cls('w-6 h-6 rounded-full flex items-center justify-center shrink-0',
              done && !current ? 'bg-emerald-600 text-white' :
              current ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500' :
              'bg-slate-100 text-slate-400')}>
              <Icon className="w-3 h-3" />
            </div>
            <div className="flex-1 min-w-0 -mt-0.5 pb-2">
              <div className={cls('text-xs font-medium', current ? 'text-emerald-700' : done ? 'text-slate-800' : 'text-slate-400')}>{s.label}</div>
              <div className="text-[10px] text-slate-400">{ROLE_META[s.actor]?.label || '-'}</div>
            </div>
          </div>
        );
      })}
      {isTerminated && (
        <div className="mt-2 p-2 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
          Pengajuan {proposal.stage === 'rejected' ? 'ditolak' : 'ditunda'}.
        </div>
      )}
    </div>
  );
}

function ApprovalModal({ open, onClose, onConfirm, title, confirmLabel, variant, requireNote }) {
  const [note, setNote] = useState('');
  useEffect(() => { if (open) setNote(''); }, [open]);
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Batal</Button>
          <Button variant={variant === 'danger' ? 'danger' : 'primary'} onClick={() => onConfirm(note)} disabled={requireNote && !note.trim()}>{confirmLabel}</Button>
        </>
      }>
      <Textarea label={requireNote ? 'Alasan (wajib)' : 'Catatan (opsional)'} rows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Catatan untuk diteruskan..." />
    </Modal>
  );
}

function AnalisaModal({ proposal, onClose, onSubmit }) {
  const [criteria, setCriteria] = useState(() => {
    const init = {};
    APPROVAL_CRITERIA.forEach(c => { init[c.key] = 0; });
    return init;
  });
  const [recommendation, setRecommendation] = useState('Direkomendasikan untuk disetujui');
  const set = (k, v) => setCriteria(c => ({ ...c, [k]: v }));
  const avg = (Object.values(criteria).reduce((s, v) => s + v, 0) / APPROVAL_CRITERIA.length).toFixed(1);
  const valid = Object.values(criteria).every(v => v > 0);

  return (
    <Modal open={true} onClose={onClose} title="Analisa Pengajuan (Pelaksana PSDM)" size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Batal</Button>
          <Button onClick={() => onSubmit(criteria, recommendation)} disabled={!valid}>Submit Analisa &amp; Teruskan ke Kadiv PSDM</Button>
        </>
      }>
      <div className="space-y-4">
        <div className="text-sm text-slate-600">
          Nilai 4 kriteria berikut untuk pengajuan <span className="font-semibold text-slate-900">{proposal.judul}</span>. Skor 1 (kurang) — 5 (istimewa).
        </div>
        <div className="space-y-3">
          {APPROVAL_CRITERIA.map(c => (
            <div key={c.key} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-sm font-medium text-slate-800 mb-2">{c.label}</div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => set(c.key, n)}
                    className={cls('w-10 h-10 rounded-lg text-sm font-semibold transition-colors',
                      criteria[c.key] === n ? 'bg-emerald-600 text-white shadow' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100')}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
          <div className="text-sm font-medium text-emerald-900">Rata-rata Skor Penilaian</div>
          <div className="text-2xl font-bold text-emerald-700">{avg}</div>
        </div>
        <Textarea label="Rekomendasi" rows={3} value={recommendation} onChange={(e) => setRecommendation(e.target.value)} />
      </div>
    </Modal>
  );
}

function SuratTugasModal({ proposal, user, onClose, onIssue }) {
  const year = new Date().getFullYear();
  const seq = String(Math.floor(Math.random() * 9000) + 1000);
  const [nomor, setNomor] = useState(`ST-${seq}/PSDM/BPKH/${String(new Date().getMonth() + 1).padStart(2, '0')}/${year}`);
  const isi = `Berdasarkan persetujuan pengajuan ${proposal.id}, dengan ini ditugaskan:

Nama   : ${proposal.peserta.map(p => p.nama).join(', ')}
Jabatan: ${proposal.peserta.map(p => p.jabatan).join(', ')}

Untuk mengikuti:
${proposal.judul}
Penyelenggara: ${proposal.penyelenggara}
Tanggal      : ${fmtDate(proposal.tanggalMulai)} — ${fmtDate(proposal.tanggalSelesai)} (${proposal.durasiHari} hari)
Lokasi       : ${proposal.lokasi}

Biaya sebesar ${fmtIDR(proposal.totalBiaya)} dibebankan pada anggaran BPKH TA ${year}.

Demikian Surat Tugas ini diterbitkan untuk dilaksanakan.`;

  return (
    <Modal open={true} onClose={onClose} title="Terbitkan Surat Tugas Pelatihan" size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Batal</Button>
          <Button icon={FileSignature} onClick={() => onIssue({ nomor, tanggal: new Date().toISOString().slice(0, 10), signedBy: user.id, isi })}>Terbitkan ST</Button>
        </>
      }>
      <div className="space-y-3">
        <Input label="Nomor ST" value={nomor} onChange={(e) => setNomor(e.target.value)} />
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Isi Surat Tugas</label>
          <pre className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono whitespace-pre-wrap text-slate-800">{isi}</pre>
        </div>
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
          ST akan ditandatangani oleh <span className="font-semibold">{user.nama}</span> ({ROLE_META[user.role]?.label}). Setelah diterbitkan, pengajuan otomatis berlanjut ke tahap pendaftaran.
        </div>
      </div>
    </Modal>
  );
}

// =====================================================================
// VIEW — SURAT TUGAS DIRECTORY
// =====================================================================

function SuratTugasView({ user, employees, proposals }) {
  const withST = proposals.filter(p => p.suratTugas);
  const mine = withST.filter(p => p.peserta?.some(x => x.id === user.id));
  const isPSDMSide = [ROLES.PELAKSANA_PSDM, ROLES.KADIV_PSDM, ROLES.ADMIN].includes(user.role);
  const list = isPSDMSide ? withST : mine;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Surat Tugas Pelatihan</h1>
        <p className="text-sm text-slate-500 mt-1">{list.length} ST terbit · {isPSDMSide ? 'semua pegawai' : 'milik Anda'}</p>
      </div>
      <Card padded={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">No. ST</th>
                <th className="text-left px-4 py-3">Pelatihan</th>
                <th className="text-left px-4 py-3">Peserta</th>
                <th className="text-left px-4 py-3">Tanggal Pelatihan</th>
                <th className="text-left px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {list.map(p => (
                <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-mono text-xs">{p.suratTugas.nomor}</td>
                  <td className="px-4 py-3">{p.judul}</td>
                  <td className="px-4 py-3 text-slate-700">{p.peserta?.map(x => x.nama).join(', ')}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{fmtDate(p.tanggalMulai)} — {fmtDate(p.tanggalSelesai)}</td>
                  <td className="px-4 py-3"><StageBadge stageKey={p.stage} /></td>
                </tr>
              ))}
              {list.length === 0 && <tr><td colSpan={5}><EmptyState icon={FileSignature} title="Belum ada Surat Tugas" /></td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// =====================================================================
// VIEW — LAPORAN PELAKSANAAN & EVALUASI LEVEL 3
// =====================================================================

function LaporanView({ user, employees, proposals, setProposals, reports, setReports, evaluations, setEvaluations }) {
  const [tab, setTab] = useState('pending');
  const [editingReport, setEditingReport] = useState(null);
  const [editingEval, setEditingEval] = useState(null);

  const mine = proposals.filter(p => p.peserta?.some(x => x.id === user.id));
  const needsReport = mine.filter(p => p.stage === 'reported');
  const reported = proposals.filter(p => reports.some(r => r.proposalId === p.id));
  const needsEval = proposals.filter(p => p.stage === 'reported' || p.stage === 'evaluated');
  const isApprover = [ROLES.KADIV, ROLES.DEPUTI, ROLES.KADIV_PSDM].includes(user.role);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Laporan &amp; Evaluasi Pelatihan</h1>
        <p className="text-sm text-slate-500 mt-1">Laporan pelaksanaan (oleh peserta) &amp; Evaluasi Level 3 (oleh atasan langsung)</p>
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        {[
          { v: 'pending', label: `Perlu Laporan (${needsReport.length})` },
          { v: 'reports', label: 'Laporan Tersusun' },
          ...(isApprover ? [{ v: 'eval', label: 'Evaluasi Level 3' }] : []),
        ].map(t => (
          <button key={t.v} onClick={() => setTab(t.v)}
            className={cls('px-4 py-2 text-sm font-medium border-b-2 -mb-px',
              tab === t.v ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700')}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'pending' && (
        <Card padded={false}>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
              <tr><th className="text-left px-4 py-3">Pelatihan</th><th className="text-left px-4 py-3">Tanggal</th><th className="text-right px-4 py-3">Aksi</th></tr>
            </thead>
            <tbody>
              {needsReport.map(p => (
                <tr key={p.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{p.judul}</div>
                    <div className="text-xs text-slate-500 font-mono">{p.id}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{fmtDate(p.tanggalMulai)} — {fmtDate(p.tanggalSelesai)}</td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" icon={FileText} onClick={() => setEditingReport(p)}>Buat Laporan</Button>
                  </td>
                </tr>
              ))}
              {needsReport.length === 0 && <tr><td colSpan={3}><EmptyState icon={CheckCircle2} title="Semua laporan tertangani" /></td></tr>}
            </tbody>
          </table>
        </Card>
      )}

      {tab === 'reports' && (
        <Card padded={false}>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">Pelatihan</th>
                <th className="text-left px-4 py-3">Peserta</th>
                <th className="text-left px-4 py-3">Tanggal Laporan</th>
                <th className="text-left px-4 py-3">Avg Kepuasan</th>
                <th className="text-left px-4 py-3">Avg Pemahaman</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(r => {
                const p = proposals.find(x => x.id === r.proposalId);
                return (
                  <tr key={r.id} className="border-t border-slate-100">
                    <td className="px-4 py-3">{p?.judul || '-'}</td>
                    <td className="px-4 py-3">{p?.peserta?.map(x => x.nama).join(', ')}</td>
                    <td className="px-4 py-3 text-xs">{fmtDate(r.tanggal)}</td>
                    <td className="px-4 py-3 font-medium">{r.avgKepuasan?.toFixed(1) || '-'}</td>
                    <td className="px-4 py-3 font-medium">{r.avgPemahaman?.toFixed(1) || '-'}</td>
                  </tr>
                );
              })}
              {reports.length === 0 && <tr><td colSpan={5}><EmptyState title="Belum ada laporan tersusun" /></td></tr>}
            </tbody>
          </table>
        </Card>
      )}

      {tab === 'eval' && (
        <Card padded={false}>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
              <tr><th className="text-left px-4 py-3">Pegawai</th><th className="text-left px-4 py-3">Pelatihan</th><th className="text-left px-4 py-3">Status Eval</th><th className="text-right px-4 py-3">Aksi</th></tr>
            </thead>
            <tbody>
              {needsEval.map(p => {
                const ev = evaluations.find(e => e.proposalId === p.id);
                return (
                  <tr key={p.id} className="border-t border-slate-100">
                    <td className="px-4 py-3">{p.peserta?.map(x => x.nama).join(', ')}</td>
                    <td className="px-4 py-3">{p.judul}</td>
                    <td className="px-4 py-3">{ev ? <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Sudah dievaluasi</Badge> : <Badge className="bg-amber-50 text-amber-700 border-amber-200">Belum dievaluasi</Badge>}</td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" icon={Award} onClick={() => setEditingEval(p)}>{ev ? 'Lihat / Ubah' : 'Isi Evaluasi'}</Button>
                    </td>
                  </tr>
                );
              })}
              {needsEval.length === 0 && <tr><td colSpan={4}><EmptyState title="Tidak ada pegawai yang perlu dievaluasi" /></td></tr>}
            </tbody>
          </table>
        </Card>
      )}

      {editingReport && <LaporanForm user={user} proposal={editingReport} onClose={() => setEditingReport(null)} onSubmit={(r) => {
        setReports([...reports, { ...r, id: uid('R'), proposalId: editingReport.id, by: user.id, tanggal: new Date().toISOString().slice(0, 10) }]);
        // advance stage
        const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
        setProposals(prev => prev.map(p => p.id === editingReport.id
          ? { ...p, history: [...(p.history || []), { stage: 'reported', by: user.id, at: now, note: 'Laporan & RTL diserahkan; materi diunggah ke KM; sertifikat ke profil pegawai' }] }
          : p));
        setEditingReport(null);
      }} />}

      {editingEval && <EvaluasiLevel3Form user={user} proposal={editingEval} existing={evaluations.find(e => e.proposalId === editingEval.id)} onClose={() => setEditingEval(null)} onSubmit={(ev) => {
        const exists = evaluations.find(e => e.proposalId === editingEval.id);
        const data = { ...ev, id: exists?.id || uid('EV'), proposalId: editingEval.id, by: user.id, tanggal: new Date().toISOString().slice(0, 10) };
        setEvaluations(exists ? evaluations.map(e => e.proposalId === editingEval.id ? data : e) : [...evaluations, data]);
        const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
        setProposals(prev => prev.map(p => p.id === editingEval.id
          ? { ...p, stage: 'evaluated', history: [...(p.history || []), { stage: 'evaluated', by: user.id, at: now, note: 'Evaluasi Level 3 selesai' }] }
          : p));
        setEditingEval(null);
      }} />}
    </div>
  );
}

function LaporanForm({ user, proposal, onClose, onSubmit }) {
  const ASPEK_KEPUASAN = [
    'Mutu Materi Pelatihan',
    'Instruktur dalam Menyampaikan Materi',
    'Instruktur dalam Menjawab Pertanyaan',
    'Manfaat bagi Peningkatan Ketrampilan',
    'Fasilitas Training',
  ];
  const ASPEK_PEMAHAMAN = [
    'Pemahaman Keseluruhan Materi',
    'Pemahaman Poin-poin Utama',
    'Pemahaman Manfaat Materi',
    'Pemahaman Penerapan ke Pekerjaan',
    'Pemahaman Penyampaian ke Rekan',
  ];

  const [data, setData] = useState({
    latarBelakang: '', dasarHukum: '', tujuanPelatihan: '', resumeMateri: '',
    dokumentasi: '', sertifikat: '',
    kepuasan: ASPEK_KEPUASAN.map(() => 3),
    pemahaman: ASPEK_PEMAHAMAN.map(() => 3),
    rtl: [{ rencana: '', tujuan: '', waktu: '', pic: '' }],
    tanggapan: '',
    materiUpload: '', sertifikatUpload: '',
  });
  const set = (k, v) => setData(d => ({ ...d, [k]: v }));
  const setScore = (group, idx, val) => setData(d => ({ ...d, [group]: d[group].map((s, i) => i === idx ? val : s) }));
  const setRTL = (i, k, v) => setData(d => ({ ...d, rtl: d.rtl.map((r, ix) => ix === i ? { ...r, [k]: v } : r) }));

  const avgKep = data.kepuasan.reduce((a, b) => a + b, 0) / data.kepuasan.length;
  const avgPem = data.pemahaman.reduce((a, b) => a + b, 0) / data.pemahaman.length;

  return (
    <Modal open={true} onClose={onClose} title={`Laporan Pelaksanaan: ${proposal.judul}`} size="xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Batal</Button>
          <Button icon={Save} onClick={() => onSubmit({ ...data, avgKepuasan: avgKep, avgPemahaman: avgPem })}>Simpan &amp; Submit Laporan</Button>
        </>
      }>
      <div className="space-y-5">
        <section>
          <h4 className="font-semibold text-slate-900 mb-2">A. Pendahuluan</h4>
          <div className="grid md:grid-cols-2 gap-3">
            <Textarea label="Latar Belakang" rows={3} value={data.latarBelakang} onChange={(e) => set('latarBelakang', e.target.value)} />
            <Textarea label="Dasar Hukum / Referensi" rows={3} value={data.dasarHukum} onChange={(e) => set('dasarHukum', e.target.value)} />
          </div>
        </section>

        <section>
          <h4 className="font-semibold text-slate-900 mb-2">B. Substansi Pelatihan</h4>
          <div className="space-y-3">
            <Textarea label="Tujuan Pelatihan" rows={3} value={data.tujuanPelatihan} onChange={(e) => set('tujuanPelatihan', e.target.value)} />
            <Textarea label="Resume Materi Pelatihan" rows={4} value={data.resumeMateri} onChange={(e) => set('resumeMateri', e.target.value)} />
          </div>
        </section>

        <section>
          <h4 className="font-semibold text-slate-900 mb-2">C. Upload (Closed-Loop ke KM)</h4>
          <div className="grid md:grid-cols-2 gap-3">
            <Input label="URL Materi (Upload ke Knowledge Asset)" value={data.materiUpload} onChange={(e) => set('materiUpload', e.target.value)} placeholder="https://..." hint="Wajib — materi otomatis ter-link ke Knowledge Asset" />
            <Input label="URL Sertifikat (Ter-link ke profil pegawai)" value={data.sertifikatUpload} onChange={(e) => set('sertifikatUpload', e.target.value)} placeholder="https://..." hint="Sertifikat tersimpan di database pegawai" />
          </div>
        </section>

        <section>
          <h4 className="font-semibold text-slate-900 mb-2">D. Evaluasi Level 1 — Kepuasan Peserta</h4>
          <table className="w-full text-sm">
            <thead className="text-xs text-slate-500 uppercase">
              <tr><th className="text-left py-2">Aspek</th><th className="text-center py-2">Skor (1-5)</th></tr>
            </thead>
            <tbody>
              {ASPEK_KEPUASAN.map((a, i) => (
                <tr key={i} className="border-t border-slate-100">
                  <td className="py-2 text-sm">{a}</td>
                  <td className="py-2">
                    <div className="flex gap-1 justify-center">
                      {[1, 2, 3, 4, 5].map(n => (
                        <button key={n} onClick={() => setScore('kepuasan', i, n)}
                          className={cls('w-7 h-7 rounded text-xs font-semibold',
                            data.kepuasan[i] === n ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>
                          {n}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
              <tr className="border-t border-slate-200 font-semibold">
                <td className="py-2">Rata-rata</td>
                <td className="py-2 text-center text-emerald-700">{avgKep.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h4 className="font-semibold text-slate-900 mb-2">E. Evaluasi Level 2 — Pemahaman Materi</h4>
          <table className="w-full text-sm">
            <thead className="text-xs text-slate-500 uppercase">
              <tr><th className="text-left py-2">Aspek</th><th className="text-center py-2">Skor (1-5)</th></tr>
            </thead>
            <tbody>
              {ASPEK_PEMAHAMAN.map((a, i) => (
                <tr key={i} className="border-t border-slate-100">
                  <td className="py-2 text-sm">{a}</td>
                  <td className="py-2">
                    <div className="flex gap-1 justify-center">
                      {[1, 2, 3, 4, 5].map(n => (
                        <button key={n} onClick={() => setScore('pemahaman', i, n)}
                          className={cls('w-7 h-7 rounded text-xs font-semibold',
                            data.pemahaman[i] === n ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>
                          {n}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
              <tr className="border-t border-slate-200 font-semibold">
                <td className="py-2">Rata-rata</td>
                <td className="py-2 text-center text-emerald-700">{avgPem.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h4 className="font-semibold text-slate-900 mb-2">F. Rencana Tindaklanjut (basis Evaluasi Level 3)</h4>
          <div className="space-y-2">
            {data.rtl.map((r, i) => (
              <div key={i} className="grid grid-cols-12 gap-2">
                <Input className="col-span-4" placeholder="Rencana Kerja" value={r.rencana} onChange={(e) => setRTL(i, 'rencana', e.target.value)} />
                <Input className="col-span-3" placeholder="Tujuan" value={r.tujuan} onChange={(e) => setRTL(i, 'tujuan', e.target.value)} />
                <Input className="col-span-3" placeholder="Waktu" value={r.waktu} onChange={(e) => setRTL(i, 'waktu', e.target.value)} />
                <Input className="col-span-2" placeholder="PIC" value={r.pic} onChange={(e) => setRTL(i, 'pic', e.target.value)} />
              </div>
            ))}
            <Button size="sm" variant="secondary" icon={Plus} onClick={() => set('rtl', [...data.rtl, { rencana: '', tujuan: '', waktu: '', pic: '' }])}>Tambah RTL</Button>
          </div>
        </section>

        <section>
          <Textarea label="G. Tanggapan & Rekomendasi Selanjutnya" rows={3} value={data.tanggapan} onChange={(e) => set('tanggapan', e.target.value)} />
        </section>
      </div>
    </Modal>
  );
}

function EvaluasiLevel3Form({ user, proposal, existing, onClose, onSubmit }) {
  const KRITERIA = [
    { group: 'Pembelajaran', items: [
      'Peserta memiliki keterampilan & pengetahuan lebih tinggi daripada sebelumnya',
      'Peserta menghasilkan ide, pendekatan, atau solusi baru',
      'Peserta mampu menghasilkan performa kerja sesuai target',
    ]},
    { group: 'Perilaku', items: [
      'Peserta berperilaku berbeda di pekerjaan setelah pelatihan',
      'Peserta menggunakan keterampilan & pengetahuan dari pelatihan',
      'Peserta dapat dijadikan Role Model',
    ]},
    { group: 'Hasil', items: [
      'Knowledge sharing kepada rekan kerja',
      'Meningkatkan kinerja tim',
      'Melakukan perbaikan berkesinambungan di proses kerja',
    ]},
  ];
  const init = existing || {
    scores: KRITERIA.flatMap(g => g.items.map(() => 3)),
    implementasi: [{ rencana: '', tujuan: '', tindakan: '', hasil: '' }],
    stop: '', start: '', continueText: '',
  };
  const [data, setData] = useState(init);
  const setScore = (idx, val) => setData(d => ({ ...d, scores: d.scores.map((s, i) => i === idx ? val : s) }));
  const setImpl = (i, k, v) => setData(d => ({ ...d, implementasi: d.implementasi.map((r, ix) => ix === i ? { ...r, [k]: v } : r) }));
  const avg = (data.scores.reduce((a, b) => a + b, 0) / data.scores.length).toFixed(2);

  let runningIdx = -1;
  return (
    <Modal open={true} onClose={onClose} title="Formulir Evaluasi Pelatihan Level 3" size="xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Batal</Button>
          <Button icon={Save} onClick={() => onSubmit({ ...data, avg: Number(avg) })}>Simpan Evaluasi</Button>
        </>
      }>
      <div className="space-y-5">
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm">
          <div><span className="text-slate-500">Nama Peserta:</span> <span className="font-medium">{proposal.peserta?.map(p => p.nama).join(', ')}</span></div>
          <div><span className="text-slate-500">Pelatihan:</span> <span className="font-medium">{proposal.judul}</span></div>
          <div><span className="text-slate-500">Penyelenggara:</span> {proposal.penyelenggara}</div>
        </div>

        <section>
          <h4 className="font-semibold text-slate-900 mb-2">Kriteria Evaluasi</h4>
          <p className="text-xs text-slate-500 mb-3">Skor: 1 (Kurang) · 2 (Cukup) · 3 (Baik) · 4 (Baik Sekali) · 5 (Istimewa)</p>
          {KRITERIA.map((g, gi) => (
            <div key={gi} className="mb-4">
              <div className="text-sm font-semibold text-emerald-800 mb-2">{gi + 1}. {g.group}</div>
              <div className="space-y-1.5">
                {g.items.map((item) => {
                  runningIdx++;
                  const idx = runningIdx;
                  return (
                    <div key={idx} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg">
                      <div className="flex-1 text-sm text-slate-700">{item}</div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(n => (
                          <button key={n} onClick={() => setScore(idx, n)}
                            className={cls('w-7 h-7 rounded text-xs font-semibold',
                              data.scores[idx] === n ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>{n}</button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <div className="text-sm font-medium text-emerald-900">Rata-rata Skor Evaluasi Level 3</div>
            <div className="text-2xl font-bold text-emerald-700">{avg}</div>
          </div>
        </section>

        <section>
          <h4 className="font-semibold text-slate-900 mb-2">Evaluasi Rencana Implementasi Hasil Pelatihan</h4>
          <div className="space-y-2">
            {data.implementasi.map((r, i) => (
              <div key={i} className="grid grid-cols-12 gap-2">
                <Input className="col-span-3" placeholder="Rencana Kerja" value={r.rencana} onChange={(e) => setImpl(i, 'rencana', e.target.value)} />
                <Input className="col-span-3" placeholder="Tujuan" value={r.tujuan} onChange={(e) => setImpl(i, 'tujuan', e.target.value)} />
                <Input className="col-span-3" placeholder="Hasil & Rencana Tindakan" value={r.tindakan} onChange={(e) => setImpl(i, 'tindakan', e.target.value)} />
                <Input className="col-span-3" placeholder="Hasil yang Diharapkan" value={r.hasil} onChange={(e) => setImpl(i, 'hasil', e.target.value)} />
              </div>
            ))}
            <Button size="sm" variant="secondary" icon={Plus} onClick={() => setData(d => ({ ...d, implementasi: [...d.implementasi, { rencana: '', tujuan: '', tindakan: '', hasil: '' }] }))}>Tambah Baris</Button>
          </div>
        </section>

        <section>
          <h4 className="font-semibold text-slate-900 mb-2">Start–Stop–Continue Plan</h4>
          <div className="grid md:grid-cols-3 gap-3">
            <Textarea label="STOP" rows={3} value={data.stop} onChange={(e) => setData(d => ({ ...d, stop: e.target.value }))} placeholder="Hal yang perlu dihentikan" />
            <Textarea label="START" rows={3} value={data.start} onChange={(e) => setData(d => ({ ...d, start: e.target.value }))} placeholder="Hal yang mulai dilakukan" />
            <Textarea label="CONTINUE" rows={3} value={data.continueText} onChange={(e) => setData(d => ({ ...d, continueText: e.target.value }))} placeholder="Hal yang perlu dilanjutkan" />
          </div>
        </section>
      </div>
    </Modal>
  );
}

// =====================================================================
// VIEW — KNOWLEDGE MANAGEMENT (4 Pilar)
// =====================================================================

function KMView({ user, employees, sme, setSme, knowledgeAssets, setKnowledgeAssets, cop, setCop, proposals }) {
  const [pilar, setPilar] = useState('sme');

  const completedTrainings = proposals.filter(p => p.stage === 'completed' || p.stage === 'evaluated');

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Knowledge Management</h1>
        <p className="text-sm text-slate-500 mt-1">4 pilar sesuai Prosedur Tetap Manajemen Pengetahuan BPKH</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { key: 'sme',   label: 'SME Directory',     icon: Users,        color: 'from-blue-500 to-indigo-600',     count: sme.length,           desc: 'Subject Matter Experts' },
          { key: 'kmap',  label: 'Knowledge Map',     icon: Network,      color: 'from-emerald-500 to-teal-600',    count: Object.keys(CATEGORIES).length, desc: 'Pemetaan & gap analysis' },
          { key: 'cop',   label: 'Community of Practice', icon: MessageSquare, color: 'from-purple-500 to-fuchsia-600', count: cop.length,        desc: 'Komunitas praktik' },
          { key: 'asset', label: 'Knowledge Asset',   icon: Database,     color: 'from-amber-500 to-orange-600',    count: knowledgeAssets.length, desc: 'Aset pengetahuan' },
        ].map(p => (
          <button key={p.key} onClick={() => setPilar(p.key)}
            className={cls('p-4 rounded-xl border text-left transition-all',
              pilar === p.key ? 'border-emerald-500 bg-emerald-50 shadow' : 'border-slate-200 bg-white hover:border-emerald-300 hover:shadow-sm')}>
            <div className={cls('w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center mb-3', p.color)}>
              <p.icon className="w-5 h-5 text-white" />
            </div>
            <div className="font-semibold text-slate-900">{p.label}</div>
            <div className="text-xs text-slate-500 mt-0.5">{p.desc}</div>
            <div className="text-2xl font-bold text-slate-900 mt-2">{p.count}</div>
          </button>
        ))}
      </div>

      {pilar === 'sme' && (
        <Card title="Subject Matter Expert (SME) Directory" subtitle="Pegawai dengan keahlian terverifikasi">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-slate-500 uppercase">
                <tr><th className="text-left py-2">Nama</th><th className="text-left py-2">Bidang</th><th className="text-left py-2">Level</th><th className="text-left py-2">Sertifikasi</th><th className="text-left py-2">Sponsor</th></tr>
              </thead>
              <tbody>
                {sme.map(s => {
                  const emp = employees.find(e => e.id === s.employeeId);
                  const sp = employees.find(e => e.id === s.sponsor);
                  return (
                    <tr key={s.id} className="border-t border-slate-100">
                      <td className="py-2.5">
                        <div className="font-medium text-slate-900">{emp?.nama || '-'}</div>
                        <div className="text-xs text-slate-500">{emp?.divisi}</div>
                      </td>
                      <td className="py-2.5">{s.bidang}</td>
                      <td className="py-2.5"><Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">{s.level}</Badge></td>
                      <td className="py-2.5 text-slate-700">{s.sertifikasi}</td>
                      <td className="py-2.5 text-slate-700">{sp?.nama || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {pilar === 'kmap' && (
        <Card title="Knowledge Map BPKH" subtitle="Pemetaan kompetensi per kategori dengan gap analysis sederhana">
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(CATEGORIES).map(([code, cat]) => {
              const trainingCount = completedTrainings.filter(p => p.kategori === code).length;
              const target = code === 'K1' || code === 'K2' ? 20 : code === 'K3' || code === 'K4' ? 15 : 5;
              const gap = Math.max(0, target - trainingCount);
              const fillment = Math.min(100, (trainingCount / target) * 100);
              return (
                <div key={code} className="p-3 border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={cls('w-8 h-8 rounded-md flex items-center justify-center text-white text-xs font-bold', cat.chip)}>{code}</span>
                      <div className="text-sm font-medium text-slate-900">{cat.short}</div>
                    </div>
                    <Badge className={gap > 5 ? 'bg-rose-50 text-rose-700 border-rose-200' : gap > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}>
                      Gap: {gap}
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-500 mb-1">{trainingCount} dari {target} target</div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={cls('h-full', cat.chip)} style={{ width: `${fillment}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {pilar === 'cop' && (
        <Card title="Community of Practice (CoP)" subtitle="Forum diskusi & praktik bidang spesifik">
          <div className="grid md:grid-cols-2 gap-3">
            {cop.map(c => (
              <div key={c.id} className="p-4 border border-slate-200 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-semibold text-slate-900">{c.nama}</div>
                    <div className="text-xs text-slate-500">Sponsor: {employees.find(e => e.id === c.sponsor)?.nama || '-'}</div>
                  </div>
                  <Badge className={c.status === 'aktif' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}>{c.status}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="p-2 bg-slate-50 rounded">
                    <div className="text-xs text-slate-500">Anggota</div>
                    <div className="text-lg font-bold text-slate-900">{c.anggota}</div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded">
                    <div className="text-xs text-slate-500">Engagement</div>
                    <div className="text-lg font-bold text-emerald-700">{c.engagement}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {pilar === 'asset' && (
        <Card title="Knowledge Asset" subtitle="Aset pengetahuan organisasi (pedoman, best practice, lessons learned)"
          action={user.role === ROLES.ADMIN && <Button size="sm" icon={Plus} onClick={() => {
            const judul = prompt('Judul Knowledge Asset?');
            if (judul) setKnowledgeAssets([...knowledgeAssets, { id: uid('KA'), judul, tipe: 'Pedoman', pemilik: user.divisi, tahun: new Date().getFullYear() }]);
          }}>Tambah Asset</Button>}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-slate-500 uppercase">
                <tr><th className="text-left py-2">Judul</th><th className="text-left py-2">Tipe</th><th className="text-left py-2">Pemilik</th><th className="text-left py-2">Tahun</th></tr>
              </thead>
              <tbody>
                {knowledgeAssets.map(a => (
                  <tr key={a.id} className="border-t border-slate-100">
                    <td className="py-2.5 font-medium text-slate-900">{a.judul}</td>
                    <td className="py-2.5"><Badge className="bg-blue-50 text-blue-700 border-blue-200">{a.tipe}</Badge></td>
                    <td className="py-2.5 text-slate-700">{a.pemilik}</td>
                    <td className="py-2.5 text-slate-600">{a.tahun}</td>
                  </tr>
                ))}
                {knowledgeAssets.length === 0 && <tr><td colSpan={4}><EmptyState icon={Database} title="Belum ada Knowledge Asset" /></td></tr>}
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
            <Lightbulb className="w-4 h-4 inline mr-1" />
            Setiap pelatihan yang selesai otomatis menambah Knowledge Asset baru dari materi yang diunggah (closed-loop dari Laporan Pelaksanaan).
          </div>
        </Card>
      )}
    </div>
  );
}

// =====================================================================
// VIEW — TALENT MANAGEMENT (3 Stage)
// =====================================================================

function TMSView({ user, employees, proposals }) {
  const [stage, setStage] = useState('acquisition');

  // 9-Box Mock Data — gunakan distribusi pegawai berdasarkan jumlah pelatihan & 'performance' sederhana
  const trainingCount = (eid) => proposals.filter(p =>
    (p.stage === 'completed' || p.stage === 'evaluated') && p.peserta?.some(x => x.id === eid)
  ).length;

  const gridData = employees.filter(e => e.role === ROLES.PEGAWAI && e.status === 'aktif').map(e => {
    const tc = trainingCount(e.id);
    const perf = Math.min(2, Math.floor(Math.random() * 3));   // mock 0-2
    const pot = Math.min(2, Math.floor(tc / 2) + Math.floor(Math.random() * 2)); // potential
    return { emp: e, performance: perf, potential: pot };
  });

  const boxes = [];
  for (let p = 2; p >= 0; p--) {
    for (let f = 0; f <= 2; f++) {
      boxes.push({ pot: p, perf: f, list: gridData.filter(g => g.potential === p && g.performance === f) });
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Talent Management System</h1>
        <p className="text-sm text-slate-500 mt-1">3-Stage: Acquisition → Development → Alignment</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { key: 'acquisition', label: 'Stage 1 — Acquisition', desc: '9-Box Talent Grid & Identifikasi', icon: Users,      color: 'from-blue-500 to-indigo-600' },
          { key: 'development', label: 'Stage 2 — Development', desc: 'Rencana Pengembangan & IDP',     icon: TrendingUp, color: 'from-emerald-500 to-teal-600' },
          { key: 'alignment',   label: 'Stage 3 — Alignment',   desc: 'Suksesi & Career Path',          icon: Target,     color: 'from-purple-500 to-fuchsia-600' },
        ].map(s => (
          <button key={s.key} onClick={() => setStage(s.key)}
            className={cls('p-4 rounded-xl border text-left transition-all',
              stage === s.key ? 'border-emerald-500 bg-emerald-50 shadow' : 'border-slate-200 bg-white hover:border-emerald-300')}>
            <div className={cls('w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center mb-2', s.color)}>
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-sm font-semibold text-slate-900">{s.label}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.desc}</div>
          </button>
        ))}
      </div>

      {stage === 'acquisition' && (
        <Card title="9-Box Talent Grid" subtitle="Performance × Potential — pegawai berdasarkan kombinasi kinerja & pengembangan diri">
          <div className="grid grid-cols-3 gap-2">
            {boxes.map((b, i) => {
              const label = (() => {
                const tier = ['Underperformer', 'Solid', 'Star'][b.perf] || '';
                const prefix = ['Limited', 'Core', 'High-Po'][b.pot] || '';
                return `${prefix} ${tier}`;
              })();
              const tone = (b.pot + b.perf) >= 3 ? 'bg-emerald-50 border-emerald-300' :
                           (b.pot + b.perf) >= 2 ? 'bg-blue-50 border-blue-200' :
                           (b.pot + b.perf) >= 1 ? 'bg-amber-50 border-amber-200' : 'bg-rose-50 border-rose-200';
              return (
                <div key={i} className={cls('p-3 border-2 rounded-lg min-h-[120px]', tone)}>
                  <div className="text-[10px] font-bold uppercase text-slate-600 mb-1.5">{label}</div>
                  <div className="space-y-1">
                    {b.list.slice(0, 3).map(g => (
                      <div key={g.emp.id} className="text-xs bg-white/80 rounded px-1.5 py-0.5 truncate">{g.emp.nama}</div>
                    ))}
                    {b.list.length > 3 && <div className="text-[10px] text-slate-500">+ {b.list.length - 3} lainnya</div>}
                    {b.list.length === 0 && <div className="text-[10px] text-slate-400 italic">kosong</div>}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 text-xs text-slate-500">
            Sumbu Horizontal (kiri → kanan): Performance — Underperformer / Solid / Star.<br/>
            Sumbu Vertikal (bawah → atas): Potential — Limited / Core / High-Po.
          </div>
        </Card>
      )}

      {stage === 'development' && (
        <Card title="Rencana Pengembangan Individu (IDP)" subtitle="Mapping pelatihan ke kebutuhan kompetensi pegawai">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-slate-500 uppercase">
                <tr><th className="text-left py-2">Pegawai</th><th className="text-left py-2">Divisi</th><th className="text-center py-2">Pelatihan Selesai</th><th className="text-left py-2">Status IDP</th></tr>
              </thead>
              <tbody>
                {employees.filter(e => e.role === ROLES.PEGAWAI && e.status === 'aktif').map(e => {
                  const tc = trainingCount(e.id);
                  return (
                    <tr key={e.id} className="border-t border-slate-100">
                      <td className="py-2.5 font-medium text-slate-900">{e.nama}</td>
                      <td className="py-2.5 text-slate-700">{e.divisi}</td>
                      <td className="py-2.5 text-center font-semibold">{tc}</td>
                      <td className="py-2.5">
                        <Badge className={tc >= 3 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : tc >= 1 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-rose-50 text-rose-700 border-rose-200'}>
                          {tc >= 3 ? 'On Track' : tc >= 1 ? 'Mulai Berkembang' : 'Perlu Perhatian'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {stage === 'alignment' && (
        <Card title="Succession & Career Path" subtitle="Posisi kritikal & calon pengganti">
          <div className="space-y-3">
            {[
              { posisi: 'Kadiv Keuangan',      pemegang: 'E004', kandidat: ['E005'] },
              { posisi: 'Kadiv Investasi',     pemegang: 'E007', kandidat: ['E006'] },
              { posisi: 'Kadiv Pengembangan SDM', pemegang: 'E002', kandidat: ['E003'] },
            ].map((s, i) => {
              const inc = employees.find(e => e.id === s.pemegang);
              const cands = s.kandidat.map(id => employees.find(e => e.id === id)).filter(Boolean);
              return (
                <div key={i} className="p-3 border border-slate-200 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-xs text-slate-500">Posisi</div>
                      <div className="font-semibold text-slate-900">{s.posisi}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 text-right">Incumbent</div>
                      <div className="font-medium text-slate-900">{inc?.nama || '-'}</div>
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Kandidat Suksesi</div>
                  <div className="flex gap-2 flex-wrap">
                    {cands.map(c => (
                      <div key={c.id} className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs">
                        <span className="font-medium text-emerald-900">{c.nama}</span>
                        <span className="text-emerald-700"> · {trainingCount(c.id)} pelatihan</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

// =====================================================================
// VIEW — SETTINGS
// =====================================================================

function SettingsView({ user, onResetData }) {
  const exportAll = () => {
    const data = {};
    Object.values(STORAGE_KEYS).forEach(k => {
      const raw = localStorage.getItem(k);
      if (raw) data[k.replace(STORAGE_PREFIX, '')] = JSON.parse(raw);
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kmls-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Pengaturan</h1>
        <p className="text-sm text-slate-500 mt-1">Konfigurasi sistem & manajemen data</p>
      </div>

      <Card title="Informasi Sistem">
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <div className="text-slate-500">Versi Aplikasi</div><div className="text-slate-900 font-mono">{APP_VERSION}</div>
          <div className="text-slate-500">Nama Sistem</div><div className="text-slate-900">{APP_FULL_NAME}</div>
          <div className="text-slate-500">Organisasi</div><div className="text-slate-900">{ORGANIZATION}</div>
          <div className="text-slate-500">Storage</div><div className="text-slate-900">Browser localStorage</div>
          <div className="text-slate-500">User Login</div><div className="text-slate-900">{user.nama} ({ROLE_META[user.role]?.label})</div>
        </div>
      </Card>

      <Card title="Backup & Restore Data">
        <p className="text-sm text-slate-600 mb-3">
          Export semua data aplikasi (master pegawai, katalog pelatihan, pengajuan, laporan, evaluasi, KM, TMS) sebagai file JSON. Disimpan lokal di browser Anda.
        </p>
        <div className="flex gap-2 flex-wrap">
          <Button icon={Download} onClick={exportAll}>Export Semua Data</Button>
          {user.role === ROLES.ADMIN && (
            <Button variant="danger" icon={Trash2} onClick={() => {
              if (window.confirm('PERHATIAN: Reset akan menghapus SEMUA data lokal dan mengembalikan ke seed data awal. Lanjutkan?')) {
                onResetData();
              }
            }}>Reset ke Data Awal</Button>
          )}
        </div>
      </Card>

      <Card title="Tentang KMLS" className="border-emerald-200">
        <div className="prose prose-sm max-w-none">
          <p className="text-sm text-slate-700">
            <strong>{APP_FULL_NAME}</strong> adalah sistem terpadu untuk pengelolaan end-to-end pelatihan pegawai BPKH, terintegrasi dengan Knowledge Management 4-pilar dan Talent Management 3-stage.
          </p>
          <p className="text-sm text-slate-600 mt-2">
            Aplikasi mengikuti Prosedur Tetap tentang Manajemen Pengetahuan BPKH, dengan alur approval 10-tahap, formulir online sesuai Format Formulir Pengajuan, Laporan Pelaksanaan, dan Evaluasi Level 3 yang berlaku di BPKH.
          </p>
          <p className="text-xs text-slate-500 mt-3">© {new Date().getFullYear()} {ORGANIZATION}. Dikembangkan oleh MS Hadianto, SE, Ak, MM, CA, QIA, CACP, GRCP, GRCA, CCFA, CGP.</p>
        </div>
      </Card>
    </div>
  );
}

// =====================================================================
// MAIN APP COMPONENT
// =====================================================================

export default function App() {
  // Data state (persisted via localStorage)
  const [employees, setEmployees]             = useLocalStorage(STORAGE_KEYS.EMPLOYEES, seedEmployees);
  const [trainings, setTrainings]             = useLocalStorage(STORAGE_KEYS.TRAININGS, seedTrainingCatalog);
  const [proposals, setProposals]             = useLocalStorage(STORAGE_KEYS.PROPOSALS, seedProposals);
  const [reports, setReports]                 = useLocalStorage(STORAGE_KEYS.REPORTS, seedReports);
  const [evaluations, setEvaluations]         = useLocalStorage(STORAGE_KEYS.EVALUATIONS, seedEvaluations);
  const [sme, setSme]                         = useLocalStorage(STORAGE_KEYS.SME, seedSME);
  const [knowledgeAssets, setKnowledgeAssets] = useLocalStorage(STORAGE_KEYS.KNOWLEDGE_ASSETS, seedKnowledgeAssets);
  const [cop, setCop]                         = useLocalStorage(STORAGE_KEYS.COP, seedCoP);

  // Session
  const [sessionUserId, setSessionUserId] = useLocalStorage(STORAGE_KEYS.SESSION, null);
  const user = useMemo(() => employees.find(e => e.id === sessionUserId), [employees, sessionUserId]);

  // UI state
  const [currentView, setCurrentView]   = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [focusProposalId, setFocusProposalId] = useState(null);

  const handleLogin = (emp) => {
    if (emp) { setSessionUserId(emp.id); setCurrentView('dashboard'); }
  };
  const handleLogout = () => {
    setSessionUserId(null);
    setFocusProposalId(null);
    setCurrentView('dashboard');
  };

  const handleNavigate = (view, focusId) => {
    setCurrentView(view);
    if (focusId !== undefined) setFocusProposalId(focusId);
  };

  const handleResetData = () => {
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
    window.location.reload();
  };

  // If not logged in → show login screen
  if (!user) {
    return <LoginScreen employees={employees} onLogin={handleLogin} />;
  }

  // Compute notification count: pengajuan menunggu aksi user
  const myInbox = proposals.filter(p => stageByKey(p.stage).actor === user.role).length;

  // Render view
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard user={user} employees={employees} proposals={proposals} trainings={trainings} reports={reports}
          onNavigate={(view, id) => handleNavigate(view, id)} />;
      case 'pengajuan':
        return <PengajuanView user={user} employees={employees} trainings={trainings} proposals={proposals}
          setProposals={setProposals} focusId={focusProposalId} onClearFocus={() => setFocusProposalId(null)} />;
      case 'approval':
        // Approval = inbox view of pengajuan
        return <PengajuanView user={user} employees={employees} trainings={trainings} proposals={proposals}
          setProposals={setProposals} focusId={focusProposalId} onClearFocus={() => setFocusProposalId(null)} />;
      case 'st':
        return <SuratTugasView user={user} employees={employees} proposals={proposals} />;
      case 'laporan':
        return <LaporanView user={user} employees={employees} proposals={proposals} setProposals={setProposals}
          reports={reports} setReports={setReports} evaluations={evaluations} setEvaluations={setEvaluations} />;
      case 'katalog':
        return <MasterPelatihan user={user} trainings={trainings} setTrainings={setTrainings} />;
      case 'pegawai':
        return <MasterPegawai user={user} employees={employees} setEmployees={setEmployees} />;
      case 'kategori':
        return <MasterKategori trainings={trainings} proposals={proposals} />;
      case 'km':
        return <KMView user={user} employees={employees} sme={sme} setSme={setSme}
          knowledgeAssets={knowledgeAssets} setKnowledgeAssets={setKnowledgeAssets}
          cop={cop} setCop={setCop} proposals={proposals} />;
      case 'tms':
        return <TMSView user={user} employees={employees} proposals={proposals} />;
      case 'settings':
        return <SettingsView user={user} onResetData={handleResetData} />;
      default:
        return <Dashboard user={user} employees={employees} proposals={proposals} trainings={trainings} reports={reports}
          onNavigate={(view, id) => handleNavigate(view, id)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar user={user} currentView={currentView} onNavigate={handleNavigate}
        collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(c => !c)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar user={user} onLogout={handleLogout} notifications={myInbox} />
        <main className="flex-1 overflow-y-auto p-6">
          {renderView()}
        </main>
      </div>
    </div>
  );
}
