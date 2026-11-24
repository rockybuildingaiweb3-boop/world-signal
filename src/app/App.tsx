import React, { useCallback, useEffect, useState } from 'react';
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

  const archive = useArchive(initialUrl.edition);
  const { theme, setTheme, lang, setLang } = usePreferences(
    archive.edition?.frontmatter.content_language
  );
  const t = getUiStrings(lang);

  // Keep URL query state cleanly synced for shareable edition, view, and signal deep links
  useEffect(() => {
    const editionDate = archive.edition?.isLocalPreview
      ? null
      : archive.edition?.frontmatter.edition_date ??
        archive.activeEntry?.date ??
        null;

    syncUrlState(
      {
        edition: editionDate,
        view: activeView,
        signal: activeView === 'expanded' ? selectedSignalId : null,
      },
      'replace'
    );
  }, [
    activeView,
    archive.activeEntry?.date,
    archive.edition?.frontmatter.edition_date,
    archive.edition?.isLocalPreview,
    selectedSignalId,
  ]);

  // Support browser back/forward navigation
  useEffect(() => {
    const onPopState = () => {
      const next = parseUrlState(window.location.search);
      setActiveView(next.view);
      setSelectedSignalId(next.signal);
      setMobileShowDetail(Boolean(next.signal));
      if (next.edition && next.edition !== archive.activeEntry?.date) {
        void archive.selectEditionByDate(next.edition);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [archive]);

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
      await archive.selectEditionEntry(entry);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [archive]
  );

  const handleLoadLocalMarkdown = useCallback(
    (markdown: string, label: string) => {
      setFilters({ ...DEFAULT_FILTERS });
      setSelectedSignalId(null);
      setMobileShowDetail(false);
      archive.loadLocalMarkdown(markdown, label);
      setActiveView('briefing');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [archive]
  );

  const activeEditionDate =
    archive.edition?.frontmatter.edition_date ??
    archive.activeEntry?.date ??
    null;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--ws-canvas)] text-[var(--ws-ink)]">
      <TopBar
        activeView={activeView}
        onSelectView={handleSelectView}
        activeEditionDate={activeEditionDate}
        isLocalPreview={Boolean(archive.edition?.isLocalPreview)}
        onOpenArchive={() => setArchiveOpen(true)}
        lang={lang}
      />

      <main className="mx-auto w-full max-w-[1320px] flex-1 px-4 pt-6 sm:px-6 sm:pt-8">
        {archive.isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-sm text-[var(--ws-ink-muted)]">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span className="font-mono-tabular text-xs">{t.loading}</span>
          </div>
        ) : archive.error ? (
          <div className="mx-auto max-w-xl py-16">
            <div className="ws-card p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2 text-[var(--ws-error)]">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <h1 className="font-display text-xl font-semibold">
                  {t.errorState.title}
                </h1>
              </div>
              <p className="text-sm leading-relaxed text-[var(--ws-ink-secondary)]">
                {archive.error}
              </p>
              <div className="flex flex-wrap gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => void archive.refreshArchive()}
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
        ) : !archive.edition ? (
          <ArchiveEmptyState
            lang={lang}
            onRefresh={() => void archive.refreshArchive()}
            onOpenLocalModal={() => setLocalModalOpen(true)}
          />
        ) : (
          <>
            {activeView === 'briefing' && (
              <BriefingView
                edition={archive.edition}
                lang={lang}
                onOpenSignal={handleOpenSignal}
                onExploreDomain={handleExploreDomain}
                onSwitchView={handleSelectView}
                onRefresh={() => void archive.refreshArchive()}
                isRefreshing={archive.isRefreshing}
              />
            )}

            {activeView === 'expanded' && (
              <ExpandedView
                edition={archive.edition}
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
                edition={archive.edition}
                lang={lang}
                onOpenSignal={handleOpenSignal}
              />
            )}

            {activeView === 'audit' && (
              <AuditView
                edition={archive.edition}
                lang={lang}
                onOpenSignal={handleOpenSignal}
              />
            )}
          </>
        )}
      </main>

      {/* Minimal Editorial Footer */}
      <footer className="border-t border-[var(--ws-border)] bg-[var(--ws-canvas)] py-6 mt-auto">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between font-mono-tabular text-[11.5px] text-[var(--ws-ink-muted)]">
          <div>
            <span className="font-semibold text-[var(--ws-ink)]">WORLD SIGNAL</span>{' '}
            · {t.brandTagline}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>America/Los_Angeles</span>
            <button
              type="button"
              onClick={() => setArchiveOpen(true)}
              className="hover:text-[var(--ws-ink)] underline decoration-[var(--ws-border-strong)] underline-offset-2 cursor-pointer"
            >
              {t.archive.button}
            </button>
            <button
              type="button"
              onClick={() => setLocalModalOpen(true)}
              className="hover:text-[var(--ws-ink)] underline decoration-[var(--ws-border-strong)] underline-offset-2 cursor-pointer"
            >
              {t.archive.developerTools}
            </button>
          </div>
        </div>
      </footer>

      <ArchiveDrawer
        isOpen={archiveOpen}
        onClose={() => setArchiveOpen(false)}
        editions={archive.index?.editions ?? []}
        latestDate={archive.index?.latest_edition ?? null}
        selectedDate={archive.activeEntry?.date ?? null}
        onSelectEdition={handleSelectEdition}
        onRefresh={() => void archive.refreshArchive()}
        isRefreshing={archive.isRefreshing}
        refreshFeedback={
          archive.refreshFeedback
            ? `${t.archive.refreshedNotice} (${archive.refreshFeedback})`
            : null
        }
        theme={theme}
        onChangeTheme={setTheme}
        lang={lang}
        onChangeLang={setLang}
        isLocalPreview={Boolean(archive.edition?.isLocalPreview)}
        onExitLocalPreview={() => void archive.exitLocalPreview()}
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
