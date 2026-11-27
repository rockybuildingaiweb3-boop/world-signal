# AI Studio Implementation Brief — WORLD SIGNAL (Active Frontend)

This is an active implementation brief for the existing frontend. **Do not start a new application or replace the current architecture.** Inspect the live repository on main before editing.

## Read first

1. README.md
2. AGENTS.md and agent.md
3. docs/ARCHITECTURE.md
4. docs/CONTENT_SCHEMA.md
5. docs/INTELLIGENCE_DATA_CONTRACT.md
6. docs/FRONTEND_CONTRACT.md
7. docs/SOURCE_POLICY.md
8. src/README.md
9. MUSE.md
10. content/templates/daily-edition.template.md

## Existing implementation

The active React 19 + TypeScript + Vite frontend already exists under src/. Reuse the current App shell, archive hook, navigation components, four feature views, parser, source-independence engine, design tokens, bilingual interface, and automated tests.

Core new deterministic modules:
- src/lib/intelligence/edition-diff/compareEditions.ts
- src/lib/intelligence/storylines/buildStorylineIndex.ts
- src/lib/intelligence/relationships/buildRelationshipGraph.ts
- Shared types and schema-v2 parsing live in src/types/edition.ts and src/lib/markdown/parseEdition.ts.

Preserve the warm archival-paper visual system, editorial typography, restrained domain colors, light/dark themes, and bilingual UI. Do not perform a greenfield rebuild.

## Product objective

Advance WORLD SIGNAL from a daily briefing reader into a longitudinal global intelligence publication. Implement:

1. Daily Delta — compare the selected edition with the previous available edition; show genuinely new, materially updated, unchanged, and omitted signals.
2. Storyline Tracker — follow one stable signal ID across editions, showing first-seen date, dated revisions, material changes, and current lifecycle.
3. Evidence Panel — show claim-level evidence, source changes, independence groups, and confidence with traceable references.
4. Cross-Edition Search — search historical signals by text, ID, domain, topic, status, and date range.
5. Relationship Explorer — show declared signal relationships with type, confidence, rationale, and supporting claims.

## Non-negotiable data rules

- Markdown editions remain the sole editorial source of truth.
- Do not create a second JSON news database or hard-code production stories.
- Do not call an LLM, model API, GitHub API, or private service from the browser.
- Read /data/editions-index.json and the Markdown path supplied by each index entry.
- Reuse the pure intelligence engines; do not reimplement comparison logic inside React components.
- Keep schema-v1 editions readable. Missing schema-v2 metadata in historical editions must be displayed as unavailable, never guessed. Schema-v2 continuity dates may be explicit `null` when the archive lookback is incomplete; respect `history_complete` and never fabricate a first-seen or last-update date.
- A missing signal in a later edition is omitted, not resolved or retracted.
- Signal identity is signal_id, not headline text.
- A new source does not automatically mean independent corroboration. Continue using the single source-independence engine.
- related_signal_ids means a coarse contextual link only. Never label it causal.
- Never infer causality from timing, geographic proximity, correlated market movement, or narrative similarity.
- Preserve source URLs, claim IDs, signal IDs, dates, confidence, and relationship rationale.

## Implementation sequence

### Step 1 — Daily Delta

- Add a restrained What's Changed section near the top of Briefing.
- Compare the selected edition with the immediately previous available edition in the archive index.
- Use compareEditions() from the existing edition-diff module.
- Show real counts and allow filtering to new, updated, unchanged, and omitted signals.
- A selected row must open the corresponding signal in Expanded.
- Show comparison unavailable when there is no previous edition; do not fabricate baseline values.

### Step 2 — Storyline Tracker

- Use buildStorylineIndex() from the existing storylines module.
- Load only the editions needed for the selected signal or history view; do not eagerly parse the entire archive if the archive grows.
- Display actual edition dates and structured timeline_events when present.
- Distinguish first appearance, material update, unchanged appearance, and reappearance after a gap.
- Never treat omission as closure.

### Step 3 — Evidence and relationships

- Use the parsed claim and source ledgers.
- Use buildRelationshipGraph() from the existing relationships module.
- Distinguish typed schema-v2 links from coarse legacy contextual links.
- Causal links must expose supporting claims and rationale; absent evidence means no causal assertion.

### Step 4 — Cross-Edition Search

- Search loaded/indexed archive content with explicit loading and partial-result states.
- Keep query state shareable where appropriate.
- Do not download every historical edition on initial page load.
- Start with a deterministic client index. Consider a worker only if measurements justify it.

## UX and accessibility

