import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  ArchivePathError,
  clearEditionCache,
  fetchAndParseEdition,
  fetchEditionsIndex,
  validateEditionPath,
} from '../lib/content/editionClient';
import { VALID_SYNTHETIC_EDITION } from './fixtures/syntheticEdition';

describe('validateEditionPath — strict archive path hardening', () => {
  it('accepts canonical local edition paths', () => {
    const res = validateEditionPath('/editions/2026/11/2026-11-23.md');
    assert.equal(res.normalizedPath, '/editions/2026/11/2026-11-23.md');
    assert.equal(res.pathDate, '2026-11-23');

    const resNoSlash = validateEditionPath('editions/2026/11/2026-11-23.md');
    assert.equal(resNoSlash.normalizedPath, '/editions/2026/11/2026-11-23.md');
  });

  it('rejects external URLs, protocol-relative URLs, traversal, backslashes, queries, and mismatched folders', () => {
    const invalidPaths = [
      'https://evil.example/editions/2026/11/2026-11-23.md',
      'http://localhost/editions/2026/11/2026-11-23.md',
      '//evil.example/editions/2026/11/2026-11-23.md',
      '/editions/2026/11/../../etc/passwd',
      '/editions/2026/11/%2e%2e/secret.md',
      '/editions\\2026\\11\\2026-11-23.md',
      '/editions/2026/11/2026-11-23.md?foo=bar',
      '/editions/2026/11/2026-11-23.md#hash',
      '/editions/2026/10/2026-11-23.md', // folder month mismatch
      '/editions/2026/02/2026-02-30.md', // impossible calendar date
      '/other/2026/11/2026-11-23.md',
      'javascript:alert(1)',
      '',
    ];

    for (const bad of invalidPaths) {
      assert.throws(() => validateEditionPath(bad), ArchivePathError, `Should reject ${bad}`);
    }
  });
});

describe('editionClient — revision-aware cache & empty archive handling', () => {
  beforeEach(() => {
    clearEditionCache();
  });

  it('invalidates cached same-day edition when updated_at revision changes', async () => {
    let fetchCount = 0;
    const mockFetch: typeof fetch = async () => {
      fetchCount += 1;
      const body = VALID_SYNTHETIC_EDITION.replace(
        'updated_at: "2026-10-01T14:00:00-07:00"',
        fetchCount === 1
          ? 'updated_at: "2026-10-01T08:00:00-07:00"'
          : 'updated_at: "2026-10-01T18:30:00-07:00"'
      );
      return new Response(body, { status: 200 });
    };

    const path = '/editions/2026/10/2026-10-01.md';

    // First load (morning revision)
    const morning = await fetchAndParseEdition(path, {
      revisionKey: '2026-10-01T08:00:00-07:00',
      fetchImpl: mockFetch,
    });
    assert.equal(fetchCount, 1);
    assert.equal(morning.frontmatter.updated_at, '2026-10-01T08:00:00-07:00');

    // Second load with same revisionKey hits cache
    const cached = await fetchAndParseEdition(path, {
      revisionKey: '2026-10-01T08:00:00-07:00',
      fetchImpl: mockFetch,
    });
    assert.equal(fetchCount, 1);
    assert.equal(cached.frontmatter.updated_at, '2026-10-01T08:00:00-07:00');

    // Third load with evening revisionKey re-fetches same path cleanly
    const evening = await fetchAndParseEdition(path, {
      revisionKey: '2026-10-01T18:30:00-07:00',
      fetchImpl: mockFetch,
    });
    assert.equal(fetchCount, 2);
    assert.equal(evening.frontmatter.updated_at, '2026-10-01T18:30:00-07:00');
  });

  it('rejects an index entry whose declared date does not match the Markdown path', async () => {
    const mismatchFetch: typeof fetch = async () =>
      new Response(
        JSON.stringify({
          schema_version: 1,
          latest_edition: '2026-10-02',
          generated_at: '2026-10-02T00:00:00Z',
          editions: [{
            date: '2026-10-02',
            title: 'Mismatched entry',
            path: '/editions/2026/10/2026-10-01.md',
            updated_at: '2026-10-02T00:00:00Z',
            status: 'published',
            language: 'en',
            summary: 'Must not be selected',
          }],
        }),
        { status: 200 }
      );

    const idx = await fetchEditionsIndex({ fetchImpl: mismatchFetch });
    assert.equal(idx.editions.length, 0);
    assert.equal(idx.latest_edition, null);
  });

  it('handles empty archive index and filters out malformed index paths', async () => {
    const emptyFetch: typeof fetch = async () =>
      new Response(
        JSON.stringify({
          schema_version: 1,
          latest_edition: null,
          generated_at: '2026-10-01T00:00:00Z',
          editions: [
            {
              date: '2026-10-01',
              title: 'Malicious',
              path: 'https://evil.example/pwn.md',
              updated_at: '2026-10-01T00:00:00Z',
              status: 'draft',
              language: 'en',
              summary: 'Should be rejected',
            },
          ],
        }),
        { status: 200 }
      );

    const idx = await fetchEditionsIndex({ fetchImpl: emptyFetch });
    assert.equal(idx.latest_edition, null);
    assert.equal(idx.editions.length, 0);
  });
});
