# WORLD SIGNAL — Agent Operating Manual

This file is the project's primary cross-agent operating contract. Read it before changing the repository.

## 1. Product mission

WORLD SIGNAL produces a high-quality, evidence-led daily intelligence briefing across:

- **World Events** — consequential global developments.
- **AI Frontier** — meaningful AI research, engineering, capability, and infrastructure progress.
- **Economic Outlook** — macroeconomic conditions, economic direction, and practical implications.

The product is not a volume-driven headline aggregator. The objective is to select important developments, distinguish established facts from claims and interpretations, explain why they matter, and preserve an auditable source trail.

## 2. System architecture

The project has four independent responsibilities:

| Responsibility | Owner | Canonical output |
|---|---|---|
| Research, verification, and editorial analysis | Muse | One daily Markdown edition |
| Source of truth and historical versions | GitHub | `content/editions/` and commit history |
| Static publication | GitHub Actions | `public/editions/` and `public/data/editions-index.json` |
| User experience | AI Studio / frontend agent | New application under `src/` |

The canonical content flow is:

`Muse → content/editions/*.md → GitHub Actions → public Markdown + archive index → frontend`

The browser must not need Muse, a model API, a database, or the GitHub API to render already-published editions.

## 3. Role boundaries

### Muse
- Reads the editorial policy, schema, template, source registry, and previous editions.
- Researches, verifies, and writes daily Markdown.
- May create or update only the current canonical daily edition.
- Must never write interface code or update publishing infrastructure.

Read `MUSE.md`.

### Frontend agent / AI Studio
- Owns the active React/TypeScript frontend under `src/` and extends the current architecture.
- Reads the published archive index and Markdown editions.
- Owns layout, typography, responsive behavior, interactions, filtering, cross-edition projections, navigation, and accessibility.
- Must not scaffold a replacement application, hard-code news data, or alter editorial meaning.
- Uses deterministic intelligence utilities under `src/lib/intelligence/` and follows `docs/INTELLIGENCE_DATA_CONTRACT.md`.

Read `AI_STUDIO_BRIEF.md`, `docs/FRONTEND_CONTRACT.md`, and `docs/INTELLIGENCE_DATA_CONTRACT.md`.

### Repository / engineering agent
- Maintains schemas, editorial documentation, source registry, validation, and publishing infrastructure.
- Preserves the separation between canonical content and generated output.
- Does not silently change the editorial contract or source eligibility.

## 4. Canonical file ownership

| Path | Owner | Rule |
|---|---|---|
| `content/editions/YYYY/MM/YYYY-MM-DD.md` | Muse | Canonical daily content |
| `content/templates/` | Repository owner / engineering agent | Controlled template |
| `config/source-registry.yml` | Repository owner | Approved source allowlist |
| `docs/` | Repository owner / engineering agent | Project rules and schemas |
| `scripts/` | Engineering agent | Build and validation tools |
| `.github/workflows/` | Engineering agent | Automation |
| `public/editions/` | GitHub Actions | Generated copies; never edit manually |
| `public/data/editions-index.json` | GitHub Actions | Generated index; never edit manually |
| `src/` | AI Studio / frontend agent | New frontend implementation |
| `legacy/` | Read-only reference | Historical implementation only |

## 5. Daily edition rules

- Exactly one canonical file per calendar date.
- Canonical path: `content/editions/YYYY/MM/YYYY-MM-DD.md`.
- Project date timezone: `America/Los_Angeles`.
- Morning, midday, and evening updates replace the same day's full cumulative edition.
- Never create three separate files for those refreshes.
- Never append duplicate copies of stories.
- Git commit history preserves intraday revisions.
- Old editions are preserved; corrections are disclosed rather than silently erased.
- Stable signal IDs persist across editions while the underlying story continues.

## 6. Editorial integrity

- No invented events, quotes, data, links, publication timestamps, or attributions.
- Never claim a source was opened if only a search snippet was available.
- Use approved newsrooms in `config/source-registry.yml` for core journalism.
- Primary sources and research artifacts are evidence classes, not independent newsrooms.
- Syndicated copies of one report count as one reporting origin.
- Every material factual claim must reference source IDs in the same signal's source ledger.
- Importance and confidence are separate dimensions.
- Keep event occurrence separate from attribution, intent, casualty figures, causality, and interpretation.
- Clearly label official/company claims, disputed facts, uncertainty, analysis, and conditional scenarios.
- No source is automatically correct merely because it is on the allowlist.

