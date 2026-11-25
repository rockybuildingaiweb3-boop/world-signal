import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  EditionIndexEntry,
  EditionsIndex,
  ParsedEdition,
} from '../types/edition';
import {
  fetchAndParseEdition,
  fetchEditionsIndex,
} from '../lib/content/editionClient';
import { parseEditionMarkdown } from '../lib/markdown/parseEdition';

export interface UseArchiveResult {
  index: EditionsIndex | null;
  activeEntry: EditionIndexEntry | null;
  edition: ParsedEdition | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refreshFeedback: string | null;
  selectEditionEntry: (entry: EditionIndexEntry) => Promise<void>;
  selectEditionByDate: (date: string) => Promise<void>;
  refreshArchive: () => Promise<void>;
  loadLocalMarkdown: (markdown: string, label: string) => void;
  exitLocalPreview: () => Promise<void>;
}

export function useArchive(initialRequestedDate: string | null): UseArchiveResult {
  const [index, setIndex] = useState<EditionsIndex | null>(null);
  const [activeEntry, setActiveEntry] = useState<EditionIndexEntry | null>(null);
  const [edition, setEdition] = useState<ParsedEdition | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshFeedback, setRefreshFeedback] = useState<string | null>(null);

  const initialDateRef = useRef<string | null>(initialRequestedDate);
  const requestVersionRef = useRef(0);

  const pickTargetEntry = useCallback(
    (idx: EditionsIndex, preferredDate: string | null): EditionIndexEntry | null => {
      if (idx.editions.length === 0) return null;
      if (preferredDate) {
        const exact = idx.editions.find((entry) => entry.date === preferredDate);
        if (exact) return exact;
      }
      if (idx.latest_edition) {
        const latest = idx.editions.find((entry) => entry.date === idx.latest_edition);
        if (latest) return latest;
      }
      return idx.editions[0];
    },
    []
  );

  const loadEntry = useCallback(
    async (entry: EditionIndexEntry, requestVersion: number, forceRefresh = false) => {
      try {
        const parsed = await fetchAndParseEdition(entry.path, {
          revisionKey: entry.updated_at,
          forceRefresh,
        });
        if (requestVersion !== requestVersionRef.current) return;
        setActiveEntry(entry);
        setEdition(parsed);
        setError(null);
      } catch (err) {
        if (requestVersion === requestVersionRef.current) {
          setError(err instanceof Error ? err.message : 'Unable to load edition file.');
        }
      }
    },
    []
  );

  useEffect(() => {
    let cancelled = false;
    const requestVersion = ++requestVersionRef.current;

    async function bootstrap() {
      setIsLoading(true);
      setError(null);
      try {
        const loadedIndex = await fetchEditionsIndex();
        if (cancelled || requestVersion !== requestVersionRef.current) return;
        setIndex(loadedIndex);

        const target = pickTargetEntry(loadedIndex, initialDateRef.current);
        if (!target) {
          setActiveEntry(null);
          setEdition(null);
          return;
        }

        const parsed = await fetchAndParseEdition(target.path, {
          revisionKey: target.updated_at,
        });
        if (cancelled || requestVersion !== requestVersionRef.current) return;
        setActiveEntry(target);
        setEdition(parsed);
      } catch (err) {
        if (!cancelled && requestVersion === requestVersionRef.current) {
          setError(err instanceof Error ? err.message : 'Failed to load WORLD SIGNAL archive.');
        }
      } finally {
        if (!cancelled && requestVersion === requestVersionRef.current) {
          setIsLoading(false);
        }
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [pickTargetEntry]);

  const selectEditionEntry = useCallback(
    async (entry: EditionIndexEntry) => {
      const requestVersion = ++requestVersionRef.current;
      setIsLoading(true);
      setIsRefreshing(false);
      setRefreshFeedback(null);
      setError(null);
      await loadEntry(entry, requestVersion);
      if (requestVersion === requestVersionRef.current) setIsLoading(false);
    },
    [loadEntry]
  );

  const selectEditionByDate = useCallback(
    async (date: string) => {
      if (!index) return;
      const entry = index.editions.find((candidate) => candidate.date === date);
      if (entry) await selectEditionEntry(entry);
    },
    [index, selectEditionEntry]
  );

  const refreshArchive = useCallback(async () => {
    const requestVersion = ++requestVersionRef.current;
    setIsRefreshing(true);
    setError(null);
    setRefreshFeedback(null);
    try {
      const freshIndex = await fetchEditionsIndex({ forceRefresh: true });
      if (requestVersion !== requestVersionRef.current) return;
      setIndex(freshIndex);

      const targetDate = activeEntry?.date ?? freshIndex.latest_edition;
      const target = pickTargetEntry(freshIndex, targetDate);
      if (!target) {
        setActiveEntry(null);
        setEdition(null);
        return;
      }

      const revisionChanged =
        !activeEntry ||
        activeEntry.path !== target.path ||
        activeEntry.updated_at !== target.updated_at;

      const parsed = await fetchAndParseEdition(target.path, {
        revisionKey: target.updated_at,
        forceRefresh: true,
      });
      if (requestVersion !== requestVersionRef.current) return;

      setActiveEntry(target);
      setEdition(parsed);
      setRefreshFeedback(
        revisionChanged ? `${target.date} · ${target.updated_at}` : target.updated_at
      );
    } catch (err) {
      if (requestVersion === requestVersionRef.current) {
        setError(err instanceof Error ? err.message : 'Unable to refresh archive.');
      }
    } finally {
      if (requestVersion === requestVersionRef.current) setIsRefreshing(false);
    }
  }, [activeEntry, pickTargetEntry]);

  const loadLocalMarkdown = useCallback((markdown: string, label: string) => {
    ++requestVersionRef.current;
    setIsLoading(false);
    setIsRefreshing(false);
    setError(null);
    setRefreshFeedback(null);
    setEdition(parseEditionMarkdown(markdown, label, { isLocalPreview: true }));
  }, []);

  const exitLocalPreview = useCallback(async () => {
    if (!index) return;
    const target = pickTargetEntry(index, activeEntry?.date ?? null);
    if (target) await selectEditionEntry(target);
  }, [activeEntry?.date, index, pickTargetEntry, selectEditionEntry]);

  return {
    index,
    activeEntry,
    edition,
    isLoading,
    isRefreshing,
    error,
    refreshFeedback,
    selectEditionEntry,
    selectEditionByDate,
    refreshArchive,
    loadLocalMarkdown,
    exitLocalPreview,
  };
}
