# Architecture

## Objective

WORLD SIGNAL is a static-first global intelligence publication. Its canonical editorial record is Markdown. The website is a reader and analysis interface over that record, not the place where news facts are authored.

| Layer | Owner | Responsibility |
|---|---|---|
| Research and editorial production | Muse | Discover, corroborate, analyse, and write daily Markdown |
| Canonical content and history | GitHub | Version and preserve Markdown editions |
| Static publishing | GitHub Actions | Mirror Markdown into public assets and build the archive index |
| Presentation | AI Studio frontend | Parse, filter, navigate, and render editions |

## Data flow

~~~mermaid
flowchart LR
  M[Muse] --> C[Canonical Markdown]
  C --> G[GitHub]
  G --> W[GitHub Actions]
  W --> P[public/editions]
  W --> I[public/data/editions-index.json]
  P --> F[Frontend]
  I --> F
  F --> U[Four reader views]
~~~

The browser uses same-origin static requests. It does not enumerate GitHub directories, scrape news sites, or call a model to interpret an edition.

## Canonical archive

Canonical files live under `content/editions/YYYY/MM/YYYY-MM-DD.md`. There is one file per local calendar date. Morning, midday, and evening runs replace that day's complete cumulative edition. Git history preserves intermediate versions. A new date creates a new file.

The project timezone is America/Los_Angeles. Timestamps still require an explicit offset or UTC.

## Static publishing

The publishing script mirrors canonical editions to:
- `public/editions/YYYY/MM/YYYY-MM-DD.md`
- `public/data/editions-index.json`

The mirror is generated output. The index contains archive metadata and paths, not the full story content. The frontend loads the index and fetches only the selected Markdown edition.

This keeps Muse's task small and avoids GitHub API rate limits in the browser.

## Content model

An edition contains edition-level YAML frontmatter, an executive briefing, three domain sections, cross-domain synthesis, personal implications, a watchlist, and audit notes.

Each signal is an H2 section with a stable ID, one YAML metadata fence, claim records, source records, and human-readable Markdown narrative. The metadata carries machine-readable evidence; the narrative carries explanation.

## Frontend projections

The four views are projections of the same selected edition: Briefing, Expanded & Timelines, Synthesis & Personal, and Audit & Methodology. No view owns a copied dataset.

## Why Markdown-first

Markdown is human-readable, reviewable in GitHub, small relative to monolithic HTML, easy for Muse to produce, suitable for a daily archive, and portable across frontend frameworks. YAML frontmatter and per-signal YAML fences provide deterministic fields for parsing.

## Non-goals

This phase does not include a live news crawler, CMS, database, user accounts, model calls at runtime, financial trading advice, or a new UI implementation.
