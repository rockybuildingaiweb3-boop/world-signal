import type { ParsedEdition, ParsedSignal } from '../../../types/edition';
import { compareSignalSnapshots, type SignalChangeReason } from '../edition-diff/compareEditions';

export type StorylineRevisionKind =
  | 'first_seen'
  | 'material_update'
  | 'unchanged'
  | 'reappeared';

export interface StorylineRevision {
  editionDate: string;
  previousEditionDate: string | null;
  kind: StorylineRevisionKind;
  reasons: SignalChangeReason[];
  signal: ParsedSignal;
}

export interface StorylineRecord {
  signalId: string;
  headline: string;
  domain: ParsedSignal['domain'];
  firstSeenEdition: string;
  lastSeenEdition: string;
  lastMaterialUpdateEdition: string;
  appearanceCount: number;
  lifecycleStatus: ParsedSignal['status'];
  history: StorylineRevision[];
  latestSignal: ParsedSignal;
}

/**
 * Builds deterministic event histories from a set of already-parsed editions.
 * Edition absence never implies a resolved event; it is recorded only as a gap.
 */
export function buildStorylineIndex(editions: ParsedEdition[]): StorylineRecord[] {
  const orderedEditions = [...editions].sort((a, b) =>
    a.frontmatter.edition_date.localeCompare(b.frontmatter.edition_date)
  );
  const records = new Map<string, StorylineRecord>();
  let previousEditionDate: string | null = null;

  for (const edition of orderedEditions) {
    const editionDate = edition.frontmatter.edition_date;
    const seenThisEdition = new Set<string>();

    for (const signal of edition.signals) {
      if (seenThisEdition.has(signal.signal_id)) continue;
      seenThisEdition.add(signal.signal_id);

      const existing = records.get(signal.signal_id);
      if (!existing) {
        records.set(signal.signal_id, {
          signalId: signal.signal_id,
          headline: signal.headline,
          domain: signal.domain,
          firstSeenEdition: editionDate,
          lastSeenEdition: editionDate,
          lastMaterialUpdateEdition: editionDate,
          appearanceCount: 1,
          lifecycleStatus: signal.status,
          history: [{
            editionDate,
            previousEditionDate: null,
            kind: 'first_seen',
            reasons: [],
            signal,
          }],
          latestSignal: signal,
        });
        continue;
      }

      const diff = compareSignalSnapshots(existing.latestSignal, signal);
      const returnedAfterGap = existing.lastSeenEdition !== previousEditionDate;
      const kind: StorylineRevisionKind = returnedAfterGap
        ? 'reappeared'
        : diff.kind === 'updated'
          ? 'material_update'
          : 'unchanged';

      existing.history.push({
        editionDate,
        previousEditionDate: existing.lastSeenEdition,
        kind,
        reasons: diff.reasons,
        signal,
      });
      existing.lastSeenEdition = editionDate;
      existing.appearanceCount += 1;
      if (diff.kind === 'updated') existing.lastMaterialUpdateEdition = editionDate;
      existing.headline = signal.headline;
      existing.domain = signal.domain;
      existing.lifecycleStatus = signal.status;
      existing.latestSignal = signal;
    }

    previousEditionDate = editionDate;
  }

  return Array.from(records.values()).sort((a, b) =>
    b.lastMaterialUpdateEdition.localeCompare(a.lastMaterialUpdateEdition) ||
    a.signalId.localeCompare(b.signalId)
  );
}
