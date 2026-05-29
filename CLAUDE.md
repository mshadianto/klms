# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ Critical context: this is NOT an official BPKH app

KMLS is **MS Hadianto's personal prototype** — explicitly NOT a Badan Pengelola Keuangan Haji (BPKH) official application. All names, divisions, employees, training records, and documents in seed data are **fictional**. The footer carries an amber disclaimer making this explicit.

When you write new UI copy, README sections, commit messages, or anything user-visible, **never frame this as a BPKH product**. Always position as a personal prototype / concept exploration. Don't suggest forking to a BPKH org, don't add language implying institutional endorsement, don't invent realistic-looking BPKH personnel data. The amber footer disclaimer styling is intentional — keep it amber, not slate.

## Repository Layout

- `src/App.jsx` — the full single-file React application (~3.4k lines). All modules, primitives, seed data, store, layout, and footer live here.
- `src/main.jsx` — React entry point.
- `src/index.css` — Tailwind directives + tiny base reset.
- `index.html` — Vite HTML shell.
- `vite.config.js` — **`base: '/'`** (site is served from custom domain root `klms.mshadianto.id`; if reverting to github.io subpath, switch back to `'/klms/'`).
- `public/CNAME` — custom domain marker for GitHub Pages; copied to `dist/` as-is. Changing this changes the domain Pages serves on.
- `mockups/` — 3 standalone HTML mockups (`dashboard.html`, `knowledge-management.html`, `talent-management.html`). These predate the JSX and are not loaded by the React app — they serve as the design reference and can be opened directly in a browser.
- `docs/manual-book.html` — user-facing manual book (Bahasa Indonesia, ~33 halaman A4, print-ready → PDF). Self-contained HTML: inline CSS with `@page` rules + `@media print` blocks, no external assets. Audience is mixed (end-user + admin). **Keep in sync** with the app when you change module behavior, add a new module, or bump `APP_VERSION` — the manual references specific status maps, lifecycle states, and the 17 modules listed in `NAV_STRUCTURE`. If you only rename UI copy, don't bother; if you change a workflow or status enum, update the relevant section.
- `KMLS — Manual Book v1.1.pdf` (repo root) — the pre-rendered PDF export of `docs/manual-book.html`, committed for convenient download. It is a **build artifact of the HTML**, not a separate source — when you update `manual-book.html`, re-export this PDF (Ctrl+P → Save as PDF, Background graphics on) so the two don't drift. Filename has an em-dash + spaces; URL-encode when linking (`KMLS%20%E2%80%94%20Manual%20Book%20v1.1.pdf`).
- `KMLS-Business-Process-Flow.pdf` (repo root) — standalone diagram/documentation of the end-to-end business processes (pengajuan, KM lifecycle, talent workflows). Reference doc; not generated from the app, so update it by hand if a workflow changes materially.
- `.github/workflows/deploy.yml` — builds Vite and deploys `dist/` to GitHub Pages on every push to `main`.

## Common Commands

```bash
npm install
npm run dev      # http://localhost:5173/
npm run build    # -> dist/
npm run preview
```

There is no test setup, no linter config, and no git pre-commit hooks. Build is the only correctness gate.

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds and publishes to GitHub Pages. Pages source is "GitHub Actions" (already configured). Cloudflare DNS for `klms.mshadianto.id` MUST stay **DNS-only (grey cloud)** — orange cloud blocks Let's Encrypt validation and HTTPS will break. Live URL: https://klms.mshadianto.id/ (`mshadianto.github.io/klms/` 301-redirects there).

## Architecture of `src/App.jsx`

The file is organized as labeled sections separated by `// ===` banners. Approximate line ranges (the file grows, so trust grep over these numbers):

1. **CONFIGURATION & CONSTANTS** (~L14–120) — `APP_VERSION`, `STORAGE_KEY` (currently `kmls:appdata:v2`), `CURRENT_USER_ID` (hard-coded `'p001'` — single-user session model), `NAV_STRUCTURE`, `DIVISI_LIST`, status/level/asset-type/competency lookup maps (`PENGAJUAN_STATUS`, `SME_LEVEL`, `ASSET_TYPES`, `ASSET_STATUS`, `COMPETENCY_LEVELS`, `QUESTION_STATUS`).
2. **SEED_DATA** (~L120–266) — initial dataset. The shape here *is* the schema. Entity arrays:
   - Core: `pegawai`, `pengajuan`, `sme`, `cop`, `succession`, `talentPool`
   - KM extended: `knowledgeAsset` (now with `status`, `version`, `reviewDate`, `description`, `ratingsUp`, `ratingsDown`, `lastViewedAt`, `comments`, optional `harvestedFrom`), `bookmarks`
   - Skill: `competencies`, `roleRequirements`, `pegawaiCompetencies`
   - Learning: `learningPaths`, `enrollments`
   - Q&A: `questions` (with nested `answers[]`, each answer can have `promotedToAssetId`)
   Cross-references are by string id (e.g. `pengajuan.pegawaiId` → `pegawai.id`).
