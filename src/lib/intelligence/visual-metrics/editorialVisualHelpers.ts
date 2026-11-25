import type {
  ConfidenceLevel,
  ParsedEdition,
  ParsedSignal,
  SignalDomain,
  SignalRelationshipType,
} from '../../../types/edition';
import {
  buildRelationshipGraph,
  type SignalRelationshipEdge,
} from '../relationships/buildRelationshipGraph';

export const EDITORIAL_DOMAINS: readonly SignalDomain[] = [
  'world',
  'ai',
  'economy',
];

export const CONFIDENCE_ORDER: readonly ConfidenceLevel[] = [
  'high',
  'medium',
  'low',
  'unverified',
];

export const IMPORTANCE_ORDER: readonly (5 | 4 | 3 | 2 | 1)[] = [5, 4, 3, 2, 1];

export interface OriginMarkerSummary {
  totalCount: number;
  displayedCount: number;
  overflowCount: number;
  isCapped: boolean;
  namedGroups: string[];
}

/**
 * Computes exact orbital node counts for EditorialSignalArtwork so that
 * visual marker capping never misleads readers about the exact independent origin count.
 */
export function buildOriginMarkerSummary(
  independentOriginCount: number,
  independentGroups: readonly string[],
  maxDisplayedNodes = 8
): OriginMarkerSummary {
  const safeTotal = Math.max(0, Math.floor(independentOriginCount));
  const safeCap = Math.max(1, Math.floor(maxDisplayedNodes));
  const displayedCount = Math.min(safeTotal, safeCap);
  const overflowCount = Math.max(0, safeTotal - displayedCount);
  const namedGroups = Array.from(
    new Set(independentGroups.map((g) => g.trim()).filter(Boolean))
  );

  return {
    totalCount: safeTotal,
    displayedCount,
    overflowCount,
    isCapped: overflowCount > 0,
    namedGroups,
  };
}

export interface DomainEditionProfile {
  domain: SignalDomain;
  total: number;
  sharePct: number;
  imp5Count: number;
  imp4Count: number;
  impLowerCount: number;
  highConfidenceCount: number;
  totalClaims: number;
  independentOrigins: number;
  intro: string;
  additionalSignals: ParsedSignal[];
}

/**
 * Derives per-domain analytical composition strictly from parsed edition signals.
 */
export function buildDomainEditionProfiles(
  signals: readonly ParsedSignal[],
  domainIntros: Record<SignalDomain, string>,
  topIdSet: ReadonlySet<string>
): DomainEditionProfile[] {
  const totalSignals = Math.max(signals.length, 1);

  return EDITORIAL_DOMAINS.map((domain) => {
    const list = signals.filter((s) => s.domain === domain);
    const uniqueGroups = new Set<string>();
    let imp5Count = 0;
    let imp4Count = 0;
    let impLowerCount = 0;
    let highConfidenceCount = 0;
    let totalClaims = 0;

    for (const s of list) {
      if (s.importance === 5) imp5Count += 1;
      else if (s.importance === 4) imp4Count += 1;
      else impLowerCount += 1;
      if (s.confidence.overall === 'high') highConfidenceCount += 1;
      totalClaims += s.claims.length;
      for (const g of s.independentGroups) {
        if (g.trim()) uniqueGroups.add(g.trim().toLowerCase());
      }
    }

    return {
      domain,
      total: list.length,
      sharePct: Math.round((list.length / totalSignals) * 100),
      imp5Count,
      imp4Count,
      impLowerCount,
      highConfidenceCount,
      totalClaims,
      independentOrigins: uniqueGroups.size,
      intro: domainIntros[domain] ?? '',
      additionalSignals: list.filter((s) => !topIdSet.has(s.signal_id)),
    };
  });
}

export interface ConfidenceImportanceMatrix {
  rows: Array<{
    importance: 5 | 4 | 3 | 2 | 1;
    counts: Record<ConfidenceLevel, number>;
    rowTotal: number;
  }>;
  columnTotals: Record<ConfidenceLevel, number>;
  totalSignals: number;
  maxCellCount: number;
}

/**
 * Builds an exact 5×4 Importance × Confidence cross-tabulation from parsed signals.
 * Demonstrates editorial separation between importance and verification confidence.
 */
export function buildConfidenceImportanceMatrix(
  signals: readonly ParsedSignal[]
): ConfidenceImportanceMatrix {
  const columnTotals: Record<ConfidenceLevel, number> = {
    high: 0,
    medium: 0,
    low: 0,
    unverified: 0,
  };

  const rows = IMPORTANCE_ORDER.map((importance) => {
    const counts: Record<ConfidenceLevel, number> = {
      high: 0,
      medium: 0,
      low: 0,
      unverified: 0,
    };
    let rowTotal = 0;
    for (const s of signals) {
      if (s.importance === importance) {
        counts[s.confidence.overall] += 1;
        columnTotals[s.confidence.overall] += 1;
        rowTotal += 1;
      }
    }
    return { importance, counts, rowTotal };
  });

  let maxCellCount = 0;
  for (const row of rows) {
    for (const level of CONFIDENCE_ORDER) {
      if (row.counts[level] > maxCellCount) {
        maxCellCount = row.counts[level];
      }
    }
  }

  return {
    rows,
    columnTotals,
    totalSignals: signals.length,
    maxCellCount,
  };
}

export interface RelationshipExplorerModel {
  explicitEdges: SignalRelationshipEdge[];
  legacyContextualEdges: SignalRelationshipEdge[];
  unresolvedTargets: Array<{
    sourceSignalId: string;
    targetSignalId: string;
    declaredInEdition: string;
  }>;
  explicitTypeCounts: Partial<Record<SignalRelationshipType, number>>;
  connectedSignalIds: Set<string>;
}

/**
 * Projects explicit and legacy contextual relationships using the authoritative
 * buildRelationshipGraph() engine without inferring or inventing edges.
 */
export function buildRelationshipExplorerModel(
  edition: ParsedEdition
): RelationshipExplorerModel {
  const graph = buildRelationshipGraph([edition]);
  const explicitEdges: SignalRelationshipEdge[] = [];
  const legacyContextualEdges: SignalRelationshipEdge[] = [];
  const explicitTypeCounts: Partial<Record<SignalRelationshipType, number>> = {};
  const connectedSignalIds = new Set<string>();

  for (const edge of graph.edges) {
    connectedSignalIds.add(edge.sourceSignalId);
    connectedSignalIds.add(edge.targetSignalId);
    if (edge.isExplicitlyTyped) {
      explicitEdges.push(edge);
      explicitTypeCounts[edge.relationshipType] =
        (explicitTypeCounts[edge.relationshipType] ?? 0) + 1;
    } else {
      legacyContextualEdges.push(edge);
    }
  }

  return {
    explicitEdges,
    legacyContextualEdges,
    unresolvedTargets: graph.unresolvedTargets,
    explicitTypeCounts,
    connectedSignalIds,
  };
}
