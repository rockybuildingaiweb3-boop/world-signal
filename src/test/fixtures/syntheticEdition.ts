/**
 * SYNTHETIC TEST FIXTURES ONLY — strictly for automated unit tests under src/test/.
 * Never imported by production application code or published archive data.
 */

export const VALID_SYNTHETIC_EDITION = `---
schema_version: 1
edition_date: "2026-10-01"
edition_timezone: "America/Los_Angeles"
edition_title: "WORLD SIGNAL — Synthetic Test Edition"
edition_status: "published"
content_language: "en"
generated_at: "2026-10-01T07:00:00-07:00"
updated_at: "2026-10-01T14:00:00-07:00"
sync_run: "midday"
coverage_window_start: "2026-10-01T00:00:00-07:00"
coverage_window_end: "2026-10-01T14:00:00-07:00"
summary: "Synthetic test edition verifying parser contracts."
---

# Executive Briefing

> **Edition summary:** Synthetic summary paragraph for test verification.

> **Limitations:** Single-edition synthetic fixture scope caveat.

### Top Signals

- **[WORLD-20261001-port-treaty]** — Maritime corridor agreement signed with two independent newsrooms.
- **[AI-20261001-eval-standard]** — Open benchmark consortium publishes verification suite.

# World Events

> World domain intro note.

## WORLD-20261001-port-treaty — Maritime Corridor Agreement Signed

\`\`\`yaml
signal_id: "WORLD-20261001-port-treaty"
domain: "world"
topic: "trade"
importance: 5
status: "confirmed"
confidence:
  overall: "high"
  rationale: "Confirmed by two independent wire services and treaty text."
event:
  start_date: "2026-10-01"
  geography: ["Global", "Mediterranean"]
published_at: "2026-10-01T08:00:00-07:00"
first_verified_at: "2026-10-01T08:30:00-07:00"
updated_at: "2026-10-01T13:00:00-07:00"
tags: ["shipping", "treaty"]
related_signal_ids: ["ECON-20261001-freight-rates"]
claims:
  - claim_id: "WORLD-20261001-port-treaty-C01"
    statement: "Eight nations signed the corridor protocol."
    status: "confirmed"
    confidence: "high"
    source_ids: ["S1", "S2", "S3"]
sources:
  - source_id: "S1"
    outlet: "Reuters"
    title: "Eight nations sign maritime corridor protocol"
    url: "https://www.reuters.com/world/corridor-test"
    published_at: "2026-10-01T07:30:00Z"
    accessed_at: "2026-10-01T12:00:00Z"
    source_class: "tier_1_newsroom"
    registry_id: "reuters"
    independence_group: "reuters"
    relationship: "original_reporting"
    count_as_independent: true
    supports_claim_ids: ["WORLD-20261001-port-treaty-C01"]
  - source_id: "S2"
    outlet: "AP via Local Mirror"
    title: "Corridor protocol signed"
    url: "https://apnews.com/corridor-test"
    published_at: "2026-10-01T08:00:00Z"
    accessed_at: "2026-10-01T12:00:00Z"
    source_class: "tier_1_newsroom"
    registry_id: "ap"
    independence_group: "associated_press"
    relationship: "syndicated"
    count_as_independent: false
    supports_claim_ids: ["WORLD-20261001-port-treaty-C01"]
  - source_id: "S3"
    outlet: "Associated Press"
    title: "Maritime corridor protocol original report"
    url: "https://apnews.com/original-corridor-test"
    published_at: "2026-10-01T07:45:00Z"
    accessed_at: "2026-10-01T12:00:00Z"
    source_class: "tier_1_newsroom"
    registry_id: "ap"
    independence_group: "associated_press"
    relationship: "original_reporting"
    count_as_independent: true
    supports_claim_ids: ["WORLD-20261001-port-treaty-C01"]
\`\`\`

### What Happened

Signatories finalized the corridor accord [S1][S3].

### Verified Facts

- Eight nations signed the agreement [S1][S3].

### Timeline

- 2026-09-20 — Draft text circulated.
- 2026-10-01 — Final protocol signed.

### Why It Matters

Establishes predictable shipping lanes.

### Source Perspectives

Reuters and AP aligned on core terms.

### Analysis

Reduces tail risk in maritime corridors.

### Uncertainties

- Implementation schedule remains pending.

### Scenarios

- **Base case:** Gradual ratification over six months.
- **Downside:** Ratification stalls in two parliaments.
- **Upside:** Rapid adoption lowers insurance surcharges early.

### What to Watch

- Parliamentary ratification votes.

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
updated_at: "2026-10-01T13:00:00-07:00"
tags: ["benchmarks", "safety"]
related_signal_ids: []
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
    accessed_at: "2026-10-01T12:00:00Z"
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

# Economic Outlook

> Economy domain intro note.

## ECON-20261001-freight-rates — Container Freight Indices Ease 4%

\`\`\`yaml
signal_id: "ECON-20261001-freight-rates"
domain: "economy"
topic: "inflation"
importance: 3
status: "developing"
confidence:
  overall: "medium"
  rationale: "Reported by one Tier-1 outlet."
event:
  start_date: "2026-10-01"
  geography: ["Global"]
published_at: "2026-10-01T10:00:00-07:00"
first_verified_at: "2026-10-01T10:30:00-07:00"
updated_at: "2026-10-01T13:30:00-07:00"
tags: ["shipping", "inflation"]
related_signal_ids: ["WORLD-20261001-port-treaty"]
claims:
  - claim_id: "ECON-20261001-freight-rates-C01"
    statement: "Composite freight index declined 4% week over week."
    status: "reported"
    confidence: "medium"
    source_ids: ["S1"]
sources:
  - source_id: "S1"
    outlet: "Financial Times"
    title: "Container rates decline"
    url: "https://www.ft.com/content/test"
    published_at: "2026-10-01T10:00:00Z"
    accessed_at: "2026-10-01T12:00:00Z"
    source_class: "tier_1_newsroom"
    registry_id: "ft"
    independence_group: "financial_times"
    relationship: "original_reporting"
    count_as_independent: true
    supports_claim_ids: ["ECON-20261001-freight-rates-C01"]
\`\`\`

### What Happened

Freight rates edged down following treaty news.

### Verified Facts

- Index fell 4% [S1].

### Timeline

- 2026-10-01 — Weekly index published.

### Why It Matters

Shipping costs feed into goods inflation.

### Source Perspectives

FT cited maritime brokers.

### Analysis

Immediate: lower spot quotes. Near-term: modest goods CPI relief. Medium-term: contract renewals adjust. Structural: resilient multi-route logistics.

### Uncertainties

- Fuel price volatility could offset shipping savings.

### Scenarios

- **Base case:** Rates stabilize near current levels.

### Personal Relevance

- Household goods inflation may moderate gradually.

### What to Watch

- Monthly goods CPI release.

# Cross-Domain Synthesis

Only evidence-linked connections are included.

## Shipping Accord → Freight Costs

**Linked signals:** WORLD-20261001-port-treaty, ECON-20261001-freight-rates

Lower route risk supports softer freight pricing.

## Unestablished Connections

- No link established between AI-20261001-eval-standard and freight rates.

# Personal Implications

> General decision support only, not personalized financial advice.

## Household Costs

- Monitor durable goods pricing rather than reacting to single-week freight prints.

# Watchlist

| Indicator or event | Why it matters | Next checkpoint | Signals linked |
|---|---|---|---|
| Ratification calendar | Confirms legal enforcement | 2026-11-15 | WORLD-20261001-port-treaty |
| Unlinked draft watch item | Pending independent verification | TBD | — |

# Audit & Methodology

## Source audit

Synthetic audit note.

## Open questions

- Will ratification finish on schedule?

## Corrections

- None.

## Methodology notes

- Standard schema v1 rules applied.
`;

