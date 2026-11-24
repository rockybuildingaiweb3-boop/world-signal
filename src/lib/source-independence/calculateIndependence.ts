import type {
  IndependentOriginGroup,
  SignalSource,
  SourceClass,
  SourceIndependenceMetrics,
} from '../../types/edition';

export interface SourceWithSignalRef extends SignalSource {
  signal_id?: string;
}

/**
 * Determines whether a single source record qualifies as an independent journalism origin
 * under WORLD SIGNAL's Source Policy (docs/SOURCE_POLICY.md):
 *
 * - Must have `count_as_independent === true`
 * - Must have a non-empty `independence_group`
 * - Primary sources, research papers, company announcements, official statements,
 *   research artifacts, and syndicated copies are NEVER counted as independent newsrooms
 *   even if misflagged in YAML.
 */
export function qualifiesAsIndependentOrigin(source: SignalSource): boolean {
  if (!source.count_as_independent) return false;
  if (!source.independence_group || !source.independence_group.trim()) return false;

  if (
    source.source_class === 'primary_source' ||
    source.source_class === 'research_paper'
  ) {
    return false;
  }

  if (
    source.relationship === 'syndicated' ||
    source.relationship === 'official_statement' ||
    source.relationship === 'company_announcement' ||
    source.relationship === 'research_artifact'
  ) {
    return false;
  }

  return true;
}

/**
 * Calculates source independence metrics by deduplicating unique `independence_group`
 * values among qualifying independent journalism records.
 */
export function calculateSourceIndependence(
  sources: SourceWithSignalRef[]
): SourceIndependenceMetrics {
  const groupMap = new Map<
    string,
    {
      group: string;
      outlets: Set<string>;
      recordCount: number;
      signalIds: Set<string>;
      sourceClasses: Set<SourceClass>;
    }
  >();

  let tier1Records = 0;
  let specialistRecords = 0;
  let primarySourceRecords = 0;
  let researchPaperRecords = 0;
  let syndicatedRecords = 0;
  let unregisteredRecords = 0;

  for (const src of sources) {
    if (src.source_class === 'tier_1_newsroom') tier1Records += 1;
    else if (src.source_class === 'specialist_publication') specialistRecords += 1;
    else if (src.source_class === 'primary_source') primarySourceRecords += 1;
    else if (src.source_class === 'research_paper') researchPaperRecords += 1;

    if (src.relationship === 'syndicated') syndicatedRecords += 1;
    if (!src.registry_id || src.registry_id.toLowerCase() === 'null') {
      unregisteredRecords += 1;
    }

    if (qualifiesAsIndependentOrigin(src)) {
      const normalizedGroup = src.independence_group.trim().toLowerCase();
      let entry = groupMap.get(normalizedGroup);
      if (!entry) {
        entry = {
          group: src.independence_group.trim(),
          outlets: new Set<string>(),
          recordCount: 0,
          signalIds: new Set<string>(),
          sourceClasses: new Set<SourceClass>(),
        };
        groupMap.set(normalizedGroup, entry);
      }
      entry.recordCount += 1;
      if (src.outlet) entry.outlets.add(src.outlet);
      if (src.signal_id) entry.signalIds.add(src.signal_id);
      entry.sourceClasses.add(src.source_class);
    }
  }

  const independentGroups: IndependentOriginGroup[] = Array.from(groupMap.values())
    .map((entry) => ({
      group: entry.group,
      outlets: Array.from(entry.outlets).sort((a, b) => a.localeCompare(b)),
      recordCount: entry.recordCount,
      signalIds: Array.from(entry.signalIds),
      sourceClasses: Array.from(entry.sourceClasses),
    }))
    .sort((a, b) => {
      if (b.signalIds.length !== a.signalIds.length) {
        return b.signalIds.length - a.signalIds.length;
      }
      if (b.recordCount !== a.recordCount) {
        return b.recordCount - a.recordCount;
      }
      return a.group.localeCompare(b.group);
    });

  return {
    totalRecords: sources.length,
    independentOriginCount: independentGroups.length,
    independentGroups,
    tier1Records,
    specialistRecords,
    primarySourceRecords,
    researchPaperRecords,
    syndicatedRecords,
    unregisteredRecords,
  };
}
