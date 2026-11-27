import type {
  ParsedEdition,
  ParsedSignal,
  SignalClaim,
  SignalDomain,
  SignalRelationship,
  SignalSource,
  SignalTimelineEvent,
} from '../../../types/edition';
import {
  compareEditions,
  type EditionDiff,
  type EditionSignalChange,
} from '../edition-diff/compareEditions';
import {
  getBrowserStorage,
  READER_SNAPSHOT_STORAGE_KEY,
  type ReaderState,
  type StorageLike,
} from '../reader-state/readerState';

export const COMPACT_SNAPSHOT_VERSION = 1;

/**
 * Minimal structured signal projection needed for deterministic `compareEditions()`
 * comparisons across same-day Muse overwrites without storing full raw Markdown prose.
 */
export interface CompactSignalSnapshot {
  signal_id: string;
  headline: string;
  domain: SignalDomain;
  topic: string;
  importance: 1 | 2 | 3 | 4 | 5;
  status: ParsedSignal['status'];
  confidence: ParsedSignal['confidence'];
  event: ParsedSignal['event'];
  tags: string[];
  related_signal_ids: string[];
  relationships: SignalRelationship[];
  claims: SignalClaim[];
  sources: Array<
    Pick<
      SignalSource,
      | 'source_id'
      | 'outlet'
      | 'title'
      | 'url'
      | 'urlSafe'
      | 'published_at'
      | 'source_class'
      | 'registry_id'
      | 'independence_group'
      | 'relationship'
      | 'count_as_independent'
      | 'qualifiesAsIndependent'
      | 'supports_claim_ids'
    >
  >;
  timelineEvents: SignalTimelineEvent[];
  /** Deterministic narrative fingerprint (lightweight hash of narrative sections) */
  narrativeHash: string;
}

export interface CompactReviewedEditionSnapshot {
  version: number;
  editionDate: string;
  editionUpdatedAt: string;
  schemaVersion: number;
  savedAt: string;
  signals: CompactSignalSnapshot[];
}

export interface CatchUpFollowedAlert {
  signalId: string;
  headline: string;
  domain: SignalDomain;
  kind: 'new' | 'updated' | 'reappeared' | 'omitted';
  targetEditionDate: string;
  change: EditionSignalChange | null;
}

export type CatchUpState =
  | {
      status: 'first_visit';
      currentEditionDate: string;
      signalCount: number;
    }
  | {
      status: 'baseline_unavailable';
      lastReviewedEditionDate: string;
      lastReviewedAt: string | null;
      currentEditionDate: string;
      reason: 'snapshot_missing' | 'archived_baseline_missing';
    }
  | {
      status: 'up_to_date';
      baselineEditionDate: string;
      baselineUpdatedAt: string;
      currentEditionDate: string;
      currentUpdatedAt: string;
      lastReviewedAt: string | null;
      usedLocalSnapshot: boolean;
    }
  | {
      status: 'changes_available';
      baselineEditionDate: string;
      baselineUpdatedAt: string;
      currentEditionDate: string;
      currentUpdatedAt: string;
      lastReviewedAt: string | null;
      usedLocalSnapshot: boolean;
      isSameDayRevision: boolean;
      diff: EditionDiff;
      newSignals: EditionSignalChange[];
      updatedSignals: EditionSignalChange[];
      reappearedSignals: EditionSignalChange[];
      omittedSignals: EditionSignalChange[];
      claimChangeSignals: EditionSignalChange[];
      sourceChangeSignals: EditionSignalChange[];
      followedAlerts: CatchUpFollowedAlert[];
    };

/**
 * Deterministic lightweight hash for narrative text so compact local snapshots
 * detect narrative revisions without storing kilobytes of Markdown prose.
 */
function hashNarrativeSections(signal: ParsedSignal): string {
  const payload = JSON.stringify(signal.sections);
  let hash = 5381;
  for (let i = 0; i < payload.length; i += 1) {
    hash = ((hash << 5) + hash + payload.charCodeAt(i)) >>> 0;
  }
  return `nh-${hash.toString(16)}`;
}

