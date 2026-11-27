import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  EditionsIndex,
  ParsedEdition,
  SignalDomain,
} from '../types/edition';
import {
  fetchAndParseEdition,
  getCachedEdition,
} from '../lib/content/editionClient';
import {
  clearAllLocalReaderData,
  evaluateFollowedSignals,
  followSignalInReaderState,
  followTopicInReaderState,
  loadReaderState,
  saveReaderState,
  saveSignalToReaderState,
  unfollowSignalInReaderState,
  unfollowTopicInReaderState,
  unsaveSignalFromReaderState,
  type FollowedSignalStatus,
  type ReaderState,
  type ReaderStorageWarning,
} from '../lib/intelligence/reader-state/readerState';
import {
  buildCatchUpReport,
  buildCompactReviewedSnapshot,
  loadCompactReviewedSnapshot,
  saveCompactReviewedSnapshot,
  type CatchUpState,
  type CompactReviewedEditionSnapshot,
} from '../lib/intelligence/catch-up/catchUpEngine';

export interface SignalBookmarkInput {
  signalId: string;
  editionDate: string;
  headline: string;
  domain: SignalDomain;
}

export interface UseReaderDeskParams {
  index: EditionsIndex | null;
  currentEdition: ParsedEdition | null;
  isDeskOpen: boolean;
}

export interface UseReaderDeskResult {
  readerState: ReaderState;
  storageWarning: ReaderStorageWarning | null;
  dismissStorageWarning: () => void;
  isSaved: (signalId: string) => boolean;
  isFollowed: (signalId: string) => boolean;
  toggleSave: (input: SignalBookmarkInput) => void;
  toggleFollow: (input: SignalBookmarkInput) => void;
  addTopic: (topic: string) => void;
  removeTopic: (topic: string) => void;
  markAsReviewed: (edition: ParsedEdition) => void;
  clearAllData: () => void;
  followedStatuses: FollowedSignalStatus[];
  isLoadingFollowedHistory: boolean;
  catchUp: CatchUpState | null;
  savedCount: number;
  followedCount: number;
}

