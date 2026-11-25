import React from 'react';
import {
  ArrowRight,
  AlertCircle,
  BookOpen,
  Compass,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import type {
  ParsedEdition,
  ParsedSignal,
  SignalDomain,
  UiLanguage,
  ViewId,
} from '../../types/edition';
import { getUiStrings } from '../../lib/i18n/uiStrings';
import {
  formatCoverageWindow,
  formatEditionDate,
  formatPublicationTimestamp,
} from '../../lib/dates/formatDates';
import { domainAccentTextClass } from '../../lib/filtering/filterSignals';
import { SignalMetaLine } from '../../components/editorial/SignalMetaLine';
import { SafeMarkdown } from '../../components/editorial/SafeMarkdown';
import {
  DomainEditorialEmblem,
  EditorialSignalArtwork,
} from '../../components/editorial/EditorialSignalArtwork';
import type { DailyDeltaState } from '../../lib/intelligence/daily-delta/dailyDeltaHelpers';
import { DailyDeltaSection } from './DailyDeltaSection';

interface BriefingViewProps {
  edition: ParsedEdition;
  lang: UiLanguage;
  dailyDelta: DailyDeltaState | null;
  onRetryDailyDelta: () => void;
  onOpenSignal: (signalId: string) => void;
  onOpenSignalInEdition: (editionDate: string, signalId: string) => void;
  onExploreDomain: (domain: SignalDomain) => void;
  onSwitchView: (view: ViewId) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

const DOMAINS: readonly SignalDomain[] = ['world', 'ai', 'economy'];

function domainAccentRuleClass(domain: SignalDomain): string {
  switch (domain) {
    case 'world':
      return 'bg-[var(--ws-world)]';
    case 'ai':
      return 'bg-[var(--ws-ai)]';
    case 'economy':
      return 'bg-[var(--ws-economy)]';
  }
}

function domainWashClass(domain: SignalDomain): string {
  switch (domain) {
    case 'world':
      return 'ws-domain-wash-world';
    case 'ai':
      return 'ws-domain-wash-ai';
    case 'economy':
      return 'ws-domain-wash-economy';
  }
}

function formatEditorialIndex(rank: number): string {
  return String(rank).padStart(2, '0');
}

export const BriefingView: React.FC<BriefingViewProps> = ({
  edition,
  lang,
  dailyDelta,
  onRetryDailyDelta,
  onOpenSignal,
  onOpenSignalInEdition,
  onExploreDomain,
  onSwitchView,
  onRefresh,
  isRefreshing,
}) => {
  const t = getUiStrings(lang);
  const [summaryExpanded, setSummaryExpanded] = React.useState(false);
  const [limitationsExpanded, setLimitationsExpanded] = React.useState(false);

  // Reset progressive disclosures when switching editions
  React.useEffect(() => {
    setSummaryExpanded(false);
    setLimitationsExpanded(false);
  }, [edition.frontmatter.edition_date, edition.frontmatter.updated_at]);

  const summarySource =
    edition.executiveBriefing.summaryText || edition.frontmatter.summary;
  const isLongSummary = summarySource.length > 320;

  const caveatsCombinedLength = React.useMemo(
    () =>
      edition.executiveBriefing.caveats.reduce((sum, item) => sum + item.length, 0),
    [edition.executiveBriefing.caveats]
  );
  const isLongCaveats =
    caveatsCombinedLength > 260 || edition.executiveBriefing.caveats.length > 1;

  const signalById = React.useMemo(() => {
    const map = new Map<string, ParsedSignal>();
    for (const sig of edition.signals) {
      map.set(sig.signal_id, sig);
    }
    return map;
  }, [edition.signals]);

  // Preserve exact editorial selection order from Executive Briefing -> Top Signals.
  // Never invent a custom re-ranking algorithm.
  const orderedTopEntries = React.useMemo(() => {
    const entries: Array<{ signal: ParsedSignal; editorialSummary: string }> = [];
    const seen = new Set<string>();
    for (const ref of edition.executiveBriefing.topSignalRefs) {
      const sig = signalById.get(ref.signal_id);
      if (sig && !seen.has(sig.signal_id)) {
        seen.add(sig.signal_id);
        entries.push({ signal: sig, editorialSummary: ref.summary });
      }
    }
    if (entries.length === 0 && edition.signals.length > 0) {
      for (const sig of edition.signals.slice(0, 4)) {
        entries.push({ signal: sig, editorialSummary: sig.sections.whatHappened });
      }
    }
    return entries;
  }, [edition.executiveBriefing.topSignalRefs, edition.signals, signalById]);

  const leadEntry = orderedTopEntries[0] ?? null;
  const secondaryTopEntries = orderedTopEntries.slice(1);
  const featuredSecondary = secondaryTopEntries.slice(0, 2);
  const remainingSecondary = secondaryTopEntries.slice(2);

  const topIdSet = React.useMemo(
    () => new Set(orderedTopEntries.map((e) => e.signal.signal_id)),
    [orderedTopEntries]
  );

  const totalClaims = React.useMemo(
    () => edition.signals.reduce((acc, s) => acc + s.claims.length, 0),
    [edition.signals]
  );

  const domainSummaries = React.useMemo(() => {
    const totalSignals = Math.max(edition.signals.length, 1);
    return DOMAINS.map((domain) => {
      const list = edition.signals.filter((s) => s.domain === domain);
      const uniqueGroups = new Set<string>();
      for (const s of list) {
        for (const g of s.independentGroups) {
          uniqueGroups.add(g.toLowerCase());
        }
      }
      const remaining = list.filter((s) => !topIdSet.has(s.signal_id));
      return {
        domain,
        total: list.length,
        sharePct: Math.round((list.length / totalSignals) * 100),
        independentOrigins: uniqueGroups.size,
        intro: edition.domainIntros[domain],
        additionalSignals: remaining,
      };
    });
  }, [edition.domainIntros, edition.signals, topIdSet]);

  const syncLabel =
    t.syncRun[edition.frontmatter.sync_run] ?? edition.frontmatter.sync_run;
  const statusLabel =
    t.editionStatus[edition.frontmatter.edition_status] ??
    edition.frontmatter.edition_status;

  const diagnosticCount =
    edition.validation.errors.length + edition.validation.warnings.length;

  return (
    <div className="space-y-12 sm:space-y-14 pb-16 sm:pb-20">
      {/* 1. Compact Editorial Broadsheet Masthead */}
      <section className="ws-masthead-rule py-3.5 sm:py-4 space-y-2.5">
        {/* Top Dateline & Edition Scope Folio */}
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between border-b border-[var(--ws-border-subtle)] pb-2.5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono-tabular text-[11.5px] sm:text-[12px] text-[var(--ws-ink-muted)]">
            <span className="font-semibold text-[var(--ws-ink)]">
              {formatEditionDate(edition.frontmatter.edition_date, lang)}
            </span>
            <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">
              ·
            </span>
            <span>{syncLabel}</span>
            <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">
              ·
            </span>
            <span>{statusLabel}</span>
            {edition.isLocalPreview && (
              <>
                <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">
                  ·
                </span>
                <span className="font-semibold text-[var(--ws-warn)]">
                  {t.archive.localPreviewActive}
                </span>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] sm:text-[11.5px] font-mono-tabular text-[var(--ws-ink-muted)]">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="font-semibold text-[var(--ws-ink)]">
                {t.masthead.signalsCount(edition.signals.length)}
              </span>
              <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">
                ·
              </span>
              <span>
                {t.masthead.independentOriginsCount(
                  edition.independenceSummary.independentOriginCount
                )}
              </span>
              <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">
                ·
              </span>
              <span>{t.masthead.claimsCount(totalClaims)}</span>
              <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">
                ·
              </span>
              <span>
                {t.masthead.recordsCount(edition.independenceSummary.totalRecords)}
              </span>
            </div>

            {diagnosticCount > 0 && (
              <button
                type="button"
                onClick={() => onSwitchView('audit')}
                className="inline-flex items-center gap-1 text-[11px] sm:text-[11.5px] text-[var(--ws-warn)] underline decoration-dotted underline-offset-2 hover:opacity-80 transition-opacity cursor-pointer"
              >
                <AlertCircle className="h-3 w-3 shrink-0" />
                <span>
                  {t.masthead.diagnosticsLink(
                    edition.validation.errors.length,
                    edition.validation.warnings.length
                  )}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Publication Edition Heading & Operational Timestamps */}
        <div className="flex flex-col gap-2.5 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1 min-w-0">
            <h1 className="font-display text-[1.15rem] sm:text-[1.45rem] font-semibold leading-tight tracking-[-0.015em] text-[var(--ws-ink)] headline-balance">
              {edition.frontmatter.edition_title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] sm:text-[11.5px] font-mono-tabular text-[var(--ws-ink-muted)]">
              <span className="sm:whitespace-nowrap">
                {t.masthead.updatedLabel}:{' '}
                <span className="text-[var(--ws-ink-secondary)]">
                  {formatPublicationTimestamp(edition.frontmatter.updated_at, lang)}
                </span>
              </span>
              {edition.frontmatter.coverage_window_start && (
                <>
                  <span
                    aria-hidden="true"
                    className="hidden sm:inline text-[var(--ws-ink-faint)]"
                  >
                    |
                  </span>
                  <span className="sm:whitespace-nowrap">
                    {t.masthead.coverageWindowLabel}:{' '}
                    <span className="text-[var(--ws-ink-secondary)]">
                      {formatCoverageWindow(
                        edition.frontmatter.coverage_window_start,
                        edition.frontmatter.coverage_window_end,
                        lang
                      )}
                    </span>
                  </span>
                </>
              )}
            </div>
          </div>

          {!edition.isLocalPreview && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex self-start md:self-auto min-h-[32px] items-center gap-1.5 rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-surface)] px-2.5 py-1 text-[11.5px] font-mono-tabular font-medium text-[var(--ws-ink-secondary)] hover:text-[var(--ws-ink)] hover:border-[var(--ws-border-strong)] hover:bg-[var(--ws-surface-hover)] disabled:opacity-50 transition-colors duration-150 cursor-pointer shrink-0"
            >
              <RefreshCw
                className={`h-3 w-3 shrink-0 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              <span>
                {isRefreshing ? t.archive.refreshing : t.archive.refreshEdition}
              </span>
            </button>
          )}
        </div>
      </section>

      {/* 2. Front-Page Hero: Commanding Lead Story + Bespoke Editorial Artwork + Executive Summary */}
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-0 lg:items-start">
        {/* Primary Editorial Column: Lead Development */}
        {leadEntry && (
          <article className="lg:col-span-7 lg:border-r lg:border-[var(--ws-border)] lg:pr-10 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
              <div className="flex items-center gap-2.5 shrink-0">
                <span
                  aria-hidden="true"
                  className={`inline-block h-[2.5px] w-6 ${domainAccentRuleClass(
                    leadEntry.signal.domain
                  )}`}
                />
                <span className="font-mono-tabular text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ws-ink-muted)]">
                  {t.briefing.leadKicker}
                </span>
              </div>
              <span className="font-mono-tabular text-[11px] text-[var(--ws-ink-faint)]">
                {leadEntry.signal.signal_id}
              </span>
            </div>

            <div className="space-y-3">
              <SignalMetaLine signal={leadEntry.signal} lang={lang} showClaims />
              <h2 className="font-display text-[1.75rem] sm:text-[2.25rem] lg:text-[2.55rem] font-semibold leading-[1.16] tracking-[-0.026em] text-[var(--ws-ink)] headline-balance">
                <button
                  type="button"
                  onClick={() => onOpenSignal(leadEntry.signal.signal_id)}
                  className="text-left hover:underline decoration-[var(--ws-border-strong)] decoration-[1.5px] underline-offset-[6px] cursor-pointer"
                >
                  {leadEntry.signal.headline}
                </button>
              </h2>
            </div>

            {/* Bespoke Art-Directed Editorial Visual Composition (Real Telemetry Only) */}
            <EditorialSignalArtwork signal={leadEntry.signal} lang={lang} />

            <div className="max-w-[64ch] pt-1 text-[15px] sm:text-[15.5px]">
              <SafeMarkdown
                content={leadEntry.editorialSummary}
                onSelectSignal={onOpenSignal}
              />
            </div>

            {leadEntry.signal.confidence.rationale && (
              <div className="max-w-[64ch] border-l-2 border-[var(--ws-border-strong)] pl-3.5 py-0.5">
                <p className="text-[12.5px] leading-relaxed text-[var(--ws-ink-muted)]">
                  <span className="font-semibold text-[var(--ws-ink-secondary)]">
                    {t.expanded.confidenceRationaleTitle}:{' '}
                  </span>
                  {leadEntry.signal.confidence.rationale}
                </p>
              </div>
            )}

            <div className="pt-1">
              <button
                type="button"
                onClick={() => onOpenSignal(leadEntry.signal.signal_id)}
                className="group inline-flex min-h-[40px] items-center gap-2 text-[13.5px] font-semibold text-[var(--ws-ink)] hover:text-[var(--ws-world)] transition-colors duration-150 cursor-pointer"
              >
                <span className="border-b-[1.5px] border-[var(--ws-rule-editorial)] pb-0.5 group-hover:border-[var(--ws-world)] transition-colors duration-150">
                  {t.briefing.readDossier}
                </span>
                <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
              </button>
            </div>
          </article>
        )}

        {/* Complementary Folio Column: Executive Summary & Editorial Limitations */}
        <aside
          className={`${
            leadEntry ? 'lg:col-span-5 lg:pl-10' : 'lg:col-span-12'
          } space-y-5`}
        >
          {/* Executive Summary Folio */}
          <div className="ws-editorial-sheet rounded-b-[var(--ws-radius-sm)] border-x border-[var(--ws-border)] p-5 sm:p-6 space-y-3.5 shadow-[var(--ws-shadow-sm)]">
            <div className="flex items-center justify-between gap-2 border-b border-[var(--ws-border-subtle)] pb-2.5">
              <h2 className="font-mono-tabular text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ws-ink-muted)]">
                {t.briefing.executiveSummaryTitle}
              </h2>
              <span className="font-mono-tabular text-[10.5px] text-[var(--ws-ink-faint)]">
                {edition.frontmatter.edition_date}
              </span>
            </div>
            <div className={!summaryExpanded && isLongSummary ? 'line-clamp-7' : ''}>
              <SafeMarkdown
                content={summarySource}
                compact
                onSelectSignal={onOpenSignal}
              />
            </div>
            {isLongSummary && (
              <button
                type="button"
                onClick={() => setSummaryExpanded((prev) => !prev)}
                className="font-mono-tabular text-[11.5px] font-medium text-[var(--ws-world)] hover:underline underline-offset-4 cursor-pointer"
              >
                {summaryExpanded ? t.briefing.summaryCollapse : t.briefing.summaryExpand}
              </button>
            )}
          </div>

          {/* Editorial Limitations — Calm Archival Callout */}
          {edition.executiveBriefing.caveats.length > 0 && (
            <div className="ws-caution-panel p-5 space-y-2.5">
              <h3 className="font-mono-tabular text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ws-warn)]">
                {t.briefing.editorialLimitationsTitle}
              </h3>
              <div
                className={`space-y-2.5 ${
                  !limitationsExpanded && isLongCaveats ? 'line-clamp-5' : ''
                }`}
              >
                {edition.executiveBriefing.caveats.map((caveat, idx) => (
                  <SafeMarkdown
                    key={idx}
                    content={caveat}
                    compact
                    onSelectSignal={onOpenSignal}
                  />
                ))}
              </div>
              {isLongCaveats && (
                <button
                  type="button"
                  onClick={() => setLimitationsExpanded((prev) => !prev)}
                  className="pt-0.5 font-mono-tabular text-[11.5px] font-medium text-[var(--ws-warn)] hover:underline underline-offset-4 cursor-pointer"
                >
                  {limitationsExpanded
                    ? t.briefing.limitationsCollapse
                    : t.briefing.limitationsExpand(
                        edition.executiveBriefing.caveats.length
                      )}
                </button>
              )}
            </div>
          )}
        </aside>
      </section>

      {/* 3. Daily Delta Cross-Edition Intelligence Module (Positioned Below Hero for Immediate First-Screen Story Impact) */}
      <DailyDeltaSection
        state={dailyDelta}
        lang={lang}
        onOpenSignalInEdition={onOpenSignalInEdition}
        onRetry={onRetryDailyDelta}
      />

      {/* 4. Editorially Selected Top Signals (Hierarchical Broadsheet Grid, Exact Edition Order) */}
      {secondaryTopEntries.length > 0 && (
        <section className="ws-section-rule pt-7 space-y-7">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-[1.4rem] sm:text-[1.65rem] font-semibold tracking-[-0.018em] text-[var(--ws-ink)]">
              {t.briefing.topSignalsTitle}
            </h2>
            <span className="font-mono-tabular text-[11.5px] text-[var(--ws-ink-muted)]">
              {t.briefing.topSignalsNote}
            </span>
          </div>

          {/* Tier 2 Featured Secondary Dispatches (Signals 02 & 03) */}
          <div
            className={`grid grid-cols-1 gap-8 ${
              featuredSecondary.length > 1
                ? 'lg:grid-cols-12 lg:gap-0'
                : ''
            }`}
          >
            {featuredSecondary.map(({ signal, editorialSummary }, idx) => {
              const isFirstSecondary = idx === 0;
              const colClass =
                featuredSecondary.length === 1
                  ? ''
                  : isFirstSecondary
                  ? 'lg:col-span-7 lg:border-r lg:border-[var(--ws-border)] lg:pr-9'
                  : 'lg:col-span-5 lg:pl-9 border-t border-[var(--ws-border)] pt-7 lg:border-t-0 lg:pt-0';

              return (
                <article
                  key={signal.signal_id}
                  className={`${colClass} flex flex-col justify-between gap-4`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 font-mono-tabular text-[11px] font-semibold text-[var(--ws-ink-muted)]">
                        <span
                          aria-hidden="true"
                          className={`inline-block h-[2.5px] w-4 ${domainAccentRuleClass(
                            signal.domain
                          )}`}
                        />
                        <span>{formatEditorialIndex(idx + 2)}</span>
                      </div>
                      <span className="font-mono-tabular text-[11px] text-[var(--ws-ink-faint)]">
                        {signal.signal_id}
                      </span>
                    </div>

                    <SignalMetaLine signal={signal} lang={lang} compact />

                    <h3
                      className={`font-display font-semibold text-[var(--ws-ink)] headline-balance ${
                        isFirstSecondary
                          ? 'text-[1.35rem] sm:text-[1.525rem] leading-[1.24] tracking-[-0.02em]'
                          : 'text-[1.18rem] sm:text-[1.325rem] leading-[1.28] tracking-[-0.016em]'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => onOpenSignal(signal.signal_id)}
                        className="text-left hover:underline decoration-[var(--ws-border-strong)] underline-offset-4 cursor-pointer"
                      >
                        {signal.headline}
                      </button>
                    </h3>

                    <div className="max-w-[60ch]">
                      <SafeMarkdown
                        content={editorialSummary}
                        compact
                        onSelectSignal={onOpenSignal}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-[var(--ws-border-subtle)] pt-3 text-xs">
                    <span className="font-mono-tabular text-[11px] text-[var(--ws-ink-muted)]">
                      {t.metaLine.claims(signal.claims.length)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenSignal(signal.signal_id)}
                      className="group inline-flex items-center gap-1.5 font-semibold text-[var(--ws-ink)] hover:text-[var(--ws-world)] transition-colors duration-150 cursor-pointer"
                    >
                      <span>{t.briefing.readDossier}</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Tier 3 Additional Top Signals (Signals 04+) */}
          {remainingSecondary.length > 0 && (
            <div className="border-t border-[var(--ws-border)] pt-7 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-0">
              {remainingSecondary.map(({ signal, editorialSummary }, idx) => {
                const isLeftCol = idx % 2 === 0;
                const isSecondRowOrLater = idx >= 2;
                return (
                  <article
                    key={signal.signal_id}
                    className={`flex flex-col justify-between gap-4 ${
                      isLeftCol
                        ? 'md:border-r md:border-[var(--ws-border)] md:pr-8'
                        : 'md:pl-8 border-t border-[var(--ws-border-subtle)] pt-6 md:border-t-0 md:pt-0'
                    } ${
                      isSecondRowOrLater
                        ? 'md:border-t md:border-[var(--ws-border)] md:pt-7 md:mt-7'
                        : ''
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2 font-mono-tabular text-[11px] text-[var(--ws-ink-muted)]">
                        <div className="flex items-center gap-2 font-semibold">
                          <span
                            aria-hidden="true"
                            className={`inline-block h-[2px] w-3.5 ${domainAccentRuleClass(
                              signal.domain
                            )}`}
                          />
                          <span>{formatEditorialIndex(idx + 4)}</span>
                        </div>
                        <span className="text-[var(--ws-ink-faint)]">
                          {signal.signal_id}
                        </span>
                      </div>

                      <SignalMetaLine signal={signal} lang={lang} compact />

                      <h3 className="font-display text-[1.125rem] sm:text-[1.225rem] font-semibold leading-[1.3] tracking-[-0.014em] text-[var(--ws-ink)] headline-balance">
                        <button
                          type="button"
                          onClick={() => onOpenSignal(signal.signal_id)}
                          className="text-left hover:underline decoration-[var(--ws-border-strong)] underline-offset-4 cursor-pointer"
                        >
                          {signal.headline}
                        </button>
                      </h3>

                      <SafeMarkdown
                        content={editorialSummary}
                        compact
                        onSelectSignal={onOpenSignal}
                      />
                    </div>

                    <div className="flex items-center justify-between border-t border-[var(--ws-border-subtle)] pt-3 text-xs">
                      <span className="font-mono-tabular text-[11px] text-[var(--ws-ink-muted)]">
                        {t.metaLine.claims(signal.claims.length)}
                      </span>
                      <button
                        type="button"
                        onClick={() => onOpenSignal(signal.signal_id)}
                        className="group inline-flex items-center gap-1.5 font-semibold text-[var(--ws-ink)] hover:text-[var(--ws-world)] transition-colors duration-150 cursor-pointer"
                      >
                        <span>{t.briefing.readDossier}</span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* 5. Three-Domain Overview (Distinct Domain Visual Identity & Geometric Emblems) */}
      <section className="ws-section-rule pt-7 space-y-6">
        <h2 className="font-display text-[1.4rem] sm:text-[1.65rem] font-semibold tracking-[-0.018em] text-[var(--ws-ink)]">
          {t.briefing.domainsOverviewTitle}
        </h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {domainSummaries.map((item) => (
            <div
              key={item.domain}
              className="group relative flex flex-col justify-between overflow-hidden rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-surface)] transition-colors duration-150 hover:border-[var(--ws-border-strong)]"
            >
              <div
                aria-hidden="true"
                className={`h-[3px] w-full ${domainAccentRuleClass(item.domain)}`}
              />

              <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <DomainEditorialEmblem domain={item.domain} className="h-8 w-8" />
                      <div className="min-w-0">
                        <h3
                          className={`font-display text-[1.15rem] font-semibold tracking-[-0.01em] ${domainAccentTextClass(
                            item.domain
                          )}`}
                        >
                          {t.domains[item.domain]}
                        </h3>
                        <div className="font-mono-tabular text-[11px] text-[var(--ws-ink-muted)]">
                          {t.briefing.domainShareLabel(item.sharePct)}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-display text-[1.5rem] font-semibold leading-none text-[var(--ws-ink)] tabular-nums">
                        {item.total}
                      </div>
                      <div className="mt-0.5 font-mono-tabular text-[10px] uppercase tracking-wider text-[var(--ws-ink-faint)]">
                        {t.masthead.signalsCount(item.total)}
                      </div>
                    </div>
                  </div>

                  {/* Proportional Share Indicator Strip */}
                  <div className="h-1 w-full bg-[var(--ws-surface-subtle)] overflow-hidden rounded-[1px]">
                    <div
                      className={`h-full ${domainAccentRuleClass(item.domain)}`}
                      style={{ width: `${Math.max(item.sharePct, 4)}%` }}
                    />
                  </div>

                  <div
                    className={`inline-flex items-center rounded-[2px] border px-2 py-0.5 font-mono-tabular text-[11px] ${domainWashClass(
                      item.domain
                    )} text-[var(--ws-ink-secondary)]`}
                  >
                    {t.masthead.independentOriginsCount(item.independentOrigins)}
                  </div>

                  {item.intro && (
                    <p className="text-[13px] leading-[1.68] text-[var(--ws-ink-secondary)]">
                      {item.intro}
                    </p>
                  )}
                </div>

                <div className="border-t border-[var(--ws-border-subtle)] pt-3">
                  <button
                    type="button"
                    onClick={() => onExploreDomain(item.domain)}
                    className={`inline-flex items-center gap-1.5 text-[12.5px] font-semibold ${domainAccentTextClass(
                      item.domain
                    )} hover:underline underline-offset-4 transition-colors duration-150 cursor-pointer`}
                  >
                    <span>{t.briefing.exploreDomain}</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Compact Secondary Index of Additional Signals (Balanced Multi-Column Domain Ledgers) */}
      <section className="space-y-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--ws-border)] pb-3.5">
          <h2 className="font-display text-[1.4rem] sm:text-[1.65rem] font-semibold tracking-[-0.018em] text-[var(--ws-ink)]">
            {t.briefing.additionalSignalsTitle}
          </h2>
          <span className="text-[12px] text-[var(--ws-ink-muted)]">
            {t.briefing.additionalSignalsSubtitle}
          </span>
        </div>

        <div className="space-y-9">
          {domainSummaries.map(
            (group) =>
              group.additionalSignals.length > 0 && (
                <div key={group.domain} className="space-y-3">
                  <div className="flex items-center justify-between border-b border-[var(--ws-border-strong)] pb-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        aria-hidden="true"
                        className={`inline-block h-[2.5px] w-4 ${domainAccentRuleClass(
                          group.domain
                        )}`}
                      />
                      <h3
                        className={`font-mono-tabular text-[11.5px] font-semibold uppercase tracking-[0.12em] ${domainAccentTextClass(
                          group.domain
                        )}`}
                      >
                        {t.domains[group.domain]}
                      </h3>
                    </div>
                    <span className="font-mono-tabular text-[11.5px] font-medium text-[var(--ws-ink-muted)]">
                      {t.masthead.signalsCount(group.additionalSignals.length)}
                    </span>
                  </div>

                  <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8">
                    {group.additionalSignals.map((sig, idx) => (
                      <li
                        key={sig.signal_id}
                        className="border-b border-[var(--ws-border-subtle)] py-3.5"
                      >
                        <button
                          type="button"
                          onClick={() => onOpenSignal(sig.signal_id)}
                          className="group w-full text-left flex items-start gap-2.5 cursor-pointer"
                        >
                          <span className="font-mono-tabular text-[11px] font-medium text-[var(--ws-ink-faint)] pt-[2px] shrink-0">
                            {formatEditorialIndex(idx + 1)}
                          </span>
                          <div className="min-w-0 space-y-1.5">
                            <div className="text-[14px] font-medium leading-[1.44] text-[var(--ws-ink)] group-hover:text-[var(--ws-world)] transition-colors duration-150 break-words">
                              {sig.headline}
                            </div>
                            <SignalMetaLine
                              signal={sig}
                              lang={lang}
                              compact
                              hideDomain
                            />
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )
          )}
        </div>
      </section>

      {/* 7. Editorial Reading Path (Restrained Publication Section Index) */}
      <section className="ws-section-rule pt-8 space-y-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <h2 className="font-display text-lg font-semibold text-[var(--ws-ink)]">
            {t.briefing.readingPathTitle}
          </h2>
          <p className="text-[12px] text-[var(--ws-ink-muted)]">
            {t.briefing.readingPathSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 border-y border-[var(--ws-border)] bg-[var(--ws-surface)]/55 divide-y md:divide-y-0 md:divide-x divide-[var(--ws-border)]">
          <button
            type="button"
            onClick={() => onSwitchView('expanded')}
            className="group flex flex-col justify-between gap-2.5 p-5 text-left hover:bg-[var(--ws-surface)] transition-colors duration-150 cursor-pointer"
          >
            <div className="flex items-center justify-between text-[var(--ws-ink-muted)]">
              <span className="inline-flex items-center gap-2 font-mono-tabular text-[11px] uppercase tracking-[0.12em]">
                <BookOpen className="h-3.5 w-3.5" />
                <span>01</span>
              </span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-[var(--ws-ink)]" />
            </div>
            <div className="space-y-1">
              <div className="font-display text-[1.05rem] font-semibold text-[var(--ws-ink)] group-hover:text-[var(--ws-world)] transition-colors duration-150">
                {t.nav.expanded}
              </div>
              <p className="text-[12.5px] leading-relaxed text-[var(--ws-ink-muted)]">
                {t.briefing.openExpandedDesc}
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSwitchView('synthesis')}
            className="group flex flex-col justify-between gap-2.5 p-5 text-left hover:bg-[var(--ws-surface)] transition-colors duration-150 cursor-pointer"
          >
            <div className="flex items-center justify-between text-[var(--ws-ink-muted)]">
              <span className="inline-flex items-center gap-2 font-mono-tabular text-[11px] uppercase tracking-[0.12em]">
                <Compass className="h-3.5 w-3.5" />
                <span>02</span>
              </span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-[var(--ws-ink)]" />
            </div>
            <div className="space-y-1">
              <div className="font-display text-[1.05rem] font-semibold text-[var(--ws-ink)] group-hover:text-[var(--ws-world)] transition-colors duration-150">
                {t.nav.synthesis}
              </div>
              <p className="text-[12.5px] leading-relaxed text-[var(--ws-ink-muted)]">
                {t.briefing.openSynthesisDesc}
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSwitchView('audit')}
            className="group flex flex-col justify-between gap-2.5 p-5 text-left hover:bg-[var(--ws-surface)] transition-colors duration-150 cursor-pointer"
          >
            <div className="flex items-center justify-between text-[var(--ws-ink-muted)]">
              <span className="inline-flex items-center gap-2 font-mono-tabular text-[11px] uppercase tracking-[0.12em]">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>03</span>
              </span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-[var(--ws-ink)]" />
            </div>
            <div className="space-y-1">
              <div className="font-display text-[1.05rem] font-semibold text-[var(--ws-ink)] group-hover:text-[var(--ws-world)] transition-colors duration-150">
                {t.nav.audit}
              </div>
              <p className="text-[12.5px] leading-relaxed text-[var(--ws-ink-muted)]">
                {t.briefing.openAuditDesc}
              </p>
            </div>
          </button>
        </div>
      </section>
    </div>
  );
};
