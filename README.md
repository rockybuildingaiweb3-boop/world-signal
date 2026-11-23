# WORLD SIGNAL

**A daily global intelligence briefing built around evidence, context, and traceable sources.**

Three editorial domains:
1. **World Events** — consequential geopolitical, political, scientific, humanitarian, and societal developments.
2. **AI Frontier** — verified advances in AI research, models, infrastructure, capabilities, and deployment.
3. **Economic Outlook** — macroeconomic conditions, policy, markets, structural trends, and practical implications for individuals.

## Responsibility boundaries

- **Muse** researches, verifies, analyses, and writes one structured Markdown edition per calendar day.
- **GitHub** stores the canonical Markdown archive and its version history.
- **GitHub Actions** publishes Markdown files as static assets and builds a small edition index.
- **AI Studio** builds the entirely new frontend. The frontend owns visual design, navigation, filtering, timelines, and interactions.

The old HTML/JSON renderer is preserved under `legacy/v3-json-renderer/` for reference only. It is not the new design system or content contract.

## Content pipeline

~~~mermaid
flowchart TD
  A[Muse research and verification] --> B[One daily Markdown edition]
  B --> C[content/editions/YYYY/MM/YYYY-MM-DD.md]
  C --> D[GitHub Actions]
  D --> E[Publish Markdown to public/editions]
  D --> F[Generate public/data/editions-index.json]
  E --> G[New frontend built with AI Studio]
  F --> G
  G --> H[Briefing · Expanded & Timelines]
  G --> I[Synthesis & Personal]
  G --> J[Audit & Methodology]
~~~

## Repository structure

~~~text
world-signal/
├── README.md
├── AGENTS.md
├── MUSE.md
├── AI_STUDIO_BRIEF.md
├── config/source-registry.yml
├── content/
│   ├── README.md
│   ├── editions/YYYY/MM/YYYY-MM-DD.md
│   └── templates/daily-edition.template.md
├── docs/
│   ├── ARCHITECTURE.md
│   ├── EDITORIAL_STANDARDS.md
│   ├── SOURCE_POLICY.md
│   ├── CONTENT_SCHEMA.md
│   ├── FRONTEND_CONTRACT.md
│   └── OPERATIONS.md
├── public/
│   ├── editions/                 # generated static Markdown copies
│   └── data/editions-index.json  # generated archive index
├── scripts/build-public-content.mjs
├── .github/workflows/publish-editions.yml
├── src/README.md                 # frontend implementation deferred
└── legacy/v3-json-renderer/      # frozen previous implementation
~~~

## Daily edition rule

There is one canonical file per date, not separate morning, noon, and evening files.

- Morning, midday, and evening runs update the same day's complete edition.
- Muse replaces the full file with the latest cumulative version; it does not append duplicate fragments.
- Git history preserves each update.
- A new local calendar day creates a new file.
- The canonical timezone is **America/Los_Angeles**. Every timestamp must include an explicit UTC offset or use UTC.

Canonical path: `content/editions/YYYY/MM/YYYY-MM-DD.md`

## Evidence and source quality

The core newsroom whitelist is maintained in `config/source-registry.yml`. Tier 1 is an internal editorial eligibility rule, not a claim that an outlet is infallible or free from bias.

Primary documents, research papers, company announcements, and official datasets are useful evidence, but are classified separately from independent newsrooms. Syndicated copies of the same wire report count as one reporting origin.

Read `MUSE.md` before producing an edition. Read `docs/CONTENT_SCHEMA.md` before changing the Markdown template. Read `AI_STUDIO_BRIEF.md` and `docs/FRONTEND_CONTRACT.md` before implementing the frontend.

## Current status

This branch establishes the Markdown-first architecture and publishing contract. It intentionally does **not** implement the new frontend. The next frontend implementation must be a complete visual and code rebuild.
