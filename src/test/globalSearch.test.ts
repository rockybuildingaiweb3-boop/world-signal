import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { parseEditionMarkdown } from '../lib/markdown/parseEdition';
import {
  clearDerivedSearchCache,
  countActiveGlobalSearchFilters,
  DEFAULT_GLOBAL_SEARCH_FILTERS,
  executeGlobalSearch,
  extractSearchFacets,
  getDerivedSearchCacheSize,
  getOrBuildEditionSearchDocs,
  parseSearchQuery,
} from '../lib/intelligence/search/searchIndex';
import { VALID_SYNTHETIC_EDITION } from './fixtures/syntheticEdition';
import { SYNTHETIC_FOLLOWUP_EDITION } from './fixtures/dailyDeltaFixtures';

const CJK_SYNTHETIC_EDITION = `---
schema_version: 2
edition_date: "2026-10-08"
edition_timezone: "America/Los_Angeles"
edition_title: "WORLD SIGNAL — 中文检索测试版"
edition_status: "published"
content_language: "zh-CN"
generated_at: "2026-10-08T07:00:00-07:00"
updated_at: "2026-10-08T18:00:00-07:00"
sync_run: "evening"
coverage_window_start: "2026-10-08T00:00:00-07:00"
coverage_window_end: "2026-10-08T18:00:00-07:00"
summary: "测试中文子串与中英混合检索。"
---

# Executive Briefing

> **Edition summary:** 测试中文与英文混合检索。

### Top Signals

- **[ECON-20261008-oil-corridor]** — 原油期货与 Brent 航运保费同步上行。

# World Events

> 无新增信号。

# AI Frontier

> 无新增信号。

# Economic Outlook

> 能源与航运跟踪。

## ECON-20261008-oil-corridor — 国际原油突破关键关口且 Brent 航运保费上行

\`\`\`yaml
signal_id: "ECON-20261008-oil-corridor"
domain: "economy"
topic: "能源市场"
importance: 3
status: "developing"
confidence:
  overall: "high"
  rationale: "两家独立机构交叉确认。"
event:
  start_date: "2026-10-08"
  geography: ["中东", "全球"]
published_at: "2026-10-08T08:00:00-07:00"
first_verified_at: "2026-10-08T08:30:00-07:00"
updated_at: "2026-10-08T17:30:00-07:00"
tags: ["原油", "brent", "shipping"]
related_signal_ids: []
claims:
  - claim_id: "ECON-20261008-oil-corridor-C01"
    statement: "布伦特原油期货日内涨幅超过 4%，航运保费同步上调。"
    status: "disputed"
    confidence: "high"
    source_ids: ["S1"]
sources:
  - source_id: "S1"
    outlet: "Financial Times"
    title: "Brent crude climbs on maritime insurance squeeze"
    url: "https://www.ft.com/content/brent-test"
    published_at: "2026-10-08T07:00:00Z"
    accessed_at: "2026-10-08T17:00:00Z"
    source_class: "tier_1_newsroom"
    registry_id: "ft"
    independence_group: "financial_times"
    relationship: "original_reporting"
    count_as_independent: true
    supports_claim_ids: ["ECON-20261008-oil-corridor-C01"]
\`\`\`

### What Happened

国际原油与 Brent 航运保费出现显著波动 [S1]。

### Verified Facts

- 市场报价已由独立财经媒体确认 [S1]。

### Timeline

- 2026-10-08 — 盘中波动扩大。

### Why It Matters

能源成本向通胀预期传导。

### Source Perspectives

FT 报道强调保险附加费变化。

### Analysis

短期供应链弹性承压。

### Uncertainties

- 航线恢复时间尚不明朗。

### Scenarios

- **Base case:** 维持高位震荡。

### What to Watch

- 航运协会保费公告。
`;

