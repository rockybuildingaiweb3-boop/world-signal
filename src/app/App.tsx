import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import type {
  EditionIndexEntry,
  SignalDomain,
  SignalFilters,
  ViewId,
} from '../types/edition';
import { DEFAULT_FILTERS } from '../lib/filtering/filterSignals';
import {
  parseUrlState,
  syncUrlState,
  type ShareableSearchUrlState,
} from '../lib/navigation/urlState';
import { getUiStrings } from '../lib/i18n/uiStrings';
import { useArchive } from '../hooks/useArchive';
import { useDailyDelta } from '../hooks/useDailyDelta';
import { usePreferences } from '../hooks/usePreferences';
import { useGlobalSearch } from '../hooks/useGlobalSearch';
import { useStoryline } from '../hooks/useStoryline';
import { useReaderDesk } from '../hooks/useReaderDesk';
import { useEditionComparison } from '../hooks/useEditionComparison';
import { TopBar } from '../components/layout/TopBar';
import { ArchiveDrawer } from '../components/navigation/ArchiveDrawer';
import { ArchiveEmptyState } from '../components/common/ArchiveEmptyState';
import { LocalMarkdownModal } from '../components/common/LocalMarkdownModal';
import { BriefingView } from '../features/briefing/BriefingView';
import { ExpandedView } from '../features/expanded/ExpandedView';
import { SynthesisView } from '../features/synthesis/SynthesisView';
import { AuditView } from '../features/audit/AuditView';
import { GlobalSearchOverlay } from '../features/search/GlobalSearchOverlay';
import { StorylineDrawer } from '../features/storyline/StorylineDrawer';
import {
  ReaderDeskDrawer,
  type ReaderDeskTab,
} from '../features/reader-desk/ReaderDeskDrawer';
import { EditionComparisonModal } from '../features/comparison/EditionComparisonModal';

