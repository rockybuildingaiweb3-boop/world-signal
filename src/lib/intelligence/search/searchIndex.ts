import type {
  ClaimStatus,
  ConfidenceLevel,
  EditionStatus,
  ParsedEdition,
  ParsedSignal,
  SignalDomain,
  SignalStatus,
} from '../../../types/edition';
import { compareSignalSnapshots, type SignalChangeReason } from '../edition-diff/compareEditions';

export interface SearchClaimIndexItem {
  claimId: string;
  statement: string;
  status: ClaimStatus;
  confidence: ConfidenceLevel;
}

export interface SearchSourceIndexItem {
  sourceId: string;
  outlet: string;
  title: string;
  independenceGroup: string;
}

/**
 * Deterministic, derived search document representing one signal snapshot
 * inside a specific canonical Markdown edition. Never a canonical database.
 */
export interface SearchDocument {
  docKey: string;
  editionPath: string;
  editionUpdatedAt: string;
  editionDate: string;
  editionTitle: string;
  editionStatus: EditionStatus;
  signalId: string;
  headline: string;
  domain: SignalDomain;
  topic: string;
  tags: string[];
  eventGeography: string[];
  eventStartDate: string;
  eventEndDate?: string;
  importance: 1 | 2 | 3 | 4 | 5;
  confidence: ConfidenceLevel;
  status: SignalStatus;
  claims: SearchClaimIndexItem[];
  sources: SearchSourceIndexItem[];
  narrativeExcerpt: string;
  searchableText: string;
  signalRef: ParsedSignal;
}

export type GlobalSearchSortBy =
  | 'relevance'
  | 'latest'
  | 'importance'
  | 'confidence';

export interface GlobalSearchFilters {
  domain: SignalDomain | 'all';
  dateFrom: string;
  dateTo: string;
  minImportance: number;
  confidence: ConfidenceLevel | 'all';
  status: SignalStatus | 'all';
  topic: string;
  tag: string;
  claimStatus: ClaimStatus | 'all';
  publisher: string;
}

export const DEFAULT_GLOBAL_SEARCH_FILTERS: GlobalSearchFilters = {
  domain: 'all',
  dateFrom: '',
  dateTo: '',
  minImportance: 1,
  confidence: 'all',
  status: 'all',
  topic: 'all',
  tag: 'all',
  claimStatus: 'all',
  publisher: '',
};

export type SearchMatchField =
  | 'signal_id'
  | 'headline'
  | 'topic'
  | 'tags'
  | 'geography'
  | 'claim_id'
  | 'claim_statement'
  | 'source_outlet'
  | 'source_title'
  | 'source_group'
  | 'edition'
  | 'event_date'
  | 'narrative';

export interface SearchOccurrenceMatch {
  editionDate: string;
  editionTitle: string;
  editionStatus: EditionStatus;
  headline: string;
  importance: 1 | 2 | 3 | 4 | 5;
  confidence: ConfidenceLevel;
  status: SignalStatus;
  matchedFields: SearchMatchField[];
  excerpt: string;
  score: number;
  hasMaterialUpdateFromPrevious: boolean;
  updateReasons: SignalChangeReason[];
}

export interface GroupedSearchResult {
  signalId: string;
  latestHeadline: string;
  domain: SignalDomain;
  topic: string;
  tags: string[];
  latestEditionDate: string;
  latestImportance: 1 | 2 | 3 | 4 | 5;
  latestConfidence: ConfidenceLevel;
  latestStatus: SignalStatus;
  appearanceCount: number;
  materialUpdateCount: number;
  bestScore: number;
  matchedFields: SearchMatchField[];
  excerpt: string;
  occurrences: SearchOccurrenceMatch[];
}

export interface ParsedSearchQuery {
  raw: string;
  normalized: string;
  phrases: string[];
  terms: string[];
  isEmpty: boolean;
}

interface CachedEditionSearchDocs {
  revisionKey: string;
  docs: SearchDocument[];
}

const derivedSearchDocCache = new Map<string, CachedEditionSearchDocs>();

export function clearDerivedSearchCache(): void {
  derivedSearchDocCache.clear();
}

export function getDerivedSearchCacheSize(): number {
  return derivedSearchDocCache.size;
}

