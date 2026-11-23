import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Calendar, Moon, RefreshCw, Sun, Upload } from 'lucide-react';
import type {
  EditionsIndex,
  ParsedEdition,
  SignalFilters,
  ViewId,
} from '../types/edition';
import { fetchAndParseEdition, fetchEditionsIndex } from '../lib/content/editionClient';
import { parseEditionMarkdown } from '../lib/markdown/parseEdition';
import {
  DEFAULT_FILTERS,
  extractUniqueTags,
  filterSignals,
} from '../lib/filtering/filterSignals';
import { ArchiveEmptyState } from '../components/ArchiveEmptyState';
import { EditionFilterBar } from '../components/EditionFilterBar';
import { LocalMarkdownModal } from '../components/LocalMarkdownModal';
import { BriefingView } from '../features/briefing/BriefingView';
import { ExpandedView } from '../features/expanded/ExpandedView';
import { SynthesisView } from '../features/synthesis/SynthesisView';
import { AuditView } from '../features/audit/AuditView';

const VIEW_NAV: Array<{ id: ViewId; label: string }> = [
  { id: 'briefing', label: 'Briefing' },
  { id: 'expanded', label: 'Expanded' },
  { id: 'synthesis', label: 'Synthesis' },
  { id: 'audit', label: 'Audit' },
];