describe('Global Intelligence Search — deterministic indexing, matching, filtering, grouping, and cache invalidation', () => {
  const ed1 = parseEditionMarkdown(
    VALID_SYNTHETIC_EDITION,
    '/editions/2026/10/2026-10-01.md'
  );
  const ed2 = parseEditionMarkdown(
    SYNTHETIC_FOLLOWUP_EDITION,
    '/editions/2026/10/2026-10-05.md'
  );
  const ed3 = parseEditionMarkdown(
    CJK_SYNTHETIC_EDITION,
    '/editions/2026/10/2026-10-08.md'
  );

  beforeEach(() => {
    clearDerivedSearchCache();
  });

  function buildAllDocs() {
    return [
      ...getOrBuildEditionSearchDocs(
        ed1,
        '/editions/2026/10/2026-10-01.md',
        ed1.frontmatter.updated_at
      ),
      ...getOrBuildEditionSearchDocs(
        ed2,
        '/editions/2026/10/2026-10-05.md',
        ed2.frontmatter.updated_at
      ),
      ...getOrBuildEditionSearchDocs(
        ed3,
        '/editions/2026/10/2026-10-08.md',
        ed3.frontmatter.updated_at
      ),
    ];
  }

  it('matches exact Signal ID with top priority and groups occurrences across editions', () => {
    const docs = buildAllDocs();
    const results = executeGlobalSearch({
      documents: docs,
      query: 'WORLD-20261001-port-treaty',
      filters: DEFAULT_GLOBAL_SEARCH_FILTERS,
      sortBy: 'relevance',
    });

    assert.equal(results.length, 1);
    assert.equal(results[0].signalId, 'WORLD-20261001-port-treaty');
    assert.equal(results[0].appearanceCount, 2);
    assert.equal(results[0].materialUpdateCount, 1);
    assert.equal(results[0].latestEditionDate, '2026-10-05');
    assert.ok(results[0].matchedFields.includes('signal_id'));
    assert.equal(results[0].occurrences[0].editionDate, '2026-10-05');
    assert.equal(results[0].occurrences[0].hasMaterialUpdateFromPrevious, true);
    assert.equal(results[0].occurrences[1].editionDate, '2026-10-01');
  });

  it('supports partial headline, Chinese substring, mixed CJK/English, and quoted phrase queries', () => {
    const docs = buildAllDocs();

    // Partial English headline (case-insensitive)
    const headlineMatches = executeGlobalSearch({
      documents: docs,
      query: 'ratification dispute',
      filters: DEFAULT_GLOBAL_SEARCH_FILTERS,
      sortBy: 'relevance',
    });
    assert.equal(headlineMatches.length, 1);
    assert.equal(headlineMatches[0].signalId, 'WORLD-20261001-port-treaty');

    // Chinese substring without spaces
    const cjkMatches = executeGlobalSearch({
      documents: docs,
      query: '原油',
      filters: DEFAULT_GLOBAL_SEARCH_FILTERS,
      sortBy: 'relevance',
    });
    assert.equal(cjkMatches.length, 1);
    assert.equal(cjkMatches[0].signalId, 'ECON-20261008-oil-corridor');

    // Mixed CJK + English multi-term
    const mixedMatches = executeGlobalSearch({
      documents: docs,
      query: '原油 Brent',
      filters: DEFAULT_GLOBAL_SEARCH_FILTERS,
      sortBy: 'relevance',
    });
    assert.equal(mixedMatches.length, 1);
    assert.equal(mixedMatches[0].signalId, 'ECON-20261008-oil-corridor');

    // Quoted exact phrase
    const parsed = parseSearchQuery('"hyperscale power" grid');
    assert.deepEqual(parsed.phrases, ['hyperscale power']);
    assert.deepEqual(parsed.terms, ['grid']);
    const phraseMatches = executeGlobalSearch({
      documents: docs,
      query: '"hyperscale power" grid',
      filters: DEFAULT_GLOBAL_SEARCH_FILTERS,
      sortBy: 'relevance',
    });
    assert.equal(phraseMatches.length, 1);
    assert.equal(phraseMatches[0].signalId, 'AI-20261005-compute-compact');
  });

  it('matches claim statements and source outlets deterministically', () => {
    const docs = buildAllDocs();

    const claimMatch = executeGlobalSearch({
      documents: docs,
      query: 'clusters above 100 MW',
      filters: DEFAULT_GLOBAL_SEARCH_FILTERS,
      sortBy: 'relevance',
    });
    assert.equal(claimMatch.length, 1);
    assert.equal(claimMatch[0].signalId, 'AI-20261005-compute-compact');
    assert.ok(claimMatch[0].matchedFields.includes('claim_statement'));

    const outletMatch = executeGlobalSearch({
      documents: docs,
      query: 'Financial Times',
      filters: DEFAULT_GLOBAL_SEARCH_FILTERS,
      sortBy: 'relevance',
    });
    assert.equal(outletMatch.length, 2);
    assert.ok(outletMatch.some((m) => m.signalId === 'ECON-20261008-oil-corridor'));
    assert.ok(outletMatch.some((m) => m.signalId === 'ECON-20261001-freight-rates'));
    assert.ok(outletMatch.every((m) => m.matchedFields.includes('source_outlet')));
  });

  it('applies domain, date range, importance, confidence, claim status, and publisher filters accurately', () => {
    const docs = buildAllDocs();

    const byDomainAndDate = executeGlobalSearch({
      documents: docs,
      query: '',
      filters: {
        ...DEFAULT_GLOBAL_SEARCH_FILTERS,
        domain: 'ai',
        dateFrom: '2026-10-05',
        dateTo: '2026-10-05',
      },
      sortBy: 'latest',
    });
    assert.equal(byDomainAndDate.length, 2);
    assert.ok(byDomainAndDate.every((r) => r.domain === 'ai'));

    const byClaimStatus = executeGlobalSearch({
      documents: docs,
      query: '',
      filters: {
        ...DEFAULT_GLOBAL_SEARCH_FILTERS,
        claimStatus: 'disputed',
      },
      sortBy: 'latest',
    });
    assert.equal(byClaimStatus.length, 1);
    assert.equal(byClaimStatus[0].signalId, 'ECON-20261008-oil-corridor');

    const byPublisher = executeGlobalSearch({
      documents: docs,
      query: '',
      filters: {
        ...DEFAULT_GLOBAL_SEARCH_FILTERS,
        publisher: 'Bloomberg',
      },
      sortBy: 'latest',
    });
    assert.equal(byPublisher.length, 1);
    assert.equal(byPublisher[0].signalId, 'WORLD-20261001-port-treaty');

    const byHighConfidenceOnly = executeGlobalSearch({
      documents: docs,
      query: '',
      filters: {
        ...DEFAULT_GLOBAL_SEARCH_FILTERS,
        confidence: 'high',
        minImportance: 3,
      },
      sortBy: 'importance',
    });
    assert.ok(byHighConfidenceOnly.every((r) => r.latestConfidence === 'high'));
    assert.equal(
      countActiveGlobalSearchFilters({
        ...DEFAULT_GLOBAL_SEARCH_FILTERS,
        confidence: 'high',
        minImportance: 3,
      }),
      2
    );
  });

  it('sorts deterministically by Latest, Importance, and Confidence separately without conflating importance and confidence', () => {
    const docs = buildAllDocs();

    const byImportance = executeGlobalSearch({
      documents: docs,
      query: '',
      filters: DEFAULT_GLOBAL_SEARCH_FILTERS,
      sortBy: 'importance',
    });
    // WORLD-20261001-port-treaty has importance 5 (medium confidence in 2026-10-05)
    assert.equal(byImportance[0].signalId, 'WORLD-20261001-port-treaty');

    const byConfidence = executeGlobalSearch({
      documents: docs,
      query: '',
      filters: DEFAULT_GLOBAL_SEARCH_FILTERS,
      sortBy: 'confidence',
    });
    // ECON-20261008-oil-corridor has high confidence (importance 3) and newest date 2026-10-08
    assert.equal(byConfidence[0].signalId, 'ECON-20261008-oil-corridor');

    const byLatest = executeGlobalSearch({
      documents: docs,
      query: '',
      filters: DEFAULT_GLOBAL_SEARCH_FILTERS,
      sortBy: 'latest',
    });
    assert.equal(byLatest[0].latestEditionDate, '2026-10-08');
  });

  it('invalidates cached derived search documents when an edition updated_at revision changes', () => {
    const firstDocs = getOrBuildEditionSearchDocs(
      ed1,
      '/editions/2026/10/2026-10-01.md',
      '2026-10-01T10:00:00-07:00'
    );
    assert.equal(getDerivedSearchCacheSize(), 1);

    // Same revision returns exact cached reference
    const cachedAgain = getOrBuildEditionSearchDocs(
      ed1,
      '/editions/2026/10/2026-10-01.md',
      '2026-10-01T10:00:00-07:00'
    );
    assert.strictEqual(cachedAgain, firstDocs);

    // Updated revision (same-day Muse update) invalidates and rebuilds docs
    const updatedEdition = parseEditionMarkdown(
      VALID_SYNTHETIC_EDITION.replace(
        'Maritime Corridor Agreement Signed',
        'Maritime Corridor Agreement Revised in Evening Sync'
      ),
      '/editions/2026/10/2026-10-01.md'
    );
    const rebuiltDocs = getOrBuildEditionSearchDocs(
      updatedEdition,
      '/editions/2026/10/2026-10-01.md',
      '2026-10-01T18:30:00-07:00'
    );
    assert.notStrictEqual(rebuiltDocs, firstDocs);
    assert.equal(getDerivedSearchCacheSize(), 1);
    assert.ok(
      rebuiltDocs.some((d) =>
        d.headline.includes('Revised in Evening Sync')
      )
    );

    const facets = extractSearchFacets(rebuiltDocs);
    assert.ok(facets.topics.length > 0);
    assert.ok(facets.publishers.length > 0);
  });
});
