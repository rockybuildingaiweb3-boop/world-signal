import type { ParsedSignal, SignalDomain, SignalFilters } from '../../types/edition';

export const DEFAULT_FILTERS: SignalFilters = {
  query: '',
  domain: 'all',
  minImportance: 1,
  confidence: 'all',
  status: 'all',
  topic: 'all',
  tag: 'all',
  sourceClass: 'all',
};

export function countActiveFilters(filters: SignalFilters): number {
  let count = 0;
  if (filters.query.trim()) count += 1;
  if (filters.domain !== 'all') count += 1;
  if (filters.minImportance > 1) count += 1;
  if (filters.confidence !== 'all') count += 1;
  if (filters.status !== 'all') count += 1;
  if (filters.topic !== 'all') count += 1;
  if (filters.tag !== 'all') count += 1;
  if (filters.sourceClass !== 'all') count += 1;
  return count;
}

export function filterSignals(signals: ParsedSignal[], filters: SignalFilters): ParsedSignal[] {
  const normalizedQuery = filters.query.trim().toLowerCase();

  return signals.filter((signal) => {
    if (filters.domain !== 'all' && signal.domain !== filters.domain) {
      return false;
    }

    if (signal.importance < filters.minImportance) {
      return false;
    }

    if (filters.confidence !== 'all' && signal.confidence.overall !== filters.confidence) {
      return false;
    }

    if (filters.status !== 'all' && signal.status !== filters.status) {
      return false;
    }

    if (
      filters.topic !== 'all' &&
      signal.topic.trim().toLowerCase() !== filters.topic.trim().toLowerCase()
    ) {
      return false;
    }

    if (filters.tag !== 'all' && !signal.tags.includes(filters.tag)) {
      return false;
    }

    if (
      filters.sourceClass !== 'all' &&
      !signal.sources.some((source) => source.source_class === filters.sourceClass)
    ) {
      return false;
    }

    if (normalizedQuery) {
      const haystack = [
        signal.signal_id,
        signal.headline,
        signal.topic,
        signal.tags.join(' '),
        signal.event.geography.join(' '),
        signal.confidence.rationale,
        signal.sections.whatHappened,
        signal.sections.verifiedFacts,
        signal.sections.whyItMatters,
        signal.sections.analysis,
        signal.claims.map((c) => c.statement).join(' '),
        signal.sources.map((s) => `${s.outlet} ${s.title} ${s.independence_group}`).join(' '),
      ]
        .join(' ')
        .toLowerCase();

      if (!haystack.includes(normalizedQuery)) {
        return false;
      }
    }

    return true;
  });
}

export function extractUniqueTags(signals: ParsedSignal[]): string[] {
  const set = new Set<string>();
  for (const sig of signals) {
    for (const tag of sig.tags) {
      if (tag.trim()) set.add(tag.trim());
    }
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export function extractUniqueTopics(signals: ParsedSignal[]): string[] {
  const set = new Set<string>();
  for (const sig of signals) {
    if (sig.topic && sig.topic.trim()) {
      set.add(sig.topic.trim());
    }
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export function domainAccentVar(domain: SignalDomain): string {
  switch (domain) {
    case 'world':
      return 'var(--ws-world)';
    case 'ai':
      return 'var(--ws-ai)';
    case 'economy':
      return 'var(--ws-economy)';
  }
}

export function domainAccentTextClass(domain: SignalDomain): string {
  switch (domain) {
    case 'world':
      return 'text-[var(--ws-world)]';
    case 'ai':
      return 'text-[var(--ws-ai)]';
    case 'economy':
      return 'text-[var(--ws-economy)]';
  }
}

export function domainTintBgClass(domain: SignalDomain): string {
  switch (domain) {
    case 'world':
      return 'bg-[var(--ws-world-soft)]';
    case 'ai':
      return 'bg-[var(--ws-ai-soft)]';
    case 'economy':
      return 'bg-[var(--ws-economy-soft)]';
  }
}

export function confidenceColorClass(
  level: 'high' | 'medium' | 'low' | 'unverified'
): string {
  switch (level) {
    case 'high':
      return 'text-[var(--ws-conf-high)]';
    case 'medium':
      return 'text-[var(--ws-conf-medium)]';
    case 'low':
      return 'text-[var(--ws-conf-low)]';
    case 'unverified':
      return 'text-[var(--ws-conf-unverified)]';
  }
}
