# WORLD SIGNAL

**A daily global intelligence briefing built around evidence, context, and traceable sources.**

WORLD SIGNAL tracks three domains:

1. **World Events** — consequential geopolitical, political, scientific, humanitarian, and societal developments.
2. **AI Frontier** — meaningful advances in AI research, models, infrastructure, capabilities, and deployment.
3. **Economic Outlook** — macroeconomic conditions, policy, markets, structural trends, and practical implications for individuals.

## Project principles

- Evidence before speed; accuracy before volume.
- Separate facts, claims, analysis, uncertainty, and forecasts.
- Prefer original reporting from an approved group of top-tier newsrooms.
- Distinguish primary documents from independent journalism.
- Count reporting origins, not syndicated copies.
- Keep one cumulative Markdown edition per calendar day.
- Keep editorial content completely separate from frontend code.
- Make the archive reproducible, auditable, and framework-independent.

## Architecture

~~~mermaid
flowchart TD
  A[Muse: research and verification] --> B[Canonical daily Markdown]
  B --> C[GitHub main: versioned archive]
  C --> D[GitHub Actions]
  D --> E[Public Markdown editions]
  D --> F[Generated edition index]
  E --> G[New frontend]
  F --> G
  G --> H[Briefing]
  G --> I[Expanded & Timelines]
  G --> J[Synthesis & Personal]
  G --> K[Audit & Methodology]
~~~

### Responsibility boundaries

| Component | Responsibility |
|---|---|
| Muse | Research, verify, analyse, and write Markdown only |
| GitHub | Canonical content, review, and historical revisions |
| GitHub Actions | Publish Markdown and generate the archive index |
| AI Studio | Build the completely new frontend |
| Frontend | Parse and display the content; never author or alter editorial facts |

## Repository structure

~~~text
world-signal/
├── README.md
├── agent.md
├── AGENTS.md
├── MUSE.md
├── AI_STUDIO_BRIEF.md
├── config/
│   └── source-registry.yml
├── content/
│   ├── README.md
│   ├── editions/
│   │   └── YYYY/MM/YYYY-MM-DD.md
│   └── templates/
│       └── daily-edition.template.md
├── docs/
│   ├── ARCHITECTURE.md
│   ├── EDITORIAL_STANDARDS.md
│   ├── SOURCE_POLICY.md
│   ├── CONTENT_SCHEMA.md
│   ├── FRONTEND_CONTRACT.md
│   └── OPERATIONS.md
├── public/
│   ├── editions/                 # generated Markdown copies
│   └── data/
│       └── editions-index.json   # generated archive index
├── scripts/
│   └── build-public-content.mjs
├── .github/
│   └── workflows/
│       └── publish-editions.yml
├── src/
│   └── README.md                # frontend implementation deferred
└── legacy/
    └── v3-json-renderer/        # frozen previous implementation
~~~

## Daily archive rules

Canonical location:

`content/editions/YYYY/MM/YYYY-MM-DD.md`

- Exactly one canonical edition per project-local date.
- Project timezone: **America/Los_Angeles**.
- Morning, midday, and evening runs update the same complete file.
- Muse replaces the current day's full cumulative edition; it does not append duplicates.
- Git history preserves each intraday revision.
- New dates create new files; historical editions are retained.
- Stable signal IDs connect ongoing developments across dates.

## Trusted-source policy

The initial approved newsroom registry is in `config/source-registry.yml`. It distinguishes global wire services, international newsrooms, specialist publications, and primary-source institutions.

A Tier 1 label is an internal eligibility classification, not a guarantee of accuracy or neutrality. Important claims should be corroborated by genuinely independent reporting origins. A syndicated copy does not count as a second source.

## Documents

| File | Purpose |
|---|---|
| [agent.md](agent.md) | Primary operating manual for all AI agents |
| [AGENTS.md](AGENTS.md) | Compatibility entry point |
| [MUSE.md](MUSE.md) | Strict daily research and Markdown-production instructions |
| [AI_STUDIO_BRIEF.md](AI_STUDIO_BRIEF.md) | Frontend rebuild brief for AI Studio |
| [Architecture](docs/ARCHITECTURE.md) | System layers and data flow |
| [Content Schema](docs/CONTENT_SCHEMA.md) | Markdown/YAML data contract |
| [Editorial Standards](docs/EDITORIAL_STANDARDS.md) | Story selection and analysis rules |
| [Source Policy](docs/SOURCE_POLICY.md) | Source quality and independence |
| [Frontend Contract](docs/FRONTEND_CONTRACT.md) | Static data interface for the future UI |
| [Operations](docs/OPERATIONS.md) | Daily updates and publishing process |

## Current phase

**Architecture and content protocol first. Frontend implementation later.**

The active frontend has deliberately been removed from the repository root and preserved under `legacy/v3-json-renderer/`. The new frontend will be designed and implemented from scratch in a separate phase. No sample or fabricated news edition is included.
