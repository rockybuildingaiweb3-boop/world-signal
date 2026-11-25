import type { EditionIndexEntry, ParsedEdition } from '../../types/edition';
import { fetchAndParseEdition } from './editionClient';

export interface EditionLoadCallbacks {
  onStart: (entry: EditionIndexEntry) => void;
  onSuccess: (entry: EditionIndexEntry, edition: ParsedEdition) => void;
  onError: (entry: EditionIndexEntry, message: string) => void;
  onSettled: () => void;
}

/**
 * Coordinates asynchronous edition loads with both a monotonically increasing
 * request ID and an AbortController so an earlier, slower network request can
 * NEVER overwrite a newer edition selection, loading flag, or error state.
 */
export class LatestEditionLoader {
  private latestRequestId = 0;
  private activeController: AbortController | null = null;
  private fetchImpl?: typeof fetch;

  constructor(fetchImpl?: typeof fetch) {
    this.fetchImpl = fetchImpl;
  }

  public cancelPending(): void {
    this.latestRequestId += 1;
    if (this.activeController) {
      this.activeController.abort();
      this.activeController = null;
    }
  }

  public async load(
    entry: EditionIndexEntry,
    callbacks: EditionLoadCallbacks,
    options?: { forceRefresh?: boolean }
  ): Promise<boolean> {
    this.cancelPending();
    const requestId = this.latestRequestId;
    const controller = new AbortController();
    this.activeController = controller;

    callbacks.onStart(entry);

    try {
      const parsed = await fetchAndParseEdition(entry.path, {
        revisionKey: entry.updated_at,
        forceRefresh: options?.forceRefresh,
        signal: controller.signal,
        fetchImpl: this.fetchImpl,
      });

      if (requestId !== this.latestRequestId || controller.signal.aborted) {
        return false;
      }

      callbacks.onSuccess(entry, parsed);
      callbacks.onSettled();
      return true;
    } catch (err) {
      if (requestId !== this.latestRequestId || controller.signal.aborted) {
        return false;
      }
      if (err instanceof DOMException && err.name === 'AbortError') {
        return false;
      }

      const message =
        err instanceof Error ? err.message : 'Unable to load edition file.';
      callbacks.onError(entry, message);
      callbacks.onSettled();
      return false;
    } finally {
      if (this.activeController === controller) {
        this.activeController = null;
      }
    }
  }
}
