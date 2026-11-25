import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import type {
  EditionIndexEntry,
  SignalDomain,
  SignalFilters,
  ViewId,
} from '../types/edition';
import { DEFAULT_FILTERS } from '../lib/filtering/filterSignals';
import { parseUrlState, syncUrlState } from '../lib/navigation/urlState';
import { getUiStrings } from '../lib/i18n/uiStrings';
import { useArchive } from '../hooks/useArchive';
import { useDailyDelta } from '../hooks/useDailyDelta';
import { usePreferences } from '../hooks/usePreferences';
import { TopBar } from '../components/layout/TopBar';
import { ArchiveDrawer } from '../components/navigation/ArchiveDrawer';
import { ArchiveEmptyState } from '../components/common/ArchiveEmptyState';
import { LocalMarkdownModal } from '../components/common/LocalMarkdownModal';
import { BriefingView } from '../features/briefing/BriefingView';
import { ExpandedView } from '../features/expanded/ExpandedView';
import { SynthesisView } from '../features/synthesis/SynthesisView';
import { AuditView } from '../features/audit/AuditView';

export const App: React.FC = () => {
  const initialUrl = React.useMemo(
    () =>
      typeof window !== 'undefined'
        ? parseUrlState(window.location.search)
        : { edition: null, view: 'briefing' as ViewId, signal: null },
    []
  );

  const [activeView, setActiveView] = useState<ViewId>(initialUrl.view);
  const [selectedSignalId, setSelectedSignalId] = useState<string | null>(
    initialUrl.signal
  );
  const [mobileShowDetail, setMobileShowDetail] = useState<boolean>(
    Boolean(initialUrl.signal)
  );
  const [filters, setFilters] = useState<SignalFilters>({ ...DEFAULT_FILTERS });
  const [archiveOpen, setArchiveOpen] = useState<boolean>(false);
  const [localModalOpen, setLocalModalOpen] = useState<boolean>(false);
  const skipNextUrlSyncRef = useRef(false);
  const hasHydratedUrlRef = useRef(false);

  const archive = useArchive(initialUrl.edition);
  const {
    activeEntry,
    edition,
    error,
    index,
    isLoading,
    isRefreshing,
    refreshFeedback,
    selectEditionByDate,
    selectEditionEntry,
    refreshArchive,
    loadLocalMarkdown,
    exitLocalPreview,
  } = archive;
  const { theme, setTheme, lang, setLang } = usePreferences(
    edition?.frontmatter.content_language
  );
  const dailyDelta = useDailyDelta({
    edition,
    index,
    isArchiveLoading: isLoading,
  });
  const t = getUiStrings(lang);
  const handleCloseArchive = useCallback(() => setArchiveOpen(false), []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // Keep URL query state cleanly synced for shareable edition, view, and signal deep links
  useEffect(() => {
    // Do not erase an incoming deep link while the initial archive request is pending.
    if (isLoading) return;

    // popstate already changed the address bar; state restoration must not create a new entry.
    if (skipNextUrlSyncRef.current) {
      skipNextUrlSyncRef.current = false;
      hasHydratedUrlRef.current = true;
      return;
    }

    const isLocalPreview = Boolean(edition?.isLocalPreview);
    const editionDate = isLocalPreview
      ? null
      : edition?.frontmatter.edition_date ??
        activeEntry?.date ??
        null;

    const historyMode: 'push' | 'replace' =
      !hasHydratedUrlRef.current || isLocalPreview ? 'replace' : 'push';
    hasHydratedUrlRef.current = true;

    syncUrlState(
      {
        edition: editionDate,
        view: activeView,
        signal: activeView === 'expanded' ? selectedSignalId : null,
      },
      historyMode,
      { isLocalPreview }
    );
  }, [
    activeView,
    isLoading,
    activeEntry?.date,
    edition?.frontmatter.edition_date,
    edition?.isLocalPreview,
    selectedSignalId,
  ]);

  // Support browser back/forward navigation without writing a duplicate history entry.
  useEffect(() => {
    const onPopState = () => {
      skipNextUrlSyncRef.current = true;
      const next = parseUrlState(window.location.search);
      setActiveView(next.view);
      setSelectedSignalId(next.signal);
      setMobileShowDetail(Boolean(next.signal));
      const targetEdition = next.edition ?? index?.latest_edition ?? null;
      if (targetEdition && targetEdition !== activeEntry?.date) {
        void selectEditionByDate(targetEdition);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [activeEntry?.date, index?.latest_edition, selectEditionByDate]);

  const handleSelectView = useCallback((view: ViewId) => {
    setActiveView(view);
    if (view !== 'expanded') {
      setMobileShowDetail(false);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleOpenSignal = useCallback((signalId: string) => {
    setSelectedSignalId(signalId);
    setMobileShowDetail(true);
    setActiveView('expanded');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleOpenSignalInEdition = useCallback(
    (editionDate: string, signalId: string) => {
      const currentDate =
        edition?.frontmatter.edition_date ?? activeEntry?.date ?? null;

      if (currentDate === editionDate) {
        setFilters({ ...DEFAULT_FILTERS });
        setSelectedSignalId(signalId);
        setMobileShowDetail(true);
        setActiveView('expanded');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const targetEntry = index?.editions.find(
        (entry) => entry.date === editionDate
      );
      if (!targetEntry) return;

      // Preserve the requested signal across the edition switch so URL history
      // pushes a single clean entry (?edition=<previous>&view=expanded&signal=<id>)
      // once the preceding edition finishes loading.
      setFilters({ ...DEFAULT_FILTERS });
      setSelectedSignalId(signalId);
      setMobileShowDetail(true);
      setActiveView('expanded');
      void selectEditionEntry(targetEntry);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [activeEntry?.date, edition?.frontmatter.edition_date, index?.editions, selectEditionEntry]
  );

  const handleExploreDomain = useCallback((domain: SignalDomain) => {
    setFilters({ ...DEFAULT_FILTERS, domain });
    setSelectedSignalId(null);
    setMobileShowDetail(false);
    setActiveView('expanded');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSelectEdition = useCallback(
    async (entry: EditionIndexEntry) => {
      setFilters({ ...DEFAULT_FILTERS });
      setSelectedSignalId(null);
      setMobileShowDetail(false);
      await selectEditionEntry(entry);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [selectEditionEntry]
  );

  const handleLoadLocalMarkdown = useCallback(
    (markdown: string, label: string) => {
      setFilters({ ...DEFAULT_FILTERS });
      setSelectedSignalId(null);
      setMobileShowDetail(false);
      loadLocalMarkdown(markdown, label);
      setActiveView('briefing');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [loadLocalMarkdown]
  );

  const activeEditionDate =
    edition?.frontmatter.edition_date ??
    activeEntry?.date ??
    null;

  return (
    <div
      data-lang={lang}
      className="min-h-screen flex flex-col bg-[var(--ws-canvas)] text-[var(--ws-ink)] pb-[60px] md:pb-0"
    >
      <TopBar
        activeView={activeView}
        onSelectView={handleSelectView}
        activeEditionDate={activeEditionDate}
        isLocalPreview={Boolean(edition?.isLocalPreview)}
        onOpenArchive={() => setArchiveOpen(true)}
        lang={lang}
      />

      <main className="mx-auto w-full max-w-[1320px] flex-1 px-4 pt-5 sm:px-6 sm:pt-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-sm text-[var(--ws-ink-muted)]">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span className="font-mono-tabular text-xs">{t.loading}</span>
          </div>
        ) : error ? (
          <div className="mx-auto max-w-xl py-16">
            <div className="ws-card p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2 text-[var(--ws-error)]">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <h1 className="font-display text-xl font-semibold">
                  {t.errorState.title}
                </h1>
              </div>
              <p className="text-sm leading-relaxed text-[var(--ws-ink-secondary)]">
                {error}
              </p>
              <div className="flex flex-wrap gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => void refreshArchive()}
                  className="inline-flex items-center gap-2 rounded-md bg-[var(--ws-ink)] px-4 py-2 text-xs font-medium text-[var(--ws-surface)] hover:opacity-90 cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  {t.errorState.retry}
                </button>
                <button
                  type="button"
                  onClick={() => setArchiveOpen(true)}
                  className="rounded-md border border-[var(--ws-border)] px-4 py-2 text-xs font-medium text-[var(--ws-ink)] hover:border-[var(--ws-border-strong)] cursor-pointer"
                >
                  {t.errorState.openArchive}
                </button>
              </div>
            </div>
          </div>
        ) : !edition ? (
          <ArchiveEmptyState
            lang={lang}
            onRefresh={() => void refreshArchive()}
            onOpenLocalModal={() => setLocalModalOpen(true)}
          />
        ) : (
          <>
            {activeView === 'briefing' && (
              <BriefingView
                edition={edition}
                lang={lang}
                dailyDelta={dailyDelta.state}
                onRetryDailyDelta={dailyDelta.retry}
                onOpenSignal={handleOpenSignal}
                onOpenSignalInEdition={handleOpenSignalInEdition}
                onExploreDomain={handleExploreDomain}
                onSwitchView={handleSelectView}
                onRefresh={() => void refreshArchive()}
                isRefreshing={isRefreshing}
              />
            )}

            {activeView === 'expanded' && (
              <ExpandedView
                edition={edition}
                lang={lang}
                filters={filters}
                onChangeFilters={setFilters}
                selectedSignalId={selectedSignalId}
                onSelectSignal={setSelectedSignalId}
                mobileShowDetail={mobileShowDetail}
                onChangeMobileShowDetail={setMobileShowDetail}
              />
            )}

            {activeView === 'synthesis' && (
              <SynthesisView
                edition={edition}
                lang={lang}
                onOpenSignal={handleOpenSignal}
              />
            )}

            {activeView === 'audit' && (
              <AuditView
                edition={edition}
                lang={lang}
                onOpenSignal={handleOpenSignal}
              />
            )}
          </>
        )}
      </main>

      {/* Minimal Editorial Publication Colophon Footer */}
      <footer className="border-t border-[var(--ws-border-strong)] bg-[var(--ws-surface)]/55 py-6 mt-auto">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between font-mono-tabular text-[11.5px] text-[var(--ws-ink-muted)]">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="font-display text-[13px] font-semibold tracking-[0.03em] text-[var(--ws-ink)]">
              WORLD SIGNAL
            </span>
            <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">·</span>
            <span>{t.brandTagline}</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>America/Los_Angeles</span>
            <button
              type="button"
              onClick={() => setArchiveOpen(true)}
              className="hover:text-[var(--ws-ink)] underline decoration-[var(--ws-border-strong)] underline-offset-4 cursor-pointer"
            >
              {t.archive.button}
            </button>
            <button
              type="button"
              onClick={() => setLocalModalOpen(true)}
              className="hover:text-[var(--ws-ink)] underline decoration-[var(--ws-border-strong)] underline-offset-4 cursor-pointer"
            >
              {t.archive.developerTools}
            </button>
          </div>
        </div>
      </footer>

      <ArchiveDrawer
        isOpen={archiveOpen}
        onClose={handleCloseArchive}
        editions={index?.editions ?? []}
        latestDate={index?.latest_edition ?? null}
        selectedDate={activeEntry?.date ?? null}
        onSelectEdition={handleSelectEdition}
        onRefresh={() => void refreshArchive()}
        isRefreshing={isRefreshing}
        refreshFeedback={
          refreshFeedback
            ? `${t.archive.refreshedNotice} (${refreshFeedback})`
            : null
        }
        theme={theme}
        onChangeTheme={setTheme}
        lang={lang}
        onChangeLang={setLang}
        isLocalPreview={Boolean(edition?.isLocalPreview)}
        onExitLocalPreview={() => void exitLocalPreview()}
        onOpenLocalModal={() => setLocalModalOpen(true)}
      />

      <LocalMarkdownModal
        isOpen={localModalOpen}
        onClose={() => setLocalModalOpen(false)}
        onLoadMarkdown={handleLoadLocalMarkdown}
        lang={lang}
      />
    </div>
  );
};

export default App;