export function normalizeSearchText(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

/**
 * Parses an input query into quoted exact phrases and individual search terms.
 * Handles English whitespace tokens, Chinese substrings without spaces,
 * and mixed Chinese/English queries deterministically.
 */
export function parseSearchQuery(rawQuery: string): ParsedSearchQuery {
  const normalized = normalizeSearchText(rawQuery);
  if (!normalized) {
    return {
      raw: rawQuery,
      normalized: '',
      phrases: [],
      terms: [],
      isEmpty: true,
    };
  }

  const phrases: string[] = [];
  const remainder = normalized.replace(/"([^"]+)"|“([^”]+)”/g, (_, p1, p2) => {
    const phrase = normalizeSearchText(String(p1 ?? p2 ?? ''));
    if (phrase) phrases.push(phrase);
    return ' ';
  });

  const rawTokens = remainder
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);

  // Split mixed CJK + Latin tokens only when adjacent if helpful? No — keep exact token intact
  // so mixed tokens like "GPT-6.2" or "COP31崩溃" match naturally, and also handle multi-term queries.
  const terms = Array.from(new Set(rawTokens));

  return {
    raw: rawQuery,
    normalized,
    phrases: Array.from(new Set(phrases)),
    terms,
    isEmpty: phrases.length === 0 && terms.length === 0,
  };
}

/**
 * Builds derived SearchDocuments for a parsed edition and caches them by
 * `(editionPath, updated_at)`. Automatically invalidates when `updated_at` changes.
 */
export function getOrBuildEditionSearchDocs(
  edition: ParsedEdition,
  editionPath: string,
  revisionKey: string
): SearchDocument[] {
  const normalizedPath = editionPath.trim();
  const rev = revisionKey.trim() || edition.frontmatter.updated_at || 'unversioned';
  const existing = derivedSearchDocCache.get(normalizedPath);
  if (existing && existing.revisionKey === rev) {
    return existing.docs;
  }

  const docs = buildEditionSearchDocs(edition, normalizedPath, rev);
  derivedSearchDocCache.set(normalizedPath, { revisionKey: rev, docs });
  return docs;
}

export function buildEditionSearchDocs(
  edition: ParsedEdition,
  editionPath: string,
  revisionKey: string
): SearchDocument[] {
  const { edition_date, edition_title, edition_status } = edition.frontmatter;

  return edition.signals.map((signal) => {
    const claims: SearchClaimIndexItem[] = signal.claims.map((claim) => ({
      claimId: claim.claim_id,
      statement: claim.statement,
      status: claim.status,
      confidence: claim.confidence,
    }));

    const sources: SearchSourceIndexItem[] = signal.sources.map((source) => ({
      sourceId: source.source_id,
      outlet: source.outlet,
      title: source.title,
      independenceGroup: source.independence_group,
    }));

    const narrativeParts = [
      signal.sections.whatHappened,
      signal.sections.verifiedFacts,
      signal.sections.whyItMatters,
      signal.sections.analysis,
    ]
      .map((part) => part.trim())
      .filter(Boolean);

    const narrativeExcerpt = narrativeParts[0]?.slice(0, 260) ?? '';

    const searchableText = normalizeSearchText(
      [
        signal.signal_id,
        signal.headline,
        signal.domain,
        signal.topic,
        signal.status,
        signal.tags.join(' '),
        signal.event.geography.join(' '),
        signal.event.start_date,
        signal.event.end_date ?? '',
        edition_date,
        edition_title,
        edition_status,
        claims.map((c) => `${c.claimId} ${c.statement} ${c.status} ${c.confidence}`).join(' '),
        sources
          .map((s) => `${s.sourceId} ${s.outlet} ${s.title} ${s.independenceGroup}`)
          .join(' '),
        narrativeParts.join(' '),
      ].join(' ')
    );

    return {
      docKey: `${edition_date}::${signal.signal_id}`,
      editionPath,
      editionUpdatedAt: revisionKey,
      editionDate: edition_date,
      editionTitle: edition_title,
      editionStatus: edition_status,
      signalId: signal.signal_id,
      headline: signal.headline,
      domain: signal.domain,
      topic: signal.topic,
      tags: [...signal.tags],
      eventGeography: [...signal.event.geography],
      eventStartDate: signal.event.start_date,
      eventEndDate: signal.event.end_date,
      importance: signal.importance,
      confidence: signal.confidence.overall,
      status: signal.status,
      claims,
      sources,
      narrativeExcerpt,
      searchableText,
      signalRef: signal,
    };
  });
}

