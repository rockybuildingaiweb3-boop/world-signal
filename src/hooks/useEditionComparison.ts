import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { EditionsIndex, ParsedEdition } from '../types/edition';
import {
  fetchAndParseEdition,
  getCachedEdition,
} from '../lib/content/editionClient';
import {
  buildArbitraryEditionComparison,
  resolveDefaultComparisonDates,
  validateComparisonPair,
  type ArbitraryComparisonResult,
  type ComparisonValidationError,
} from '../lib/intelligence/edition-diff/arbitraryComparison';

export interface UseEditionComparisonParams {
  isOpen: boolean;
  index: EditionsIndex | null;
  activeEditionDate: string | null;
  initialFromDate?: string | null;
  initialToDate?: string | null;
}

export interface UseEditionComparisonResult {
  fromDate: string;
  toDate: string;
  setFromDate: (date: string) => void;
  setToDate: (date: string) => void;
  swapDates: () => void;
  validationError: ComparisonValidationError | null;
  wasReversedInput: boolean;
  normalizedFromDate: string | null;
  normalizedToDate: string | null;
  result: ArbitraryComparisonResult | null;
  isLoading: boolean;
  fetchError: string | null;
  retry: () => void;
}

export function useEditionComparison({
  isOpen,
  index,
  activeEditionDate,
  initialFromDate,
  initialToDate,
}: UseEditionComparisonParams): UseEditionComparisonResult {
  const editions = useMemo(() => index?.editions ?? [], [index?.editions]);

  const [fromDate, setFromDate] = useState<string>(initialFromDate ?? '');
  const [toDate, setToDate] = useState<string>(initialToDate ?? '');
  const [result, setResult] = useState<ArbitraryComparisonResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);

  const abortRef = useRef<AbortController | null>(null);

  // Sync when explicit initial dates are supplied or initialize sensible defaults when opened
  useEffect(() => {
    if (!isOpen) return;
    if (initialFromDate && initialToDate) {
      setFromDate(initialFromDate);
      setToDate(initialToDate);
      return;
    }
    if (!fromDate || !toDate) {
      const defaults = resolveDefaultComparisonDates(editions, activeEditionDate);
      if (defaults) {
        setFromDate(defaults.fromDate);
        setToDate(defaults.toDate);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialFromDate, initialToDate, editions.length, activeEditionDate]);

  const validation = useMemo(
    () => validateComparisonPair(editions, fromDate, toDate),
    [editions, fromDate, toDate]
  );

  useEffect(() => {
    abortRef.current?.abort();
    abortRef.current = null;

    if (!isOpen) {
      setIsLoading(false);
      return;
    }

    if (!validation.valid) {
      setResult(null);
      setIsLoading(false);
      setFetchError(null);
      return;
    }

    const { olderEntry, newerEntry, wasReversedInput } = validation;

    const cachedOlder = getCachedEdition(olderEntry.path, olderEntry.updated_at);
    const cachedNewer = getCachedEdition(newerEntry.path, newerEntry.updated_at);

    if (cachedOlder && cachedNewer) {
      setResult(
        buildArbitraryEditionComparison({
          olderEdition: cachedOlder,
          newerEdition: cachedNewer,
          wasReversedInput,
        })
      );
      setIsLoading(false);
      setFetchError(null);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setIsLoading(true);
    setFetchError(null);

    async function loadPair() {
      try {
        const [olderEdition, newerEdition]: [ParsedEdition, ParsedEdition] =
          await Promise.all([
            cachedOlder
              ? Promise.resolve(cachedOlder)
              : fetchAndParseEdition(olderEntry.path, {
                  revisionKey: olderEntry.updated_at,
                  signal: controller.signal,
                }),
            cachedNewer
              ? Promise.resolve(cachedNewer)
              : fetchAndParseEdition(newerEntry.path, {
                  revisionKey: newerEntry.updated_at,
                  signal: controller.signal,
                }),
          ]);

        if (controller.signal.aborted) return;
        setResult(
          buildArbitraryEditionComparison({
            olderEdition,
            newerEdition,
            wasReversedInput,
          })
        );
        setFetchError(null);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setResult(null);
        setFetchError(
          err instanceof Error
            ? err.message
            : 'Unable to load the selected editions for comparison.'
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadPair();

    return () => {
      controller.abort();
    };
  }, [isOpen, retryNonce, validation]);

  const swapDates = useCallback(() => {
    setFromDate((prevFrom) => {
      const nextFrom = toDate;
      setToDate(prevFrom);
      return nextFrom;
    });
  }, [toDate]);

  const retry = useCallback(() => {
    setRetryNonce((n) => n + 1);
  }, []);

  return {
    fromDate,
    toDate,
    setFromDate,
    setToDate,
    swapDates,
    validationError: validation.valid ? null : validation.error,
    wasReversedInput: validation.valid ? validation.wasReversedInput : false,
    normalizedFromDate: validation.valid ? validation.olderEntry.date : null,
    normalizedToDate: validation.valid ? validation.newerEntry.date : null,
    result,
    isLoading,
    fetchError,
    retry,
  };
}
