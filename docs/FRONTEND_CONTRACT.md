# Frontend Contract

## Ownership

The frontend is a new application built later with AI Studio. It owns presentation and interaction only. Markdown is the editorial source of truth; the frontend must not rewrite claims, invent source counts, or hard-code headlines.

## Static endpoints

Read:
- `/data/editions-index.json`
- The Markdown path supplied by an index entry, normally `/editions/YYYY/MM/YYYY-MM-DD.md`

The index supplies the exact Markdown path. Do not enumerate GitHub directories or call the GitHub API at runtime.

## Archive index shape

~~~json
{
  "schema_version": 1,
  "latest_edition": "YYYY-MM-DD",
  "generated_at": "YYYY-MM-DDTHH:mm:ss.sssZ",
  "editions": [
    {
      "date": "YYYY-MM-DD",
      "title": "WORLD SIGNAL — Daily Intelligence Briefing",
      "path": "/editions/YYYY/MM/YYYY-MM-DD.md",
      "updated_at": "YYYY-MM-DDTHH:mm:ss-08:00",
      "status": "published",
      "language": "zh-CN",
      "summary": "One-sentence edition summary."
    }
  ]
}
~~~

This is generated archive metadata, not a Muse-authored news format.

## Four views

### Briefing
Edition date/update, executive summary, top signals, overview of all three domains, importance and confidence.

### Expanded & Timelines
Full narrative, verified facts, chronological development, claim-level evidence, related signals, and ongoing story context.

### Synthesis & Personal
Cross-domain connections, economic outlook by time horizon, scenarios, practical personal implications, and watchpoints.

### Audit & Methodology
Source records and classes, registry tier, independence groups, calculated independent reporting origins, claim evidence, uncertainties, corrections, and methodology.

## Filters

Support domain, importance (1–5), confidence, signal status, topic/tags, source class, and edition date. Do not confuse event dates with publication dates.

## Parsing and validation

Use maintained Markdown and YAML parsers. Keep parsing/data validation separate from visual components. Validate edition frontmatter, required sections, signal IDs/domains, importance/confidence, claim/source references, source URLs/classes, and independence groups. Malformed content must show a recoverable error.

## Security

Treat Markdown and YAML as untrusted. Do not execute code fences or permit arbitrary raw HTML. Only allow HTTP/HTTPS external links. Do not use unsafe HTML injection. Preserve source URLs exactly.

## Performance

Load the small archive index first, then fetch only the selected Markdown edition. Cache parsed editions by path and handle missing editions gracefully.

## Design freedom

Rebuild the visual system, page composition, typography, responsive behavior, motion, and interactions from scratch. The legacy implementation is not a design constraint. Fixed requirements are the four views, content contract, static endpoints, evidence transparency, and accessibility.
