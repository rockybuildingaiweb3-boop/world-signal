import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  EditionIndexEntry,
  EditionsIndex,
  ParsedEdition,
} from '../types/edition';
import {
  fetchAndParseEdition,
  getCachedEdition,
} from '../lib/content/editionClient';
import {
  DEFAULT_GLOBAL_SEARCH_FILTERS,
  executeGlobalSearch,
  extractSearchFacets,
  getOrBuildEditionSearchDocs,
  type GlobalSearchFilters,
  type GlobalSearchSortBy,
  type GroupedSearchResult,
  type SearchDocument,
} from '../lib/intelligence/search/searchIndex';

export type SearchIndexingStatus = 'idle' | 'indexing' | 'complete' | 'cancelled';

export interface UseGlobalSearchParams {
  isOpen: boolean;
  index: EditionsIndex | null;
  activeEdition: ParsedEdition | null;
  initialQuery?: string;
  initialFilters?: Partial<GlobalSearchFilters>;
}

export interface UseGlobalSearchResult {
  query: string;
  setQuery: (next: string) => void;
  debouncedQuery: string;
  filters: GlobalSearchFilters;
  setFilters: (next: GlobalSearchFilters) => void;
  resetFilters: () => void;
  sortBy: GlobalSearchSortBy;
  setSortBy: (next: GlobalSearchSortBy) => void;
  status: SearchIndexingStatus;
  indexedCount: number;
  totalEditions: number;
  failedDates: string[];
  malformedCount: number;
  results: GroupedSearchResult[];
  totalOccurrences: number;
  facets: {
    topics: string[];
    tags: string[];
    publishers: string[];
  };
  cancelIndexing: () => void;
  resumeIndexing: () => void;
}

const INDEX_BATCH_SIZE = 2;

