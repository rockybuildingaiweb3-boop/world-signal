# Operations

## Daily cadence

The intended schedule is morning, midday, and evening. These are three revisions of one daily edition, not separate files.

## Date and timezone

The edition date is determined in America/Los_Angeles. All timestamps include an explicit offset or use UTC. Event date, article publication date, verification time, and edition update time are distinct fields.

## Daily procedure

1. Read the current day's edition, if it exists.
2. Review the previous edition for ongoing stories and corrections.
3. Research using the approved newsroom whitelist and relevant primary sources.
4. Verify claims, deduplicate syndication, and update source/claim ledgers.
5. Preserve stable IDs for ongoing signals.
6. Update the complete edition from the template.
7. Validate required sections, metadata, claims, and source references.
8. Commit the single Markdown file to the canonical path.

## Publishing automation

A push to main that changes a Markdown file under content/editions triggers the publishing workflow. It checks out the repository, runs scripts/build-public-content.mjs, copies canonical editions to public/editions, rebuilds public/data/editions-index.json, and commits generated assets if they changed.

Do not hand-edit generated public files. If publishing fails, fix the cause and rerun the workflow.

## Archive integrity

- Do not delete old editions as routine cleanup.
- Do not silently rewrite older editions.
- Record later corrections in the current edition's audit section.
- Git history preserves intraday revisions.
- Keep one canonical file per local date.

## Deployment note

The old renderer has been removed from the application root and archived under legacy/. The new frontend is not scaffolded yet. The repository is therefore in an architecture-only state until the frontend rebuild is implemented. Deploying this state to a public website may result in a missing homepage; coordinate the frontend cutover before treating the site as production-ready.
