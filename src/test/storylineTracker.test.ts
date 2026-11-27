import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseEditionMarkdown } from '../lib/markdown/parseEdition';
import { buildSignalStorylineProjection } from '../lib/intelligence/storylines/storylineHelpers';
import { VALID_SYNTHETIC_EDITION } from './fixtures/syntheticEdition';
import { SYNTHETIC_FOLLOWUP_EDITION } from './fixtures/dailyDeltaFixtures';

const REAPPEARED_EDITION = `---
schema_version: 2
edition_date: "2026-10-09"
edition_timezone: "America/Los_Angeles"
edition_title: "WORLD SIGNAL — Reappearance Fixture"
edition_status: "published"
content_language: "en"
generated_at: "2026-10-09T07:00:00-07:00"
updated_at: "2026-10-09T18:00:00-07:00"
sync_run: "evening"
coverage_window_start: "2026-10-09T00:00:00-07:00"
coverage_window_end: "2026-10-09T18:00:00-07:00"
summary: "Freight rates signal reappears after gap."
---

# Executive Briefing

> **Edition summary:** Reappearance test edition.

### Top Signals

- **[ECON-20261001-freight-rates]** — Freight rates returned to coverage after a gap.

# World Events

> None.

# AI Frontier

> None.

# Economic Outlook

> Shipping rates resume climb.

## ECON-20261001-freight-rates — Container Freight Indices Climb Again After Pause

\`\`\`yaml
signal_id: "ECON-20261001-freight-rates"
domain: "economy"
topic: "shipping"
importance: 4
status: "ongoing"
confidence:
  overall: "medium"
  rationale: "Confirmed by freight index release."
event:
  start_date: "2026-10-01"
  end_date: "2026-10-09"
  geography: ["Global"]
published_at: "2026-10-09T08:00:00-07:00"
first_verified_at: "2026-10-01T08:00:00-07:00"
updated_at: "2026-10-09T17:00:00-07:00"
tags: ["freight", "shipping"]
related_signal_ids: []
continuity:
  first_seen_edition: "2026-10-01"
  last_material_update: "2026-10-09"
  history_complete: false
  lifecycle: "developing"
claims:
  - claim_id: "ECON-20261001-freight-rates-C02"
    statement: "Spot container rates rose 7% in the latest weekly benchmark."
    status: "confirmed"
    confidence: "medium"
    source_ids: ["S1"]
sources:
  - source_id: "S1"
    outlet: "Reuters"
    title: "Container freight index climbs 7%"
    url: "https://www.reuters.com/markets/freight-reappear-test"
    published_at: "2026-10-09T07:00:00Z"
    accessed_at: "2026-10-09T16:00:00Z"
    source_class: "tier_1_newsroom"
    registry_id: "reuters"
    independence_group: "reuters"
    relationship: "original_reporting"
    count_as_independent: true
    supports_claim_ids: ["ECON-20261001-freight-rates-C02"]
\`\`\`

### What Happened

Container freight rates rose again after an absence from coverage [S1].

### Verified Facts

- Rates rose 7% [S1].
`;

