import type { ViewId } from '../../types/edition';

export interface AppUrlState {
  edition: string | null;
  view: ViewId;
  signal: string | null;
}

const VALID_VIEWS: readonly ViewId[] = ['briefing', 'expanded', 'synthesis', 'audit'];
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const SIGNAL_ID_PATTERN = /^[A-Z]+-\d{8}-[a-z0-9-]+$/i;

export function parseUrlState(search: string): AppUrlState {
  const params = new URLSearchParams(search);

  const rawView = params.get('view') as ViewId | null;
  const view: ViewId = rawView && VALID_VIEWS.includes(rawView) ? rawView : 'briefing';

  const rawEdition = params.get('edition')?.trim() ?? null;
  const edition = rawEdition && DATE_PATTERN.test(rawEdition) ? rawEdition : null;

  const rawSignal = params.get('signal')?.trim() ?? null;
  const signal = rawSignal && SIGNAL_ID_PATTERN.test(rawSignal) ? rawSignal : null;

  return { edition, view, signal };
}

export function buildUrlSearch(state: AppUrlState): string {
  const params = new URLSearchParams();
  if (state.edition && DATE_PATTERN.test(state.edition)) {
    params.set('edition', state.edition);
  }
  if (state.view !== 'briefing') {
    params.set('view', state.view);
  }
  if (state.signal && SIGNAL_ID_PATTERN.test(state.signal) && state.view === 'expanded') {
    params.set('signal', state.signal);
  }
  const serialized = params.toString();
  return serialized ? `?${serialized}` : '';
}

export function syncUrlState(state: AppUrlState, mode: 'push' | 'replace' = 'replace'): void {
  if (typeof window === 'undefined') return;
  try {
    const nextSearch = buildUrlSearch(state);
    const nextUrl = `${window.location.pathname}${nextSearch}${window.location.hash}`;
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (nextUrl === currentUrl) return;

    if (mode === 'push') {
      window.history.pushState(null, '', nextUrl);
    } else {
      window.history.replaceState(null, '', nextUrl);
    }
  } catch {
    // Ignore history API restrictions in sandboxed iframe contexts
  }
}