export function buildCompactReviewedSnapshot(
  edition: ParsedEdition,
  savedAt: string = new Date().toISOString()
): CompactReviewedEditionSnapshot {
  return {
    version: COMPACT_SNAPSHOT_VERSION,
    editionDate: edition.frontmatter.edition_date,
    editionUpdatedAt: edition.frontmatter.updated_at,
    schemaVersion: edition.frontmatter.schema_version,
    savedAt,
    signals: edition.signals.map((sig) => ({
      signal_id: sig.signal_id,
      headline: sig.headline,
      domain: sig.domain,
      topic: sig.topic,
      importance: sig.importance,
      status: sig.status,
      confidence: { ...sig.confidence },
      event: {
        start_date: sig.event.start_date,
        end_date: sig.event.end_date,
        geography: [...sig.event.geography],
      },
      tags: [...sig.tags],
      related_signal_ids: [...sig.related_signal_ids],
      relationships: sig.relationships.map((r) => ({
        ...r,
        supporting_claim_ids: [...r.supporting_claim_ids],
      })),
      claims: sig.claims.map((c) => ({
        ...c,
        source_ids: [...c.source_ids],
      })),
      sources: sig.sources.map((s) => ({
        source_id: s.source_id,
        outlet: s.outlet,
        title: s.title,
        url: s.url,
        urlSafe: s.urlSafe,
        published_at: s.published_at,
        source_class: s.source_class,
        registry_id: s.registry_id,
        independence_group: s.independence_group,
        relationship: s.relationship,
        count_as_independent: s.count_as_independent,
        qualifiesAsIndependent: s.qualifiesAsIndependent,
        supports_claim_ids: [...s.supports_claim_ids],
      })),
      timelineEvents: sig.timelineEvents.map((ev) => ({
        ...ev,
        claim_ids: [...ev.claim_ids],
        source_ids: [...ev.source_ids],
      })),
      narrativeHash: hashNarrativeSections(sig),
    })),
  };
}

export function saveCompactReviewedSnapshot(
  snapshot: CompactReviewedEditionSnapshot,
  storage: StorageLike | null = getBrowserStorage()
): boolean {
  if (!storage) return false;
  try {
    storage.setItem(READER_SNAPSHOT_STORAGE_KEY, JSON.stringify(snapshot));
    return true;
  } catch {
    return false;
  }
}

export function loadCompactReviewedSnapshot(
  storage: StorageLike | null = getBrowserStorage()
): CompactReviewedEditionSnapshot | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(READER_SNAPSHOT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CompactReviewedEditionSnapshot>;
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      parsed.version !== COMPACT_SNAPSHOT_VERSION ||
      typeof parsed.editionDate !== 'string' ||
      !Array.isArray(parsed.signals)
    ) {
      return null;
    }
    return parsed as CompactReviewedEditionSnapshot;
  } catch {
    return null;
  }
}

function normalizeCompactSnapshot(
  snapshot: CompactReviewedEditionSnapshot
): CompactReviewedEditionSnapshot {
  return JSON.parse(JSON.stringify(snapshot)) as CompactReviewedEditionSnapshot;
}

/**
 * Rehydrates a compact snapshot into a deterministic ParsedEdition baseline
 * compatible with `compareEditions()`, projecting both baseline and current
 * through the identical normalized compact shape so JSON serialization of
 * optional fields never triggers false-positive diffs.
 */
