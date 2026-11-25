import type { ViewId } from '../../types/edition';

export interface AppUrlState {
  edition: string | null;
  view: ViewId;
  signal: string | null;
}

export interface HistoryAdapter {
  getPathname: () => string;
  getSearch: () => string;
  getHash: () => string;
  pushState: (url: string) => void;
  replaceState: (url: string) => void;
}

const VALID_VIEWS: readonly ViewId[] = ['briefing', 'expanded', 'synthesis', 'audit'];
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const SIGNAL_ID_PATTERN = /^(?:WORLD|AI|ECON)-\d{8}-[a-z0-9-]+$/i;

export function isValidEditionDateParam(value: string | null | undefined): value is string {
  return typeof value === 'string' && DATE_PATTERN.test(value.trim());
}

export function isValidSignalIdParam(value: string | null | undefined): value is string {
  return typeof value === 'string' && SIGNAL_ID_PATTERN.test(value.trim());
}

export function parseUrlState(search: string): AppUrlState {
  const params = new URLSearchParams(search);

  const rawView = params.get('view')?.trim() as ViewId | undefined;
  const rawEdition = params.get('edition')?.trim() ?? null;
  const rawSignal = params.get('signal')?.trim() ?? null;

  const edition = isValidEditionDateParam(rawEdition) ? rawEdition : null;
  const signal = isValidSignalIdParam(rawSignal) ? rawSignal : null;

  // If a valid deep-linked signal is present without an explicit view, open Expanded view
  const view: ViewId =
    rawView && VALID_VIEWS.includes(rawView) ? rawView : signal ? 'expanded' : 'briefing';

  // Only keep signal parameter attached to Expanded view
  if (view !== 'expanded') {
    return { edition, view, signal: null };
  }

  return { edition, view, signal };
}

export function buildUrlSearch(
  state: AppUrlState,
  options?: { isLocalPreview?: boolean }
): string {
  const params = new URLSearchParams();

  // Never emit public ?edition= or ?signal= links while viewing an ephemeral local preview
  if (options?.isLocalPreview) {
    if (state.view !== 'briefing') {
      params.set('view', state.view);
    }
    const serialized = params.toString();
    return serialized ? `?${serialized}` : '';
  }

  if (isValidEditionDateParam(state.edition)) {
    params.set('edition', state.edition.trim());
  }
  if (state.view !== 'briefing') {
    params.set('view', state.view);
  }
  if (state.view === 'expanded' && isValidSignalIdParam(state.signal)) {
    params.set('signal', state.signal.trim());
  }

  const serialized = params.toString();
  return serialized ? `?${serialized}` : '';
}

function getBrowserHistoryAdapter(): HistoryAdapter | null {
  if (typeof window === 'undefined') return null;
  return {
    getPathname: () => window.location.pathname,
    getSearch: () => window.location.search,
    getHash: () => window.location.hash,
    pushState: (url) => window.history.pushState(null, '', url),
    replaceState: (url) => window.history.replaceState(null, '', url),
  };
}

/**
 * Updates browser history deliberately using either `push` (user navigation) or
 * `replace` (hydration/normalization), avoiding duplicate history entries whenever
 * the resulting URL matches the current location.
 * Returns `true` if history was updated, `false` if skipped (unchanged or unavailable).
 */
export function syncUrlState(
  state: AppUrlState,
  mode: 'push' | 'replace' = 'replace',
  options?: {
    isLocalPreview?: boolean;
    adapter?: HistoryAdapter;
  }
): boolean {
  const adapter = options?.adapter ?? getBrowserHistoryAdapter();
  if (!adapter) return false;

  try {
    const pathname = adapter.getPathname();
    const hash = adapter.getHash();
    const nextSearch = buildUrlSearch(state, {
      isLocalPreview: options?.isLocalPreview,
    });
    const nextUrl = `${pathname}${nextSearch}${hash}`;
    const currentUrl = `${pathname}${adapter.getSearch()}${hash}`;

    if (nextUrl === currentUrl) {
      return false;
    }

    if (mode === 'push') {
      adapter.pushState(nextUrl);
    } else {
      adapter.replaceState(nextUrl);
    }
    return true;
  } catch {
    // Ignore history API restrictions in sandboxed iframe contexts
    return false;
  }
}
