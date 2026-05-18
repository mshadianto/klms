import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  LayoutDashboard, Send, Calendar, Users, BookOpen, MessageCircle, Settings as SettingsIcon,
  Bell, Search, Plus, X, Filter, Download, ChevronRight, ChevronDown, ChevronLeft, Menu,
  GraduationCap, Brain, Award, FileText, Briefcase, Target, Grid3x3, Replace, ArrowUpRight,
  Activity, ClipboardCheck, CheckCircle, XCircle, Clock, AlertTriangle, AlertCircle,
  Eye, Edit3, Trash2, Database, Map, Network, Video, Tag, Building2, Star, TrendingUp,
  RefreshCw, MoreVertical, Save, UserPlus, User, Sparkles, BookOpenCheck, MapPin,
  ArrowRight, Layers, BarChart3, ThumbsUp, ThumbsDown, Bookmark, History, MessageSquare,
  HelpCircle, GitBranch, Compass, Route, Flame, Archive, FileCheck, Lightbulb, Link2,
  TrendingDown, Send as SendIcon
} from 'lucide-react';

// =================================================================================
// CONFIGURATION & CONSTANTS
// =================================================================================

const APP_VERSION = '1.1.0';
const STORAGE_KEY = 'kmls:appdata:v2';
const CURRENT_USER_ID = 'p001'; // active session user — Sopian Hadianto

const NAV_STRUCTURE = [
  {
    section: 'Utama',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'pengajuan', label: 'Pengajuan Pelatihan', icon: Send, badgeKey: 'pendingPengajuan' },
      { id: 'pegawai', label: 'Pegawai', icon: Users },
    ],
  },
  {
    section: 'Knowledge Management',
    items: [
      { id: 'km-sme', label: 'SME Development', icon: Award },
      { id: 'km-map', label: 'Knowledge Map', icon: Map },
      { id: 'km-cop', label: 'Community of Practice', icon: Network },
      { id: 'km-asset', label: 'Knowledge Asset', icon: Database },
      { id: 'km-paths', label: 'Learning Paths', icon: Route },
      { id: 'km-skill', label: 'Skill Matrix', icon: Target },
      { id: 'km-qa', label: 'Ask the Expert', icon: HelpCircle, badgeKey: 'openQuestions' },
      { id: 'km-analytics', label: 'KM Analytics', icon: BarChart3 },
    ],
  },
  {
    section: 'Talent Management',
    items: [
      { id: 'tms-overview', label: 'TMS Overview', icon: Target },
      { id: 'tms-9box', label: '9-Box Mapping', icon: Grid3x3 },
      { id: 'tms-pool', label: 'Talent Pool', icon: Star },
      { id: 'tms-succession', label: 'Succession Plan', icon: Replace },
      { id: 'tms-promosi', label: 'Promosi', icon: ArrowUpRight },
    ],
  },
  {
    section: 'Sistem',
    items: [
      { id: 'settings', label: 'Pengaturan', icon: SettingsIcon },
    ],
  },
];

const DIVISI_LIST = [
  'Audit Internal', 'Investasi', 'IT & Digital', 'Kepatuhan', 'SDM',
  'Sekretariat', 'Pelayanan Haji', 'Keuangan', 'Hukum', 'Komite Audit',
];

const JENIS_PELATIHAN = ['Internal', 'Eksternal', 'Sertifikasi', 'Workshop', 'Konferensi'];

const PENGAJUAN_STATUS = {
  draft: { label: 'Draft', color: 'bg-slate-100 text-slate-700' },
  pending: { label: 'Menunggu Approval', color: 'bg-amber-100 text-amber-800' },
  review: { label: 'Review HR', color: 'bg-blue-100 text-blue-800' },
  approved: { label: 'Disetujui', color: 'bg-emerald-100 text-emerald-800' },
  rejected: { label: 'Ditolak', color: 'bg-rose-100 text-rose-800' },
  completed: { label: 'Selesai', color: 'bg-violet-100 text-violet-800' },
};

const SME_LEVEL = {
  expert: { label: 'Expert', dots: 5, color: 'bg-violet-600' },
  senior: { label: 'Senior', dots: 4, color: 'bg-violet-500' },
  mid: { label: 'Mid', dots: 3, color: 'bg-violet-400' },
  junior: { label: 'Junior', dots: 2, color: 'bg-violet-300' },
};

const KM_DOMAINS = [
  'Audit Internal', 'GRC', 'Investasi Syariah', 'Pengelolaan Haji',
  'IT & Cybersecurity', 'Risk Management', 'Compliance', 'Sukuk',
];

const ASSET_TYPES = {
  sop: { label: 'SOP', icon: FileText, color: 'text-blue-600 bg-blue-50' },
  pedoman: { label: 'Pedoman', icon: BookOpen, color: 'text-emerald-600 bg-emerald-50' },
  template: { label: 'Template', icon: Layers, color: 'text-violet-600 bg-violet-50' },
  video: { label: 'Video', icon: Video, color: 'text-rose-600 bg-rose-50' },
  case: { label: 'Case Study', icon: ClipboardCheck, color: 'text-amber-600 bg-amber-50' },
  lesson: { label: 'Lesson Learned', icon: Sparkles, color: 'text-cyan-600 bg-cyan-50' },
};

const ASSET_STATUS = {
  draft:     { label: 'Draft',     color: 'bg-slate-100 text-slate-700',       icon: Edit3 },
  review:    { label: 'In Review', color: 'bg-amber-100 text-amber-800',       icon: Clock },
  published: { label: 'Published', color: 'bg-emerald-100 text-emerald-800',   icon: CheckCircle },
  archived:  { label: 'Archived',  color: 'bg-slate-200 text-slate-600',       icon: Archive },
};

const COMPETENCY_LEVELS = {
  0: { label: 'None',         color: 'bg-slate-100 text-slate-500' },
  1: { label: 'Foundational', color: 'bg-blue-100 text-blue-700' },
  2: { label: 'Intermediate', color: 'bg-violet-100 text-violet-700' },
  3: { label: 'Advanced',     color: 'bg-emerald-100 text-emerald-700' },
  4: { label: 'Expert',       color: 'bg-amber-100 text-amber-800' },
};

const QUESTION_STATUS = {
  open:      { label: 'Open',         color: 'bg-amber-100 text-amber-800' },
  answered:  { label: 'Answered',     color: 'bg-blue-100 text-blue-800' },
  resolved:  { label: 'Resolved',     color: 'bg-emerald-100 text-emerald-800' },
};

// =================================================================================
// SEED DATA
// =================================================================================

const SEED_DATA = {
  meta: { initialized: true, version: APP_VERSION, createdAt: new Date().toISOString() },
  pegawai: [
    { id: 'p001', nama: 'Sopian Hadianto', nip: '198501012010', jabatan: 'Anggota Komite Audit', divisi: 'Komite Audit', performance: 4.5, kompetensi: 4.6, joinDate: '2023-01-15', email: 'sopian@bpkh.go.id' },
    { id: 'p002', nama: 'Rojikin', nip: '197503152008', jabatan: 'Ketua Komite Audit', divisi: 'Komite Audit', performance: 4.7, kompetensi: 4.8, joinDate: '2020-01-15', email: 'rojikin@bpkh.go.id' },
    { id: 'p003', nama: 'Firmansyah N. Nazaroedin', nip: '197005182006', jabatan: 'Ketua Dewan Pengawas', divisi: 'Komite Audit', performance: 4.6, kompetensi: 4.5, joinDate: '2019-06-10', email: 'firman@bpkh.go.id' },
    { id: 'p004', nama: 'Rina Septiani', nip: '198803202012', jabatan: 'Analis Investasi Senior', divisi: 'Investasi', performance: 4.3, kompetensi: 4.2, joinDate: '2021-03-22', email: 'rina@bpkh.go.id' },
    { id: 'p005', nama: 'Ahmad Fauzi', nip: '199001102015', jabatan: 'IT Security Lead', divisi: 'IT & Digital', performance: 4.0, kompetensi: 4.1, joinDate: '2022-07-01', email: 'ahmad@bpkh.go.id' },
    { id: 'p006', nama: 'Budi Santoso', nip: '198706142011', jabatan: 'Auditor Madya', divisi: 'Audit Internal', performance: 3.8, kompetensi: 3.9, joinDate: '2020-11-15', email: 'budi@bpkh.go.id' },
    { id: 'p007', nama: 'Siti Rahayu', nip: '199203052017', jabatan: 'Auditor Muda', divisi: 'Audit Internal', performance: 3.6, kompetensi: 4.0, joinDate: '2023-02-01', email: 'siti@bpkh.go.id' },
    { id: 'p008', nama: 'Andri Tanjung', nip: '198912122013', jabatan: 'Compliance Officer', divisi: 'Kepatuhan', performance: 4.1, kompetensi: 3.7, joinDate: '2021-09-12', email: 'andri@bpkh.go.id' },
    { id: 'p009', nama: 'Dewi Lestari', nip: '199104282016', jabatan: 'Staf SDM', divisi: 'SDM', performance: 3.5, kompetensi: 3.4, joinDate: '2022-04-18', email: 'dewi@bpkh.go.id' },
    { id: 'p010', nama: 'Hendra Wijaya', nip: '198508302009', jabatan: 'Sekretaris', divisi: 'Sekretariat', performance: 3.2, kompetensi: 2.9, joinDate: '2019-08-30', email: 'hendra@bpkh.go.id' },
    { id: 'p011', nama: 'Maya Putri', nip: '199407152018', jabatan: 'Analis Keuangan', divisi: 'Keuangan', performance: 4.4, kompetensi: 4.0, joinDate: '2022-10-05', email: 'maya@bpkh.go.id' },
    { id: 'p012', nama: 'Reza Pratama', nip: '199210082016', jabatan: 'Legal Officer', divisi: 'Hukum', performance: 3.9, kompetensi: 4.2, joinDate: '2023-03-20', email: 'reza@bpkh.go.id' },
  ],
  pengajuan: [
    { id: 'pg001', pegawaiId: 'p005', judul: 'Sertifikasi CISA 2025', jenis: 'Sertifikasi', tanggalMulai: '2025-06-12', tanggalSelesai: '2025-06-15', biaya: 15000000, penyelenggara: 'ISACA Indonesia', status: 'pending', alasan: 'Penguatan kompetensi audit IT', createdAt: '2025-05-20' },
    { id: 'pg002', pegawaiId: 'p004', judul: 'Workshop Manajemen Risiko Syariah', jenis: 'Workshop', tanggalMulai: '2025-06-05', tanggalSelesai: '2025-06-06', biaya: 5000000, penyelenggara: 'IBI', status: 'approved', alasan: 'Update tools manajemen risiko investasi', createdAt: '2025-05-15' },
    { id: 'pg003', pegawaiId: 'p008', judul: 'Pelatihan APU-PPT PPATK', jenis: 'Eksternal', tanggalMulai: '2025-05-28', tanggalSelesai: '2025-05-30', biaya: 7500000, penyelenggara: 'PPATK', status: 'approved', alasan: 'Kewajiban kepatuhan tahunan', createdAt: '2025-05-10' },
    { id: 'pg004', pegawaiId: 'p007', judul: 'Training Audit Berbasis Risiko', jenis: 'Internal', tanggalMulai: '2025-06-20', tanggalSelesai: '2025-06-21', biaya: 2000000, penyelenggara: 'BPKH Internal', status: 'review', alasan: 'Pengembangan auditor muda', createdAt: '2025-05-22' },
    { id: 'pg005', pegawaiId: 'p006', judul: 'In-house Audit Syariah', jenis: 'Internal', tanggalMulai: '2025-05-20', tanggalSelesai: '2025-05-21', biaya: 1500000, penyelenggara: 'BPKH Internal', status: 'rejected', alasan: 'Sudah pernah ikut tahun lalu', createdAt: '2025-05-05' },
    { id: 'pg006', pegawaiId: 'p004', judul: 'Sertifikasi WMI', jenis: 'Sertifikasi', tanggalMulai: '2025-04-10', tanggalSelesai: '2025-04-12', biaya: 8000000, penyelenggara: 'WMI Institute', status: 'completed', alasan: 'Penguatan portfolio analyst', createdAt: '2025-03-20' },
  ],
  sme: [
    { id: 'sme001', pegawaiId: 'p001', domain: 'GRC, Audit Internal', level: 'expert', sertifikasi: ['CACP', 'CCFA', 'QIA', 'GRCP'], kontribusi: 24 },
    { id: 'sme002', pegawaiId: 'p002', domain: 'Audit Komite, Governance', level: 'expert', sertifikasi: ['CIA', 'QIA'], kontribusi: 32 },
    { id: 'sme003', pegawaiId: 'p003', domain: 'Pengawasan, Risk Management', level: 'senior', sertifikasi: ['CRMP'], kontribusi: 18 },
    { id: 'sme004', pegawaiId: 'p004', domain: 'Investasi Syariah, Sukuk', level: 'senior', sertifikasi: ['WMI', 'CFP'], kontribusi: 21 },
    { id: 'sme005', pegawaiId: 'p005', domain: 'IT Audit, Cybersecurity', level: 'mid', sertifikasi: ['CEH'], kontribusi: 12 },
    { id: 'sme006', pegawaiId: 'p008', domain: 'Compliance, APU-PPT', level: 'mid', sertifikasi: ['CAMS'], kontribusi: 9 },
  ],
  knowledgeAsset: [
    { id: 'ka001', judul: 'Pedoman Audit Berbasis Risiko v2.0', type: 'pedoman', tags: ['Audit', 'Risk'], owner: 'p002', views: 142, createdAt: '2025-03-15', status: 'published', version: '2.0', reviewDate: '2026-03-15', description: 'Pedoman lengkap pelaksanaan audit berbasis risiko di lingkungan BPKH, mengacu pada IPPF 2024.', ratingsUp: 18, ratingsDown: 1, lastViewedAt: '2025-05-17', comments: [{ id: 'c1', userId: 'p006', text: 'Sangat membantu untuk penyusunan kertas kerja audit kuartalan.', createdAt: '2025-04-20' }] },
    { id: 'ka002', judul: 'SOP Pengajuan Pelatihan v3.1', type: 'sop', tags: ['SDM', 'Procurement'], owner: 'p009', views: 98, createdAt: '2025-04-01', status: 'published', version: '3.1', reviewDate: '2026-04-01', description: 'Standar operasional pengajuan, approval, sampai laporan pelatihan pegawai BPKH.', ratingsUp: 12, ratingsDown: 0, lastViewedAt: '2025-05-18', comments: [] },
    { id: 'ka003', judul: 'Case Study: HDC Settlement', type: 'case', tags: ['Investasi', 'Lesson'], owner: 'p004', views: 89, createdAt: '2025-04-12', status: 'published', version: '1.0', reviewDate: '2026-04-12', description: 'Studi kasus settlement Hajj Deposit Center, lengkap dengan timeline, root cause, dan recovery action.', ratingsUp: 15, ratingsDown: 2, lastViewedAt: '2025-05-16', comments: [] },
    { id: 'ka004', judul: 'Template Kertas Kerja Audit Syariah', type: 'template', tags: ['Audit', 'Syariah'], owner: 'p006', views: 54, createdAt: '2025-02-28', status: 'review', version: '1.2', reviewDate: '2025-08-28', description: 'Template baku kertas kerja audit syariah, mencakup checklist DSN-MUI.', ratingsUp: 7, ratingsDown: 0, lastViewedAt: '2025-05-10', comments: [] },
    { id: 'ka005', judul: 'Rekaman: KM Session GRC Mei 2025', type: 'video', tags: ['GRC', 'Sharing'], owner: 'p001', views: 67, createdAt: '2025-05-10', status: 'published', version: '1.0', reviewDate: '2026-05-10', description: 'Rekaman knowledge sharing session GRC tematik bulan Mei 2025 oleh Sopian Hadianto.', ratingsUp: 9, ratingsDown: 0, lastViewedAt: '2025-05-17', comments: [] },
    { id: 'ka006', judul: 'Lesson Learned Audit TPPU 2025', type: 'lesson', tags: ['Audit', 'Compliance'], owner: 'p008', views: 41, createdAt: '2025-04-25', status: 'published', version: '1.0', reviewDate: '2026-04-25', description: 'Pelajaran kunci dari pelaksanaan audit TPPU Q1 2025 dan rekomendasi mitigasi.', ratingsUp: 11, ratingsDown: 1, lastViewedAt: '2025-05-14', comments: [] },
    { id: 'ka007', judul: 'SOP Pengelolaan Dana Haji', type: 'sop', tags: ['Haji', 'Keuangan'], owner: 'p011', views: 38, createdAt: '2025-03-08', status: 'published', version: '1.5', reviewDate: '2025-09-08', description: 'SOP end-to-end pengelolaan dana haji, dari setoran sampai pembayaran biaya operasional.', ratingsUp: 6, ratingsDown: 0, lastViewedAt: '2025-04-30', comments: [] },
    { id: 'ka008', judul: 'Best Practice Tata Kelola Haji', type: 'pedoman', tags: ['Haji', 'Governance'], owner: 'p003', views: 33, createdAt: '2025-03-22', status: 'published', version: '1.0', reviewDate: '2026-03-22', description: 'Kompilasi best practice tata kelola penyelenggaraan haji dari berbagai negara mitra.', ratingsUp: 5, ratingsDown: 0, lastViewedAt: '2024-11-12', comments: [] },
  ],
  bookmarks: [
    { id: 'bm001', userId: 'p001', assetId: 'ka001', createdAt: '2025-04-22' },
    { id: 'bm002', userId: 'p001', assetId: 'ka006', createdAt: '2025-05-02' },
    { id: 'bm003', userId: 'p002', assetId: 'ka003', createdAt: '2025-04-30' },
  ],
  competencies: [
    { id: 'cmp001', name: 'Audit Berbasis Risiko', domain: 'Audit Internal' },
    { id: 'cmp002', name: 'Audit Syariah', domain: 'Audit Internal' },
    { id: 'cmp003', name: 'Manajemen Risiko', domain: 'GRC' },
    { id: 'cmp004', name: 'Compliance & APU-PPT', domain: 'Compliance' },
    { id: 'cmp005', name: 'Analisis Investasi Syariah', domain: 'Investasi Syariah' },
    { id: 'cmp006', name: 'Manajemen Sukuk', domain: 'Sukuk' },
    { id: 'cmp007', name: 'Cybersecurity', domain: 'IT & Cybersecurity' },
    { id: 'cmp008', name: 'Data Governance', domain: 'IT & Cybersecurity' },
    { id: 'cmp009', name: 'Tata Kelola Haji', domain: 'Pengelolaan Haji' },
    { id: 'cmp010', name: 'Leadership & Coaching', domain: 'Soft Skill' },
  ],
  roleRequirements: [
    { jabatan: 'Anggota Komite Audit',    requirements: [['cmp001',4],['cmp003',3],['cmp004',3],['cmp010',3]] },
    { jabatan: 'Ketua Komite Audit',      requirements: [['cmp001',4],['cmp003',4],['cmp004',3],['cmp010',4]] },
    { jabatan: 'Auditor Madya',           requirements: [['cmp001',3],['cmp002',2],['cmp003',2]] },
    { jabatan: 'Auditor Muda',            requirements: [['cmp001',2],['cmp002',1],['cmp003',1]] },
    { jabatan: 'Analis Investasi Senior', requirements: [['cmp005',4],['cmp006',3],['cmp003',2]] },
    { jabatan: 'IT Security Lead',        requirements: [['cmp007',4],['cmp008',3]] },
    { jabatan: 'Compliance Officer',      requirements: [['cmp004',4],['cmp003',2]] },
    { jabatan: 'Analis Keuangan',         requirements: [['cmp009',2],['cmp005',2]] },
  ],
  pegawaiCompetencies: [
    { pegawaiId: 'p001', competencyId: 'cmp001', level: 4 },
    { pegawaiId: 'p001', competencyId: 'cmp003', level: 4 },
    { pegawaiId: 'p001', competencyId: 'cmp004', level: 3 },
    { pegawaiId: 'p001', competencyId: 'cmp010', level: 3 },
    { pegawaiId: 'p002', competencyId: 'cmp001', level: 4 },
    { pegawaiId: 'p002', competencyId: 'cmp003', level: 3 },
    { pegawaiId: 'p002', competencyId: 'cmp010', level: 4 },
    { pegawaiId: 'p004', competencyId: 'cmp005', level: 4 },
    { pegawaiId: 'p004', competencyId: 'cmp006', level: 3 },
    { pegawaiId: 'p005', competencyId: 'cmp007', level: 3 },
    { pegawaiId: 'p005', competencyId: 'cmp008', level: 2 },
    { pegawaiId: 'p006', competencyId: 'cmp001', level: 2 },
    { pegawaiId: 'p006', competencyId: 'cmp002', level: 2 },
    { pegawaiId: 'p007', competencyId: 'cmp001', level: 1 },
    { pegawaiId: 'p008', competencyId: 'cmp004', level: 3 },
    { pegawaiId: 'p011', competencyId: 'cmp005', level: 1 },
    { pegawaiId: 'p011', competencyId: 'cmp009', level: 1 },
  ],
  learningPaths: [
    { id: 'lp001', title: 'Onboarding Auditor BPKH', targetRole: 'Auditor Muda', description: 'Path wajib untuk auditor baru: pemahaman audit berbasis risiko + GRC + syariah dasar.', createdBy: 'p002', steps: [
      { type: 'asset', refId: 'ka001', title: 'Baca: Pedoman Audit Berbasis Risiko v2.0', estMinutes: 60 },
      { type: 'asset', refId: 'ka004', title: 'Pelajari: Template Kertas Kerja Audit Syariah', estMinutes: 45 },
      { type: 'asset', refId: 'ka006', title: 'Review: Lesson Learned Audit TPPU 2025', estMinutes: 30 },
      { type: 'training', refId: null, title: 'Ikuti: Training Audit Berbasis Risiko', estMinutes: 480 },
    ]},
    { id: 'lp002', title: 'Compliance Fundamentals', targetRole: 'Compliance Officer', description: 'Penguatan kompetensi compliance & APU-PPT untuk pegawai Divisi Kepatuhan.', createdBy: 'p008', steps: [
      { type: 'asset', refId: 'ka006', title: 'Baca: Lesson Learned Audit TPPU 2025', estMinutes: 30 },
      { type: 'asset', refId: 'ka002', title: 'Pelajari: SOP Pengajuan Pelatihan v3.1', estMinutes: 20 },
      { type: 'training', refId: null, title: 'Ikuti: Pelatihan APU-PPT PPATK', estMinutes: 1200 },
    ]},
    { id: 'lp003', title: 'Investasi Syariah Mastery', targetRole: 'Analis Investasi Senior', description: 'Jalur pengembangan analis investasi: dari case study sampai sertifikasi.', createdBy: 'p004', steps: [
      { type: 'asset', refId: 'ka003', title: 'Pelajari: Case Study HDC Settlement', estMinutes: 60 },
      { type: 'training', refId: null, title: 'Ikuti: Workshop Manajemen Risiko Syariah', estMinutes: 720 },
      { type: 'training', refId: null, title: 'Sertifikasi: WMI', estMinutes: 2400 },
    ]},
  ],
  enrollments: [
    { id: 'en001', userId: 'p007', pathId: 'lp001', startedAt: '2025-04-01', completedSteps: [0, 1] },
    { id: 'en002', userId: 'p008', pathId: 'lp002', startedAt: '2025-05-01', completedSteps: [0] },
    { id: 'en003', userId: 'p011', pathId: 'lp003', startedAt: '2025-05-05', completedSteps: [] },
  ],
  questions: [
    { id: 'q001', askerId: 'p007', title: 'Bagaimana cara memilih sampel audit yang representatif untuk audit syariah?', body: 'Saya sedang mempersiapkan audit syariah pertama saya dan bingung dengan teknik sampling yang tepat untuk transaksi syariah.', domain: 'Audit Internal', status: 'answered', askedAt: '2025-05-10', answers: [
      { id: 'a001', smeId: 'p006', body: 'Untuk audit syariah, gunakan judgmental sampling pada transaksi material + random sampling pada populasi besar. Referensi: Pedoman Audit Berbasis Risiko v2.0 bab 4.', votes: 5, createdAt: '2025-05-11', promotedToAssetId: null },
    ]},
    { id: 'q002', askerId: 'p009', title: 'Dokumen apa saja yang wajib di-attach saat pengajuan sertifikasi external?', body: 'Untuk pegawai yang ingin ambil sertifikasi seperti CISA atau WMI, dokumen apa yang harus disiapkan?', domain: 'SDM', status: 'resolved', askedAt: '2025-04-28', answers: [
      { id: 'a002', smeId: 'p005', body: 'CV terbaru, bukti pengalaman minimal 2 tahun di area terkait, surat rekomendasi atasan, dan brosur sertifikasi. Detail di SOP Pengajuan Pelatihan v3.1.', votes: 8, createdAt: '2025-04-29', promotedToAssetId: 'ka002' },
    ]},
    { id: 'q003', askerId: 'p010', title: 'Apakah ada template laporan risiko investasi haji bulanan?', body: 'Saya cari template laporan risiko investasi yang bisa langsung digunakan.', domain: 'Investasi Syariah', status: 'open', askedAt: '2025-05-17', answers: []},
  ],
  cop: [
    { id: 'cop001', nama: 'CoP Audit & GRC', lead: 'p002', anggota: 32, diskusiPerBulan: 48, engagement: 92, nextEvent: '2025-06-18' },
    { id: 'cop002', nama: 'CoP Investasi Syariah', lead: 'p004', anggota: 28, diskusiPerBulan: 35, engagement: 75, nextEvent: '2025-06-20' },
    { id: 'cop003', nama: 'CoP IT & Digital Innovation', lead: 'p005', anggota: 24, diskusiPerBulan: 28, engagement: 68, nextEvent: '2025-06-25' },
    { id: 'cop004', nama: 'CoP Pelayanan Haji', lead: 'p003', anggota: 19, diskusiPerBulan: 12, engagement: 32, nextEvent: null },
    { id: 'cop005', nama: 'CoP Kepatuhan & APU-PPT', lead: 'p008', anggota: 16, diskusiPerBulan: 20, engagement: 58, nextEvent: '2025-07-02' },
  ],
  succession: [
    { id: 's001', posisi: 'Kepala Divisi Audit Internal', incumbent: 'p002', kandidat: ['p001', 'p006'], readiness: '1y' },
    { id: 's002', posisi: 'Kepala Divisi Investasi', incumbent: null, kandidat: ['p004', 'p011'], readiness: '1y' },
    { id: 's003', posisi: 'Kepala Divisi IT & Digital', incumbent: null, kandidat: ['p005'], readiness: '2y' },
    { id: 's004', posisi: 'Kepala SPI', incumbent: null, kandidat: ['p001', 'p008'], readiness: '2y' },
    { id: 's005', posisi: 'Kepala Divisi SDM', incumbent: null, kandidat: [], readiness: '3y' },
  ],
  talentPool: [
    { id: 'tp001', pegawaiId: 'p001', kategori: 'star', notes: 'C-Level successor' },
    { id: 'tp002', pegawaiId: 'p002', kategori: 'star', notes: 'C-Level successor' },
    { id: 'tp003', pegawaiId: 'p004', kategori: 'highpot', notes: 'High Potential — Investasi' },
    { id: 'tp004', pegawaiId: 'p007', kategori: 'future', notes: 'Future Star — Audit' },
    { id: 'tp005', pegawaiId: 'p005', kategori: 'critical', notes: 'Critical Backup — IT' },
    { id: 'tp006', pegawaiId: 'p011', kategori: 'highpot', notes: 'High Potential — Keuangan' },
  ],
};