- Preserve the four primary views.
- Integrate new functionality into existing sections or justify a secondary navigation entry.
- Keep the first screen focused on consequential information, not decorative metrics.
- Support desktop, tablet, and mobile layouts.
- Keyboard access, visible focus, semantic headings, dialog focus management, and reduced-motion support are required.
- Provide explicit loading, empty, malformed-data, unresolved-link, and network-error states.
- Avoid fake charts, placeholder metrics, example events presented as production, or nonfunctional controls.

## Engineering rules

- Keep comparison, indexing, and graph logic in pure src/lib/intelligence modules.
- Keep React components focused on presentation and interaction.
- Add tests for each new data rule and critical interaction.
- Keep synthetic fixtures under src/test/fixtures/; never publish them as real editions.
- Run bun run typecheck, bun run lint, bun run test, and bun run build.
- Do not edit canonical Markdown, Muse rules, templates, publishing scripts, or generated public content as part of frontend work.

## Delivery requirements

Before implementation, report the existing files to reuse and exact files to change. Implement one coherent step at a time. After each step, report changed files, test results, unresolved limitations, and commit SHA. Never claim a check passed unless it ran.

## Current Implementation Status (Snapshot — Phase 05)

- **Implemented**:
  - **Daily Delta (`DailyDeltaSection.tsx` + `compareEditions.ts`)**: Deterministic cross-edition comparison in Briefing showing real New, Updated, Unchanged, and Omitted counts, proportional turnover bar, evidence diffs, omission-is-not-resolution safeguards, and explicit unavailable states.
  - **Evidence Panel & Audit (`AuditView.tsx`, `AuditOverviewCards.tsx`, `OriginGroupExplorer.tsx`, `AuditClaimLedger.tsx`)**: Single source-independence engine (`calculateIndependence.ts`), derived source record & source class proportional charts, filterable origin groups, searchable claim-to-source ledger, Importance × Confidence 5×4 cross-matrix, and editorial audit trail tabs.
  - **Relationship Explorer (`RelationshipExplorerMatrix.tsx` + `SignalEvidenceLedgers.tsx` + `buildRelationshipGraph.ts`)**: Interactive 3-column cross-domain SVG relationship map and filterable edge ledger in Synthesis plus dossier-level declared relationships in Expanded, strictly separating explicitly typed schema-v2 links from coarse legacy `related_signal_ids`.
  - **Structured Signal Chronology (`TimelineTrack.tsx`)**: Renders schema-v2 `timelineEvents` with interactive claim/source links and cleanly falls back to schema-v1 Markdown timelines.
  - **Global Intelligence Search (`GlobalSearchOverlay.tsx` + `useGlobalSearch.ts` + `searchIndex.ts`)**: Accessible cross-edition archive search triggered via TopBar or `Ctrl+K` / `Cmd+K`. Supports exact Signal ID, partial headline, Chinese substring, mixed CJK/English, quoted phrase, claim, source outlet, and narrative search; progressive-disclosure advanced filters (domain, date range, importance, confidence, status, topic, tag, claim status, publisher); deterministic ranking (Relevance, Latest, Importance, Confidence separately); grouping by stable `signal_id` with expandable historical occurrences; incremental cancellable batch indexing (never runs on initial page load); revision-keyed cache invalidation on `updated_at`; and shareable URL parameters (`q`, `domain`, `from`, `to`).
  - **Longitudinal Storyline Tracker (`StorylineDrawer.tsx` + `useStoryline.ts` + `storylineHelpers.ts`)**: On-demand, cancellable historical storyline inspection launched from Expanded dossiers, Search results, Comparison rows, or Followed signals. Strictly delegates revision classification to `buildStorylineIndex()` and diffs to `compareSignalSnapshots()`. Displays archive coverage completeness, Event Timeline vs. Storyline Revision Timeline distinction, same-day revision boundary, absent-from-latest-edition (omission ≠ resolution) safeguard, and revision-level field/claim/source diff inspection with direct links to exact historical dossiers.
  - **My Intelligence Desk (`ReaderDeskDrawer.tsx` + `useReaderDesk.ts` + `readerState.ts`)**: Local-first personal reader workspace (drawer entry point; preserves the 4 primary nav views). Supports **Save for Later**, **Follow Signal** (by stable `signal_id`, never headline), and normalized **Followed Topics** with versioned `localStorage` persistence (`world-signal-reader-desk-v1`), runtime validation, legacy v0 migration, corrupt-state recovery, quota/unavailable warnings, explicit `"Your Reader Desk is stored on this device."` disclosure, and 2-step `Clear local reader data`. Private reader state is never placed in shareable URLs.
  - **Since Your Last Visit / Catch-Up (`CatchUpBanner.tsx` + `catchUpEngine.ts`)**: Explicit manual `Mark as reviewed` checkpoint (never auto-marked on load). Computes General Catch-up and Personal Catch-up (followed signal alerts) via `compareEditions()`. Stores a compact local reviewed snapshot (`world-signal-reviewed-snapshot-v1`, structured fields + deterministic narrative hash) so same-day Muse overwrites can still be diffed locally; shows explicit `first_visit`, `up_to_date`, and `baseline_unavailable` states without fabricating diffs.
  - **Arbitrary Edition Comparison (`EditionComparisonModal.tsx` + `useEditionComparison.ts` + `arbitraryComparison.ts`)**: Compare any two real archive editions (adjacent or non-adjacent) from Daily Delta or Archive Drawer. Validates real archive entries, rejects same-date selection, normalizes chronological ordering (`older → newer`), reuses `compareEditions()`, preserves the Omission Is Not Resolution safeguard, and supports navigating directly to either the previous or current signal version.
