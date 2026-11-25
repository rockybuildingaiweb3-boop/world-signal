/**
 * SYNTHETIC TEST FIXTURES ONLY — strictly for automated Daily Delta tests under src/test/.
 * Never imported by production application code or published archive data.
 */

import type { EditionIndexEntry } from '../../types/edition';

export const SYNTHETIC_ARCHIVE_ENTRIES: EditionIndexEntry[] = [
  {
    date: '2026-10-05',
    title: 'WORLD SIGNAL — Synthetic Latest Edition',
    path: '/editions/2026/10/2026-10-05.md',
    updated_at: '2026-10-05T18:00:00-07:00',
    status: 'published',
    language: 'en',
    summary: 'Latest synthetic edition across a 3-day gap.',
  },
  {
    date: '2026-10-01',
    title: 'WORLD SIGNAL — Synthetic Earliest Edition',
    path: '/editions/2026/10/2026-10-01.md',
    updated_at: '2026-10-01T14:00:00-07:00',
    status: 'published',
    language: 'en',
    summary: 'Earliest synthetic edition.',
  },
  {
    date: '2026-10-02',
    title: 'WORLD SIGNAL — Synthetic Middle Edition',
    path: '/editions/2026/10/2026-10-02.md',
    updated_at: '2026-10-02T14:00:00-07:00',
    status: 'published',
    language: 'en',
    summary: 'Middle synthetic edition.',
  },
];

/**
 * Follow-up synthetic edition dated 2026-10-05 relative to VALID_SYNTHETIC_EDITION (2026-10-01):
 * - WORLD-20261001-port-treaty: UPDATED (status, confidence, added/revised/withdrawn claims, added source)
 * - AI-20261001-eval-standard: UNCHANGED (only routine sync & source accessed_at timestamps modified)
 * - ECON-20261001-freight-rates: OMITTED (present in 2026-10-01, absent here — NOT resolved)
 * - AI-20261005-compute-compact: NEW (first seen in 2026-10-05)
 */
