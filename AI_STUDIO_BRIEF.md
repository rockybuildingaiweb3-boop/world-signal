# AI Studio Build Brief — WORLD SIGNAL

Use this brief when the owner starts the new frontend phase.

## Read first

Before coding, read:
1. `README.md`
2. `AGENTS.md`
3. `docs/ARCHITECTURE.md`
4. `docs/CONTENT_SCHEMA.md`
5. `docs/FRONTEND_CONTRACT.md`
6. `docs/SOURCE_POLICY.md`
7. `src/README.md`
8. `content/templates/daily-edition.template.md`

The previous implementation is archived under `legacy/v3-json-renderer/`. You may inspect it only to understand historical product capabilities and editorial fields. **Do not reuse its visual design, layout, CSS, HTML, or single-file implementation.**

## Build scope

Create a completely new frontend experience and codebase. The architecture phase intentionally contains no UI implementation yet.

Read static published content from:
- `/data/editions-index.json`
- The Markdown path supplied by each index entry, normally `/editions/YYYY/MM/YYYY-MM-DD.md`

Do not enumerate GitHub directories or call the GitHub API at runtime. Do not depend on Muse, a model API, or a backend to render a published edition.

## Four first-class views

1. **Briefing** — executive summary and highest-priority signals across World Events, AI Frontier, and Economic Outlook.
2. **Expanded & Timelines** — full signal details, chronology, claim evidence, and ongoing-event history.
3. **Synthesis & Personal** — cross-domain connections, economic interpretation, scenarios, personal implications, and watchpoints.
4. **Audit & Methodology** — source records, independence groups, confidence rationale, unresolved claims, corrections, and editorial methodology.

All views must be projections of the same selected Markdown edition. Do not duplicate news into hard-coded datasets.

## Capabilities

- Edition archive navigation by date
- Search and filters by domain, importance, confidence, status, tags, and source class
- Signal detail expansion and timeline rendering
- Related-signal navigation
- Distinction between facts, claims, analysis, and forecasts
- Source links and source-independence transparency
- Loading, empty, invalid-content, and network-error states
- Responsive layouts and keyboard-accessible controls

## Visual direction

Design the visual system from first principles. Do not copy the legacy newspaper/card layout or its styling. Build a distinctive editorial intelligence product with strong hierarchy, typography, density control, navigation, and restrained motion.

## Engineering requirements

- Keep frontend code under `src/`.
- Keep daily content outside source code.
- Use a maintained Markdown parser and safe YAML parser.
- Treat Markdown and YAML as untrusted content. Never execute code fences or inject arbitrary HTML.
- Validate schema fields before rendering and fail gracefully.
- Allow only HTTP and HTTPS external links.
- Load the small edition index first and fetch the selected edition on demand.
- Keep parsing independent from visual components and test it separately.
- Never hard-code dates, headlines, item counts, or source counts.

## Do not

- Create sample news or fabricate an initial edition.
- Rewrite editorial content during frontend implementation.
- Move canonical Markdown files.
- Manually edit generated files under `public/`.
- Add a backend or database without the owner's explicit approval.
- Begin implementation until the owner starts the frontend phase.
