import type {
  ParsedEdition,
  ParsedSignal,
  SignalDomain,
  SignalStatus,
} from '../../../types/edition';
import {
  compareSignalSnapshots,
  type SignalSnapshotDiff,
} from '../edition-diff/compareEditions';
import {
  buildStorylineIndex,
  type StorylineRecord,
  type StorylineRevision,
  type StorylineRevisionKind,
} from './buildStorylineIndex';

export interface StorylineRevisionDetail {
  editionDate: string;
  previousEditionDate: string | null;
  kind: StorylineRevisionKind;
  signal: ParsedSignal;
  previousSignal: ParsedSignal | null;
  diff: SignalSnapshotDiff;
  gapDaysFromPrevious: number;
  schemaVersion: number;
}

export interface StorylineCoverageSummary {
  loadedEditionCount: number;
  totalArchiveEditionCount: number;
  failedEditionDates: string[];
  earliestLoadedEdition: string | null;
  latestLoadedEdition: string | null;
  isArchiveCoverageComplete: boolean;
  /** True when the latest snapshot explicitly declares schema-v2 continuity.history_complete === false */
  metadataReportsIncompleteHistory: boolean;
  /** True when the signal is absent from the newest loaded edition (omission, never fabricated resolution) */
  absentFromLatestLoadedEdition: boolean;
}

export interface SignalStorylineProjection {
  signalId: string;
  headline: string;
  domain: SignalDomain;
  firstAvailableAppearance: string;
  lastAvailableAppearance: string;
  lastMaterialUpdate: string;
  appearanceCount: number;
  lifecycleStatus: SignalStatus;
  schemaV2Lifecycle: ParsedSignal['continuity'] extends infer T ? T : undefined;
  revisions: StorylineRevisionDetail[];
  latestSignal: ParsedSignal;
  coverage: StorylineCoverageSummary;
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function daysBetween(olderDate: string, newerDate: string): number {
  if (!ISO_DATE_RE.test(olderDate) || !ISO_DATE_RE.test(newerDate)) return 0;
  const [y1, m1, d1] = olderDate.split('-').map(Number);
  const [y2, m2, d2] = newerDate.split('-').map(Number);
  const diff = Math.round(
    (Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / (24 * 60 * 60 * 1000)
  );
  return diff > 0 ? diff : 0;
}

/**
 * Projects a detailed, deterministic longitudinal storyline for a single stable
 * `signal_id` from loaded editions. Strictly delegates revision classification
 * to `buildStorylineIndex()` and snapshot diffing to `compareSignalSnapshots()`.
 *
 * Never fabricates historical dates or treats absence as resolution.
 */
export function buildSignalStorylineProjection(params: {
  signalId: string;
  loadedEditions: readonly ParsedEdition[];
  totalArchiveEditionCount: number;
  failedEditionDates?: readonly string[];
}): SignalStorylineProjection | null {
  const {
    signalId,
    loadedEditions,
    totalArchiveEditionCount,
    failedEditionDates = [],
  } = params;

  if (!signalId.trim() || loadedEditions.length === 0) {
    return null;
  }

  const orderedEditions = [...loadedEditions].sort((a, b) =>
    a.frontmatter.edition_date.localeCompare(b.frontmatter.edition_date)
  );

  const schemaVersionByDate = new Map<string, number>();
  for (const edition of orderedEditions) {
    schemaVersionByDate.set(
      edition.frontmatter.edition_date,
      edition.frontmatter.schema_version
    );
  }

  const storylineIndex: StorylineRecord[] = buildStorylineIndex(orderedEditions);
  const record = storylineIndex.find((item) => item.signalId === signalId);
  if (!record) return null;

  const revisions: StorylineRevisionDetail[] = record.history.map(
    (entry: StorylineRevision, idx: number) => {
      const prevEntry = idx > 0 ? record.history[idx - 1] : null;
      const previousSignal = prevEntry?.signal ?? null;
      const diff = compareSignalSnapshots(previousSignal, entry.signal);
      const gapDaysFromPrevious = prevEntry
        ? daysBetween(prevEntry.editionDate, entry.editionDate)
        : 0;

      return {
        editionDate: entry.editionDate,
        previousEditionDate: entry.previousEditionDate,
        kind: entry.kind,
        signal: entry.signal,
        previousSignal,
        diff,
        gapDaysFromPrevious,
        schemaVersion: schemaVersionByDate.get(entry.editionDate) ?? 1,
      };
    }
  );

  const earliestLoadedEdition =
    orderedEditions[0]?.frontmatter.edition_date ?? null;
  const latestLoadedEdition =
    orderedEditions[orderedEditions.length - 1]?.frontmatter.edition_date ?? null;

  const metadataReportsIncompleteHistory =
    record.latestSignal.continuity?.history_complete === false;

  const isArchiveCoverageComplete =
    failedEditionDates.length === 0 &&
    orderedEditions.length >= totalArchiveEditionCount &&
    totalArchiveEditionCount > 0 &&
    !metadataReportsIncompleteHistory;

  const absentFromLatestLoadedEdition = Boolean(
    latestLoadedEdition && record.lastSeenEdition < latestLoadedEdition
  );

  return {
    signalId: record.signalId,
    headline: record.headline,
    domain: record.domain,
    firstAvailableAppearance: record.firstSeenEdition,
    lastAvailableAppearance: record.lastSeenEdition,
    lastMaterialUpdate: record.lastMaterialUpdateEdition,
    appearanceCount: record.appearanceCount,
    lifecycleStatus: record.lifecycleStatus,
    schemaV2Lifecycle: record.latestSignal.continuity,
    revisions,
    latestSignal: record.latestSignal,
    coverage: {
      loadedEditionCount: orderedEditions.length,
      totalArchiveEditionCount,
      failedEditionDates: [...failedEditionDates],
      earliestLoadedEdition,
      latestLoadedEdition,
      isArchiveCoverageComplete,
      metadataReportsIncompleteHistory,
      absentFromLatestLoadedEdition,
    },
  };
}
