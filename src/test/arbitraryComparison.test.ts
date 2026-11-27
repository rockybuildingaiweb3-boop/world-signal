import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseEditionMarkdown } from '../lib/markdown/parseEdition';
import {
  buildArbitraryEditionComparison,
  resolveDefaultComparisonDates,
  validateComparisonPair,
} from '../lib/intelligence/edition-diff/arbitraryComparison';
import { VALID_SYNTHETIC_EDITION } from './fixtures/syntheticEdition';
import {
  SYNTHETIC_ARCHIVE_ENTRIES,
  SYNTHETIC_FOLLOWUP_EDITION,
} from './fixtures/dailyDeltaFixtures';

describe('Arbitrary Edition Comparison — validation, chronological normalization, and deterministic diffing', () => {
  const ed1 = parseEditionMarkdown(
    VALID_SYNTHETIC_EDITION,
    '/editions/2026/10/2026-10-01.md'
  );
  const ed2 = parseEditionMarkdown(
    SYNTHETIC_FOLLOWUP_EDITION,
    '/editions/2026/10/2026-10-05.md'
  );

  it('validates real archive pairs and rejects invalid, missing, same-date, or insufficient archive selections', () => {
    const tooFew = validateComparisonPair(
      [SYNTHETIC_ARCHIVE_ENTRIES[0]],
      '2026-10-05',
      '2026-10-01'
    );
    assert.equal(tooFew.valid, false);
    if (!tooFew.valid) assert.equal(tooFew.error, 'insufficient_archive');

    const missing = validateComparisonPair(SYNTHETIC_ARCHIVE_ENTRIES, '', '2026-10-05');
    assert.equal(missing.valid, false);
    if (!missing.valid) assert.equal(missing.error, 'missing_date');

    const sameDate = validateComparisonPair(
      SYNTHETIC_ARCHIVE_ENTRIES,
      '2026-10-05',
      '2026-10-05'
    );
    assert.equal(sameDate.valid, false);
    if (!sameDate.valid) assert.equal(sameDate.error, 'same_edition_selected');

    const fabricated = validateComparisonPair(
      SYNTHETIC_ARCHIVE_ENTRIES,
      '2026-10-01',
      '2026-10-99'
    );
    assert.equal(fabricated.valid, false);
    if (!fabricated.valid) assert.equal(fabricated.error, 'invalid_date_not_in_archive');
  });

  it('normalizes chronological ordering older -> newer even when input dates are reversed', () => {
    const reversed = validateComparisonPair(
      SYNTHETIC_ARCHIVE_ENTRIES,
      '2026-10-05',
      '2026-10-01'
    );
    assert.equal(reversed.valid, true);
    if (reversed.valid) {
      assert.equal(reversed.wasReversedInput, true);
      assert.equal(reversed.olderEntry.date, '2026-10-01');
      assert.equal(reversed.newerEntry.date, '2026-10-05');
      assert.equal(reversed.dayGapCount, 4);
    }

    const forward = validateComparisonPair(
      SYNTHETIC_ARCHIVE_ENTRIES,
      '2026-10-01',
      '2026-10-05'
    );
    assert.equal(forward.valid, true);
    if (forward.valid) {
      assert.equal(forward.wasReversedInput, false);
    }
  });

  it('computes deterministic arbitrary edition diffs preserving claim/source diffs and omitted-not-resolved semantics', () => {
    const comparison = buildArbitraryEditionComparison({
      olderEdition: ed1,
      newerEdition: ed2,
      wasReversedInput: false,
    });

    assert.equal(comparison.fromDate, '2026-10-01');
    assert.equal(comparison.toDate, '2026-10-05');
    assert.equal(comparison.dayGapCount, 4);
    assert.equal(comparison.fromSchemaVersion, 1);
    assert.equal(comparison.toSchemaVersion, 2);

    assert.equal(comparison.diff.summary.newSignals, 1);
    assert.equal(comparison.diff.summary.materiallyUpdatedSignals, 1);
    assert.equal(comparison.diff.summary.unchangedSignals, 1);
    assert.equal(comparison.diff.summary.omittedSignals, 1);

    const omitted = comparison.diff.omitted[0];
    assert.equal(omitted.signalId, 'ECON-20261001-freight-rates');
    assert.equal(omitted.kind, 'omitted');
    assert.ok(omitted.previous);
    assert.equal(omitted.current, null);

    const defaults = resolveDefaultComparisonDates(
      SYNTHETIC_ARCHIVE_ENTRIES,
      '2026-10-05'
    );
    assert.deepEqual(defaults, { fromDate: '2026-10-02', toDate: '2026-10-05' });
  });
});
