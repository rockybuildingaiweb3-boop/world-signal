import type {
  ParsedEdition,
  ParsedSignal,
  SignalClaim,
  SignalSource,
} from '../../../types/edition';

export type SignalChangeReason =
  | 'headline'
  | 'importance'
  | 'status'
  | 'confidence'
  | 'topic'
  | 'event'
  | 'claims'
  | 'sources'
  | 'relationships'
  | 'narrative';

export type EditionChangeKind = 'new' | 'updated' | 'unchanged' | 'omitted';

export interface SignalSnapshotDiff {
  kind: Exclude<EditionChangeKind, 'omitted'>;
  reasons: SignalChangeReason[];
  addedClaimIds: string[];
  revisedClaimIds: string[];
  withdrawnClaimIds: string[];
  addedSourceUrls: string[];
  revisedSourceUrls: string[];
  removedSourceUrls: string[];
}

export interface EditionSignalChange {
  signalId: string;
  kind: EditionChangeKind;
  previous: ParsedSignal | null;
  current: ParsedSignal | null;
  diff: SignalSnapshotDiff;
}

export interface EditionDiff {
  previousEditionDate: string | null;
  currentEditionDate: string;
  changes: EditionSignalChange[];
  omitted: EditionSignalChange[];
  summary: {
    newSignals: number;
    materiallyUpdatedSignals: number;
    unchangedSignals: number;
    omittedSignals: number;
  };
}

function stable(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'undefined';
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  const object = value as Record<string, unknown>;
  return `{${Object.keys(object).sort().map((key) => `${JSON.stringify(key)}:${stable(object[key])}`).join(',')}}`;
}

function sortStrings(values: string[]): string[] {
  return [...values].sort((a, b) => a.localeCompare(b));
}

function claimSignature(claim: SignalClaim): string {
  return stable({
    statement: claim.statement,
    status: claim.status,
    confidence: claim.confidence,
    source_ids: sortStrings(claim.source_ids),
  });
}

function sourceKey(source: SignalSource): string {
  return source.url.trim() || `${source.outlet.trim()}::${source.title.trim()}`;
}

function sourceSignature(source: SignalSource): string {
  // accessed_at and computed URL safety are intentionally excluded from editorial change detection.
  return stable({
    outlet: source.outlet,
    title: source.title,
    url: source.url,
    published_at: source.published_at,
    source_class: source.source_class,
    registry_id: source.registry_id,
    independence_group: source.independence_group,
    relationship: source.relationship,
    count_as_independent: source.count_as_independent,
    supports_claim_ids: sortStrings(source.supports_claim_ids),
  });
}

function mapBy<T>(items: T[], keyOf: (item: T) => string): Map<string, T> {
  return new Map(items.map((item) => [keyOf(item), item]));
}

/**
 * Compares two snapshots of the same stable signal.
 * Routine sync timestamps, access timestamps and presentation-only ordering are ignored.
 */
