# WORLD SIGNAL

**A daily global intelligence publication built around evidence, context, continuity, and traceable sources.**

WORLD SIGNAL covers three editorial domains:

1. **World Events** — consequential geopolitical, political, scientific, humanitarian, and societal developments.
2. **AI Frontier** — meaningful advances in AI research, models, infrastructure, capabilities, and deployment.
3. **Economic Outlook** — macroeconomic conditions, policy, markets, structural trends, and general-reader implications.

## Product principles

- Evidence before speed; accuracy before volume.
- Separate facts, claims, analysis, uncertainty, and forecasts.
- Prefer original reporting from approved, high-quality newsrooms.
- Distinguish primary documents from independent journalism.
- Count reporting origins, not syndicated copies.
- Keep one cumulative canonical Markdown edition per project-local date.
- Track ongoing stories through stable signal IDs.
- Compare editions deterministically; omission is not resolution.
- Keep editorial content separate from application code.
- Make the archive reproducible, auditable, and framework-independent.

## System architecture

~~~mermaid
flowchart TD
  A[Muse: research, verification, analysis] --> B[Canonical daily Markdown]
  B --> C[GitHub main and commit history]
  C --> D[GitHub Actions publication]
  D --> E[Public Markdown editions]
  D --> F[Generated edition index]
  E --> G[Static React frontend]
  F --> G
  G --> H[Content parser and validation]
  H --> I[Intelligence projection layer]
  I --> J[Edition diff]
  I --> K[Storyline index]
  I --> L[Evidence and relationship graph]
  J --> M[Briefing / Expanded / Synthesis / Audit]
  K --> M
  L --> M
~~~

### Responsibility boundaries

| Component | Responsibility |
|---|---|
| Muse | Research, verify, analyse, and write canonical daily Markdown only |
| GitHub | Source of truth, review, and historical revisions |
| GitHub Actions | Publish Markdown copies and generate the archive index |
| Frontend | Parse, compare, link, search, and display published content; never author editorial facts |
| Intelligence layer | Deterministic projections of Markdown editions; no second editorial database |

## Current frontend

The active application is implemented under `src/` using React 19, TypeScript, Vite, and Tailwind CSS 4.

Four primary views:

- **Briefing** — executive summary, lead developments, priority signals, approved editorial media, and domain overview.
- **Expanded & Timelines** — signal explorer, detailed narratives, verified media gallery, claims, sources, and timelines.
- **Synthesis & Personal** — cross-domain analysis, scenarios, personal implications, and watchlist.
- **Audit & Methodology** — source origins, evidence trace, confidence, validation, and editorial audit.

The deterministic intelligence layer under `src/lib/intelligence/` provides edition comparison, storyline indexing, cross-edition search, Reader Desk catch-up, and explicit relationship graphs. The Editorial Media Intelligence layer (`docs/MEDIA_ASSET_POLICY.md`, optional schema-v2 `media_assets`, publisher validation, `StoryVisual`, and `SignalMediaGallery`) supports rights-verified visual journalism while keeping media records strictly separate from textual source independence.

## Data and archive boundaries

Canonical location:

`content/editions/YYYY/MM/YYYY-MM-DD.md`

- Exactly one canonical edition per project-local date.
- Project timezone: **America/Los_Angeles**.
- Morning, midday, and evening runs update the same cumulative file.
- Git history preserves intraday revisions.
- The frontend reads `/data/editions-index.json` and the Markdown path supplied by each index entry.
- The browser does not need Muse, a model API, a database, or the GitHub API to render published content.
- Schema v1 remains readable. Schema v2 adds continuity, update, structured timeline, and typed relationship metadata.

## Repository structure

~~~text
world-signal/
├── README.md
├── agent.md / AGENTS.md
├── MUSE.md
├── AI_STUDIO_BRIEF.md
├── config/source-registry.yml
├── content/
│   ├── editions/YYYY/MM/YYYY-MM-DD.md
│   └── templates/daily-edition.template.md
├── docs/
│   ├── ARCHITECTURE.md
│   ├── CONTENT_SCHEMA.md
│   ├── INTELLIGENCE_DATA_CONTRACT.md
│   ├── EDITORIAL_STANDARDS.md
│   ├── SOURCE_POLICY.md
│   ├── MEDIA_ASSET_POLICY.md
│   ├── FRONTEND_CONTRACT.md
│   └── OPERATIONS.md
├── public/
│   ├── editions/                 # generated Markdown copies
│   └── data/editions-index.json  # generated archive index
├── scripts/build-public-content.mjs
├── .github/workflows/
│   ├── publish-editions.yml
│   └── quality.yml
├── src/
│   ├── app/
│   ├── components/
│   ├── features/
│   ├── hooks/
│   ├── lib/intelligence/
│   │   ├── edition-diff/
│   │   ├── storylines/
│   │   └── relationships/
│   ├── styles/
│   ├── test/
│   └── types/
└── legacy/v3-json-renderer/      # frozen historical implementation
~~~

## Development

The repository uses Bun and `bun.lock`.

~~~bash
bun install --frozen-lockfile
bun run dev
bun run typecheck
bun run lint
bun run test
bun run build
~~~

- `bun run build` — TypeScript project check plus Vite production bundle.
- `bun run build:content` — generate public Markdown copies and the edition index from canonical Markdown. Never edit generated files manually.

## Documents

| File | Purpose |
|---|---|
| [agent.md](agent.md) | Primary cross-agent operating contract |
| [MUSE.md](MUSE.md) | Daily editorial research and Markdown-production instructions |
| [AI_STUDIO_BRIEF.md](AI_STUDIO_BRIEF.md) | Active frontend implementation brief |
| [Architecture](docs/ARCHITECTURE.md) | System layers and data flow |
| [Content Schema](docs/CONTENT_SCHEMA.md) | Markdown/YAML data contract |
| [Intelligence Data Contract](docs/INTELLIGENCE_DATA_CONTRACT.md) | Schema-v2 continuity, updates, timeline and relationships |
| [Editorial Standards](docs/EDITORIAL_STANDARDS.md) | Story selection and analysis rules |
| [Source Policy](docs/SOURCE_POLICY.md) | Source quality and independence |
| [Media Asset Policy](docs/MEDIA_ASSET_POLICY.md) | Visual media rights verification, attribution, and integrity rules |
| [Frontend Contract](docs/FRONTEND_CONTRACT.md) | Static content and frontend behavior |
| [Operations](docs/OPERATIONS.md) | Daily updates and publication |

## Editorial integrity

A Tier 1 label is an internal eligibility classification, not a guarantee of accuracy or neutrality. Important claims should be corroborated by genuinely independent reporting origins. Syndicated copies do not count as independent sources. A missing signal in a later edition is not proof that an event has ended.