export const SYNTHETIC_FOLLOWUP_EDITION = `---
schema_version: 2
edition_date: "2026-10-05"
edition_timezone: "America/Los_Angeles"
edition_title: "WORLD SIGNAL — Synthetic Follow-up Edition"
edition_status: "published"
content_language: "en"
generated_at: "2026-10-05T07:00:00-07:00"
updated_at: "2026-10-05T18:00:00-07:00"
sync_run: "evening"
coverage_window_start: "2026-10-05T00:00:00-07:00"
coverage_window_end: "2026-10-05T18:00:00-07:00"
summary: "Synthetic follow-up edition testing new, updated, unchanged, and omitted classification."
---

# Executive Briefing

> **Edition summary:** Follow-up synthetic edition across a multi-day gap.

> **Limitations:** Synthetic fixture scope caveat.

### Top Signals

- **[WORLD-20261001-port-treaty]** — Ratification dispute emerged in two member legislatures.
- **[AI-20261005-compute-compact]** — Regional grid operators adopt disclosure rule for hyperscale clusters.

# World Events

> World domain intro note.

## WORLD-20261001-port-treaty — Maritime Corridor Agreement Faces Ratification Dispute

\`\`\`yaml
signal_id: "WORLD-20261001-port-treaty"
domain: "world"
topic: "trade"
importance: 5
status: "disputed"
confidence:
  overall: "medium"
  rationale: "Dispute over implementation schedule reported by two independent outlets."
event:
  start_date: "2026-10-01"
  end_date: "2026-10-05"
  geography: ["Global", "Mediterranean"]
published_at: "2026-10-05T08:00:00-07:00"
first_verified_at: "2026-10-01T08:30:00-07:00"
updated_at: "2026-10-05T17:30:00-07:00"
tags: ["shipping", "treaty"]
related_signal_ids: ["ECON-20261001-freight-rates"]
continuity:
  first_seen_edition: "2026-10-01"
  last_material_update: "2026-10-05"
  history_complete: true
  lifecycle: "developing"
update:
  change_type: "material_update"
  summary: "Two parliaments requested tariff annex amendments; ratification timeline paused."
  previous_edition: "2026-10-01"
  evidence_changes:
    added_claim_ids: ["WORLD-20261001-port-treaty-C02"]
    revised_claim_ids: ["WORLD-20261001-port-treaty-C01"]
    withdrawn_claim_ids: []
    added_source_urls: ["https://www.bloomberg.com/news/corridor-dispute-test"]
    removed_source_urls: []
timeline_events:
  - event_id: "WORLD-20261001-port-treaty-E01"
    occurred_at: "2026-10-05"
    title: "Parliamentary annex objection filed"
    summary: "Two signatory parliaments formally requested tariff annex revisions."
    claim_ids: ["WORLD-20261001-port-treaty-C02"]
    source_ids: ["S4"]
relationships: []
claims:
  - claim_id: "WORLD-20261001-port-treaty-C01"
    statement: "Eight nations signed the corridor protocol, now subject to annex review."
    status: "confirmed"
    confidence: "high"
    source_ids: ["S1", "S3"]
  - claim_id: "WORLD-20261001-port-treaty-C02"
    statement: "Two parliaments paused ratification votes pending tariff annex changes."
    status: "reported"
    confidence: "medium"
    source_ids: ["S4"]
sources:
  - source_id: "S1"
    outlet: "Reuters"
    title: "Eight nations sign maritime corridor protocol"
    url: "https://www.reuters.com/world/corridor-test"
    published_at: "2026-10-01T07:30:00Z"
    accessed_at: "2026-10-05T16:00:00Z"
    source_class: "tier_1_newsroom"
    registry_id: "reuters"
    independence_group: "reuters"
    relationship: "original_reporting"
    count_as_independent: true
    supports_claim_ids: ["WORLD-20261001-port-treaty-C01"]
  - source_id: "S3"
    outlet: "Associated Press"
    title: "Maritime corridor protocol original report"
    url: "https://apnews.com/original-corridor-test"
    published_at: "2026-10-01T07:45:00Z"
    accessed_at: "2026-10-05T16:00:00Z"
    source_class: "tier_1_newsroom"
    registry_id: "ap"
    independence_group: "associated_press"
    relationship: "original_reporting"
    count_as_independent: true
    supports_claim_ids: ["WORLD-20261001-port-treaty-C01"]
  - source_id: "S4"
    outlet: "Bloomberg"
    title: "Two parliaments seek maritime annex revision"
    url: "https://www.bloomberg.com/news/corridor-dispute-test"
    published_at: "2026-10-05T11:00:00Z"
    accessed_at: "2026-10-05T16:00:00Z"
    source_class: "tier_1_newsroom"
    registry_id: "bloomberg"
    independence_group: "bloomberg"
    relationship: "original_reporting"
    count_as_independent: true
    supports_claim_ids: ["WORLD-20261001-port-treaty-C02"]
\`\`\`

### What Happened

Two parliaments paused ratification votes to seek tariff annex amendments [S4].

### Verified Facts

- Eight nations signed the agreement [S1][S3].
- Annex objections filed on 2026-10-05 [S4].

### Timeline

- 2026-09-20 — Draft text circulated.
- 2026-10-01 — Final protocol signed.
- 2026-10-05 — Parliamentary annex objection filed.

### Why It Matters

Delays legal enforcement of maritime lane guarantees.

### Source Perspectives

Reuters and Bloomberg corroborated the legislative pause.

### Analysis

Extends uncertainty for maritime insurers.

### Uncertainties

- Duration of annex renegotiation remains unknown.

### Scenarios

- **Base case:** Targeted annex clarification resolves impasse.

### What to Watch

- Committee markup schedule.

# AI Frontier

> AI domain intro note.

## AI-20261001-eval-standard — Open Benchmark Consortium Releases Verification Suite

\`\`\`yaml
signal_id: "AI-20261001-eval-standard"
domain: "ai"
topic: "evaluation"
importance: 4
status: "new"
confidence:
  overall: "medium"
  rationale: "Primary consortium release corroborated by one specialist outlet."
event:
  start_date: "2026-10-01"
  geography: ["United States", "EU"]
published_at: "2026-10-01T09:00:00-07:00"
first_verified_at: "2026-10-01T09:30:00-07:00"
updated_at: "2026-10-05T17:45:00-07:00"
tags: ["benchmarks", "safety"]
related_signal_ids: []
continuity:
  first_seen_edition: "2026-10-01"
  last_material_update: "2026-10-01"
  history_complete: true
  lifecycle: "monitoring"
update:
  change_type: "no_material_change"
  summary: "No new verified updates since 2026-10-01."
  previous_edition: "2026-10-01"
  evidence_changes:
    added_claim_ids: []
    revised_claim_ids: []
    withdrawn_claim_ids: []
    added_source_urls: []
    removed_source_urls: []
timeline_events: []
relationships: []
claims:
  - claim_id: "AI-20261001-eval-standard-C01"
    statement: "Suite covers 12 reproducible test categories."
    status: "official_claim"
    confidence: "medium"
    source_ids: ["S1"]
sources:
  - source_id: "S1"
    outlet: "Consortium Release"
    title: "Verification Suite v1"
    url: "https://example.org/suite-v1"
    published_at: "2026-10-01T09:00:00Z"
    accessed_at: "2026-10-05T17:00:00Z"
    source_class: "primary_source"
    registry_id: null
    independence_group: "consortium"
    relationship: "official_statement"
    count_as_independent: false
    supports_claim_ids: ["AI-20261001-eval-standard-C01"]
\`\`\`

### What Happened

Consortium published its open suite.

### Verified Facts

- 12 categories listed [S1].

### Timeline

- 2026-10-01 — Suite v1 released.

### Why It Matters

Standardizes model evaluation.

### Source Perspectives

Only primary documentation reviewed so far.

### Analysis

Adoption depends on independent lab participation.

### Uncertainties

- Independent replications not yet available.

### Scenarios

- **Base case:** Major labs adopt subset of tasks.

### What to Watch

- Third-party leaderboard runs.

## AI-20261005-compute-compact — Regional Grid Operators Mandate Hyperscale Power Disclosure

\`\`\`yaml
signal_id: "AI-20261005-compute-compact"
domain: "ai"
topic: "infrastructure"
importance: 4
status: "new"
confidence:
  overall: "medium"
  rationale: "Confirmed by regulatory filing and one independent newsroom."
event:
  start_date: "2026-10-05"
  geography: ["United States"]
published_at: "2026-10-05T10:00:00-07:00"
first_verified_at: "2026-10-05T10:30:00-07:00"
updated_at: "2026-10-05T16:00:00-07:00"
tags: ["compute", "energy"]
related_signal_ids: []
continuity:
  first_seen_edition: "2026-10-05"
  last_material_update: "2026-10-05"
  history_complete: true
  lifecycle: "new"
update:
  change_type: "initial"
  summary: "New rule requiring quarterly interconnection load disclosures."
  evidence_changes:
    added_claim_ids: ["AI-20261005-compute-compact-C01"]
    revised_claim_ids: []
    withdrawn_claim_ids: []
    added_source_urls: ["https://www.reuters.com/technology/grid-disclosure-test"]
    removed_source_urls: []
timeline_events: []
relationships: []
claims:
  - claim_id: "AI-20261005-compute-compact-C01"
    statement: "Operators must disclose peak demand forecasts for clusters above 100 MW."
    status: "confirmed"
    confidence: "medium"
    source_ids: ["S1"]
sources:
  - source_id: "S1"
    outlet: "Reuters"
    title: "Grid operators set AI cluster disclosure rule"
    url: "https://www.reuters.com/technology/grid-disclosure-test"
    published_at: "2026-10-05T09:45:00Z"
    accessed_at: "2026-10-05T15:00:00Z"
    source_class: "tier_1_newsroom"
    registry_id: "reuters"
    independence_group: "reuters"
    relationship: "original_reporting"
    count_as_independent: true
    supports_claim_ids: ["AI-20261005-compute-compact-C01"]
\`\`\`

### What Happened

Regional grid operators adopted quarterly load disclosure standards [S1].

### Verified Facts

- Threshold set at 100 MW [S1].

### Timeline

- 2026-10-05 — Disclosure rule adopted.

### Why It Matters

Increases transparency around AI data-center power bottlenecks.

### Source Perspectives

Reuters cited regional grid officials.

### Analysis

Improves regional capacity planning visibility.

### Uncertainties

- Enforcement timelines differ across jurisdictions.

### Scenarios

- **Base case:** Phased reporting begins next quarter.

### What to Watch

- First quarterly compliance filings.

# Economic Outlook

> No qualifying updates recorded in this synthetic follow-up edition.

# Cross-Domain Synthesis

No cross-domain threads recorded.

# Personal Implications

> General decision support only, not personalized financial advice.

# Watchlist

| Indicator or event | Why it matters | Next checkpoint | Signals linked |
|---|---|---|---|
| Grid compliance filing | Measures AI power demand | 2026-12-01 | AI-20261005-compute-compact |

# Audit & Methodology

## Source audit

Synthetic audit note.

## Open questions

- None.

## Corrections

- None.

## Methodology notes

- Schema v2 synthetic fixture.
`;