export const MALFORMED_AND_UNSAFE_EDITION = `---
schema_version: 1
edition_date: "2026-10-02"
edition_timezone: "America/Los_Angeles"
edition_title: "Synthetic Malformed Edition"
edition_status: "draft"
content_language: "en"
generated_at: "2026-10-02T07:00:00-07:00"
updated_at: "2026-10-02T08:00:00-07:00"
sync_run: "morning"
coverage_window_start: "2026-10-02T00:00:00-07:00"
coverage_window_end: "2026-10-02T08:00:00-07:00"
summary: "Testing error and warning handling."
---

# Executive Briefing

> **Edition summary:** Malformed fixture.

# World Events

## WORLD-20261002-unknown-source — Unknown Source Metadata Test

\`\`\`yaml
signal_id: "WORLD-20261002-unknown-source"
domain: "world"
topic: "policy"
importance: 3
status: "unverified"
confidence:
  overall: "low"
  rationale: "Testing unknown source class and unsafe URL handling."
event:
  start_date: "2026-10-02"
  geography: ["Global"]
published_at: "2026-10-02T07:00:00-07:00"
first_verified_at: "2026-10-02T07:10:00-07:00"
updated_at: "2026-10-02T07:20:00-07:00"
tags: ["audit"]
related_signal_ids: ["WORLD-20261002-nonexistent"]
claims:
  - claim_id: "WORLD-20261002-unknown-source-C01"
    statement: "Claim referencing missing source."
    status: "unverified"
    confidence: "low"
    source_ids: ["S1", "S99"]
sources:
  - source_id: "S1"
    outlet: "Unclassified Blog"
    title: "Suspicious link and invalid metadata"
    url: "javascript:alert(1)"
    published_at: "2026-10-02T07:00:00Z"
    accessed_at: "2026-10-02T07:15:00Z"
    source_class: "random_blog"
    registry_id: null
    independence_group: "blog_group"
    relationship: "rumor_repost"
    count_as_independent: true
    supports_claim_ids: ["WORLD-20261002-unknown-source-C01"]
\`\`\`

### What Happened

Test narrative.

# AI Frontier
# Economic Outlook
# Cross-Domain Synthesis
# Personal Implications
# Watchlist
# Audit & Methodology
`;