function hydrateBaselineAndCurrentForCompactDiff(
  snapshot: CompactReviewedEditionSnapshot,
  currentEdition: ParsedEdition
): { baseline: ParsedEdition; projectedCurrent: ParsedEdition } {
  const emptySections = (hashToken: string): ParsedSignal['sections'] => ({
    whatHappened: hashToken,
    verifiedFacts: '',
    timeline: '',
    timelineEntries: [],
    whyItMatters: '',
    sourcePerspectives: '',
    analysis: '',
    horizonImpacts: [],
    uncertainties: '',
    scenarios: '',
    scenarioItems: [],
    whatToWatch: '',
    extraSections: [],
  });

  const emptyIndependence: ParsedSignal['independence'] = {
    totalRecords: 0,
    independentOriginCount: 0,
    independentGroups: [],
    allOriginGroups: [],
    unassignedRecords: [],
    qualifyingRecords: 0,
    excludedRecords: 0,
    tier1Records: 0,
    specialistRecords: 0,
    primarySourceRecords: 0,
    researchPaperRecords: 0,
    unknownClassRecords: 0,
    syndicatedRecords: 0,
    unregisteredRecords: 0,
  };

  const hydrateSignals = (compact: CompactReviewedEditionSnapshot): ParsedSignal[] =>
    compact.signals.map((sig, idx) => ({
      signal_id: sig.signal_id,
      headline: sig.headline,
      domain: sig.domain,
      topic: sig.topic,
      importance: sig.importance,
      status: sig.status,
      confidence: sig.confidence,
      event: sig.event,
      published_at: '',
      first_verified_at: '',
      updated_at: compact.editionUpdatedAt,
      tags: sig.tags,
      related_signal_ids: sig.related_signal_ids,
      timelineEvents: sig.timelineEvents,
      relationships: sig.relationships,
      mediaAssets: [],
      claims: sig.claims,
      sources: sig.sources.map((s) => ({
        ...s,
        accessed_at: '',
      })),
      independence: emptyIndependence,
      independentOriginCount: 0,
      independentGroups: [],
      sections: emptySections(sig.narrativeHash),
      rawNarrative: '',
      orderIndex: idx,
    }));

  const normalizedBaseline = normalizeCompactSnapshot(snapshot);
  const normalizedCurrent = normalizeCompactSnapshot(
    buildCompactReviewedSnapshot(currentEdition, snapshot.savedAt)
  );

  const baseline: ParsedEdition = {
    ...currentEdition,
    sourceLabel: `local-snapshot:${normalizedBaseline.editionDate}`,
    frontmatter: {
      ...currentEdition.frontmatter,
      schema_version: normalizedBaseline.schemaVersion,
      edition_date: normalizedBaseline.editionDate,
      updated_at: normalizedBaseline.editionUpdatedAt,
    },
    signals: hydrateSignals(normalizedBaseline),
  };

  const projectedCurrent: ParsedEdition = {
    ...currentEdition,
    signals: hydrateSignals(normalizedCurrent),
  };

  return { baseline, projectedCurrent };
}

/**
 * Computes the deterministic Since Your Last Visit catch-up report by reusing
 * `compareEditions()` against either the archived reviewed edition or the
 * compact local reviewed snapshot (which also enables same-day update diffs).
 */