export function useGlobalSearch({
  isOpen,
  index,
  activeEdition,
  initialQuery = '',
  initialFilters,
}: UseGlobalSearchParams): UseGlobalSearchResult {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<GlobalSearchFilters>(() => ({
    ...DEFAULT_GLOBAL_SEARCH_FILTERS,
    ...initialFilters,
  }));
  const [sortBy, setSortBy] = useState<GlobalSearchSortBy>('relevance');

  const [docsByDate, setDocsByDate] = useState<Map<string, SearchDocument[]>>(
    () => new Map()
  );
  const [indexedRevisionByDate, setIndexedRevisionByDate] = useState<
    Map<string, string>
  >(() => new Map());
  const [failedDates, setFailedDates] = useState<string[]>([]);
  const [malformedDates, setMalformedDates] = useState<string[]>([]);
  const [status, setStatus] = useState<SearchIndexingStatus>('idle');
  const [resumeNonce, setResumeNonce] = useState(0);

  const abortRef = useRef<AbortController | null>(null);
  const runIdRef = useRef(0);

  // Short debounce on free-text query for snappy typing without sluggish recomputes
  useEffect(() => {
    const trimmed = query;
    if (!trimmed) {
      setDebouncedQuery('');
      return;
    }
    const timer = window.setTimeout(() => {
      setDebouncedQuery(trimmed);
    }, 110);
    return () => window.clearTimeout(timer);
  }, [query]);

  const editions: EditionIndexEntry[] = useMemo(
    () => index?.editions ?? [],
    [index?.editions]
  );

  // Immediately hydrate docs for the active published edition or any already-cached editions
  // without initiating network traffic until the overlay is actually opened.
  useEffect(() => {
    if (!isOpen) return;

    const nextDocs = new Map<string, SearchDocument[]>();
    const nextRevs = new Map<string, string>();
    const nextMalformed: string[] = [];

    if (editions.length > 0) {
      for (const entry of editions) {
        const cached =
          getCachedEdition(entry.path, entry.updated_at) ??
          (!activeEdition?.isLocalPreview &&
          activeEdition?.frontmatter.edition_date === entry.date &&
          activeEdition.frontmatter.updated_at === entry.updated_at
            ? activeEdition
            : null);

        if (cached) {
          const docs = getOrBuildEditionSearchDocs(
            cached,
            entry.path,
            entry.updated_at
          );
          nextDocs.set(entry.date, docs);
          nextRevs.set(entry.date, entry.updated_at);
          if (cached.validation.errors.length > 0) {
            nextMalformed.push(entry.date);
          }
        }
      }
    } else if (activeEdition) {
      const date = activeEdition.frontmatter.edition_date;
      const rev = activeEdition.frontmatter.updated_at || 'local';
      const docs = getOrBuildEditionSearchDocs(
        activeEdition,
        activeEdition.sourceLabel,
        rev
      );
      nextDocs.set(date, docs);
      nextRevs.set(date, rev);
      if (activeEdition.validation.errors.length > 0) {
        nextMalformed.push(date);
      }
    }

    setDocsByDate(nextDocs);
    setIndexedRevisionByDate(nextRevs);
    setMalformedDates(nextMalformed);
  }, [activeEdition, editions, isOpen]);

  // Incrementally index uncached/updated archive editions in small cancellable batches
  useEffect(() => {
    if (!isOpen) {
      abortRef.current?.abort();
      abortRef.current = null;
      return;
    }

    if (editions.length === 0) {
      setStatus('complete');
      setFailedDates([]);
      return;
    }

    // Determine which entries are not yet cached at their latest updated_at revision
    const pendingEntries = editions.filter((entry) => {
      const cached = getCachedEdition(entry.path, entry.updated_at);
      return !cached;
    });

    if (pendingEntries.length === 0) {
      setStatus('complete');
      setFailedDates([]);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const runId = ++runIdRef.current;

    setStatus('indexing');
    setFailedDates([]);

    async function runBatches() {
      const localFailed: string[] = [];

      for (let i = 0; i < pendingEntries.length; i += INDEX_BATCH_SIZE) {
        if (controller.signal.aborted || runId !== runIdRef.current) {
          return;
        }
        const batch = pendingEntries.slice(i, i + INDEX_BATCH_SIZE);
        const settled = await Promise.allSettled(
          batch.map(async (entry) => {
            const parsed = await fetchAndParseEdition(entry.path, {
              revisionKey: entry.updated_at,
              signal: controller.signal,
            });
            return { entry, parsed };
          })
        );

        if (controller.signal.aborted || runId !== runIdRef.current) {
          return;
        }

        const batchDocs: Array<{
          date: string;
          rev: string;
          docs: SearchDocument[];
          hasErrors: boolean;
        }> = [];

        for (let b = 0; b < settled.length; b += 1) {
          const outcome = settled[b];
          const entry = batch[b];
          if (outcome.status === 'fulfilled') {
            const { parsed } = outcome.value;
            const docs = getOrBuildEditionSearchDocs(
              parsed,
              entry.path,
              entry.updated_at
            );
            batchDocs.push({
              date: entry.date,
              rev: entry.updated_at,
              docs,
              hasErrors: parsed.validation.errors.length > 0,
            });
          } else {
            const err = outcome.reason;
            if (err instanceof DOMException && err.name === 'AbortError') {
              return;
            }
            localFailed.push(entry.date);
          }
        }

        if (batchDocs.length > 0) {
          setDocsByDate((prev) => {
            const next = new Map(prev);
            for (const item of batchDocs) {
              next.set(item.date, item.docs);
            }
            return next;
          });
          setIndexedRevisionByDate((prev) => {
            const next = new Map(prev);
            for (const item of batchDocs) {
              next.set(item.date, item.rev);
            }
            return next;
          });
          setMalformedDates((prev) => {
            const set = new Set(prev);
            for (const item of batchDocs) {
              if (item.hasErrors) set.add(item.date);
              else set.delete(item.date);
            }
            return Array.from(set).sort();
          });
        }

        if (localFailed.length > 0) {
          setFailedDates([...localFailed]);
        }
      }

      if (!controller.signal.aborted && runId === runIdRef.current) {
        setStatus('complete');
      }
    }

    void runBatches();

    return () => {
      controller.abort();
    };
  }, [editions, isOpen, resumeNonce]);

  const cancelIndexing = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    ++runIdRef.current;
    setStatus('cancelled');
  }, []);

  const resumeIndexing = useCallback(() => {
    setResumeNonce((n) => n + 1);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ ...DEFAULT_GLOBAL_SEARCH_FILTERS });
  }, []);

  const allDocuments = useMemo(() => {
    const list: SearchDocument[] = [];
    for (const docs of docsByDate.values()) {
      list.push(...docs);
    }
    return list;
  }, [docsByDate]);

  const facets = useMemo(
    () => extractSearchFacets(allDocuments),
    [allDocuments]
  );

  const results = useMemo(
    () =>
      executeGlobalSearch({
        documents: allDocuments,
        query: debouncedQuery,
        filters,
        sortBy,
      }),
    [allDocuments, debouncedQuery, filters, sortBy]
  );

  const totalOccurrences = useMemo(
    () => results.reduce((sum, item) => sum + item.occurrences.length, 0),
    [results]
  );

  const totalEditions = editions.length > 0 ? editions.length : activeEdition ? 1 : 0;
  const indexedCount = Math.min(indexedRevisionByDate.size, totalEditions);

  return {
    query,
    setQuery,
    debouncedQuery,
    filters,
    setFilters,
    resetFilters,
    sortBy,
    setSortBy,
    status,
    indexedCount,
    totalEditions,
    failedDates,
    malformedCount: malformedDates.length,
    results,
    totalOccurrences,
    facets,
    cancelIndexing,
    resumeIndexing,
  };
}
