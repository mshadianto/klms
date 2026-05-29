# KMLS v2.0 — Catatan Integrasi

## Cara Pakai

1. **Replace** isi `src/App.jsx` di repo `klms` Anda dengan file ini.
2. Pastikan dependencies sudah terpasang (semuanya sudah ada di project Anda):
   ```bash
   npm install react react-dom lucide-react
   ```
3. Pastikan Tailwind sudah aktif di `index.css`:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```
4. Test lokal: `npm run dev`
5. Build & deploy: `npm run build` lalu push ke `main` (workflow GitHub Pages akan auto-deploy).

## Yang Berubah dari v1

### Sprint 1 — Fondasi (Master Data + RBAC)
- ✅ Mock login dengan dropdown pegawai (10 pegawai seed, termasuk MS Hadianto sebagai Admin)
- ✅ 6 Role: Pegawai, Kadiv, Deputi/BP, Pelaksana PSDM, Kadiv/Deputi PSDM, Admin
- ✅ Master Pegawai (CRUD untuk Admin, read-only untuk lainnya)
- ✅ Master Pelatihan (katalog: in-house, mandiri, eksternal; aktif + arsip historis)
- ✅ Master Kategori (5 kategori BPKH + M1 Membership + S2)
- ✅ Sidebar RBAC-aware (menu beda per role)

### Sprint 2 — Core Workflow (10-Step State Machine)
- ✅ Form Pengajuan online multi-step (5 step) sesuai template BPKH
- ✅ State machine 13 tahap (10-step utama + draft/rejected/postponed)
- ✅ Approval Timeline visual di detail pengajuan
- ✅ Action Bar role-aware (tombol approval yang muncul tergantung role + tahap)
- ✅ Analisa PSDM dengan 4 kriteria scoring (kompetensi, RTL, narasumber, biaya)
- ✅ Surat Tugas Generator dengan auto-generate nomor & isi
- ✅ Aturan khusus: M1 max 2x/tahun, S2 high-level approval

### Sprint 3 — Closing the Loop
- ✅ Laporan Pelaksanaan online sesuai template BPKH (Pendahuluan, Substansi, Evaluasi L1+L2, RTL, Tanggapan)
- ✅ Upload materi & sertifikat (URL) — closed-loop ke Knowledge Asset
- ✅ Evaluasi Level 3 sesuai template (3 kelompok kriteria × 3 item, Implementasi, Start-Stop-Continue)
- ✅ Stage `completed` (closed-loop sharing ke KM/CoP)

### KM & TMS (modul yang sudah ada, tetap dipertahankan)
- KM: 4 pilar — SME Directory, Knowledge Map (gap analysis), CoP, Knowledge Asset
- TMS: 3 stage — Acquisition (9-Box Talent Grid), Development (IDP), Alignment (Succession)

## Storage

- Data disimpan di **browser localStorage** dengan prefix `kmls_v2_`.
- Setiap user yang membuka aplikasi di browser sendiri akan punya data sendiri (untuk multi-user real-time, perlu backend — fase berikutnya).
- Backup: menu **Pengaturan → Export Semua Data** (download JSON).
- Reset: menu **Pengaturan → Reset ke Data Awal** (hanya Admin).

## Demo Flow untuk Pengetesan

1. Login sebagai **Rizky Pratama** (Pegawai). Buat pengajuan baru di menu Pengajuan.
2. Logout, login sebagai **Dewi Lestari** (Kadiv Keuangan). Setujui pengajuan tersebut.
3. Login sebagai **Ahmad Hidayat** (Deputi/Anggota BP). Setujui di tahap berikutnya.
4. Login sebagai **Budi Santoso** (Pelaksana PSDM). Lakukan Analisa 4 kriteria.
5. Login sebagai **Sri Wahyuni** (Kadiv PSDM). Terbitkan Surat Tugas.
6. Lanjutkan flow: Terdaftar → Berlangsung → Selesai → Pembayaran → Laporan → Evaluasi → Closed-Loop.

## Catatan Tambahan

- `App.jsx` ~2840 baris, single-file React (sesuai pola arsitektur yang Bapak gunakan).
- Mudah dipecah jadi multi-file di iterasi berikutnya bila diperlukan.
- Untuk role full real-auth dengan SSO/LDAP BPKH, mock login bisa diganti dengan integrasi Auth provider.
- KM dan TMS module masih basic (sesuai feedback bahwa fokus utama adalah workflow pelatihan); siap untuk diperkaya di iterasi berikutnya.