export const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('world-signal-theme');
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('world-signal-theme', darkMode ? 'dark' : 'light');
    } catch {
      // Ignore storage errors in restricted iframes
    }
  }, [darkMode]);

  const [activeView, setActiveView] = useState<ViewId>('briefing');
  const [index, setIndex] = useState<EditionsIndex | null>(null);
  const [indexLoading, setIndexLoading] = useState<boolean>(true);
  const [indexError, setIndexError] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState<string>('');
  const [edition, setEdition] = useState<ParsedEdition | null>(null);
  const [editionLoading, setEditionLoading] = useState<boolean>(false);
  const [editionError, setEditionError] = useState<string | null>(null);

  const [filters, setFilters] = useState<SignalFilters>(DEFAULT_FILTERS);
  const [focusedSignalId, setFocusedSignalId] = useState<string | null>(null);
  const [localModalOpen, setLocalModalOpen] = useState<boolean>(false);

  const loadArchiveIndex = useCallback(async () => {
    setIndexLoading(true);
    setIndexError(null);
    try {
      const loaded = await fetchEditionsIndex();
      setIndex(loaded);
      if (loaded.editions.length > 0) {
        const defaultEntry =
          loaded.editions.find((e) => e.date === loaded.latest_edition) ?? loaded.editions[0];
        setSelectedDate(defaultEntry.date);
      } else {
        setSelectedDate('');
        setEdition(null);
      }
    } catch (error) {
      setIndexError(
        error instanceof Error ? error.message : 'Failed to load archive index.'
      );
    } finally {
      setIndexLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadArchiveIndex();
  }, [loadArchiveIndex]);

  useEffect(() => {
    if (!index || !selectedDate) return;
    if (edition?.isLocalPreview) return;

    const entry = index.editions.find((e) => e.date === selectedDate);
    if (!entry) return;

    let cancelled = false;
    setEditionLoading(true);
    setEditionError(null);

    fetchAndParseEdition(entry.path)
      .then((parsed) => {
        if (!cancelled) {
          setEdition(parsed);
          setFilters(DEFAULT_FILTERS);
          setFocusedSignalId(null);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setEdition(null);
          setEditionError(
            error instanceof Error ? error.message : 'Failed to load edition.'
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setEditionLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [index, selectedDate, edition?.isLocalPreview]);

  const handleLoadLocalMarkdown = (markdown: string, label: string) => {
    const parsed = parseEditionMarkdown(markdown, label, true);
    setEdition(parsed);
    setEditionError(null);
    setFilters(DEFAULT_FILTERS);
    setFocusedSignalId(null);
    setActiveView('briefing');
  };

  const handleReturnToArchive = () => {
    setEdition(null);
    setEditionError(null);
    setFocusedSignalId(null);
    if (index && index.editions.length > 0) {
      const targetDate =
        selectedDate || index.latest_edition || index.editions[0].date;
      const entry = index.editions.find((e) => e.date === targetDate) ?? index.editions[0];
      setSelectedDate(entry.date);
      setEditionLoading(true);
      fetchAndParseEdition(entry.path)
        .then((parsed) => setEdition(parsed))
        .catch((err) =>
          setEditionError(err instanceof Error ? err.message : 'Failed to reload edition.')
        )
        .finally(() => setEditionLoading(false));
    }
  };

  const handleInspectSignal = (signalId: string) => {
    setFocusedSignalId(signalId);
    setActiveView('expanded');
  };

  const availableTags = useMemo(
    () => (edition ? extractUniqueTags(edition.signals) : []),
    [edition]
  );

  const filteredSignals = useMemo(
    () => (edition ? filterSignals(edition.signals, filters) : []),
    [edition, filters]
  );

  const showFilterBar =
    Boolean(edition) && (activeView === 'briefing' || activeView === 'expanded');

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] text-[#1C1917] dark:bg-[#121110] dark:text-[#EFECE6] transition-colors">
      {/* Strict 3-Zone Top Bar */}
      <header className="border-b border-stone-200 dark:border-stone-800 bg-[#FBF9F5]/95 dark:bg-[#121110]/95 backdrop-blur-sm">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single text wordmark */}
          <button
            type="button"
            onClick={() => {
              setActiveView('briefing');
              setFocusedSignalId(null);
            }}
            className="font-display text-xl font-bold tracking-tight text-[#1C1917] dark:text-[#EFECE6] whitespace-nowrap shrink-0 cursor-pointer"
          >
            WORLD SIGNAL
          </button>

          {/* Zone 2: 4 single-line view links */}
          <nav
            aria-label="Primary views"
            className="hidden md:flex items-center gap-6 text-sm font-medium"
          >
            {VIEW_NAV.map((item) => {
              const active = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveView(item.id)}
                  aria-current={active ? 'page' : undefined}
                  className={`min-h-[40px] px-1 inline-flex items-center border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'border-[#9A3412] dark:border-[#FDBA74] text-[#1C1917] dark:text-[#EFECE6] font-semibold'
                      : 'border-transparent text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#EFECE6]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => setLocalModalOpen(true)}
              className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 text-xs font-medium bg-[#1C1917] dark:bg-[#EFECE6] text-[#FBF9F5] dark:text-[#121110] rounded-md hover:opacity-90 transition-opacity whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" aria-hidden="true" />
              Load Markdown
            </button>
          </div>
        </div>

        {/* Mobile navigation row */}
        <nav
          aria-label="Mobile primary views"
          className="md:hidden border-t border-stone-200 dark:border-stone-800 px-4 flex items-center justify-between overflow-x-auto gap-2"
        >
          {VIEW_NAV.map((item) => {
            const active = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveView(item.id)}
                aria-current={active ? 'page' : undefined}
                className={`min-h-[44px] px-2 text-xs font-medium border-b-2 whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'border-[#9A3412] dark:border-[#FDBA74] text-[#1C1917] dark:text-[#EFECE6] font-semibold'
                    : 'border-transparent text-[#57534E] dark:text-[#A8A29E]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </header>

      {/* Workspace Utility Toolbar (Archive Selector, Local Preview Notice, Theme Switch) */}
      <div className="border-b border-stone-200 dark:border-stone-800 bg-[#F3EFE6]/50 dark:bg-[#171614]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {index && index.editions.length > 0 && !edition?.isLocalPreview && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#57534E] dark:text-[#A8A29E]" aria-hidden="true" />
                <label
                  htmlFor="archive-date-select"
                  className="font-medium text-[#57534E] dark:text-[#A8A29E]"
                >
                  Edition:
                </label>
                <select
                  id="archive-date-select"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="min-h-[36px] px-2.5 py-1 text-xs font-mono-tabular bg-[#FBF9F5] dark:bg-[#121110] text-[#1C1917] dark:text-[#EFECE6] border border-stone-300 dark:border-stone-700 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A]"
                >
                  {index.editions.map((entry) => (
                    <option key={entry.date} value={entry.date}>
                      {entry.date} ({entry.status})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {edition?.isLocalPreview && (
              <div className="flex flex-wrap items-center gap-2.5 text-[#78350F] dark:text-[#FCD34D]">
                <span className="font-medium">
                  Inspecting local preview: <span className="font-mono-tabular">{edition.sourceLabel}</span>
                </span>
                <button
                  type="button"
                  onClick={handleReturnToArchive}
                  className="underline underline-offset-4 hover:opacity-80 font-semibold cursor-pointer"
                >
                  Return to published archive
                </button>
              </div>
            )}

            {!edition && index && index.editions.length === 0 && (
              <span className="text-[#57534E] dark:text-[#A8A29E] tabular-nums">
                Archive status: 0 published editions in /data/editions-index.json
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setDarkMode((prev) => !prev)}
            aria-label={darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
            className="inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1 text-xs font-medium text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#EFECE6] border border-stone-300 dark:border-stone-700 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {darkMode ? (
              <>
                <Sun className="w-3.5 h-3.5" aria-hidden="true" />
                Light
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5" aria-hidden="true" />
                Dark
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Loading Index */}
        {indexLoading && (
          <div className="py-16 text-center space-y-2">
            <p className="font-display text-xl text-[#1C1917] dark:text-[#EFECE6]">
              Loading archive index...
            </p>
            <p className="text-sm text-[#57534E] dark:text-[#A8A29E]">
              Fetching <code className="font-mono-tabular">/data/editions-index.json</code>
            </p>
          </div>
        )}

        {/* Index Error */}
        {!indexLoading && indexError && (
          <div
            role="alert"
            className="p-6 border border-[#991B1B]/40 dark:border-[#FCA5A5]/40 bg-[#FEF2F2] dark:bg-[#2A1212] rounded-lg space-y-3"
          >
            <div className="flex items-center gap-2 text-[#991B1B] dark:text-[#FCA5A5] font-semibold">
              <AlertTriangle className="w-5 h-5" aria-hidden="true" />
              <span>Archive Index Unavailable</span>
            </div>
            <p className="text-sm text-[#44403C] dark:text-[#D6D3D1]">{indexError}</p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void loadArchiveIndex()}
                className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 text-xs font-medium bg-[#1C1917] dark:bg-[#EFECE6] text-[#FBF9F5] dark:text-[#121110] rounded-md cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                Retry
              </button>
              <button
                type="button"
                onClick={() => setLocalModalOpen(true)}
                className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 text-xs font-medium border border-stone-300 dark:border-stone-700 rounded-md cursor-pointer"
              >
                Inspect Local Markdown
              </button>
            </div>
          </div>
        )}

        {/* Edition Fetch Loading */}
        {!indexLoading && !indexError && editionLoading && (
          <div className="py-16 text-center space-y-2">
            <p className="font-display text-xl text-[#1C1917] dark:text-[#EFECE6]">
              Loading edition {selectedDate}...
            </p>
          </div>
        )}

        {/* Edition Fetch Error */}
        {!indexLoading && !indexError && !editionLoading && editionError && (
          <div
            role="alert"
            className="p-6 border border-[#991B1B]/40 dark:border-[#FCA5A5]/40 bg-[#FEF2F2] dark:bg-[#2A1212] rounded-lg space-y-3"
          >
            <div className="flex items-center gap-2 text-[#991B1B] dark:text-[#FCA5A5] font-semibold">
              <AlertTriangle className="w-5 h-5" aria-hidden="true" />
              <span>Failed to Load Selected Edition</span>
            </div>
            <p className="text-sm text-[#44403C] dark:text-[#D6D3D1]">{editionError}</p>
            <button
              type="button"
              onClick={handleReturnToArchive}
              className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 text-xs font-medium bg-[#1C1917] dark:bg-[#EFECE6] text-[#FBF9F5] dark:text-[#121110] rounded-md cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
              Retry Fetch
            </button>
          </div>
        )}

        {/* Empty Published Archive State */}
        {!indexLoading &&
          !indexError &&
          !editionLoading &&
          !editionError &&
          !edition &&
          index &&
          index.editions.length === 0 && (
            <ArchiveEmptyState
              index={index}
              onOpenLocalModal={() => setLocalModalOpen(true)}
            />
          )}

        {/* Recoverable Schema Validation Banner */}
        {edition && !edition.validation.isValid && (
          <div
            role="alert"
            className="p-4 border border-[#9A3412]/40 dark:border-[#FDBA74]/40 bg-[#FFF7ED] dark:bg-[#271A10] rounded-lg flex flex-wrap items-center justify-between gap-3 text-sm"
          >
            <div className="flex items-center gap-2.5 text-[#9A3412] dark:text-[#FDBA74]">
              <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>
                Edition parsed with {edition.validation.errors.length} schema{' '}
                {edition.validation.errors.length === 1 ? 'error' : 'errors'} and{' '}
                {edition.validation.warnings.length}{' '}
                {edition.validation.warnings.length === 1 ? 'warning' : 'warnings'}.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveView('audit')}
              className="text-xs font-semibold underline underline-offset-4 text-[#9A3412] dark:text-[#FDBA74] cursor-pointer"
            >
              Review in Audit & Methodology
            </button>
          </div>
        )}

        {/* Filter Bar */}
        {showFilterBar && edition && (
          <EditionFilterBar
            filters={filters}
            onChange={setFilters}
            availableTags={availableTags}
            totalSignals={edition.signals.length}
            matchedSignals={filteredSignals.length}
          />
        )}

        {/* Four First-Class Projections of the Parsed Edition */}
        {edition && activeView === 'briefing' && (
          <BriefingView
            edition={edition}
            filteredSignals={filteredSignals}
            onInspectSignal={handleInspectSignal}
          />
        )}

        {edition && activeView === 'expanded' && (
          <ExpandedView
            edition={edition}
            filteredSignals={filteredSignals}
            focusedSignalId={focusedSignalId}
            onFocusSignal={setFocusedSignalId}
          />
        )}

        {edition && activeView === 'synthesis' && (
          <SynthesisView
            edition={edition}
            onInspectSignal={handleInspectSignal}
          />
        )}

        {edition && activeView === 'audit' && (
          <AuditView
            edition={edition}
            onInspectSignal={handleInspectSignal}
          />
        )}
      </main>

      <footer className="border-t border-stone-200 dark:border-stone-800 py-6 mt-12">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-4 text-xs text-[#57534E] dark:text-[#A8A29E]">
          <span>
            WORLD SIGNAL — Evidence-led global intelligence briefing across World Events, AI
            Frontier, and Economic Outlook.
          </span>
          <span>Personal implications are general decision support, not financial advice.</span>
        </div>
      </footer>

      <LocalMarkdownModal
        isOpen={localModalOpen}
        onClose={() => setLocalModalOpen(false)}
        onLoadMarkdown={handleLoadLocalMarkdown}
      />
    </div>
  );
};

export default App;
