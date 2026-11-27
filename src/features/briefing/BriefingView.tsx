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
import {
  extractGroundedSignalStats,
  selectVisualStrategyForSignal,
  type VisualSelectionResult,
} from '../../lib/editorial/editorialAssetRegistry';
import { SafeMarkdown } from '../../components/editorial/SafeMarkdown';
import { SignalMetaLine } from '../../components/editorial/SignalMetaLine';
import { DomainEditorialEmblem } from '../../components/editorial/EditorialSignalArtwork';
import { StoryVisual } from '../../components/editorial/StoryVisual';
import { DailyDeltaSection } from './DailyDeltaSection';
import { CatchUpBanner } from './CatchUpBanner';

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

function selectRepresentativeMilestones(
  points: Array<{ dateLabel: string; summary: string }>
): Array<{ dateLabel: string; summary: string }> {
  if (points.length <= 3) return points;
  return [points[0], points[points.length - 2], points[points.length - 1]];
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

  const domainProfileMap = useMemo(() => {
    const map: Partial<Record<SignalDomain, (typeof domainProfiles)[number]>> =
      {};
    for (const p of domainProfiles) map[p.domain] = p;
    return map;
  }, [domainProfiles]);

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
        .slice(0, 5);
    }
    return map;
  }, [signals]);

  // Deterministic Anti-Repetition Visual Allocation Across All Briefing Slots
  const visualAllocation = useMemo(() => {
    const usedAssetIds = new Set<string>();

    const lead: VisualSelectionResult | null = leadSignal
      ? selectVisualStrategyForSignal(leadSignal, { context: 'hero' })
      : null;
    if (lead?.asset) usedAssetIds.add(lead.asset.id);

    const secondaryExclude = Array.from(usedAssetIds);
    const secondary: VisualSelectionResult | null = secondaryFeature
      ? selectVisualStrategyForSignal(secondaryFeature, {
          context: 'secondary',
          excludeAssetIds: secondaryExclude,
        })
      : null;
    if (secondary?.asset) usedAssetIds.add(secondary.asset.id);

    // Pick a distinct featured signal for World desk if leadSignal is already World #1
    const worldCandidates = domainTopSignals.world;
    const worldDeskSignal =
      worldCandidates.find((s) => s.signal_id !== leadSignal?.signal_id) ??
      worldCandidates[0] ??
      null;
    const worldDeskExclude = Array.from(usedAssetIds);
    const worldDeskSelection = worldDeskSignal
      ? selectVisualStrategyForSignal(worldDeskSignal, {
          context: 'desk',
          excludeAssetIds: worldDeskExclude,
        })
      : null;
    if (worldDeskSelection?.asset) usedAssetIds.add(worldDeskSelection.asset.id);

    const aiDeskSignal = domainTopSignals.ai[0] ?? null;
    const aiDeskExclude = Array.from(usedAssetIds);
    const aiDeskSelection = aiDeskSignal
      ? selectVisualStrategyForSignal(aiDeskSignal, {
          context: 'desk',
          excludeAssetIds: aiDeskExclude,
        })
      : null;
    if (aiDeskSelection?.asset) usedAssetIds.add(aiDeskSelection.asset.id);

    const econDeskSignal = domainTopSignals.economy[0] ?? null;
    const econDeskExclude = Array.from(usedAssetIds);
    const econDeskSelection = econDeskSignal
      ? selectVisualStrategyForSignal(econDeskSignal, {
          context: 'desk',
          excludeAssetIds: econDeskExclude,
        })
      : null;
    if (econDeskSelection?.asset) usedAssetIds.add(econDeskSelection.asset.id);

    return {
      secondaryExclude,
      worldDeskSignal,
      worldDeskExclude,
      aiDeskSignal,
      aiDeskExclude,
      econDeskSignal,
      econDeskExclude,
    };
  }, [domainTopSignals, leadSignal, secondaryFeature]);

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

  const worldProfile = domainProfileMap.world;
  const aiProfile = domainProfileMap.ai;
  const econProfile = domainProfileMap.economy;

  const worldDispatches = useMemo(() => {
    const deskLeadId = visualAllocation.worldDeskSignal?.signal_id;
    const coverLeadId = leadSignal?.signal_id;
    const distinct = signals
      .filter(
        (s) =>
          s.domain === 'world' &&
          s.signal_id !== deskLeadId &&
          s.signal_id !== coverLeadId
      )
      .sort((a, b) => {
        if (b.importance !== a.importance) return b.importance - a.importance;
        return b.claims.length - a.claims.length;
      });
    return distinct.slice(0, 4);
  }, [leadSignal?.signal_id, signals, visualAllocation.worldDeskSignal]);

  const aiDispatches = domainTopSignals.ai.slice(1, 5);
  const econDispatches = domainTopSignals.economy.slice(1, 5);

  return (
    <div className="space-y-12 pb-16">
      {/* =====================================================================
          PUBLICATION ISSUE FOLIO (Broadsheet Masthead Utility Rule)
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
          FLAGSHIP COVER PLATE (Narrative-First Cover + Verified Chronology Ribbon)
         ===================================================================== */}
      {leadSignal && (
        <section
          aria-label="Cover story"
          className="ws-plate border border-[var(--ws-plate-border)] p-6 sm:p-8 lg:p-10 space-y-7"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-11 items-center">
            {/* Narrative-First Cover Column */}
            <div className="lg:col-span-5 space-y-5 order-2 lg:order-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
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
                <span className="font-mono-tabular text-[11px] text-[var(--ws-plate-muted)]">
                  {leadSignal.event.start_date || frontmatter.edition_date}
                </span>
              </div>

              <h1
                className={`ws-headline-cover ${
                  /[\u4e00-\u9fff]/.test(leadSignal.headline)
                    ? 'ws-headline-cover-cjk'
                    : ''
                } text-[var(--ws-plate-ink)]`}
              >
                <button
                  type="button"
                  onClick={() => onOpenSignal(leadSignal.signal_id)}
                  className="text-left hover:text-[#9ec5f8] transition-colors cursor-pointer"
                >
                  {leadSignal.headline}
                </button>
              </h1>

              <p className="text-[16px] sm:text-[17px] leading-[1.72] text-[var(--ws-plate-secondary)] max-w-[46ch] [text-wrap:pretty]">
                {getSignalExcerpt(leadSignal, 165)}
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

            {/* Commanding 7-Column Editorial Print Plate */}
            <div className="lg:col-span-7 group order-1 lg:order-2">
              <StoryVisual
                signal={leadSignal}
                lang={lang}
                context="hero"
                variant="hero"
                tone="dark"
              />
            </div>
          </div>

          {/* Grounded Real-World Chronology & Verification Ribbon */}
          {leadStats && (
            <div className="border-t border-[var(--ws-plate-border)] pt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Grounded Evidence Numbers */}
              <div className="lg:col-span-4 grid grid-cols-3 gap-4 lg:border-r lg:border-[var(--ws-plate-border)] lg:pr-6">
                <div className="space-y-1">
                  <div className="font-display text-[24px] sm:text-[28px] font-semibold leading-none text-[var(--ws-plate-ink)] ws-tabular">
                    {leadStats.independentOriginsCount}
                  </div>
                  <div className="text-[11.5px] text-[var(--ws-plate-muted)]">
                    {t.briefing.artworkOriginsLabel}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="font-display text-[24px] sm:text-[28px] font-semibold leading-none text-[var(--ws-plate-ink)] ws-tabular">
                    {leadStats.confirmedClaimsCount}
                    <span className="text-[var(--ws-plate-muted)] font-normal text-[17px]">
                      /{leadStats.claimsCount}
                    </span>
                  </div>
                  <div className="text-[11.5px] text-[var(--ws-plate-muted)]">
                    {lang === 'zh-CN' ? '已证实声明' : 'Confirmed'}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="font-display text-[24px] sm:text-[28px] font-semibold leading-none text-[var(--ws-plate-ink)] ws-tabular">
                    {leadStats.sourcesCount}
                  </div>
                  <div className="text-[11.5px] text-[var(--ws-plate-muted)]">
                    {t.briefing.artworkSourcesLabel}
                  </div>
                </div>
              </div>

              {/* Grounded Real-World Chronology Milestones (Strictly from verified timelineEvents) */}
              <div className="lg:col-span-8 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono-tabular text-[var(--ws-plate-muted)]">
                  <span className="ws-kicker text-[var(--ws-plate-secondary)]">
                    {lang === 'zh-CN'
                      ? '真实世界关键节点'
                      : 'Verified Real-World Chronology'}
                  </span>
                  {leadStats.timelineSpanLabel && (
                    <span>{leadStats.timelineSpanLabel}</span>
                  )}
                </div>
                {leadStats.timelinePoints.length > 0 ? (
                  <ol className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {selectRepresentativeMilestones(
                      leadStats.timelinePoints
                    ).map((pt, idx) => (
                      <li
                        key={`${pt.dateLabel}-${idx}`}
                        className="border-t border-[var(--ws-plate-border)] pt-2 space-y-1"
                      >
                        <div className="font-mono-tabular text-[11px] font-semibold text-[#ef7362]">
                          {pt.dateLabel}
                        </div>
                        <div className="text-[12.5px] leading-snug text-[var(--ws-plate-secondary)] line-clamp-2">
                          {pt.summary}
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <div className="text-[12.5px] text-[var(--ws-plate-muted)]">
                    {leadSignal.event.geography.join(' · ') ||
                      leadSignal.signal_id}
                  </div>
                )}
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

          {/* Rank #02 — Prominent Secondary Feature Spread (Anti-Repetition Guaranteed) */}
          {secondaryFeature && (
            <article className="grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-10 pb-8 border-b border-[var(--ws-border)] items-center">
              <div className="lg:col-span-5 group">
                <StoryVisual
                  signal={secondaryFeature}
                  lang={lang}
                  context="secondary"
                  excludeAssetIds={visualAllocation.secondaryExclude}
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
          THREE DISTINCTIVE EDITORIAL DESKS (Asymmetric Broadsheet + Twin Desks)
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

        {/* DESK I — WORLD EVENTS: Full-Width Asymmetric Broadsheet Foreign Desk */}
        {worldProfile && (
          <div className="ws-editorial-sheet border-t-[3px] border-t-[var(--ws-world)] p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--ws-border)] pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <DomainEditorialEmblem domain="world" className="h-4 w-4" />
                  <span
                    className="ws-kicker"
                    style={{ color: 'var(--ws-world)' }}
                  >
                    {t.briefing.coverPlateFolio.world}
                  </span>
                </div>
                <h3 className="font-display text-[24px] sm:text-[28px] font-semibold tracking-[-0.018em] text-[var(--ws-ink)]">
                  {t.domains.world}
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <div className="font-mono-tabular text-[12px] text-[var(--ws-ink-muted)]">
                  <span className="font-semibold text-[var(--ws-ink)]">
                    {worldProfile.total}
                  </span>{' '}
                  · {t.briefing.domainShareLabel(worldProfile.sharePct)} · 5/5:{' '}
                  {worldProfile.imp5Count} · 4/5: {worldProfile.imp4Count}
                </div>
                <button
                  type="button"
                  onClick={() => onExploreDomain('world')}
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold hover:underline cursor-pointer"
                  style={{ color: 'var(--ws-world)' }}
                >
                  <span>
                    {t.briefing.exploreDomain} ({worldProfile.total})
                  </span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-10 items-start">
              {/* Left 5 cols: Featured World Dispatch with Distinct Non-Repeating Subject Plate */}
              {visualAllocation.worldDeskSignal && (
                <article className="lg:col-span-5 space-y-4 group">
                  <StoryVisual
                    signal={visualAllocation.worldDeskSignal}
                    lang={lang}
                    context="desk"
                    excludeAssetIds={visualAllocation.worldDeskExclude}
                    variant="plate"
                    plateNumber="I"
                  />
                  <div className="space-y-2">
                    <div className="font-mono-tabular text-[11.5px] text-[var(--ws-ink-muted)]">
                      {visualAllocation.worldDeskSignal.topic} ·{' '}
                      {t.metaLine.importance(
                        visualAllocation.worldDeskSignal.importance
                      )}
                    </div>
                    <h4 className="font-display text-[21px] font-semibold leading-snug text-[var(--ws-ink)]">
                      <button
                        type="button"
                        onClick={() =>
                          onOpenSignal(
                            visualAllocation.worldDeskSignal!.signal_id
                          )
                        }
                        className="text-left hover:text-[var(--ws-world)] transition-colors cursor-pointer"
                      >
                        {visualAllocation.worldDeskSignal.headline}
                      </button>
                    </h4>
                    <p className="text-[14px] leading-[1.68] text-[var(--ws-ink-secondary)] line-clamp-3">
                      {getSignalExcerpt(visualAllocation.worldDeskSignal, 160)}
                    </p>
                  </div>
                </article>
              )}

              {/* Right 7 cols: 2-Column Foreign Correspondent Dispatch Ledger */}
              <div className="lg:col-span-7 lg:border-l lg:border-[var(--ws-border)] lg:pl-8 grid grid-cols-1 sm:grid-cols-2 gap-x-7 gap-y-5">
                {worldDispatches.map((sig) => (
                  <article
                    key={sig.signal_id}
                    className="group border-b border-[var(--ws-border-subtle)] pb-4 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2 font-mono-tabular text-[11px] text-[var(--ws-ink-muted)]">
                      <span className="truncate">{sig.topic}</span>
                      <span className="shrink-0 font-semibold text-[var(--ws-world)]">
                        {sig.importance}/5
                      </span>
                    </div>
                    <h4 className="font-display text-[17px] font-semibold leading-snug text-[var(--ws-ink)]">
                      <button
                        type="button"
                        onClick={() => onOpenSignal(sig.signal_id)}
                        className="text-left group-hover:text-[var(--ws-world)] transition-colors cursor-pointer"
                      >
                        {sig.headline}
                      </button>
                    </h4>
                    <p className="text-[13px] leading-relaxed text-[var(--ws-ink-secondary)] line-clamp-2">
                      {getSignalExcerpt(sig, 110)}
                    </p>
                    <div className="font-mono-tabular text-[11px] text-[var(--ws-ink-muted)]">
                      {t.metaLine.origins(sig.independentOriginCount)} ·{' '}
                      {t.confidence[sig.confidence.overall]}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* DESK II (AI FRONTIER · 7 cols) + DESK III (ECONOMIC OUTLOOK · 5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* DESK II — AI FRONTIER (Technical Monograph Desk) */}
          {aiProfile && (
            <div className="lg:col-span-7 ws-desk-ai p-6 sm:p-7 flex flex-col justify-between space-y-6">
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-3 border-b border-[var(--ws-border)] pb-3.5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <DomainEditorialEmblem domain="ai" className="h-4 w-4" />
                      <span
                        className="ws-kicker"
                        style={{ color: 'var(--ws-ai)' }}
                      >
                        {t.briefing.coverPlateFolio.ai}
                      </span>
                    </div>
                    <h3 className="font-display text-[24px] font-semibold tracking-[-0.015em] text-[var(--ws-ink)]">
                      {t.domains.ai}
                    </h3>
                  </div>
                  <div className="text-right font-mono-tabular">
                    <div className="font-display text-[28px] font-semibold leading-none text-[var(--ws-ink)] ws-tabular">
                      {aiProfile.total}
                    </div>
                    <div className="text-[11px] text-[var(--ws-ink-muted)] mt-1">
                      {t.briefing.domainShareLabel(aiProfile.sharePct)}
                    </div>
                  </div>
                </div>

                {visualAllocation.aiDeskSignal && (
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center border-b border-[var(--ws-border)] pb-5">
                    <div className="sm:col-span-6 group">
                      <StoryVisual
                        signal={visualAllocation.aiDeskSignal}
                        lang={lang}
                        context="desk"
                        excludeAssetIds={visualAllocation.aiDeskExclude}
                        variant="feature"
                        plateNumber="II"
                      />
                    </div>
                    <article className="sm:col-span-6 space-y-2.5">
                      <div className="font-mono-tabular text-[11px] font-semibold text-[var(--ws-ai)]">
                        {visualAllocation.aiDeskSignal.topic} ·{' '}
                        {t.metaLine.importance(
                          visualAllocation.aiDeskSignal.importance
                        )}
                      </div>
                      <h4 className="font-display text-[19.5px] font-semibold leading-snug text-[var(--ws-ink)]">
                        <button
                          type="button"
                          onClick={() =>
                            onOpenSignal(
                              visualAllocation.aiDeskSignal!.signal_id
                            )
                          }
                          className="text-left hover:text-[var(--ws-ai)] transition-colors cursor-pointer"
                        >
                          {visualAllocation.aiDeskSignal.headline}
                        </button>
                      </h4>
                      <p className="text-[13.5px] leading-relaxed text-[var(--ws-ink-secondary)] line-clamp-3">
                        {getSignalExcerpt(visualAllocation.aiDeskSignal, 135)}
                      </p>
                    </article>
                  </div>
                )}

                {aiDispatches.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                    {aiDispatches.map((sig) => (
                      <article
                        key={sig.signal_id}
                        className="group space-y-1.5 border-b border-[var(--ws-border-subtle)] pb-3"
                      >
                        <button
                          type="button"
                          onClick={() => onOpenSignal(sig.signal_id)}
                          className="text-left block w-full cursor-pointer space-y-1"
                        >
                          <div className="text-[14px] font-semibold leading-snug text-[var(--ws-ink)] group-hover:text-[var(--ws-ai)] transition-colors">
                            {sig.headline}
                          </div>
                          <div className="font-mono-tabular text-[11.5px] text-[var(--ws-ink-muted)]">
                            {sig.topic} · {sig.importance}/5 ·{' '}
                            {t.metaLine.origins(sig.independentOriginCount)}
                          </div>
                        </button>
                      </article>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-[var(--ws-border)] flex items-center justify-between gap-3">
                <span className="font-mono-tabular text-[11.5px] text-[var(--ws-ink-muted)]">
                  5/5: {aiProfile.imp5Count} · 4/5: {aiProfile.imp4Count}
                </span>
                <button
                  type="button"
                  onClick={() => onExploreDomain('ai')}
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold hover:underline cursor-pointer"
                  style={{ color: 'var(--ws-ai)' }}
                >
                  <span>
                    {t.briefing.exploreDomain} ({aiProfile.total})
                  </span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* DESK III — ECONOMIC OUTLOOK (FT-Inspired Financial & Macro Ledger Desk) */}
          {econProfile && (
            <div className="lg:col-span-5 ws-desk-economy p-6 sm:p-7 flex flex-col justify-between space-y-6">
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-3 border-b border-[var(--ws-border)] pb-3.5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <DomainEditorialEmblem
                        domain="economy"
                        className="h-4 w-4"
                      />
                      <span
                        className="ws-kicker"
                        style={{ color: 'var(--ws-economy)' }}
                      >
                        {t.briefing.coverPlateFolio.economy}
                      </span>
                    </div>
                    <h3 className="font-display text-[24px] font-semibold tracking-[-0.015em] text-[var(--ws-ink)]">
                      {t.domains.economy}
                    </h3>
                  </div>
                  <div className="text-right font-mono-tabular">
                    <div className="font-display text-[28px] font-semibold leading-none text-[var(--ws-ink)] ws-tabular">
                      {econProfile.total}
                    </div>
                    <div className="text-[11px] text-[var(--ws-ink-muted)] mt-1">
                      {t.briefing.domainShareLabel(econProfile.sharePct)}
                    </div>
                  </div>
                </div>

                {visualAllocation.econDeskSignal && (
                  <div className="space-y-3.5 border-b border-[var(--ws-border)] pb-5 group">
                    <StoryVisual
                      signal={visualAllocation.econDeskSignal}
                      lang={lang}
                      context="desk"
                      excludeAssetIds={visualAllocation.econDeskExclude}
                      variant="plate"
                      plateNumber="III"
                    />
                    <article className="space-y-1.5">
                      <h4 className="font-display text-[19px] font-semibold leading-snug text-[var(--ws-ink)]">
                        <button
                          type="button"
                          onClick={() =>
                            onOpenSignal(
                              visualAllocation.econDeskSignal!.signal_id
                            )
                          }
                          className="text-left hover:text-[var(--ws-economy)] transition-colors cursor-pointer"
                        >
                          {visualAllocation.econDeskSignal.headline}
                        </button>
                      </h4>
                      <p className="text-[13.5px] leading-relaxed text-[var(--ws-ink-secondary)] line-clamp-2">
                        {getSignalExcerpt(visualAllocation.econDeskSignal, 125)}
                      </p>
                    </article>
                  </div>
                )}

                {econDispatches.length > 0 && (
                  <ul className="divide-y divide-[var(--ws-border-subtle)]">
                    {econDispatches.map((sig) => (
                      <li key={sig.signal_id} className="py-2.5 first:pt-0 last:pb-0">
                        <button
                          type="button"
                          onClick={() => onOpenSignal(sig.signal_id)}
                          className="w-full text-left group cursor-pointer flex items-baseline justify-between gap-3"
                        >
                          <span className="text-[13.5px] font-medium leading-snug text-[var(--ws-ink)] group-hover:text-[var(--ws-economy)] transition-colors">
                            {sig.headline}
                          </span>
                          <span className="font-mono-tabular text-[11px] font-semibold text-[var(--ws-economy)] shrink-0">
                            {sig.importance}/5
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="pt-2 border-t border-[var(--ws-border)] flex items-center justify-between gap-3">
                <span className="font-mono-tabular text-[11.5px] text-[var(--ws-ink-muted)]">
                  5/5: {econProfile.imp5Count} · 4/5: {econProfile.imp4Count}
                </span>
                <button
                  type="button"
                  onClick={() => onExploreDomain('economy')}
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold hover:underline cursor-pointer"
                  style={{ color: 'var(--ws-economy)' }}
                >
                  <span>
                    {t.briefing.exploreDomain} ({econProfile.total})
                  </span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
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
