import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  EditionIndexEntry,
  EditionsIndex,
  ParsedEdition,
} from '../types/edition';
import { fetchEditionsIndex } from '../lib/content/editionClient';
import { LatestEditionLoader } from '../lib/content/editionLoader';
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
  const indexAbortRef = useRef<AbortController | null>(null);
  const loaderRef = useRef<LatestEditionLoader | null>(null);
  if (!loaderRef.current) {
    loaderRef.current = new LatestEditionLoader();
  }

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

  const abortActiveRequests = useCallback(() => {
    indexAbortRef.current?.abort();
    indexAbortRef.current = null;
    loaderRef.current?.cancelPending();
  }, []);

  useEffect(() => {
    let cancelled = false;
    abortActiveRequests();
    const requestVersion = ++requestVersionRef.current;
    const indexController = new AbortController();
    indexAbortRef.current = indexController;

    async function bootstrap() {
      setIsLoading(true);
      setError(null);
      try {
        const loadedIndex = await fetchEditionsIndex({ signal: indexController.signal });
        if (cancelled || requestVersion !== requestVersionRef.current) return;
        setIndex(loadedIndex);

        const target = pickTargetEntry(loadedIndex, initialDateRef.current);
        if (!target) {
          setActiveEntry(null);
          setEdition(null);
          setIsLoading(false);
          return;
        }

        await loaderRef.current!.load(target, {
          onStart: () => {
            if (cancelled || requestVersion !== requestVersionRef.current) return;
            setIsLoading(true);
            setError(null);
          },
          onSuccess: (entry, parsed) => {
            if (cancelled || requestVersion !== requestVersionRef.current) return;
            setActiveEntry(entry);
            setEdition(parsed);
            setError(null);
          },
          onError: (_entry, message) => {
            if (cancelled || requestVersion !== requestVersionRef.current) return;
            setError(message);
          },
          onSettled: () => {
            if (cancelled || requestVersion !== requestVersionRef.current) return;
            setIsLoading(false);
          },
        });
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        if (!cancelled && requestVersion === requestVersionRef.current) {
          setError(err instanceof Error ? err.message : 'Failed to load WORLD SIGNAL archive.');
          setIsLoading(false);
        }
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
      abortActiveRequests();
    };
  }, [abortActiveRequests, pickTargetEntry]);

  const selectEditionEntry = useCallback(
    async (entry: EditionIndexEntry) => {
      abortActiveRequests();
      const requestVersion = ++requestVersionRef.current;
      await loaderRef.current!.load(entry, {
        onStart: () => {
          if (requestVersion !== requestVersionRef.current) return;
          setIsLoading(true);
          setIsRefreshing(false);
          setRefreshFeedback(null);
          setError(null);
        },
        onSuccess: (loadedEntry, parsed) => {
          if (requestVersion !== requestVersionRef.current) return;
          setActiveEntry(loadedEntry);
          setEdition(parsed);
          setError(null);
        },
        onError: (_loadedEntry, message) => {
          if (requestVersion !== requestVersionRef.current) return;
          setError(message);
        },
        onSettled: () => {
          if (requestVersion !== requestVersionRef.current) return;
          setIsLoading(false);
        },
      });
    },
    [abortActiveRequests]
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
    abortActiveRequests();
    const requestVersion = ++requestVersionRef.current;
    const indexController = new AbortController();
    indexAbortRef.current = indexController;

    setIsRefreshing(true);
    setError(null);
    setRefreshFeedback(null);
    try {
      const freshIndex = await fetchEditionsIndex({
        forceRefresh: true,
        signal: indexController.signal,
      });
      if (requestVersion !== requestVersionRef.current) return;
      setIndex(freshIndex);

      const targetDate = activeEntry?.date ?? freshIndex.latest_edition;
      const target = pickTargetEntry(freshIndex, targetDate);
      if (!target) {
        setActiveEntry(null);
        setEdition(null);
        setIsRefreshing(false);
        return;
      }

      const revisionChanged =
        !activeEntry ||
        activeEntry.path !== target.path ||
        activeEntry.updated_at !== target.updated_at;

      await loaderRef.current!.load(
        target,
        {
          onStart: () => {
            if (requestVersion !== requestVersionRef.current) return;
            setIsRefreshing(true);
          },
          onSuccess: (loadedEntry, parsed) => {
            if (requestVersion !== requestVersionRef.current) return;
            setActiveEntry(loadedEntry);
            setEdition(parsed);
            setError(null);
            setRefreshFeedback(
              revisionChanged
                ? `${loadedEntry.date} · ${loadedEntry.updated_at}`
                : loadedEntry.updated_at
            );
          },
          onError: (_loadedEntry, message) => {
            if (requestVersion !== requestVersionRef.current) return;
            setError(message);
          },
          onSettled: () => {
            if (requestVersion !== requestVersionRef.current) return;
            setIsRefreshing(false);
          },
        },
        { forceRefresh: true }
      );
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      if (requestVersion === requestVersionRef.current) {
        setError(err instanceof Error ? err.message : 'Unable to refresh archive.');
        setIsRefreshing(false);
      }
    }
  }, [abortActiveRequests, activeEntry, pickTargetEntry]);

  const loadLocalMarkdown = useCallback(
    (markdown: string, label: string) => {
      abortActiveRequests();
      ++requestVersionRef.current;
      setIsLoading(false);
      setIsRefreshing(false);
      setError(null);
      setRefreshFeedback(null);
      setEdition(parseEditionMarkdown(markdown, label, { isLocalPreview: true }));
    },
    [abortActiveRequests]
  );

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