export function countActiveGlobalSearchFilters(filters: GlobalSearchFilters): number {
  let count = 0;
  if (filters.domain !== 'all') count += 1;
  if (filters.dateFrom.trim()) count += 1;
  if (filters.dateTo.trim()) count += 1;
  if (filters.minImportance > 1) count += 1;
  if (filters.confidence !== 'all') count += 1;
  if (filters.status !== 'all') count += 1;
  if (filters.topic !== 'all') count += 1;
  if (filters.tag !== 'all') count += 1;
  if (filters.claimStatus !== 'all') count += 1;
  if (filters.publisher.trim()) count += 1;
  return count;
}

function matchesFilters(doc: SearchDocument, filters: GlobalSearchFilters): boolean {
  if (filters.domain !== 'all' && doc.domain !== filters.domain) {
    return false;
  }
  if (filters.dateFrom.trim() && doc.editionDate < filters.dateFrom.trim()) {
    return false;
  }
  if (filters.dateTo.trim() && doc.editionDate > filters.dateTo.trim()) {
    return false;
  }
  if (doc.importance < filters.minImportance) {
    return false;
  }
  if (filters.confidence !== 'all' && doc.confidence !== filters.confidence) {
    return false;
  }
  if (filters.status !== 'all' && doc.status !== filters.status) {
    return false;
  }
  if (
    filters.topic !== 'all' &&
    normalizeSearchText(doc.topic) !== normalizeSearchText(filters.topic)
  ) {
    return false;
  }
  if (
    filters.tag !== 'all' &&
    !doc.tags.some((t) => normalizeSearchText(t) === normalizeSearchText(filters.tag))
  ) {
    return false;
  }
  if (
    filters.claimStatus !== 'all' &&
    !doc.claims.some((c) => c.status === filters.claimStatus)
  ) {
    return false;
  }
  if (filters.publisher.trim()) {
    const pubNeedle = normalizeSearchText(filters.publisher);
    const hasPub = doc.sources.some(
      (s) =>
        normalizeSearchText(s.outlet).includes(pubNeedle) ||
        normalizeSearchText(s.independenceGroup).includes(pubNeedle) ||
        normalizeSearchText(s.sourceId).includes(pubNeedle)
    );
    if (!hasPub) return false;
  }
  return true;
}

function extractExcerptAround(text: string, needle: string, maxLen = 180): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return '';
  if (!needle) return clean.length > maxLen ? `${clean.slice(0, maxLen).trim()}…` : clean;
  const idx = clean.toLowerCase().indexOf(needle.toLowerCase());
  if (idx === -1) {
    return clean.length > maxLen ? `${clean.slice(0, maxLen).trim()}…` : clean;
  }
  const start = Math.max(0, idx - 48);
  const end = Math.min(clean.length, idx + needle.length + 110);
  const prefix = start > 0 ? '…' : '';
  const suffix = end < clean.length ? '…' : '';
  return `${prefix}${clean.slice(start, end).trim()}${suffix}`;
}

