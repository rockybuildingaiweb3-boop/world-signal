# Architecture

## Objective

WORLD SIGNAL is a static-first global intelligence publication. Its canonical editorial record is Markdown. The website is a reader and analysis interface over that record, not the place where news facts are authored.

| Layer | Owner | Responsibility |
|---|---|---|
| Research and editorial production | Muse | Discover, corroborate, analyse, and write daily Markdown |
| Canonical content and history | GitHub | Version and preserve Markdown editions |
| Static publishing | GitHub Actions | Mirror Markdown into public assets and build the archive index |
| Frontend presentation | React / TypeScript app under `src/` | Parse, navigate, search, compare, and render editions |
| Intelligence projections | Pure modules under `src/lib/intelligence/` | Deterministic edition diff, storyline history, and explicit relationships |

## Data flow

~~~mermaid
flowchart LR
  M[Muse research: text + verified media] --> C[Canonical Markdown]
  C --> G[GitHub history]
  G --> W[Publishing validation & workflow]
  W --> P[Public Markdown]
  W --> I[Edition index]
  P --> F[React frontend]
  I --> F
  F --> V[Parser, rights & schema validation]
  V --> X[Intelligence projections & visual media selector]
  X --> U[Four reader views + editorial media rendering]
~~~

The browser uses same-origin static requests for archive data and loads only validated HTTPS external visual media assets declared in canonical Markdown. It does not enumerate GitHub directories, scrape news sites, maintain a separate canonical image database, or call backend or model APIs to interpret an edition.

## Canonical archive

Canonical files live under `content/editions/YYYY/MM/YYYY-MM-DD.md`. There is one file per local calendar date. Morning, midday, and evening runs replace that day's complete cumulative edition. Git history preserves intermediate versions. A new date creates a new file.

The project timezone is America/Los_Angeles. Timestamps require an explicit offset or UTC.

## Static publishing

The publishing script mirrors canonical editions to:

- `public/editions/YYYY/MM/YYYY-MM-DD.md`
- `public/data/editions-index.json`

The mirror is generated output. The publishing validator checks frontmatter, required headings, schema-v2 blocks, and (when present) `media_assets` rights and verification metadata without downloading or scraping external image files. The index contains archive metadata and paths, not the full story content. The frontend loads the index and fetches selected Markdown editions on demand. Never edit generated `public/` content manually.

## Content model

An edition contains edition-level YAML frontmatter, an executive briefing, three domain sections, cross-domain synthesis, personal implications, a watchlist, and audit notes.

Each signal is an H2 section with a stable ID, one YAML metadata fence, claim records, source records, optional approved `media_assets` records, and human-readable Markdown narrative. Schema v1 remains readable. Schema v2 adds continuity, update classification, structured timeline events, explicit typed relationships, and optional visual media metadata. See `INTELLIGENCE_DATA_CONTRACT.md` and `MEDIA_ASSET_POLICY.md`.

## Intelligence layer

Pure functions under `src/lib/intelligence/` derive information from parsed editions:

- `edition-diff/` compares signal snapshots by stable ID. Routine sync/access timestamps are not material changes.
- `storylines/` assembles cross-edition history. A missing signal is an omission, not a resolution.
- `relationships/` projects declared links. Legacy `related_signal_ids` are contextual only; the system does not infer causation.

These modules are deterministic projections, not a second editorial database. They preserve edition dates, signal IDs, claim IDs, source provenance, relationship rationale, and confidence.

## Frontend

The active React 19 + TypeScript + Vite application lives under `src/`. Its four reader views are Briefing, Expanded & Timelines, Synthesis & Personal, and Audit & Methodology. New intelligence capabilities extend these views and supporting components; do not scaffold a replacement application.

## Why Markdown-first

Markdown is human-readable, reviewable in GitHub, easy for Muse to produce, suitable for a daily archive, and portable across frontend frameworks. YAML frontmatter and per-signal YAML fences provide deterministic fields for parsing.

## Non-goals

No live news crawler, CMS, runtime model calls, financial trading advice, or database is required for this phase. Keep the static publishing architecture until measured requirements justify a change.