- **Partially Implemented**:
  - **Archive Scale Indexing Strategy**: Current incremental client batch indexing (`INDEX_BATCH_SIZE = 2`) with revision-keyed cache invalidation is ideal for small-to-medium archives (dozens of editions). If the archive grows into hundreds of editions, moving indexing/tokenization into a Web Worker or a build-time derived static search index should be evaluated without changing canonical Markdown as source of truth.
- **Pending**:
  - **Evidence Export (Markdown & CSV)**: Planned next phase (architecture documented below; intentionally deferred rather than shipping a fragile PDF generator).

## Operational & Archival Boundaries

- **Same-Day Revision Boundary**: Muse updates `content/editions/YYYY/MM/YYYY-MM-DD.md` in place on the same day. Because the static archive stores one published file per calendar date, historical intraday revisions are not preserved in the public archive. Same-day Catch-Up works locally only when the user previously clicked `Mark as reviewed` on this device and the compact local snapshot (`world-signal-reviewed-snapshot-v1`) is intact; otherwise, the UI explicitly reports baseline unavailability.
- **Archive Coverage Completeness**: Storyline Tracker and Followed Signal checks reflect only archived editions available in `/data/editions-index.json` (and any editions that load successfully). When `history_complete: false` is declared or any edition fails to load, coverage is explicitly marked incomplete.
- **Local-Only Personal State**: All Reader Desk bookmarks, followed signals, followed topics, and review checkpoints live strictly in browser `localStorage` on the user's device. There is no account system, backend sync, or cross-device persistence.

## Future Architecture Plan — Evidence Export (Markdown & CSV)

To support analysts, researchers, and archival workflows without introducing heavy PDF rendering or fragile print layouts, the recommended next-phase export capability should be implemented as pure, deterministic client-side formatters under `src/lib/intelligence/export/`:

1. **Markdown Dossier & Storyline Export (`exportSignalMarkdown.ts`)**:
   - Export a single signal dossier or longitudinal storyline as a clean, self-contained `.md` file via Blob download.
   - Preserves verbatim: `signal_id`, `edition_date`, `updated_at`, `domain`, `topic`, `importance`, `confidence.overall`, `confidence.rationale`, `status`, structured `claims` (including `claim_id`, `status`, `confidence`, `source_ids`), `sources` (including canonical `url`, `outlet`, `source_class`, `independence_group`, `relationship`, `count_as_independent`), declared `relationships` (preserving `type`, `confidence`, `rationale`, `supporting_claim_ids`), and an explicit provenance footer citing the canonical edition path.
   - Optionally includes a Storyline Revision table when exported from `StorylineDrawer`.
2. **CSV Ledger Export (`exportLedgersCsv.ts`)**:
   - RFC-4180 compliant CSV serializer with formula-injection neutralization (prefixing leading `=`, `+`, `-`, `@` in untrusted text cells) and UTF-8 BOM option for Excel CJK compatibility.
   - Two deterministic schemas:
     - **Claim Ledger CSV**: `edition_date,signal_id,domain,signal_importance,signal_confidence,claim_id,claim_statement,claim_status,claim_confidence,supporting_source_ids,independent_origin_count`.
     - **Source Provenance CSV**: `edition_date,signal_id,source_id,outlet,title,url,published_at,source_class,registry_id,independence_group,relationship,qualifies_as_independent,supports_claim_ids`.
   - Entry points: subtle `Export (.md / .csv)` menu in `SignalDossierHeader`, `AuditView` (Claim & Source Ledgers), and `EditionComparisonModal` (Diff summary CSV).