3. **STORAGE LAYER** (~L268–315) — `Store.load/save/reset`. Prefers Claude artifact's `window.storage` if present, falls back to `localStorage`. Auto-save debounce is 800ms in `KMLSApp`.
4. **UTILITIES** (~L317–353) — `findPegawai`, `findAsset`, `isBookmarked`, `userBookmarks`, `daysBetween/Until/Since`, and **`assetRelations(data, asset)`** — the heuristic that powers the Knowledge Graph view (matches by tag/division overlap).
5. **UI PRIMITIVES** (~L355–551) — `Card`, `Badge`, `Button`, `Input`, `Select`, `Textarea`, `Modal`, `Avatar`, `Tabs`, `Rating`, `BookmarkBtn`, `ProgressBar`, `StatusBadge`, `Toast`, `EmptyState`, `StatCard`. **Reuse these** — the visual consistency depends on every module composing from them.
6. **LAYOUT** (~L553–796) — `AppFooter` (developer credit + **amber** disclaimer), `GlobalSearch` (topbar cross-entity search dropdown), `Sidebar`, `TopBar`. `TopBar` now receives `data` + `onNavigate` (not `search`/`setSearch`) — search state is internal to `GlobalSearch`.
7. **Module components** (~L798–3340) — one component per nav entry. Module list:
   - Core: `Dashboard`, `PengajuanModule` (includes Knowledge Harvest CTA + modal), `PegawaiModule`, `SettingsModule`
   - KM 4-pilar: `SMEModule`, `KnowledgeMapModule`, `CoPModule`, `KnowledgeAssetModule` (+ `AssetDetailModal` sub-component)
   - KM extended: `LearningPathsModule`, `SkillMatrixModule`, `AskExpertModule`, `KMAnalyticsModule`
   - TMS: `TMSOverviewModule`, `NineBoxModule`, `TalentPoolModule`, `SuccessionModule`, `PromosiModule`
8. **MAIN APP** (~L3342–end) — `PAGE_META` map, `KMLSApp` default export. Owns `data` state, wires `Store.load`/auto-save, dispatches to modules via `switch (view)` in `renderView()`. Renders `<AppFooter />` after the active view inside the scrollable region.

### State model

There is **one state tree** (`data`) held in `KMLSApp` and threaded down. Mutating modules receive `onUpdate(newData)` and pass back a whole replacement object (immutable-style spread, e.g. `onUpdate({ ...data, pengajuan: [...] })`). Auto-save fires whenever `data` changes. There is no reducer, no context, no router — adding either is a real refactor, not a tweak.

`CURRENT_USER_ID` is hard-coded to `'p001'` (Sopian Hadianto). Bookmarks, enrollments, ratings, comments, and question authorship all use this constant. Adding real multi-user means: replace the constant with state, add an auth/login flow, and migrate the storage key. Treat it as a single-user session for now.

### Adding a new module

1. Add an entry to `NAV_STRUCTURE` (with an icon imported from `lucide-react`). If the module has a notification count, add `badgeKey` and extend `counts` in `KMLSApp`.
2. Add a title/subtitle entry to `PAGE_META`.
3. Write the component, accepting `{ data, onUpdate, showToast, onNavigate }` as needed.
4. Add a `case` to the `switch` in `renderView()`.
5. If the module needs new persisted entities, extend `SEED_DATA` so existing storage migrations don't break (the load path does no schema migration — old saved data with missing keys may throw). Bumping `STORAGE_KEY` (e.g. `v2` → `v3`) is the escape hatch and forces all users back to fresh seed.

### Knowledge Graph heuristic

`assetRelations(data, asset)` matches related SMEs / CoPs / Learning Paths by case-insensitive tag overlap with `s.domain` / `c.nama`, plus owner's `divisi`. It is a **prototype-grade heuristic** — not semantic, no embeddings. If you upgrade to real semantic search, swap the implementation here; consumer (`AssetDetailModal`) just uses the returned shape `{ owner, smes, cops, paths }`.

## Domain context (Indonesian)

The UI and seed data are in Bahasa Indonesia. The app uses BPKH-themed fictional content (Badan Pengelola Keuangan Haji — Indonesia's Hajj Financial Management Agency) to model realistic training/KM/talent scenarios — **but the app is not affiliated with BPKH**. Keep new copy in Indonesian to match. Key terms: *pengajuan* = submission/request, *pelatihan* = training, *pegawai* = employee, *divisi* = division, *jabatan* = position, *kompetensi* = competency, *suksesi* = succession, *kandidat* = candidate.
