import type { ConfidenceLevel, ParsedSignal, SignalFilters } from '../../types/edition';

export const DEFAULT_FILTERS: SignalFilters = {
  query: '',
  domain: 'all',
  minImportance: 1,
  confidence: 'all',
  status: 'all',
  tag: 'all',
  sourceClass: 'all',
};

export function getConfidenceTextClass(confidence: ConfidenceLevel): string {
  switch (confidence) {
    case 'high':
      return 'text-[#14532D] dark:text-[#86EFAC]';
    case 'medium':
      return 'text-[#78350F] dark:text-[#FCD34D]';
    case 'low':
      return 'text-[#9A3412] dark:text-[#FDBA74]';
    case 'unverified':
      return 'text-[#991B1B] dark:text-[#FCA5A5]';
  }
}

export function getDomainTextClass(domain: string): string {
  switch (domain) {
    case 'world':
      return 'text-[#1E3A8A] dark:text-[#93C5FD]';
    case 'ai':
      return 'text-[#9A3412] dark:text-[#FDBA74]';
    case 'economy':
      return 'text-[#14532D] dark:text-[#86EFAC]';
    default:
      return 'text-[#57534E] dark:text-[#A8A29E]';
  }
}

export function filterSignals(signals: ParsedSignal[], filters: SignalFilters): ParsedSignal[] {
  const q = filters.query.trim().toLowerCase();

  return signals.filter((sig) => {
    if (filters.domain !== 'all' && sig.domain !== filters.domain) return false;
    if (sig.importance < filters.minImportance) return false;
    if (filters.confidence !== 'all' && sig.confidence.overall !== filters.confidence) return false;
    if (filters.status !== 'all' && sig.status !== filters.status) return false;
    if (filters.tag !== 'all' && !sig.tags.includes(filters.tag)) return false;
    if (
      filters.sourceClass !== 'all' &&
      !sig.sources.some((src) => src.source_class === filters.sourceClass)
    ) {
      return false;
    }

    if (q) {
      const haystack = [
        sig.signal_id,
        sig.headline,
        sig.topic,
        sig.tags.join(' '),
        sig.event.geography.join(' '),
        sig.confidence.rationale,
        sig.claims.map((c) => c.statement).join(' '),
        sig.rawNarrative,
      ]
        .join(' ')
        .toLowerCase();

      if (!haystack.includes(q)) return false;
    }

    return true;
  });
}

export function extractUniqueTags(signals: ParsedSignal[]): string[] {
  const set = new Set<string>();
  for (const sig of signals) {
    for (const tag of sig.tags) {
      if (tag) set.add(tag);
    }
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export function formatDomainLabel(domain: string): string {
  if (domain === 'world') return 'World Events';
  if (domain === 'ai') return 'AI Frontier';
  if (domain === 'economy') return 'Economic Outlook';
  return domain;
}

export function formatSourceClassLabel(sourceClass: string): string {
  switch (sourceClass) {
    case 'tier_1_newsroom':
      return 'Tier 1 Newsroom';
    case 'specialist_publication':
      return 'Specialist Publication';
    case 'primary_source':
      return 'Primary Source';
    case 'research_paper':
      return 'Research Paper';
    default:
      return sourceClass;
  }
}

export function formatRelationshipLabel(rel: string): string {
  return rel.replace(/_/g, ' ');
}
