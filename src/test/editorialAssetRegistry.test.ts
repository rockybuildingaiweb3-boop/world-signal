import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  classifySignalSubject,
  EDITORIAL_ASSET_REGISTRY,
  extractGroundedSignalStats,
  selectVisualStrategyForSignal,
} from '../lib/editorial/editorialAssetRegistry';
import type { ParsedSignal } from '../types/edition';

function makeSignal(overrides: Partial<ParsedSignal> = {}): ParsedSignal {
  return {
    signal_id: 'WORLD-20261126-test',
    headline: 'Test Signal Headline',
    domain: 'world',
    topic: 'geopolitics',
    importance: 5,
    status: 'developing',
    confidence: { overall: 'high', rationale: 'Multiple independent origins' },
    event: { start_date: '2026-11-24', geography: ['Global'] },
    published_at: '2026-11-26T00:00:00Z',
    first_verified_at: '2026-11-26T00:00:00Z',
    updated_at: '2026-11-26T00:00:00Z',
    tags: [],
    related_signal_ids: [],
    timelineEvents: [
      {
        event_id: 'E1',
        occurred_at: '2026-11-23',
        title: 'Initial development',
        summary: 'First reported.',
        claim_ids: ['C1'],
        source_ids: ['S1'],
      },
      {
        event_id: 'E2',
        occurred_at: '2026-11-26',
        title: 'Latest update',
        summary: 'Confirmed by independent outlets.',
        claim_ids: ['C1'],
        source_ids: ['S2'],
      },
    ],
    relationships: [],
    claims: [
      {
        claim_id: 'C1',
        statement: 'Verified core claim',
        status: 'confirmed',
        confidence: 'high',
        source_ids: ['S1', 'S2'],
      },
      {
        claim_id: 'C2',
        statement: 'Reported secondary claim',
        status: 'reported',
        confidence: 'medium',
        source_ids: ['S1'],
      },
    ],
    sources: [],
    independence: {
      totalRecords: 2,
      independentOriginCount: 2,
      independentGroups: [],
      allOriginGroups: [],
      unassignedRecords: [],
      qualifyingRecords: 2,
      excludedRecords: 0,
      tier1Records: 2,
      specialistRecords: 0,
      primarySourceRecords: 0,
      researchPaperRecords: 0,
      unknownClassRecords: 0,
      syndicatedRecords: 0,
      unregisteredRecords: 0,
    },
    independentOriginCount: 2,
    independentGroups: ['reuters', 'ap'],
    sections: {
      whatHappened: 'Summary text.',
      verifiedFacts: '',
      timeline: '',
      timelineEntries: [],
      whyItMatters: '',
      sourcePerspectives: '',
      analysis: '',
      horizonImpacts: [],
      uncertainties: '',
      scenarios: '',
      scenarioItems: [],
      whatToWatch: '',
      extraSections: [],
    },
    rawNarrative: 'Summary text.',
    orderIndex: 0,
    ...overrides,
  };
}

describe('editorialAssetRegistry — subject classification, anti-repetition, and grounded stats', () => {
  it('contains 9 distinct museum-grade conceptual illustrations with explicit EN/ZH non-documentary credits', () => {
    const assets = Object.values(EDITORIAL_ASSET_REGISTRY);
    assert.equal(assets.length, 9);
    for (const asset of assets) {
      assert.equal(asset.classification, 'original_editorial_illustration');
      assert.ok(asset.creditEn.toLowerCase().includes('non-documentary'));
      assert.ok(asset.creditZh.includes('非现场纪实'));
      assert.ok(asset.altEn.length > 20);
      assert.ok(asset.altZh.length > 10);
    }
  });

  it('classifies structured topics deterministically across World, AI, and Economy', () => {
    const elections = classifySignalSubject(
      makeSignal({ domain: 'world', topic: 'elections' })
    );
    assert.equal(elections.category, 'elections_governance');
    assert.equal(elections.matchStrength, 'strong');

    const diplomacy = classifySignalSubject(
      makeSignal({ domain: 'world', topic: 'diplomacy' })
    );
    assert.equal(diplomacy.category, 'diplomacy_summit');
    assert.equal(diplomacy.matchStrength, 'strong');

    const climate = classifySignalSubject(
      makeSignal({ domain: 'world', topic: 'climate' })
    );
    assert.equal(climate.category, 'climate_humanitarian');
    assert.equal(climate.matchStrength, 'strong');

    const chips = classifySignalSubject(
      makeSignal({
        domain: 'ai',
        topic: 'infrastructure',
        tags: ['gpu', 'chips'],
      })
    );
    assert.equal(chips.category, 'chips_compute');
    assert.equal(chips.matchStrength, 'strong');

    const aiSafety = classifySignalSubject(
      makeSignal({ domain: 'ai', topic: 'ai-safety' })
    );
    assert.equal(aiSafety.category, 'ai_safety_cyber');
    assert.equal(aiSafety.matchStrength, 'strong');

    const monetary = classifySignalSubject(
      makeSignal({ domain: 'economy', topic: 'central-banks' })
    );
    assert.equal(monetary.category, 'monetary_markets');
    assert.equal(monetary.matchStrength, 'strong');

    const trade = classifySignalSubject(
      makeSignal({ domain: 'economy', topic: 'trade' })
    );
    assert.equal(trade.category, 'trade_fiscal');
    assert.equal(trade.matchStrength, 'strong');
  });

  it('prevents visual repetition across adjacent Briefing slots via excludeAssetIds', () => {
    const conflictA = makeSignal({ domain: 'world', topic: 'conflict' });
    const first = selectVisualStrategyForSignal(conflictA, { context: 'hero' });
    assert.equal(first.mode, 'editorial_illustration');
    assert.equal(first.asset?.id, 'conflict_maritime_plate');

    const second = selectVisualStrategyForSignal(conflictA, {
      context: 'secondary',
      excludeAssetIds: first.asset ? [first.asset.id] : [],
    });
    assert.equal(second.mode, 'grounded_visual');
    assert.equal(second.asset, null);
  });

  it('uses typographic_cover in dossier context when signal has no strong subject match', () => {
    const genericSignal = makeSignal({
      domain: 'economy',
      topic: 'miscellaneous-brief',
      headline: 'Quarterly regional review published',
      tags: [],
    });
    const res = selectVisualStrategyForSignal(genericSignal, {
      context: 'dossier',
    });
    assert.equal(res.mode, 'typographic_cover');
    assert.equal(res.asset, null);
  });

  it('uses verified_documentary mode only when explicitly verified media is provided', () => {
    const res = selectVisualStrategyForSignal(makeSignal(), {
      context: 'hero',
      verifiedMedia: {
        src: 'https://example.org/verified-photo.jpg',
        alt: 'Verified press image',
        caption: 'Verified dispatch photograph',
        credit: 'Reuters / Verified Wire',
      },
    });
    assert.equal(res.mode, 'verified_documentary');
  });

  it('computes verified claim splits and timeline span accurately in extractGroundedSignalStats', () => {
    const stats = extractGroundedSignalStats(makeSignal());
    assert.equal(stats.independentOriginsCount, 2);
    assert.equal(stats.claimsCount, 2);
    assert.equal(stats.confirmedClaimsCount, 1);
    assert.equal(stats.reportedClaimsCount, 1);
    assert.equal(stats.disputedOrUnverifiedCount, 0);
    assert.equal(stats.timelineCount, 2);
    assert.equal(stats.timelineSpanLabel, '2026-11-23 – 2026-11-26');
  });
});