Read `docs/EDITORIAL_STANDARDS.md` and `docs/SOURCE_POLICY.md`.

## 7. Data contract

- Edition-level YAML frontmatter carries date, timezone, title, status, language, timestamps, and summary.
- Every signal is an H2 block with a stable ID.
- Each signal begins with one YAML metadata fence.
- The metadata contains signal identity, domain, importance, status, confidence, claims, and sources.
- The remaining signal content is ordinary Markdown narrative.
- Required top-level sections and field values are defined in `docs/CONTENT_SCHEMA.md`.
- Do not add UI-specific HTML, CSS, JavaScript, JSX, or arbitrary embedded markup to daily content.

## 8. Publishing contract

When a canonical edition changes on `main`, GitHub Actions:
1. Finds all canonical daily Markdown files.
2. Validates filename/date and required frontmatter/headings.
3. Mirrors Markdown into `public/editions/`.
4. Rebuilds `public/data/editions-index.json`.
5. Commits generated public files if they changed.

Do not manually edit generated public files. Do not create a parallel hand-maintained archive index.

## 9. Frontend contract

The frontend consumes:
- `/data/editions-index.json`
- The Markdown path supplied by the selected index entry.

It must provide four views:
1. Briefing
2. Expanded & Timelines
3. Synthesis & Personal
4. Audit & Methodology

All four views must be projections of the same parsed edition. Filters use structured metadata. Source counts derive from unique reporting-origin groups, not hard-coded numbers.

The new visual design is unrestricted by the legacy implementation. Rebuild the design and code from scratch.

## 10. Security and quality requirements

- Treat Markdown/YAML as untrusted input.
- Do not execute content code fences.
- Do not render arbitrary raw HTML.
- Restrict external links to HTTP/HTTPS.
- Keep parsing and validation separate from visual components.
- Malformed content must produce recoverable errors rather than a blank/crashed application.
- Load the small archive index first; fetch the selected edition on demand.
- Never place daily news content in frontend source files.

## 11. Required reading by task

| Task | Read |
|---|---|
| Daily news research and writing | `MUSE.md`, `docs/EDITORIAL_STANDARDS.md`, `docs/SOURCE_POLICY.md`, `docs/CONTENT_SCHEMA.md` |
| Changing Markdown structure | `docs/CONTENT_SCHEMA.md`, template, `MUSE.md` |
| Changing approved media | `config/source-registry.yml`, `docs/SOURCE_POLICY.md` |
| Building frontend | `AI_STUDIO_BRIEF.md`, `docs/FRONTEND_CONTRACT.md`, `docs/CONTENT_SCHEMA.md` |
| Changing archive publishing | `docs/ARCHITECTURE.md`, `docs/OPERATIONS.md`, publishing script, workflow |

## 12. Change discipline

Before making changes:
1. Inspect the current `main` tree and recent commits.
2. Read the relevant contract documents.
3. Identify the exact files owned by the task.
4. Avoid unrelated modifications.
5. Preserve history and stable content identifiers.
6. Verify the resulting tree and changed files.

Do not create a new architecture, source tier, data field, or publishing path casually. Update the corresponding documentation and templates together when the contract must change.

## 13. Current project phase

Current phase: **Active Markdown-first editorial archive and production React/TypeScript frontend (`src/`)**.

The static-first frontend is implemented under `src/` and maintained against `docs/FRONTEND_CONTRACT.md`, `docs/CONTENT_SCHEMA.md`, and `docs/SOURCE_POLICY.md`. Editorial content remains strictly decoupled under `content/editions/` and mirrored into `public/` via `scripts/build-public-content.mjs` and GitHub Actions. Never hard-code news editions into frontend code or manually edit generated files under `public/editions/` or `public/data/`.

The previous implementation lives at `legacy/v3-json-renderer/`. It is for historical feature reference only and is not a design constraint.
