# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Layout

- `src/App.jsx` — the full single-file React application (~1.8k lines). All modules, primitives, seed data, and storage live here.
- `src/main.jsx` — React entry point.
- `src/index.css` — Tailwind directives + tiny base reset.
- `index.html` — Vite HTML shell.
- `vite.config.js` — **`base: '/'`** (site is served from custom domain root `klms.mshadianto.id`; if reverting to github.io subpath, switch back to `'/klms/'`).
- `public/CNAME` — custom domain marker for GitHub Pages; copied to `dist/` as-is. Changing this changes the domain Pages serves on.
- `mockups/` — 3 standalone HTML mockups (`dashboard.html`, `knowledge-management.html`, `talent-management.html`). These predate the JSX and are not loaded by the React app — they serve as the design reference and can be opened directly in a browser.
- `.github/workflows/deploy.yml` — builds Vite and deploys `dist/` to GitHub Pages on every push to `main`.

## Common Commands

```bash
npm install
npm run dev      # http://localhost:5173/
npm run build    # -> dist/
npm run preview
```

There is no test setup, no linter config, and no git pre-commit hooks.

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds and publishes to GitHub Pages. Pages source must be set to "GitHub Actions" (already configured). Live URL: https://klms.mshadianto.id/ (custom domain via `public/CNAME`; `mshadianto.github.io/klms/` 301-redirects there).

## Architecture of `src/App.jsx`

The file is organized as labeled sections separated by `// ===` banners. Read in this order to get oriented:

1. **CONFIGURATION & CONSTANTS** (~L12–90) — `NAV_STRUCTURE`, `DIVISI_LIST`, status/level/asset-type lookup maps. Adding a new nav item or status requires editing these maps **and** the corresponding render switch (see step 4).
2. **SEED_DATA** (~L95–159) — initial dataset. The shape here *is* the schema: `pegawai`, `pengajuan`, `sme`, `knowledgeAsset`, `cop`, `succession`, `talentPool`. Cross-references are by string id (e.g. `pengajuan.pegawaiId` → `pegawai.id`).
3. **Store / utilities / UI primitives** (~L165–370) — `Card`, `Badge`, `Button`, `Input`, `Select`, `Textarea`, `Modal`, `Avatar`, `Toast`, `EmptyState`, `StatCard`. Reuse these instead of writing raw markup; the visual language is consistent only because every module composes from them. `Store` prefers Claude's `window.storage` if present, otherwise falls back to `localStorage`.
4. **Module components** (~L450–1670) — one component per nav entry: `Dashboard`, `PengajuanModule`, `PegawaiModule`, `SMEModule`, `KnowledgeMapModule`, `CoPModule`, `KnowledgeAssetModule`, `NineBoxModule`, `TalentPoolModule`, `SuccessionModule`, `PromosiModule`, `SettingsModule`.
5. **`KMLSApp`** (default export, near bottom) — root. Owns `data` state, wires `Store.load`/auto-save (800ms debounce), and dispatches to modules via a `switch (view)` in `renderView()`. `PAGE_META` drives the topbar title/subtitle.

### State model

There is **one state tree** (`data`) held in `KMLSApp` and threaded down. Mutating modules receive `onUpdate(newData)` and pass back a whole replacement object (immutable-style spread, e.g. `onUpdate({ ...data, pengajuan: [...] })`). Auto-save fires whenever `data` changes. There is no reducer, no context, no router — adding either is a real refactor, not a tweak.

### Adding a new module

1. Add an entry to `NAV_STRUCTURE` (with an icon imported from `lucide-react`).
2. Add a title/subtitle entry to `PAGE_META`.
3. Write the component, accepting `{ data, onUpdate, showToast }` as needed.
4. Add a `case` to the `switch` in `renderView()`.
5. If the module needs new persisted entities, extend `SEED_DATA` so existing storage migrations don't break (the load path does no schema migration — old saved data with missing keys will throw). Bumping `STORAGE_KEY` is the escape hatch.

## Domain context (Indonesian)

The UI and seed data are in Bahasa Indonesia. The app models BPKH (Badan Pengelola Keuangan Haji — Indonesia's Hajj Financial Management Agency) internal training, KM, and talent processes. Keep new copy in Indonesian to match. Key terms: *pengajuan* = submission/request, *pelatihan* = training, *pegawai* = employee, *divisi* = division, *jabatan* = position, *kompetensi* = competency.
