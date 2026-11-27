import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseEditionMarkdown } from '../lib/markdown/parseEdition';
import {
  clearAllLocalReaderData,
  createEmptyReaderState,
  evaluateFollowedSignals,
  followSignalInReaderState,
  followTopicInReaderState,
  loadReaderState,
  READER_STATE_STORAGE_KEY,
  READER_STATE_VERSION,
  saveReaderState,
  saveSignalToReaderState,
  type StorageLike,
  unfollowSignalInReaderState,
  unfollowTopicInReaderState,
  unsaveSignalFromReaderState,
  validateAndMigrateReaderState,
} from '../lib/intelligence/reader-state/readerState';
import { VALID_SYNTHETIC_EDITION } from './fixtures/syntheticEdition';
import { SYNTHETIC_FOLLOWUP_EDITION } from './fixtures/dailyDeltaFixtures';

function createMemoryStorage(options?: {
  throwOnSet?: boolean;
}): StorageLike & { store: Map<string, string> } {
  const store = new Map<string, string>();
  return {
    store,
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => {
      if (options?.throwOnSet) {
        throw new Error('QuotaExceededError');
      }
      store.set(key, value);
    },
    removeItem: (key) => {
      store.delete(key);
    },
  };
}

describe('My Intelligence Desk (Reader State) — persistence, migration, recovery, and stable-ID following', () => {
  const ed1 = parseEditionMarkdown(
    VALID_SYNTHETIC_EDITION,
    '/editions/2026/10/2026-10-01.md'
  );
  const ed2 = parseEditionMarkdown(
    SYNTHETIC_FOLLOWUP_EDITION,
    '/editions/2026/10/2026-10-05.md'
  );

  it('saves, unsaves, follows, unfollows, and manages topics cleanly without duplicate IDs', () => {
    let state = createEmptyReaderState();

    state = saveSignalToReaderState(state, {
      signalId: 'WORLD-20261001-port-treaty',
      editionDate: '2026-10-01',
      headline: 'Maritime Corridor Agreement Signed by Eight Nations',
      domain: 'world',
      nowIso: '2026-10-01T12:00:00Z',
    });
    // Saving the same ID again replaces without duplicating
    state = saveSignalToReaderState(state, {
      signalId: 'WORLD-20261001-port-treaty',
      editionDate: '2026-10-05',
      headline: 'Maritime Corridor Agreement Faces Ratification Dispute',
      domain: 'world',
      nowIso: '2026-10-05T12:00:00Z',
    });
    assert.equal(state.savedSignals.length, 1);
    assert.equal(state.savedSignals[0].editionDate, '2026-10-05');

    state = unsaveSignalFromReaderState(state, 'WORLD-20261001-port-treaty');
    assert.equal(state.savedSignals.length, 0);

    state = followSignalInReaderState(state, {
      signalId: 'WORLD-20261001-port-treaty',
      editionDate: '2026-10-01',
      headline: 'Maritime Corridor Agreement Signed by Eight Nations',
      domain: 'world',
    });
    // Duplicate follow is a no-op
    state = followSignalInReaderState(state, {
      signalId: 'WORLD-20261001-port-treaty',
      editionDate: '2026-10-05',
      headline: 'Different headline',
      domain: 'world',
    });
    assert.equal(state.followedSignals.length, 1);

    state = followTopicInReaderState(state, 'trade');
    state = followTopicInReaderState(state, '  TRADE  ');
    assert.deepEqual(state.followedTopics, ['trade']);

    state = unfollowTopicInReaderState(state, 'TRADE');
    assert.equal(state.followedTopics.length, 0);

    state = unfollowSignalInReaderState(state, 'WORLD-20261001-port-treaty');
    assert.equal(state.followedSignals.length, 0);
  });

  it('tracks followed signals by stable signal_id across headline changes and distinguishes omission from resolution', () => {
    let state = createEmptyReaderState();
    state = followSignalInReaderState(state, {
      signalId: 'WORLD-20261001-port-treaty',
      editionDate: '2026-10-01',
      headline: 'Maritime Corridor Agreement Signed by Eight Nations',
      domain: 'world',
    });
    state = followSignalInReaderState(state, {
      signalId: 'ECON-20261001-freight-rates',
      editionDate: '2026-10-01',
      headline: 'Container Freight Rates Surge',
      domain: 'economy',
    });

    const statuses = evaluateFollowedSignals({
      followed: state.followedSignals,
      loadedEditions: [ed1, ed2],
      latestArchiveEditionDate: '2026-10-05',
    });

    const portStatus = statuses.find(
      (s) => s.entry.signalId === 'WORLD-20261001-port-treaty'
    );
    assert.ok(portStatus);
    // Followed headline updated from canonical 2026-10-05 edition even though headline text changed
    assert.equal(
      portStatus.currentHeadline,
      'Maritime Corridor Agreement Faces Ratification Dispute'
    );
    assert.equal(portStatus.latestRevisionKind, 'material_update');
    assert.equal(portStatus.presentInLatestEdition, true);
    assert.equal(portStatus.appearanceCount, 2);

    const freightStatus = statuses.find(
      (s) => s.entry.signalId === 'ECON-20261001-freight-rates'
    );
    assert.ok(freightStatus);
    assert.equal(freightStatus.presentInLatestEdition, false);
    assert.equal(freightStatus.latestAvailableEdition, '2026-10-01');
    assert.notEqual(freightStatus.status, 'closed');
  });

  it('recovers cleanly from corrupt JSON, handles unavailable storage and quota errors, and clears all local data', () => {
    // Unavailable storage
    const unavail = loadReaderState(null);
    assert.equal(unavail.warning, 'storage_unavailable');
    assert.equal(unavail.state.savedSignals.length, 0);

    // Corrupt JSON
    const mem = createMemoryStorage();
    mem.store.set(READER_STATE_STORAGE_KEY, '{corrupt json!!!');
    const recovered = loadReaderState(mem);
    assert.equal(recovered.warning, 'corrupt_state_recovered');
    assert.equal(recovered.state.version, READER_STATE_VERSION);
    assert.equal(mem.store.has(READER_STATE_STORAGE_KEY), false);

    // Quota error on write
    const quotaMem = createMemoryStorage({ throwOnSet: true });
    const saveRes = saveReaderState(createEmptyReaderState(), quotaMem);
    assert.equal(saveRes.ok, false);
    assert.equal(saveRes.warning, 'quota_exceeded');

    // Persist + clear
    const populated = saveSignalToReaderState(createEmptyReaderState(), {
      signalId: 'AI-20261001-eval-standard',
      editionDate: '2026-10-01',
      headline: 'Open Benchmark Consortium Releases Verification Suite',
      domain: 'ai',
    });
    assert.equal(saveReaderState(populated, mem).ok, true);
    const cleared = clearAllLocalReaderData(mem);
    assert.equal(cleared.savedSignals.length, 0);
    assert.equal(mem.store.has(READER_STATE_STORAGE_KEY), false);
  });

  it('migrates legacy v0 reader state and deduplicates invalid or repeated IDs', () => {
    const legacyRaw = {
      version: 0,
      savedSignalIds: [
        'WORLD-20261001-port-treaty',
        'WORLD-20261001-port-treaty',
        'not-a-valid-id',
      ],
      followedSignalIds: ['AI-20261001-eval-standard'],
      followedTopics: ['Trade', 'trade', 'AI Safety'],
    };

    const { state, warning } = validateAndMigrateReaderState(legacyRaw);
    assert.equal(warning, 'migrated_legacy_state');
    assert.equal(state.version, READER_STATE_VERSION);
    assert.equal(state.savedSignals.length, 1);
    assert.equal(state.savedSignals[0].signalId, 'WORLD-20261001-port-treaty');
    assert.equal(state.followedSignals.length, 1);
    assert.deepEqual(state.followedTopics, ['Trade', 'AI Safety']);
  });
});
