import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseEditionMarkdown } from '../lib/markdown/parseEdition';
import {
  buildDailyDeltaState,
  computeCalendarDayGap,
  findPreviousAvailableEdition,
  getDeltaItemsForCategory,
  getVerifiedUpdateSummary,
  resolveDefaultDeltaCategory,
  resolveSignalNavigationTarget,
} from '../lib/intelligence/daily-delta/dailyDeltaHelpers';
import {
  parseUrlState,
  syncUrlState,
  type HistoryAdapter,
} from '../lib/navigation/urlState';
import { VALID_SYNTHETIC_EDITION } from './fixtures/syntheticEdition';
import {
  SYNTHETIC_ARCHIVE_ENTRIES,
  SYNTHETIC_FOLLOWUP_EDITION,
} from './fixtures/dailyDeltaFixtures';

function parseBaseline(isLocalPreview = false) {
  return parseEditionMarkdown(
    VALID_SYNTHETIC_EDITION,
    isLocalPreview ? 'local-preview.md' : '/editions/2026/10/2026-10-01.md',
    {
      isLocalPreview,
      expectedDate: isLocalPreview ? undefined : '2026-10-01',
    }
  );
}

function parseFollowup(isLocalPreview = false) {
  return parseEditionMarkdown(
    SYNTHETIC_FOLLOWUP_EDITION,
    isLocalPreview ? 'local-followup.md' : '/editions/2026/10/2026-10-05.md',
    {
      isLocalPreview,
      expectedDate: isLocalPreview ? undefined : '2026-10-05',
    }
  );
}

function createMockHistory(initialSearch = '') {
  const stack: string[] = [`/${initialSearch}`];
  let index = 0;

  const adapter: HistoryAdapter = {
    getPathname: () => '/',
    getSearch: () => {
      const url = stack[index];
      const q = url.indexOf('?');
      return q >= 0 ? url.slice(q) : '';
    },
    getHash: () => '',
    pushState: (url: string) => {
      stack.splice(index + 1);
      stack.push(url);
      index = stack.length - 1;
    },
    replaceState: (url: string) => {
      stack[index] = url;
    },
  };

  return {
    adapter,
    stack,
    currentUrl: () => stack[index],
    back: () => {
      if (index > 0) index -= 1;
      return parseUrlState(adapter.getSearch());
    },
    forward: () => {
      if (index < stack.length - 1) index += 1;
      return parseUrlState(adapter.getSearch());
    },
  };
}

describe('Daily Delta — previous edition discovery & unavailable states', () => {
  it('identifies the immediately preceding available edition chronologically even when archive entries are unsorted or have date gaps', () => {
    const prevForLatest = findPreviousAvailableEdition(
      SYNTHETIC_ARCHIVE_ENTRIES,
      '2026-10-05'
    );
    assert.equal(prevForLatest?.date, '2026-10-02');
    assert.equal(computeCalendarDayGap('2026-10-02', '2026-10-05'), 3);

    const prevForMiddle = findPreviousAvailableEdition(
      SYNTHETIC_ARCHIVE_ENTRIES,
      '2026-10-02'
    );
    assert.equal(prevForMiddle?.date, '2026-10-01');
    assert.equal(computeCalendarDayGap('2026-10-01', '2026-10-02'), 1);

    const prevForEarliest = findPreviousAvailableEdition(
      SYNTHETIC_ARCHIVE_ENTRIES,
      '2026-10-01'
    );
    assert.equal(prevForEarliest, null);
  });

  it('produces an explicit no_previous_edition unavailable state when no earlier edition exists', () => {
    const earliest = parseBaseline(false);
    const state = buildDailyDeltaState({
      currentEdition: earliest,
      previousEdition: null,
      hasArchiveIndex: true,
      previousEntry: null,
    });

    assert.equal(state.status, 'unavailable');
    if (state.status === 'unavailable') {
      assert.equal(state.reason, 'no_previous_edition');
      assert.equal(state.currentDate, '2026-10-01');
      assert.equal(state.previousDate, null);
    }
  });

  it('produces an explicit local_preview unavailable state without fabricating historical comparison', () => {
    const localPreview = parseFollowup(true);
    const state = buildDailyDeltaState({
      currentEdition: localPreview,
      previousEdition: parseBaseline(false),
      hasArchiveIndex: true,
      previousEntry: SYNTHETIC_ARCHIVE_ENTRIES[1],
    });

    assert.equal(state.status, 'unavailable');
    if (state.status === 'unavailable') {
      assert.equal(state.reason, 'local_preview');
      assert.equal(state.previousDate, null);
    }
  });

  it('produces an explicit previous_load_failed unavailable state when loading the preceding edition fails', () => {
    const followup = parseFollowup(false);
    const state = buildDailyDeltaState({
      currentEdition: followup,
      previousEdition: null,
      hasArchiveIndex: true,
      previousEntry: SYNTHETIC_ARCHIVE_ENTRIES[1],
      previousLoadError: 'HTTP 503 Service Unavailable',
    });

    assert.equal(state.status, 'unavailable');
    if (state.status === 'unavailable') {
      assert.equal(state.reason, 'previous_load_failed');
      assert.equal(state.previousDate, '2026-10-01');
      assert.equal(state.errorMessage, 'HTTP 503 Service Unavailable');
    }
  });
});