export function useReaderDesk({
  index,
  currentEdition,
  isDeskOpen,
}: UseReaderDeskParams): UseReaderDeskResult {
  const initialLoad = useMemo(() => loadReaderState(), []);
  const [readerState, setReaderState] = useState<ReaderState>(initialLoad.state);
  const [storageWarning, setStorageWarning] =
    useState<ReaderStorageWarning | null>(initialLoad.warning);
  const [localSnapshot, setLocalSnapshot] =
    useState<CompactReviewedEditionSnapshot | null>(() =>
      loadCompactReviewedSnapshot()
    );

  // Archived baseline edition loaded on demand ONLY when lastReviewedEditionDate
  // differs from currentEdition and no local snapshot matches.
  const [archivedBaseline, setArchivedBaseline] = useState<ParsedEdition | null>(
    null
  );

  // Historical editions loaded lazily ONLY when Reader Desk is open and user has followed signals
  const [deskHistoryEditions, setDeskHistoryEditions] = useState<
    Map<string, ParsedEdition>
  >(() => new Map());
  const [isLoadingFollowedHistory, setIsLoadingFollowedHistory] = useState(false);

  const baselineAbortRef = useRef<AbortController | null>(null);
  const deskHistoryAbortRef = useRef<AbortController | null>(null);

  const persistState = useCallback((updater: (prev: ReaderState) => ReaderState) => {
    setReaderState((prev) => {
      const next = updater(prev);
      const outcome = saveReaderState(next);
      if (outcome.warning) {
        setStorageWarning(outcome.warning);
      }
      return next;
    });
  }, []);

  const savedIdSet = useMemo(
    () => new Set(readerState.savedSignals.map((item) => item.signalId)),
    [readerState.savedSignals]
  );

  const followedIdSet = useMemo(
    () => new Set(readerState.followedSignals.map((item) => item.signalId)),
    [readerState.followedSignals]
  );

  const isSaved = useCallback(
    (signalId: string) => savedIdSet.has(signalId),
    [savedIdSet]
  );

  const isFollowed = useCallback(
    (signalId: string) => followedIdSet.has(signalId),
    [followedIdSet]
  );

  const toggleSave = useCallback(
    (input: SignalBookmarkInput) => {
      persistState((prev) =>
        prev.savedSignals.some((item) => item.signalId === input.signalId)
          ? unsaveSignalFromReaderState(prev, input.signalId)
          : saveSignalToReaderState(prev, input)
      );
    },
    [persistState]
  );

  const toggleFollow = useCallback(
    (input: SignalBookmarkInput) => {
      persistState((prev) =>
        prev.followedSignals.some((item) => item.signalId === input.signalId)
          ? unfollowSignalInReaderState(prev, input.signalId)
          : followSignalInReaderState(prev, input)
      );
    },
    [persistState]
  );

  const addTopic = useCallback(
    (topic: string) => {
      persistState((prev) => followTopicInReaderState(prev, topic));
    },
    [persistState]
  );

  const removeTopic = useCallback(
    (topic: string) => {
      persistState((prev) => unfollowTopicInReaderState(prev, topic));
    },
    [persistState]
  );

  const markAsReviewed = useCallback(
    (edition: ParsedEdition) => {
      if (edition.isLocalPreview) return;
      const nowIso = new Date().toISOString();
      const snapshot = buildCompactReviewedSnapshot(edition, nowIso);
      const savedSnap = saveCompactReviewedSnapshot(snapshot);
      if (!savedSnap) {
        setStorageWarning('quota_exceeded');
      } else {
        setLocalSnapshot(snapshot);
      }
      persistState((prev) => ({
        ...prev,
        lastReviewedEditionDate: edition.frontmatter.edition_date,
        lastReviewedAt: nowIso,
        reviewedSnapshotMetadata: {
          editionDate: edition.frontmatter.edition_date,
          editionUpdatedAt: edition.frontmatter.updated_at,
          signalCount: edition.signals.length,
          hasCompactSnapshot: savedSnap,
        },
      }));
    },
    [persistState]
  );

  const clearAllData = useCallback(() => {
    const empty = clearAllLocalReaderData();
    setReaderState(empty);
    setLocalSnapshot(null);
    setArchivedBaseline(null);
    setStorageWarning(null);
  }, []);

  const dismissStorageWarning = useCallback(() => {
    setStorageWarning(null);
  }, []);

  // Load ONLY the single archived baseline edition if needed for catch-up
  useEffect(() => {
    baselineAbortRef.current?.abort();
    baselineAbortRef.current = null;

    const reviewedDate = readerState.lastReviewedEditionDate;
    if (
      !reviewedDate ||
      !currentEdition ||
      currentEdition.isLocalPreview ||
      !index
    ) {
      setArchivedBaseline(null);
      return;
    }

    // Same-day reviews rely on the compact local snapshot (since canonical file is overwritten)
    if (reviewedDate === currentEdition.frontmatter.edition_date) {
      setArchivedBaseline(null);
      return;
    }

    const baselineEntry = index.editions.find((e) => e.date === reviewedDate);
    if (!baselineEntry) {
      setArchivedBaseline(null);
      return;
    }

    const cached = getCachedEdition(baselineEntry.path, baselineEntry.updated_at);
    if (cached) {
      setArchivedBaseline(cached);
      return;
    }

    const controller = new AbortController();
    baselineAbortRef.current = controller;

    fetchAndParseEdition(baselineEntry.path, {
      revisionKey: baselineEntry.updated_at,
      signal: controller.signal,
    })
      .then((parsed) => {
        if (!controller.signal.aborted) {
          setArchivedBaseline(parsed);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setArchivedBaseline(null);
        }
      });

    return () => {
      controller.abort();
    };
  }, [
    currentEdition,
    index,
    readerState.lastReviewedEditionDate,
  ]);

  // Lazily load historical editions ONLY when Reader Desk is opened and user follows signals
  useEffect(() => {
    deskHistoryAbortRef.current?.abort();
    deskHistoryAbortRef.current = null;

    const editions = index?.editions ?? [];
    const initial = new Map<string, ParsedEdition>();
    for (const entry of editions) {
      const cached = getCachedEdition(entry.path, entry.updated_at);
      if (cached) initial.set(entry.date, cached);
    }
    if (currentEdition && !currentEdition.isLocalPreview) {
      initial.set(currentEdition.frontmatter.edition_date, currentEdition);
    }
    setDeskHistoryEditions(initial);

    if (!isDeskOpen || readerState.followedSignals.length === 0 || editions.length === 0) {
      setIsLoadingFollowedHistory(false);
      return;
    }

    const missing = editions.filter((entry) => !initial.has(entry.date));
    if (missing.length === 0) {
      setIsLoadingFollowedHistory(false);
      return;
    }

    const controller = new AbortController();
    deskHistoryAbortRef.current = controller;
    setIsLoadingFollowedHistory(true);

    async function loadForDesk() {
      for (let i = 0; i < missing.length; i += 2) {
        if (controller.signal.aborted) return;
        const batch = missing.slice(i, i + 2);
        const settled = await Promise.allSettled(
          batch.map(async (entry) => {
            const parsed = await fetchAndParseEdition(entry.path, {
              revisionKey: entry.updated_at,
              signal: controller.signal,
            });
            return { date: entry.date, parsed };
          })
        );
        if (controller.signal.aborted) return;

        const loaded: Array<{ date: string; parsed: ParsedEdition }> = [];
        for (const res of settled) {
          if (res.status === 'fulfilled') {
            loaded.push(res.value);
          }
        }
        if (loaded.length > 0) {
          setDeskHistoryEditions((prev) => {
            const next = new Map(prev);
            for (const item of loaded) {
              next.set(item.date, item.parsed);
            }
            return next;
          });
        }
      }
      if (!controller.signal.aborted) {
        setIsLoadingFollowedHistory(false);
      }
    }

    void loadForDesk();

    return () => {
      controller.abort();
    };
  }, [currentEdition, index?.editions, isDeskOpen, readerState.followedSignals.length]);

  const followedStatuses = useMemo(() => {
    const loadedEditions = Array.from(deskHistoryEditions.values());
    return evaluateFollowedSignals({
      followed: readerState.followedSignals,
      loadedEditions,
      latestArchiveEditionDate:
        index?.latest_edition ?? currentEdition?.frontmatter.edition_date ?? null,
    });
  }, [
    currentEdition?.frontmatter.edition_date,
    deskHistoryEditions,
    index?.latest_edition,
    readerState.followedSignals,
  ]);

  const historicalKnownSignalIds = useMemo(() => {
    const reviewedDate = readerState.lastReviewedEditionDate;
    if (!reviewedDate) return undefined;
    const ids = new Set<string>();
    for (const [date, ed] of deskHistoryEditions.entries()) {
      if (date < reviewedDate) {
        for (const sig of ed.signals) {
          ids.add(sig.signal_id);
        }
      }
    }
    return ids.size > 0 ? ids : undefined;
  }, [deskHistoryEditions, readerState.lastReviewedEditionDate]);

  const catchUp = useMemo<CatchUpState | null>(() => {
    if (!currentEdition || currentEdition.isLocalPreview) return null;
    return buildCatchUpReport({
      readerState,
      currentEdition,
      archivedBaselineEdition: archivedBaseline,
      localReviewedSnapshot: localSnapshot,
      historicalKnownSignalIds,
    });
  }, [
    archivedBaseline,
    currentEdition,
    historicalKnownSignalIds,
    localSnapshot,
    readerState,
  ]);

  return {
    readerState,
    storageWarning,
    dismissStorageWarning,
    isSaved,
    isFollowed,
    toggleSave,
    toggleFollow,
    addTopic,
    removeTopic,
    markAsReviewed,
    clearAllData,
    followedStatuses,
    isLoadingFollowedHistory,
    catchUp,
    savedCount: readerState.savedSignals.length,
    followedCount: readerState.followedSignals.length,
  };
}
