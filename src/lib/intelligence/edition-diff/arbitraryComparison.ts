import type { EditionIndexEntry, ParsedEdition } from '../../../types/edition';
import { compareEditions, type EditionDiff } from './compareEditions';
import { computeCalendarDayGap } from '../daily-delta/dailyDeltaHelpers';

export type ComparisonValidationError =
  | 'insufficient_archive'
  | 'missing_date'
  | 'invalid_date_not_in_archive'
  | 'same_edition_selected';

export interface ValidatedComparisonPair {
  valid: true;
  olderEntry: EditionIndexEntry;
  newerEntry: EditionIndexEntry;
  wasReversedInput: boolean;
  dayGapCount: number;
}

export interface InvalidComparisonPair {
  valid: false;
  error: ComparisonValidationError;
}

export type ComparisonPairValidationResult =
  | ValidatedComparisonPair
  | InvalidComparisonPair;

export interface ArbitraryComparisonResult {
  fromDate: string;
  toDate: string;
  wasReversedInput: boolean;
  dayGapCount: number;
  fromSchemaVersion: number;
  toSchemaVersion: number;
  diff: EditionDiff;
}

/**
 * Validates any two selected edition dates strictly against real archive entries.
 * Prevents same-date comparison and fabricated dates, and normalizes ordering
 * chronologically (older -> newer) so `compareEditions(previous, current)` always
 * reflects forward editorial progression.
 */
export function validateComparisonPair(
  editions: readonly EditionIndexEntry[],
  fromDate: string | null | undefined,
  toDate: string | null | undefined
): ComparisonPairValidationResult {
  if (editions.length < 2) {
    return { valid: false, error: 'insufficient_archive' };
  }

  const cleanFrom = fromDate?.trim() ?? '';
  const cleanTo = toDate?.trim() ?? '';
  if (!cleanFrom || !cleanTo) {
    return { valid: false, error: 'missing_date' };
  }

  if (cleanFrom === cleanTo) {
    return { valid: false, error: 'same_edition_selected' };
  }

  const fromEntry = editions.find((e) => e.date === cleanFrom);
  const toEntry = editions.find((e) => e.date === cleanTo);
  if (!fromEntry || !toEntry) {
    return { valid: false, error: 'invalid_date_not_in_archive' };
  }

  const wasReversedInput = fromEntry.date > toEntry.date;
  const olderEntry = wasReversedInput ? toEntry : fromEntry;
  const newerEntry = wasReversedInput ? fromEntry : toEntry;

  return {
    valid: true,
    olderEntry,
    newerEntry,
    wasReversedInput,
    dayGapCount: computeCalendarDayGap(olderEntry.date, newerEntry.date),
  };
}

/**
 * Computes a deterministic arbitrary comparison between any two loaded editions
 * strictly via `compareEditions(previous, current)`.
 */
export function buildArbitraryEditionComparison(params: {
  olderEdition: ParsedEdition;
  newerEdition: ParsedEdition;
  wasReversedInput?: boolean;
}): ArbitraryComparisonResult {
  const { olderEdition, newerEdition, wasReversedInput = false } = params;
  const fromDate = olderEdition.frontmatter.edition_date;
  const toDate = newerEdition.frontmatter.edition_date;

  return {
    fromDate,
    toDate,
    wasReversedInput,
    dayGapCount: computeCalendarDayGap(fromDate, toDate),
    fromSchemaVersion: olderEdition.frontmatter.schema_version,
    toSchemaVersion: newerEdition.frontmatter.schema_version,
    diff: compareEditions(olderEdition, newerEdition),
  };
}

/**
 * Picks a sensible default edition pair from available archive entries
 * (oldest vs latest if >= 2 entries, or immediately preceding vs latest).
 */
export function resolveDefaultComparisonDates(
  editions: readonly EditionIndexEntry[],
  activeEditionDate?: string | null
): { fromDate: string; toDate: string } | null {
  if (editions.length < 2) return null;
  const sortedDesc = [...editions].sort((a, b) => b.date.localeCompare(a.date));
  const toEntry =
    (activeEditionDate
      ? sortedDesc.find((e) => e.date === activeEditionDate)
      : null) ?? sortedDesc[0];
  const olderCandidates = sortedDesc.filter((e) => e.date < toEntry.date);
  if (olderCandidates.length > 0) {
    // Pick the earliest or immediately previous edition — pick oldest for immediate multi-day insight if >2, or previous
    const fromEntry = olderCandidates[0];
    return { fromDate: fromEntry.date, toDate: toEntry.date };
  }
  return {
    fromDate: sortedDesc[1].date,
    toDate: sortedDesc[0].date,
  };
}
