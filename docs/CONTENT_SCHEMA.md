# Daily Edition Content Schema

This is the contract between Muse, GitHub publishing, and the future frontend.

## File path

Canonical file: `content/editions/YYYY/MM/YYYY-MM-DD.md`

Use UTF-8, one file per local calendar date, YAML frontmatter, Markdown narrative, and one YAML metadata fence immediately after each signal H2. Do not include raw HTML, scripts, JSX, or UI-specific markup.

## Edition frontmatter

~~~yaml
---
schema_version: 1
edition_date: "YYYY-MM-DD"
edition_timezone: "America/Los_Angeles"
edition_title: "WORLD SIGNAL — Daily Intelligence Briefing"
edition_status: "draft"
content_language: "zh-CN"
generated_at: "YYYY-MM-DDTHH:mm:ss-08:00"
updated_at: "YYYY-MM-DDTHH:mm:ss-08:00"
sync_run: "morning"
coverage_window_start: "YYYY-MM-DDTHH:mm:ss-08:00"
coverage_window_end: "YYYY-MM-DDTHH:mm:ss-08:00"
summary: "A concise, factual summary of this edition."
~~~

Statuses: draft, reviewed, published. Sync runs: morning, midday, evening, manual. The filename date must match edition_date and the project timezone. Timestamps must include offsets or use UTC.

## Required top-level headings

Use these exact headings:
1. `# Executive Briefing`
2. `# World Events`
3. `# AI Frontier`
4. `# Economic Outlook`
5. `# Cross-Domain Synthesis`
6. `# Personal Implications`
7. `# Watchlist`
8. `# Audit & Methodology`

If a domain has no qualifying development, state that explicitly. Do not remove a section.

## Signal structure

Each signal is an H2 block beneath its domain section. The heading begins with a stable ID, e.g. `## WORLD-YYYYMMDD-short-slug — Headline`. Use equivalent `AI-` and `ECON-` prefixes.

Immediately after the heading, include one YAML fence:

~~~yaml
signal_id: "WORLD-YYYYMMDD-short-slug"
domain: "world"
topic: "geopolitics"
importance: 4
status: "developing"
confidence:
  overall: "medium"
  rationale: "Occurrence is corroborated; attribution remains disputed."
event:
  start_date: "YYYY-MM-DD"
  end_date: "YYYY-MM-DD"
  geography:
    - "Country or region"
published_at: "YYYY-MM-DDTHH:mm:ssZ"
first_verified_at: "YYYY-MM-DDTHH:mm:ssZ"
updated_at: "YYYY-MM-DDTHH:mm:ssZ"
tags:
  - "tag-one"
related_signal_ids: []
claims:
  - claim_id: "WORLD-YYYYMMDD-short-slug-C01"
    statement: "A single, testable factual claim."
    status: "confirmed"
    confidence: "high"
    source_ids:
      - "S1"
sources:
  - source_id: "S1"
    outlet: "Reuters"
    title: "Exact source headline or document title"
    url: "https://example.com/canonical-article"
    published_at: "YYYY-MM-DDTHH:mm:ssZ"
    accessed_at: "YYYY-MM-DDTHH:mm:ssZ"
    source_class: "tier_1_newsroom"
    registry_id: "reuters"
    independence_group: "reuters"
    relationship: "original_reporting"
    count_as_independent: true
    supports_claim_ids:
      - "WORLD-YYYYMMDD-short-slug-C01"
~~~

The example URL is a placeholder. Never copy placeholder values into a real edition.

### Field rules

- signal_id is permanent for the underlying story; reuse it while the story continues.
- domain is world, ai, or economy.
- importance is an integer 1–5.
- status is new, developing, ongoing, confirmed, disputed, unverified, closed, or corrected.
- confidence.overall is high, medium, low, or unverified, with a rationale.
- event dates are not article publication dates.
- claims are individual factual statements with status, confidence, and source references.
- sources are source-ledger records.

## Additive signal metadata v2

Schema v1 remains supported for historical editions. New editions and every subsequent update to a schema-v2 daily file must use schema v2. Once a canonical daily edition has moved to v2, later same-day revisions—including overnight runs—must never downgrade it to v1.

Every signal in a schema-v2 edition requires all four blocks:

- `continuity` — first-seen date, last material update, `history_complete`, and lifecycle.
- `update` — change type, concise summary, previous edition, and all five evidence-change arrays.
- `timeline_events` — a structured array; it may be empty when no event can be supported.
- `relationships` — a structured array; it may be empty when no relationship is established.

Continuity dates may be explicit YAML `null` when the historical lookback is incomplete. Set `history_complete: true` only after checking every available canonical edition for the signal ID. Never fabricate dates.

The exact field definitions, allowed values, and migration rules are in [Intelligence Data Contract](INTELLIGENCE_DATA_CONTRACT.md). The publishing script validates every v2 signal and rejects same-day schema downgrades. Historical v1 editions remain unchanged unless a deliberate, evidence-supported migration is performed.

### Optional visual media metadata (`media_assets`)

