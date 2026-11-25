import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { isSafeHttpUrl, parseEditionMarkdown } from '../lib/markdown/parseEdition';
import {
  MALFORMED_AND_UNSAFE_EDITION,
  VALID_SYNTHETIC_EDITION,
} from './fixtures/syntheticEdition';

describe('parseEditionMarkdown — synthetic fixtures', () => {
  it('parses a valid edition cleanly with zero errors and structured sections', () => {
    const edition = parseEditionMarkdown(VALID_SYNTHETIC_EDITION, '/editions/2026/10/2026-10-01.md', {
      expectedDate: '2026-10-01',
    });

    assert.equal(edition.validation.isValid, true);
    assert.equal(edition.validation.errors.length, 0);
    assert.equal(edition.frontmatter.edition_date, '2026-10-01');
    assert.equal(edition.signals.length, 3);

    // Executive briefing separates summary and caveats
    assert.match(edition.executiveBriefing.summaryText, /Synthetic summary paragraph/);
    assert.equal(edition.executiveBriefing.caveats.length, 1);
    assert.equal(edition.executiveBriefing.topSignalRefs.length, 2);

    // Signal 1: Reuters + AP original = 2 independent origins (AP syndicated excluded)
    const worldSig = edition.signals[0];
    assert.equal(worldSig.signal_id, 'WORLD-20261001-port-treaty');
    assert.equal(worldSig.independentOriginCount, 2);
    assert.equal(worldSig.sections.timelineEntries.length, 2);
    assert.equal(worldSig.sections.timelineEntries[0].dateLabel, '2026-09-20');
    assert.equal(worldSig.sections.scenarioItems.length, 3);
    assert.equal(worldSig.sections.scenarioItems[0].kind, 'base');
    assert.equal(worldSig.sections.scenarioItems[1].kind, 'downside');
    assert.equal(worldSig.sections.scenarioItems[2].kind, 'upside');

    // Economy signal extracts explicit horizon impacts
    const econSig = edition.signals[2];
    assert.equal(econSig.sections.horizonImpacts.length, 4);

    // Cross-domain synthesis separates established vs unestablished threads
    assert.equal(edition.crossDomainSynthesis.threads.length, 2);
    assert.equal(edition.crossDomainSynthesis.threads[0].isUnestablished, false);
    assert.equal(edition.crossDomainSynthesis.threads[1].isUnestablished, true);

    // Watchlist filters out '—' so no broken signal buttons are generated
    assert.equal(edition.watchlist.rows.length, 2);
    assert.deepEqual(edition.watchlist.rows[0].signalsLinked, ['WORLD-20261001-port-treaty']);
    assert.deepEqual(edition.watchlist.rows[1].signalsLinked, []);
  });

  it('never silently promotes unknown source_class or relationship to Tier-1 / original_reporting', () => {
    const edition = parseEditionMarkdown(
      MALFORMED_AND_UNSAFE_EDITION,
      '/editions/2026/10/2026-10-02.md',
      { expectedDate: '2026-10-02' }
    );

    const sig = edition.signals[0];
    assert.ok(sig);
    const src = sig.sources[0];
    assert.equal(src.source_class, 'unknown');
    assert.equal(src.relationship, 'unknown');
    assert.equal(src.qualifiesAsIndependent, false);
    assert.equal(src.exclusionReason, 'unknown_source_class');
    assert.equal(sig.independentOriginCount, 0);
    assert.equal(edition.independenceSummary.independentOriginCount, 0);

    // Unsafe javascript: URL is flagged and blocked
    assert.equal(src.urlSafe, false);
    assert.ok(edition.validation.errors.some((e) => e.code === 'UNSAFE_SOURCE_URL'));

    // Broken source_id S99 is flagged as an error
    assert.ok(edition.validation.errors.some((e) => e.code === 'BROKEN_SOURCE_REF'));

    // Invalid source_class, relationship, and policy override emit warnings
    assert.ok(edition.validation.warnings.some((w) => w.code === 'INVALID_SOURCE_CLASS'));
    assert.ok(edition.validation.warnings.some((w) => w.code === 'INVALID_SOURCE_RELATIONSHIP'));
    assert.ok(edition.validation.warnings.some((w) => w.code === 'INDEPENDENCE_POLICY_OVERRIDE'));
    assert.ok(edition.validation.warnings.some((w) => w.code === 'BROKEN_RELATED_SIGNAL_REF'));
  });

  it('reports missing frontmatter and missing required sections cleanly without crashing', () => {
    const broken = '# Only One Heading\n\nSome prose.';
    const edition = parseEditionMarkdown(broken, 'broken.md', { isLocalPreview: true });
    assert.equal(edition.validation.isValid, false);
    assert.ok(edition.validation.errors.some((e) => e.code === 'MISSING_FRONTMATTER'));
    assert.ok(edition.validation.errors.some((e) => e.code === 'MISSING_SECTION'));
  });

  it('flags date mismatch between archive path and frontmatter edition_date', () => {
    const edition = parseEditionMarkdown(VALID_SYNTHETIC_EDITION, '/editions/2026/10/2026-10-05.md', {
      expectedDate: '2026-10-05',
    });
    assert.ok(
      edition.validation.warnings.some((w) => w.code === 'EDITION_DATE_PATH_MISMATCH')
    );
  });

  it('enforces strict http/https URL allowlist', () => {
    assert.equal(isSafeHttpUrl('https://www.reuters.com/world'), true);
    assert.equal(isSafeHttpUrl('http://example.com/report'), true);
    assert.equal(isSafeHttpUrl('javascript:alert(1)'), false);
    assert.equal(isSafeHttpUrl('data:text/html,<script>alert(1)</script>'), false);
    assert.equal(isSafeHttpUrl('vbscript:msgbox(1)'), false);
    assert.equal(isSafeHttpUrl('//evil.example/path'), false);
    assert.equal(isSafeHttpUrl(''), false);
  });
});