describe('Storyline Tracker — longitudinal projection, revision kinds, evidence diffs, and coverage boundaries', () => {
  const ed1 = parseEditionMarkdown(
    VALID_SYNTHETIC_EDITION,
    '/editions/2026/10/2026-10-01.md'
  );
  const ed2 = parseEditionMarkdown(
    SYNTHETIC_FOLLOWUP_EDITION,
    '/editions/2026/10/2026-10-05.md'
  );
  const ed3 = parseEditionMarkdown(
    REAPPEARED_EDITION,
    '/editions/2026/10/2026-10-09.md'
  );

  it('tracks first_seen and material_update with added/revised claims and added sources', () => {
    const projection = buildSignalStorylineProjection({
      signalId: 'WORLD-20261001-port-treaty',
      loadedEditions: [ed2, ed1], // Intentionally unsorted to confirm deterministic sorting
      totalArchiveEditionCount: 2,
    });

    assert.ok(projection);
    assert.equal(projection.firstAvailableAppearance, '2026-10-01');
    assert.equal(projection.lastAvailableAppearance, '2026-10-05');
    assert.equal(projection.lastMaterialUpdate, '2026-10-05');
    assert.equal(projection.appearanceCount, 2);
    assert.equal(projection.coverage.isArchiveCoverageComplete, true);
    assert.equal(projection.coverage.absentFromLatestLoadedEdition, false);

    assert.equal(projection.revisions.length, 2);
    assert.equal(projection.revisions[0].kind, 'first_seen');
    assert.equal(projection.revisions[0].schemaVersion, 1);
    assert.equal(projection.revisions[1].kind, 'material_update');
    assert.equal(projection.revisions[1].schemaVersion, 2);
    assert.ok(
      projection.revisions[1].diff.addedClaimIds.includes(
        'WORLD-20261001-port-treaty-C02'
      )
    );
    assert.ok(
      projection.revisions[1].diff.revisedClaimIds.includes(
        'WORLD-20261001-port-treaty-C01'
      )
    );
    assert.ok(
      projection.revisions[1].diff.addedSourceUrls.includes(
        'https://www.bloomberg.com/news/corridor-dispute-test'
      )
    );
  });

  it('classifies unchanged appearances without false material updates', () => {
    const projection = buildSignalStorylineProjection({
      signalId: 'AI-20261001-eval-standard',
      loadedEditions: [ed1, ed2],
      totalArchiveEditionCount: 2,
    });

    assert.ok(projection);
    assert.equal(projection.revisions[0].kind, 'first_seen');
    assert.equal(projection.revisions[1].kind, 'unchanged');
    assert.equal(projection.lastMaterialUpdate, '2026-10-01');
  });

  it('detects reappearance after a gap, tracks gap days, and respects history_complete: false', () => {
    const projection = buildSignalStorylineProjection({
      signalId: 'ECON-20261001-freight-rates',
      loadedEditions: [ed1, ed2, ed3],
      totalArchiveEditionCount: 3,
    });

    assert.ok(projection);
    assert.equal(projection.appearanceCount, 2);
    assert.equal(projection.revisions[0].kind, 'first_seen');
    assert.equal(projection.revisions[1].kind, 'reappeared');
    assert.equal(projection.revisions[1].gapDaysFromPrevious, 8);
    assert.equal(projection.coverage.metadataReportsIncompleteHistory, true);
    assert.equal(projection.coverage.isArchiveCoverageComplete, false);
    assert.ok(projection.revisions[1].diff.withdrawnClaimIds.length > 0);
    assert.ok(projection.revisions[1].diff.removedSourceUrls.length > 0);
  });

  it('flags absent signals in newer loaded editions without fabricating resolution', () => {
    const projection = buildSignalStorylineProjection({
      signalId: 'ECON-20261001-freight-rates',
      loadedEditions: [ed1, ed2],
      totalArchiveEditionCount: 2,
    });

    assert.ok(projection);
    assert.equal(projection.lastAvailableAppearance, '2026-10-01');
    assert.equal(projection.coverage.absentFromLatestLoadedEdition, true);
    assert.equal(projection.coverage.latestLoadedEdition, '2026-10-05');
    // Lifecycle status stays exactly what was recorded in 2026-10-01 (never fabricated "closed")
    assert.notEqual(projection.lifecycleStatus, 'closed');
  });

  it('reports incomplete archive coverage when historical editions fail or are not yet loaded, and returns null for unknown IDs', () => {
    const partial = buildSignalStorylineProjection({
      signalId: 'WORLD-20261001-port-treaty',
      loadedEditions: [ed1],
      totalArchiveEditionCount: 3,
      failedEditionDates: ['2026-10-05'],
    });
    assert.ok(partial);
    assert.equal(partial.coverage.isArchiveCoverageComplete, false);
    assert.deepEqual(partial.coverage.failedEditionDates, ['2026-10-05']);

    const missing = buildSignalStorylineProjection({
      signalId: 'WORLD-20261001-does-not-exist',
      loadedEditions: [ed1, ed2],
      totalArchiveEditionCount: 2,
    });
    assert.equal(missing, null);
  });
});