export const App: React.FC = () => {
  const initialUrl = useMemo(
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

  // Phase 05 interactive overlay states (initialized from shareable URL params when present)
  const [searchOpen, setSearchOpen] = useState<boolean>(
    Boolean(initialUrl.search)
  );
  const [storylineSignalId, setStorylineSignalId] = useState<string | null>(
    initialUrl.storyline ?? null
  );
  const [deskOpen, setDeskOpen] = useState<boolean>(false);
  const [deskTab, setDeskTab] = useState<ReaderDeskTab>('catchUp');
  const [compareOpen, setCompareOpen] = useState<boolean>(
    Boolean(initialUrl.compareFrom && initialUrl.compareTo)
  );
  const [initialCompareDates, setInitialCompareDates] = useState<{
    from: string | null;
    to: string | null;
  }>({
    from: initialUrl.compareFrom ?? null,
    to: initialUrl.compareTo ?? null,
  });

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

  const activeEditionDate =
    edition?.frontmatter.edition_date ?? activeEntry?.date ?? null;

  // Phase 05 Hooks (strictly lazy — no eager full-archive fetching on initial load)
  const globalSearch = useGlobalSearch({
    isOpen: searchOpen,
    index,
    activeEdition: edition,
    initialQuery: initialUrl.search?.q ?? '',
    initialFilters: {
      domain: initialUrl.search?.domain ?? 'all',
      dateFrom: initialUrl.search?.from ?? '',
      dateTo: initialUrl.search?.to ?? '',
    },
  });

  const storyline = useStoryline({
    signalId: storylineSignalId,
    index,
    activeEdition: edition,
  });

  const readerDesk = useReaderDesk({
    index,
    currentEdition: edition,
    isDeskOpen: deskOpen,
  });

  const editionComparison = useEditionComparison({
    isOpen: compareOpen,
    index,
    activeEditionDate,
    initialFromDate: initialCompareDates.from,
    initialToDate: initialCompareDates.to,
  });

  const t = getUiStrings(lang);
  const handleCloseArchive = useCallback(() => setArchiveOpen(false), []);
  const handleCloseSearch = useCallback(() => setSearchOpen(false), []);
  const handleCloseStoryline = useCallback(() => setStorylineSignalId(null), []);
  const handleCloseDesk = useCallback(() => setDeskOpen(false), []);
  const handleCloseComparison = useCallback(() => {
    setCompareOpen(false);
    setInitialCompareDates({ from: null, to: null });
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // Global Ctrl+K / Cmd+K shortcut for Global Archive Search
  useEffect(() => {
    const onGlobalKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setArchiveOpen(false);
        setDeskOpen(false);
        setStorylineSignalId(null);
        setCompareOpen(false);
        setLocalModalOpen(false);
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onGlobalKeyDown);
    return () => window.removeEventListener('keydown', onGlobalKeyDown);
  }, []);

  // Build shareable search URL state only when search overlay is open (never private reader state)
  const shareableSearchParam = useMemo<ShareableSearchUrlState | undefined>(() => {
    if (!searchOpen) return undefined;
    const next: ShareableSearchUrlState = {};
    const q = globalSearch.debouncedQuery.trim();
    if (q) next.q = q;
    if (globalSearch.filters.domain !== 'all') {
      next.domain = globalSearch.filters.domain;
    }
    if (globalSearch.filters.dateFrom) {
      next.from = globalSearch.filters.dateFrom;
    }
    if (globalSearch.filters.dateTo) {
      next.to = globalSearch.filters.dateTo;
    }
    return Object.keys(next).length > 0 ? next : undefined;
  }, [
    globalSearch.debouncedQuery,
    globalSearch.filters.dateFrom,
    globalSearch.filters.dateTo,
    globalSearch.filters.domain,
    searchOpen,
  ]);

  const shareableCompareFrom =
    compareOpen && !editionComparison.validationError
      ? editionComparison.normalizedFromDate
      : null;
  const shareableCompareTo =
    compareOpen && !editionComparison.validationError
      ? editionComparison.normalizedToDate
      : null;

  // Keep URL query state cleanly synced for shareable edition, view, signal, search, storyline, and comparison links
  useEffect(() => {
    if (isLoading) return;

    if (skipNextUrlSyncRef.current) {
      skipNextUrlSyncRef.current = false;
      hasHydratedUrlRef.current = true;
      return;
    }

    const isLocalPreview = Boolean(edition?.isLocalPreview);
    const editionDate = isLocalPreview
      ? null
      : edition?.frontmatter.edition_date ?? activeEntry?.date ?? null;

    // Use replace for search typing & overlay filters so browser Back remains crisp
    const isOverlayParamUpdate = Boolean(
      shareableSearchParam || storylineSignalId || shareableCompareFrom
    );
    const historyMode: 'push' | 'replace' =
      !hasHydratedUrlRef.current || isLocalPreview || isOverlayParamUpdate
        ? 'replace'
        : 'push';
    hasHydratedUrlRef.current = true;

    syncUrlState(
      {
        edition: editionDate,
        view: activeView,
        signal: activeView === 'expanded' ? selectedSignalId : null,
        search: shareableSearchParam,
        storyline: storylineSignalId,
        compareFrom: shareableCompareFrom,
        compareTo: shareableCompareTo,
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
    shareableSearchParam,
    storylineSignalId,
    shareableCompareFrom,
    shareableCompareTo,
  ]);

  // Support browser back/forward navigation without writing a duplicate history entry
  useEffect(() => {
    const onPopState = () => {
      skipNextUrlSyncRef.current = true;
      const next = parseUrlState(window.location.search);
      setActiveView(next.view);
      setSelectedSignalId(next.signal);
      setMobileShowDetail(Boolean(next.signal));
      setStorylineSignalId(next.storyline ?? null);
      if (next.search) {
        setSearchOpen(true);
        globalSearch.setQuery(next.search.q ?? '');
        globalSearch.setFilters({
          ...globalSearch.filters,
          domain: next.search.domain ?? 'all',
          dateFrom: next.search.from ?? '',
          dateTo: next.search.to ?? '',
        });
      } else {
        setSearchOpen(false);
      }
      if (next.compareFrom && next.compareTo) {
        setInitialCompareDates({ from: next.compareFrom, to: next.compareTo });
        setCompareOpen(true);
      } else {
        setCompareOpen(false);
      }
      const targetEdition = next.edition ?? index?.latest_edition ?? null;
      if (targetEdition && targetEdition !== activeEntry?.date) {
        void selectEditionByDate(targetEdition);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      setFilters({ ...DEFAULT_FILTERS });
      setSelectedSignalId(signalId);
      setMobileShowDetail(true);
      setActiveView('expanded');
      void selectEditionEntry(targetEntry);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [
      activeEntry?.date,
      edition?.frontmatter.edition_date,
      index?.editions,
      selectEditionEntry,
    ]
  );

  const handleExploreDomain = useCallback((domain: SignalDomain) => {
    setFilters({ ...DEFAULT_FILTERS, domain });
    setSelectedSignalId(null);
    setMobileShowDetail(false);
    setActiveView('expanded');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleFilterByTopic = useCallback((topic: string) => {
    setFilters({ ...DEFAULT_FILTERS, topic });
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

  const handleOpenReaderDesk = useCallback((tab: ReaderDeskTab = 'catchUp') => {
    setDeskTab(tab);
    setDeskOpen(true);
  }, []);

  const handleOpenComparison = useCallback(() => {
    setCompareOpen(true);
  }, []);

  const handleOpenStoryline = useCallback((signalId: string) => {
    setStorylineSignalId(signalId);
  }, []);

  const deskBadgeCount = readerDesk.savedCount + readerDesk.followedCount;
  const hasCatchUpChanges = readerDesk.catchUp?.status === 'changes_available';

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
        onOpenSearch={() => setSearchOpen(true)}
        onOpenReaderDesk={() =>
          handleOpenReaderDesk(
            hasCatchUpChanges || deskBadgeCount === 0 ? 'catchUp' : 'followed'
          )
        }
        deskBadgeCount={deskBadgeCount}
        hasCatchUpChanges={hasCatchUpChanges}
        lang={lang}
        onChangeLang={setLang}
        theme={theme}
        onChangeTheme={setTheme}
      />

      <main className="mx-auto w-full max-w-[1480px] flex-1 px-4 pt-4 sm:px-6 lg:px-8 sm:pt-6">
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
          <div
            key={`${activeView}-${edition.frontmatter.edition_date}-${edition.isLocalPreview ? 'local' : 'pub'}`}
            className="ws-view-enter"
          >
            {activeView === 'briefing' && (
              <BriefingView
                edition={edition}
                lang={lang}
                dailyDelta={dailyDelta.state}
                catchUp={readerDesk.catchUp}
                onRetryDailyDelta={dailyDelta.retry}
                onOpenSignal={handleOpenSignal}
                onOpenSignalInEdition={handleOpenSignalInEdition}
                onExploreDomain={handleExploreDomain}
                onSwitchView={handleSelectView}
                onRefresh={() => void refreshArchive()}
                isRefreshing={isRefreshing}
                onMarkAsReviewed={readerDesk.markAsReviewed}
                onOpenCatchUpDesk={() => handleOpenReaderDesk('catchUp')}
                onOpenComparison={
                  (index?.editions.length ?? 0) > 1
                    ? handleOpenComparison
                    : undefined
                }
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
                onOpenStoryline={handleOpenStoryline}
                isSaved={readerDesk.isSaved}
                isFollowed={readerDesk.isFollowed}
                onToggleSave={readerDesk.toggleSave}
                onToggleFollow={readerDesk.toggleFollow}
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
          </div>
        )}
      </main>

      {/* Editorial Publication Colophon Footer */}
      <footer className="border-t-[2px] border-t-[var(--ws-ink)] bg-[var(--ws-surface-tint)]/75 py-8 mt-14">
        <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-[12.5px] text-[var(--ws-ink-muted)]">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
            <span className="font-display text-[14px] font-bold tracking-[0.05em] text-[var(--ws-ink)]">
              WORLD SIGNAL
            </span>
            <span aria-hidden="true" className="text-[var(--ws-editorial-accent)]">
              ·
            </span>
            <span>{t.brandTagline}</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <span className="font-mono-tabular text-[11.5px] text-[var(--ws-ink-faint)]">
              America/Los_Angeles
            </span>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hover:text-[var(--ws-ink)] underline decoration-[var(--ws-border)] hover:decoration-[var(--ws-ink)] underline-offset-4 transition-colors cursor-pointer"
            >
              {t.globalSearch.triggerLabel}
            </button>
            <button
              type="button"
              onClick={() => handleOpenReaderDesk('catchUp')}
              className="hover:text-[var(--ws-ink)] underline decoration-[var(--ws-border)] hover:decoration-[var(--ws-ink)] underline-offset-4 transition-colors cursor-pointer"
            >
              {t.readerDesk.triggerLabel}
            </button>
            <button
              type="button"
              onClick={() => setArchiveOpen(true)}
              className="hover:text-[var(--ws-ink)] underline decoration-[var(--ws-border)] hover:decoration-[var(--ws-ink)] underline-offset-4 transition-colors cursor-pointer"
            >
              {t.archive.button}
            </button>
            <button
              type="button"
              onClick={() => setLocalModalOpen(true)}
              className="hover:text-[var(--ws-ink)] underline decoration-[var(--ws-border)] hover:decoration-[var(--ws-ink)] underline-offset-4 transition-colors cursor-pointer"
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
        onOpenComparison={handleOpenComparison}
      />

      <GlobalSearchOverlay
        isOpen={searchOpen}
        onClose={handleCloseSearch}
        lang={lang}
        editions={index?.editions ?? []}
        query={globalSearch.query}
        onChangeQuery={globalSearch.setQuery}
        filters={globalSearch.filters}
        onChangeFilters={globalSearch.setFilters}
        onResetFilters={globalSearch.resetFilters}
        sortBy={globalSearch.sortBy}
        onChangeSortBy={globalSearch.setSortBy}
        status={globalSearch.status}
        indexedCount={globalSearch.indexedCount}
        totalEditions={globalSearch.totalEditions}
        failedDates={globalSearch.failedDates}
        malformedCount={globalSearch.malformedCount}
        results={globalSearch.results}
        totalOccurrences={globalSearch.totalOccurrences}
        facets={globalSearch.facets}
        onCancelIndexing={globalSearch.cancelIndexing}
        onResumeIndexing={globalSearch.resumeIndexing}
        onOpenSignalInEdition={handleOpenSignalInEdition}
        onOpenStoryline={handleOpenStoryline}
        isSaved={readerDesk.isSaved}
        isFollowed={readerDesk.isFollowed}
        onToggleSave={readerDesk.toggleSave}
        onToggleFollow={readerDesk.toggleFollow}
      />

      <StorylineDrawer
        signalId={storylineSignalId}
        onClose={handleCloseStoryline}
        lang={lang}
        projection={storyline.projection}
        isLoading={storyline.isLoading}
        loadedCount={storyline.loadedCount}
        totalCount={storyline.totalCount}
        failedDates={storyline.failedDates}
        error={storyline.error}
        onCancel={storyline.cancel}
        onRetry={storyline.retry}
        onOpenSignalInEdition={handleOpenSignalInEdition}
        isSaved={readerDesk.isSaved}
        isFollowed={readerDesk.isFollowed}
        onToggleSave={readerDesk.toggleSave}
        onToggleFollow={readerDesk.toggleFollow}
      />

      <ReaderDeskDrawer
        isOpen={deskOpen}
        onClose={handleCloseDesk}
        activeTab={deskTab}
        onChangeTab={setDeskTab}
        lang={lang}
        currentEdition={edition}
        readerState={readerDesk.readerState}
        storageWarning={readerDesk.storageWarning}
        onDismissStorageWarning={readerDesk.dismissStorageWarning}
        followedStatuses={readerDesk.followedStatuses}
        isLoadingFollowedHistory={readerDesk.isLoadingFollowedHistory}
        catchUp={readerDesk.catchUp}
        onMarkAsReviewed={readerDesk.markAsReviewed}
        onUnsaveSignal={(signalId) =>
          readerDesk.toggleSave({
            signalId,
            editionDate: activeEditionDate ?? '',
            headline: signalId,
            domain: 'world',
          })
        }
        onUnfollowSignal={(signalId) =>
          readerDesk.toggleFollow({
            signalId,
            editionDate: activeEditionDate ?? '',
            headline: signalId,
            domain: 'world',
          })
        }
        onAddTopic={readerDesk.addTopic}
        onRemoveTopic={readerDesk.removeTopic}
        onClearAllData={readerDesk.clearAllData}
        onOpenSignalInEdition={handleOpenSignalInEdition}
        onOpenStoryline={handleOpenStoryline}
        onFilterByTopic={handleFilterByTopic}
      />

      <EditionComparisonModal
        isOpen={compareOpen}
        onClose={handleCloseComparison}
        lang={lang}
        editions={index?.editions ?? []}
        fromDate={editionComparison.fromDate}
        toDate={editionComparison.toDate}
        onChangeFromDate={editionComparison.setFromDate}
        onChangeToDate={editionComparison.setToDate}
        onSwapDates={editionComparison.swapDates}
        validationError={editionComparison.validationError}
        wasReversedInput={editionComparison.wasReversedInput}
        result={editionComparison.result}
        isLoading={editionComparison.isLoading}
        fetchError={editionComparison.fetchError}
        onRetry={editionComparison.retry}
        onOpenSignalInEdition={handleOpenSignalInEdition}
        onOpenStoryline={handleOpenStoryline}
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
