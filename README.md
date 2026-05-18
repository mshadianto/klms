# KMLS — BPKH Learning Suite

Prototipe aplikasi terintegrasi **Knowledge Management & Learning System** untuk BPKH (Badan Pengelola Keuangan Haji). Mencakup pengelolaan pelatihan end-to-end, 4 pilar KM (SME, Knowledge Map, CoP, Knowledge Asset), dan Talent Management dengan 9-Box mapping & succession planning.

🌐 **Live demo:** https://mshadianto.github.io/klms/

## Stack

- React 18 + Vite 6
- Tailwind CSS 3
- lucide-react (icons)
- Persistensi via `localStorage`

## Development

```bash
npm install
npm run dev      # dev server di http://localhost:5173
npm run build    # build production ke dist/
npm run preview  # preview hasil build
```

## Deploy

Auto-deploy ke GitHub Pages lewat workflow `.github/workflows/deploy.yml` setiap push ke `main`.

## Struktur

- `src/App.jsx` — seluruh aplikasi (modules, primitives, seed data, storage)
- `src/main.jsx` — entry point React
- `mockups/` — 3 file HTML mockup design awal (dashboard, KM, talent management)
- `CLAUDE.md` — panduan arsitektur untuk Claude Code

## Modul

**Knowledge Management**
- SME Development
- Knowledge Map
- Community of Practice
- Knowledge Asset

**Talent Management**
- 9-Box Mapping
- Talent Pool
- Succession Plan
- Workflow Promosi

**Core**
- Dashboard
- Pengajuan Pelatihan
- Direktori Pegawai
- Pengaturan
