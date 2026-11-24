import type {
  IndependenceExclusionReason,
  IndependentOriginGroup,
  OriginGroupAuditRecord,
  SignalSource,
  SourceClass,
  SourceIndependenceMetrics,
  SourceRelationship,
} from '../../types/edition';

export interface SourceWithSignalRef extends SignalSource {
  signal_id?: string;
}

/**
 * Returns the explicit policy exclusion reason if a source record does NOT qualify
 * as an independent journalism origin under WORLD SIGNAL's Source Policy (docs/SOURCE_POLICY.md).
 * Returns `null` when the record qualifies.
 *
 * Strict qualification rules:
 * - `source_class` MUST be `tier_1_newsroom` or `specialist_publication` (never `primary_source`,
 *   `research_paper`, or `unknown`).
 * - `relationship` MUST be `original_reporting` (never `syndicated`, `official_statement`,
 *   `company_announcement`, `research_artifact`, `secondary_analysis`, or `unknown`).
 * - `count_as_independent` MUST be `true`.
 * - `independence_group` MUST be a non-empty string.
 */
export function getIndependenceExclusionReason(
  source: Pick<
    SignalSource,
    'count_as_independent' | 'independence_group' | 'source_class' | 'relationship'
  >
): IndependenceExclusionReason | null {
  if (source.source_class === 'unknown') return 'unknown_source_class';
  if (source.source_class === 'primary_source') return 'primary_source';
  if (source.source_class === 'research_paper') return 'research_paper';

  if (source.relationship === 'unknown') return 'unknown_relationship';
  if (source.relationship === 'syndicated') return 'syndicated';
  if (source.relationship === 'official_statement') return 'official_statement';
  if (source.relationship === 'company_announcement') return 'company_announcement';
  if (source.relationship === 'research_artifact') return 'research_artifact';
  if (source.relationship === 'secondary_analysis') return 'secondary_analysis';

  if (!source.count_as_independent) return 'flagged_non_independent';
  if (!source.independence_group || !source.independence_group.trim()) {
    return 'missing_independence_group';
  }

  return null;
}

export function qualifiesAsIndependentOrigin(
  source: Pick<
    SignalSource,
    'count_as_independent' | 'independence_group' | 'source_class' | 'relationship'
  >
): boolean {
  return getIndependenceExclusionReason(source) === null;
}

/**
 * Single authoritative source-independence calculation engine used across
 * the Markdown parser, SignalMetaLine, ExpandedView, and AuditView.
 */
