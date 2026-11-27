import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseEditionMarkdown } from '../lib/markdown/parseEdition';
import {
  buildCatchUpReport,
  buildCompactReviewedSnapshot,
  loadCompactReviewedSnapshot,
  saveCompactReviewedSnapshot,
} from '../lib/intelligence/catch-up/catchUpEngine';
import {
  createEmptyReaderState,
  followSignalInReaderState,
  type StorageLike,
} from '../lib/intelligence/reader-state/readerState';
import { VALID_SYNTHETIC_EDITION } from './fixtures/syntheticEdition';
import { SYNTHETIC_FOLLOWUP_EDITION } from './fixtures/dailyDeltaFixtures';

function createMemoryStorage(): StorageLike {
  const map = new Map<string, string>();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => {
      map.set(k, v);
    },
    removeItem: (k) => {
      map.delete(k);
    },
  };
}

describe('Since Your Last Visit (Catch-Up) — checkpoints, cross-day diffs, followed alerts, and same-day compact snapshots', () => {
  const ed1 = parseEditionMarkdown(
    VALID_SYNTHETIC_EDITION,
    '/editions/2026/10/2026-10-01.md'
  );
  const ed2 = parseEditionMarkdown(
    SYNTHETIC_FOLLOWUP_EDITION,
    '/editions/2026/10/2026-10-05.md'
  );

  it('returns explicit first_visit state before any manual review checkpoint is saved', () => {
    const report = buildCatchUpReport({
      readerState: createEmptyReaderState(),
      currentEdition: ed2,
      archivedBaselineEdition: null,
      localReviewedSnapshot: null,
    });

    assert.equal(report.status, 'first_visit');
    if (report.status === 'first_visit') {
      assert.equal(report.currentEditionDate, '2026-10-05');
      assert.equal(report.signalCount, ed2.signals.length);
    }
  });

  it('computes general catch-up and personal followed-signal alerts across editions', () => {
    let readerState = createEmptyReaderState();
    readerState = followSignalInReaderState(readerState, {
      signalId: 'WORLD-20261001-port-treaty',
      editionDate: '2026-10-01',
      headline: 'Maritime Corridor Agreement Signed by Eight Nations',
      domain: 'world',
    });
    readerState = followSignalInReaderState(readerState, {
      signalId: 'ECON-20261001-freight-rates',
      editionDate: '2026-10-01',
      headline: 'Freight Rates Surge',
      domain: 'economy',
    });
    readerState.lastReviewedEditionDate = '2026-10-01';
    readerState.lastReviewedAt = '2026-10-01T19:00:00Z';

    const report = buildCatchUpReport({
      readerState,
      currentEdition: ed2,
      archivedBaselineEdition: ed1,
      localReviewedSnapshot: null,
    });

    assert.equal(report.status, 'changes_available');
    if (report.status === 'changes_available') {
      assert.equal(report.newSignals.length, 1);
      assert.equal(report.newSignals[0].signalId, 'AI-20261005-compute-compact');
      assert.equal(report.updatedSignals.length, 1);
      assert.equal(report.updatedSignals[0].signalId, 'WORLD-20261001-port-treaty');
      assert.equal(report.omittedSignals.length, 1);
      assert.equal(report.claimChangeSignals.length, 1);
      assert.equal(report.sourceChangeSignals.length, 1);
      assert.equal(report.followedAlerts.length, 2);
      assert.ok(
        report.followedAlerts.some(
          (a) => a.signalId === 'WORLD-20261001-port-treaty' && a.kind === 'updated'
        )
      );
      assert.ok(
        report.followedAlerts.some(
          (a) => a.signalId === 'ECON-20261001-freight-rates' && a.kind === 'omitted'
        )
      );
    }
  });

  it('detects same-day Muse revisions using the compact local reviewed snapshot', () => {
    const storage = createMemoryStorage();
    const compact = buildCompactReviewedSnapshot(ed1, '2026-10-01T10:00:00Z');
    assert.equal(saveCompactReviewedSnapshot(compact, storage), true);
    const loadedCompact = loadCompactReviewedSnapshot(storage);
    assert.ok(loadedCompact);

    const sameDayUpdated = parseEditionMarkdown(
      VALID_SYNTHETIC_EDITION.replace(
        'updated_at: "2026-10-01T14:00:00-07:00"',
        'updated_at: "2026-10-01T19:00:00-07:00"'
      ).replace(
        'Maritime Corridor Agreement Signed',
        'Maritime Corridor Agreement Expanded to Nine Nations'
      ),
      '/editions/2026/10/2026-10-01.md'
    );

    const readerState = {
      ...createEmptyReaderState(),
      lastReviewedEditionDate: '2026-10-01',
      lastReviewedAt: '2026-10-01T14:30:00Z',
      reviewedSnapshotMetadata: {
        editionDate: '2026-10-01',
        editionUpdatedAt: ed1.frontmatter.updated_at,
        signalCount: ed1.signals.length,
        hasCompactSnapshot: true,
      },
    };

    const report = buildCatchUpReport({
      readerState,
      currentEdition: sameDayUpdated,
      archivedBaselineEdition: null,
      localReviewedSnapshot: loadedCompact,
    });

    assert.equal(report.status, 'changes_available');
    if (report.status === 'changes_available') {
      assert.equal(report.isSameDayRevision, true);
      assert.equal(report.usedLocalSnapshot, true);
      assert.equal(report.updatedSignals.length, 1);
      assert.equal(report.updatedSignals[0].signalId, 'WORLD-20261001-port-treaty');
    }

    // Reviewing the same unchanged edition yields up_to_date
    const unchangedReport = buildCatchUpReport({
      readerState,
      currentEdition: ed1,
      archivedBaselineEdition: null,
      localReviewedSnapshot: loadedCompact,
    });
    assert.equal(unchangedReport.status, 'up_to_date');
  });

  it('returns explicit baseline_unavailable instead of inventing diffs when prior baseline is missing', () => {
    const readerState = {
      ...createEmptyReaderState(),
      lastReviewedEditionDate: '2026-09-20',
      lastReviewedAt: '2026-09-20T18:00:00Z',
    };

    const report = buildCatchUpReport({
      readerState,
      currentEdition: ed2,
      archivedBaselineEdition: null,
      localReviewedSnapshot: null,
    });

    assert.equal(report.status, 'baseline_unavailable');
    if (report.status === 'baseline_unavailable') {
      assert.equal(report.reason, 'archived_baseline_missing');
      assert.equal(report.lastReviewedEditionDate, '2026-09-20');
    }
  });
});
