import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  FileSearch,
  GitCompareArrows,
  Network,
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
import type { DailyDeltaState } from '../../lib/intelligence/daily-delta/dailyDeltaHelpers';
import type { CatchUpState } from '../../lib/intelligence/catch-up/catchUpEngine';
import { getUiStrings } from '../../lib/i18n/uiStrings';
import {
  formatCompactTimestamp,
  formatCoverageWindow,
  formatEditionDate,
} from '../../lib/dates/formatDates';
import {
  buildDomainEditionProfiles,
  EDITORIAL_DOMAINS,
} from '../../lib/intelligence/visual-metrics/editorialVisualHelpers';
import { SafeMarkdown } from '../../components/editorial/SafeMarkdown';
import { SignalMetaLine } from '../../components/editorial/SignalMetaLine';
import { DomainEditorialEmblem } from '../../components/editorial/EditorialSignalArtwork';
import {
  extractGroundedSignalStats,
  StoryVisual,
} from '../../components/editorial/StoryVisual';
import { DailyDeltaSection } from './DailyDeltaSection';
import { CatchUpBanner } from './CatchUpBanner';

import geopoliticsCoverUrl from '../../assets/images/editorial_cover_geopolitics_1795752024180.jpg';
import aiFrontierCoverUrl from '../../assets/images/editorial_cover_ai_frontier_1795752024354.jpg';
import economyCoverUrl from '../../assets/images/editorial_cover_economy_1795752025611.jpg';

interface BriefingViewProps {
  edition: ParsedEdition;
  lang: UiLanguage;
  dailyDelta: DailyDeltaState | null;
  catchUp?: CatchUpState | null;
  onRetryDailyDelta: () => void;
  onOpenSignal: (signalId: string) => void;
  onOpenSignalInEdition?: (editionDate: string, signalId: string) => void;
  onExploreDomain: (domain: SignalDomain) => void;
  onSwitchView: (view: ViewId) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onMarkAsReviewed?: (edition: ParsedEdition) => void;
  onOpenCatchUpDesk?: () => void;
  onOpenComparison?: () => void;
}

function getDomainColor(domain: SignalDomain): string {
  switch (domain) {
    case 'world':
      return 'var(--ws-world)';
    case 'ai':
      return 'var(--ws-ai)';
    case 'economy':
      return 'var(--ws-economy)';
  }
}

function getDomainPlateImage(domain: SignalDomain): string {
  switch (domain) {
    case 'world':
      return geopoliticsCoverUrl;
    case 'ai':
      return aiFrontierCoverUrl;
    case 'economy':
      return economyCoverUrl;
  }
}

/**
 * Extracts a clean, sentence-terminated editorial deck without awkward mid-clause ellipsis.
 */