export function buildCatchUpReport(params: {
  readerState: ReaderState;
  currentEdition: ParsedEdition;
  archivedBaselineEdition: ParsedEdition | null;
  localReviewedSnapshot: CompactReviewedEditionSnapshot | null;
  /** Optional known historical signal IDs seen before the baseline (to identify reappearances) */
  historicalKnownSignalIds?: ReadonlySet<string>;
}): CatchUpState {
  const {
    readerState,
    currentEdition,
    archivedBaselineEdition,
    localReviewedSnapshot,
    historicalKnownSignalIds,
  } = params;

  const currentDate = currentEdition.frontmatter.edition_date;
  const currentUpdatedAt = currentEdition.frontmatter.updated_at;

  if (!readerState.lastReviewedEditionDate) {
    return {
      status: 'first_visit',
      currentEditionDate: currentDate,
      signalCount: currentEdition.signals.length,
    };
  }

  const reviewedDate = readerState.lastReviewedEditionDate;
  const reviewedUpdatedAt =
    readerState.reviewedSnapshotMetadata?.editionUpdatedAt ?? '';
  const isSameDay = reviewedDate === currentDate;

  // Prefer local compact snapshot when comparing same-day revisions (since canonical
  // public file gets overwritten by later Muse runs) or when archived baseline is unavailable.
  const canUseLocalSnapshot =
    localReviewedSnapshot !== null &&
    localReviewedSnapshot.editionDate === reviewedDate &&
    (isSameDay || archivedBaselineEdition === null);

  let diff: EditionDiff | null = null;
  let baselineUpdatedAt = reviewedUpdatedAt;
  let usedLocalSnapshot = false;

  if (canUseLocalSnapshot && localReviewedSnapshot) {
    const { baseline, projectedCurrent } = hydrateBaselineAndCurrentForCompactDiff(
      localReviewedSnapshot,
      currentEdition
    );
    const rawDiff = compareEditions(baseline, projectedCurrent);
    // Re-attach full live ParsedSignal objects for `current` so UI has full metadata
    const liveSignalMap = new Map(
      currentEdition.signals.map((sig) => [sig.signal_id, sig])
    );
    diff = {
      ...rawDiff,
      changes: rawDiff.changes.map((c) => ({
        ...c,
        current: liveSignalMap.get(c.signalId) ?? c.current,
      })),
    };
    baselineUpdatedAt = localReviewedSnapshot.editionUpdatedAt;
    usedLocalSnapshot = true;
  } else if (
    archivedBaselineEdition &&
    archivedBaselineEdition.frontmatter.edition_date === reviewedDate
  ) {
    diff = compareEditions(archivedBaselineEdition, currentEdition);
    baselineUpdatedAt = archivedBaselineEdition.frontmatter.updated_at;
    usedLocalSnapshot = false;
  } else {
    // If same-day and timestamps match exactly without a local snapshot, user is up-to-date
    if (
      isSameDay &&
      reviewedUpdatedAt &&
      reviewedUpdatedAt === currentUpdatedAt
    ) {
      return {
        status: 'up_to_date',
        baselineEditionDate: reviewedDate,
        baselineUpdatedAt: reviewedUpdatedAt,
        currentEditionDate: currentDate,
        currentUpdatedAt,
        lastReviewedAt: readerState.lastReviewedAt,
        usedLocalSnapshot: false,
      };
    }

    return {
      status: 'baseline_unavailable',
      lastReviewedEditionDate: reviewedDate,
      lastReviewedAt: readerState.lastReviewedAt,
      currentEditionDate: currentDate,
      reason: isSameDay ? 'snapshot_missing' : 'archived_baseline_missing',
    };
  }

  const newSignalsAll = diff.changes.filter((c) => c.kind === 'new');
  const reappearedSignals = historicalKnownSignalIds
    ? newSignalsAll.filter((c) => historicalKnownSignalIds.has(c.signalId))
    : [];
  const reappearedIdSet = new Set(reappearedSignals.map((c) => c.signalId));
  const newSignals = newSignalsAll.filter((c) => !reappearedIdSet.has(c.signalId));
  const updatedSignals = diff.changes.filter((c) => c.kind === 'updated');
  const omittedSignals = diff.omitted;

  const claimChangeSignals = diff.changes.filter(
    (c) =>
      c.kind === 'updated' &&
      (c.diff.addedClaimIds.length > 0 ||
        c.diff.revisedClaimIds.length > 0 ||
        c.diff.withdrawnClaimIds.length > 0)
  );
  const sourceChangeSignals = diff.changes.filter(
    (c) =>
      c.kind === 'updated' &&
      (c.diff.addedSourceUrls.length > 0 ||
        c.diff.revisedSourceUrls.length > 0 ||
        c.diff.removedSourceUrls.length > 0)
  );

  const followedIds = new Set(
    readerState.followedSignals.map((item) => item.signalId)
  );
  const followedAlerts: CatchUpFollowedAlert[] = [];

  for (const change of [...updatedSignals, ...reappearedSignals, ...newSignals]) {
    if (!followedIds.has(change.signalId) || !change.current) continue;
    const alertKind = reappearedIdSet.has(change.signalId)
      ? 'reappeared'
      : change.kind === 'new'
      ? 'new'
      : 'updated';
    followedAlerts.push({
      signalId: change.signalId,
      headline: change.current.headline,
      domain: change.current.domain,
      kind: alertKind,
      targetEditionDate: currentDate,
      change,
    });
  }

  for (const omitted of omittedSignals) {
    if (!followedIds.has(omitted.signalId) || !omitted.previous) continue;
    followedAlerts.push({
      signalId: omitted.signalId,
      headline: omitted.previous.headline,
      domain: omitted.previous.domain,
      kind: 'omitted',
      targetEditionDate: reviewedDate,
      change: omitted,
    });
  }

  const hasAnyEditorialChanges =
    newSignals.length > 0 ||
    updatedSignals.length > 0 ||
    reappearedSignals.length > 0 ||
    omittedSignals.length > 0;

  if (!hasAnyEditorialChanges) {
    return {
      status: 'up_to_date',
      baselineEditionDate: reviewedDate,
      baselineUpdatedAt,
      currentEditionDate: currentDate,
      currentUpdatedAt,
      lastReviewedAt: readerState.lastReviewedAt,
      usedLocalSnapshot,
    };
  }

  return {
    status: 'changes_available',
    baselineEditionDate: reviewedDate,
    baselineUpdatedAt,
    currentEditionDate: currentDate,
    currentUpdatedAt,
    lastReviewedAt: readerState.lastReviewedAt,
    usedLocalSnapshot,
    isSameDayRevision: isSameDay,
    diff,
    newSignals,
    updatedSignals,
    reappearedSignals,
    omittedSignals,
    claimChangeSignals,
    sourceChangeSignals,
    followedAlerts,
  };
}