export function compareSignalSnapshots(
  previous: ParsedSignal | null,
  current: ParsedSignal
): SignalSnapshotDiff {
  if (!previous) {
    return {
      kind: 'new',
      reasons: [],
      addedClaimIds: current.claims.map((claim) => claim.claim_id).sort(),
      revisedClaimIds: [],
      withdrawnClaimIds: [],
      addedSourceUrls: current.sources.map(sourceKey).sort(),
      revisedSourceUrls: [],
      removedSourceUrls: [],
    };
  }

  const reasons: SignalChangeReason[] = [];
  const addReason = (reason: SignalChangeReason) => {
    if (!reasons.includes(reason)) reasons.push(reason);
  };

  if (previous.headline !== current.headline) addReason('headline');
  if (previous.importance !== current.importance) addReason('importance');
  if (previous.status !== current.status) addReason('status');
  if (stable(previous.confidence) !== stable(current.confidence)) addReason('confidence');
  if (stable({ topic: previous.topic, tags: sortStrings(previous.tags) }) !==
      stable({ topic: current.topic, tags: sortStrings(current.tags) })) addReason('topic');
  if (stable(previous.event) !== stable(current.event)) addReason('event');
  if (stable(sortStrings(previous.related_signal_ids)) !==
      stable(sortStrings(current.related_signal_ids)) ||
      stable(previous.relationships) !== stable(current.relationships)) addReason('relationships');

  const previousClaims = mapBy(previous.claims, (claim) => claim.claim_id);
  const currentClaims = mapBy(current.claims, (claim) => claim.claim_id);
  const addedClaimIds: string[] = [];
  const revisedClaimIds: string[] = [];
  const withdrawnClaimIds: string[] = [];
  for (const [id, claim] of currentClaims) {
    const oldClaim = previousClaims.get(id);
    if (!oldClaim) addedClaimIds.push(id);
    else if (claimSignature(oldClaim) !== claimSignature(claim)) revisedClaimIds.push(id);
  }
  for (const id of previousClaims.keys()) {
    if (!currentClaims.has(id)) withdrawnClaimIds.push(id);
  }
  if (addedClaimIds.length || revisedClaimIds.length || withdrawnClaimIds.length) {
    addReason('claims');
  }

  const previousSources = mapBy(previous.sources, sourceKey);
  const currentSources = mapBy(current.sources, sourceKey);
  const addedSourceUrls: string[] = [];
  const revisedSourceUrls: string[] = [];
  const removedSourceUrls: string[] = [];
  for (const [key, source] of currentSources) {
    const oldSource = previousSources.get(key);
    if (!oldSource) addedSourceUrls.push(key);
    else if (sourceSignature(oldSource) !== sourceSignature(source)) revisedSourceUrls.push(key);
  }
  for (const key of previousSources.keys()) {
    if (!currentSources.has(key)) removedSourceUrls.push(key);
  }
  if (addedSourceUrls.length || revisedSourceUrls.length || removedSourceUrls.length) {
    addReason('sources');
  }

  const narrativeProjection = (signal: ParsedSignal) => ({
    sections: signal.sections,
    timelineEvents: signal.timelineEvents,
  });
  if (stable(narrativeProjection(previous)) !== stable(narrativeProjection(current))) {
    addReason('narrative');
  }

  return {
    kind: reasons.length > 0 ? 'updated' : 'unchanged',
    reasons,
    addedClaimIds: addedClaimIds.sort(),
    revisedClaimIds: revisedClaimIds.sort(),
    withdrawnClaimIds: withdrawnClaimIds.sort(),
    addedSourceUrls: addedSourceUrls.sort(),
    revisedSourceUrls: revisedSourceUrls.sort(),
    removedSourceUrls: removedSourceUrls.sort(),
  };
}

/**
 * Compares two complete editions. A missing signal is classified as omitted,
 * never as resolved or retracted; those states require explicit editorial metadata.
 */
export function compareEditions(
  previous: ParsedEdition | null,
  current: ParsedEdition
): EditionDiff {
  const previousSignals = new Map((previous?.signals ?? []).map((signal) => [signal.signal_id, signal]));
  const currentSignals = new Map(current.signals.map((signal) => [signal.signal_id, signal]));
  const changes: EditionSignalChange[] = [];

  for (const signal of current.signals) {
    const oldSignal = previousSignals.get(signal.signal_id) ?? null;
    const diff = compareSignalSnapshots(oldSignal, signal);
    changes.push({
      signalId: signal.signal_id,
      kind: diff.kind,
      previous: oldSignal,
      current: signal,
      diff,
    });
  }

  const omitted: EditionSignalChange[] = [];
  for (const [signalId, oldSignal] of previousSignals) {
    if (currentSignals.has(signalId)) continue;
    omitted.push({
      signalId,
      kind: 'omitted',
      previous: oldSignal,
      current: null,
      diff: {
        kind: 'unchanged',
        reasons: [],
        addedClaimIds: [],
        revisedClaimIds: [],
        withdrawnClaimIds: [],
        addedSourceUrls: [],
        revisedSourceUrls: [],
        removedSourceUrls: [],
      },
    });
  }

  return {
    previousEditionDate: previous?.frontmatter.edition_date ?? null,
    currentEditionDate: current.frontmatter.edition_date,
    changes,
    omitted,
    summary: {
      newSignals: changes.filter((change) => change.kind === 'new').length,
      materiallyUpdatedSignals: changes.filter((change) => change.kind === 'updated').length,
      unchangedSignals: changes.filter((change) => change.kind === 'unchanged').length,
      omittedSignals: omitted.length,
    },
  };
}