function evaluateDocumentMatch(
  doc: SearchDocument,
  parsedQuery: ParsedSearchQuery
): { matched: boolean; score: number; matchedFields: SearchMatchField[]; excerpt: string } {
  if (parsedQuery.isEmpty) {
    return {
      matched: true,
      score: 0,
      matchedFields: [],
      excerpt: extractExcerptAround(doc.narrativeExcerpt || doc.headline, ''),
    };
  }

  const allNeedles = [...parsedQuery.phrases, ...parsedQuery.terms];

  // Every phrase and term must appear somewhere in the document's searchable text
  for (const needle of allNeedles) {
    if (!doc.searchableText.includes(needle)) {
      return { matched: false, score: 0, matchedFields: [], excerpt: '' };
    }
  }

  let score = 0;
  const matchedFields: SearchMatchField[] = [];
  const addField = (field: SearchMatchField) => {
    if (!matchedFields.includes(field)) matchedFields.push(field);
  };

  const lowerId = doc.signalId.toLowerCase();
  const lowerHeadline = doc.headline.toLowerCase();
  const lowerTopic = doc.topic.toLowerCase();
  const lowerTags = doc.tags.map((t) => t.toLowerCase());
  const lowerGeo = doc.eventGeography.map((g) => g.toLowerCase());
  const lowerEdition = `${doc.editionDate} ${doc.editionTitle} ${doc.editionStatus}`.toLowerCase();
  const lowerEventDate = `${doc.eventStartDate} ${doc.eventEndDate ?? ''}`.toLowerCase();

  let bestExcerpt = '';

  // Exact Signal ID match gets highest deterministic priority
  if (lowerId === parsedQuery.normalized) {
    score += 200;
    addField('signal_id');
  }

  for (const needle of allNeedles) {
    if (lowerId.includes(needle)) {
      score += 120;
      addField('signal_id');
    }
    if (lowerHeadline.includes(needle)) {
      score += 80;
      addField('headline');
      if (!bestExcerpt) bestExcerpt = doc.headline;
    }
    if (lowerTopic.includes(needle)) {
      score += 36;
      addField('topic');
    }
    if (lowerTags.some((t) => t.includes(needle))) {
      score += 32;
      addField('tags');
    }
    if (lowerGeo.some((g) => g.includes(needle))) {
      score += 28;
      addField('geography');
    }
    if (lowerEventDate.includes(needle)) {
      score += 20;
      addField('event_date');
    }
    if (lowerEdition.includes(needle)) {
      score += 18;
      addField('edition');
    }

    for (const claim of doc.claims) {
      if (claim.claimId.toLowerCase().includes(needle)) {
        score += 75;
        addField('claim_id');
        if (!bestExcerpt) bestExcerpt = `${claim.claimId}: ${claim.statement}`;
      }
      if (claim.statement.toLowerCase().includes(needle)) {
        score += 48;
        addField('claim_statement');
        if (!bestExcerpt) {
          bestExcerpt = extractExcerptAround(claim.statement, needle);
        }
      }
    }

    for (const source of doc.sources) {
      if (
        source.sourceId.toLowerCase().includes(needle) ||
        source.outlet.toLowerCase().includes(needle)
      ) {
        score += 42;
        addField('source_outlet');
        if (!bestExcerpt) {
          bestExcerpt = `${source.outlet} — ${source.title}`;
        }
      }
      if (source.title.toLowerCase().includes(needle)) {
        score += 34;
        addField('source_title');
        if (!bestExcerpt) {
          bestExcerpt = `${source.outlet} — ${extractExcerptAround(source.title, needle)}`;
        }
      }
      if (source.independenceGroup.toLowerCase().includes(needle)) {
        score += 24;
        addField('source_group');
      }
    }

    if (doc.narrativeExcerpt.toLowerCase().includes(needle)) {
      score += 16;
      addField('narrative');
      if (!bestExcerpt) {
        bestExcerpt = extractExcerptAround(doc.narrativeExcerpt, needle);
      }
    }
  }

  // Exact full-query substring match bonus in headline
  if (parsedQuery.normalized.length > 1 && lowerHeadline.includes(parsedQuery.normalized)) {
    score += 45;
  }

  if (!bestExcerpt) {
    bestExcerpt = extractExcerptAround(
      doc.narrativeExcerpt || doc.claims[0]?.statement || doc.headline,
      allNeedles[0] ?? ''
    );
  }

  return {
    matched: true,
    score,
    matchedFields,
    excerpt: bestExcerpt,
  };
}

const CONFIDENCE_RANK: Record<ConfidenceLevel, number> = {
  high: 4,
  medium: 3,
  low: 2,
  unverified: 1,
};

/**
 * Deterministically searches, filters, groups by stable `signal_id`,
 * detects material updates across consecutive matching editions using
 * `compareSignalSnapshots()`, and ranks results.
 */