Schema v2 supports an **optional, backward-compatible** `media_assets` array on each signal. Do **not** bump `schema_version` to 3 for this extension:

- Historical `schema_version: 1` editions without `media_assets` remain valid.
- Existing `schema_version: 2` editions without `media_assets` remain valid.
- Missing `media_assets` parses as `[]`; newly authored signals in updated templates include `media_assets: []` when no approved image exists.
- `media_assets` is a **separate visual-media ledger**, not a replacement for `sources` or `claims`, and never affects independent-origin counting or confidence.

Canonical record structure (schema illustration only — never copy placeholder URLs into real editions):

~~~yaml
media_assets:
  - media_id: "WORLD-YYYYMMDD-example-M01"
    media_type: "photograph"
    placement: "hero"
    relationship_to_signal: "direct_event_documentation"
    asset_url: "https://example.org/media/original-image.jpg"
    source_page_url: "https://example.org/media/image-record"
    title: "Exact media title"
    caption: "A concise factual description."
    alt_text: "A concise description of visible contents."
    creator: "Creator or photographer"
    credit_line: "Photo: Creator / Organization, CC BY 4.0"
    depicted_at: "YYYY-MM-DD"
    depicted_location: "Verified location"
    rights:
      basis: "cc_by"
      license_name: "CC BY 4.0"
      license_url: "https://creativecommons.org/licenses/by/4.0/"
      rights_holder: "Verified rights holder"
      verified_at: "YYYY-MM-DDTHH:mm:ssZ"
      public_web_display_allowed: true
      crop_allowed: true
    verification:
      source_page_checked: true
      direct_asset_checked: true
      visual_content_checked: true
      caption_context_checked: true
~~~

Field rules and validation expectations (see also [Media Asset Policy](MEDIA_ASSET_POLICY.md)):

- `media_id`: stable identifier unique within the signal (e.g., `SIGNAL_ID-M01`). Duplicate IDs fail validation.
- `media_type`: one of `photograph`, `illustration`, `chart`, `map`, `diagram`, `document_scan`, `screenshot`.
- `placement`: `hero` or `supporting`.
- `relationship_to_signal`: `direct_event_documentation`, `contextual`, `illustrative`, or `data_visualization`.
- `asset_url` and `source_page_url`: direct, valid `https://` URLs. Never use search thumbnails, `http://`, `javascript:`, `data:`, or expiring authenticated URLs.
- `caption`, `alt_text`, `creator`, and `credit_line`: plain text, non-empty. Never embed HTML or put license legalese inside `alt_text`.
- `depicted_at` and `depicted_location`: optional; include only when documented by the source media record.
- `rights.basis`: one of `public_domain`, `cc0`, `cc_by`, `cc_by_sa`, `explicit_permission`, `editorial_license`.
- `rights.license_url`: valid `https://` URL to the license deed or official public-domain/rights-policy record (required for all rights bases).
- `rights.public_web_display_allowed`: must be `true` for publishable displayable assets.
- `rights.crop_allowed`: explicit boolean (`false` instructs the frontend to render uncropped).
- `rights.verified_at`: valid ISO 8601 timestamp with UTC/offset.
- `verification`: all four flags (`source_page_checked`, `direct_asset_checked`, `visual_content_checked`, `caption_context_checked`) must be `true`.

Claim statuses: confirmed, reported, official_claim, disputed, unverified.

Source classes: tier_1_newsroom, specialist_publication, primary_source, research_paper.

Source relationships: original_reporting, syndicated, official_statement, company_announcement, research_artifact, secondary_analysis.

Only approved original reporting may normally set count_as_independent true. Primary documents, company announcements, research papers, and syndicated copies must be false. Mirrors of the same reporting origin share an independence_group.

## Required narrative subsections

After the metadata fence, use:
- `### What Happened`
- `### Verified Facts`
- `### Timeline`
- `### Why It Matters`
- `### Source Perspectives`
- `### Analysis`
- `### Uncertainties`
- `### Scenarios`
- `### What to Watch`

Economic signals also require `### Personal Relevance`. Do not leave headings blank; state when no material update or uncertainty is identified.

Narrative may cite source IDs such as [S1] and claim IDs. The frontend resolves them against metadata.

## Executive and synthesis sections

Executive Briefing selects three to five highest-priority signals and references stable IDs; it does not duplicate full stories.

Cross-Domain Synthesis connects signals across at least two domains only where evidence supports a real relationship.

Personal Implications gives general decision support around career/skills, household resilience, spending, borrowing, and uncertainty. It is not individualized financial advice.

## Audit section

Record source-access limitations, claims awaiting verification, corrections/retractions, disagreements between sources, methodological caveats, and source-registry candidates awaiting owner review.

## Parser contract

The frontend parses edition frontmatter, Markdown AST, the eight top-level sections, signal H2 boundaries, the first YAML fence in each signal block, and narrative subsections. It validates claim/source references and renders citations and ratings from structured fields. Do not rely on legacy HTML fragments or the old JSON schema.
