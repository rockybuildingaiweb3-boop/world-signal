import type {
  EditionIndexEntry,
  ParsedEdition,
  ParsedSignal,
  SignalClaim,
  SignalSource,
} from '../../../types/edition';
import {
  compareEditions,
  type EditionChangeKind,
  type EditionDiff,
  type EditionSignalChange,
} from '../edition-diff/compareEditions';

export type DailyDeltaUnavailableReason =
  | 'local_preview'
  | 'no_previous_edition'
  | 'previous_load_failed'
  | 'incomplete_history';

export type DailyDeltaState =
  | {
      status: 'loading';
      currentDate: string;
      previousDate: string;
    }
  | {
      status: 'unavailable';
      reason: DailyDeltaUnavailableReason;
      currentDate: string | null;
      previousDate: string | null;
      errorMessage?: string;
    }
  | {
      status: 'ready';
      currentDate: string;
      previousDate: string;
      currentSchemaVersion: number;
      previousSchemaVersion: number;
      hasDateGap: boolean;
      dayGapCount: number;
      diff: EditionDiff;
    };

export interface DeltaSignalNavigationTarget {
  editionDate: string;
  signalId: string;
  isOmittedNavigation: boolean;
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Finds the immediately preceding available edition strictly earlier than `selectedDate`
 * chronologically, without assuming the archive array is pre-sorted or contiguous by calendar day.
 */
export function findPreviousAvailableEdition(
  editions: readonly EditionIndexEntry[],
  selectedDate: string
): EditionIndexEntry | null {
  if (!ISO_DATE_RE.test(selectedDate)) return null;

  let best: EditionIndexEntry | null = null;
  for (const entry of editions) {
    if (!ISO_DATE_RE.test(entry.date)) continue;
    if (entry.date >= selectedDate) continue;
    if (!best || entry.date > best.date) {
      best = entry;
    }
  }
  return best;
}

/**
 * Computes the positive calendar-day interval between two ISO YYYY-MM-DD edition dates.
 * Returns 1 for consecutive days, >1 when a publication gap exists, or 0 if dates are invalid.
 */
export function computeCalendarDayGap(
  previousDate: string,
  currentDate: string
): number {
  if (!ISO_DATE_RE.test(previousDate) || !ISO_DATE_RE.test(currentDate)) {
    return 0;
  }
  const [py, pm, pd] = previousDate.split('-').map(Number);
  const [cy, cm, cd] = currentDate.split('-').map(Number);
  const prevUtc = Date.UTC(py, pm - 1, pd);
  const currUtc = Date.UTC(cy, cm - 1, cd);
  const diffDays = Math.round((currUtc - prevUtc) / (24 * 60 * 60 * 1000));
  return diffDays > 0 ? diffDays : 0;
}

/**
 * Pure state constructor from a loaded current edition and optional previous edition.
 * Delegates all signal classification strictly to `compareEditions()`.
 */
export function buildDailyDeltaState(params: {
  currentEdition: ParsedEdition;
  previousEdition: ParsedEdition | null;
  hasArchiveIndex: boolean;
  previousEntry: EditionIndexEntry | null;
  previousLoadError?: string | null;
}): DailyDeltaState {
  const {
    currentEdition,
    previousEdition,
    hasArchiveIndex,
    previousEntry,
    previousLoadError,
  } = params;

  const currentDate = currentEdition.frontmatter.edition_date || null;

  if (currentEdition.isLocalPreview) {
    return {
      status: 'unavailable',
      reason: 'local_preview',
      currentDate,
      previousDate: null,
    };
  }

  if (!hasArchiveIndex || !currentDate || !ISO_DATE_RE.test(currentDate)) {
    return {
      status: 'unavailable',
      reason: 'incomplete_history',
      currentDate,
      previousDate: null,
    };
  }

  if (!previousEntry) {
    return {
      status: 'unavailable',
      reason: 'no_previous_edition',
      currentDate,
      previousDate: null,
    };
  }

  if (previousLoadError) {
    return {
      status: 'unavailable',
      reason: 'previous_load_failed',
      currentDate,
      previousDate: previousEntry.date,
      errorMessage: previousLoadError,
    };
  }

  if (!previousEdition) {
    return {
      status: 'loading',
      currentDate,
      previousDate: previousEntry.date,
    };
  }

  if (
    previousEdition.signals.length === 0 &&
    previousEdition.validation.errors.length > 0
  ) {
    return {
      status: 'unavailable',
      reason: 'incomplete_history',
      currentDate,
      previousDate: previousEntry.date,
      errorMessage: previousEdition.validation.errors[0]?.message,
    };
  }

  const diff = compareEditions(previousEdition, currentEdition);
  const dayGapCount = computeCalendarDayGap(
    previousEdition.frontmatter.edition_date,
    currentEdition.frontmatter.edition_date
  );

  return {
    status: 'ready',
    currentDate: currentEdition.frontmatter.edition_date,
    previousDate: previousEdition.frontmatter.edition_date,
    currentSchemaVersion: currentEdition.frontmatter.schema_version,
    previousSchemaVersion: previousEdition.frontmatter.schema_version,
    hasDateGap: dayGapCount > 1,
    dayGapCount,
    diff,
  };
}

/**
 * Selects the items belonging to one of the four Daily Delta categories in deterministic order.
 */
export function getDeltaItemsForCategory(
  diff: EditionDiff,
  category: EditionChangeKind
): EditionSignalChange[] {
  if (category === 'omitted') {
    return diff.omitted;
  }
  return diff.changes.filter((change) => change.kind === category);
}

/**
 * Chooses the initial active category for a newly loaded comparison, prioritizing
 * materially updated signals, then new signals, then omitted, then unchanged.
 */
export function resolveDefaultDeltaCategory(diff: EditionDiff): EditionChangeKind {
  if (diff.summary.materiallyUpdatedSignals > 0) return 'updated';
  if (diff.summary.newSignals > 0) return 'new';
  if (diff.summary.omittedSignals > 0) return 'omitted';
  return 'unchanged';
}

/**
 * Resolves the exact target edition and signal ID for opening a Daily Delta item.
 * Omitted signals ALWAYS target the previous edition where the signal actually exists.
 */
export function resolveSignalNavigationTarget(
  change: EditionSignalChange,
  currentEditionDate: string,
  previousEditionDate: string | null
): DeltaSignalNavigationTarget | null {
  if (change.kind === 'omitted') {
    if (!previousEditionDate || !ISO_DATE_RE.test(previousEditionDate)) {
      return null;
    }
    return {
      editionDate: previousEditionDate,
      signalId: change.signalId,
      isOmittedNavigation: true,
    };
  }

  if (!ISO_DATE_RE.test(currentEditionDate)) {
    return null;
  }

  return {
    editionDate: currentEditionDate,
    signalId: change.signalId,
    isOmittedNavigation: false,
  };
}

/**
 * Returns the canonical signal snapshot to display metadata for a delta row
 * (current snapshot for new/updated/unchanged; previous snapshot for omitted).
 */
export function getDisplaySignalForChange(
  change: EditionSignalChange
): ParsedSignal | null {
  return change.kind === 'omitted' ? change.previous : change.current;
}

/**
 * Resolves a source lookup key (matching compareEditions' sourceKey convention)
 * against a signal's structured source ledger.
 */
export function buildSourceLookupKey(source: SignalSource): string {
  return source.url.trim() || `${source.outlet.trim()}::${source.title.trim()}`;
}

export function resolveClaimForDelta(
  change: EditionSignalChange,
  claimId: string,
  preferPrevious = false
): SignalClaim | null {
  const primary = preferPrevious ? change.previous : change.current;
  const fallback = preferPrevious ? change.current : change.previous;
  return (
    primary?.claims.find((claim) => claim.claim_id === claimId) ??
    fallback?.claims.find((claim) => claim.claim_id === claimId) ??
    null
  );
}

export function resolveSourceForDelta(
  change: EditionSignalChange,
  sourceKey: string,
  preferPrevious = false
): SignalSource | null {
  const primary = preferPrevious ? change.previous : change.current;
  const fallback = preferPrevious ? change.current : change.previous;
  return (
    primary?.sources.find((src) => buildSourceLookupKey(src) === sourceKey) ??
    fallback?.sources.find((src) => buildSourceLookupKey(src) === sourceKey) ??
    null
  );
}

/**
 * Extracts a concise, evidence-grounded Schema v2 update summary ONLY when the
 * signal is classified as `updated` by `compareEditions()` and the v2 update metadata
 * is consistent with the compared previous edition.
 */
export function getVerifiedUpdateSummary(
  change: EditionSignalChange,
  previousEditionDate: string
): string | null {
  if (change.kind !== 'updated') return null;
  const update = change.current?.update;
  if (!update || !update.summary.trim()) return null;
  if (
    update.previous_edition &&
    update.previous_edition.trim() !== previousEditionDate
  ) {
    return null;
  }
  return update.summary.trim();
}