export function executeGlobalSearch(params: {
  documents: readonly SearchDocument[];
  query: string;
  filters: GlobalSearchFilters;
  sortBy: GlobalSearchSortBy;
}): GroupedSearchResult[] {
  const parsedQuery = parseSearchQuery(params.query);

  // Group matched documents by stable signal_id
  const grouped = new Map<
    string,
    Array<{
      doc: SearchDocument;
      score: number;
      matchedFields: SearchMatchField[];
      excerpt: string;
    }>
  >();

  for (const doc of params.documents) {
    if (!matchesFilters(doc, params.filters)) continue;
    const evaluation = evaluateDocumentMatch(doc, parsedQuery);
    if (!evaluation.matched) continue;

    const bucket = grouped.get(doc.signalId) ?? [];
    bucket.push({
      doc,
      score: evaluation.score,
      matchedFields: evaluation.matchedFields,
      excerpt: evaluation.excerpt,
    });
    grouped.set(doc.signalId, bucket);
  }

  const results: GroupedSearchResult[] = [];

  for (const [signalId, entries] of grouped) {
    // Deduplicate same editionDate if ever duplicated, then order chronologically oldest -> newest
    const byDate = new Map<string, (typeof entries)[number]>();
    for (const entry of entries) {
      if (!byDate.has(entry.doc.editionDate)) {
        byDate.set(entry.doc.editionDate, entry);
      }
    }
    const chronological = Array.from(byDate.values()).sort((a, b) =>
      a.doc.editionDate.localeCompare(b.doc.editionDate)
    );

    const occurrencesChronological: SearchOccurrenceMatch[] = [];
    let materialUpdateCount = 0;

    for (let i = 0; i < chronological.length; i += 1) {
      const curr = chronological[i];
      const prev = i > 0 ? chronological[i - 1] : null;
      let hasMaterialUpdateFromPrevious = false;
      let updateReasons: SignalChangeReason[] = [];

      if (prev) {
        const diff = compareSignalSnapshots(prev.doc.signalRef, curr.doc.signalRef);
        hasMaterialUpdateFromPrevious = diff.kind === 'updated';
        updateReasons = diff.reasons;
        if (hasMaterialUpdateFromPrevious) materialUpdateCount += 1;
      }

      occurrencesChronological.push({
        editionDate: curr.doc.editionDate,
        editionTitle: curr.doc.editionTitle,
        editionStatus: curr.doc.editionStatus,
        headline: curr.doc.headline,
        importance: curr.doc.importance,
        confidence: curr.doc.confidence,
        status: curr.doc.status,
        matchedFields: curr.matchedFields,
        excerpt: curr.excerpt,
        score: curr.score,
        hasMaterialUpdateFromPrevious,
        updateReasons,
      });
    }

    // Display occurrences newest-first for quick editorial inspection
    const occurrencesNewestFirst = [...occurrencesChronological].reverse();
    const latestEntry = chronological[chronological.length - 1];

    // Pick best scoring occurrence for excerpt and combined matched fields
    let bestScore = -1;
    let bestExcerpt = latestEntry.excerpt;
    const allFields: SearchMatchField[] = [];
    for (const entry of occurrencesNewestFirst) {
      if (entry.score > bestScore) {
        bestScore = entry.score;
        bestExcerpt = entry.excerpt;
      }
      for (const field of entry.matchedFields) {
        if (!allFields.includes(field)) allFields.push(field);
      }
    }

    results.push({
      signalId,
      latestHeadline: latestEntry.doc.headline,
      domain: latestEntry.doc.domain,
      topic: latestEntry.doc.topic,
      tags: latestEntry.doc.tags,
      latestEditionDate: latestEntry.doc.editionDate,
      latestImportance: latestEntry.doc.importance,
      latestConfidence: latestEntry.doc.confidence,
      latestStatus: latestEntry.doc.status,
      appearanceCount: occurrencesNewestFirst.length,
      materialUpdateCount,
      bestScore: Math.max(0, bestScore),
      matchedFields: allFields,
      excerpt: bestExcerpt,
      occurrences: occurrencesNewestFirst,
    });
  }

  return results.sort((a, b) => {
    switch (params.sortBy) {
      case 'latest':
        return (
          b.latestEditionDate.localeCompare(a.latestEditionDate) ||
          b.latestImportance - a.latestImportance ||
          a.signalId.localeCompare(b.signalId)
        );
      case 'importance':
        return (
          b.latestImportance - a.latestImportance ||
          b.latestEditionDate.localeCompare(a.latestEditionDate) ||
          a.signalId.localeCompare(b.signalId)
        );
      case 'confidence':
        return (
          CONFIDENCE_RANK[b.latestConfidence] - CONFIDENCE_RANK[a.latestConfidence] ||
          b.latestEditionDate.localeCompare(a.latestEditionDate) ||
          a.signalId.localeCompare(b.signalId)
        );
      case 'relevance':
      default:
        return (
          b.bestScore - a.bestScore ||
          b.latestEditionDate.localeCompare(a.latestEditionDate) ||
          b.latestImportance - a.latestImportance ||
          a.signalId.localeCompare(b.signalId)
        );
    }
  });
}

export function extractSearchFacets(documents: readonly SearchDocument[]): {
  topics: string[];
  tags: string[];
  publishers: string[];
} {
  const topics = new Set<string>();
  const tags = new Set<string>();
  const publishers = new Set<string>();

  for (const doc of documents) {
    if (doc.topic.trim()) topics.add(doc.topic.trim());
    for (const tag of doc.tags) {
      if (tag.trim()) tags.add(tag.trim());
    }
    for (const source of doc.sources) {
      if (source.outlet.trim()) publishers.add(source.outlet.trim());
    }
  }

  return {
    topics: Array.from(topics).sort((a, b) => a.localeCompare(b)),
    tags: Array.from(tags).sort((a, b) => a.localeCompare(b)),
    publishers: Array.from(publishers).sort((a, b) => a.localeCompare(b)),
  };
}
