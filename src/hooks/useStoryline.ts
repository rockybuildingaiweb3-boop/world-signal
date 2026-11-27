import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { EditionsIndex, ParsedEdition } from '../types/edition';
import {
  fetchAndParseEdition,
  getCachedEdition,
} from '../lib/content/editionClient';
import {
  buildSignalStorylineProjection,
  type SignalStorylineProjection,
} from '../lib/intelligence/storylines/storylineHelpers';

export interface UseStorylineParams {
  signalId: string | null;
  index: EditionsIndex | null;
  activeEdition: ParsedEdition | null;
}

export interface UseStorylineResult {
  projection: SignalStorylineProjection | null;
  isLoading: boolean;
  loadedCount: number;
  totalCount: number;
  failedDates: string[];
  error: string | null;
  cancel: () => void;
  retry: () => void;
}

const STORYLINE_BATCH_SIZE = 2;

export function useStoryline({
  signalId,
  index,
  activeEdition,
}: UseStorylineParams): UseStorylineResult {
  const [loadedMap, setLoadedMap] = useState<Map<string, ParsedEdition>>(
    () => new Map()
  );
  const [failedDates, setFailedDates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);

  const abortRef = useRef<AbortController | null>(null);
  const runIdRef = useRef(0);

  const editions = useMemo(() => index?.editions ?? [], [index?.editions]);

  useEffect(() => {
    abortRef.current?.abort();
    abortRef.current = null;

    if (!signalId) {
      setIsLoading(false);
      setError(null);
      return;
    }

    const initialMap = new Map<string, ParsedEdition>();
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
          initialMap.set(entry.date, cached);
        }
      }
    } else if (activeEdition) {
      initialMap.set(activeEdition.frontmatter.edition_date, activeEdition);
    }

    setLoadedMap(initialMap);
    setFailedDates([]);
    setError(null);

    const pending = editions.filter((entry) => !initialMap.has(entry.date));
    if (pending.length === 0) {
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    const runId = ++runIdRef.current;
    setIsLoading(true);

    async function loadHistory() {
      const localFailed: string[] = [];

      try {
        for (let i = 0; i < pending.length; i += STORYLINE_BATCH_SIZE) {
          if (controller.signal.aborted || runId !== runIdRef.current) return;
          const batch = pending.slice(i, i + STORYLINE_BATCH_SIZE);
          const settled = await Promise.allSettled(
            batch.map(async (entry) => {
              const parsed = await fetchAndParseEdition(entry.path, {
                revisionKey: entry.updated_at,
                signal: controller.signal,
              });
              return { date: entry.date, parsed };
            })
          );

          if (controller.signal.aborted || runId !== runIdRef.current) return;

          const succeeded: Array<{ date: string; parsed: ParsedEdition }> = [];
          for (let b = 0; b < settled.length; b += 1) {
            const outcome = settled[b];
            const entry = batch[b];
            if (outcome.status === 'fulfilled') {
              succeeded.push(outcome.value);
            } else {
              const reason = outcome.reason;
              if (reason instanceof DOMException && reason.name === 'AbortError') {
                return;
              }
              localFailed.push(entry.date);
            }
          }

          if (succeeded.length > 0) {
            setLoadedMap((prev) => {
              const next = new Map(prev);
              for (const item of succeeded) {
                next.set(item.date, item.parsed);
              }
              return next;
            });
          }

          if (localFailed.length > 0) {
            setFailedDates([...localFailed]);
          }
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        if (runId === runIdRef.current) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load storyline archive history.'
          );
        }
      } finally {
        if (!controller.signal.aborted && runId === runIdRef.current) {
          setIsLoading(false);
        }
      }
    }

    void loadHistory();

    return () => {
      controller.abort();
    };
  }, [activeEdition, editions, retryNonce, signalId]);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    ++runIdRef.current;
    setIsLoading(false);
  }, []);

  const retry = useCallback(() => {
    setRetryNonce((n) => n + 1);
  }, []);

  const totalCount = editions.length > 0 ? editions.length : activeEdition ? 1 : 0;

  const projection = useMemo(() => {
    if (!signalId) return null;
    const loadedList = Array.from(loadedMap.values());
    if (loadedList.length === 0) return null;
    return buildSignalStorylineProjection({
      signalId,
      loadedEditions: loadedList,
      totalArchiveEditionCount: totalCount,
      failedEditionDates: failedDates,
    });
  }, [failedDates, loadedMap, signalId, totalCount]);

  return {
    projection,
    isLoading,
    loadedCount: loadedMap.size,
    totalCount,
    failedDates,
    error,
    cancel,
    retry,
  };
}
