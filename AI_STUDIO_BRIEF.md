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