describe('Daily Delta — deterministic classification, routine timestamp immunity, and omitted navigation', () => {
  it('classifies NEW, UPDATED, UNCHANGED, and OMITTED accurately while ignoring routine timestamps', () => {
    const previous = parseBaseline(false);
    const current = parseFollowup(false);

    const state = buildDailyDeltaState({
      currentEdition: current,
      previousEdition: previous,
      hasArchiveIndex: true,
      previousEntry: SYNTHETIC_ARCHIVE_ENTRIES[1],
    });

    assert.equal(state.status, 'ready');
    if (state.status !== 'ready') return;

    assert.equal(state.previousDate, '2026-10-01');
    assert.equal(state.currentDate, '2026-10-05');
    assert.equal(state.hasDateGap, true);
    assert.equal(state.dayGapCount, 4);
    assert.equal(state.previousSchemaVersion, 1);
    assert.equal(state.currentSchemaVersion, 2);

    // Exact summary counts
    assert.deepEqual(state.diff.summary, {
      newSignals: 1,
      materiallyUpdatedSignals: 1,
      unchangedSignals: 1,
      omittedSignals: 1,
    });
    assert.equal(resolveDefaultDeltaCategory(state.diff), 'updated');

    // 1. NEW signal detection
    const newItems = getDeltaItemsForCategory(state.diff, 'new');
    assert.equal(newItems.length, 1);
    assert.equal(newItems[0].signalId, 'AI-20261005-compute-compact');
    assert.deepEqual(newItems[0].diff.addedClaimIds, [
      'AI-20261005-compute-compact-C01',
    ]);

    // 2. UPDATED signal detection (with diff reasons, claim IDs, source URLs, and verified v2 summary)
    const updatedItems = getDeltaItemsForCategory(state.diff, 'updated');
    assert.equal(updatedItems.length, 1);
    const treaty = updatedItems[0];
    assert.equal(treaty.signalId, 'WORLD-20261001-port-treaty');
    assert.ok(treaty.diff.reasons.includes('headline'));
    assert.ok(treaty.diff.reasons.includes('status'));
    assert.ok(treaty.diff.reasons.includes('confidence'));
    assert.ok(treaty.diff.reasons.includes('claims'));
    assert.ok(treaty.diff.reasons.includes('sources'));
    assert.deepEqual(treaty.diff.addedClaimIds, [
      'WORLD-20261001-port-treaty-C02',
    ]);
    assert.deepEqual(treaty.diff.revisedClaimIds, [
      'WORLD-20261001-port-treaty-C01',
    ]);
    assert.deepEqual(treaty.diff.addedSourceUrls, [
      'https://www.bloomberg.com/news/corridor-dispute-test',
    ]);
    assert.deepEqual(treaty.diff.removedSourceUrls, [
      'https://apnews.com/corridor-test',
    ]);
    assert.match(
      getVerifiedUpdateSummary(treaty, state.previousDate) ?? '',
      /Two parliaments requested tariff annex amendments/
    );

    // 3. UNCHANGED detection: routine updated_at & accessed_at changes MUST NOT create false updates
    const unchangedItems = getDeltaItemsForCategory(state.diff, 'unchanged');
    assert.equal(unchangedItems.length, 1);
    assert.equal(unchangedItems[0].signalId, 'AI-20261001-eval-standard');
    assert.deepEqual(unchangedItems[0].diff.reasons, []);
    assert.notEqual(
      unchangedItems[0].previous?.updated_at,
      unchangedItems[0].current?.updated_at
    );
    assert.notEqual(
      unchangedItems[0].previous?.sources[0]?.accessed_at,
      unchangedItems[0].current?.sources[0]?.accessed_at
    );

    // 4. OMITTED detection & previous-edition navigation target
    const omittedItems = getDeltaItemsForCategory(state.diff, 'omitted');
    assert.equal(omittedItems.length, 1);
    const omittedFreight = omittedItems[0];
    assert.equal(omittedFreight.signalId, 'ECON-20261001-freight-rates');
    assert.equal(omittedFreight.current, null);
    assert.ok(omittedFreight.previous);

    const omittedTarget = resolveSignalNavigationTarget(
      omittedFreight,
      state.currentDate,
      state.previousDate
    );
    assert.deepEqual(omittedTarget, {
      editionDate: '2026-10-01',
      signalId: 'ECON-20261001-freight-rates',
      isOmittedNavigation: true,
    });

    const currentTarget = resolveSignalNavigationTarget(
      treaty,
      state.currentDate,
      state.previousDate
    );
    assert.deepEqual(currentTarget, {
      editionDate: '2026-10-05',
      signalId: 'WORLD-20261001-port-treaty',
      isOmittedNavigation: false,
    });
  });

  it('preserves clean URL history and back/forward navigation when opening an omitted signal in its previous edition', () => {
    const mockHistory = createMockHistory('?edition=2026-10-05');

    // User clicks an omitted signal from Daily Delta -> navigates to previous edition + expanded + signal
    const pushed = syncUrlState(
      {
        edition: '2026-10-01',
        view: 'expanded',
        signal: 'ECON-20261001-freight-rates',
      },
      'push',
      { adapter: mockHistory.adapter }
    );
    assert.equal(pushed, true);
    assert.equal(
      mockHistory.currentUrl(),
      '/?edition=2026-10-01&view=expanded&signal=ECON-20261001-freight-rates'
    );

    // Browser Back restores the newer edition's Briefing view cleanly
    const backState = mockHistory.back();
    assert.deepEqual(backState, {
      edition: '2026-10-05',
      view: 'briefing',
      signal: null,
    });

    // Browser Forward restores the omitted signal dossier in the previous edition
    const forwardState = mockHistory.forward();
    assert.deepEqual(forwardState, {
      edition: '2026-10-01',
      view: 'expanded',
      signal: 'ECON-20261001-freight-rates',
    });
  });
});
