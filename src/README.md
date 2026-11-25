# WORLD SIGNAL Frontend Architecture (`src/`)

Static-first React 19 + TypeScript + Vite + Tailwind CSS 4 intelligence publication frontend consuming `/data/editions-index.json` and canonical Markdown editions under `/editions/YYYY/MM/YYYY-MM-DD.md`.

## Directory Structure

- `src/app/` — Root application shell (`App.tsx`) orchestrating view routing, URL query state (`?edition=&view=&signal=`), archive loading, and preferences.
- `src/hooks/`
  - `useArchive.ts` — Archive index loading, revision-aware `(path, updated_at)` edition caching, same-day manual refresh, and in-memory local Markdown preview.
  - `usePreferences.ts` — Light-first archival theme toggle and edition-aware `zh-CN` / `en` interface localization with persistent user override.
- `src/lib/`
  - `content/editionClient.ts` — Strict `/editions/YYYY/MM/YYYY-MM-DD.md` path validation, revision-keyed cache, and index fetching.
  - `markdown/parseEdition.ts` — AST-assisted (`unified` + `remark-parse` + `remark-gfm`) edition parser and safe `js-yaml` (`JSON_SCHEMA`) metadata parser with schema validation diagnostics and strict non-promotion of unknown source metadata.
  - `source-independence/calculateIndependence.ts` — Single authoritative Source Policy engine calculating independent reporting origins, group deduplication, and explicit exclusion reasons across all views.
  - `filtering/filterSignals.ts` — Multi-dimensional signal filtering (domain, importance, confidence, status, topic, tag, source class, and multilingual full-text search).
  - `intelligence/edition-diff/compareEditions.ts` — Deterministic signal snapshot and edition comparison; omitted is never resolved.
  - `intelligence/storylines/buildStorylineIndex.ts` — Cross-edition storyline history keyed by stable signal ID.
  - `intelligence/relationships/buildRelationshipGraph.ts` — Explicit relationship graph; legacy related IDs remain contextual only.
  - `dates/formatDates.ts` — Timezone-aware (`America/Los_Angeles`) date and timestamp formatters separating event dates from publication/verification times.
  - `i18n/uiStrings.ts` — Bilingual (`zh-CN` / `en`) UI dictionary.
  - `navigation/urlState.ts` — Safe URL query state parsing and history synchronization.
- `src/components/`
  - `layout/TopBar.tsx` — Strict 3-zone editorial top bar (`WORLD SIGNAL` | 4 views | `Archive`).
  - `navigation/ArchiveDrawer.tsx` — Slide-over Archive & Settings drawer (edition list, prev/next controls, refresh, theme, language, and secondary local Markdown preview utility).
  - `editorial/` — `SafeMarkdown.tsx` (strict HTTP/HTTPS allowlist, `skipHtml`, interactive signal & `[S#]` citation links), `SignalMetaLine.tsx` (zero-pill metadata strip), `TimelineTrack.tsx`, `ScenariosGrid.tsx`.
  - `common/` — `ArchiveEmptyState.tsx`, `LocalMarkdownModal.tsx`.
- `src/features/`
  - `briefing/BriefingView.tsx` — Editorial front page: masthead, Lead Development, Executive Summary & Limitations, editorially ordered Top Signals, 3-Domain Overview, compact secondary index, and reading path.
  - `expanded/ExpandedView.tsx` — Split-pane desktop Signal Explorer (filterable rail + active dossier canvas) and progressive-disclosure mobile list/detail reading view with interactive claim↔source inspection.
  - `synthesis/SynthesisView.tsx` — Structured Cross-Domain Synthesis (separating established vs. unestablished threads), time-horizon impacts, conditional scenarios, Personal Implications with disclaimer, and responsive Watchlist.
  - `audit/AuditView.tsx` — Derived source overview, Reporting Origin Explorer grouped by `independence_group`, filterable Claim Ledger evidence trace, Confidence vs. Importance comparison, and tabbed Editorial Audit Trail.
- `src/styles/index.css` — Centralized CSS custom properties for light and dark archival paper themes.
- `src/types/edition.ts` — Shared TypeScript domain models.
- `src/test/` — Automated `node:test` suites covering parser integrity, source independence, archive path/cache hardening, signal filtering, and cross-edition intelligence projections (synthetic fixtures live strictly under `src/test/`).

## Commands

- `npm run dev` — Local development server on port 3000.
- `npm run typecheck` — Strict TypeScript check (`tsc -b --noEmit`).
- `npm run lint` — ESLint validation.
- `npm run test` — Run automated unit & real-edition integration tests.
- `bun run build` — TypeScript project check plus Vite production bundle.
- `bun run build:content` — Generate public Markdown copies and the archive index from canonical Markdown; do not edit generated files manually.
