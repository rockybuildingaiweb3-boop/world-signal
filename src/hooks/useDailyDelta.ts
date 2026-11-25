import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { EditionsIndex, ParsedEdition } from '../types/edition';
import { fetchAndParseEdition } from '../lib/content/editionClient';
import {
  buildDailyDeltaState,
  findPreviousAvailableEdition,
  type DailyDeltaState,
} from '../lib/intelligence/daily-delta/dailyDeltaHelpers';

interface UseDailyDeltaParams {
  edition: ParsedEdition | null;
  index: EditionsIndex | null;
  isArchiveLoading: boolean;
}

export interface UseDailyDeltaResult {
  state: DailyDeltaState | null;
  retry: () => void;
}

/**
 * Loads ONLY the immediately preceding available edition on demand (reusing the
 * revision-keyed edition cache and canonical Markdown parser) and computes a
 * deterministic Daily Delta via `compareEditions()`.
 */
export function useDailyDelta({
  edition,
  index,
  isArchiveLoading,
}: UseDailyDeltaParams): UseDailyDeltaResult {
  const [previousEdition, setPreviousEdition] = useState<ParsedEdition | null>(null);
  const [loadedPreviousKey, setLoadedPreviousKey] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryCounter, setRetryCounter] = useState(0);
  const requestIdRef = useRef(0);

  const previousEntry = useMemo(() => {
    if (!edition || edition.isLocalPreview || !index) return null;
    return findPreviousAvailableEdition(
      index.editions,
      edition.frontmatter.edition_date
    );
  }, [edition, index]);

  const targetPreviousKey = previousEntry
    ? `${previousEntry.path}::${previousEntry.updated_at}`
    : null;

  useEffect(() => {
    if (isArchiveLoading || !edition || edition.isLocalPreview || !previousEntry) {
      setPreviousEdition(null);
      setLoadedPreviousKey(null);
      setLoadError(null);
      return;
    }

    const requestId = ++requestIdRef.current;
    const controller = new AbortController();
    const expectedKey = `${previousEntry.path}::${previousEntry.updated_at}`;

    setLoadError(null);
    if (loadedPreviousKey !== expectedKey) {
      setPreviousEdition(null);
    }

    fetchAndParseEdition(previousEntry.path, {
      revisionKey: previousEntry.updated_at,
      signal: controller.signal,
    })
      .then((parsed) => {
        if (requestId !== requestIdRef.current || controller.signal.aborted) {
          return;
        }
        setPreviousEdition(parsed);
        setLoadedPreviousKey(expectedKey);
        setLoadError(null);
      })
      .catch((err) => {
        if (requestId !== requestIdRef.current || controller.signal.aborted) {
          return;
        }
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        setPreviousEdition(null);
        setLoadedPreviousKey(null);
        setLoadError(
          err instanceof Error
            ? err.message
            : 'Unable to load the preceding edition for comparison.'
        );
      });

    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isArchiveLoading,
    edition?.frontmatter.edition_date,
    edition?.isLocalPreview,
    targetPreviousKey,
    retryCounter,
  ]);

  const retry = useCallback(() => {
    setRetryCounter((count) => count + 1);
  }, []);

  const state = useMemo<DailyDeltaState | null>(() => {
    if (isArchiveLoading || !edition) return null;
    const matchingPrevious =
      targetPreviousKey && loadedPreviousKey === targetPreviousKey
        ? previousEdition
        : null;

    return buildDailyDeltaState({
      currentEdition: edition,
      previousEdition: matchingPrevious,
      hasArchiveIndex: Boolean(index),
      previousEntry,
      previousLoadError: loadError,
    });
  }, [
    isArchiveLoading,
    edition,
    index,
    previousEntry,
    previousEdition,
    targetPreviousKey,
    loadedPreviousKey,
    loadError,
  ]);

  return { state, retry };
}
