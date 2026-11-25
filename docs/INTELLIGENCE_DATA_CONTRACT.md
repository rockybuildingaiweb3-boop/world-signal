# Intelligence Data Contract (Signal Metadata v2)

## Purpose

This document defines the additive metadata needed for deterministic cross-edition comparison, event continuity, evidence-change inspection, and explicit signal relationships.

The canonical source remains the daily Markdown edition in `content/editions/`. The frontend must derive its intelligence views from published editions; it must not create a second editorial database, infer missing evidence, or invent relationships.

## Compatibility and migration

- Existing editions with `schema_version: 1` remain valid and must continue to render.
- Schema v2 is additive. It retains every v1 field and adds optional structured metadata to each signal.
- The parser accepts v1 and v2. Missing v2 fields in historical v1 editions are normal, not errors.
- New or materially updated editions should use `schema_version: 2` and populate the v2 metadata for every signal.
- Do not bulk-rewrite historical editions merely to fill new fields. Backfill only when the historical record supports the value; otherwise leave it unknown or use the earliest verified archive date.
- No client-side model/API calls. Comparison and indexing must be deterministic.

## Signal metadata extensions

### 1. Continuity

```yaml
continuity:
  first_seen_edition: "YYYY-MM-DD"
  last_material_update: "YYYY-MM-DD"
  lifecycle: "developing"
```

- `first_seen_edition` is the earliest WORLD SIGNAL edition in which this signal ID appears. It is not the event start date.
- `last_material_update` is the latest edition with a material factual, evidence, status, or analytical change. A routine sync does not move it.
- `lifecycle` is one of `new`, `developing`, `ongoing`, `monitoring`, `resolved`, `archived`.
- Do not mark a story resolved merely because it is absent from a later edition.

### 2. Update record

```yaml
update:
  change_type: "material_update"
  summary: "A concise description of what materially changed since the previous edition."
  previous_edition: "YYYY-MM-DD"
  evidence_changes:
    added_claim_ids: []
    revised_claim_ids: []
    withdrawn_claim_ids: []
    added_source_urls: []
    removed_source_urls: []
```

Allowed `change_type` values:

- `initial`
- `material_update`
- `status_change`
- `new_evidence`
- `correction`
- `no_material_change`

Rules:

- The summary must describe a real change, not repeat the headline.
- Use `no_material_change` when the signal is retained but no material change is found.
- Claim IDs should remain stable while the proposition remains the same. If a proposition changes materially, create a new claim ID and explain the relationship.
- Never silently erase a previously reported claim. Record withdrawals/corrections explicitly and preserve the audit trail in the edition.
- Source URLs are exact canonical URLs, not outlet homepages.
- Do not list mere access-time or formatting changes as evidence changes.

### 3. Structured timeline events

```yaml
timeline_events:
  - event_id: "WORLD-YYYYMMDD-example-E01"
    occurred_at: "YYYY-MM-DD"
    title: "A concise event title"
    summary: "What happened, stated without interpretation."
    claim_ids: ["WORLD-YYYYMMDD-example-C01"]
    source_ids: ["S1"]
```

- Every event needs a stable ID unique within the signal, an occurrence date/time, title, summary, and explicit evidence references.
- Dates describe when the event occurred, not when it was reported.
- Do not fabricate precise timestamps when only a date is known.
- Timeline events may be cumulative. Preserve earlier verified events when updating an ongoing signal.

### 4. Explicit signal relationships

```yaml
relationships:
  - target_signal_id: "ECON-YYYYMMDD-example"
    relationship_type: "market_transmission"
    confidence: "medium"
    rationale: "A concise evidence-based explanation of the connection."
    supporting_claim_ids: ["WORLD-YYYYMMDD-example-C02"]
```

Allowed relationship types:

- `same_event`
- `contextual`
- `policy_response`
- `market_transmission`
- `technological_dependency`
- `causal_link`
- `potential_link`

Rules:

- A relationship is directed from the current signal to the target signal.
- `related_signal_ids` remains supported for backward compatibility; it is a coarse contextual link, not proof of causality.
- Use `causal_link` only when explicit claims support a causal mechanism. Include supporting claim IDs and state alternative explanations in the rationale or narrative.
- Use `potential_link` when the relationship is plausible but not established.
- Never infer a relationship simply because two events occur near each other in time.
- Target IDs may refer to signals in other editions; do not require the target to exist in the same daily file.

## Cross-edition interpretation rules

- A signal ID is the durable identity of an ongoing story. Reuse it; do not create a new ID for each update.
- Compare signal snapshots by stable signal ID, not headline text.
- An edition diff may classify a signal as new, materially updated, unchanged, or omitted.
- Omission is not resolution. Only explicit lifecycle/status evidence may mark a signal resolved.
- A source count is not an independent-origin count. Continue using the single Source Policy engine.
- Changes to `updated_at`, whitespace, formatting, or source access timestamps alone are not material editorial changes.
- A new source is not necessarily independent corroboration; evaluate `independence_group`, `source_class`, and `relationship`.
- If an older edition is unavailable, report continuity as incomplete rather than inventing a first-seen date.

## Frontend projection

The frontend should expose pure, testable functions for:

1. Comparing two editions by stable signal ID.
2. Building a storyline history across selected editions.
3. Building an explicit relationship graph from declared links.
4. Comparing claim/source evidence records without converting missing records into retractions.

All outputs must retain provenance: edition date, signal ID, claim IDs, source URLs, and relationship rationale. These are deterministic projections of Markdown, not new facts.
