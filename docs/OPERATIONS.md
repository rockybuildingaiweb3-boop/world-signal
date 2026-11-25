# Operations

## Daily cadence and ownership

WORLD SIGNAL uses one cumulative canonical Markdown edition per project-local date. The intended research cadence is morning, midday, evening, and overnight. Each run updates the same file; Git history preserves intermediate revisions.

- Research and editorial writing: Muse.
- Canonical archive and revision history: GitHub `main`.
- Static publication: GitHub Actions.
- Presentation and deterministic longitudinal views: the active React / TypeScript frontend under `src/`.

The active frontend is implemented. Extend it; do not follow stale instructions that describe an architecture-only or pre-frontend state.

## Date and timezone

The edition date is determined in `America/Los_Angeles`. Timestamps use an explicit UTC offset or UTC. Event date, article publication date, verification time, and edition update time are distinct values.

## Mandatory schema version lock

Before editing an existing daily file, Muse must read its current `schema_version`.

- If the current canonical edition is schema v2, every later same-day sync—including overnight—must remain schema v2.
- An older saved prompt, cached template, or v1 instruction must never downgrade a v2 edition.
- Every retained signal must preserve `continuity`, `update`, `timeline_events`, and `relationships`.
- Preserve existing claims, sources, stable IDs, verified timeline events, and declared relationships unless a justified evidence change is recorded.
- Never reuse a claim ID for a materially different proposition.
- If a run cannot satisfy the v2 contract, it must stop before pushing the canonical file.

See `MUSE.md` and `INTELLIGENCE_DATA_CONTRACT.md` for the complete rules.

## Daily procedure

1. Fetch the latest `main` branch.
2. Read `MUSE.md`, `docs/CONTENT_SCHEMA.md`, `docs/INTELLIGENCE_DATA_CONTRACT.md`, `docs/SOURCE_POLICY.md`, and the current target edition.
3. Inspect the prior same-day revision and immediately preceding daily edition.
4. Research using the approved newsroom registry and relevant primary sources.
5. Match continuing stories by stable signal ID.
6. Preserve earlier verified claims, source provenance, timeline events, and signal relationships.
7. Update only facts, confidence, analysis, claims, sources, and metadata supported by new evidence.
8. Validate edition frontmatter, required sections, signal IDs, schema-v2 metadata, claims, and source references.
9. Commit only the current date's canonical Markdown file.

Do not rewrite previous dates merely to make them current. Record later corrections in the current edition's Audit & Methodology section and identify the original edition and affected signal.

## Publishing automation

A push to `main` that changes a Markdown file under `content/editions/` triggers `.github/workflows/publish-editions.yml`.

The workflow:

1. Checks out full Git history.
2. Runs `scripts/build-public-content.mjs`.
3. Validates edition frontmatter, required sections, and schema-v2 signal metadata.
4. Rejects a schema downgrade when a previous revision of the same daily file used schema v2.
5. Mirrors canonical Markdown into `public/editions/`.
6. Rebuilds `public/data/editions-index.json`.
7. Commits generated assets when they changed.

A failed validation prevents the generated public archive from being updated. Fix the canonical Markdown and rerun publication. Do not bypass a schema error by manually editing generated files.

## Archive integrity

- Do not delete old editions as routine cleanup.
- Do not silently rewrite historical editions.
- A missing signal in a later edition is an omission, not evidence of resolution.
- Record corrections, withdrawals, and unresolved evidence gaps.
- Keep exactly one canonical file per local date.
- Git history preserves intraday revisions.
- Never edit generated files under `public/` by hand.

## Status semantics

The edition frontmatter status is one of `draft`, `reviewed`, or `published`.

Successful GitHub Actions publication and a successful website deployment confirm that the file was built and deployed; they do not automatically change an editorial `draft` status to `published`. The editor/owner remains responsible for the review decision.

## Deployment

The application is the static React frontend under `src/`. A successful deployment check confirms the hosting provider completed deployment for the triggering commit. Verify the target site and edition status separately before describing an edition as editorially published.
