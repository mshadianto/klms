# KMLS — Knowledge Management & Learning System

> **⚠️ Disclaimer:** KMLS adalah **inisiasi personal** MS Hadianto sebagai prototipe konsep KMS terintegrasi. **BUKAN aplikasi resmi Badan Pengelola Keuangan Haji (BPKH).** Seluruh data pegawai, pelatihan, dan dokumen yang ditampilkan bersifat fiktif/dummy untuk keperluan demo dan eksplorasi konsep semata. Belum melalui audit keamanan formal — jangan input data sensitif atau rahasia jabatan.

Prototipe aplikasi terintegrasi mencakup pengelolaan pelatihan end-to-end, **4 pilar Knowledge Management** (SME, Knowledge Map, CoP, Knowledge Asset), fitur KMS modern (Learning Paths, Skill Matrix, Q&A, Analytics, Lifecycle), dan **Talent Management System** dengan 9-Box mapping & succession planning.

🌐 **Live demo:** https://klms.mshadianto.id/

## Stack

- React 18 + Vite 6
- Tailwind CSS 3
- lucide-react (icons)
- Persistensi via `localStorage` (browser-side, no backend)

## Development

```bash
npm install
npm run dev      # dev server di http://localhost:5173
npm run build    # build production ke dist/
npm run preview  # preview hasil build
```

## Deploy

Auto-deploy ke GitHub Pages via `.github/workflows/deploy.yml` setiap push ke `main`. Custom domain `klms.mshadianto.id` diserve via Cloudflare DNS (CNAME → `mshadianto.github.io`, DNS-only / grey cloud) supaya Let's Encrypt provisioning GitHub Pages tidak diblokir.

## Struktur

- `src/App.jsx` — seluruh aplikasi (~3.4k lines): modules, primitives, seed data, storage, layout, footer
- `src/main.jsx` — entry point React
- `src/index.css` — Tailwind directives + base reset
- `index.html` — Vite HTML shell
- `vite.config.js` — base `/` (root custom domain)
- `public/CNAME` — custom domain marker untuk GitHub Pages
- `.github/workflows/deploy.yml` — Pages deploy workflow
- `mockups/` — 3 file HTML mockup design awal (standalone, tidak loaded oleh React app)
- `CLAUDE.md` — panduan arsitektur untuk Claude Code

## Modul

### Core
- **Dashboard** — ringkasan eksekutif: pengajuan, biaya, asset, SME, CoP engagement
- **Pengajuan Pelatihan** — workflow end-to-end (draft → pending → review → approved → completed) + **Knowledge Harvest** CTA pada pelatihan selesai → publish Lessons Learned ke Knowledge Asset
- **Direktori Pegawai** — daftar pegawai BPKH + riwayat pengembangan
- **Pengaturan** — backup JSON, reset data

### Knowledge Management (4 Pilar + Extended)
- **SME Development** — pengembangan Subject Matter Expert per domain keahlian
- **Knowledge Map** — pemetaan domain pengetahuan & identifikasi gap (matang/berkembang/gap)
- **Community of Practice** — komunitas pembelajar dengan engagement tracking
- **Knowledge Asset** — repositori dengan **lifecycle** (draft→review→published→archived), **versioning**, **review date** dengan banner overdue, **ratings** 👍/👎, **bookmarks** per user, **threaded comments**, dan **Knowledge Graph view** (related SMEs / CoPs / Learning Paths)
- **Learning Paths** — kurikulum step-by-step (asset + training) dengan enrollment & progress tracking per user
- **Skill Matrix** — pegawai × kompetensi grid dengan auto **gap analysis** vs role requirement
- **Ask the Expert** — Q&A dengan auto-routing ke SME by domain, voting, dan **promote jawaban menjadi Knowledge Asset**
- **KM Analytics** — health score (0-100), dormant detection (>90 hari), top contributors, trending, tag cloud

### Talent Management System
- **9-Box Mapping** — visualisasi talent berdasarkan kinerja × kompetensi
- **Talent Pool** — Star / High Potential / Future Star / Critical Backup
- **Succession Plan** — kandidat suksesi untuk posisi kritis
- **Workflow Promosi** — pengajuan → cek syarat → approval

### Global
- **Cross-entity search** di topbar — cari lintas asset/SME/pegawai/CoP/learning path/Q&A dengan grouped results

## Catatan teknis

- **`STORAGE_KEY: 'kmls:appdata:v2'`** — data lama v1 di-skip, user dapat seed baru.
- **`CURRENT_USER_ID: 'p001'`** (Sopian Hadianto) — hard-coded; multi-user perlu auth (belum di-implement).
- Single-file architecture — `src/App.jsx` ~3.4k lines. Refactor split per-module belum dilakukan; lihat `CLAUDE.md` untuk arsitektur.

## License & Credits

Developed by **MS Hadianto** ([@mshadianto](https://github.com/mshadianto)) sebagai eksplorasi konsep KMS modern. Disediakan apa adanya tanpa jaminan apapun.

© 2026 MS Hadianto.