// =================================================================================
// STORAGE LAYER
// =================================================================================

const Store = {
  async load() {
    try {
      if (typeof window !== 'undefined' && window.storage) {
        const result = await window.storage.get(STORAGE_KEY);
        if (result?.value) {
          return typeof result.value === 'string' ? JSON.parse(result.value) : result.value;
        }
      }
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
      }
    } catch (e) {
      console.log('No saved data, using seed');
    }
    return null;
  },
  async save(data) {
    try {
      if (typeof window !== 'undefined' && window.storage) {
        await window.storage.set(STORAGE_KEY, JSON.stringify(data));
        return true;
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return true;
      }
    } catch (e) {
      console.error('Storage save failed:', e);
    }
    return false;
  },
  async reset() {
    try {
      if (typeof window !== 'undefined' && window.storage) {
        await window.storage.delete(STORAGE_KEY);
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {}
  },
};

// =================================================================================
// UTILITIES
// =================================================================================

const formatIDR = (n) => 'Rp ' + Math.round(n).toLocaleString('id-ID');
const formatDate = (s) => {
  if (!s) return '-';
  const d = new Date(s);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};
const initials = (nama) => nama.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
const uid = (prefix) => `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const findPegawai = (data, id) => data.pegawai.find(p => p.id === id);
const findAsset = (data, id) => data.knowledgeAsset.find(a => a.id === id);
const isBookmarked = (data, userId, assetId) => (data.bookmarks || []).some(b => b.userId === userId && b.assetId === assetId);
const userBookmarks = (data, userId) => (data.bookmarks || []).filter(b => b.userId === userId);

const daysBetween = (a, b) => Math.round((new Date(a) - new Date(b)) / 86400000);
const daysUntil = (d) => daysBetween(d, new Date().toISOString());
const daysSince = (d) => daysBetween(new Date().toISOString(), d);

// Cross-entity relationship lookup for a Knowledge Asset.
// Heuristic: an asset relates to an SME / CoP if its tags or owner's division
// overlaps with the SME domain / CoP name. Good enough for prototype-grade KG view.
const assetRelations = (data, asset) => {
  const owner = findPegawai(data, asset.owner);
  const tagsLower = asset.tags.map(t => t.toLowerCase());
  const matches = (text) => {
    if (!text) return false;
    const tl = text.toLowerCase();
    return tagsLower.some(t => tl.includes(t)) || (owner && tl.includes(owner.divisi.toLowerCase()));
  };
  const smes = data.sme.filter(s => matches(s.domain));
  const cops = data.cop.filter(c => matches(c.nama));
  const paths = (data.learningPaths || []).filter(p => p.steps.some(st => st.refId === asset.id));
  return { owner, smes, cops, paths };
};

// =================================================================================
// UI PRIMITIVES
// =================================================================================

const Card = ({ children, className = '', padding = 'p-5' }) => (
  <div className={`bg-white rounded-xl border border-slate-200/70 ${padding} ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, className = 'bg-slate-100 text-slate-700' }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
    {children}
  </span>
);

