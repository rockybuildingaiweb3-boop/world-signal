import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Check,
  ExternalLink,
  Link2,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import type {
  ConfidenceLevel,
  ParsedEdition,
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
  extractUniqueTags,
  extractUniqueTopics,
  filterSignals,
} from '../../lib/filtering/filterSignals';
import {
  formatCompactTimestamp,
  formatEventDateRange,
} from '../../lib/dates/formatDates';
import { SignalMetaLine } from '../../components/editorial/SignalMetaLine';
import { SafeMarkdown } from '../../components/editorial/SafeMarkdown';
import { TimelineTrack } from '../../components/editorial/TimelineTrack';
import { ScenariosGrid } from '../../components/editorial/ScenariosGrid';

interface ExpandedViewProps {
  edition: ParsedEdition;
  lang: UiLanguage;
  filters: SignalFilters;
  onChangeFilters: (next: SignalFilters) => void;
  selectedSignalId: string | null;
  onSelectSignal: (signalId: string) => void;
  mobileShowDetail: boolean;
  onChangeMobileShowDetail: (show: boolean) => void;
}

const DOMAINS: readonly SignalDomain[] = ['world', 'ai', 'economy'];
const CONFIDENCE_LEVELS: readonly ConfidenceLevel[] = ['high', 'medium', 'low', 'unverified'];
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

