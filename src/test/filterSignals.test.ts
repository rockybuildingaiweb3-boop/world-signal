import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseEditionMarkdown } from '../lib/markdown/parseEdition';
import {
  countActiveFilters,
  DEFAULT_FILTERS,
  extractUniqueTags,
  extractUniqueTopics,
  filterSignals,
} from '../lib/filtering/filterSignals';
import { VALID_SYNTHETIC_EDITION } from './fixtures/syntheticEdition';

describe('filterSignals — end-to-end filtering including topic, tag, sourceClass, and search', () => {
  const edition = parseEditionMarkdown(VALID_SYNTHETIC_EDITION, '/editions/2026/10/2026-10-01.md');
  const signals = edition.signals;

  it('returns all signals under DEFAULT_FILTERS with 0 active filters', () => {
    assert.equal(countActiveFilters(DEFAULT_FILTERS), 0);
    assert.equal(filterSignals(signals, DEFAULT_FILTERS).length, 3);
  });

  it('filters accurately by topic', () => {
    const topics = extractUniqueTopics(signals);
    assert.deepEqual(topics, ['evaluation', 'inflation', 'trade']);

    const tradeOnly = filterSignals(signals, { ...DEFAULT_FILTERS, topic: 'trade' });
    assert.equal(tradeOnly.length, 1);
    assert.equal(tradeOnly[0].signal_id, 'WORLD-20261001-port-treaty');
    assert.equal(countActiveFilters({ ...DEFAULT_FILTERS, topic: 'trade' }), 1);
  });

  it('filters accurately by domain, importance, confidence, status, tag, and sourceClass', () => {
    assert.equal(
      filterSignals(signals, { ...DEFAULT_FILTERS, domain: 'ai' }).length,
      1
    );
    assert.equal(
      filterSignals(signals, { ...DEFAULT_FILTERS, minImportance: 4 }).length,
      2
    );
    assert.equal(
      filterSignals(signals, { ...DEFAULT_FILTERS, confidence: 'high' }).length,
      1
    );
    assert.equal(
      filterSignals(signals, { ...DEFAULT_FILTERS, status: 'developing' }).length,
      1
    );
    assert.equal(
      filterSignals(signals, { ...DEFAULT_FILTERS, tag: 'shipping' }).length,
      2
    );
    assert.equal(
      filterSignals(signals, { ...DEFAULT_FILTERS, sourceClass: 'primary_source' }).length,
      1
    );
    assert.ok(extractUniqueTags(signals).includes('shipping'));
  });

  it('supports case-insensitive full-text search across headlines, claims, and outlets', () => {
    const byOutlet = filterSignals(signals, { ...DEFAULT_FILTERS, query: 'financial times' });
    assert.equal(byOutlet.length, 1);
    assert.equal(byOutlet[0].signal_id, 'ECON-20261001-freight-rates');

    const byClaim = filterSignals(signals, { ...DEFAULT_FILTERS, query: '12 reproducible' });
    assert.equal(byClaim.length, 1);
    assert.equal(byClaim[0].signal_id, 'AI-20261001-eval-standard');
  });
});
