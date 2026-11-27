import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  GitBranch,
  History,
  RefreshCw,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import type {
  ClaimStatus,
  ConfidenceLevel,
  EditionIndexEntry,
  SignalDomain,
  SignalStatus,
  UiLanguage,
} from '../../types/edition';
import { getUiStrings } from '../../lib/i18n/uiStrings';
import {
  confidenceColorClass,
  domainAccentTextClass,
} from '../../lib/filtering/filterSignals';
import {
  countActiveGlobalSearchFilters,
  type GlobalSearchFilters,
  type GlobalSearchSortBy,
  type GroupedSearchResult,
} from '../../lib/intelligence/search/searchIndex';
import type { SearchIndexingStatus } from '../../hooks/useGlobalSearch';
import type { SignalBookmarkInput } from '../../hooks/useReaderDesk';
import { useAccessibleModal } from '../../hooks/useAccessibleModal';

interface GlobalSearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  lang: UiLanguage;
  editions: EditionIndexEntry[];
  query: string;
  onChangeQuery: (q: string) => void;
  filters: GlobalSearchFilters;
  onChangeFilters: (next: GlobalSearchFilters) => void;
  onResetFilters: () => void;
  sortBy: GlobalSearchSortBy;
  onChangeSortBy: (next: GlobalSearchSortBy) => void;
  status: SearchIndexingStatus;
  indexedCount: number;
  totalEditions: number;
  failedDates: string[];
  malformedCount: number;
  results: GroupedSearchResult[];
  totalOccurrences: number;
  facets: {
    topics: string[];
    tags: string[];
    publishers: string[];
  };
  onCancelIndexing: () => void;
  onResumeIndexing: () => void;
  onOpenSignalInEdition: (editionDate: string, signalId: string) => void;
  onOpenStoryline: (signalId: string) => void;
  isSaved: (signalId: string) => boolean;
  isFollowed: (signalId: string) => boolean;
  onToggleSave: (input: SignalBookmarkInput) => void;
  onToggleFollow: (input: SignalBookmarkInput) => void;
}

const DOMAINS: readonly SignalDomain[] = ['world', 'ai', 'economy'];
const CONFIDENCE_LEVELS: readonly ConfidenceLevel[] = [
  'high',
  'medium',
  'low',
  'unverified',
];
const SIGNAL_STATUSES: readonly SignalStatus[] = [
  'new',
  'developing',
  'ongoing',
  'confirmed',
  'disputed',
  'unverified',
  'closed',
  'corrected',
];
const CLAIM_STATUSES: readonly ClaimStatus[] = [
  'confirmed',
  'reported',
  'official_claim',
  'disputed',
  'unverified',
];
const SORT_OPTIONS: readonly GlobalSearchSortBy[] = [
  'relevance',
  'latest',
  'importance',
  'confidence',
];

