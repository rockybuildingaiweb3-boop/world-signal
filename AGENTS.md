# Repository Agent Instructions

## Project boundary

WORLD SIGNAL is a Markdown-first editorial product. Keep content production, editorial policy, static publishing, and frontend presentation separate.

## Agent roles

- **Muse:** researches and writes canonical daily Markdown editions only.
- **AI Studio / frontend coding agent:** implements a new frontend from scratch and consumes the published Markdown contract.
- **GitHub Actions:** mirrors canonical Markdown into public assets and regenerates the edition index.

## Non-negotiable rules

1. Read this file and relevant documents under `docs/` before making changes.
2. Do not restore or extend the old single-file HTML application. It is frozen under `legacy/v3-json-renderer/`.
3. Do not put news content or daily edition data into frontend source code.
4. Do not let frontend components become the source of truth for facts, confidence, importance, or citations.
5. Never invent events, quotations, statistics, URLs, publication dates, or attributions.
6. Distinguish reported facts, official claims, analysis, and forecasts.
7. Never count syndicated copies as independent reporting.
8. Preserve stable signal IDs for ongoing stories.
9. Never manually edit generated files under `public/editions/` or `public/data/`.
10. Do not add a newsroom to the approved registry without editorial review.

## Change boundaries

- Muse may create or update only `content/editions/YYYY/MM/YYYY-MM-DD.md`.
- Canonical template: `content/templates/daily-edition.template.md`.
- Approved source registry: `config/source-registry.yml`.
- Publishing scripts and workflows are infrastructure, not Muse output.
- Frontend source will live under `src/`; it is deliberately not scaffolded yet.

## Frontend security

Render Markdown as Markdown. Do not execute code fences, allow arbitrary raw HTML, or inject untrusted source text using unsafe HTML. Allow only HTTP and HTTPS outbound links.