describe('parseEditionMarkdown — real published edition integration (2026-11-23)', () => {
  it('parses public/editions/2026/11/2026-11-23.md accurately with all 35 signals and derived independence metrics', () => {
    const editionPath = path.resolve(
      process.cwd(),
      'public/editions/2026/11/2026-11-23.md'
    );
    const raw = fs.readFileSync(editionPath, 'utf8');
    const edition = parseEditionMarkdown(raw, '/editions/2026/11/2026-11-23.md', {
      expectedDate: '2026-11-23',
    });

    assert.equal(edition.frontmatter.edition_date, '2026-11-23');
    assert.equal(edition.frontmatter.sync_run, 'evening');
    assert.equal(edition.frontmatter.content_language, 'zh-CN');
    assert.equal(edition.validation.errors.length, 0);

    // Real edition counts
    assert.equal(edition.signals.length, 35);
    assert.equal(edition.executiveBriefing.topSignalRefs.length, 5);
    assert.equal(edition.executiveBriefing.caveats.length, 1);

    // Structured synthesis & personal implications
    assert.ok(edition.crossDomainSynthesis.threads.length >= 5);
    assert.ok(edition.crossDomainSynthesis.threads.some((t) => t.isUnestablished));
    assert.ok(edition.personalImplications.sections.length >= 4);
    assert.ok(edition.personalImplications.disclaimer.length > 0);

    // Watchlist handles Gemini 4 '—' row cleanly
    const geminiRow = edition.watchlist.rows.find((r) =>
      r.indicator.includes('Gemini 4')
    );
    assert.ok(geminiRow);
    assert.deepEqual(geminiRow.signalsLinked, []);

    // Single-engine independent origins match Source Policy rules
    assert.ok(edition.independenceSummary.independentOriginCount >= 3);
    assert.equal(edition.independenceSummary.unknownClassRecords, 0);
    assert.ok(edition.independenceSummary.totalRecords > 90);
  });
});
