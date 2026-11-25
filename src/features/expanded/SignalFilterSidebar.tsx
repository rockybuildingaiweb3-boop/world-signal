import React, { useState } from 'react';
import { RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import type {
  ConfidenceLevel,
  ParsedSignal,
  SignalDomain,
  SignalFilters,
  SignalStatus,
  SourceClass,
  UiLanguage,
} from '../../types/edition';
import { getUiStrings } from '../../lib/i18n/uiStrings';
import {
  confidenceColorClass,
  countActiveFilters,
  DEFAULT_FILTERS,
  domainAccentTextClass,
} from '../../lib/filtering/filterSignals';

interface SignalFilterSidebarProps {
  totalCount: number;
  filteredSignals: ParsedSignal[];
  activeSignalId: string | null;
  filters: SignalFilters;
  onChangeFilters: (next: SignalFilters) => void;
  uniqueTopics: string[];
  uniqueTags: string[];
  lang: UiLanguage;
  mobileShowDetail: boolean;
  onSelectSignal: (signalId: string) => void;
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
const SOURCE_CLASSES: readonly SourceClass[] = [
  'tier_1_newsroom',
  'specialist_publication',
  'primary_source',
  'research_paper',
  'unknown',
];

export const SignalFilterSidebar: React.FC<SignalFilterSidebarProps> = ({
  totalCount,
  filteredSignals,
  activeSignalId,
  filters,
  onChangeFilters,
  uniqueTopics,
  uniqueTags,
  lang,
  mobileShowDetail,
  onSelectSignal,
}) => {
  const t = getUiStrings(lang);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const activeFilterCount = countActiveFilters(filters);

  return (
    <aside
      aria-label={t.expanded.title}
      className={`${
        mobileShowDetail ? 'hidden lg:flex' : 'flex'
      } flex-col lg:sticky lg:top-[76px] lg:max-h-[calc(100vh-96px)] ws-card overflow-hidden`}
    >
      {/* Search & Quick Domain Controls */}
      <div className="border-b border-[var(--ws-border)] p-4 space-y-3 bg-[var(--ws-surface)]">
        <div className="flex items-center justify-between gap-2">
          <h1 className="font-display text-base font-semibold text-[var(--ws-ink)]">
            {t.expanded.title}
          </h1>
          <span className="font-mono-tabular text-[11.5px] text-[var(--ws-ink-muted)] shrink-0">
            {t.expanded.showingCount(filteredSignals.length, totalCount)}
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--ws-ink-muted)]" />
          <input
            type="search"
            value={filters.query}
            onChange={(e) =>
              onChangeFilters({ ...filters, query: e.target.value })
            }
            placeholder={t.expanded.searchPlaceholder}
            aria-label={t.expanded.searchPlaceholder}
            className="w-full rounded-md border border-[var(--ws-border)] bg-[var(--ws-canvas)] py-1.5 pl-8 pr-3 text-xs text-[var(--ws-ink)] placeholder:text-[var(--ws-ink-muted)]"
          />
        </div>

        {/* Domain Segmented Row */}
        <div className="grid grid-cols-4 gap-1 rounded-md border border-[var(--ws-border)] bg-[var(--ws-surface-subtle)] p-0.5 text-[11.5px]">
          <button
            type="button"
            onClick={() => onChangeFilters({ ...filters, domain: 'all' })}
            className={`rounded py-1 font-medium transition-colors cursor-pointer ${
              filters.domain === 'all'
                ? 'bg-[var(--ws-surface)] text-[var(--ws-ink)] shadow-xs'
                : 'text-[var(--ws-ink-muted)] hover:text-[var(--ws-ink)]'
            }`}
          >
            {lang === 'zh-CN' ? '全部' : 'All'}
          </button>
          {DOMAINS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => onChangeFilters({ ...filters, domain: d })}
              className={`rounded py-1 font-medium transition-colors cursor-pointer truncate px-1 ${
                filters.domain === d
                  ? 'bg-[var(--ws-surface)] text-[var(--ws-ink)] shadow-xs'
                  : 'text-[var(--ws-ink-muted)] hover:text-[var(--ws-ink)]'
              }`}
            >
              {d === 'world'
                ? lang === 'zh-CN'
                  ? '世界'
                  : 'World'
                : d === 'ai'
                  ? 'AI'
                  : lang === 'zh-CN'
                    ? '经济'
                    : 'Econ'}
            </button>
          ))}
        </div>

        {/* Advanced Filter Toggle & Reset */}
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setShowAdvancedFilters((prev) => !prev)}
            aria-expanded={showAdvancedFilters}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--ws-ink-secondary)] hover:text-[var(--ws-ink)] cursor-pointer"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>
              {t.expanded.filtersButton}
              {activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </span>
          </button>

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={() => onChangeFilters({ ...DEFAULT_FILTERS })}
              className="inline-flex items-center gap-1 text-xs font-medium text-[var(--ws-ink-muted)] hover:text-[var(--ws-ink)] cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              {t.expanded.resetFilters}
            </button>
          )}
        </div>

        {/* Structured Multi-Dimensional Filters */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-2 gap-2 border-t border-[var(--ws-border)] pt-3">
            <select
              aria-label={t.expanded.importanceLabel}
              value={filters.minImportance}
              onChange={(e) =>
                onChangeFilters({
                  ...filters,
                  minImportance: Number(e.target.value),
                })
              }
              className="rounded border border-[var(--ws-border)] bg-[var(--ws-canvas)] px-2 py-1.5 text-xs text-[var(--ws-ink)]"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {t.expanded.importanceMin(n)}
                </option>
              ))}
            </select>

            <select
              aria-label={t.expanded.confidenceLabel}
              value={filters.confidence}
              onChange={(e) =>
                onChangeFilters({
                  ...filters,
                  confidence: e.target.value as ConfidenceLevel | 'all',
                })
              }
              className="rounded border border-[var(--ws-border)] bg-[var(--ws-canvas)] px-2 py-1.5 text-xs text-[var(--ws-ink)]"
            >
              <option value="all">{t.expanded.allConfidence}</option>
              {CONFIDENCE_LEVELS.map((c) => (
                <option key={c} value={c}>
                  {t.confidence[c]}
                </option>
              ))}
            </select>

            <select
              aria-label={t.masthead.statusLabel}
              value={filters.status}
              onChange={(e) =>
                onChangeFilters({
                  ...filters,
                  status: e.target.value as SignalStatus | 'all',
                })
              }
              className="rounded border border-[var(--ws-border)] bg-[var(--ws-canvas)] px-2 py-1.5 text-xs text-[var(--ws-ink)]"
            >
              <option value="all">{t.expanded.allStatus}</option>
              {SIGNAL_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {t.signalStatus[st]}
                </option>
              ))}
            </select>

            <select
              aria-label={t.expanded.topicLabel}
              value={filters.topic}
              onChange={(e) =>
                onChangeFilters({ ...filters, topic: e.target.value })
              }
              className="rounded border border-[var(--ws-border)] bg-[var(--ws-canvas)] px-2 py-1.5 text-xs text-[var(--ws-ink)]"
            >
              <option value="all">{t.expanded.allTopics}</option>
              {uniqueTopics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>

            <select
              aria-label={t.expanded.allTags}
              value={filters.tag}
              onChange={(e) =>
                onChangeFilters({ ...filters, tag: e.target.value })
              }
              className="rounded border border-[var(--ws-border)] bg-[var(--ws-canvas)] px-2 py-1.5 text-xs text-[var(--ws-ink)]"
            >
              <option value="all">{t.expanded.allTags}</option>
              {uniqueTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>

            <select
              aria-label={t.expanded.allSourceClasses}
              value={filters.sourceClass}
              onChange={(e) =>
                onChangeFilters({
                  ...filters,
                  sourceClass: e.target.value as SourceClass | 'all',
                })
              }
              className="rounded border border-[var(--ws-border)] bg-[var(--ws-canvas)] px-2 py-1.5 text-xs text-[var(--ws-ink)]"
            >
              <option value="all">{t.expanded.allSourceClasses}</option>
              {SOURCE_CLASSES.map((sc) => (
                <option key={sc} value={sc}>
                  {t.sourceClass[sc]}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Scrollable Signal List */}
      <div className="flex-1 overflow-y-auto ws-scroll divide-y divide-[var(--ws-border)]">
        {filteredSignals.length === 0 ? (
          <div className="p-6 text-center space-y-2">
            <div className="text-sm font-medium text-[var(--ws-ink)]">
              {t.expanded.noMatchesTitle}
            </div>
            <p className="text-xs text-[var(--ws-ink-muted)]">
              {t.expanded.noMatchesBody}
            </p>
            <button
              type="button"
              onClick={() => onChangeFilters({ ...DEFAULT_FILTERS })}
              className="mt-2 inline-flex items-center gap-1.5 rounded border border-[var(--ws-border)] px-3 py-1.5 text-xs font-medium text-[var(--ws-ink)] hover:border-[var(--ws-border-strong)] cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              {t.expanded.resetFilters}
            </button>
          </div>
        ) : (
          filteredSignals.map((sig) => {
            const isActive = activeSignalId === sig.signal_id;
            return (
              <button
                key={sig.signal_id}
                type="button"
                onClick={() => onSelectSignal(sig.signal_id)}
                aria-current={isActive ? 'true' : undefined}
                className={`relative w-full p-3.5 text-left transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[var(--ws-surface-subtle)] border-l-2 border-l-[var(--ws-ink)]'
                    : 'bg-[var(--ws-surface)] hover:bg-[var(--ws-surface-elevated)] border-l-2 border-l-transparent'
                }`}
              >
                <div className="flex items-center justify-between gap-2 font-mono-tabular text-[11px] mb-1">
                  <span
                    className={`font-semibold ${domainAccentTextClass(sig.domain)}`}
                  >
                    {t.domains[sig.domain]}
                  </span>
                  <span className="text-[var(--ws-ink-muted)] shrink-0">
                    {t.metaLine.importance(sig.importance)} ·{' '}
                    <span className={confidenceColorClass(sig.confidence.overall)}>
                      {t.confidence[sig.confidence.overall]}
                    </span>
                  </span>
                </div>
                <div
                  className={`text-[13.5px] leading-snug break-words ${
                    isActive
                      ? 'font-semibold text-[var(--ws-ink)]'
                      : 'font-medium text-[var(--ws-ink-secondary)]'
                  }`}
                >
                  {sig.headline}
                </div>
                <div className="mt-1.5 flex items-center justify-between gap-2 font-mono-tabular text-[11px] text-[var(--ws-ink-muted)]">
                  <span className="truncate">{sig.topic}</span>
                  <span className="shrink-0">
                    {t.metaLine.origins(sig.independentOriginCount)}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
};