export function calculateSourceIndependence(
  sources: SourceWithSignalRef[]
): SourceIndependenceMetrics {
  const qualifyingMap = new Map<
    string,
    {
      group: string;
      outlets: Set<string>;
      recordCount: number;
      signalIds: Set<string>;
      sourceClasses: Set<SourceClass>;
      relationships: Set<SourceRelationship>;
    }
  >();

  const allOriginMap = new Map<
    string,
    {
      group: string;
      isUnassignedGroup: boolean;
      qualifyingRecordCount: number;
      excludedRecordCount: number;
      totalRecordCount: number;
      outlets: Set<string>;
      signalIds: Set<string>;
      sourceClasses: Set<SourceClass>;
      relationships: Set<SourceRelationship>;
      exclusionReasons: Set<IndependenceExclusionReason>;
    }
  >();

  let qualifyingRecords = 0;
  let excludedRecords = 0;
  let tier1Records = 0;
  let specialistRecords = 0;
  let primarySourceRecords = 0;
  let researchPaperRecords = 0;
  let unknownClassRecords = 0;
  let syndicatedRecords = 0;
  let unregisteredRecords = 0;

  for (const src of sources) {
    if (src.source_class === 'tier_1_newsroom') tier1Records += 1;
    else if (src.source_class === 'specialist_publication') specialistRecords += 1;
    else if (src.source_class === 'primary_source') primarySourceRecords += 1;
    else if (src.source_class === 'research_paper') researchPaperRecords += 1;
    else unknownClassRecords += 1;

    if (src.relationship === 'syndicated') syndicatedRecords += 1;
    if (!src.registry_id || src.registry_id.trim().toLowerCase() === 'null') {
      unregisteredRecords += 1;
    }

    const reason = getIndependenceExclusionReason(src);
    const qualifies = reason === null;
    if (qualifies) qualifyingRecords += 1;
    else excludedRecords += 1;

    const rawGroup = src.independence_group?.trim() ?? '';
    const isUnassignedGroup = rawGroup.length === 0;
    const normalizedGroupKey = isUnassignedGroup
      ? '__unassigned__'
      : rawGroup.toLowerCase();
    const displayGroup = isUnassignedGroup ? 'unassigned' : rawGroup;

    let auditEntry = allOriginMap.get(normalizedGroupKey);
    if (!auditEntry) {
      auditEntry = {
        group: displayGroup,
        isUnassignedGroup,
        qualifyingRecordCount: 0,
        excludedRecordCount: 0,
        totalRecordCount: 0,
        outlets: new Set<string>(),
        signalIds: new Set<string>(),
        sourceClasses: new Set<SourceClass>(),
        relationships: new Set<SourceRelationship>(),
        exclusionReasons: new Set<IndependenceExclusionReason>(),
      };
      allOriginMap.set(normalizedGroupKey, auditEntry);
    }

    auditEntry.totalRecordCount += 1;
    if (qualifies) {
      auditEntry.qualifyingRecordCount += 1;
    } else {
      auditEntry.excludedRecordCount += 1;
      auditEntry.exclusionReasons.add(reason);
    }
    if (src.outlet) auditEntry.outlets.add(src.outlet);
    if (src.signal_id) auditEntry.signalIds.add(src.signal_id);
    auditEntry.sourceClasses.add(src.source_class);
    auditEntry.relationships.add(src.relationship);

    if (qualifies) {
      let qualEntry = qualifyingMap.get(normalizedGroupKey);
      if (!qualEntry) {
        qualEntry = {
          group: displayGroup,
          outlets: new Set<string>(),
          recordCount: 0,
          signalIds: new Set<string>(),
          sourceClasses: new Set<SourceClass>(),
          relationships: new Set<SourceRelationship>(),
        };
        qualifyingMap.set(normalizedGroupKey, qualEntry);
      }
      qualEntry.recordCount += 1;
      if (src.outlet) qualEntry.outlets.add(src.outlet);
      if (src.signal_id) qualEntry.signalIds.add(src.signal_id);
      qualEntry.sourceClasses.add(src.source_class);
      qualEntry.relationships.add(src.relationship);
    }
  }

  const independentGroups: IndependentOriginGroup[] = Array.from(qualifyingMap.values())
    .map((entry) => ({
      group: entry.group,
      outlets: Array.from(entry.outlets).sort((a, b) => a.localeCompare(b)),
      recordCount: entry.recordCount,
      signalIds: Array.from(entry.signalIds),
      sourceClasses: Array.from(entry.sourceClasses),
      relationships: Array.from(entry.relationships),
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

  const allOriginGroups: OriginGroupAuditRecord[] = Array.from(allOriginMap.values())
    .map((entry) => ({
      group: entry.group,
      isUnassignedGroup: entry.isUnassignedGroup,
      qualifiesAny: entry.qualifyingRecordCount > 0,
      qualifyingRecordCount: entry.qualifyingRecordCount,
      excludedRecordCount: entry.excludedRecordCount,
      totalRecordCount: entry.totalRecordCount,
      outlets: Array.from(entry.outlets).sort((a, b) => a.localeCompare(b)),
      signalIds: Array.from(entry.signalIds),
      sourceClasses: Array.from(entry.sourceClasses),
      relationships: Array.from(entry.relationships),
      exclusionReasons: Array.from(entry.exclusionReasons),
    }))
    .sort((a, b) => {
      if (a.qualifiesAny !== b.qualifiesAny) return a.qualifiesAny ? -1 : 1;
      if (b.qualifyingRecordCount !== a.qualifyingRecordCount) {
        return b.qualifyingRecordCount - a.qualifyingRecordCount;
      }
      if (b.totalRecordCount !== a.totalRecordCount) {
        return b.totalRecordCount - a.totalRecordCount;
      }
      return a.group.localeCompare(b.group);
    });

  return {
    totalRecords: sources.length,
    independentOriginCount: independentGroups.length,
    independentGroups,
    allOriginGroups,
    qualifyingRecords,
    excludedRecords,
    tier1Records,
    specialistRecords,
    primarySourceRecords,
    researchPaperRecords,
    unknownClassRecords,
    syndicatedRecords,
    unregisteredRecords,
  };
}
