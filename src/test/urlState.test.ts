import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildUrlSearch,
  type HistoryAdapter,
  parseUrlState,
  syncUrlState,
} from '../lib/navigation/urlState';

function createMockHistory(initialSearch = ''): {
  adapter: HistoryAdapter;
  stack: string[];
  index: () => number;
  back: () => string;
  forward: () => string;
} {
  const stack = [`/${initialSearch}`];
  let idx = 0;

  const currentParts = () => {
    const raw = stack[idx];
    const qIdx = raw.indexOf('?');
    if (qIdx === -1) return { pathname: raw, search: '', hash: '' };
    return {
      pathname: raw.slice(0, qIdx),
      search: raw.slice(qIdx),
      hash: '',
    };
  };

  return {
    stack,
    index: () => idx,
    back: () => {
      if (idx > 0) idx -= 1;
      return currentParts().search;
    },
    forward: () => {
      if (idx < stack.length - 1) idx += 1;
      return currentParts().search;
    },
    adapter: {
      getPathname: () => currentParts().pathname,
      getSearch: () => currentParts().search,
      getHash: () => currentParts().hash,
      pushState: (url: string) => {
        stack.splice(idx + 1);
        stack.push(url);
        idx = stack.length - 1;
      },
      replaceState: (url: string) => {
        stack[idx] = url;
      },
    },
  };
}

describe('urlState — parsing, serialization, and history navigation', () => {
  it('parses valid edition, view, and signal deep-link parameters', () => {
    const state = parseUrlState(
      '?edition=2026-11-23&view=expanded&signal=WORLD-20261123-global-trade'
    );
    assert.deepEqual(state, {
      edition: '2026-11-23',
      view: 'expanded',
      signal: 'WORLD-20261123-global-trade',
    });
  });

  it('infers expanded view when a valid deep-linked signal is supplied without an explicit view', () => {
    const state = parseUrlState('?edition=2026-11-23&signal=AI-20261123-frontier-model');
    assert.deepEqual(state, {
      edition: '2026-11-23',
      view: 'expanded',
      signal: 'AI-20261123-frontier-model',
    });
  });

  it('rejects invalid view, edition date, and signal ID parameters safely', () => {
    const state = parseUrlState(
      '?edition=../../etc/passwd&view=admin&signal=<script>alert(1)</script>'
    );
    assert.deepEqual(state, {
      edition: null,
      view: 'briefing',
      signal: null,
    });
  });

  it('drops signal param when view is not expanded', () => {
    const state = parseUrlState(
      '?edition=2026-11-23&view=audit&signal=WORLD-20261123-global-trade'
    );
    assert.deepEqual(state, {
      edition: '2026-11-23',
      view: 'audit',
      signal: null,
    });
  });

  it('omits public edition and signal parameters during local Markdown preview', () => {
    const searchBriefing = buildUrlSearch(
      {
        edition: '2026-11-23',
        view: 'briefing',
        signal: 'WORLD-20261123-global-trade',
      },
      { isLocalPreview: true }
    );
    assert.equal(searchBriefing, '');

    const searchAudit = buildUrlSearch(
      {
        edition: '2026-11-23',
        view: 'audit',
        signal: null,
      },
      { isLocalPreview: true }
    );
    assert.equal(searchAudit, '?view=audit');
  });

  it('pushes distinct history entries on navigation, suppresses duplicates, and restores state on back/forward', () => {
    const mock = createMockHistory('');

    // Initial hydration normalizes with replace (does not add a second stack entry)
    const hydrated = syncUrlState(
      { edition: '2026-11-23', view: 'briefing', signal: null },
      'replace',
      { adapter: mock.adapter }
    );
    assert.equal(hydrated, true);
    assert.equal(mock.stack.length, 1);
    assert.equal(mock.stack[0], '/?edition=2026-11-23');

    // Duplicate sync is suppressed
    const dup = syncUrlState(
      { edition: '2026-11-23', view: 'briefing', signal: null },
      'push',
      { adapter: mock.adapter }
    );
    assert.equal(dup, false);
    assert.equal(mock.stack.length, 1);

    // User opens a signal -> pushes deep-link history entry
    const pushedSignal = syncUrlState(
      {
        edition: '2026-11-23',
        view: 'expanded',
        signal: 'WORLD-20261123-trade-shift',
      },
      'push',
      { adapter: mock.adapter }
    );
    assert.equal(pushedSignal, true);
    assert.equal(mock.stack.length, 2);

    // User switches to Audit view -> pushes another entry
    syncUrlState(
      { edition: '2026-11-23', view: 'audit', signal: null },
      'push',
      { adapter: mock.adapter }
    );
    assert.equal(mock.stack.length, 3);

    // Browser Back restores Expanded signal deep link
    const back1 = parseUrlState(mock.back());
    assert.deepEqual(back1, {
      edition: '2026-11-23',
      view: 'expanded',
      signal: 'WORLD-20261123-trade-shift',
    });

    // Browser Back again restores Briefing
    const back2 = parseUrlState(mock.back());
    assert.deepEqual(back2, {
      edition: '2026-11-23',
      view: 'briefing',
      signal: null,
    });

    // Browser Forward restores Expanded signal deep link
    const fwd = parseUrlState(mock.forward());
    assert.deepEqual(fwd, {
      edition: '2026-11-23',
      view: 'expanded',
      signal: 'WORLD-20261123-trade-shift',
    });
  });
});