export const ExpandedView: React.FC<ExpandedViewProps> = ({
  edition,
  lang,
  filters,
  onChangeFilters,
  selectedSignalId,
  onSelectSignal,
  mobileShowDetail,
  onChangeMobileShowDetail,
}) => {
  const t = getUiStrings(lang);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [highlightedSourceId, setHighlightedSourceId] = useState<string | null>(null);
  const [highlightedClaimId, setHighlightedClaimId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const dossierTopRef = useRef<HTMLDivElement | null>(null);

  const uniqueTopics = useMemo(
    () => extractUniqueTopics(edition.signals),
    [edition.signals]
  );
  const uniqueTags = useMemo(
    () => extractUniqueTags(edition.signals),
    [edition.signals]
  );
  const filteredSignals = useMemo(
    () => filterSignals(edition.signals, filters),
    [edition.signals, filters]
  );
  const activeFilterCount = countActiveFilters(filters);

  const signalById = useMemo(() => {
    const map = new Map<string, ParsedSignal>();
    for (const s of edition.signals) map.set(s.signal_id, s);
    return map;
  }, [edition.signals]);

  // Active dossier: prefer selectedSignalId if it exists in filteredSignals;
  // else if selectedSignalId exists in edition (e.g. deep link), fall back to first filtered signal
  const activeSignal: ParsedSignal | null = useMemo(() => {
    if (selectedSignalId) {
      const inFiltered = filteredSignals.find((s) => s.signal_id === selectedSignalId);
      if (inFiltered) return inFiltered;
    }
    return filteredSignals[0] ?? null;
  }, [filteredSignals, selectedSignalId]);

  useEffect(() => {
    setHighlightedSourceId(null);
    setHighlightedClaimId(null);
  }, [activeSignal?.signal_id]);

  const handleSelectFromList = (signalId: string) => {
    onSelectSignal(signalId);
    onChangeMobileShowDetail(true);
    if (dossierTopRef.current && window.innerWidth >= 1024) {
      dossierTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (window.innerWidth < 1024) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleJumpToSignal = (signalId: string) => {
    if (!signalById.has(signalId)) return;
    // If target signal is filtered out, reset filters so user can actually view it
    const isVisible = filteredSignals.some((s) => s.signal_id === signalId);
    if (!isVisible) {
      onChangeFilters({ ...DEFAULT_FILTERS });
    }
    handleSelectFromList(signalId);
  };

  const handleInspectSource = (sourceId: string) => {
    setHighlightedSourceId(sourceId);
    const el = document.getElementById(`dossier-source-${sourceId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleInspectClaim = (claimId: string) => {
    setHighlightedClaimId(claimId);
    const el = document.getElementById(`dossier-claim-${claimId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleCopyLink = async (signalId: string) => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('edition', edition.frontmatter.edition_date);
      url.searchParams.set('view', 'expanded');
      url.searchParams.set('signal', signalId);
      await navigator.clipboard.writeText(url.toString());
      setCopiedId(signalId);
      window.setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // Clipboard unavailable in restricted context
    }
  };

  const jumpSections = useMemo(() => {
    if (!activeSignal) return [];
    const list: Array<{ id: string; label: string }> = [];
    if (activeSignal.sections.whatHappened)
      list.push({ id: 'sec-what-happened', label: t.expanded.sections.whatHappened });
    if (activeSignal.sections.verifiedFacts)
      list.push({ id: 'sec-verified-facts', label: t.expanded.sections.verifiedFacts });
    if (activeSignal.sections.timeline)
      list.push({ id: 'sec-timeline', label: t.expanded.sections.timeline });
    if (activeSignal.sections.analysis)
      list.push({ id: 'sec-analysis', label: t.expanded.sections.analysis });
    if (activeSignal.sections.uncertainties)
      list.push({ id: 'sec-uncertainties', label: t.expanded.sections.uncertainties });
    if (activeSignal.sections.scenarios)
      list.push({ id: 'sec-scenarios', label: t.expanded.sections.scenarios });
    list.push({ id: 'sec-claims', label: t.expanded.sections.claims });
    list.push({ id: 'sec-sources', label: t.expanded.sections.sources });
    return list;
  }, [activeSignal, t.expanded.sections]);

  return (
    <div className="pb-16">
      {/* Split-Pane Signal Explorer */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[350px_minmax(0,1fr)] lg:items-start">
        {/* LEFT PANE: Filterable Signal Library (Hidden on mobile when reading a dossier) */}
        <aside
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
              <span className="font-mono-tabular text-[11.5px] text-[var(--ws-ink-muted)]">
                {t.expanded.showingCount(filteredSignals.length, edition.signals.length)}
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

            {/* Structured Multi-Dimensional Filters (including Topic!) */}
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
                  aria-label="Status"
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
                  aria-label="Tag"
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
                  aria-label="Source class"
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
                const isActive = activeSignal?.signal_id === sig.signal_id;
                return (
                  <button
                    key={sig.signal_id}
                    type="button"
                    onClick={() => handleSelectFromList(sig.signal_id)}
                    aria-current={isActive ? 'true' : undefined}
                    className={`w-full p-3.5 text-left transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[var(--ws-surface-subtle)]'
                        : 'bg-[var(--ws-surface)] hover:bg-[var(--ws-surface-elevated)]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 font-mono-tabular text-[11px] mb-1">
                      <span
                        className={`font-semibold ${domainAccentTextClass(
                          sig.domain
                        )}`}
                      >
                        {t.domains[sig.domain]}
                      </span>
                      <span className="text-[var(--ws-ink-muted)]">
                        {t.metaLine.importance(sig.importance)} ·{' '}
                        <span className={confidenceColorClass(sig.confidence.overall)}>
                          {t.confidence[sig.confidence.overall]}
                        </span>
                      </span>
                    </div>
                    <div
                      className={`text-[13.5px] leading-snug ${
                        isActive
                          ? 'font-semibold text-[var(--ws-ink)]'
                          : 'font-medium text-[var(--ws-ink-secondary)]'
                      }`}
                    >
                      {sig.headline}
                    </div>
                    <div className="mt-1.5 flex items-center justify-between font-mono-tabular text-[11px] text-[var(--ws-ink-muted)]">
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

        {/* RIGHT PANE: Dedicated Active Signal Dossier Reading Canvas */}
        <section
          ref={dossierTopRef}
          className={`${
            mobileShowDetail ? 'block' : 'hidden lg:block'
          } min-w-0`}
        >
          {/* Mobile Back-to-List Bar (Preserves Filters & Scroll Context) */}
          <div className="mb-4 lg:hidden">
            <button
              type="button"
              onClick={() => onChangeMobileShowDetail(false)}
              className="inline-flex items-center gap-1.5 rounded-md border border-[var(--ws-border)] bg-[var(--ws-surface)] px-3 py-1.5 text-xs font-medium text-[var(--ws-ink)] cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {t.expanded.backToList} ({filteredSignals.length})
            </button>
          </div>

          {!activeSignal ? (
            <div className="ws-card p-10 text-center space-y-3">
              <h2 className="font-display text-xl font-semibold text-[var(--ws-ink)]">
                {t.expanded.noMatchesTitle}
              </h2>
              <p className="text-sm text-[var(--ws-ink-muted)]">
                {t.expanded.noMatchesBody}
              </p>
            </div>
          ) : (
            <article className="ws-card p-6 sm:p-8 lg:p-10 space-y-8">
              {/* Dossier Header */}
              <header className="space-y-4 border-b border-[var(--ws-border)] pb-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono-tabular text-xs text-[var(--ws-ink-muted)]">
                    {activeSignal.signal_id}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyLink(activeSignal.signal_id)}
                    className="inline-flex items-center gap-1.5 rounded border border-[var(--ws-border)] px-2.5 py-1 text-xs font-medium text-[var(--ws-ink-muted)] hover:border-[var(--ws-border-strong)] hover:text-[var(--ws-ink)] cursor-pointer"
                  >
                    {copiedId === activeSignal.signal_id ? (
                      <>
                        <Check className="h-3 w-3 text-[var(--ws-economy)]" />
                        {t.expanded.copiedLink}
                      </>
                    ) : (
                      <>
                        <Link2 className="h-3 w-3" />
                        {t.expanded.copySignalLink}
                      </>
                    )}
                  </button>
                </div>

                <h2 className="font-display text-2xl sm:text-[1.9rem] font-semibold leading-[1.22] tracking-[-0.02em] text-[var(--ws-ink)] headline-balance">
                  {activeSignal.headline}
                </h2>

                <SignalMetaLine signal={activeSignal} lang={lang} showClaims />

                {/* Provenance Metadata Grid — Strictly Separating Event Date vs. Publication/Verification Times */}
                <dl className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-md border border-[var(--ws-border)] bg-[var(--ws-surface-subtle)] p-4 sm:grid-cols-4 text-xs">
                  <div>
                    <dt className="font-mono-tabular text-[10.5px] uppercase tracking-wider text-[var(--ws-ink-muted)]">
                      {t.expanded.eventDateLabel}
                    </dt>
                    <dd className="mt-0.5 font-mono-tabular font-medium text-[var(--ws-ink)]">
                      {formatEventDateRange(
                        activeSignal.event.start_date,
                        activeSignal.event.end_date,
                        lang
                      )}
                    </dd>
                  </div>

                  <div>
                    <dt className="font-mono-tabular text-[10.5px] uppercase tracking-wider text-[var(--ws-ink-muted)]">
                      {t.expanded.updatedLabel}
                    </dt>
                    <dd className="mt-0.5 font-mono-tabular font-medium text-[var(--ws-ink)]">
                      {formatCompactTimestamp(activeSignal.updated_at, lang)}
                    </dd>
                  </div>

                  <div>
                    <dt className="font-mono-tabular text-[10.5px] uppercase tracking-wider text-[var(--ws-ink-muted)]">
                      {t.expanded.topicLabel}
                    </dt>
                    <dd className="mt-0.5 font-medium text-[var(--ws-ink)]">
                      {activeSignal.topic}
                    </dd>
                  </div>

                  <div>
                    <dt className="font-mono-tabular text-[10.5px] uppercase tracking-wider text-[var(--ws-ink-muted)]">
                      {t.expanded.geographyLabel}
                    </dt>
                    <dd className="mt-0.5 font-medium text-[var(--ws-ink)]">
                      {activeSignal.event.geography.length > 0
                        ? activeSignal.event.geography.join(', ')
                        : '—'}
                    </dd>
                  </div>
                </dl>

                {/* Confidence Rationale (Separated clearly from Importance) */}
                {activeSignal.confidence.rationale && (
                  <div className="rounded-md border border-[var(--ws-border)] bg-[var(--ws-surface-elevated)] px-4 py-3 text-xs leading-relaxed text-[var(--ws-ink-secondary)]">
                    <span
                      className={`font-semibold ${confidenceColorClass(
                        activeSignal.confidence.overall
                      )}`}
                    >
                      {t.expanded.confidenceRationaleTitle} (
                      {t.confidence[activeSignal.confidence.overall]}):{' '}
                    </span>
                    {activeSignal.confidence.rationale}
                  </div>
                )}

                {/* Compact Section Jump Strip */}
                {jumpSections.length > 0 && (
                  <nav
                    aria-label={t.expanded.sectionJumpLabel}
                    className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-1 font-mono-tabular text-[11.5px] text-[var(--ws-ink-muted)]"
                  >
                    <span className="uppercase tracking-wider text-[10.5px]">
                      {t.expanded.sectionJumpLabel}:
                    </span>
                    {jumpSections.map((sec) => (
                      <a
                        key={sec.id}
                        href={`#${sec.id}`}
                        className="hover:text-[var(--ws-ink)] underline decoration-[var(--ws-border)] underline-offset-2 hover:decoration-current"
                      >
                        {sec.label}
                      </a>
                    ))}
                  </nav>
                )}
              </header>

              {/* Editorial Dossier Narrative Body (max-w-prose rhythm) */}
              <div className="max-w-[74ch] space-y-8">
                {/* Factual Layer */}
                {activeSignal.sections.whatHappened && (
                  <section id="sec-what-happened" className="scroll-mt-24 space-y-2.5">
                    <h3 className="font-display text-lg font-semibold text-[var(--ws-ink)]">
                      {t.expanded.sections.whatHappened}
                    </h3>
                    <SafeMarkdown
                      content={activeSignal.sections.whatHappened}
                      onSelectSignal={handleJumpToSignal}
                      onInspectSource={handleInspectSource}
                      sources={activeSignal.sources}
                    />
                  </section>
                )}

                {activeSignal.sections.verifiedFacts && (
                  <section id="sec-verified-facts" className="scroll-mt-24 space-y-2.5">
                    <h3 className="font-display text-lg font-semibold text-[var(--ws-ink)]">
                      {t.expanded.sections.verifiedFacts}
                    </h3>
                    <div className="rounded-md border border-[var(--ws-border)] bg-[var(--ws-surface-elevated)] p-5">
                      <SafeMarkdown
                        content={activeSignal.sections.verifiedFacts}
                        onSelectSignal={handleJumpToSignal}
                        onInspectSource={handleInspectSource}
                        sources={activeSignal.sources}
                      />
                    </div>
                  </section>
                )}

                {activeSignal.sections.timeline && (
                  <section id="sec-timeline" className="scroll-mt-24 space-y-3">
                    <h3 className="font-display text-lg font-semibold text-[var(--ws-ink)]">
                      {t.expanded.sections.timeline}
                    </h3>
                    <TimelineTrack
                      entries={activeSignal.sections.timelineEntries}
                      rawFallback={activeSignal.sections.timeline}
                      onSelectSignal={handleJumpToSignal}
                      onInspectSource={handleInspectSource}
                      sources={activeSignal.sources}
                    />
                  </section>
                )}

                {/* Interpretive Layer */}
                {activeSignal.sections.whyItMatters && (
                  <section className="space-y-2.5 border-t border-[var(--ws-border)] pt-6">
                    <h3 className="font-display text-lg font-semibold text-[var(--ws-ink)]">
                      {t.expanded.sections.whyItMatters}
                    </h3>
                    <SafeMarkdown
                      content={activeSignal.sections.whyItMatters}
                      onSelectSignal={handleJumpToSignal}
                      onInspectSource={handleInspectSource}
                      sources={activeSignal.sources}
                    />
                  </section>
                )}

                {activeSignal.sections.sourcePerspectives && (
                  <section className="space-y-2.5">
                    <h3 className="font-display text-lg font-semibold text-[var(--ws-ink)]">
                      {t.expanded.sections.sourcePerspectives}
                    </h3>
                    <SafeMarkdown
                      content={activeSignal.sections.sourcePerspectives}
                      onSelectSignal={handleJumpToSignal}
                      onInspectSource={handleInspectSource}
                      sources={activeSignal.sources}
                    />
                  </section>
                )}

                {activeSignal.sections.analysis && (
                  <section id="sec-analysis" className="scroll-mt-24 space-y-2.5">
                    <h3 className="font-display text-lg font-semibold text-[var(--ws-ink)]">
                      {t.expanded.sections.analysis}
                    </h3>
                    <SafeMarkdown
                      content={activeSignal.sections.analysis}
                      onSelectSignal={handleJumpToSignal}
                      onInspectSource={handleInspectSource}
                      sources={activeSignal.sources}
                    />
                  </section>
                )}

                {/* Uncertainties Layer */}
                {activeSignal.sections.uncertainties && (
                  <section
                    id="sec-uncertainties"
                    className="scroll-mt-24 rounded-md border border-[var(--ws-warn-border)] bg-[var(--ws-warn-soft)] p-5 space-y-2.5"
                  >
                    <h3 className="font-display text-base font-semibold text-[var(--ws-warn)]">
                      {t.expanded.sections.uncertainties}
                    </h3>
                    <SafeMarkdown
                      content={activeSignal.sections.uncertainties}
                      compact
                      onSelectSignal={handleJumpToSignal}
                      onInspectSource={handleInspectSource}
                      sources={activeSignal.sources}
                    />
                  </section>
                )}
              </div>

              {/* Forward-Looking Scenarios (Full Dossier Width for 3-column grid) */}
              {activeSignal.sections.scenarios && (
                <section id="sec-scenarios" className="scroll-mt-24 space-y-3 border-t border-[var(--ws-border)] pt-6">
                  <h3 className="font-display text-lg font-semibold text-[var(--ws-ink)]">
                    {t.expanded.sections.scenarios}
                  </h3>
                  <ScenariosGrid
                    items={activeSignal.sections.scenarioItems}
                    rawFallback={activeSignal.sections.scenarios}
                    lang={lang}
                    onSelectSignal={handleJumpToSignal}
                    onInspectSource={handleInspectSource}
                    sources={activeSignal.sources}
                  />
                </section>
              )}

              {/* Personal Relevance & What to Watch */}
              <div className="max-w-[74ch] space-y-6">
                {activeSignal.sections.personalRelevance && (
                  <section className="space-y-2">
                    <h3 className="font-display text-lg font-semibold text-[var(--ws-ink)]">
                      {t.expanded.sections.personalRelevance}
                    </h3>
                    <SafeMarkdown
                      content={activeSignal.sections.personalRelevance}
                      onSelectSignal={handleJumpToSignal}
                      onInspectSource={handleInspectSource}
                      sources={activeSignal.sources}
                    />
                  </section>
                )}

                {activeSignal.sections.whatToWatch && (
                  <section className="space-y-2">
                    <h3 className="font-display text-lg font-semibold text-[var(--ws-ink)]">
                      {t.expanded.sections.whatToWatch}
                    </h3>
                    <SafeMarkdown
                      content={activeSignal.sections.whatToWatch}
                      onSelectSignal={handleJumpToSignal}
                      onInspectSource={handleInspectSource}
                      sources={activeSignal.sources}
                    />
                  </section>
                )}
              </div>

              {/* Interactive Claim Evidence Ledger */}
              <section
                id="sec-claims"
                className="scroll-mt-24 space-y-4 border-t border-[var(--ws-border)] pt-7"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-display text-lg font-semibold text-[var(--ws-ink)]">
                    {t.expanded.sections.claims}
                  </h3>
                  <span className="font-mono-tabular text-xs text-[var(--ws-ink-muted)]">
                    {t.metaLine.claims(activeSignal.claims.length)}
                  </span>
                </div>

                {activeSignal.claims.length === 0 ? (
                  <p className="text-xs text-[var(--ws-ink-muted)]">
                    {t.expanded.claimsEmpty}
                  </p>
                ) : (
                  <ul className="divide-y divide-[var(--ws-border)] rounded-md border border-[var(--ws-border)] bg-[var(--ws-surface-elevated)]">
                    {activeSignal.claims.map((claim) => {
                      const isHighlighted = highlightedClaimId === claim.claim_id;
                      return (
                        <li
                          key={claim.claim_id}
                          id={`dossier-claim-${claim.claim_id}`}
                          className={`p-4 space-y-2 transition-colors ${
                            isHighlighted ? 'bg-[var(--ws-world-soft)]' : ''
                          }`}
                        >
                          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono-tabular text-[11.5px] text-[var(--ws-ink-muted)]">
                            <span className="font-semibold text-[var(--ws-ink)]">
                              {claim.claim_id}
                            </span>
                            <span aria-hidden="true" className="opacity-40">
                              ·
                            </span>
                            <span>{t.claimStatus[claim.status]}</span>
                            <span aria-hidden="true" className="opacity-40">
                              ·
                            </span>
                            <span className={confidenceColorClass(claim.confidence)}>
                              {t.confidence[claim.confidence]}
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed text-[var(--ws-ink-secondary)]">
                            {claim.statement}
                          </p>
                          {claim.source_ids.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2 font-mono-tabular text-[11.5px]">
                              <span className="text-[var(--ws-ink-muted)]">
                                {t.expanded.supportingSources}:
                              </span>
                              {claim.source_ids.map((sid) => {
                                const src = activeSignal.sources.find(
                                  (s) => s.source_id === sid
                                );
                                return (
                                  <button
                                    key={sid}
                                    type="button"
                                    onClick={() => handleInspectSource(sid)}
                                    className="text-[var(--ws-world)] underline decoration-[var(--ws-border-strong)] underline-offset-2 hover:decoration-current cursor-pointer"
                                  >
                                    {sid}
                                    {src ? ` (${src.outlet})` : ''}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>

              {/* Interactive Source Ledger */}
              <section
                id="sec-sources"
                className="scroll-mt-24 space-y-4 border-t border-[var(--ws-border)] pt-7"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-display text-lg font-semibold text-[var(--ws-ink)]">
                    {t.expanded.sections.sources}
                  </h3>
                  <span className="font-mono-tabular text-xs text-[var(--ws-ink-muted)]">
                    {t.masthead.independentOriginsCount(
                      activeSignal.independentOriginCount
                    )}{' '}
                    · {t.masthead.recordsCount(activeSignal.sources.length)}
                  </span>
                </div>

                {activeSignal.sources.length === 0 ? (
                  <p className="text-xs text-[var(--ws-ink-muted)]">
                    {t.expanded.sourcesEmpty}
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {activeSignal.sources.map((src) => {
                      const isHighlighted = highlightedSourceId === src.source_id;
                      return (
                        <li
                          key={src.source_id}
                          id={`dossier-source-${src.source_id}`}
                          className={`rounded-md border p-4 space-y-2 transition-colors ${
                            isHighlighted
                              ? 'border-[var(--ws-world)] bg-[var(--ws-world-soft)]'
                              : 'border-[var(--ws-border)] bg-[var(--ws-surface-elevated)]'
                          }`}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="space-y-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono-tabular text-[11.5px]">
                                <span className="font-semibold text-[var(--ws-ink)]">
                                  {src.source_id}
                                </span>
                                <span aria-hidden="true" className="opacity-40">
                                  ·
                                </span>
                                <span className="font-semibold text-[var(--ws-ink)]">
                                  {src.outlet}
                                </span>
                                <span aria-hidden="true" className="opacity-40">
                                  ·
                                </span>
                                <span className="text-[var(--ws-ink-muted)]">
                                  {t.sourceClass[src.source_class]}
                                </span>
                                <span aria-hidden="true" className="opacity-40">
                                  ·
                                </span>
                                <span className="text-[var(--ws-ink-muted)]">
                                  {t.relationship[src.relationship]}
                                </span>
                              </div>

                              <div className="text-sm font-medium text-[var(--ws-ink)] leading-snug">
                                {src.url && src.urlSafe ? (
                                  <a
                                    href={src.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-baseline gap-1.5 hover:text-[var(--ws-world)] underline decoration-[var(--ws-border-strong)] underline-offset-2"
                                  >
                                    <span>{src.title}</span>
                                    <ExternalLink className="h-3 w-3 shrink-0 self-center" />
                                  </a>
                                ) : (
                                  <span>{src.title}</span>
                                )}
                              </div>
                            </div>

                            <div className="font-mono-tabular text-[11px] shrink-0">
                              {src.qualifiesAsIndependent ? (
                                <span className="font-semibold text-[var(--ws-conf-high)]">
                                  {t.expanded.qualifiesIndependent}
                                </span>
                              ) : (
                                <span className="text-[var(--ws-ink-muted)]">
                                  {t.expanded.excludedFromIndependent}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono-tabular text-[11px] text-[var(--ws-ink-muted)]">
                            <span>
                              Group: {src.independence_group || '—'}
                            </span>
                            <span>
                              {t.expanded.registryIdLabel}:{' '}
                              {src.registry_id && src.registry_id.toLowerCase() !== 'null'
                                ? src.registry_id
                                : t.expanded.unregisteredCandidate}
                            </span>
                            {src.published_at && (
                              <span>
                                {t.expanded.publishedLabel}:{' '}
                                {formatCompactTimestamp(src.published_at, lang)}
                              </span>
                            )}
                          </div>

                          {!src.qualifiesAsIndependent && src.exclusionReason && (
                            <div className="text-[11.5px] text-[var(--ws-ink-muted)]">
                              {t.audit.originExclusionReasonLabel}:{' '}
                              {t.exclusionReason[src.exclusionReason]}
                            </div>
                          )}

                          {src.url && !src.urlSafe && (
                            <div className="text-[11.5px] font-medium text-[var(--ws-error)]">
                              {t.expanded.unsafeUrlBlocked}
                            </div>
                          )}

                          {src.supports_claim_ids.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2 pt-1 font-mono-tabular text-[11px]">
                              <span className="text-[var(--ws-ink-muted)]">
                                {t.expanded.supportsClaims}:
                              </span>
                              {src.supports_claim_ids.map((cid) => (
                                <button
                                  key={cid}
                                  type="button"
                                  onClick={() => handleInspectClaim(cid)}
                                  className="text-[var(--ws-world)] underline decoration-dotted underline-offset-2 hover:decoration-solid cursor-pointer"
                                >
                                  {cid}
                                </button>
                              ))}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>

              {/* Related Signals Navigation */}
              {activeSignal.related_signal_ids.length > 0 && (
                <section className="space-y-3 border-t border-[var(--ws-border)] pt-6">
                  <h3 className="font-display text-base font-semibold text-[var(--ws-ink)]">
                    {t.expanded.relatedSignalsTitle}
                  </h3>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {activeSignal.related_signal_ids.map((relId) => {
                      const target = signalById.get(relId);
                      if (!target) {
                        return (
                          <div
                            key={relId}
                            className="rounded-md border border-[var(--ws-border)] bg-[var(--ws-surface-subtle)] p-3 text-xs text-[var(--ws-ink-muted)]"
                          >
                            <div className="font-mono-tabular">{relId}</div>
                            <div className="mt-0.5 text-[11px]">
                              {t.expanded.relatedNotInEdition}
                            </div>
                          </div>
                        );
                      }
                      return (
                        <button
                          key={relId}
                          type="button"
                          onClick={() => handleJumpToSignal(target.signal_id)}
                          className="rounded-md border border-[var(--ws-border)] bg-[var(--ws-surface-elevated)] p-3 text-left hover:border-[var(--ws-border-strong)] transition-colors cursor-pointer space-y-1"
                        >
                          <div className="font-mono-tabular text-[11px] text-[var(--ws-ink-muted)]">
                            <span className={domainAccentTextClass(target.domain)}>
                              {t.domains[target.domain]}
                            </span>{' '}
                            · {target.signal_id}
                          </div>
                          <div className="text-xs font-semibold text-[var(--ws-ink)] leading-snug">
                            {target.headline}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Tags Footer */}
              {activeSignal.tags.length > 0 && (
                <footer className="border-t border-[var(--ws-border)] pt-4 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono-tabular text-[11.5px] text-[var(--ws-ink-muted)]">
                  <span>Tags:</span>
                  {activeSignal.tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        onChangeFilters({ ...DEFAULT_FILTERS, tag });
                        onChangeMobileShowDetail(false);
                      }}
                      className="hover:text-[var(--ws-ink)] underline decoration-[var(--ws-border)] underline-offset-2 cursor-pointer"
                    >
                      #{tag}
                    </button>
                  ))}
                </footer>
              )}
            </article>
          )}
        </section>
      </div>
    </div>
  );
};
