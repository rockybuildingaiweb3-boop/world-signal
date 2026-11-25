import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { SignalSource } from '../types/edition';
import {
  calculateSourceIndependence,
  getIndependenceExclusionReason,
  qualifiesAsIndependentOrigin,
} from '../lib/source-independence/calculateIndependence';

function makeSource(overrides: Partial<SignalSource> = {}): SignalSource {
  return {
    source_id: 'S1',
    outlet: 'Reuters',
    title: 'Sample original article',
    url: 'https://www.reuters.com/test',
    urlSafe: true,
    published_at: '2026-11-23T10:00:00Z',
    accessed_at: '2026-11-23T11:00:00Z',
    source_class: 'tier_1_newsroom',
    registry_id: 'reuters',
    independence_group: 'reuters',
    relationship: 'original_reporting',
    count_as_independent: true,
    qualifiesAsIndependent: true,
    supports_claim_ids: ['C01'],
    ...overrides,
  };
}

describe('calculateSourceIndependence — authoritative Source Policy engine', () => {
  it('deduplicates multiple original articles from the same independence_group', () => {
    const metrics = calculateSourceIndependence([
      { ...makeSource({ source_id: 'S1', independence_group: 'reuters' }), signal_id: 'SIG-1' },
      { ...makeSource({ source_id: 'S2', independence_group: 'Reuters' }), signal_id: 'SIG-1' },
      {
        ...makeSource({
          source_id: 'S3',
          outlet: 'Bloomberg',
          independence_group: 'bloomberg',
        }),
        signal_id: 'SIG-2',
      },
    ]);

    assert.equal(metrics.independentOriginCount, 2);
    assert.equal(metrics.qualifyingRecords, 3);
    assert.equal(metrics.excludedRecords, 0);
  });

  it('excludes syndicated copies, primary sources, research papers, secondary analysis, and unknown metadata even if count_as_independent is true', () => {
    const cases: Array<{ src: SignalSource; expectedReason: string }> = [
      {
        src: makeSource({ relationship: 'syndicated', count_as_independent: true }),
        expectedReason: 'syndicated',
      },
      {
        src: makeSource({
          source_class: 'primary_source',
          relationship: 'original_reporting',
          count_as_independent: true,
        }),
        expectedReason: 'primary_source',
      },
      {
        src: makeSource({
          source_class: 'research_paper',
          relationship: 'original_reporting',
          count_as_independent: true,
        }),
        expectedReason: 'research_paper',
      },
      {
        src: makeSource({
          relationship: 'secondary_analysis',
          count_as_independent: true,
        }),
        expectedReason: 'secondary_analysis',
      },
      {
        src: makeSource({
          source_class: 'unknown',
          relationship: 'original_reporting',
          count_as_independent: true,
        }),
        expectedReason: 'unknown_source_class',
      },
      {
        src: makeSource({
          source_class: 'tier_1_newsroom',
          relationship: 'unknown',
          count_as_independent: true,
        }),
        expectedReason: 'unknown_relationship',
      },
      {
        src: makeSource({
          independence_group: '',
          count_as_independent: true,
        }),
        expectedReason: 'missing_independence_group',
      },
      {
        src: makeSource({
          count_as_independent: false,
        }),
        expectedReason: 'flagged_non_independent',
      },
    ];

    for (const c of cases) {
      assert.equal(qualifiesAsIndependentOrigin(c.src), false);
      assert.equal(getIndependenceExclusionReason(c.src), c.expectedReason);
    }

    const metrics = calculateSourceIndependence(cases.map((c) => c.src));
    assert.equal(metrics.independentOriginCount, 0);
    assert.equal(metrics.qualifyingRecords, 0);
    assert.equal(metrics.excludedRecords, cases.length);
  });

  it('produces allOriginGroups covering both qualifying and excluded groups for Audit Explorer', () => {
    const metrics = calculateSourceIndependence([
      { ...makeSource({ source_id: 'S1', independence_group: 'reuters' }), signal_id: 'SIG-1' },
      {
        ...makeSource({
          source_id: 'S2',
          outlet: 'Reuters via Mirror',
          independence_group: 'reuters',
          relationship: 'syndicated',
          count_as_independent: false,
        }),
        signal_id: 'SIG-2',
      },
      {
        ...makeSource({
          source_id: 'S3',
          outlet: 'SEC',
          source_class: 'primary_source',
          independence_group: 'sec',
          relationship: 'official_statement',
          count_as_independent: false,
        }),
        signal_id: 'SIG-1',
      },
    ]);

    assert.equal(metrics.independentOriginCount, 1);
    assert.equal(metrics.allOriginGroups.length, 2);

    const reutersGroup = metrics.allOriginGroups.find((g) => g.group === 'reuters');
    assert.ok(reutersGroup);
    assert.equal(reutersGroup.qualifiesAny, true);
    assert.equal(reutersGroup.qualifyingRecordCount, 1);
    assert.equal(reutersGroup.excludedRecordCount, 1);
    assert.deepEqual(reutersGroup.exclusionReasons, ['syndicated']);

    const secGroup = metrics.allOriginGroups.find((g) => g.group === 'sec');
    assert.ok(secGroup);
    assert.equal(secGroup.qualifiesAny, false);
    assert.deepEqual(secGroup.exclusionReasons, ['primary_source']);
  });

  it('keeps records missing independence_group separate in unassignedRecords instead of merging them into one origin group', () => {
    const metrics = calculateSourceIndependence([
      {
        ...makeSource({
          source_id: 'S1',
          outlet: 'Unassigned Outlet Alpha',
          independence_group: '',
          count_as_independent: true,
        }),
        signal_id: 'SIG-1',
      },
      {
        ...makeSource({
          source_id: 'S2',
          outlet: 'Unassigned Outlet Beta',
          independence_group: '   ',
          count_as_independent: true,
        }),
        signal_id: 'SIG-2',
      },
      {
        ...makeSource({
          source_id: 'S3',
          outlet: 'Reuters',
          independence_group: 'reuters',
          count_as_independent: true,
        }),
        signal_id: 'SIG-1',
      },
    ]);

    assert.equal(metrics.independentOriginCount, 1);
    assert.equal(metrics.allOriginGroups.length, 1);
    assert.equal(metrics.allOriginGroups[0].group, 'reuters');
    assert.equal(
      metrics.allOriginGroups.some((g) => g.group.includes('unassigned')),
      false
    );
    assert.equal(metrics.unassignedRecords.length, 2);
    assert.equal(metrics.unassignedRecords[0].outlet, 'Unassigned Outlet Alpha');
    assert.equal(metrics.unassignedRecords[1].outlet, 'Unassigned Outlet Beta');
    assert.equal(
      metrics.unassignedRecords[0].exclusionReason,
      'missing_independence_group'
    );
  });
});