export const GlobalSearchOverlay: React.FC<GlobalSearchOverlayProps> = ({
  isOpen,
  onClose,
  lang,
  editions,
  query,
  onChangeQuery,
  filters,
  onChangeFilters,
  onResetFilters,
  sortBy,
  onChangeSortBy,
  status,
  indexedCount,
  totalEditions,
  failedDates,
  malformedCount,
  results,
  totalOccurrences,
  facets,
  onCancelIndexing,
  onResumeIndexing,
  onOpenSignalInEdition,
  onOpenStoryline,
  isSaved,
  isFollowed,
  onToggleSave,
  onToggleFollow,
}) => {
  const t = getUiStrings(lang);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const titleId = React.useId();

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [expandedSignalIds, setExpandedSignalIds] = useState<Set<string>>(
    () => new Set()
  );
  const [activeIndex, setActiveIndex] = useState<number>(0);

  useAccessibleModal(isOpen, onClose, dialogRef);

  // Focus the search input cleanly whenever opened
  useEffect(() => {
    if (!isOpen) return;
    const id = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
    return () => window.cancelAnimationFrame(id);
  }, [isOpen]);

  // Reset active highlight when result list changes
  useEffect(() => {
    setActiveIndex(0);
  }, [query, filters, sortBy, results.length]);

  const activeFilterCount = useMemo(
    () => countActiveGlobalSearchFilters(filters),
    [filters]
  );

  // Auto-open filters if user arrived via a shareable URL containing filters
  useEffect(() => {
    if (isOpen && activeFilterCount > 0) {
      setFiltersOpen(true);
    }
  }, [activeFilterCount, isOpen]);

  if (!isOpen) return null;

  const hasSearchIntent = query.trim().length > 0 || activeFilterCount > 0;
  const isIndexing = status === 'indexing';
  const isCancelled = status === 'cancelled';
  const progressPct =
    totalEditions > 0
      ? Math.min(100, Math.round((indexedCount / totalEditions) * 100))
      : 100;

  const editionDatesAsc = [...editions]
    .map((e) => e.date)
    .sort((a, b) => a.localeCompare(b));

  const toggleHistory = (signalId: string) => {
    setExpandedSignalIds((prev) => {
      const next = new Set(prev);
      if (next.has(signalId)) next.delete(signalId);
      else next.add(signalId);
      return next;
    });
  };

  const handleOpenOccurrence = (editionDate: string, signalId: string) => {
    onOpenSignalInEdition(editionDate, signalId);
    onClose();
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter' && !e.shiftKey) {
      const selected = results[activeIndex];
      if (selected) {
        e.preventDefault();
        handleOpenOccurrence(selected.latestEditionDate, selected.signalId);
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-[#141311]/55 p-0 sm:p-5 md:p-8 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      data-testid="global-search-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="flex h-full sm:h-auto sm:max-h-[88vh] w-full max-w-[940px] flex-col border border-[var(--ws-border-strong)] bg-[var(--ws-canvas)] shadow-[var(--ws-shadow-lg)] sm:rounded-[var(--ws-radius-md)] overflow-hidden"
      >
        {/* Top Masthead & Search Input Bar */}
        <div className="ws-drawer-masthead px-5 py-4.5 sm:px-6 space-y-3.5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5 min-w-0">
              <div className="ws-kicker text-[var(--ws-editorial-accent)]">
                WORLD SIGNAL · ARCHIVE INDEX
              </div>
              <h2
                id={titleId}
                className="font-display text-[1.3rem] sm:text-[1.5rem] font-semibold tracking-[-0.018em] text-[var(--ws-ink)]"
              >
                {t.globalSearch.dialogTitle}
              </h2>
              <p className="text-[12.5px] text-[var(--ws-ink-muted)]">
                {t.globalSearch.dialogSubtitle}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t.globalSearch.close}
              data-testid="global-search-close"
              className="rounded-[var(--ws-radius-sm)] p-1.5 text-[var(--ws-ink-muted)] hover:bg-[var(--ws-surface-subtle)] hover:text-[var(--ws-ink)] transition-colors cursor-pointer shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Primary Search Input */}
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ws-ink-muted)]"
            />
            <input
              ref={inputRef}
              type="search"
              data-testid="global-search-input"
              value={query}
              onChange={(e) => onChangeQuery(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder={t.globalSearch.inputPlaceholder}
              aria-label={t.globalSearch.inputPlaceholder}
              className="w-full min-h-[44px] rounded-[var(--ws-radius-sm)] border border-[var(--ws-border-strong)] bg-[var(--ws-canvas)] py-2.5 pl-10 pr-10 text-[14.5px] text-[var(--ws-ink)] placeholder:text-[var(--ws-ink-faint)] focus:border-[var(--ws-ink)] focus:outline-none"
            />
            {query.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  onChangeQuery('');
                  inputRef.current?.focus();
                }}
                aria-label={t.globalSearch.clearQuery}
                data-testid="global-search-clear"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-[var(--ws-ink-muted)] hover:text-[var(--ws-ink)] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Controls Row: Progressive-Disclosure Filters Toggle + Sort + Indexing Progress */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                data-testid="global-search-filters-toggle"
                onClick={() => setFiltersOpen((prev) => !prev)}
                aria-expanded={filtersOpen}
                className={`inline-flex min-h-[34px] items-center gap-1.5 rounded-[var(--ws-radius-sm)] border px-3 py-1 text-[12px] font-medium transition-colors cursor-pointer ${
                  filtersOpen || activeFilterCount > 0
                    ? 'border-[var(--ws-ink)] bg-[var(--ws-surface-elevated)] text-[var(--ws-ink)]'
                    : 'border-[var(--ws-border)] bg-[var(--ws-canvas)] text-[var(--ws-ink-secondary)] hover:border-[var(--ws-border-strong)] hover:text-[var(--ws-ink)]'
                }`}
              >
                <SlidersHorizontal className="h-3.5 w-3.5 shrink-0" />
                <span>{t.globalSearch.filtersToggle}</span>
                {activeFilterCount > 0 && (
                  <span className="font-mono-tabular text-[11px] font-semibold text-[var(--ws-editorial-accent)]">
                    ({activeFilterCount})
                  </span>
                )}
              </button>

              {activeFilterCount > 0 && (
                <button
                  type="button"
                  data-testid="global-search-reset-filters"
                  onClick={onResetFilters}
                  className="text-[12px] font-medium text-[var(--ws-ink-muted)] hover:text-[var(--ws-ink)] underline underline-offset-4 cursor-pointer"
                >
                  {t.globalSearch.resetFilters}
                </button>
              )}

              {/* Sort Selector */}
              <label className="inline-flex items-center gap-1.5 text-[12px] text-[var(--ws-ink-muted)]">
                <span className="font-mono-tabular text-[11px] uppercase tracking-[0.08em]">
                  {t.globalSearch.sortLabel}
                </span>
                <select
                  data-testid="global-search-sort"
                  value={sortBy}
                  onChange={(e) =>
                    onChangeSortBy(e.target.value as GlobalSearchSortBy)
                  }
                  className="min-h-[34px] rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-canvas)] px-2.5 py-1 text-[12px] font-medium text-[var(--ws-ink)] focus:border-[var(--ws-border-strong)] focus:outline-none cursor-pointer"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {t.globalSearch.sortOptions[opt]}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Indexing Status & Cancel/Resume */}
            <div className="flex items-center gap-2 font-mono-tabular text-[11.5px] text-[var(--ws-ink-muted)]">
              {isIndexing ? (
                <>
                  <RefreshCw className="h-3 w-3 animate-spin text-[var(--ws-world)] shrink-0" />
                  <span data-testid="global-search-indexing-status">
                    {t.globalSearch.indexingStatus(indexedCount, totalEditions)}
                  </span>
                  <button
                    type="button"
                    data-testid="global-search-cancel-indexing"
                    onClick={onCancelIndexing}
                    className="rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] px-2 py-0.5 text-[11px] font-medium text-[var(--ws-ink)] hover:border-[var(--ws-border-strong)] cursor-pointer"
                  >
                    {t.globalSearch.cancelSearch}
                  </button>
                </>
              ) : isCancelled ? (
                <>
                  <span className="text-[var(--ws-warn)]">
                    {indexedCount}/{totalEditions}
                  </span>
                  <button
                    type="button"
                    data-testid="global-search-resume-indexing"
                    onClick={onResumeIndexing}
                    className="rounded-[var(--ws-radius-sm)] border border-[var(--ws-border-strong)] bg-[var(--ws-canvas)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--ws-ink)] hover:bg-[var(--ws-surface-hover)] cursor-pointer"
                  >
                    {t.globalSearch.resumeIndexing}
                  </button>
                </>
              ) : (
                <span data-testid="global-search-indexing-status">
                  {t.globalSearch.indexedCompleteStatus(indexedCount)}
                </span>
              )}
            </div>
          </div>

          {/* Sort Explainer Note */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11.5px] text-[var(--ws-ink-muted)]">
            <span>{t.globalSearch.sortExplainer[sortBy]}</span>
            <span className="hidden sm:inline font-mono-tabular text-[11px] text-[var(--ws-ink-faint)]">
              {t.globalSearch.keyboardHint}
            </span>
          </div>

          {/* Thin Progress Hairline during incremental indexing */}
          {isIndexing && (
            <div
              aria-hidden="true"
              className="h-[2px] w-full bg-[var(--ws-border-subtle)] overflow-hidden"
            >
              <div
                className="h-full bg-[var(--ws-world)] transition-[width] duration-200"
                style={{ width: `${Math.max(8, progressPct)}%` }}
              />
            </div>
          )}

          {/* Progressive-Disclosure Advanced Filter Panel */}
          {filtersOpen && (
            <div
              data-testid="global-search-filters-panel"
              className="border border-[var(--ws-border)] bg-[var(--ws-surface-subtle)]/75 rounded-[var(--ws-radius-sm)] p-3.5 grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 text-[12px] max-h-[38vh] overflow-y-auto sm:max-h-none sm:overflow-visible"
            >
              {/* Domain */}
              <label className="space-y-1">
                <span className="block ws-kicker text-[var(--ws-ink-faint)]">
                  {t.expanded.allDomains}
                </span>
                <select
                  data-testid="search-filter-domain"
                  value={filters.domain}
                  onChange={(e) =>
                    onChangeFilters({
                      ...filters,
                      domain: e.target.value as SignalDomain | 'all',
                    })
                  }
                  className="w-full min-h-[34px] rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-canvas)] px-2.5 py-1 text-[12px] text-[var(--ws-ink)]"
                >
                  <option value="all">{t.expanded.allDomains}</option>
                  {DOMAINS.map((d) => (
                    <option key={d} value={d}>
                      {t.domains[d]}
                    </option>
                  ))}
                </select>
              </label>

              {/* Date From */}
              <label className="space-y-1">
                <span className="block ws-kicker text-[var(--ws-ink-faint)]">
                  {t.globalSearch.dateFromLabel}
                </span>
                <select
                  data-testid="search-filter-date-from"
                  value={filters.dateFrom}
                  onChange={(e) =>
                    onChangeFilters({ ...filters, dateFrom: e.target.value })
                  }
                  className="w-full min-h-[34px] rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-canvas)] px-2.5 py-1 font-mono-tabular text-[12px] text-[var(--ws-ink)]"
                >
                  <option value="">—</option>
                  {editionDatesAsc.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </label>

              {/* Date To */}
              <label className="space-y-1">
                <span className="block ws-kicker text-[var(--ws-ink-faint)]">
                  {t.globalSearch.dateToLabel}
                </span>
                <select
                  data-testid="search-filter-date-to"
                  value={filters.dateTo}
                  onChange={(e) =>
                    onChangeFilters({ ...filters, dateTo: e.target.value })
                  }
                  className="w-full min-h-[34px] rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-canvas)] px-2.5 py-1 font-mono-tabular text-[12px] text-[var(--ws-ink)]"
                >
                  <option value="">—</option>
                  {editionDatesAsc.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </label>

              {/* Min Importance (strictly separate from Confidence) */}
              <label className="space-y-1">
                <span className="block ws-kicker text-[var(--ws-ink-faint)]">
                  {t.expanded.importanceLabel}
                </span>
                <select
                  data-testid="search-filter-importance"
                  value={filters.minImportance}
                  onChange={(e) =>
                    onChangeFilters({
                      ...filters,
                      minImportance: Number(e.target.value),
                    })
                  }
                  className="w-full min-h-[34px] rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-canvas)] px-2.5 py-1 text-[12px] text-[var(--ws-ink)]"
                >
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {t.expanded.importanceMin(lvl)}
                    </option>
                  ))}
                </select>
              </label>

              {/* Confidence */}
              <label className="space-y-1">
                <span className="block ws-kicker text-[var(--ws-ink-faint)]">
                  {t.expanded.confidenceLabel}
                </span>
                <select
                  data-testid="search-filter-confidence"
                  value={filters.confidence}
                  onChange={(e) =>
                    onChangeFilters({
                      ...filters,
                      confidence: e.target.value as ConfidenceLevel | 'all',
                    })
                  }
                  className="w-full min-h-[34px] rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-canvas)] px-2.5 py-1 text-[12px] text-[var(--ws-ink)]"
                >
                  <option value="all">{t.expanded.allConfidence}</option>
                  {CONFIDENCE_LEVELS.map((c) => (
                    <option key={c} value={c}>
                      {t.confidence[c]}
                    </option>
                  ))}
                </select>
              </label>

              {/* Signal Status */}
              <label className="space-y-1">
                <span className="block ws-kicker text-[var(--ws-ink-faint)]">
                  {t.masthead.statusLabel}
                </span>
                <select
                  data-testid="search-filter-status"
                  value={filters.status}
                  onChange={(e) =>
                    onChangeFilters({
                      ...filters,
                      status: e.target.value as SignalStatus | 'all',
                    })
                  }
                  className="w-full min-h-[34px] rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-canvas)] px-2.5 py-1 text-[12px] text-[var(--ws-ink)]"
                >
                  <option value="all">{t.expanded.allStatus}</option>
                  {SIGNAL_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {t.signalStatus[s]}
                    </option>
                  ))}
                </select>
              </label>

              {/* Claim Status */}
              <label className="space-y-1">
                <span className="block ws-kicker text-[var(--ws-ink-faint)]">
                  {t.globalSearch.claimStatusLabel}
                </span>
                <select
                  data-testid="search-filter-claim-status"
                  value={filters.claimStatus}
                  onChange={(e) =>
                    onChangeFilters({
                      ...filters,
                      claimStatus: e.target.value as ClaimStatus | 'all',
                    })
                  }
                  className="w-full min-h-[34px] rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-canvas)] px-2.5 py-1 text-[12px] text-[var(--ws-ink)]"
                >
                  <option value="all">{t.globalSearch.allClaimStatuses}</option>
                  {CLAIM_STATUSES.map((cs) => (
                    <option key={cs} value={cs}>
                      {t.claimStatus[cs]}
                    </option>
                  ))}
                </select>
              </label>

              {/* Topic */}
              <label className="space-y-1">
                <span className="block ws-kicker text-[var(--ws-ink-faint)]">
                  {t.expanded.topicLabel}
                </span>
                <select
                  data-testid="search-filter-topic"
                  value={filters.topic}
                  onChange={(e) =>
                    onChangeFilters({ ...filters, topic: e.target.value })
                  }
                  className="w-full min-h-[34px] rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-canvas)] px-2.5 py-1 text-[12px] text-[var(--ws-ink)]"
                >
                  <option value="all">{t.expanded.allTopics}</option>
                  {facets.topics.map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
                </select>
              </label>

              {/* Tag */}
              <label className="space-y-1 sm:col-span-1 lg:col-span-2">
                <span className="block ws-kicker text-[var(--ws-ink-faint)]">
                  {t.expanded.sourceTagsLabel}
                </span>
                <select
                  data-testid="search-filter-tag"
                  value={filters.tag}
                  onChange={(e) =>
                    onChangeFilters({ ...filters, tag: e.target.value })
                  }
                  className="w-full min-h-[34px] rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-canvas)] px-2.5 py-1 text-[12px] text-[var(--ws-ink)]"
                >
                  <option value="all">{t.expanded.allTags}</option>
                  {facets.tags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </label>

              {/* Publisher / Source Outlet */}
              <label className="space-y-1 sm:col-span-1 lg:col-span-2">
                <span className="block ws-kicker text-[var(--ws-ink-faint)]">
                  {t.globalSearch.publisherLabel}
                </span>
                <input
                  type="text"
                  data-testid="search-filter-publisher"
                  value={filters.publisher}
                  onChange={(e) =>
                    onChangeFilters({ ...filters, publisher: e.target.value })
                  }
                  placeholder={t.globalSearch.publisherPlaceholder}
                  list="ws-search-publishers"
                  className="w-full min-h-[34px] rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-canvas)] px-2.5 py-1 text-[12px] text-[var(--ws-ink)] placeholder:text-[var(--ws-ink-faint)]"
                />
                <datalist id="ws-search-publishers">
                  {facets.publishers.slice(0, 60).map((pub) => (
                    <option key={pub} value={pub} />
                  ))}
                </datalist>
              </label>
            </div>
          )}
        </div>

        {/* Status Banners & Scrollable Results Body */}
        <div className="flex-1 overflow-y-auto ws-scroll px-4 py-4 sm:px-6 sm:py-5 space-y-4">
          {/* Partial / Cancelled / Failed / Malformed Disclosure Banners */}
          {isIndexing && results.length > 0 && (
            <div className="ws-folio-note px-3.5 py-2 text-[12px] text-[var(--ws-ink-secondary)]">
              {t.globalSearch.partialResultsBanner(indexedCount, totalEditions)}
            </div>
          )}

          {isCancelled && (
            <div className="ws-caution-panel px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-[12px] text-[var(--ws-ink-secondary)]">
              <span>
                {t.globalSearch.cancelledBanner(indexedCount, totalEditions)}
              </span>
              <button
                type="button"
                onClick={onResumeIndexing}
                className="font-semibold text-[var(--ws-ink)] underline underline-offset-4 cursor-pointer"
              >
                {t.globalSearch.resumeIndexing}
              </button>
            </div>
          )}

          {failedDates.length > 0 && (
            <div className="ws-caution-panel px-3.5 py-2 text-[12px] text-[var(--ws-warn)]">
              {t.globalSearch.failedEditionsBanner(
                failedDates.length,
                failedDates.join(', ')
              )}
            </div>
          )}

          {malformedCount > 0 && (
            <div className="ws-folio-note px-3.5 py-2 text-[12px] text-[var(--ws-ink-muted)]">
              {t.globalSearch.malformedEditionsNote(malformedCount)}
            </div>
          )}

          {/* Results Summary Bar */}
          {results.length > 0 && (
            <div className="flex items-center justify-between border-b border-[var(--ws-border)] pb-2 font-mono-tabular text-[11.5px] text-[var(--ws-ink-muted)]">
              <span data-testid="global-search-summary">
                {t.globalSearch.resultsSummary(results.length, totalOccurrences)}
              </span>
              {activeFilterCount > 0 && (
                <span>{t.globalSearch.activeFiltersCount(activeFilterCount)}</span>
              )}
            </div>
          )}

          {/* Explicit States: Initial / Searching / No Results / Grouped Matches */}
          {!hasSearchIntent && results.length === 0 ? (
            <div className="py-10 text-center space-y-2 max-w-lg mx-auto">
              <h3 className="font-display text-lg font-semibold text-[var(--ws-ink)]">
                {t.globalSearch.initialPromptTitle}
              </h3>
              <p className="text-[13px] leading-relaxed text-[var(--ws-ink-muted)]">
                {t.globalSearch.initialPromptBody}
              </p>
            </div>
          ) : results.length === 0 && isIndexing ? (
            <div className="py-10 flex flex-col items-center justify-center gap-2.5 text-center">
              <RefreshCw className="h-4 w-4 animate-spin text-[var(--ws-world)]" />
              <p className="font-mono-tabular text-[12.5px] text-[var(--ws-ink-muted)]">
                {t.globalSearch.searchingEmptyNote(indexedCount, totalEditions)}
              </p>
            </div>
          ) : results.length === 0 ? (
            <div
              data-testid="global-search-empty"
              className="py-10 text-center space-y-2 max-w-md mx-auto"
            >
              <h3 className="font-display text-lg font-semibold text-[var(--ws-ink)]">
                {t.globalSearch.noResultsTitle}
              </h3>
              <p className="text-[13px] leading-relaxed text-[var(--ws-ink-muted)]">
                {t.globalSearch.noResultsBody}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--ws-border)] border-b border-[var(--ws-border)]">
              {results.map((item, idx) => {
                const isSelectedRow = idx === activeIndex;
                const isExpanded = expandedSignalIds.has(item.signalId);
                const saved = isSaved(item.signalId);
                const followed = isFollowed(item.signalId);

                const bookmarkInput: SignalBookmarkInput = {
                  signalId: item.signalId,
                  editionDate: item.latestEditionDate,
                  headline: item.latestHeadline,
                  domain: item.domain,
                };

                return (
                  <article
                    key={item.signalId}
                    data-testid={`search-result-${item.signalId}`}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={`relative py-4 px-3 sm:px-4 transition-colors space-y-2.5 ${
                      isSelectedRow
                        ? 'bg-[var(--ws-surface)] shadow-[inset_0_2px_0_0_var(--ws-editorial-accent)]'
                        : 'hover:bg-[var(--ws-surface)]/65'
                    }`}
                  >
                    {/* Unboxed Metadata Line */}
                    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 font-mono-tabular text-[11px] text-[var(--ws-ink-muted)]">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span
                          className={`font-semibold uppercase tracking-[0.06em] ${domainAccentTextClass(
                            item.domain
                          )}`}
                        >
                          {t.domains[item.domain]}
                        </span>
                        <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">
                          ·
                        </span>
                        <span className="font-semibold text-[var(--ws-ink)]">
                          {t.metaLine.importance(item.latestImportance)}
                        </span>
                        <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">
                          ·
                        </span>
                        <span
                          className={`font-medium ${confidenceColorClass(
                            item.latestConfidence
                          )}`}
                        >
                          {t.metaLine.confidence(t.confidence[item.latestConfidence])}
                        </span>
                        <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">
                          ·
                        </span>
                        <span>{t.signalStatus[item.latestStatus]}</span>
                        <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">
                          ·
                        </span>
                        <span className="text-[var(--ws-ink)] font-semibold">
                          {item.latestEditionDate}
                        </span>
                      </div>

                      <span className="text-[10.5px] text-[var(--ws-ink-faint)] break-all sm:break-normal">
                        {item.signalId}
                      </span>
                    </div>

                    {/* Headline */}
                    <h3 className="font-display text-[1.06rem] sm:text-[1.14rem] font-semibold leading-[1.32] text-[var(--ws-ink)]">
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenOccurrence(item.latestEditionDate, item.signalId)
                        }
                        className="text-left hover:text-[var(--ws-world)] hover:underline decoration-[var(--ws-border-strong)] underline-offset-4 cursor-pointer"
                      >
                        {item.latestHeadline}
                      </button>
                    </h3>

                    {/* Matching Excerpt */}
                    {item.excerpt && (
                      <p className="text-[12.5px] leading-relaxed text-[var(--ws-ink-secondary)] line-clamp-2">
                        {item.excerpt}
                      </p>
                    )}

                    {/* Matched Fields & Longitudinal Appearance Summary */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono-tabular text-[11px] text-[var(--ws-ink-muted)]">
                      {item.topic && <span>{item.topic}</span>}
                      {item.matchedFields.length > 0 && (
                        <span>
                          <span className="text-[var(--ws-ink-faint)]">
                            {t.globalSearch.matchedInPrefix}:{' '}
                          </span>
                          {item.matchedFields
                            .slice(0, 4)
                            .map((f) => t.globalSearch.matchFields[f])
                            .join(' · ')}
                        </span>
                      )}
                      <span className="text-[var(--ws-ink-secondary)]">
                        {t.globalSearch.appearancesCount(item.appearanceCount)}
                      </span>
                      {item.materialUpdateCount > 0 && (
                        <span className="font-semibold text-[var(--ws-world)]">
                          {t.globalSearch.materialUpdatesCount(item.materialUpdateCount)}
                        </span>
                      )}
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleOpenOccurrence(item.latestEditionDate, item.signalId)
                          }
                          className="inline-flex min-h-[30px] items-center gap-1.5 text-[12px] font-semibold text-[var(--ws-ink)] hover:text-[var(--ws-world)] cursor-pointer"
                        >
                          <span>
                            {t.globalSearch.openEditionSignal(item.latestEditionDate)}
                          </span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>

                        {item.occurrences.length > 1 && (
                          <button
                            type="button"
                            data-testid={`search-expand-history-${item.signalId}`}
                            onClick={() => toggleHistory(item.signalId)}
                            aria-expanded={isExpanded}
                            className="inline-flex min-h-[30px] items-center gap-1 font-mono-tabular text-[11.5px] font-medium text-[var(--ws-ink-muted)] hover:text-[var(--ws-ink)] cursor-pointer"
                          >
                            <History className="h-3 w-3" />
                            <span>
                              {isExpanded
                                ? t.globalSearch.collapseHistory
                                : t.globalSearch.expandHistory}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5" />
                            )}
                          </button>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          data-testid={`search-storyline-${item.signalId}`}
                          onClick={() => {
                            onClose();
                            onOpenStoryline(item.signalId);
                          }}
                          className="inline-flex min-h-[28px] items-center gap-1 rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-canvas)] px-2 py-0.5 text-[11.5px] font-medium text-[var(--ws-ink-secondary)] hover:border-[var(--ws-border-strong)] hover:text-[var(--ws-ink)] cursor-pointer"
                        >
                          <GitBranch className="h-3 w-3" />
                          <span>{t.globalSearch.openStoryline}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onToggleFollow(bookmarkInput)}
                          aria-pressed={followed}
                          className={`inline-flex min-h-[28px] items-center gap-1 rounded-[var(--ws-radius-sm)] border px-2 py-0.5 text-[11.5px] font-medium cursor-pointer transition-colors ${
                            followed
                              ? 'border-[var(--ws-world)] bg-[var(--ws-surface-elevated)] text-[var(--ws-world)]'
                              : 'border-[var(--ws-border)] bg-[var(--ws-canvas)] text-[var(--ws-ink-secondary)] hover:border-[var(--ws-border-strong)] hover:text-[var(--ws-ink)]'
                          }`}
                        >
                          {followed ? (
                            <Eye className="h-3 w-3" />
                          ) : (
                            <EyeOff className="h-3 w-3" />
                          )}
                          <span>
                            {followed
                              ? t.readerDesk.followingAction
                              : t.readerDesk.followAction}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onToggleSave(bookmarkInput)}
                          aria-pressed={saved}
                          className={`inline-flex min-h-[28px] items-center gap-1 rounded-[var(--ws-radius-sm)] border px-2 py-0.5 text-[11.5px] font-medium cursor-pointer transition-colors ${
                            saved
                              ? 'border-[var(--ws-editorial-accent)] bg-[var(--ws-surface-elevated)] text-[var(--ws-editorial-accent)]'
                              : 'border-[var(--ws-border)] bg-[var(--ws-canvas)] text-[var(--ws-ink-secondary)] hover:border-[var(--ws-border-strong)] hover:text-[var(--ws-ink)]'
                          }`}
                        >
                          {saved ? (
                            <BookmarkCheck className="h-3 w-3" />
                          ) : (
                            <Bookmark className="h-3 w-3" />
                          )}
                          <span>
                            {saved
                              ? t.readerDesk.savedAction
                              : t.readerDesk.saveAction}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Expandable Historical Occurrences Across Editions */}
                    {isExpanded && item.occurrences.length > 1 && (
                      <div
                        data-testid={`search-occurrences-${item.signalId}`}
                        className="mt-2 border-t border-[var(--ws-border-subtle)] bg-[var(--ws-surface-elevated)]/70 px-3 py-2.5 space-y-2"
                      >
                        <ul className="divide-y divide-[var(--ws-border-subtle)]">
                          {item.occurrences.map((occ) => (
                            <li
                              key={`${item.signalId}-${occ.editionDate}`}
                              className="py-2 first:pt-0 last:pb-0 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div className="min-w-0 space-y-0.5">
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono-tabular text-[11px]">
                                  <span className="font-semibold text-[var(--ws-ink)]">
                                    {occ.editionDate}
                                  </span>
                                  <span className="text-[var(--ws-ink-muted)]">
                                    {t.metaLine.importance(occ.importance)} ·{' '}
                                    {t.confidence[occ.confidence]} ·{' '}
                                    {t.signalStatus[occ.status]}
                                  </span>
                                  {occ.hasMaterialUpdateFromPrevious && (
                                    <span className="font-semibold text-[var(--ws-world)]">
                                      · {t.globalSearch.materialUpdateTag}
                                      {occ.updateReasons.length > 0
                                        ? ` (${occ.updateReasons
                                            .map((r) => t.dailyDelta.reasons[r])
                                            .join(', ')})`
                                        : ''}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[12.5px] text-[var(--ws-ink-secondary)] break-words">
                                  {occ.headline}
                                </div>
                              </div>
                              <button
                                type="button"
                                data-testid={`search-open-occ-${item.signalId}-${occ.editionDate}`}
                                onClick={() =>
                                  handleOpenOccurrence(occ.editionDate, item.signalId)
                                }
                                className="inline-flex self-start sm:self-center shrink-0 items-center gap-1 font-mono-tabular text-[11.5px] font-semibold text-[var(--ws-world)] hover:underline underline-offset-4 cursor-pointer"
                              >
                                <span>
                                  {t.globalSearch.openEditionSignal(occ.editionDate)}
                                </span>
                                <ArrowRight className="h-3 w-3" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