function getSignalExcerpt(signal: ParsedSignal, maxLength = 155): string {
  const raw =
    signal.sections.whatHappened ||
    signal.sections.verifiedFacts ||
    signal.sections.whyItMatters ||
    signal.rawNarrative;
  const cleaned = raw
    .replace(/^#+\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/^[-*]\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (cleaned.length <= maxLength) return cleaned;

  const slice = cleaned.slice(0, maxLength);
  const sentenceEnd = Math.max(
    slice.lastIndexOf('。'),
    slice.lastIndexOf('；'),
    slice.lastIndexOf('. '),
    slice.lastIndexOf('; ')
  );
  if (sentenceEnd >= Math.floor(maxLength * 0.45)) {
    const ch = slice[sentenceEnd];
    return ch === '。' || ch === '；'
      ? slice.slice(0, sentenceEnd + 1).trim()
      : `${slice.slice(0, sentenceEnd + 1).trim()}`;
  }
  return `${slice.trimEnd()}…`;
}

function truncateEditorialMarkdown(
  markdown: string,
  maxChars = 440
): { preview: string; isTruncated: boolean } {
  const trimmed = markdown.trim();
  if (!trimmed) return { preview: '', isTruncated: false };

  const paragraphs = trimmed
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  if (paragraphs.length > 1 && paragraphs[0].length <= maxChars + 100) {
    return { preview: paragraphs[0], isTruncated: true };
  }

  if (trimmed.length <= maxChars) {
    return { preview: trimmed, isTruncated: false };
  }

  const slice = trimmed.slice(0, maxChars);
  const sentenceBreak = Math.max(
    slice.lastIndexOf('。'),
    slice.lastIndexOf('；'),
    slice.lastIndexOf('. '),
    slice.lastIndexOf('; ')
  );
  const cutoff = sentenceBreak > maxChars * 0.5 ? sentenceBreak + 1 : maxChars;
  return {
    preview: `${trimmed.slice(0, cutoff).trimEnd()}…`,
    isTruncated: true,
  };
}

export const BriefingView: React.FC<BriefingViewProps> = ({
  edition,
  lang,
  dailyDelta,
  catchUp = null,
  onRetryDailyDelta,
  onOpenSignal,
  onOpenSignalInEdition,
  onExploreDomain,
  onSwitchView,
  onRefresh,
  isRefreshing,
  onMarkAsReviewed,
  onOpenCatchUpDesk,
  onOpenComparison,
}) => {
  const t = getUiStrings(lang);
  const {
    frontmatter,
    signals,
    executiveBriefing,
    domainIntros,
    independenceSummary,
    validation,
  } = edition;

  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const [limitationsExpanded, setLimitationsExpanded] = useState(false);

  const rankedSignals = useMemo(() => {
    const refOrder = new Map(
      executiveBriefing.topSignalRefs.map((ref, idx) => [ref.signal_id, idx])
    );
    return [...signals].sort((a, b) => {
      const rankA = refOrder.get(a.signal_id);
      const rankB = refOrder.get(b.signal_id);
      if (rankA !== undefined && rankB !== undefined) return rankA - rankB;
      if (rankA !== undefined) return -1;
      if (rankB !== undefined) return 1;
      if (b.importance !== a.importance) return b.importance - a.importance;
      return b.claims.length - a.claims.length;
    });
  }, [executiveBriefing.topSignalRefs, signals]);

  const leadSignal = rankedSignals[0] ?? null;
  const leadStats = useMemo(
    () => (leadSignal ? extractGroundedSignalStats(leadSignal) : null),
    [leadSignal]
  );

  const secondaryFeature = rankedSignals[1] ?? null;
  const supportingPair = rankedSignals.slice(2, 4);
  const remainingPriority = rankedSignals.slice(4, 10);

  const topIdSet = useMemo(
    () => new Set(rankedSignals.slice(0, 10).map((s) => s.signal_id)),
    [rankedSignals]
  );

  const domainProfiles = useMemo(
    () => buildDomainEditionProfiles(signals, domainIntros, topIdSet),
    [domainIntros, signals, topIdSet]
  );

  const domainTopSignals = useMemo(() => {
    const map: Record<SignalDomain, ParsedSignal[]> = {
      world: [],
      ai: [],
      economy: [],
    };
    for (const domain of EDITORIAL_DOMAINS) {
      map[domain] = signals
        .filter((s) => s.domain === domain)
        .sort((a, b) => {
          if (b.importance !== a.importance) return b.importance - a.importance;
          return b.claims.length - a.claims.length;
        })
        .slice(0, 4);
    }
    return map;
  }, [signals]);

  const totalClaims = useMemo(
    () => signals.reduce((sum, s) => sum + s.claims.length, 0),
    [signals]
  );

  const summaryMarkdown =
    executiveBriefing.summaryText || frontmatter.summary || '';

  const summaryPreview = useMemo(
    () => truncateEditorialMarkdown(summaryMarkdown, 440),
    [summaryMarkdown]
  );

  const caveatItems = executiveBriefing.caveats;

  const errorCount = validation.errors.length;
  const warningCount = validation.warnings.length;
  const coverageWindow = formatCoverageWindow(
    frontmatter.coverage_window_start,
    frontmatter.coverage_window_end,
    lang
  );
  const dateHeading = formatEditionDate(frontmatter.edition_date, lang);
  const syncLabel = frontmatter.sync_run
    ? t.syncRun[frontmatter.sync_run] ?? frontmatter.sync_run
    : null;
  const statusLabel =
    t.editionStatus[frontmatter.edition_status] ?? frontmatter.edition_status;

  return (
    <div className="space-y-11 pb-16">
      {/* =====================================================================
          PUBLICATION ISSUE FOLIO (Clean Broadsheet Masthead Utility Rule)
         ===================================================================== */}
      <section
        aria-label="Edition folio"
        className="border-t-2 border-t-[var(--ws-ink)] border-b border-b-[var(--ws-border)] py-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-[12.5px]"
      >
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <span className="font-semibold text-[var(--ws-ink)]">
            {dateHeading}
          </span>
          {syncLabel && (
            <>
              <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">
                ·
              </span>
              <span className="text-[var(--ws-ink-secondary)]">{syncLabel}</span>
            </>
          )}
          <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">
            ·
          </span>
          <span className="text-[var(--ws-ink-muted)]">{statusLabel}</span>
          {coverageWindow && (
            <>
              <span
                aria-hidden="true"
                className="hidden xl:inline text-[var(--ws-ink-faint)]"
              >
                ·
              </span>
              <span className="hidden xl:inline font-mono-tabular text-[12px] text-[var(--ws-ink-muted)]">
                {coverageWindow}
              </span>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono-tabular text-[12px] text-[var(--ws-ink-muted)]">
          <span className="font-semibold text-[var(--ws-ink)]">
            {t.masthead.signalsCount(signals.length)}
          </span>
          <span>
            {t.masthead.independentOriginsCount(
              independenceSummary.independentOriginCount
            )}
          </span>
          <span className="hidden md:inline">
            {t.masthead.claimsCount(totalClaims)}
          </span>
          {(errorCount > 0 || warningCount > 0) && (
            <button
              type="button"
              onClick={() => onSwitchView('audit')}
              className="inline-flex items-center gap-1 text-[var(--ws-warn)] hover:underline cursor-pointer"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>{t.masthead.diagnosticsLink(errorCount, warningCount)}</span>
            </button>
          )}
          {frontmatter.updated_at && (
            <span className="hidden 2xl:inline text-[var(--ws-ink-muted)]">
              {formatCompactTimestamp(frontmatter.updated_at, lang)}
            </span>
          )}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 text-[var(--ws-ink)] hover:text-[var(--ws-editorial-accent)] transition-colors cursor-pointer disabled:opacity-50 font-sans font-medium"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            <span>
              {isRefreshing ? t.archive.refreshing : t.archive.refreshEdition}
            </span>
          </button>
        </div>
      </section>

      {/* =====================================================================
          VISUAL JOURNALISM COVER PLATE (Selected Production Hero Direction)
         ===================================================================== */}
      {leadSignal && (
        <section
          aria-label="Cover story"
          className="ws-plate border border-[var(--ws-plate-border)] p-6 sm:p-8 lg:p-10 space-y-7"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-11 items-center">
            {/* Expressive Art-Directed Feature Illustration */}
            <div className="lg:col-span-6 group">
              <StoryVisual
                signal={leadSignal}
                lang={lang}
                mode="editorial_illustration"
                variant="hero"
                tone="dark"
              />
            </div>

            {/* Authoritative Cover Story Typography */}
            <div className="lg:col-span-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="inline-flex items-center gap-2 ws-kicker text-[#ef7362]">
                    <span className="h-[2px] w-5 bg-[#ef7362]" />
                    {t.briefing.leadKicker}
                  </span>
                  <span
                    aria-hidden="true"
                    className="text-[var(--ws-plate-muted)]"
                  >
                    /
                  </span>
                  <span className="ws-kicker text-[var(--ws-plate-secondary)]">
                    {t.domains[leadSignal.domain]}
                  </span>
                </div>
                <span className="font-mono-tabular text-[11.5px] text-[var(--ws-plate-muted)]">
                  {leadSignal.signal_id}
                </span>
              </div>

              <h1 className="ws-headline-cover text-[var(--ws-plate-ink)]">
                <button
                  type="button"
                  onClick={() => onOpenSignal(leadSignal.signal_id)}
                  className="text-left hover:text-[#9ec5f8] transition-colors cursor-pointer"
                >
                  {leadSignal.headline}
                </button>
              </h1>

              <p className="text-[16.5px] sm:text-[18px] leading-[1.72] text-[var(--ws-plate-secondary)] max-w-[52ch] [text-wrap:pretty]">
                {getSignalExcerpt(leadSignal, 155)}
              </p>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-3 pt-1">
                <button
                  type="button"
                  onClick={() => onOpenSignal(leadSignal.signal_id)}
                  className="inline-flex items-center gap-2 rounded-[var(--ws-radius-sm)] bg-[#f7f4ed] px-5 py-2.5 text-[13.5px] font-semibold text-[#12161f] hover:bg-[#ef7362] hover:text-white transition-colors cursor-pointer"
                >
                  <span>{t.briefing.readDossier}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono-tabular text-[12px] text-[var(--ws-plate-muted)]">
                  <span className="font-semibold text-[var(--ws-plate-ink)]">
                    {t.metaLine.importance(leadSignal.importance)}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {t.metaLine.confidence(
                      t.confidence[leadSignal.confidence.overall]
                    )}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{t.signalStatus[leadSignal.status]}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Grounded Signal Evidence & Chronology Strip (Strictly From Verified Data) */}
          {leadStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 border-t border-[var(--ws-plate-border)] pt-6">
              <div className="space-y-1">
                <div className="font-display text-[26px] sm:text-[30px] font-semibold leading-none text-[var(--ws-plate-ink)] ws-tabular">
                  {leadStats.independentOriginsCount}
                </div>
                <div className="text-[12px] text-[var(--ws-plate-muted)]">
                  {t.briefing.artworkOriginsLabel}
                </div>
              </div>
              <div className="md:border-l md:border-[var(--ws-plate-border)] md:pl-5 space-y-1">
                <div className="font-display text-[26px] sm:text-[30px] font-semibold leading-none text-[var(--ws-plate-ink)] ws-tabular">
                  {leadStats.confirmedClaimsCount}
                  <span className="text-[var(--ws-plate-muted)] font-normal text-[20px]">
                    {' '}
                    / {leadStats.claimsCount}
                  </span>
                </div>
                <div className="text-[12px] text-[var(--ws-plate-muted)]">
                  {lang === 'zh-CN'
                    ? '已证实 / 总声明'
                    : 'Confirmed / Total Claims'}
                </div>
              </div>
              <div className="md:border-l md:border-[var(--ws-plate-border)] md:pl-5 space-y-1">
                <div className="font-display text-[26px] sm:text-[30px] font-semibold leading-none text-[var(--ws-plate-ink)] ws-tabular">
                  {leadStats.sourcesCount}
                </div>
                <div className="text-[12px] text-[var(--ws-plate-muted)]">
                  {t.briefing.artworkSourcesLabel}
                </div>
              </div>
              <div className="md:border-l md:border-[var(--ws-plate-border)] md:pl-5 space-y-1">
                <div className="font-mono-tabular text-[14.5px] font-medium leading-tight text-[var(--ws-plate-ink)] pt-1">
                  {leadStats.timelineSpanLabel ??
                    leadSignal.event.start_date ??
                    '—'}
                </div>
                <div className="text-[12px] text-[var(--ws-plate-muted)]">
                  {leadStats.timelineCount > 0
                    ? t.briefing.artworkTimelineMilestones(
                        leadStats.timelineCount
                      )
                    : t.expanded.eventDateLabel}
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* =====================================================================
          SPACIOUS EXECUTIVE SUMMARY SPREAD (Open Paper, Comfortable Measure)
         ===================================================================== */}
      <section
        aria-label={t.briefing.executiveSummaryTitle}
        className="ws-folio-panel px-6 py-7 sm:px-8 sm:py-9 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start"
      >
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--ws-border)] pb-3">
            <div className="space-y-1">
              <div className="ws-kicker text-[var(--ws-editorial-accent)]">
                {t.briefing.coverEditionDeskLabel}
              </div>
              <h2 className="font-display text-[24px] sm:text-[28px] font-semibold tracking-[-0.02em] text-[var(--ws-ink)]">
                {t.briefing.executiveSummaryTitle}
              </h2>
            </div>
            <span className="font-mono-tabular text-[12px] text-[var(--ws-ink-muted)]">
              {frontmatter.edition_date}
            </span>
          </div>

          {summaryMarkdown && (
            <div className="space-y-3">
              <SafeMarkdown
                content={
                  summaryExpanded || !summaryPreview.isTruncated
                    ? summaryMarkdown
                    : summaryPreview.preview
                }
                className="ws-prose"
              />
              {summaryPreview.isTruncated && (
                <button
                  type="button"
                  onClick={() => setSummaryExpanded((prev) => !prev)}
                  aria-expanded={summaryExpanded}
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--ws-world)] hover:underline cursor-pointer"
                >
                  <span>
                    {summaryExpanded
                      ? t.briefing.summaryCollapse
                      : t.briefing.summaryExpand}
                  </span>
                  {summaryExpanded ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-5 lg:border-l lg:border-[var(--ws-border)] lg:pl-9 space-y-6">
          {/* FT Visual Vocabulary Domain Composition Ribbon */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-[12.5px]">
              <span className="font-semibold text-[var(--ws-ink)]">
                {t.briefing.domainBalanceTitle}
              </span>
              <span className="font-mono-tabular text-[var(--ws-ink-muted)]">
                {t.masthead.signalsCount(signals.length)}
              </span>
            </div>
            <div
              className="flex h-2.5 w-full overflow-hidden rounded-[2px] bg-[var(--ws-border-subtle)] gap-[2px]"
              role="img"
              aria-label={t.briefing.domainBalanceTitle}
            >
              {domainProfiles.map((item) => (
                <div
                  key={item.domain}
                  style={{
                    width: `${item.sharePct}%`,
                    backgroundColor: getDomainColor(item.domain),
                  }}
                  title={`${t.domains[item.domain]}: ${item.total} (${item.sharePct}%)`}
                />
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 text-[12.5px]">
              {domainProfiles.map((item) => (
                <button
                  key={item.domain}
                  type="button"
                  onClick={() => onExploreDomain(item.domain)}
                  className="inline-flex items-center gap-1.5 text-[var(--ws-ink-secondary)] hover:text-[var(--ws-ink)] cursor-pointer transition-colors"
                >
                  <span
                    className="h-2 w-2 rounded-[1px] shrink-0"
                    style={{ backgroundColor: getDomainColor(item.domain) }}
                  />
                  <span className="font-medium">{t.domains[item.domain]}</span>
                  <span className="font-mono-tabular text-[var(--ws-ink-muted)]">
                    {item.total}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Editorial Limitations & Scope Caveats */}
          {caveatItems.length > 0 && (
            <div className="ws-caution-panel p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-[var(--ws-warn)]">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  <h3 className="ws-kicker text-[var(--ws-warn)]">
                    {t.briefing.editorialLimitationsTitle}
                  </h3>
                </div>
                {caveatItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setLimitationsExpanded((prev) => !prev)}
                    aria-expanded={limitationsExpanded}
                    className="inline-flex items-center gap-1 text-[12px] font-medium text-[var(--ws-warn)] hover:underline cursor-pointer shrink-0"
                  >
                    <span>
                      {limitationsExpanded
                        ? t.briefing.limitationsCollapse
                        : t.briefing.limitationsExpand(caveatItems.length)}
                    </span>
                    {limitationsExpanded ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </button>
                )}
              </div>

              {limitationsExpanded || caveatItems.length <= 1 ? (
                <ul className="space-y-1.5 text-[13px] leading-relaxed text-[var(--ws-ink-secondary)] list-disc pl-4">
                  {caveatItems.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-[13px] leading-relaxed text-[var(--ws-ink-secondary)] line-clamp-2">
                  {caveatItems[0]}
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* =====================================================================
          READER CATCH-UP CHECKPOINT (Sleek Hairline Bar, Preserves Phase 05)
         ===================================================================== */}
      {catchUp && onMarkAsReviewed && onOpenCatchUpDesk && (
        <CatchUpBanner
          catchUp={catchUp}
          edition={edition}
          lang={lang}
          onMarkAsReviewed={onMarkAsReviewed}
          onOpenCatchUpDesk={onOpenCatchUpDesk}
        />
      )}

      {/* =====================================================================
          CURATED SECONDARY HIERARCHY (Asymmetric Feature + Supporting + Index)
         ===================================================================== */}
      {rankedSignals.length > 1 && (
        <section aria-label={t.briefing.topSignalsTitle} className="space-y-8">
          <div className="ws-rule-section pt-4 flex flex-wrap items-baseline justify-between gap-3">
            <div className="space-y-1">
              <div className="ws-kicker text-[var(--ws-editorial-accent)]">
                {lang === 'zh-CN' ? '重点编选' : 'Curated Dispatches'}
              </div>
              <h2 className="font-display text-[26px] sm:text-[32px] font-semibold tracking-[-0.02em] text-[var(--ws-ink)]">
                {t.briefing.topSignalsTitle}
              </h2>
            </div>
            <p className="text-[13px] text-[var(--ws-ink-muted)] max-w-md">
              {t.briefing.topSignalsNote}
            </p>
          </div>

          {/* Rank #02 — Prominent Secondary Feature Spread */}
          {secondaryFeature && (
            <article className="grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-10 pb-8 border-b border-[var(--ws-border)] items-center">
              <div className="lg:col-span-5 group">
                <StoryVisual
                  signal={secondaryFeature}
                  lang={lang}
                  mode={
                    secondaryFeature.domain === leadSignal?.domain
                      ? 'grounded_visual'
                      : 'editorial_illustration'
                  }
                  variant="feature"
                  plateNumber="02"
                />
              </div>

              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="font-display text-[26px] font-semibold leading-none text-[var(--ws-ink-faint)] ws-tabular">
                    02
                  </span>
                  <span
                    className="ws-kicker"
                    style={{ color: getDomainColor(secondaryFeature.domain) }}
                  >
                    {t.domains[secondaryFeature.domain]}
                  </span>
                  <span className="font-mono-tabular text-[12px] text-[var(--ws-ink-muted)] ml-auto">
                    {secondaryFeature.signal_id}
                  </span>
                </div>

                <h3 className="ws-headline-feature text-[var(--ws-ink)]">
                  <button
                    type="button"
                    onClick={() => onOpenSignal(secondaryFeature.signal_id)}
                    className="text-left hover:text-[var(--ws-world)] transition-colors cursor-pointer"
                  >
                    {secondaryFeature.headline}
                  </button>
                </h3>

                <p className="ws-deck max-w-[60ch]">
                  {getSignalExcerpt(secondaryFeature, 195)}
                </p>

                <div className="pt-1 flex flex-wrap items-center justify-between gap-4">
                  <SignalMetaLine
                    signal={secondaryFeature}
                    lang={lang}
                    showClaims
                  />
                  <button
                    type="button"
                    onClick={() => onOpenSignal(secondaryFeature.signal_id)}
                    className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[var(--ws-ink)] hover:text-[var(--ws-editorial-accent)] transition-colors cursor-pointer"
                  >
                    <span>{t.briefing.readDossier}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </article>
          )}

          {/* Ranks #03–#04 — Two Supporting Editorial Stories */}
          {supportingPair.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 pb-8 border-b border-[var(--ws-border)]">
              {supportingPair.map((signal, idx) => {
                const rankLabel = String(idx + 3).padStart(2, '0');
                return (
                  <article
                    key={signal.signal_id}
                    className={`space-y-3.5 ${
                      idx === 1
                        ? 'md:border-l md:border-[var(--ws-border)] md:pl-8 lg:pl-10'
                        : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="font-display text-[22px] font-semibold leading-none text-[var(--ws-ink-faint)] ws-tabular">
                          {rankLabel}
                        </span>
                        <span
                          className="ws-kicker"
                          style={{ color: getDomainColor(signal.domain) }}
                        >
                          {t.domains[signal.domain]}
                        </span>
                      </div>
                      <span className="font-mono-tabular text-[11.5px] text-[var(--ws-ink-muted)]">
                        {t.metaLine.importance(signal.importance)}
                      </span>
                    </div>

                    <h3 className="ws-headline-story text-[var(--ws-ink)]">
                      <button
                        type="button"
                        onClick={() => onOpenSignal(signal.signal_id)}
                        className="text-left hover:text-[var(--ws-world)] transition-colors cursor-pointer"
                      >
                        {signal.headline}
                      </button>
                    </h3>

                    <p className="text-[14.5px] leading-[1.72] text-[var(--ws-ink-secondary)] line-clamp-3">
                      {getSignalExcerpt(signal, 165)}
                    </p>

                    <div className="pt-1 flex flex-wrap items-center justify-between gap-3">
                      <SignalMetaLine signal={signal} lang={lang} compact />
                      <button
                        type="button"
                        onClick={() => onOpenSignal(signal.signal_id)}
                        className="inline-flex items-center gap-1 text-[13px] font-medium text-[var(--ws-ink)] hover:text-[var(--ws-editorial-accent)] cursor-pointer"
                      >
                        <span>{t.briefing.readDossier}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Ranks #05–#10 — Crisp Broadsheet Dispatch Index */}
          {remainingPriority.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
              {remainingPriority.map((signal, idx) => {
                const rankLabel = String(idx + 5).padStart(2, '0');
                return (
                  <article
                    key={signal.signal_id}
                    className="group border-b border-[var(--ws-border-subtle)] pb-4 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2 text-[12px]">
                      <div className="flex items-center gap-2">
                        <span className="font-mono-tabular font-semibold text-[var(--ws-ink-faint)]">
                          {rankLabel}
                        </span>
                        <span
                          className="font-semibold"
                          style={{ color: getDomainColor(signal.domain) }}
                        >
                          {t.domains[signal.domain]}
                        </span>
                      </div>
                      <span className="font-mono-tabular text-[11.5px] text-[var(--ws-ink-muted)]">
                        {signal.importance}/5 ·{' '}
                        {t.confidence[signal.confidence.overall]}
                      </span>
                    </div>
                    <h3 className="font-display text-[17px] font-semibold leading-snug text-[var(--ws-ink)]">
                      <button
                        type="button"
                        onClick={() => onOpenSignal(signal.signal_id)}
                        className="text-left group-hover:text-[var(--ws-world)] transition-colors cursor-pointer"
                      >
                        {signal.headline}
                      </button>
                    </h3>
                    <div className="font-mono-tabular text-[11.5px] text-[var(--ws-ink-muted)]">
                      {t.metaLine.origins(signal.independentOriginCount)} ·{' '}
                      {t.metaLine.claims(signal.claims.length)}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* =====================================================================
          DAILY DELTA — ELEVATED NEWSROOM UPDATE LEDGER
         ===================================================================== */}
      {dailyDelta && (
        <DailyDeltaSection
          state={dailyDelta}
          lang={lang}
          onOpenSignalInEdition={
            onOpenSignalInEdition ?? ((_date, id) => onOpenSignal(id))
          }
          onRetry={onRetryDailyDelta}
          onOpenComparison={onOpenComparison}
        />
      )}

      {/* =====================================================================
          THREE DISTINCTIVE EDITORIAL DOMAINS (World / AI / Economy)
         ===================================================================== */}
      <section aria-label={t.briefing.domainsOverviewTitle} className="space-y-8">
        <div className="ws-rule-section pt-4 flex flex-wrap items-baseline justify-between gap-3">
          <div className="space-y-1">
            <div className="ws-kicker text-[var(--ws-editorial-accent)]">
              {lang === 'zh-CN' ? '三大编辑部板块' : 'Editorial Desks'}
            </div>
            <h2 className="font-display text-[26px] sm:text-[32px] font-semibold tracking-[-0.02em] text-[var(--ws-ink)]">
              {t.briefing.domainsOverviewTitle}
            </h2>
          </div>
          {onOpenComparison && (
            <button
              type="button"
              onClick={onOpenComparison}
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--ws-ink-secondary)] hover:text-[var(--ws-ink)] cursor-pointer"
            >
              <GitCompareArrows className="h-4 w-4 text-[var(--ws-ink-muted)]" />
              <span>{t.editionCompare.triggerButton}</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          {domainProfiles.map((profile, idx) => {
            const { domain } = profile;
            const accent = getDomainColor(domain);
            const topItems = domainTopSignals[domain];
            const domainLead = topItems[0] ?? null;
            const domainRest = topItems.slice(1, 4);
            const total = Math.max(1, profile.total);
            const imp5Pct = Math.round((profile.imp5Count / total) * 100);
            const imp4Pct = Math.round((profile.imp4Count / total) * 100);
            const impOtherPct = Math.max(0, 100 - imp5Pct - imp4Pct);

            return (
              <div
                key={domain}
                className={`flex flex-col justify-between space-y-5 ${
                  idx > 0
                    ? 'lg:border-l lg:border-[var(--ws-border)] lg:pl-8'
                    : ''
                }`}
              >
                <div className="space-y-5">
                  <div className="space-y-3">
                    <div
                      className="h-[3px] w-full"
                      style={{ backgroundColor: accent }}
                    />
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <DomainEditorialEmblem
                            domain={domain}
                            className="h-4 w-4"
                          />
                          <span className="ws-kicker" style={{ color: accent }}>
                            {t.briefing.coverPlateFolio[domain]}
                          </span>
                        </div>
                        <h3 className="font-display text-[24px] font-semibold tracking-[-0.015em] text-[var(--ws-ink)]">
                          {t.domains[domain]}
                        </h3>
                      </div>
                      <div className="text-right font-mono-tabular">
                        <div className="font-display text-[28px] font-semibold leading-none text-[var(--ws-ink)] ws-tabular">
                          {profile.total}
                        </div>
                        <div className="text-[11px] text-[var(--ws-ink-muted)] mt-1">
                          {t.briefing.domainShareLabel(profile.sharePct)}
                        </div>
                      </div>
                    </div>

                    <div className="ws-art-frame aspect-[16/7] w-full">
                      <img
                        src={getDomainPlateImage(domain)}
                        alt={t.domains[domain]}
                        loading="lazy"
                        className="h-full w-full object-cover object-center"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex h-1.5 w-full overflow-hidden rounded-[1px] bg-[var(--ws-border-subtle)] gap-[1px]">
                        {profile.imp5Count > 0 && (
                          <div
                            style={{
                              width: `${imp5Pct}%`,
                              backgroundColor: accent,
                            }}
                          />
                        )}
                        {profile.imp4Count > 0 && (
                          <div
                            style={{
                              width: `${imp4Pct}%`,
                              backgroundColor: accent,
                              opacity: 0.55,
                            }}
                          />
                        )}
                        {profile.impLowerCount > 0 && (
                          <div
                            style={{
                              width: `${impOtherPct}%`,
                              backgroundColor: 'var(--ws-border-strong)',
                            }}
                          />
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[11.5px] font-mono-tabular text-[var(--ws-ink-muted)]">
                        <span>
                          {t.briefing.domainHighPriorityCount(
                            profile.imp5Count + profile.imp4Count
                          )}
                        </span>
                        <span>
                          5/5: {profile.imp5Count} · 4/5: {profile.imp4Count}
                        </span>
                      </div>
                    </div>
                  </div>

                  {domainLead && (
                    <article className="space-y-2 border-b border-[var(--ws-border)] pb-4">
                      <h4 className="font-display text-[19px] font-semibold leading-snug text-[var(--ws-ink)]">
                        <button
                          type="button"
                          onClick={() => onOpenSignal(domainLead.signal_id)}
                          className="text-left hover:text-[var(--ws-world)] transition-colors cursor-pointer"
                        >
                          {domainLead.headline}
                        </button>
                      </h4>
                      <p className="text-[13.5px] leading-relaxed text-[var(--ws-ink-secondary)] line-clamp-2">
                        {getSignalExcerpt(domainLead, 130)}
                      </p>
                    </article>
                  )}

                  {domainRest.length > 0 && (
                    <ul className="space-y-3">
                      {domainRest.map((sig) => (
                        <li
                          key={sig.signal_id}
                          className="border-b border-[var(--ws-border-subtle)] pb-2.5 last:border-b-0 last:pb-0"
                        >
                          <button
                            type="button"
                            onClick={() => onOpenSignal(sig.signal_id)}
                            className="text-left block w-full group cursor-pointer space-y-1"
                          >
                            <div className="text-[14px] font-medium leading-snug text-[var(--ws-ink)] group-hover:text-[var(--ws-world)] transition-colors">
                              {sig.headline}
                            </div>
                            <div className="font-mono-tabular text-[11.5px] text-[var(--ws-ink-muted)]">
                              {t.metaLine.importance(sig.importance)} ·{' '}
                              {t.metaLine.origins(sig.independentOriginCount)}
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => onExploreDomain(domain)}
                    className="inline-flex items-center gap-1.5 text-[13px] font-semibold hover:underline cursor-pointer"
                    style={{ color: accent }}
                  >
                    <span>
                      {t.briefing.exploreDomain} ({profile.total})
                    </span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =====================================================================
          LOWER-PAGE EDITORIAL READING PATHWAYS (Nocturnal Ink Band)
         ===================================================================== */}
      <section
        aria-label={t.briefing.readingPathTitle}
        className="ws-plate border border-[var(--ws-plate-border)] p-6 sm:p-8 lg:p-10 space-y-6"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--ws-plate-border)] pb-4">
          <div className="space-y-1">
            <div className="ws-kicker text-[#ef7362]">
              {lang === 'zh-CN' ? '延伸研读路径' : 'Continue Reading'}
            </div>
            <h2 className="font-display text-[24px] sm:text-[28px] font-semibold text-[var(--ws-plate-ink)]">
              {t.briefing.readingPathTitle}
            </h2>
          </div>
          <p className="text-[13.5px] text-[var(--ws-plate-muted)] max-w-md">
            {t.briefing.readingPathSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          <button
            type="button"
            onClick={() => onSwitchView('expanded')}
            className="text-left group space-y-2.5 border-t border-[var(--ws-plate-border)] pt-4 hover:border-[#ef7362] transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between text-[var(--ws-plate-ink)]">
              <span className="inline-flex items-center gap-2 font-display text-[20px] font-semibold">
                <FileSearch className="h-4.5 w-4.5 text-[#ef7362]" />
                {t.nav.expanded}
              </span>
              <ArrowRight className="h-4 w-4 text-[var(--ws-plate-muted)] group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-[13.5px] leading-relaxed text-[var(--ws-plate-secondary)]">
              {t.briefing.openExpandedDesc}
            </p>
          </button>

          <button
            type="button"
            onClick={() => onSwitchView('synthesis')}
            className="text-left group space-y-2.5 border-t border-[var(--ws-plate-border)] pt-4 hover:border-[#ef7362] transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between text-[var(--ws-plate-ink)]">
              <span className="inline-flex items-center gap-2 font-display text-[20px] font-semibold">
                <Network className="h-4.5 w-4.5 text-[#ef7362]" />
                {t.nav.synthesis}
              </span>
              <ArrowRight className="h-4 w-4 text-[var(--ws-plate-muted)] group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-[13.5px] leading-relaxed text-[var(--ws-plate-secondary)]">
              {t.briefing.openSynthesisDesc}
            </p>
          </button>

          <button
            type="button"
            onClick={() => onSwitchView('audit')}
            className="text-left group space-y-2.5 border-t border-[var(--ws-plate-border)] pt-4 hover:border-[#ef7362] transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between text-[var(--ws-plate-ink)]">
              <span className="inline-flex items-center gap-2 font-display text-[20px] font-semibold">
                <ShieldCheck className="h-4.5 w-4.5 text-[#ef7362]" />
                {t.nav.audit}
              </span>
              <ArrowRight className="h-4 w-4 text-[var(--ws-plate-muted)] group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-[13.5px] leading-relaxed text-[var(--ws-plate-secondary)]">
              {t.briefing.openAuditDesc}
            </p>
          </button>
        </div>
      </section>
    </div>
  );
};