const Button = ({ children, onClick, variant = 'default', size = 'md', icon: Icon, type = 'button', disabled = false, className = '' }) => {
  const variants = {
    primary: 'bg-emerald-700 text-white hover:bg-emerald-800 border-emerald-700',
    default: 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 border-rose-600',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 border-transparent',
  };
  const sizes = { sm: 'px-2.5 py-1 text-xs', md: 'px-3 py-1.5 text-sm', lg: 'px-4 py-2 text-sm' };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`inline-flex items-center gap-1.5 border rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}>
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
};

const Input = ({ label, error, ...props }) => (
  <div>
    {label && <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>}
    <input {...props}
      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-colors" />
    {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
  </div>
);

const Select = ({ label, options, ...props }) => (
  <div>
    {label && <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>}
    <select {...props}
      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white">
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

const Textarea = ({ label, ...props }) => (
  <div>
    {label && <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>}
    <textarea {...props} rows={3}
      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 resize-none" />
  </div>
);

const Modal = ({ open, onClose, title, children, size = 'md' }) => {
  if (!open) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className={`bg-white rounded-xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-md text-slate-500">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

const Avatar = ({ nama, size = 'md', className = '' }) => {
  const sizes = { xs: 'w-6 h-6 text-[9px]', sm: 'w-8 h-8 text-[10px]', md: 'w-10 h-10 text-xs', lg: 'w-12 h-12 text-sm' };
  return (
    <div className={`${sizes[size]} rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-semibold flex-shrink-0 ${className}`}>
      {initials(nama)}
    </div>
  );
};

const Tabs = ({ tabs, active, onChange }) => (
  <div className="flex items-center gap-1 border-b border-slate-200 -mx-5 px-5">
    {tabs.map(t => (
      <button key={t.id} onClick={() => onChange(t.id)}
        className={`px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-colors ${
          active === t.id ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700'
        }`}>
        {t.label}{typeof t.count === 'number' && <span className="ml-1 text-slate-400">({t.count})</span>}
      </button>
    ))}
  </div>
);

const Rating = ({ up, down, onUp, onDown, compact = false }) => (
  <div className={`inline-flex items-center gap-1 ${compact ? 'text-[11px]' : 'text-xs'}`}>
    <button onClick={onUp} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-emerald-50 text-slate-600 hover:text-emerald-700">
      <ThumbsUp className="w-3.5 h-3.5" />{up}
    </button>
    <button onClick={onDown} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-rose-50 text-slate-600 hover:text-rose-600">
      <ThumbsDown className="w-3.5 h-3.5" />{down}
    </button>
  </div>
);

const BookmarkBtn = ({ active, onToggle }) => (
  <button onClick={onToggle} title={active ? 'Hapus bookmark' : 'Bookmark'}
    className={`p-1.5 rounded-md ${active ? 'text-amber-600 bg-amber-50' : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'}`}>
    <Bookmark className="w-4 h-4" fill={active ? 'currentColor' : 'none'} />
  </button>
);

const ProgressBar = ({ value, color = 'emerald' }) => {
  const colors = { emerald: 'bg-emerald-500', amber: 'bg-amber-500', rose: 'bg-rose-500', blue: 'bg-blue-500', violet: 'bg-violet-500' };
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all ${colors[color] || colors.emerald}`} style={{ width: `${pct}%` }} />
    </div>
  );
};

const StatusBadge = ({ status, map }) => {
  const s = map[status] || { label: status, color: 'bg-slate-100 text-slate-600', icon: null };
  const Icon = s.icon;
  return (
    <Badge className={s.color}>
      {Icon && <Icon className="w-3 h-3" />}{s.label}
    </Badge>
  );
};

const Toast = ({ message, type = 'success' }) => {
  if (!message) return null;
  const types = {
    success: 'bg-emerald-700',
    error: 'bg-rose-600',
    info: 'bg-slate-700',
  };
  const Icon = type === 'success' ? CheckCircle : type === 'error' ? XCircle : AlertCircle;
  return (
    <div className={`fixed bottom-6 right-6 z-[60] ${types[type]} text-white px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 text-sm animate-slide-up`}>
      <Icon className="w-4 h-4" />
      {message}
    </div>
  );
};

const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="text-center py-12 px-4">
    <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
      <Icon className="w-7 h-7 text-slate-400" />
    </div>
    <p className="text-sm font-medium text-slate-700">{title}</p>
    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">{description}</p>
    {action && <div className="mt-4">{action}</div>}
  </div>
);

const StatCard = ({ label, value, unit, icon: Icon, color = 'emerald', delta, deltaColor = 'emerald' }) => {
  const colorMap = {
    emerald: 'text-emerald-700 bg-emerald-50',
    amber: 'text-amber-700 bg-amber-50',
    blue: 'text-blue-700 bg-blue-50',
    violet: 'text-violet-700 bg-violet-50',
    rose: 'text-rose-700 bg-rose-50',
  };
  const deltaColors = { emerald: 'text-emerald-600', amber: 'text-amber-600', rose: 'text-rose-600' };
  return (
    <Card padding="p-4">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs text-slate-500">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-semibold text-slate-800">{value}</span>
        {unit && <span className="text-xs text-slate-500">{unit}</span>}
      </div>
      {delta && (
        <div className={`text-[11px] mt-1 flex items-center gap-1 ${deltaColors[deltaColor]}`}>
          <TrendingUp className="w-3 h-3" />
          {delta}
        </div>
      )}
    </Card>
  );
};

// =================================================================================
// LAYOUT
// =================================================================================

const Sidebar = ({ active, onChange, counts, collapsed, onToggle }) => (
  <aside className={`${collapsed ? 'w-16' : 'w-56'} bg-emerald-800 flex flex-col flex-shrink-0 transition-all duration-200`}>
    <div className="px-3 py-4 border-b border-emerald-700/50 flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
        <GraduationCap className="w-4 h-4 text-white" />
      </div>
      {!collapsed && (
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-white leading-tight">KMLS</div>
          <div className="text-[10px] text-white/60 truncate">BPKH Learning Suite</div>
        </div>
      )}
      <button onClick={onToggle} className="p-1 hover:bg-white/10 rounded text-white/60 hover:text-white">
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </div>
    <nav className="flex-1 overflow-y-auto py-2 px-2">
      {NAV_STRUCTURE.map(section => (
        <div key={section.section} className="mb-3">
          {!collapsed && (
            <div className="text-[9px] font-semibold text-white/40 uppercase tracking-wider px-2 mb-1">
              {section.section}
            </div>
          )}
          {section.items.map(item => {
            const Icon = item.icon;
            const isActive = active === item.id;
            const badge = item.badgeKey ? counts[item.badgeKey] : null;
            return (
              <button key={item.id} onClick={() => onChange(item.id)} title={collapsed ? item.label : ''}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[12.5px] mb-0.5 transition-colors ${
                  isActive ? 'bg-white/20 text-white font-medium' : 'text-white/75 hover:bg-white/10 hover:text-white'
                }`}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span className="flex-1 text-left truncate">{item.label}</span>}
                {!collapsed && badge > 0 && (
                  <span className="bg-rose-500 text-white text-[9px] font-medium px-1.5 py-0.5 rounded-full">{badge}</span>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </nav>
    {!collapsed && (
      <div className="p-3 border-t border-emerald-700/50">
        <div className="flex items-center gap-2">
          <Avatar nama="Sopian Hadianto" size="sm" className="!bg-white/15 !text-white" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-white truncate">Sopian Hadianto</div>
            <div className="text-[10px] text-white/50 truncate">Komite Audit</div>
          </div>
        </div>
      </div>
    )}
  </aside>
);

const AppFooter = () => (
  <footer className="border-t border-slate-200 bg-white px-5 py-4 mt-6">
    <div className="max-w-6xl mx-auto space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-600">
          <div className="w-6 h-6 rounded-md bg-emerald-700 flex items-center justify-center">
            <GraduationCap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-semibold text-slate-800">KMLS</span>
          <span className="text-slate-400">·</span>
          <span>BPKH Learning Suite</span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-500">v{APP_VERSION}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <span>Developed by</span>
          <span className="font-semibold text-emerald-700">MS Hadianto</span>
          <span className="text-slate-400">·</span>
          <a href="https://github.com/mshadianto/klms" target="_blank" rel="noopener noreferrer"
             className="text-slate-500 hover:text-emerald-700 inline-flex items-center gap-1">
            <GitBranch className="w-3 h-3" />github.com/mshadianto/klms
          </a>
        </div>
      </div>
      <div className="text-[10.5px] text-slate-500 leading-relaxed bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
        <span className="font-semibold text-amber-800">Disclaimer:</span>{' '}
        KMLS adalah <b>inisiasi personal</b> MS Hadianto sebagai prototipe Knowledge Management & Learning System
        — <b>BUKAN aplikasi resmi Badan Pengelola Keuangan Haji (BPKH)</b> dan tidak merepresentasikan posisi, kebijakan,
        atau sistem informasi lembaga. Seluruh nama, data pegawai, pelatihan, dan dokumen yang ditampilkan bersifat
        <b> fiktif / dummy</b> untuk keperluan demo & eksplorasi konsep semata. Aplikasi belum melalui audit keamanan
        formal; jangan input data sensitif, pribadi, atau rahasia jabatan ke instance demo ini. Persistensi menggunakan
        <i> localStorage</i> browser — data tidak tersinkronisasi antar perangkat dan dapat hilang sewaktu-waktu.
        © {new Date().getFullYear()} MS Hadianto. Disediakan apa adanya, tanpa jaminan apapun.
      </div>
    </div>
  </footer>
);

const GlobalSearch = ({ data, onNavigate }) => {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const results = useMemo(() => {
    if (!q || q.length < 2) return null;
    const t = q.toLowerCase();
    const match = (s) => (s || '').toLowerCase().includes(t);
    const assets = data.knowledgeAsset.filter(a => match(a.judul) || match(a.description) || a.tags.some(x => match(x))).slice(0, 5);
    const pegawai = data.pegawai.filter(p => match(p.nama) || match(p.jabatan) || match(p.divisi)).slice(0, 5);
    const smes = data.sme.filter(s => match(s.domain) || s.sertifikasi.some(c => match(c))).map(s => ({ ...s, peg: findPegawai(data, s.pegawaiId) })).slice(0, 5);
    const cops = data.cop.filter(c => match(c.nama)).slice(0, 5);
    const paths = (data.learningPaths || []).filter(p => match(p.title) || match(p.targetRole) || match(p.description)).slice(0, 5);
    const questions = (data.questions || []).filter(qq => match(qq.title) || match(qq.body) || match(qq.domain)).slice(0, 5);
    const total = assets.length + pegawai.length + smes.length + cops.length + paths.length + questions.length;
    return { assets, pegawai, smes, cops, paths, questions, total };
  }, [q, data]);

  const go = (view) => { setOpen(false); setQ(''); onNavigate(view); };

  return (
    <div ref={ref} className="hidden md:block relative w-72">
      <div className="flex items-center gap-2 bg-slate-100 rounded-md px-3 py-1.5">
        <Search className="w-4 h-4 text-slate-400" />
        <input value={q} onChange={e => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)}
          placeholder="Cari asset, SME, pegawai, CoP, path..."
          className="bg-transparent border-none outline-none text-sm flex-1 min-w-0" />
        {q && <button onClick={() => setQ('')} className="text-slate-400 hover:text-slate-600"><X className="w-3.5 h-3.5" /></button>}
      </div>
      {open && results && (
        <div className="absolute right-0 top-full mt-1 w-[28rem] bg-white border border-slate-200 rounded-lg shadow-xl z-40 max-h-[70vh] overflow-y-auto">
          {results.total === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">Tidak ada hasil untuk "<b>{q}</b>"</div>
          ) : (
            <div className="p-2 space-y-3">
              {results.assets.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1"><Database className="w-3 h-3" />Knowledge Asset</div>
                  {results.assets.map(a => {
                    const t = ASSET_TYPES[a.type];
                    return (
                      <button key={a.id} onClick={() => go('km-asset')} className="w-full text-left px-2 py-1.5 rounded-md hover:bg-slate-50 flex items-center gap-2">
                        <t.icon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-slate-800 truncate">{a.judul}</div>
                          <div className="text-[10px] text-slate-500">{t.label} · v{a.version || '1.0'}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
              {results.smes.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1"><Award className="w-3 h-3" />SME</div>
                  {results.smes.map(s => (
                    <button key={s.id} onClick={() => go('km-sme')} className="w-full text-left px-2 py-1.5 rounded-md hover:bg-slate-50 flex items-center gap-2">
                      <Avatar nama={s.peg?.nama || '??'} size="xs" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-slate-800 truncate">{s.peg?.nama || 'Unknown'}</div>
                        <div className="text-[10px] text-slate-500 truncate">{s.domain}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {results.pegawai.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1"><Users className="w-3 h-3" />Pegawai</div>
                  {results.pegawai.map(p => (
                    <button key={p.id} onClick={() => go('pegawai')} className="w-full text-left px-2 py-1.5 rounded-md hover:bg-slate-50 flex items-center gap-2">
                      <Avatar nama={p.nama} size="xs" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-slate-800 truncate">{p.nama}</div>
                        <div className="text-[10px] text-slate-500 truncate">{p.jabatan} · {p.divisi}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {results.cops.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1"><Network className="w-3 h-3" />Community of Practice</div>
                  {results.cops.map(c => (
                    <button key={c.id} onClick={() => go('km-cop')} className="w-full text-left px-2 py-1.5 rounded-md hover:bg-slate-50">
                      <div className="text-xs font-medium text-slate-800">{c.nama}</div>
                      <div className="text-[10px] text-slate-500">{c.anggota} anggota · {c.engagement}% engagement</div>
                    </button>
                  ))}
                </div>
              )}
              {results.paths.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1"><Route className="w-3 h-3" />Learning Path</div>
                  {results.paths.map(p => (
                    <button key={p.id} onClick={() => go('km-paths')} className="w-full text-left px-2 py-1.5 rounded-md hover:bg-slate-50">
                      <div className="text-xs font-medium text-slate-800 truncate">{p.title}</div>
                      <div className="text-[10px] text-slate-500">{p.targetRole} · {p.steps.length} step</div>
                    </button>
                  ))}
                </div>
              )}
              {results.questions.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1"><HelpCircle className="w-3 h-3" />Pertanyaan</div>
                  {results.questions.map(qq => (
                    <button key={qq.id} onClick={() => go('km-qa')} className="w-full text-left px-2 py-1.5 rounded-md hover:bg-slate-50">
                      <div className="text-xs font-medium text-slate-800 truncate">{qq.title}</div>
                      <div className="text-[10px] text-slate-500">{qq.domain} · {QUESTION_STATUS[qq.status]?.label}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="px-3 py-2 border-t border-slate-100 text-[10px] text-slate-400 bg-slate-50/50">
            Tekan <kbd className="px-1 bg-white border border-slate-200 rounded">Esc</kbd> untuk tutup · {results.total} hasil
          </div>
        </div>
      )}
    </div>
  );
};

const TopBar = ({ title, subtitle, data, onNavigate, actions, onMenu }) => (
  <header className="bg-white border-b border-slate-200 px-5 py-3 flex items-center gap-3 flex-shrink-0 relative z-30">
    <button onClick={onMenu} className="md:hidden p-1.5 hover:bg-slate-100 rounded-md">
      <Menu className="w-5 h-5 text-slate-600" />
    </button>
    <div className="flex-1 min-w-0">
      <h1 className="text-base font-semibold text-slate-800 truncate">{title}</h1>
      {subtitle && <p className="text-xs text-slate-500 truncate">{subtitle}</p>}
    </div>
    {data && onNavigate && <GlobalSearch data={data} onNavigate={onNavigate} />}
    {actions && <div className="flex gap-2 items-center">{actions}</div>}
  </header>
);

// =================================================================================
// MODULE: DASHBOARD
// =================================================================================

const Dashboard = ({ data, onNavigate }) => {
  const stats = useMemo(() => {
    const pending = data.pengajuan.filter(p => p.status === 'pending' || p.status === 'review').length;
    const totalBiaya = data.pengajuan.filter(p => p.status === 'approved' || p.status === 'completed').reduce((s, p) => s + p.biaya, 0);
    const completed = data.pengajuan.filter(p => p.status === 'completed').length;
    return {
      totalPengajuan: data.pengajuan.length,
      pending, completed,
      totalBiaya,
      totalSME: data.sme.length,
      totalAsset: data.knowledgeAsset.length,
      totalCoP: data.cop.length,
      totalPegawai: data.pegawai.length,
    };
  }, [data]);

  const recentPengajuan = useMemo(() =>
    [...data.pengajuan].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
  , [data.pengajuan]);

  return (
    <div className="p-5 space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Pengajuan" value={stats.totalPengajuan} icon={Send} color="blue" delta={`${stats.pending} menunggu`} deltaColor="amber" />
        <StatCard label="Realisasi Biaya" value={formatIDR(stats.totalBiaya).replace('Rp ','')} unit="Rp" icon={BarChart3} color="emerald" delta={`${stats.completed} pelatihan selesai`} />
        <StatCard label="Knowledge Asset" value={stats.totalAsset} icon={Database} color="violet" delta="Library KM aktif" />
        <StatCard label="SME Aktif" value={stats.totalSME} icon={Award} color="amber" delta={`${stats.totalCoP} CoP aktif`} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-800">Pengajuan Pelatihan Terkini</h3>
            <button onClick={() => onNavigate('pengajuan')} className="text-xs text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1">
              Lihat semua <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2">
            {recentPengajuan.length === 0 ? (
              <EmptyState icon={Send} title="Belum ada pengajuan" description="Pengajuan pelatihan terbaru akan muncul di sini." />
            ) : recentPengajuan.map(pg => {
              const peg = findPegawai(data, pg.pegawaiId);
              const stat = PENGAJUAN_STATUS[pg.status];
              return (
                <div key={pg.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                  <Avatar nama={peg?.nama || '??'} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate">{pg.judul}</div>
                    <div className="text-xs text-slate-500 truncate">{peg?.nama} · {peg?.divisi} · {formatDate(pg.tanggalMulai)}</div>
                  </div>
                  <Badge className={stat.color}>{stat.label}</Badge>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Aktivitas KM</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">Top SME Kontribusi</span>
              <span className="font-medium text-slate-800">{data.sme[0] ? findPegawai(data, data.sme[0].pegawaiId)?.nama : '-'}</span>
            </div>
            <div className="space-y-2">
              {data.cop.slice(0, 4).map(c => (
                <div key={c.id}>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-700 truncate pr-2">{c.nama}</span>
                    <span className="text-slate-500">{c.engagement}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${c.engagement > 70 ? 'bg-emerald-500' : c.engagement > 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
                         style={{ width: `${c.engagement}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => onNavigate('km-cop')} className="text-xs text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1 pt-1">
              Detail CoP <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <button onClick={() => onNavigate('pengajuan')} className="text-left">
          <Card className="hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <Send className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-slate-800">Ajukan Pelatihan</div>
                <div className="text-xs text-slate-500">Form pengajuan baru</div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </Card>
        </button>
        <button onClick={() => onNavigate('km-asset')} className="text-left">
          <Card className="hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-50 text-violet-700 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-slate-800">Knowledge Asset</div>
                <div className="text-xs text-slate-500">Repositori dokumen KM</div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </Card>
        </button>
        <button onClick={() => onNavigate('tms-overview')} className="text-left">
          <Card className="hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-slate-800">Talent Management</div>
                <div className="text-xs text-slate-500">Acquisition → Development → Alignment</div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </Card>
        </button>
      </div>
    </div>
  );
};

// =================================================================================
// MODULE: PENGAJUAN PELATIHAN
// =================================================================================

const PengajuanForm = ({ data, initial, onSave, onCancel }) => {
  const [form, setForm] = useState(initial || {
    pegawaiId: data.pegawai[0]?.id || '',
    judul: '', jenis: 'Internal', tanggalMulai: '', tanggalSelesai: '',
    biaya: 0, penyelenggara: '', alasan: '', status: 'pending',
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.judul.trim()) e.judul = 'Wajib diisi';
    if (!form.pegawaiId) e.pegawaiId = 'Pilih pegawai';
    if (!form.tanggalMulai) e.tanggalMulai = 'Wajib diisi';
    if (!form.tanggalSelesai) e.tanggalSelesai = 'Wajib diisi';
    if (form.biaya < 0) e.biaya = 'Tidak valid';
    if (!form.alasan.trim()) e.alasan = 'Wajib diisi';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) onSave(form);
  };

  return (
    <div className="p-5 space-y-3">
      <Select label="Pegawai Pengaju *" value={form.pegawaiId}
        onChange={e => setForm({ ...form, pegawaiId: e.target.value })}
        options={data.pegawai.map(p => ({ value: p.id, label: `${p.nama} — ${p.divisi}` }))} />
      <Input label="Judul Pelatihan *" value={form.judul} error={errors.judul}
        onChange={e => setForm({ ...form, judul: e.target.value })} placeholder="contoh: Sertifikasi CISA 2025" />
      <div className="grid grid-cols-2 gap-3">
        <Select label="Jenis *" value={form.jenis} onChange={e => setForm({ ...form, jenis: e.target.value })}
          options={JENIS_PELATIHAN.map(j => ({ value: j, label: j }))} />
        <Input label="Penyelenggara" value={form.penyelenggara}
          onChange={e => setForm({ ...form, penyelenggara: e.target.value })} placeholder="contoh: ISACA" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Tanggal Mulai *" type="date" value={form.tanggalMulai} error={errors.tanggalMulai}
          onChange={e => setForm({ ...form, tanggalMulai: e.target.value })} />
        <Input label="Tanggal Selesai *" type="date" value={form.tanggalSelesai} error={errors.tanggalSelesai}
          onChange={e => setForm({ ...form, tanggalSelesai: e.target.value })} />
      </div>
      <Input label="Biaya (Rp)" type="number" value={form.biaya} error={errors.biaya}
        onChange={e => setForm({ ...form, biaya: parseInt(e.target.value) || 0 })} />
      <Textarea label="Alasan / Justifikasi *" value={form.alasan} error={errors.alasan}
        onChange={e => setForm({ ...form, alasan: e.target.value })}
        placeholder="Jelaskan urgensi & manfaat pelatihan ini untuk BPKH" />
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="ghost" onClick={onCancel}>Batal</Button>
        <Button variant="primary" icon={Save} onClick={handleSubmit}>Simpan Pengajuan</Button>
      </div>
    </div>
  );
};

const PengajuanModule = ({ data, onUpdate, showToast }) => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [harvestFor, setHarvestFor] = useState(null);
  const [harvestForm, setHarvestForm] = useState({ summary: '', recommendation: '', keyTakeaways: '' });

  const isHarvested = (pengajuanId) => data.knowledgeAsset.some(a => a.harvestedFrom === pengajuanId);

  const submitHarvest = () => {
    if (!harvestFor) return;
    if (!harvestForm.summary.trim()) { showToast('Ringkasan lessons learned wajib diisi', 'error'); return; }
    const peg = findPegawai(data, harvestFor.pegawaiId);
    const now = new Date();
    const review = new Date(now); review.setMonth(review.getMonth() + 12);
    const newAsset = {
      id: uid('ka'),
      judul: `Lessons Learned: ${harvestFor.judul}`,
      type: 'lesson',
      tags: [harvestFor.jenis, peg?.divisi || 'Umum'].filter(Boolean),
      owner: harvestFor.pegawaiId,
      description: `**Pelatihan:** ${harvestFor.judul} (${harvestFor.penyelenggara || '-'})\n**Peserta:** ${peg?.nama || '-'}\n\n**Ringkasan:**\n${harvestForm.summary}\n\n**Key Takeaways:**\n${harvestForm.keyTakeaways}\n\n**Rekomendasi:**\n${harvestForm.recommendation}`,
      status: 'published', version: '1.0',
      reviewDate: review.toISOString().split('T')[0],
      ratingsUp: 0, ratingsDown: 0, comments: [], views: 0,
      lastViewedAt: now.toISOString(), createdAt: now.toISOString(),
      harvestedFrom: harvestFor.id,
    };
    onUpdate({ ...data, knowledgeAsset: [newAsset, ...data.knowledgeAsset] });
    showToast('Lessons learned berhasil dipublish ke Knowledge Asset');
    setHarvestFor(null);
    setHarvestForm({ summary: '', recommendation: '', keyTakeaways: '' });
  };

  const filtered = useMemo(() => {
    return data.pengajuan
      .filter(p => filter === 'all' || p.status === filter)
      .filter(p => {
        if (!search) return true;
        const peg = findPegawai(data, p.pegawaiId);
        const q = search.toLowerCase();
        return p.judul.toLowerCase().includes(q) || peg?.nama.toLowerCase().includes(q);
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [data, filter, search]);

  const counts = useMemo(() => ({
    all: data.pengajuan.length,
    pending: data.pengajuan.filter(p => p.status === 'pending').length,
    review: data.pengajuan.filter(p => p.status === 'review').length,
    approved: data.pengajuan.filter(p => p.status === 'approved').length,
    completed: data.pengajuan.filter(p => p.status === 'completed').length,
  }), [data]);

  const handleSave = (form) => {
    if (editing) {
      const updated = data.pengajuan.map(p => p.id === editing.id ? { ...p, ...form } : p);
      onUpdate({ ...data, pengajuan: updated });
      showToast('Pengajuan diperbarui');
    } else {
      const newP = { ...form, id: uid('pg'), createdAt: new Date().toISOString() };
      onUpdate({ ...data, pengajuan: [newP, ...data.pengajuan] });
      showToast('Pengajuan baru ditambahkan');
    }
    setModalOpen(false);
    setEditing(null);
  };

  const handleStatusChange = (id, newStatus) => {
    onUpdate({ ...data, pengajuan: data.pengajuan.map(p => p.id === id ? { ...p, status: newStatus } : p) });
    showToast(`Status diubah menjadi: ${PENGAJUAN_STATUS[newStatus].label}`);
    if (viewing?.id === id) setViewing({ ...viewing, status: newStatus });
  };

  const handleDelete = (id) => {
    if (!window.confirm('Hapus pengajuan ini?')) return;
    onUpdate({ ...data, pengajuan: data.pengajuan.filter(p => p.id !== id) });
    showToast('Pengajuan dihapus', 'info');
  };

  return (
    <div className="p-5">
      <Card padding="p-0" className="overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            {[
              { v: 'all', l: 'Semua', n: counts.all },
              { v: 'pending', l: 'Menunggu', n: counts.pending },
              { v: 'review', l: 'Review', n: counts.review },
              { v: 'approved', l: 'Disetujui', n: counts.approved },
              { v: 'completed', l: 'Selesai', n: counts.completed },
            ].map(t => (
              <button key={t.v} onClick={() => setFilter(t.v)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  filter === t.v ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'
                }`}>
                {t.l} {t.n > 0 && <span className="text-slate-400">({t.n})</span>}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 bg-slate-100 rounded-md px-3 py-1.5 flex-1 min-w-0 max-w-xs">
            <Search className="w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari judul/pegawai..."
              className="bg-transparent outline-none text-sm w-full" />
          </div>
          <div className="ml-auto">
            <Button variant="primary" icon={Plus} onClick={() => { setEditing(null); setModalOpen(true); }}>
              Pengajuan Baru
            </Button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={Send} title="Tidak ada pengajuan"
            description={search ? 'Tidak ada yang cocok dengan pencarian.' : 'Mulai dengan menambahkan pengajuan baru.'}
            action={<Button variant="primary" icon={Plus} onClick={() => setModalOpen(true)}>Pengajuan Baru</Button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs text-slate-600">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium">Judul & Pegawai</th>
                  <th className="text-left px-4 py-2.5 font-medium">Jenis</th>
                  <th className="text-left px-4 py-2.5 font-medium">Tanggal</th>
                  <th className="text-right px-4 py-2.5 font-medium">Biaya</th>
                  <th className="text-left px-4 py-2.5 font-medium">Status</th>
                  <th className="text-right px-4 py-2.5 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(pg => {
                  const peg = findPegawai(data, pg.pegawaiId);
                  const stat = PENGAJUAN_STATUS[pg.status];
                  return (
                    <tr key={pg.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{pg.judul}</div>
                        <div className="text-xs text-slate-500">{peg?.nama} · {peg?.divisi}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">{pg.jenis}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{formatDate(pg.tanggalMulai)}</td>
                      <td className="px-4 py-3 text-xs text-slate-700 text-right font-mono">{formatIDR(pg.biaya)}</td>
                      <td className="px-4 py-3"><Badge className={stat.color}>{stat.label}</Badge></td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex gap-1">
                          <button onClick={() => setViewing(pg)} className="p-1 hover:bg-slate-100 rounded text-slate-500" title="Lihat detail">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => { setEditing(pg); setModalOpen(true); }} className="p-1 hover:bg-slate-100 rounded text-slate-500" title="Edit">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(pg.id)} className="p-1 hover:bg-rose-50 rounded text-rose-500" title="Hapus">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }}
        title={editing ? 'Edit Pengajuan' : 'Pengajuan Pelatihan Baru'} size="lg">
        <PengajuanForm data={data} initial={editing} onSave={handleSave} onCancel={() => { setModalOpen(false); setEditing(null); }} />
      </Modal>

      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Detail Pengajuan" size="lg">
        {viewing && (() => {
          const peg = findPegawai(data, viewing.pegawaiId);
          return (
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-3 pb-3 border-b border-slate-100">
                <Avatar nama={peg?.nama || '??'} size="lg" />
                <div className="flex-1">
                  <div className="text-base font-semibold text-slate-800">{viewing.judul}</div>
                  <div className="text-sm text-slate-600">{peg?.nama} · {peg?.jabatan}</div>
                  <div className="text-xs text-slate-500">{peg?.divisi}</div>
                </div>
                <Badge className={PENGAJUAN_STATUS[viewing.status].color}>{PENGAJUAN_STATUS[viewing.status].label}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-xs text-slate-500 block">Jenis</span><span className="font-medium">{viewing.jenis}</span></div>
                <div><span className="text-xs text-slate-500 block">Penyelenggara</span><span className="font-medium">{viewing.penyelenggara || '-'}</span></div>
                <div><span className="text-xs text-slate-500 block">Tanggal Mulai</span><span className="font-medium">{formatDate(viewing.tanggalMulai)}</span></div>
                <div><span className="text-xs text-slate-500 block">Tanggal Selesai</span><span className="font-medium">{formatDate(viewing.tanggalSelesai)}</span></div>
                <div className="col-span-2"><span className="text-xs text-slate-500 block">Biaya</span><span className="font-medium text-emerald-700">{formatIDR(viewing.biaya)}</span></div>
                <div className="col-span-2"><span className="text-xs text-slate-500 block">Alasan / Justifikasi</span><span className="text-sm text-slate-700">{viewing.alasan}</span></div>
              </div>
              <div className="pt-3 border-t border-slate-100">
                <div className="text-xs font-medium text-slate-600 mb-2">Workflow Approval</div>
                <div className="flex flex-wrap gap-2">
                  {viewing.status !== 'approved' && viewing.status !== 'completed' && (
                    <Button variant="primary" icon={CheckCircle} size="sm" onClick={() => handleStatusChange(viewing.id, 'approved')}>Setujui</Button>
                  )}
                  {viewing.status === 'pending' && (
                    <Button size="sm" onClick={() => handleStatusChange(viewing.id, 'review')}>Kirim ke HR Review</Button>
                  )}
                  {viewing.status === 'approved' && (
                    <Button size="sm" icon={Award} onClick={() => handleStatusChange(viewing.id, 'completed')}>Tandai Selesai</Button>
                  )}
                  {viewing.status !== 'rejected' && viewing.status !== 'completed' && (
                    <Button variant="danger" icon={XCircle} size="sm" onClick={() => handleStatusChange(viewing.id, 'rejected')}>Tolak</Button>
                  )}
                </div>
              </div>

              {viewing.status === 'completed' && (
                <div className="pt-3 border-t border-slate-100">
                  {isHarvested(viewing.id) ? (
                    <div className="flex items-center gap-2 p-2.5 bg-emerald-50 rounded-md text-xs text-emerald-800">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" />
                      Lessons learned dari pelatihan ini sudah di-harvest menjadi Knowledge Asset.
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-md">
                      <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-xs font-medium text-amber-900">Harvest Lessons Learned</div>
                        <div className="text-[11px] text-amber-700 mb-2">Tangkap insight dari pelatihan ini supaya bisa dipakai pegawai lain. Hasilnya jadi Knowledge Asset.</div>
                        <Button size="sm" variant="primary" icon={Lightbulb} onClick={() => { setHarvestFor(viewing); setViewing(null); }}>Mulai Harvest</Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })()}
      </Modal>

      <Modal open={!!harvestFor} onClose={() => setHarvestFor(null)} title="Harvest Lessons Learned" size="lg">
        {harvestFor && (
          <div className="p-5 space-y-3">
            <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-md">
              <b>Pelatihan:</b> {harvestFor.judul}<br />
              <b>Peserta:</b> {findPegawai(data, harvestFor.pegawaiId)?.nama}<br />
              <b>Penyelenggara:</b> {harvestFor.penyelenggara || '-'}
            </div>
            <Textarea label="Ringkasan Pelatihan *" value={harvestForm.summary}
              onChange={e => setHarvestForm({ ...harvestForm, summary: e.target.value })}
              placeholder="Apa yang dipelajari, apa yang menarik, materi apa yang paling penting..." />
            <Textarea label="Key Takeaways (3-5 poin kunci)" value={harvestForm.keyTakeaways}
              onChange={e => setHarvestForm({ ...harvestForm, keyTakeaways: e.target.value })}
              placeholder="• Poin penting 1&#10;• Poin penting 2&#10;• ..." />
            <Textarea label="Rekomendasi untuk BPKH" value={harvestForm.recommendation}
              onChange={e => setHarvestForm({ ...harvestForm, recommendation: e.target.value })}
              placeholder="Bagaimana ini bisa diterapkan di BPKH? Siapa yang perlu tahu? Quick-win apa?" />
            <div className="text-[11px] text-slate-600 bg-blue-50 p-2 rounded-md flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>Hasil harvest akan otomatis dipublish sebagai Knowledge Asset (tipe: Lesson Learned), tagged dengan jenis pelatihan & divisi peserta.</span>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setHarvestFor(null)}>Batal</Button>
              <Button variant="primary" icon={Save} onClick={submitHarvest}>Publish Lessons Learned</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// =================================================================================
// MODULE: PEGAWAI
// =================================================================================

const PegawaiModule = ({ data, showToast }) => {
  const [search, setSearch] = useState('');
  const [divFilter, setDivFilter] = useState('all');
  const [viewing, setViewing] = useState(null);

  const filtered = useMemo(() =>
    data.pegawai.filter(p => {
      const matchSearch = !search || p.nama.toLowerCase().includes(search.toLowerCase()) || p.jabatan.toLowerCase().includes(search.toLowerCase());
      const matchDiv = divFilter === 'all' || p.divisi === divFilter;
      return matchSearch && matchDiv;
    })
  , [data, search, divFilter]);

  const getSME = (id) => data.sme.find(s => s.pegawaiId === id);
  const getTalent = (id) => data.talentPool.find(t => t.pegawaiId === id);

  return (
    <div className="p-5">
      <Card padding="p-0">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-100 rounded-md px-3 py-1.5 flex-1 min-w-0 max-w-xs">
            <Search className="w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama/jabatan..."
              className="bg-transparent outline-none text-sm w-full" />
          </div>
          <Select value={divFilter} onChange={e => setDivFilter(e.target.value)}
            options={[{ value: 'all', label: 'Semua Divisi' }, ...DIVISI_LIST.map(d => ({ value: d, label: d }))]} />
          <div className="ml-auto text-xs text-slate-500">{filtered.length} dari {data.pegawai.length} pegawai</div>
        </div>
        <div className="divide-y divide-slate-100">
          {filtered.map(p => {
            const sme = getSME(p.id);
            const talent = getTalent(p.id);
            return (
              <button key={p.id} onClick={() => setViewing(p)}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left">
                <Avatar nama={p.nama} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-slate-800">{p.nama}</div>
                  <div className="text-xs text-slate-500 truncate">{p.jabatan} · {p.divisi}</div>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  {sme && <Badge className="bg-violet-100 text-violet-800"><Award className="w-3 h-3" />{SME_LEVEL[sme.level].label}</Badge>}
                  {talent && <Badge className="bg-amber-100 text-amber-800"><Star className="w-3 h-3" />Talent Pool</Badge>}
                </div>
                <div className="text-right text-xs">
                  <div className="text-slate-700 font-medium">{p.performance.toFixed(1)}</div>
                  <div className="text-slate-400">Kinerja</div>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Detail Pegawai" size="lg">
        {viewing && (() => {
          const sme = getSME(viewing.id);
          const talent = getTalent(viewing.id);
          const pengajuanPeg = data.pengajuan.filter(pg => pg.pegawaiId === viewing.id);
          return (
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
                <Avatar nama={viewing.nama} size="lg" />
                <div className="flex-1">
                  <div className="text-lg font-semibold text-slate-800">{viewing.nama}</div>
                  <div className="text-sm text-slate-600">{viewing.jabatan}</div>
                  <div className="text-xs text-slate-500 mt-0.5">NIP: {viewing.nip} · {viewing.email}</div>
                  <div className="flex gap-1 mt-2">
                    {sme && <Badge className="bg-violet-100 text-violet-800"><Award className="w-3 h-3" />SME {SME_LEVEL[sme.level].label}</Badge>}
                    {talent && <Badge className="bg-amber-100 text-amber-800"><Star className="w-3 h-3" />Talent Pool</Badge>}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Card padding="p-3" className="!bg-emerald-50 !border-emerald-100">
                  <div className="text-xs text-emerald-700">Performance Score</div>
                  <div className="text-2xl font-semibold text-emerald-800">{viewing.performance.toFixed(1)}<span className="text-sm text-emerald-600"> / 5</span></div>
                </Card>
                <Card padding="p-3" className="!bg-blue-50 !border-blue-100">
                  <div className="text-xs text-blue-700">Kompetensi Score</div>
                  <div className="text-2xl font-semibold text-blue-800">{viewing.kompetensi.toFixed(1)}<span className="text-sm text-blue-600"> / 5</span></div>
                </Card>
              </div>
              {sme && (
                <div>
                  <div className="text-xs font-medium text-slate-600 mb-1.5">Domain Keahlian (SME)</div>
                  <div className="text-sm text-slate-800">{sme.domain}</div>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {sme.sertifikasi.map(c => <Badge key={c} className="bg-violet-50 text-violet-700">{c}</Badge>)}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{sme.kontribusi} kontribusi knowledge sharing</div>
                </div>
              )}
              <div>
                <div className="text-xs font-medium text-slate-600 mb-1.5">Riwayat Pelatihan ({pengajuanPeg.length})</div>
                {pengajuanPeg.length === 0 ? (
                  <div className="text-xs text-slate-500 italic">Belum ada riwayat pelatihan</div>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {pengajuanPeg.map(pg => (
                      <div key={pg.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-md">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-slate-700 truncate">{pg.judul}</div>
                          <div className="text-[10px] text-slate-500">{formatDate(pg.tanggalMulai)}</div>
                        </div>
                        <Badge className={PENGAJUAN_STATUS[pg.status].color}>{PENGAJUAN_STATUS[pg.status].label}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};

// =================================================================================
// MODULE: SME DIRECTORY
// =================================================================================

const SMEModule = ({ data, onUpdate, showToast }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ pegawaiId: '', domain: '', level: 'mid', sertifikasi: '' });

  const handleSave = () => {
    if (!form.pegawaiId || !form.domain) {
      showToast('Lengkapi pegawai & domain', 'error');
      return;
    }
    const newSME = {
      id: uid('sme'), pegawaiId: form.pegawaiId, domain: form.domain, level: form.level,
      sertifikasi: form.sertifikasi.split(',').map(s => s.trim()).filter(Boolean),
      kontribusi: 0,
    };
    onUpdate({ ...data, sme: [...data.sme, newSME] });
    showToast('SME berhasil ditambahkan');
    setModalOpen(false);
    setForm({ pegawaiId: '', domain: '', level: 'mid', sertifikasi: '' });
  };

  const availablePegawai = data.pegawai.filter(p => !data.sme.find(s => s.pegawaiId === p.id));

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-base font-semibold text-slate-800">SME Development</h2>
          <p className="text-xs text-slate-500">Pengembangan Subject Matter Expert per domain keahlian</p>
        </div>
        <Button variant="primary" icon={UserPlus} onClick={() => setModalOpen(true)}>Tambah SME</Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {data.sme.map(sme => {
          const peg = findPegawai(data, sme.pegawaiId);
          if (!peg) return null;
          const lvl = SME_LEVEL[sme.level];
          return (
            <Card key={sme.id}>
              <div className="flex items-start gap-3 mb-3">
                <Avatar nama={peg.nama} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-slate-800 truncate">{peg.nama}</div>
                  <div className="text-xs text-slate-500 truncate">{peg.jabatan}</div>
                </div>
                <Badge className="bg-violet-100 text-violet-800">{lvl.label}</Badge>
              </div>
              <div className="text-xs text-slate-600 mb-2">{sme.domain}</div>
              <div className="flex items-center gap-1 mb-3">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className={`w-2 h-2 rounded-full ${i <= lvl.dots ? lvl.color : 'bg-slate-200'}`} />
                ))}
                <span className="text-[10px] text-slate-500 ml-1">{sme.kontribusi} kontribusi</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {sme.sertifikasi.slice(0, 4).map(c => <Badge key={c} className="bg-violet-50 text-violet-700">{c}</Badge>)}
                {sme.sertifikasi.length > 4 && <Badge>+{sme.sertifikasi.length - 4}</Badge>}
              </div>
            </Card>
          );
        })}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Tambah SME Baru">
        <div className="p-5 space-y-3">
          <Select label="Pegawai *" value={form.pegawaiId} onChange={e => setForm({ ...form, pegawaiId: e.target.value })}
            options={[{ value: '', label: 'Pilih pegawai...' }, ...availablePegawai.map(p => ({ value: p.id, label: p.nama }))]} />
          <Input label="Domain Keahlian *" value={form.domain} onChange={e => setForm({ ...form, domain: e.target.value })}
            placeholder="contoh: GRC, Audit Internal" />
          <Select label="Level Expertise" value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}
            options={Object.entries(SME_LEVEL).map(([v, l]) => ({ value: v, label: l.label }))} />
          <Input label="Sertifikasi (pisahkan dengan koma)" value={form.sertifikasi}
            onChange={e => setForm({ ...form, sertifikasi: e.target.value })} placeholder="CISA, CISM, CISSP" />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button variant="primary" icon={Save} onClick={handleSave}>Simpan</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// =================================================================================
// MODULE: KNOWLEDGE MAP
// =================================================================================

const KnowledgeMapModule = ({ data }) => {
  const domains = useMemo(() => {
    const domainMap = {};
    data.sme.forEach(s => {
      s.domain.split(',').map(d => d.trim()).forEach(d => {
        if (!domainMap[d]) domainMap[d] = { count: 0, smeIds: [] };
        domainMap[d].count++;
        domainMap[d].smeIds.push(s.pegawaiId);
      });
    });
    return Object.entries(domainMap).map(([name, info]) => ({
      name, count: info.count,
      status: info.count >= 2 ? 'matang' : info.count === 1 ? 'berkembang' : 'gap',
    })).sort((a, b) => b.count - a.count);
  }, [data]);

  const statusColors = {
    matang: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    berkembang: 'bg-amber-100 text-amber-800 border-amber-200',
    gap: 'bg-rose-100 text-rose-800 border-rose-200',
  };

  return (
    <div className="p-5 space-y-4">
      <div>
        <h2 className="text-base font-semibold text-slate-800">Knowledge Map</h2>
        <p className="text-xs text-slate-500">Pemetaan domain pengetahuan & identifikasi gap</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Domain Matang" value={domains.filter(d => d.status === 'matang').length} icon={CheckCircle} color="emerald" delta="≥ 2 SME per domain" />
        <StatCard label="Domain Berkembang" value={domains.filter(d => d.status === 'berkembang').length} icon={AlertCircle} color="amber" delta="1 SME, perlu mentoring" />
        <StatCard label="Gap Domain" value={domains.filter(d => d.status === 'gap').length} icon={AlertTriangle} color="rose" delta="Belum ada SME" />
      </div>

      <Card>
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Distribusi Domain Pengetahuan</h3>
        <div className="space-y-2">
          {domains.map(d => (
            <div key={d.name} className={`flex items-center justify-between p-3 rounded-lg border ${statusColors[d.status]}`}>
              <div className="flex items-center gap-3">
                <Map className="w-4 h-4" />
                <span className="text-sm font-medium">{d.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs">{d.count} SME</span>
                <Badge className="bg-white/50 text-current">{d.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Rekomendasi Pengembangan</h3>
        <div className="space-y-2 text-sm">
          {domains.filter(d => d.status !== 'matang').slice(0, 3).map(d => (
            <div key={d.name} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
              <Sparkles className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-slate-700">
                <span className="font-medium">{d.name}</span> — {d.status === 'gap'
                  ? 'belum ada SME. Pertimbangkan rekrutmen atau pengembangan internal melalui pelatihan & sertifikasi.'
                  : 'baru 1 SME. Risiko knowledge concentration; siapkan mentee/backup melalui mentoring program.'}
              </div>
            </div>
          ))}
          {domains.filter(d => d.status !== 'matang').length === 0 && (
            <div className="text-xs text-slate-500">Semua domain sudah matang. Pertahankan dengan rotasi & refresh training.</div>
          )}
        </div>
      </Card>
    </div>
  );
};

// =================================================================================
// MODULE: COMMUNITY OF PRACTICE
// =================================================================================

const CoPModule = ({ data }) => {
  return (
    <div className="p-5 space-y-4">
      <div>
        <h2 className="text-base font-semibold text-slate-800">Community of Practice</h2>
        <p className="text-xs text-slate-500">Pengembangan & penguatan komunitas pembelajar</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {data.cop.map(c => {
          const lead = findPegawai(data, c.lead);
          const status = c.engagement > 70 ? 'aktif' : c.engagement > 40 ? 'sedang' : 'perlu-revitalisasi';
          const colors = {
            'aktif': 'bg-emerald-500',
            'sedang': 'bg-amber-500',
            'perlu-revitalisasi': 'bg-rose-500',
          };
          return (
            <Card key={c.id}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-semibold text-sm text-slate-800">{c.nama}</div>
                  <div className="text-xs text-slate-500 mt-0.5">Lead: {lead?.nama}</div>
                </div>
                <Badge className="bg-slate-100 text-slate-700"><Users className="w-3 h-3" />{c.anggota}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-3">
                <div className="flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5" />{c.diskusiPerBulan} diskusi/bln</div>
                <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{c.nextEvent ? formatDate(c.nextEvent) : 'Belum dijadwal'}</div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-500">Engagement</span>
                  <span className="font-medium text-slate-700">{c.engagement}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${colors[status]}`} style={{ width: `${c.engagement}%` }} />
                </div>
              </div>
              {status === 'perlu-revitalisasi' && (
                <div className="mt-3 px-2.5 py-1.5 bg-rose-50 text-rose-700 rounded-md text-[11px] flex items-center gap-1.5">
                  <AlertTriangle className="w-3 h-3" />Perlu revitalisasi
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// =================================================================================
// MODULE: KNOWLEDGE ASSET
// =================================================================================

const AssetDetailModal = ({ data, asset, onUpdate, onClose, showToast, onNavigate }) => {
  const [commentText, setCommentText] = useState('');
  if (!asset) return null;
  const t = ASSET_TYPES[asset.type];
  const Icon = t.icon;
  const owner = findPegawai(data, asset.owner);
  const rels = assetRelations(data, asset);
  const bookmarked = isBookmarked(data, CURRENT_USER_ID, asset.id);
  const reviewIn = asset.reviewDate ? daysUntil(asset.reviewDate) : null;
  const ageDays = daysSince(asset.lastViewedAt || asset.createdAt);

  const updateAsset = (patch) => onUpdate({
    ...data,
    knowledgeAsset: data.knowledgeAsset.map(a => a.id === asset.id ? { ...a, ...patch } : a),
  });

  const handleRate = (dir) => updateAsset(dir === 'up'
    ? { ratingsUp: (asset.ratingsUp || 0) + 1 }
    : { ratingsDown: (asset.ratingsDown || 0) + 1 });

  const handleBookmark = () => {
    const list = data.bookmarks || [];
    onUpdate({
      ...data,
      bookmarks: bookmarked
        ? list.filter(b => !(b.userId === CURRENT_USER_ID && b.assetId === asset.id))
        : [...list, { id: uid('bm'), userId: CURRENT_USER_ID, assetId: asset.id, createdAt: new Date().toISOString() }],
    });
    showToast(bookmarked ? 'Bookmark dihapus' : 'Asset di-bookmark', 'info');
  };

  const handleComment = () => {
    if (!commentText.trim()) return;
    updateAsset({ comments: [...(asset.comments || []), { id: uid('c'), userId: CURRENT_USER_ID, text: commentText, createdAt: new Date().toISOString() }] });
    setCommentText('');
    showToast('Komentar ditambahkan');
  };

  const handleStatusChange = (status) => {
    updateAsset({ status });
    showToast(`Status: ${ASSET_STATUS[status].label}`);
  };

  return (
    <Modal open={!!asset} onClose={onClose} title="Detail Knowledge Asset" size="xl">
      <div className="p-5 space-y-4">
        <div className="flex items-start gap-3 pb-3 border-b border-slate-100">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${t.color}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 flex-wrap">
              <h3 className="text-base font-semibold text-slate-800 flex-1 min-w-0">{asset.judul}</h3>
              <StatusBadge status={asset.status || 'published'} map={ASSET_STATUS} />
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
              <span>{t.label}</span>
              <span>·</span>
              <span>v{asset.version || '1.0'}</span>
              <span>·</span>
              <span>Owner: {owner?.nama || 'Unknown'}</span>
              <span>·</span>
              <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{asset.views} views</span>
            </div>
          </div>
          <BookmarkBtn active={bookmarked} onToggle={handleBookmark} />
        </div>

        {reviewIn !== null && reviewIn <= 60 && (
          <div className={`flex items-start gap-2 p-2.5 rounded-md text-xs ${reviewIn < 0 ? 'bg-rose-50 text-rose-800' : 'bg-amber-50 text-amber-800'}`}>
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              {reviewIn < 0
                ? <><span className="font-medium">Review terlewat {Math.abs(reviewIn)} hari yang lalu.</span> Asset mungkin sudah tidak relevan — minta owner untuk update atau archive.</>
                : <><span className="font-medium">Review jatuh tempo dalam {reviewIn} hari.</span> Pastikan konten masih akurat.</>}
            </div>
          </div>
        )}

        {asset.description && <p className="text-sm text-slate-700 leading-relaxed">{asset.description}</p>}

        <div className="flex flex-wrap gap-1">
          {asset.tags.map(tag => <Badge key={tag} className="bg-slate-100 text-slate-700"><Tag className="w-3 h-3" />{tag}</Badge>)}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <Rating up={asset.ratingsUp || 0} down={asset.ratingsDown || 0} onUp={() => handleRate('up')} onDown={() => handleRate('down')} />
          <div className="flex items-center gap-1">
            {asset.status !== 'published' && (
              <Button size="sm" variant="primary" icon={CheckCircle} onClick={() => handleStatusChange('published')}>Publish</Button>
            )}
            {asset.status === 'published' && (
              <Button size="sm" icon={Archive} onClick={() => handleStatusChange('archived')}>Archive</Button>
            )}
            {asset.status === 'draft' && (
              <Button size="sm" icon={Clock} onClick={() => handleStatusChange('review')}>Kirim ke Review</Button>
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100">
          <div className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1.5"><Link2 className="w-3.5 h-3.5" />Relasi Knowledge Graph</div>
          <div className="grid sm:grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 bg-violet-50 rounded-md">
              <div className="text-[10px] font-medium text-violet-700 uppercase tracking-wide mb-1">SME terkait ({rels.smes.length})</div>
              {rels.smes.length === 0 ? <div className="text-slate-500 italic">Tidak ada</div> : rels.smes.slice(0,3).map(s => {
                const p = findPegawai(data, s.pegawaiId);
                return <div key={s.id} className="truncate text-violet-900">· {p?.nama}</div>;
              })}
            </div>
            <div className="p-2.5 bg-blue-50 rounded-md">
              <div className="text-[10px] font-medium text-blue-700 uppercase tracking-wide mb-1">CoP terkait ({rels.cops.length})</div>
              {rels.cops.length === 0 ? <div className="text-slate-500 italic">Tidak ada</div> : rels.cops.slice(0,3).map(c =>
                <div key={c.id} className="truncate text-blue-900">· {c.nama}</div>
              )}
            </div>
            <div className="p-2.5 bg-emerald-50 rounded-md">
              <div className="text-[10px] font-medium text-emerald-700 uppercase tracking-wide mb-1">Learning Path ({rels.paths.length})</div>
              {rels.paths.length === 0 ? <div className="text-slate-500 italic">Belum dipakai</div> : rels.paths.slice(0,3).map(p =>
                <button key={p.id} onClick={() => { onClose(); onNavigate('km-paths'); }} className="block truncate text-emerald-900 hover:underline text-left">· {p.title}</button>
              )}
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100">
          <div className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" />Diskusi ({(asset.comments || []).length})</div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {(asset.comments || []).length === 0 && <div className="text-xs text-slate-500 italic">Belum ada komentar.</div>}
            {(asset.comments || []).map(c => {
              const u = findPegawai(data, c.userId);
              return (
                <div key={c.id} className="flex gap-2">
                  <Avatar nama={u?.nama || '??'} size="xs" />
                  <div className="flex-1 bg-slate-50 rounded-md px-3 py-2">
                    <div className="text-[11px] font-medium text-slate-700">{u?.nama || 'Unknown'} <span className="text-slate-400 font-normal">· {formatDate(c.createdAt)}</span></div>
                    <div className="text-xs text-slate-700 mt-0.5">{c.text}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex gap-2">
            <input value={commentText} onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleComment()}
              placeholder="Tulis komentar atau pertanyaan..."
              className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500" />
            <Button variant="primary" icon={SendIcon} onClick={handleComment}>Kirim</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

const KnowledgeAssetModule = ({ data, onUpdate, showToast, onNavigate }) => {
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('views');
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ judul: '', type: 'sop', tags: '', owner: '', description: '', reviewMonths: 12 });
  const [viewing, setViewing] = useState(null);

  const myBookmarks = useMemo(() => new Set(userBookmarks(data, CURRENT_USER_ID).map(b => b.assetId)), [data]);

  const filtered = useMemo(() => {
    let list = data.knowledgeAsset.slice();
    if (typeFilter !== 'all') list = list.filter(a => a.type === typeFilter);
    if (statusFilter !== 'all') list = list.filter(a => (a.status || 'published') === statusFilter);
    if (showBookmarksOnly) list = list.filter(a => myBookmarks.has(a.id));
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(a => a.judul.toLowerCase().includes(q) || (a.description || '').toLowerCase().includes(q) || a.tags.some(t => t.toLowerCase().includes(q)));
    }
    const sorters = {
      views: (a, b) => b.views - a.views,
      newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      rating: (a, b) => ((b.ratingsUp || 0) - (b.ratingsDown || 0)) - ((a.ratingsUp || 0) - (a.ratingsDown || 0)),
      review: (a, b) => new Date(a.reviewDate || '2099-01-01') - new Date(b.reviewDate || '2099-01-01'),
    };
    return list.sort(sorters[sort] || sorters.views);
  }, [data.knowledgeAsset, typeFilter, statusFilter, showBookmarksOnly, search, sort, myBookmarks]);

  const handleSave = () => {
    if (!form.judul.trim()) { showToast('Judul wajib diisi', 'error'); return; }
    const now = new Date();
    const review = new Date(now); review.setMonth(review.getMonth() + (parseInt(form.reviewMonths) || 12));
    const newAsset = {
      id: uid('ka'), judul: form.judul, type: form.type,
      tags: form.tags.split(',').map(s => s.trim()).filter(Boolean),
      owner: form.owner || CURRENT_USER_ID, views: 0,
      description: form.description, status: 'draft', version: '1.0',
      reviewDate: review.toISOString().split('T')[0],
      ratingsUp: 0, ratingsDown: 0, comments: [], lastViewedAt: now.toISOString(),
      createdAt: now.toISOString(),
    };
    onUpdate({ ...data, knowledgeAsset: [newAsset, ...data.knowledgeAsset] });
    showToast('Knowledge asset ditambahkan (draft)');
    setModalOpen(false);
    setForm({ judul: '', type: 'sop', tags: '', owner: '', description: '', reviewMonths: 12 });
  };

  const handleOpenAsset = (asset) => {
    onUpdate({
      ...data,
      knowledgeAsset: data.knowledgeAsset.map(a => a.id === asset.id ? { ...a, views: (a.views || 0) + 1, lastViewedAt: new Date().toISOString() } : a),
    });
    setViewing(asset);
  };

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Knowledge Asset</h2>
          <p className="text-xs text-slate-500">Repositori dengan lifecycle, ratings, bookmarks & knowledge graph</p>
        </div>
        <div className="flex gap-2">
          <Button icon={Bookmark} variant={showBookmarksOnly ? 'primary' : 'default'} onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}>
            Bookmark Saya ({myBookmarks.size})
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setModalOpen(true)}>Tambah Asset</Button>
        </div>
      </div>

      <Card padding="p-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setTypeFilter('all')}
            className={`px-3 py-1 text-xs font-medium rounded-md ${typeFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
            Semua ({data.knowledgeAsset.length})
          </button>
          {Object.entries(ASSET_TYPES).map(([key, t]) => {
            const count = data.knowledgeAsset.filter(a => a.type === key).length;
            const Icon = t.icon;
            return (
              <button key={key} onClick={() => setTypeFilter(key)}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  typeFilter === key ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}>
                <Icon className="w-3 h-3" />{t.label} ({count})
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            options={[{ value: 'all', label: 'Semua status' }, ...Object.entries(ASSET_STATUS).map(([v, s]) => ({ value: v, label: s.label }))]} />
          <Select value={sort} onChange={e => setSort(e.target.value)}
            options={[
              { value: 'views', label: 'Sort: Paling Banyak Dilihat' },
              { value: 'newest', label: 'Sort: Terbaru' },
              { value: 'rating', label: 'Sort: Rating Tertinggi' },
              { value: 'review', label: 'Sort: Review Terdekat' },
            ]} />
          <div className="flex items-center gap-2 bg-slate-100 rounded-md px-3 py-1.5 flex-1 min-w-0 max-w-xs ml-auto">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari judul/deskripsi/tag..."
              className="bg-transparent outline-none text-xs w-full" />
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card><EmptyState icon={Database} title="Tidak ada asset" description={showBookmarksOnly ? 'Anda belum bookmark asset apapun.' : 'Coba ubah filter atau tambah asset baru.'} /></Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(a => {
            const t = ASSET_TYPES[a.type];
            const Icon = t.icon;
            const owner = findPegawai(data, a.owner);
            const score = (a.ratingsUp || 0) - (a.ratingsDown || 0);
            const reviewIn = a.reviewDate ? daysUntil(a.reviewDate) : null;
            const overdue = reviewIn !== null && reviewIn < 0;
            const due = reviewIn !== null && reviewIn >= 0 && reviewIn <= 30;
            return (
              <Card key={a.id} className="hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer relative" >
                <button onClick={() => handleOpenAsset(a)} className="absolute inset-0 w-full h-full" aria-label="Buka detail" />
                <div className="relative pointer-events-none">
                  <div className="flex items-start gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${t.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-slate-800 line-clamp-2">{a.judul}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                        <span>{t.label}</span><span>·</span><span>v{a.version || '1.0'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mb-2 flex-wrap">
                    <StatusBadge status={a.status || 'published'} map={ASSET_STATUS} />
                    {overdue && <Badge className="bg-rose-100 text-rose-700"><AlertTriangle className="w-3 h-3" />Review terlewat</Badge>}
                    {due && !overdue && <Badge className="bg-amber-100 text-amber-700"><Clock className="w-3 h-3" />Review {reviewIn}h</Badge>}
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {a.tags.slice(0,4).map(tag => <Badge key={tag} className="bg-slate-100 text-slate-700 text-[10px]">{tag}</Badge>)}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-100">
                    <span className="truncate">{owner?.nama || 'Unknown'}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{a.views}</span>
                      <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{score >= 0 ? '+' : ''}{score}</span>
                      {myBookmarks.has(a.id) && <Bookmark className="w-3 h-3 text-amber-500" fill="currentColor" />}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Tambah Knowledge Asset">
        <div className="p-5 space-y-3">
          <Input label="Judul Asset *" value={form.judul} onChange={e => setForm({ ...form, judul: e.target.value })}
            placeholder="contoh: SOP Pengelolaan Risiko v2.0" />
          <Textarea label="Deskripsi singkat" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="Jelaskan isi & manfaat asset ini..." />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Tipe Asset" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
              options={Object.entries(ASSET_TYPES).map(([v, t]) => ({ value: v, label: t.label }))} />
            <Select label="Owner" value={form.owner} onChange={e => setForm({ ...form, owner: e.target.value })}
              options={[{ value: '', label: '(saya sendiri)' }, ...data.pegawai.map(p => ({ value: p.id, label: p.nama }))]} />
          </div>
          <Input label="Tags (pisahkan dengan koma)" value={form.tags}
            onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="Audit, Risk, SOP" />
          <Select label="Review berikutnya" value={form.reviewMonths} onChange={e => setForm({ ...form, reviewMonths: e.target.value })}
            options={[{ value: 6, label: '6 bulan' }, { value: 12, label: '12 bulan' }, { value: 24, label: '24 bulan' }]} />
          <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded">Asset baru otomatis berstatus <b>Draft</b>. Publish setelah review owner.</div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button variant="primary" icon={Save} onClick={handleSave}>Simpan</Button>
          </div>
        </div>
      </Modal>

      <AssetDetailModal data={data} asset={viewing} onUpdate={onUpdate} showToast={showToast}
        onNavigate={onNavigate} onClose={() => setViewing(null)} />
    </div>
  );
};

// =================================================================================
// MODULE: TALENT MANAGEMENT SYSTEM — OVERVIEW (3-STAGE FLOW)
// =================================================================================

const TMSOverviewModule = ({ data, onNavigate }) => {
  const stats = useMemo(() => {
    const getBucket = (val) => val >= 4.2 ? 2 : val >= 3.5 ? 1 : 0;
    const matrix = Array(3).fill(null).map(() => Array(3).fill(0));
    data.pegawai.forEach(p => {
      const x = getBucket(p.performance);
      const y = 2 - getBucket(p.kompetensi);
      matrix[y][x]++;
    });
    const star = matrix[0][2];
    const highPot = matrix[0][1] + matrix[1][2];
    const corePlayer = matrix[1][1];
    const atRisk = matrix[2][0];

    const devPrograms = data.pengajuan.filter(p => p.status === 'approved' || p.status === 'review').length;
    const completed = data.pengajuan.filter(p => p.status === 'completed').length;

    const successionReady1y = data.succession.filter(s => s.readiness === '1y').length;
    const successionGap = data.succession.filter(s => s.kandidat.length === 0).length;

    return { star, highPot, corePlayer, atRisk, devPrograms, completed, successionReady1y, successionGap };
  }, [data]);

  return (
    <div className="p-5 space-y-4">
      {/* 3-STAGE FLOW HEADER */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr_auto_1fr] gap-3 items-stretch">
        <button onClick={() => onNavigate('tms-9box')}
          className="bg-emerald-600 hover:bg-emerald-700 transition-colors text-white rounded-xl p-4 text-left">
          <div className="text-[10px] font-medium opacity-80 tracking-wider mb-1">STAGE 01</div>
          <div className="text-lg font-semibold mb-2">Acquisition</div>
          <div className="flex flex-wrap gap-3 text-xs opacity-95">
            <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> Kompetensi + Performance</span>
            <span className="flex items-center gap-1"><Grid3x3 className="w-3 h-3" /> 9-Box Mapping</span>
          </div>
        </button>
        <div className="hidden lg:flex items-center text-slate-300"><ChevronRight className="w-5 h-5" /></div>
        <button onClick={() => onNavigate('km-sme')}
          className="bg-amber-500 hover:bg-amber-600 transition-colors text-white rounded-xl p-4 text-left">
          <div className="text-[10px] font-medium opacity-80 tracking-wider mb-1">STAGE 02</div>
          <div className="text-lg font-semibold mb-2">Development</div>
          <div className="flex flex-wrap gap-2 text-xs opacity-95">
            <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3" /> Training</span>
            <span className="flex items-center gap-1"><User className="w-3 h-3" /> Coaching</span>
            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Mentoring</span>
            <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> Job Assign.</span>
          </div>
        </button>
        <div className="hidden lg:flex items-center text-slate-300"><ChevronRight className="w-5 h-5" /></div>
        <button onClick={() => onNavigate('tms-succession')}
          className="bg-violet-600 hover:bg-violet-700 transition-colors text-white rounded-xl p-4 text-left">
          <div className="text-[10px] font-medium opacity-80 tracking-wider mb-1">STAGE 03</div>
          <div className="text-lg font-semibold mb-2">Alignment</div>
          <div className="flex flex-wrap gap-2 text-xs opacity-95">
            <span className="flex items-center gap-1"><Replace className="w-3 h-3" /> Succession Plan</span>
            <span className="flex items-center gap-1"><Star className="w-3 h-3" /> Talent Pool</span>
            <span className="flex items-center gap-1"><ArrowUpRight className="w-3 h-3" /> Promosi</span>
          </div>
        </button>
      </div>

      {/* INTEGRATION STRIP */}
      <Card padding="p-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            <Network className="w-3.5 h-3.5" /> Sumber Data Terintegrasi:
          </div>
          <Badge className="bg-blue-50 text-blue-800"><Activity className="w-3 h-3" />Penilaian Kinerja (IKU)</Badge>
          <Badge className="bg-rose-50 text-rose-800"><ClipboardCheck className="w-3 h-3" />Asesmen Pegawai</Badge>
          <Badge className="bg-emerald-50 text-emerald-800"><GraduationCap className="w-3 h-3" />Rencana Pelatihan (KMLS)</Badge>
          <div className="ml-auto flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
            <CheckCircle className="w-3 h-3" />Sinkron 5 menit lalu
          </div>
        </div>
      </Card>

      {/* KPI CARDS PER STAGE */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="★ Top Talent" value={stats.star} icon={Star} color="emerald" delta="Ready for C-Level" />
        <StatCard label="High Potential" value={stats.highPot} icon={TrendingUp} color="blue" delta="Akselerasi development" />
        <StatCard label="Program Aktif" value={stats.devPrograms} icon={GraduationCap} color="amber" delta={`${stats.completed} pelatihan selesai`} />
        <StatCard label="Successor Ready" value={stats.successionReady1y} icon={Replace} color="violet"
          delta={stats.successionGap > 0 ? `⚠ ${stats.successionGap} posisi tanpa kandidat` : 'Semua posisi covered'}
          deltaColor={stats.successionGap > 0 ? 'rose' : 'emerald'} />
      </div>

      {/* DETAIL ROW: 3 STAGES BREAKDOWN */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* STAGE 01 DETAIL */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-100 text-emerald-800">STAGE 01</Badge>
              <h3 className="text-sm font-semibold text-slate-800">Acquisition</h3>
            </div>
            <button onClick={() => onNavigate('tms-9box')}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1">
              Detail <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2 bg-emerald-50 rounded-md">
              <span className="text-emerald-900 font-medium">★ Star / Top Talent</span>
              <span className="font-semibold text-emerald-900">{stats.star} pegawai</span>
            </div>
            <div className="flex justify-between p-2 bg-blue-50 rounded-md">
              <span className="text-blue-900 font-medium">High Potential</span>
              <span className="font-semibold text-blue-900">{stats.highPot} pegawai</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-50 rounded-md">
              <span className="text-slate-700 font-medium">Core Player</span>
              <span className="font-semibold text-slate-700">{stats.corePlayer} pegawai</span>
            </div>
            {stats.atRisk > 0 && (
              <div className="flex justify-between p-2 bg-rose-50 rounded-md">
                <span className="text-rose-900 font-medium">⚠ Perlu PIP</span>
                <span className="font-semibold text-rose-900">{stats.atRisk} pegawai</span>
              </div>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            Hasil 9-Box Mapping otomatis dari data kinerja & kompetensi {data.pegawai.length} pegawai.
          </div>
        </Card>

        {/* STAGE 02 DETAIL */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-100 text-amber-800">STAGE 02</Badge>
              <h3 className="text-sm font-semibold text-slate-800">Development</h3>
            </div>
            <button onClick={() => onNavigate('pengajuan')}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1">
              Detail <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-md">
              <div className="w-7 h-7 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-slate-800">Training & Sertifikasi</div>
                <div className="text-[10px] text-slate-500">{data.pengajuan.filter(p => p.jenis === 'Sertifikasi' || p.jenis === 'Eksternal').length} pengajuan</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-md">
              <div className="w-7 h-7 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-slate-800">Coaching</div>
                <div className="text-[10px] text-slate-500">Executive coaching · Q2 aktif</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-md">
              <div className="w-7 h-7 rounded-md bg-violet-100 text-violet-700 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-slate-800">Mentoring</div>
                <div className="text-[10px] text-slate-500">{data.sme.length} SME tersedia sebagai mentor</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-md">
              <div className="w-7 h-7 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Briefcase className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-slate-800">Job Assignment</div>
                <div className="text-[10px] text-slate-500">Stretch project & rotasi</div>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            Hasil pengembangan: Lulus → Talent Pool · Tidak Lulus → re-development.
          </div>
        </Card>

        {/* STAGE 03 DETAIL */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-violet-100 text-violet-800">STAGE 03</Badge>
              <h3 className="text-sm font-semibold text-slate-800">Alignment</h3>
            </div>
            <button onClick={() => onNavigate('tms-succession')}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1">
              Detail <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2 text-xs">
            <button onClick={() => onNavigate('tms-succession')}
              className="w-full flex items-center gap-2 p-2 hover:bg-slate-50 rounded-md text-left">
              <Replace className="w-4 h-4 text-violet-600" />
              <div className="flex-1">
                <div className="font-medium text-slate-800">Succession Plan</div>
                <div className="text-[10px] text-slate-500">{data.succession.length} posisi kritis dipetakan</div>
              </div>
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </button>
            <button onClick={() => onNavigate('tms-pool')}
              className="w-full flex items-center gap-2 p-2 hover:bg-slate-50 rounded-md text-left">
              <Star className="w-4 h-4 text-amber-600" />
              <div className="flex-1">
                <div className="font-medium text-slate-800">Talent Pool</div>
                <div className="text-[10px] text-slate-500">{data.talentPool.length} anggota terdaftar</div>
              </div>
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </button>
            <button onClick={() => onNavigate('tms-promosi')}
              className="w-full flex items-center gap-2 p-2 hover:bg-slate-50 rounded-md text-left">
              <ArrowUpRight className="w-4 h-4 text-emerald-600" />
              <div className="flex-1">
                <div className="font-medium text-slate-800">Workflow Promosi</div>
                <div className="text-[10px] text-slate-500">Pengajuan → Cek Syarat → Approval</div>
              </div>
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </button>
          </div>
          {stats.successionGap > 0 && (
            <div className="mt-3 px-2.5 py-1.5 bg-rose-50 text-rose-800 rounded-md text-[11px] flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3 flex-shrink-0" />
              <span><strong>{stats.successionGap} posisi kritis</strong> belum punya kandidat suksesor</span>
            </div>
          )}
        </Card>
      </div>

      {/* CLOSED-LOOP NARRATIVE */}
      <Card className="!bg-gradient-to-br !from-emerald-50 !to-violet-50 !border-emerald-200">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700 leading-relaxed">
            <div className="font-semibold text-slate-800 mb-1">Closed-loop antar-stage</div>
            9-Box menentukan siapa masuk Talent Pool → Pool menentukan program pengembangan (training/coaching/mentoring/job assignment) yang ditarik dari modul Pelatihan → Hasil pengembangan (Lulus/Tidak Lulus) mengupdate posisi 9-Box → Bila Lulus, masuk Successor Pool atau diajukan Promosi melalui workflow 3-tahap.
          </div>
        </div>
      </Card>
    </div>
  );
};



const NineBoxModule = ({ data }) => {
  const matrix = useMemo(() => {
    const grid = Array(3).fill(null).map(() => Array(3).fill(null).map(() => []));
    const getBucket = (val) => val >= 4.2 ? 2 : val >= 3.5 ? 1 : 0;
    data.pegawai.forEach(p => {
      const x = getBucket(p.performance);
      const y = 2 - getBucket(p.kompetensi);
      grid[y][x].push(p);
    });
    return grid;
  }, [data]);

  const cellInfo = [
    [
      { label: 'Future Star', color: 'bg-amber-50 border-amber-200', text: 'text-amber-900' },
      { label: 'High Potential', color: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-900' },
      { label: '★ Star / Top Talent', color: 'bg-emerald-100 border-emerald-300', text: 'text-emerald-900' },
    ],
    [
      { label: 'Inconsistent', color: 'bg-slate-50 border-slate-200', text: 'text-slate-700' },
      { label: 'Core Player', color: 'bg-blue-50 border-blue-200', text: 'text-blue-900' },
      { label: 'High Performer', color: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-900' },
    ],
    [
      { label: 'Under-performer', color: 'bg-rose-50 border-rose-200', text: 'text-rose-900' },
      { label: 'Ineffective', color: 'bg-slate-50 border-slate-200', text: 'text-slate-700' },
      { label: 'Solid Performer', color: 'bg-amber-50 border-amber-200', text: 'text-amber-900' },
    ],
  ];

  return (
    <div className="p-5 space-y-4">
      <div>
        <h2 className="text-base font-semibold text-slate-800">9-Box Talent Mapping</h2>
        <p className="text-xs text-slate-500">Pemetaan talent berdasarkan kinerja & kompetensi · {data.pegawai.length} pegawai</p>
      </div>

      <Card>
        <div className="flex gap-2">
          <div className="flex flex-col justify-between text-[10px] font-medium text-slate-500 py-2" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
            <span>HIGH</span>
            <span>KOMPETENSI / POTENSI</span>
            <span>LOW</span>
          </div>
          <div className="flex-1">
            <div className="grid grid-cols-3 gap-2">
              {matrix.map((row, y) =>
                row.map((cell, x) => {
                  const info = cellInfo[y][x];
                  return (
                    <div key={`${y}-${x}`} className={`rounded-lg border-2 p-3 min-h-[110px] flex flex-col ${info.color}`}>
                      <div className={`text-[11px] font-semibold mb-1 ${info.text}`}>{info.label}</div>
                      <div className={`text-[10px] mb-2 ${info.text} opacity-70`}>{cell.length} pegawai</div>
                      <div className="flex flex-wrap gap-1 mt-auto">
                        {cell.slice(0, 4).map(p => (
                          <div key={p.id} title={p.nama}
                            className="w-6 h-6 rounded-full bg-white border border-slate-200 text-[9px] flex items-center justify-center font-semibold text-slate-700">
                            {initials(p.nama)}
                          </div>
                        ))}
                        {cell.length > 4 && (
                          <div className="w-6 h-6 rounded-full bg-slate-200 text-[9px] flex items-center justify-center font-semibold text-slate-700">
                            +{cell.length - 4}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2 text-[10px] font-medium text-slate-500 text-center">
              <div>LOW</div>
              <div>MEDIUM</div>
              <div>HIGH</div>
            </div>
            <div className="text-center text-[10px] font-medium text-slate-500 mt-1">PERFORMANCE / KINERJA →</div>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Rekomendasi Aksi per Kategori</h3>
        <div className="space-y-2 text-xs">
          {matrix[0][2].length > 0 && (
            <div className="flex gap-2 p-2 bg-emerald-50 rounded-md">
              <Star className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
              <div><span className="font-medium text-emerald-900">★ Top Talent ({matrix[0][2].length}):</span> <span className="text-emerald-800">Masukkan ke successor pool, berikan stretch assignment, executive coaching.</span></div>
            </div>
          )}
          {matrix[0][1].length > 0 && (
            <div className="flex gap-2 p-2 bg-emerald-50 rounded-md">
              <TrendingUp className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
              <div><span className="font-medium text-emerald-900">High Potential ({matrix[0][1].length}):</span> <span className="text-emerald-800">Akselerasi development melalui leadership program & mentoring.</span></div>
            </div>
          )}
          {matrix[2][0].length > 0 && (
            <div className="flex gap-2 p-2 bg-rose-50 rounded-md">
              <AlertTriangle className="w-4 h-4 text-rose-700 flex-shrink-0 mt-0.5" />
              <div><span className="font-medium text-rose-900">Under-performer ({matrix[2][0].length}):</span> <span className="text-rose-800">Performance Improvement Plan (PIP) atau evaluasi peran ulang.</span></div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

// =================================================================================
// MODULE: TALENT POOL
// =================================================================================

const TALENT_CATEGORIES = {
  star: { label: '★ Star / Top Talent', color: 'bg-emerald-100 text-emerald-800' },
  highpot: { label: 'High Potential', color: 'bg-blue-100 text-blue-800' },
  future: { label: 'Future Star', color: 'bg-amber-100 text-amber-800' },
  critical: { label: 'Critical Backup', color: 'bg-violet-100 text-violet-800' },
};

const TalentPoolModule = ({ data }) => {
  const grouped = useMemo(() => {
    const g = {};
    Object.keys(TALENT_CATEGORIES).forEach(k => g[k] = []);
    data.talentPool.forEach(t => {
      const peg = findPegawai(data, t.pegawaiId);
      if (peg) g[t.kategori]?.push({ ...t, pegawai: peg });
    });
    return g;
  }, [data]);

  return (
    <div className="p-5 space-y-4">
      <div>
        <h2 className="text-base font-semibold text-slate-800">Talent Pool</h2>
        <p className="text-xs text-slate-500">Kumpulan talent untuk succession & development pipeline</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Object.entries(TALENT_CATEGORIES).map(([key, cat]) => (
          <StatCard key={key} label={cat.label} value={grouped[key]?.length || 0} icon={Star}
            color={key === 'star' ? 'emerald' : key === 'highpot' ? 'blue' : key === 'future' ? 'amber' : 'violet'} />
        ))}
      </div>

      {Object.entries(grouped).map(([key, members]) => members.length > 0 && (
        <Card key={key}>
          <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <Badge className={TALENT_CATEGORIES[key].color}>{TALENT_CATEGORIES[key].label}</Badge>
            <span className="text-xs text-slate-500">{members.length} anggota</span>
          </h3>
          <div className="space-y-2">
            {members.map(m => (
              <div key={m.id} className="flex items-center gap-3 p-2.5 hover:bg-slate-50 rounded-md">
                <Avatar nama={m.pegawai.nama} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-800">{m.pegawai.nama}</div>
                  <div className="text-xs text-slate-500">{m.pegawai.jabatan} · {m.notes}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium text-slate-700">P: {m.pegawai.performance.toFixed(1)} · K: {m.pegawai.kompetensi.toFixed(1)}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
};

// =================================================================================
// MODULE: SUCCESSION PLAN
// =================================================================================

const SuccessionModule = ({ data }) => {
  const readinessLabels = {
    '1y': { label: '≤ 1 tahun', color: 'bg-emerald-100 text-emerald-800' },
    '2y': { label: '1–2 tahun', color: 'bg-amber-100 text-amber-800' },
    '3y': { label: '2–3 tahun', color: 'bg-slate-100 text-slate-700' },
  };

  return (
    <div className="p-5 space-y-4">
      <div>
        <h2 className="text-base font-semibold text-slate-800">Succession Plan</h2>
        <p className="text-xs text-slate-500">Rencana suksesi untuk posisi kritis BPKH</p>
      </div>

      <Card padding="p-0">
        <div className="divide-y divide-slate-100">
          {data.succession.map(s => {
            const incumbent = s.incumbent ? findPegawai(data, s.incumbent) : null;
            const kandidats = s.kandidat.map(id => findPegawai(data, id)).filter(Boolean);
            const r = readinessLabels[s.readiness];
            return (
              <div key={s.id} className="p-4 flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <div className="font-medium text-sm text-slate-800">{s.posisi}</div>
                  <div className="text-xs text-slate-500">
                    Incumbent: {incumbent ? incumbent.nama : <span className="text-rose-600">⚠ Kosong</span>}
                  </div>
                </div>
                <Badge className={r.color}>{r.label}</Badge>
                <div className="flex items-center -space-x-2">
                  {kandidats.length === 0 ? (
                    <div className="text-xs text-rose-600 flex items-center gap-1 px-2 py-1 bg-rose-50 rounded-md">
                      <AlertTriangle className="w-3 h-3" />Tidak ada kandidat
                    </div>
                  ) : kandidats.slice(0, 4).map(k => (
                    <div key={k.id} title={k.nama}
                      className="w-8 h-8 rounded-full bg-violet-100 border-2 border-white text-violet-800 text-[10px] flex items-center justify-center font-semibold">
                      {initials(k.nama)}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

// =================================================================================
// MODULE: PROMOSI
// =================================================================================

const PromosiModule = ({ data, onUpdate, showToast }) => {
  return (
    <div className="p-5 space-y-4">
      <div>
        <h2 className="text-base font-semibold text-slate-800">Workflow Promosi</h2>
        <p className="text-xs text-slate-500">Pengajuan promosi → Pengecekan syarat → Approval</p>
      </div>

      <Card>
        <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
          {[
            { i: 1, l: 'Pengajuan', icon: Send, status: 'done' },
            { i: 2, l: 'Cek Syarat', icon: ClipboardCheck, status: 'active' },
            { i: 3, l: 'Approval', icon: CheckCircle, status: 'pending' },
          ].map((s, idx) => (
            <React.Fragment key={s.i}>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                s.status === 'active' ? 'bg-violet-600 text-white' :
                s.status === 'done' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
              }`}>
                <s.icon className="w-4 h-4" />
                <span className="text-xs font-medium">{s.l}</span>
              </div>
              {idx < 2 && <ChevronRight className="w-4 h-4 text-slate-400" />}
            </React.Fragment>
          ))}
        </div>

        <div className="space-y-2">
          {data.talentPool.slice(0, 4).map(t => {
            const peg = findPegawai(data, t.pegawaiId);
            if (!peg) return null;
            const reqs = [
              { l: 'Masa Kerja ≥ 3 tahun', ok: true },
              { l: 'Kinerja ≥ 3.5', ok: peg.performance >= 3.5 },
              { l: 'Kompetensi ≥ 3.5', ok: peg.kompetensi >= 3.5 },
            ];
            return (
              <div key={t.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-md">
                <Avatar nama={peg.nama} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-800">{peg.nama}</div>
                  <div className="text-xs text-slate-500">{peg.jabatan} → Promosi diajukan</div>
                </div>
                <div className="flex gap-3">
                  {reqs.map((r, i) => (
                    <div key={i} className="flex items-center gap-1 text-xs" title={r.l}>
                      {r.ok ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-600" />}
                    </div>
                  ))}
                </div>
                <Button size="sm" variant={reqs.every(r => r.ok) ? 'primary' : 'default'}
                  disabled={!reqs.every(r => r.ok)}>
                  Approve
                </Button>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

// =================================================================================
// MODULE: SETTINGS
// =================================================================================

const SettingsModule = ({ data, onReset, showToast }) => {
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="p-5 space-y-4 max-w-2xl">
      <div>
        <h2 className="text-base font-semibold text-slate-800">Pengaturan</h2>
        <p className="text-xs text-slate-500">Konfigurasi & pengelolaan data aplikasi</p>
      </div>

      <Card>
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Informasi Aplikasi</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-slate-500">Nama</span><span className="font-medium">KMLS — BPKH Learning Suite</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Versi</span><span className="font-medium">{APP_VERSION}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Total Pegawai</span><span className="font-medium">{data.pegawai.length}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Total Pengajuan</span><span className="font-medium">{data.pengajuan.length}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Total Knowledge Asset</span><span className="font-medium">{data.knowledgeAsset.length}</span></div>
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-slate-800 mb-1">Ekspor Data</h3>
        <p className="text-xs text-slate-500 mb-3">Backup seluruh data aplikasi ke file JSON</p>
        <Button icon={Download} onClick={() => {
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `kmls-backup-${new Date().toISOString().split('T')[0]}.json`;
          a.click();
          URL.revokeObjectURL(url);
          showToast('Data berhasil diekspor');
        }}>
          Download Backup (JSON)
        </Button>
      </Card>

      <Card className="!border-rose-200 !bg-rose-50/30">
        <h3 className="text-sm font-semibold text-rose-800 mb-1">Reset Data</h3>
        <p className="text-xs text-rose-700 mb-3">Hapus semua data dan kembali ke data awal (seed). Tindakan ini tidak dapat dibatalkan.</p>
        {!confirmReset ? (
          <Button variant="danger" icon={RefreshCw} onClick={() => setConfirmReset(true)}>Reset ke Data Awal</Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="danger" onClick={() => { onReset(); setConfirmReset(false); }}>Yakin, Reset Sekarang</Button>
            <Button variant="ghost" onClick={() => setConfirmReset(false)}>Batal</Button>
          </div>
        )}
      </Card>

      <Card className="!bg-emerald-50 !border-emerald-200">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-semibold text-emerald-900">Tentang Aplikasi Ini</div>
            <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
              KMLS adalah prototipe aplikasi terintegrasi untuk Knowledge Management & Learning System BPKH.
              Aplikasi mencakup pengelolaan pelatihan end-to-end, 4 pilar KM (SME, Knowledge Map, CoP, Knowledge Asset),
              dan Talent Management System dengan 9-Box mapping & succession planning.
              Dibangun dengan pendekatan modular & scalable — siap dikembangkan menjadi production-grade application.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

// =================================================================================
// MODULE: LEARNING PATHS
// =================================================================================

const LearningPathsModule = ({ data, onUpdate, showToast }) => {
  const [viewing, setViewing] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ title: '', targetRole: '', description: '' });

  const enrollments = data.enrollments || [];
  const myEnrollment = (pathId) => enrollments.find(e => e.userId === CURRENT_USER_ID && e.pathId === pathId);
  const enrolleesOf = (pathId) => enrollments.filter(e => e.pathId === pathId);

  const enroll = (pathId) => {
    if (myEnrollment(pathId)) return;
    onUpdate({ ...data, enrollments: [...enrollments, { id: uid('en'), userId: CURRENT_USER_ID, pathId, startedAt: new Date().toISOString(), completedSteps: [] }] });
    showToast('Berhasil enroll ke learning path');
  };
  const unenroll = (pathId) => {
    onUpdate({ ...data, enrollments: enrollments.filter(e => !(e.userId === CURRENT_USER_ID && e.pathId === pathId)) });
    showToast('Enrollment dibatalkan', 'info');
  };
  const toggleStep = (pathId, stepIdx) => {
    const enr = myEnrollment(pathId);
    if (!enr) return;
    const completed = enr.completedSteps.includes(stepIdx)
      ? enr.completedSteps.filter(i => i !== stepIdx)
      : [...enr.completedSteps, stepIdx];
    onUpdate({ ...data, enrollments: enrollments.map(e => e.id === enr.id ? { ...e, completedSteps: completed } : e) });
  };

  const createPath = () => {
    if (!form.title.trim()) { showToast('Judul wajib diisi', 'error'); return; }
    const newPath = {
      id: uid('lp'), title: form.title, targetRole: form.targetRole, description: form.description,
      createdBy: CURRENT_USER_ID, steps: [],
    };
    onUpdate({ ...data, learningPaths: [...(data.learningPaths || []), newPath] });
    showToast('Learning path dibuat — tambahkan step di detail');
    setCreateOpen(false);
    setForm({ title: '', targetRole: '', description: '' });
  };

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Learning Paths</h2>
          <p className="text-xs text-slate-500">Kurikulum terstruktur: asset + training + sertifikasi untuk setiap role</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setCreateOpen(true)}>Buat Path Baru</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {(data.learningPaths || []).map(p => {
          const enr = myEnrollment(p.id);
          const progress = enr ? Math.round((enr.completedSteps.length / Math.max(p.steps.length, 1)) * 100) : 0;
          const totalMin = p.steps.reduce((s, st) => s + (st.estMinutes || 0), 0);
          return (
            <Card key={p.id} className="hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer relative">
              <button onClick={() => setViewing(p)} className="absolute inset-0 w-full h-full" aria-label="Buka detail" />
              <div className="relative pointer-events-none">
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Route className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-slate-800">{p.title}</div>
                    <div className="text-[11px] text-slate-500">Target: {p.targetRole || 'Umum'}</div>
                  </div>
                  {enr && <Badge className="bg-emerald-100 text-emerald-700"><CheckCircle className="w-3 h-3" />Enrolled</Badge>}
                </div>
                {p.description && <p className="text-xs text-slate-600 mb-2 line-clamp-2">{p.description}</p>}
                <div className="text-[11px] text-slate-500 mb-2">
                  {p.steps.length} step · ~{Math.round(totalMin / 60)}h estimasi · {enrolleesOf(p.id).length} enrollee
                </div>
                {enr && (
                  <>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-slate-600">Progress Saya</span>
                      <span className="font-medium text-emerald-700">{progress}%</span>
                    </div>
                    <ProgressBar value={progress} />
                  </>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Detail Learning Path" size="xl">
        {viewing && (() => {
          const enr = myEnrollment(viewing.id);
          const enrolled = !!enr;
          const progress = enr ? Math.round((enr.completedSteps.length / Math.max(viewing.steps.length, 1)) * 100) : 0;
          const creator = findPegawai(data, viewing.createdBy);
          return (
            <div className="p-5 space-y-4">
              <div>
                <div className="flex items-start gap-3 pb-3 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Route className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-slate-800">{viewing.title}</h3>
                    <div className="text-xs text-slate-500">Target role: <b>{viewing.targetRole}</b> · dibuat oleh {creator?.nama || 'system'}</div>
                  </div>
                  {enrolled
                    ? <Button icon={XCircle} onClick={() => unenroll(viewing.id)}>Batalkan Enrollment</Button>
                    : <Button variant="primary" icon={GraduationCap} onClick={() => enroll(viewing.id)}>Enroll Saya</Button>}
                </div>
                {viewing.description && <p className="text-sm text-slate-700 mt-3">{viewing.description}</p>}
              </div>

              {enrolled && (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Progress Saya</span>
                    <span className="font-medium text-emerald-700">{enr.completedSteps.length} / {viewing.steps.length} · {progress}%</span>
                  </div>
                  <ProgressBar value={progress} />
                </div>
              )}

              <div>
                <div className="text-xs font-medium text-slate-600 mb-2">Langkah ({viewing.steps.length})</div>
                <div className="space-y-2">
                  {viewing.steps.map((st, idx) => {
                    const done = enr?.completedSteps.includes(idx);
                    const asset = st.type === 'asset' ? findAsset(data, st.refId) : null;
                    return (
                      <div key={idx} className={`flex items-start gap-3 p-3 rounded-lg border ${done ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                        <button onClick={() => enrolled && toggleStep(viewing.id, idx)} disabled={!enrolled}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            done ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-300 hover:border-emerald-500'
                          } ${enrolled ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
                          {done && <CheckCircle className="w-4 h-4" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-medium text-slate-800">Step {idx + 1}: {st.title}</span>
                            <Badge className={st.type === 'asset' ? 'bg-violet-100 text-violet-700' : 'bg-amber-100 text-amber-700'}>
                              {st.type === 'asset' ? 'Asset' : 'Training'}
                            </Badge>
                          </div>
                          {asset && <div className="text-[11px] text-slate-500 mt-0.5">→ {asset.judul} (v{asset.version})</div>}
                          {st.estMinutes && <div className="text-[10px] text-slate-400 mt-0.5">Estimasi ~{st.estMinutes} menit</div>}
                        </div>
                      </div>
                    );
                  })}
                  {viewing.steps.length === 0 && <div className="text-xs text-slate-500 italic">Belum ada step.</div>}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <div className="text-xs font-medium text-slate-600 mb-2">Enrollee ({enrolleesOf(viewing.id).length})</div>
                <div className="flex flex-wrap gap-1">
                  {enrolleesOf(viewing.id).map(e => {
                    const p = findPegawai(data, e.userId);
                    const prog = Math.round((e.completedSteps.length / Math.max(viewing.steps.length, 1)) * 100);
                    return (
                      <Badge key={e.id} className="bg-slate-100 text-slate-700">
                        {p?.nama || 'Unknown'} · {prog}%
                      </Badge>
                    );
                  })}
                  {enrolleesOf(viewing.id).length === 0 && <div className="text-xs text-slate-500 italic">Belum ada yang enroll.</div>}
                </div>
              </div>
            </div>
          );
        })()}
      </Modal>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Buat Learning Path Baru">
        <div className="p-5 space-y-3">
          <Input label="Judul Path *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="contoh: Onboarding Compliance Officer" />
          <Input label="Target Role" value={form.targetRole} onChange={e => setForm({ ...form, targetRole: e.target.value })}
            placeholder="contoh: Compliance Officer" />
          <Textarea label="Deskripsi" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="Tujuan path & expected outcome..." />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Batal</Button>
            <Button variant="primary" icon={Save} onClick={createPath}>Buat Path</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// =================================================================================
// MODULE: SKILL MATRIX (Competency × Pegawai)
// =================================================================================

const SkillMatrixModule = ({ data }) => {
  const [tab, setTab] = useState('matrix');
  const [divFilter, setDivFilter] = useState('all');

  const competencies = data.competencies || [];
  const pegawai = useMemo(() =>
    data.pegawai.filter(p => divFilter === 'all' || p.divisi === divFilter)
  , [data, divFilter]);

  const levelOf = (pegId, cmpId) => {
    const r = (data.pegawaiCompetencies || []).find(x => x.pegawaiId === pegId && x.competencyId === cmpId);
    return r ? r.level : 0;
  };

  const requirementsFor = (jabatan) => {
    const r = (data.roleRequirements || []).find(x => x.jabatan === jabatan);
    return r ? r.requirements : [];
  };

  const gapsFor = (peg) => {
    const reqs = requirementsFor(peg.jabatan);
    return reqs.map(([cmpId, target]) => {
      const current = levelOf(peg.id, cmpId);
      const cmp = competencies.find(c => c.id === cmpId);
      return { cmp, current, target, gap: target - current };
    }).filter(g => g.gap > 0);
  };

  const allGaps = useMemo(() => pegawai.map(p => ({ peg: p, gaps: gapsFor(p) })).filter(x => x.gaps.length > 0), [pegawai, data]);
  const totalGaps = allGaps.reduce((s, x) => s + x.gaps.length, 0);
  const totalReq = useMemo(() => pegawai.reduce((s, p) => s + requirementsFor(p.jabatan).length, 0), [pegawai, data]);
  const coverage = totalReq > 0 ? Math.round((1 - totalGaps / totalReq) * 100) : 100;

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Skill Matrix</h2>
          <p className="text-xs text-slate-500">Pemetaan kompetensi pegawai vs requirement role · auto-detect gap</p>
        </div>
        <Select value={divFilter} onChange={e => setDivFilter(e.target.value)}
          options={[{ value: 'all', label: 'Semua Divisi' }, ...DIVISI_LIST.map(d => ({ value: d, label: d }))]} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Pegawai (filter)" value={pegawai.length} icon={Users} color="blue" />
        <StatCard label="Total Kompetensi" value={competencies.length} icon={Target} color="violet" />
        <StatCard label="Coverage Requirement" value={`${coverage}%`} icon={CheckCircle} color={coverage > 80 ? 'emerald' : coverage > 60 ? 'amber' : 'rose'}
          delta={`${totalGaps} gap dari ${totalReq} requirement`} />
        <StatCard label="Pegawai dengan Gap" value={allGaps.length} icon={AlertTriangle} color="rose" />
      </div>

      <Card padding="p-0">
        <div className="px-5 pt-3">
          <Tabs tabs={[{ id: 'matrix', label: 'Matrix View', count: pegawai.length }, { id: 'gap', label: 'Gap Analysis', count: allGaps.length }]}
            active={tab} onChange={setTab} />
        </div>

        {tab === 'matrix' && (
          <div className="overflow-x-auto p-3">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left px-3 py-2 sticky left-0 bg-white">Pegawai</th>
                  {competencies.map(c => (
                    <th key={c.id} className="px-2 py-2 text-center text-[10px] font-medium text-slate-600" style={{ minWidth: 90 }}>
                      <div className="truncate" title={c.name}>{c.name}</div>
                      <div className="text-slate-400 font-normal">{c.domain}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pegawai.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="px-3 py-2 sticky left-0 bg-white">
                      <div className="font-medium text-slate-800 text-xs">{p.nama}</div>
                      <div className="text-[10px] text-slate-500">{p.jabatan}</div>
                    </td>
                    {competencies.map(c => {
                      const lvl = levelOf(p.id, c.id);
                      const cfg = COMPETENCY_LEVELS[lvl];
                      return (
                        <td key={c.id} className="px-2 py-2 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-medium ${cfg.color}`}>
                            {lvl > 0 ? `L${lvl}` : '—'}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-500 flex-wrap px-3 pb-2">
              <span className="font-medium">Legenda level:</span>
              {Object.entries(COMPETENCY_LEVELS).map(([k, l]) => (
                <span key={k} className={`px-2 py-0.5 rounded-md ${l.color}`}>L{k} · {l.label}</span>
              ))}
            </div>
          </div>
        )}

        {tab === 'gap' && (
          <div className="p-3 space-y-3">
            {allGaps.length === 0 ? (
              <EmptyState icon={CheckCircle} title="Tidak ada gap kompetensi" description="Semua pegawai memenuhi requirement role-nya." />
            ) : allGaps.map(({ peg, gaps }) => (
              <div key={peg.id} className="border border-slate-200 rounded-lg p-3">
                <div className="flex items-center gap-3 mb-2 pb-2 border-b border-slate-100">
                  <Avatar nama={peg.nama} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-slate-800">{peg.nama}</div>
                    <div className="text-[11px] text-slate-500">{peg.jabatan} · {peg.divisi}</div>
                  </div>
                  <Badge className="bg-rose-100 text-rose-700">{gaps.length} gap</Badge>
                </div>
                <div className="space-y-1.5">
                  {gaps.map(g => (
                    <div key={g.cmp.id} className="flex items-center gap-2 text-xs">
                      <span className="flex-1 text-slate-700">{g.cmp.name}</span>
                      <Badge className={COMPETENCY_LEVELS[g.current].color}>L{g.current}</Badge>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <Badge className={COMPETENCY_LEVELS[g.target].color}>L{g.target}</Badge>
                      <span className="text-rose-600 font-medium w-8 text-right">+{g.gap}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-start gap-2 text-[11px] text-slate-600">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span>Rekomendasi: cari SME di domain <b>{gaps[0]?.cmp.domain}</b>, atau enroll ke learning path terkait.</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

// =================================================================================
// MODULE: KM ANALYTICS
// =================================================================================

const KMAnalyticsModule = ({ data, onNavigate }) => {
  const assets = data.knowledgeAsset;
  const published = assets.filter(a => (a.status || 'published') === 'published');
  const draft = assets.filter(a => a.status === 'draft');
  const reviewing = assets.filter(a => a.status === 'review');
  const archived = assets.filter(a => a.status === 'archived');

  const dormant = useMemo(() => {
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 90);
    return assets.filter(a => a.lastViewedAt && new Date(a.lastViewedAt) < cutoff)
      .sort((a, b) => new Date(a.lastViewedAt) - new Date(b.lastViewedAt));
  }, [assets]);

  const overdue = useMemo(() =>
    assets.filter(a => a.reviewDate && daysUntil(a.reviewDate) < 0)
      .sort((a, b) => new Date(a.reviewDate) - new Date(b.reviewDate))
  , [assets]);

  const trending = useMemo(() => assets.slice().sort((a, b) => b.views - a.views).slice(0, 5), [assets]);

  const ratedAssets = assets.filter(a => (a.ratingsUp || 0) + (a.ratingsDown || 0) > 0);
  const avgRating = ratedAssets.length === 0 ? 0 :
    ratedAssets.reduce((s, a) => s + ((a.ratingsUp || 0) / ((a.ratingsUp || 0) + (a.ratingsDown || 0))), 0) / ratedAssets.length;

  const contributors = useMemo(() => {
    const counts = {};
    assets.forEach(a => { counts[a.owner] = (counts[a.owner] || 0) + 1; });
    data.sme.forEach(s => { counts[s.pegawaiId] = (counts[s.pegawaiId] || 0) + s.kontribusi; });
    return Object.entries(counts)
      .map(([id, n]) => ({ peg: findPegawai(data, id), score: n }))
      .filter(x => x.peg)
      .sort((a, b) => b.score - a.score).slice(0, 5);
  }, [data]);

  const tagCount = useMemo(() => {
    const t = {};
    assets.forEach(a => a.tags.forEach(tag => { t[tag] = (t[tag] || 0) + 1; }));
    return Object.entries(t).sort((a, b) => b[1] - a[1]).slice(0, 12);
  }, [assets]);

  // Health score (0-100): published ratio (40%) + non-dormant ratio (30%) + non-overdue ratio (30%)
  const healthScore = useMemo(() => {
    const pubR = assets.length ? published.length / assets.length : 0;
    const dormR = assets.length ? 1 - (dormant.length / assets.length) : 0;
    const overR = assets.length ? 1 - (overdue.length / assets.length) : 0;
    return Math.round((pubR * 40 + dormR * 30 + overR * 30));
  }, [assets, published, dormant, overdue]);

  const healthColor = healthScore >= 80 ? 'emerald' : healthScore >= 60 ? 'amber' : 'rose';

  return (
    <div className="p-5 space-y-4">
      <div>
        <h2 className="text-base font-semibold text-slate-800">KM Analytics</h2>
        <p className="text-xs text-slate-500">Health score, dormant detection, top contributors, dan trending knowledge</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card padding="p-4" className={`!border-${healthColor}-200 !bg-${healthColor}-50/40`}>
          <div className="text-xs text-slate-600 mb-1">KM Health Score</div>
          <div className={`text-3xl font-bold text-${healthColor}-700`}>{healthScore}<span className="text-base text-slate-400">/100</span></div>
          <div className="text-[11px] text-slate-500 mt-1">Published, fresh, & up-to-date</div>
        </Card>
        <StatCard label="Total Asset" value={assets.length} icon={Database} color="violet"
          delta={`${published.length} published · ${draft.length} draft`} />
        <StatCard label="Dormant (90+ hari)" value={dormant.length} icon={TrendingDown} color={dormant.length > 0 ? 'rose' : 'emerald'}
          delta="Tidak dibuka sejak Q1" />
        <StatCard label="Overdue Review" value={overdue.length} icon={AlertTriangle} color={overdue.length > 0 ? 'amber' : 'emerald'}
          delta="Review date terlewat" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card>
          <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-1.5"><Flame className="w-4 h-4 text-rose-500" />Trending (Most Viewed)</h3>
          <div className="space-y-2">
            {trending.map((a, i) => {
              const t = ASSET_TYPES[a.type];
              return (
                <div key={a.id} className="flex items-center gap-2">
                  <div className="text-xs font-bold text-slate-400 w-5">#{i+1}</div>
                  <div className={`w-7 h-7 rounded ${t.color} flex items-center justify-center flex-shrink-0`}>
                    <t.icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-slate-800 truncate">{a.judul}</div>
                    <div className="text-[10px] text-slate-500">{a.views} views</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-500" />Top Contributors</h3>
          <div className="space-y-2">
            {contributors.map((c, i) => (
              <div key={c.peg.id} className="flex items-center gap-2">
                <div className="text-xs font-bold text-slate-400 w-5">#{i+1}</div>
                <Avatar nama={c.peg.nama} size="xs" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-slate-800 truncate">{c.peg.nama}</div>
                  <div className="text-[10px] text-slate-500">{c.peg.divisi}</div>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700">{c.score}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-1.5"><TrendingDown className="w-4 h-4 text-rose-500" />Dormant Assets</h3>
          <div className="space-y-2">
            {dormant.length === 0 ? <div className="text-xs text-slate-500 italic">Semua asset aktif 👍</div> : dormant.slice(0, 5).map(a => {
              const lastDays = daysSince(a.lastViewedAt || a.createdAt);
              return (
                <div key={a.id} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-slate-800 truncate">{a.judul}</div>
                    <div className="text-[10px] text-slate-500">Terakhir dibuka {lastDays} hari lalu</div>
                  </div>
                </div>
              );
            })}
            {dormant.length > 0 && (
              <button onClick={() => onNavigate('km-asset')} className="text-[11px] text-emerald-700 hover:text-emerald-800 font-medium mt-2 flex items-center gap-1">
                Lihat semua di Knowledge Asset <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </Card>
      </div>

      {overdue.length > 0 && (
        <Card className="!border-amber-200 !bg-amber-50/30">
          <h3 className="text-sm font-semibold text-amber-900 mb-3 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" />Asset Perlu Review</h3>
          <div className="space-y-1.5">
            {overdue.slice(0, 6).map(a => (
              <div key={a.id} className="flex items-center gap-2 text-xs">
                <span className="flex-1 text-amber-900 font-medium truncate">{a.judul}</span>
                <span className="text-amber-700">v{a.version}</span>
                <Badge className="bg-rose-100 text-rose-700">{Math.abs(daysUntil(a.reviewDate))}h terlewat</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-1.5"><Tag className="w-4 h-4 text-violet-500" />Tag Cloud</h3>
        <div className="flex flex-wrap gap-2">
          {tagCount.map(([tag, n]) => (
            <span key={tag} className="px-2.5 py-1 bg-violet-50 text-violet-700 rounded-full text-xs"
              style={{ fontSize: `${Math.min(16, 10 + n * 1.5)}px` }}>
              {tag} <span className="text-violet-400">({n})</span>
            </span>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Quality Snapshot</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          <div>
            <div className="text-2xl font-semibold text-emerald-700">{Math.round(avgRating * 100)}%</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wide">Helpful ratio</div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-blue-700">{reviewing.length}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wide">In review</div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-slate-700">{archived.length}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wide">Archived</div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-violet-700">{(data.bookmarks || []).length}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wide">Total bookmarks</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

// =================================================================================
// MODULE: ASK THE EXPERT (Q&A with auto-routing to SMEs)
// =================================================================================

const AskExpertModule = ({ data, onUpdate, showToast }) => {
  const [tab, setTab] = useState('open');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', domain: KM_DOMAINS[0] });
  const [viewing, setViewing] = useState(null);
  const [answerText, setAnswerText] = useState('');

  const questions = data.questions || [];
  const counts = useMemo(() => ({
    open: questions.filter(q => q.status === 'open').length,
    answered: questions.filter(q => q.status === 'answered').length,
    resolved: questions.filter(q => q.status === 'resolved').length,
    mine: questions.filter(q => q.askerId === CURRENT_USER_ID).length,
  }), [questions]);

  const filtered = useMemo(() => {
    let list = questions.slice();
    if (tab === 'mine') list = list.filter(q => q.askerId === CURRENT_USER_ID);
    else list = list.filter(q => q.status === tab);
    return list.sort((a, b) => new Date(b.askedAt) - new Date(a.askedAt));
  }, [questions, tab]);

  const routedSMEs = (domain) => {
    if (!domain) return [];
    const dl = domain.toLowerCase();
    return data.sme.filter(s => s.domain.toLowerCase().includes(dl));
  };

  const submitQuestion = () => {
    if (!form.title.trim() || !form.body.trim()) { showToast('Judul & detail wajib diisi', 'error'); return; }
    const newQ = {
      id: uid('q'), askerId: CURRENT_USER_ID, title: form.title, body: form.body, domain: form.domain,
      status: 'open', askedAt: new Date().toISOString(), answers: [],
    };
    onUpdate({ ...data, questions: [newQ, ...questions] });
    const routed = routedSMEs(form.domain);
    showToast(routed.length > 0 ? `Pertanyaan di-route ke ${routed.length} SME` : 'Pertanyaan diposting (belum ada SME di domain ini)');
    setModalOpen(false);
    setForm({ title: '', body: '', domain: KM_DOMAINS[0] });
  };

  const submitAnswer = () => {
    if (!answerText.trim() || !viewing) return;
    const newA = { id: uid('a'), smeId: CURRENT_USER_ID, body: answerText, votes: 0, createdAt: new Date().toISOString(), promotedToAssetId: null };
    const updated = questions.map(q => q.id === viewing.id
      ? { ...q, answers: [...q.answers, newA], status: q.status === 'open' ? 'answered' : q.status }
      : q);
    onUpdate({ ...data, questions: updated });
    setViewing(updated.find(q => q.id === viewing.id));
    setAnswerText('');
    showToast('Jawaban dikirim');
  };

  const voteAnswer = (answerId, delta) => {
    const updated = questions.map(q => q.id === viewing.id
      ? { ...q, answers: q.answers.map(a => a.id === answerId ? { ...a, votes: a.votes + delta } : a) }
      : q);
    onUpdate({ ...data, questions: updated });
    setViewing(updated.find(q => q.id === viewing.id));
  };

  const markResolved = () => {
    const updated = questions.map(q => q.id === viewing.id ? { ...q, status: 'resolved' } : q);
    onUpdate({ ...data, questions: updated });
    setViewing(updated.find(q => q.id === viewing.id));
    showToast('Pertanyaan ditandai resolved');
  };

  const promoteToAsset = (answer) => {
    const newAsset = {
      id: uid('ka'), judul: `Q&A: ${viewing.title}`, type: 'lesson',
      tags: [viewing.domain, 'Q&A'], owner: answer.smeId,
      description: `**Pertanyaan:** ${viewing.body}\n\n**Jawaban (SME):** ${answer.body}`,
      status: 'published', version: '1.0',
      reviewDate: (() => { const d = new Date(); d.setMonth(d.getMonth() + 12); return d.toISOString().split('T')[0]; })(),
      ratingsUp: answer.votes, ratingsDown: 0, comments: [], views: 0,
      lastViewedAt: new Date().toISOString(), createdAt: new Date().toISOString(),
    };
    const updatedQuestions = questions.map(q => q.id === viewing.id
      ? { ...q, answers: q.answers.map(a => a.id === answer.id ? { ...a, promotedToAssetId: newAsset.id } : a), status: 'resolved' }
      : q);
    onUpdate({ ...data, knowledgeAsset: [newAsset, ...data.knowledgeAsset], questions: updatedQuestions });
    setViewing(updatedQuestions.find(q => q.id === viewing.id));
    showToast('Jawaban dipromote menjadi Knowledge Asset baru');
  };

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Ask the Expert</h2>
          <p className="text-xs text-slate-500">Tanya SME · jawaban terbaik bisa dipromote menjadi Knowledge Asset</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setModalOpen(true)}>Ajukan Pertanyaan</Button>
      </div>

      <Card padding="p-0">
        <div className="px-5 pt-3">
          <Tabs tabs={[
            { id: 'open', label: 'Open', count: counts.open },
            { id: 'answered', label: 'Answered', count: counts.answered },
            { id: 'resolved', label: 'Resolved', count: counts.resolved },
            { id: 'mine', label: 'Pertanyaan Saya', count: counts.mine },
          ]} active={tab} onChange={setTab} />
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={HelpCircle} title="Tidak ada pertanyaan" description="Belum ada pertanyaan di kategori ini." />
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map(q => {
              const asker = findPegawai(data, q.askerId);
              const routed = routedSMEs(q.domain);
              return (
                <button key={q.id} onClick={() => setViewing(q)}
                  className="w-full text-left p-4 hover:bg-slate-50 flex items-start gap-3">
                  <Avatar nama={asker?.nama || '??'} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-medium text-slate-800">{q.title}</span>
                      <StatusBadge status={q.status} map={QUESTION_STATUS} />
                    </div>
                    <div className="text-xs text-slate-500 line-clamp-1">{q.body}</div>
                    <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                      <span>{asker?.nama}</span><span>·</span>
                      <span>{q.domain}</span><span>·</span>
                      <span>{formatDate(q.askedAt)}</span><span>·</span>
                      <span>{q.answers.length} jawaban</span>
                      {q.status === 'open' && <Badge className="bg-blue-50 text-blue-700">→ {routed.length} SME</Badge>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Ajukan Pertanyaan ke SME" size="lg">
        <div className="p-5 space-y-3">
          <Input label="Judul Pertanyaan *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="contoh: Bagaimana cara assess risiko investasi sukuk?" />
          <Select label="Domain (untuk routing ke SME)" value={form.domain} onChange={e => setForm({ ...form, domain: e.target.value })}
            options={KM_DOMAINS.map(d => ({ value: d, label: d }))} />
          <Textarea label="Detail pertanyaan *" value={form.body} onChange={e => setForm({ ...form, body: e.target.value })}
            placeholder="Jelaskan konteks & detail pertanyaan..." />
          <div className="text-[11px] text-slate-600 bg-blue-50 p-2.5 rounded-md flex items-start gap-2">
            <Lightbulb className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-blue-600" />
            <div>
              <b>{routedSMEs(form.domain).length}</b> SME akan menerima notifikasi:{' '}
              {routedSMEs(form.domain).map(s => findPegawai(data, s.pegawaiId)?.nama).filter(Boolean).join(', ') || 'belum ada SME di domain ini'}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button variant="primary" icon={SendIcon} onClick={submitQuestion}>Kirim Pertanyaan</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Detail Pertanyaan" size="xl">
        {viewing && (() => {
          const asker = findPegawai(data, viewing.askerId);
          const routed = routedSMEs(viewing.domain);
          const isAsker = viewing.askerId === CURRENT_USER_ID;
          const sortedAnswers = viewing.answers.slice().sort((a, b) => b.votes - a.votes);
          return (
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-3 pb-3 border-b border-slate-100">
                <Avatar nama={asker?.nama || '??'} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-semibold text-slate-800">{viewing.title}</h3>
                    <StatusBadge status={viewing.status} map={QUESTION_STATUS} />
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {asker?.nama} · {asker?.jabatan} · {formatDate(viewing.askedAt)} · Domain: <b>{viewing.domain}</b>
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{viewing.body}</p>

              <div className="flex items-center gap-2 text-xs text-slate-600 bg-blue-50/50 p-2 rounded-md">
                <Compass className="w-3.5 h-3.5 text-blue-600" />
                Di-route ke <b>{routed.length} SME</b>: {routed.map(s => findPegawai(data, s.pegawaiId)?.nama).filter(Boolean).join(', ') || '—'}
              </div>

              <div className="pt-3 border-t border-slate-100">
                <div className="text-xs font-medium text-slate-600 mb-2">Jawaban ({sortedAnswers.length})</div>
                <div className="space-y-3">
                  {sortedAnswers.map(a => {
                    const sme = findPegawai(data, a.smeId);
                    return (
                      <div key={a.id} className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar nama={sme?.nama || '??'} size="xs" />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-slate-800">{sme?.nama} <Badge className="bg-violet-100 text-violet-700 ml-1"><Award className="w-3 h-3" />SME</Badge></div>
                            <div className="text-[10px] text-slate-500">{formatDate(a.createdAt)}</div>
                          </div>
                          {a.promotedToAssetId && <Badge className="bg-emerald-100 text-emerald-700"><CheckCircle className="w-3 h-3" />Promoted to Asset</Badge>}
                        </div>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{a.body}</p>
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100">
                          <Rating up={a.votes} down={0} onUp={() => voteAnswer(a.id, 1)} onDown={() => voteAnswer(a.id, -1)} compact />
                          {isAsker && !a.promotedToAssetId && (
                            <Button size="sm" icon={FileCheck} onClick={() => promoteToAsset(a)}>Promote ke Knowledge Asset</Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {sortedAnswers.length === 0 && <div className="text-xs text-slate-500 italic">Belum ada jawaban. SME akan dapat notifikasi.</div>}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-xs font-medium text-slate-600">Tambah Jawaban</div>
                <Textarea value={answerText} onChange={e => setAnswerText(e.target.value)}
                  placeholder="Jawaban Anda sebagai SME / kolega..." />
                <div className="flex justify-between items-center">
                  {isAsker && viewing.status === 'answered' && (
                    <Button icon={CheckCircle} onClick={markResolved}>Tandai Resolved</Button>
                  )}
                  <div className="ml-auto">
                    <Button variant="primary" icon={SendIcon} onClick={submitAnswer}>Kirim Jawaban</Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};

// =================================================================================
// MAIN APP
// =================================================================================

const PAGE_META = {
  'dashboard': { title: 'Dashboard', subtitle: 'Ringkasan eksekutif KMLS BPKH' },
  'pengajuan': { title: 'Pengajuan Pelatihan', subtitle: 'Workflow end-to-end pengajuan s.d. laporan' },
  'pegawai': { title: 'Direktori Pegawai', subtitle: 'Daftar pegawai BPKH & riwayat pengembangan' },
  'km-sme': { title: 'SME Development', subtitle: 'Pilar 1 KM' },
  'km-map': { title: 'Knowledge Map', subtitle: 'Pilar 2 KM' },
  'km-cop': { title: 'Community of Practice', subtitle: 'Pilar 3 KM' },
  'km-asset': { title: 'Knowledge Asset', subtitle: 'Pilar 4 KM · lifecycle, ratings & knowledge graph' },
  'km-paths': { title: 'Learning Paths', subtitle: 'Kurikulum terstruktur per role' },
  'km-skill': { title: 'Skill Matrix', subtitle: 'Pemetaan kompetensi & gap analysis' },
  'km-qa': { title: 'Ask the Expert', subtitle: 'Q&A dengan auto-routing ke SME' },
  'km-analytics': { title: 'KM Analytics', subtitle: 'Health score, dormant & contributor insights' },
  'tms-overview': { title: 'Talent Management System', subtitle: 'Acquisition → Development → Alignment' },
  'tms-9box': { title: '9-Box Talent Mapping', subtitle: 'Acquisition stage' },
  'tms-pool': { title: 'Talent Pool', subtitle: 'Development & alignment stage' },
  'tms-succession': { title: 'Succession Plan', subtitle: 'Alignment stage' },
  'tms-promosi': { title: 'Workflow Promosi', subtitle: 'Alignment stage' },
  'settings': { title: 'Pengaturan', subtitle: 'Konfigurasi aplikasi' },
};

export default function KMLSApp() {
  const [view, setView] = useState('dashboard');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    (async () => {
      const saved = await Store.load();
      setData(saved || SEED_DATA);
      setLoading(false);
    })();
  }, []);

  // Auto-save with debounce
  useEffect(() => {
    if (!data || loading) return;
    const timer = setTimeout(() => { Store.save(data); }, 800);
    return () => clearTimeout(timer);
  }, [data, loading]);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type }), 2800);
  }, []);

  const handleReset = useCallback(async () => {
    await Store.reset();
    setData(SEED_DATA);
    showToast('Data berhasil direset', 'info');
  }, [showToast]);

  const counts = useMemo(() => {
    if (!data) return {};
    return {
      pendingPengajuan: data.pengajuan.filter(p => p.status === 'pending' || p.status === 'review').length,
      openQuestions: (data.questions || []).filter(q => q.status === 'open').length,
    };
  }, [data]);

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-emerald-700 flex items-center justify-center mx-auto mb-3 animate-pulse">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div className="text-sm font-medium text-slate-700">Memuat KMLS...</div>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (view) {
      case 'dashboard': return <Dashboard data={data} onNavigate={setView} />;
      case 'pengajuan': return <PengajuanModule data={data} onUpdate={setData} showToast={showToast} />;
      case 'pegawai': return <PegawaiModule data={data} showToast={showToast} />;
      case 'km-sme': return <SMEModule data={data} onUpdate={setData} showToast={showToast} />;
      case 'km-map': return <KnowledgeMapModule data={data} />;
      case 'km-cop': return <CoPModule data={data} />;
      case 'km-asset': return <KnowledgeAssetModule data={data} onUpdate={setData} showToast={showToast} onNavigate={setView} />;
      case 'km-paths': return <LearningPathsModule data={data} onUpdate={setData} showToast={showToast} />;
      case 'km-skill': return <SkillMatrixModule data={data} />;
      case 'km-qa': return <AskExpertModule data={data} onUpdate={setData} showToast={showToast} />;
      case 'km-analytics': return <KMAnalyticsModule data={data} onNavigate={setView} />;
      case 'tms-overview': return <TMSOverviewModule data={data} onNavigate={setView} />;
      case 'tms-9box': return <NineBoxModule data={data} />;
      case 'tms-pool': return <TalentPoolModule data={data} />;
      case 'tms-succession': return <SuccessionModule data={data} />;
      case 'tms-promosi': return <PromosiModule data={data} onUpdate={setData} showToast={showToast} />;
      case 'settings': return <SettingsModule data={data} onReset={handleReset} showToast={showToast} />;
      default: return <Dashboard data={data} onNavigate={setView} />;
    }
  };

  const meta = PAGE_META[view] || { title: '—', subtitle: '' };

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden">
      <Sidebar active={view} onChange={setView} counts={counts}
        collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar title={meta.title} subtitle={meta.subtitle}
          data={data} onNavigate={setView}
          onMenu={() => setSidebarCollapsed(!sidebarCollapsed)}
          actions={
            <button className="relative p-1.5 hover:bg-slate-100 rounded-md">
              <Bell className="w-4 h-4 text-slate-600" />
              {counts.pendingPengajuan > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
              )}
            </button>
          } />
        <div className="flex-1 overflow-y-auto">
          {renderView()}
          <AppFooter />
        </div>
      </main>
      <Toast message={toast.message} type={toast.type} />
      <style>{`
        @keyframes slide-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.2s ease-out; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </div>
  );
}
