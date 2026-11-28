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
import { getInterfacePhoto } from '../../lib/editorial/interfaceImageLibrary';
import { SafeMarkdown } from '../../components/editorial/SafeMarkdown';
import { SignalMetaLine } from '../../components/editorial/SignalMetaLine';
import { DomainEditorialEmblem } from '../../components/editorial/EditorialSignalArtwork';
import { InterfacePhotoPlate } from '../../components/editorial/InterfacePhotoPlate';
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
 * Extracts a clean, sentence-terminated editorial deck without raw inline citation
 * tokens like [S1][S2] or [C1], preserving natural journalistic cadence.
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
    .replace(/\s*(?:\[(?:S|C|M|E)\d+(?:[-,]\s*(?:S|C|M|E)?\d+)*\])+/gi, '')
    .replace(/^[-*]\s+/gm, '')
    .replace(/\s+([,.;:!?。，；：！？])/g, '$1')
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
  maxChars = 460
): { preview: string; isTruncated: boolean } {
  const trimmed = markdown.trim();
  if (!trimmed) return { preview: '', isTruncated: false };

  const paragraphs = trimmed
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  if (paragraphs.length > 1 && paragraphs[0].length <= maxChars + 110) {
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

  // Front-page above-the-fold dispatch rail (#02, #03, #04)
  const frontPageRail = rankedSignals.slice(1, 4);
  // Featured secondary visual spread (#05 when >=5 signals exist) + crisp numbered index (#06–#10)
  const featuredDispatch = rankedSignals[4] ?? null;
  const featuredDispatchRank = '05';
  const remainingPriority = rankedSignals.slice(5, 10);

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
    const usedMediaUrls = new Set<string>();

    const lead: VisualSelectionResult | null = leadSignal
      ? selectVisualStrategyForSignal(leadSignal, { context: 'hero' })
      : null;
    if (lead?.asset) usedAssetIds.add(lead.asset.id);
    if (lead?.selectedMedia) usedMediaUrls.add(lead.selectedMedia.asset_url);

    const secondaryExclude = Array.from(usedAssetIds);
    const secondaryMediaExclude = Array.from(usedMediaUrls);
    const secondary: VisualSelectionResult | null = featuredDispatch
      ? selectVisualStrategyForSignal(featuredDispatch, {
          context: 'secondary',
          excludeAssetIds: secondaryExclude,
          excludeMediaUrls: secondaryMediaExclude,
        })
      : null;
    if (secondary?.asset) usedAssetIds.add(secondary.asset.id);
    if (secondary?.selectedMedia) {
      usedMediaUrls.add(secondary.selectedMedia.asset_url);
    }

    // Pick a distinct featured signal for World desk if leadSignal is already World #1
    const worldCandidates = domainTopSignals.world;
    const worldDeskSignal =
      worldCandidates.find((s) => s.signal_id !== leadSignal?.signal_id) ??
      worldCandidates[0] ??
      null;
    const worldDeskExclude = Array.from(usedAssetIds);
    const worldDeskMediaExclude = Array.from(usedMediaUrls);
    const worldDeskSelection = worldDeskSignal
      ? selectVisualStrategyForSignal(worldDeskSignal, {
          context: 'desk',
          excludeAssetIds: worldDeskExclude,
          excludeMediaUrls: worldDeskMediaExclude,
        })
      : null;
    if (worldDeskSelection?.asset) usedAssetIds.add(worldDeskSelection.asset.id);
    if (worldDeskSelection?.selectedMedia) {
      usedMediaUrls.add(worldDeskSelection.selectedMedia.asset_url);
    }

    const aiDeskSignal = domainTopSignals.ai[0] ?? null;
    const aiDeskExclude = Array.from(usedAssetIds);
    const aiDeskMediaExclude = Array.from(usedMediaUrls);
    const aiDeskSelection = aiDeskSignal
      ? selectVisualStrategyForSignal(aiDeskSignal, {
          context: 'desk',
          excludeAssetIds: aiDeskExclude,
          excludeMediaUrls: aiDeskMediaExclude,
        })
      : null;
    if (aiDeskSelection?.asset) usedAssetIds.add(aiDeskSelection.asset.id);
    if (aiDeskSelection?.selectedMedia) {
      usedMediaUrls.add(aiDeskSelection.selectedMedia.asset_url);
    }

    const econDeskSignal = domainTopSignals.economy[0] ?? null;
    const econDeskExclude = Array.from(usedAssetIds);
    const econDeskMediaExclude = Array.from(usedMediaUrls);
    const econDeskSelection = econDeskSignal
      ? selectVisualStrategyForSignal(econDeskSignal, {
          context: 'desk',
          excludeAssetIds: econDeskExclude,
          excludeMediaUrls: econDeskMediaExclude,
        })
      : null;
    if (econDeskSelection?.asset) usedAssetIds.add(econDeskSelection.asset.id);
    if (econDeskSelection?.selectedMedia) {
      usedMediaUrls.add(econDeskSelection.selectedMedia.asset_url);
    }

    return {
      secondaryExclude,
      secondaryMediaExclude,
      worldDeskSignal,
      worldDeskExclude,
      worldDeskMediaExclude,
      aiDeskSignal,
      aiDeskExclude,
      aiDeskMediaExclude,
      econDeskSignal,
      econDeskExclude,
      econDeskMediaExclude,
    };
  }, [domainTopSignals, leadSignal, featuredDispatch]);

  const totalClaims = useMemo(
    () => signals.reduce((sum, s) => sum + s.claims.length, 0),
    [signals]
  );

  const summaryMarkdown =
    executiveBriefing.summaryText || frontmatter.summary || '';

  const summaryPreview = useMemo(
    () => truncateEditorialMarkdown(summaryMarkdown, 460),
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
    <div className="space-y-10 pb-16">
      {/* =====================================================================
          FRONT-PAGE PUBLICATION MASTHEAD (Iconic Broadsheet Nameplate + Folio)
         ===================================================================== */}
      <header
        aria-label="Edition masthead"
        data-testid="briefing-masthead"
        className="space-y-2"
      >
        {/* Top Ink Rule + Edition Nameplate */}
        <div className="border-t-[3px] border-t-[var(--ws-ink)] pt-3 pb-2.5 border-b border-b-[var(--ws-border-strong)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-2.5 lg:gap-x-6 items-end">
            {/* Left Folio Column: Edition Date & Sync Cycle */}
            <div className="lg:col-span-3 flex flex-wrap lg:flex-col gap-x-2.5 gap-y-0.5 text-[12px] text-[var(--ws-ink-secondary)]">
              <span className="font-semibold text-[var(--ws-ink)] tracking-[-0.005em]">
                {dateHeading}
              </span>
              <span className="text-[var(--ws-ink-muted)]">
                {[syncLabel, statusLabel].filter(Boolean).join(' · ')}
              </span>
            </div>

            {/* Center Monumental Wordmark */}
            <div className="lg:col-span-6 lg:text-center space-y-0.5">
              <div className="inline-flex items-center lg:justify-center gap-3">
                <span
                  aria-hidden="true"
                  className="hidden sm:inline-block h-[2px] w-7 bg-[var(--ws-editorial-accent)]"
                />
                <span className="ws-masthead-wordmark select-none">
                  WORLD SIGNAL
                </span>
                <span
                  aria-hidden="true"
                  className="hidden sm:inline-block h-[2px] w-7 bg-[var(--ws-editorial-accent)]"
                />
              </div>
              <p className="ws-kicker text-[var(--ws-ink-muted)] text-[10px] tracking-[0.13em]">
                {lang === 'zh-CN'
                  ? '全球事件 · 前沿人工智能 · 宏观经济'
                  : 'World Events · AI Frontier · Economic Outlook'}
              </p>
            </div>

            {/* Right Folio Column: Edition Provenance Counts & Refresh */}
            <div className="lg:col-span-3 flex flex-wrap lg:flex-col lg:items-end justify-between gap-x-4 gap-y-1 ws-meta text-[12px] text-[var(--ws-ink-muted)]">
              <div className="flex flex-wrap lg:justify-end items-center gap-x-2 gap-y-0.5">
                <span className="font-semibold text-[var(--ws-ink)] whitespace-nowrap">
                  {t.masthead.signalsCount(signals.length)}
                </span>
                <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">
                  ·
                </span>
                <span className="whitespace-nowrap">
                  {t.masthead.independentOriginsCount(
                    independenceSummary.independentOriginCount
                  )}
                </span>
                <span aria-hidden="true" className="hidden xl:inline text-[var(--ws-ink-faint)]">
                  ·
                </span>
                <span className="hidden xl:inline whitespace-nowrap">
                  {t.masthead.claimsCount(totalClaims)}
                </span>
              </div>

              <div className="flex flex-wrap lg:justify-end items-center gap-x-3 gap-y-1">
                {(errorCount > 0 || warningCount > 0) && (
                  <button
                    type="button"
                    onClick={() => onSwitchView('audit')}
                    className="inline-flex items-center gap-1 text-[var(--ws-warn)] hover:underline cursor-pointer"
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>
                      {t.masthead.diagnosticsLink(errorCount, warningCount)}
                    </span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onRefresh}
                  disabled={isRefreshing}
                  className="inline-flex items-center gap-1.5 text-[var(--ws-ink)] hover:text-[var(--ws-editorial-accent)] transition-colors cursor-pointer disabled:opacity-50 font-medium"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
                  />
                  <span>
                    {isRefreshing
                      ? t.archive.refreshing
                      : t.archive.refreshEdition}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quiet Edition Coverage Strip */}
        {(coverageWindow || frontmatter.updated_at) && (
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[11.5px] ws-meta text-[var(--ws-ink-muted)]">
            <span>
              {coverageWindow
                ? `${lang === 'zh-CN' ? '覆盖窗口' : 'Coverage window'}: ${coverageWindow}`
                : frontmatter.updated_at
                  ? `${lang === 'zh-CN' ? '更新时间' : 'Updated'}: ${formatCompactTimestamp(frontmatter.updated_at, lang)}`
                  : ''}
            </span>
            <span className="font-mono-tabular text-[11px] text-[var(--ws-ink-faint)]">
              {frontmatter.edition_date}
            </span>
          </div>
        )}
      </header>

      {/* =====================================================================
          ASYMMETRIC MAGAZINE FRONT COVER (9:3 Spread · 100% Above the Fold)
         ===================================================================== */}
      {leadSignal && (
        <section
          aria-label="Cover story"
          data-testid="briefing-cover-spread"
          className="grid grid-cols-1 lg:grid-cols-12 gap-7 xl:gap-9 items-start"
        >
          {/* PRIMARY 9-COLUMN COVER FEATURE: 5:7 Text-to-Visual Spread + Provenance Band */}
          <article className="lg:col-span-9 space-y-5">
            {/* Kicker & Geography Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--ws-border)] pb-2">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <span className="inline-flex items-center gap-2 ws-kicker text-[var(--ws-editorial-accent)]">
                  <span
                    aria-hidden="true"
                    className="h-[2.5px] w-5 bg-[var(--ws-editorial-accent)]"
                  />
                  {t.briefing.leadKicker}
                </span>
                <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">
                  /
                </span>
                <span
                  className="ws-kicker"
                  style={{ color: getDomainColor(leadSignal.domain) }}
                >
                  {t.domains[leadSignal.domain]}
                </span>
              </div>
              <span className="ws-meta text-[12px] text-[var(--ws-ink-muted)]">
                {leadSignal.event.geography.length > 0
                  ? leadSignal.event.geography.slice(0, 3).join(' · ')
                  : leadSignal.signal_id}
              </span>
            </div>

            {/* Asymmetric 5:7 Editorial Cover Pair — Headline & Narrative Left, Full Showcase Visual Right */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 xl:gap-7 items-start">
              <div className="xl:col-span-5 flex flex-col justify-between gap-4">
                <div className="space-y-3.5">
                  <h1
                    className={`ws-headline-cover ${
                      /[\u4e00-\u9fff]/.test(leadSignal.headline)
                        ? 'ws-headline-cover-cjk'
                        : ''
                    } text-[var(--ws-ink)]`}
                  >
                    <button
                      type="button"
                      onClick={() => onOpenSignal(leadSignal.signal_id)}
                      className="text-left ws-headline-link hover:text-[var(--ws-editorial-accent)] cursor-pointer"
                    >
                      {leadSignal.headline}
                    </button>
                  </h1>

                  <p className="ws-deck [text-wrap:pretty]">
                    {getSignalExcerpt(leadSignal, 175)}
                  </p>
                </div>

                <div className="space-y-3.5 pt-2 border-t border-[var(--ws-border-subtle)]">
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 ws-meta text-[12px] text-[var(--ws-ink-muted)]">
                    <span className="font-semibold text-[var(--ws-ink)]">
                      {t.metaLine.importance(leadSignal.importance)}
                    </span>
                    <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">
                      ·
                    </span>
                    <span>
                      {t.metaLine.confidence(
                        t.confidence[leadSignal.confidence.overall]
                      )}
                    </span>
                    <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">
                      ·
                    </span>
                    <span>{t.signalStatus[leadSignal.status]}</span>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() => onOpenSignal(leadSignal.signal_id)}
                      className="group inline-flex items-center gap-2 rounded-[var(--ws-radius-sm)] bg-[var(--ws-ink)] px-5 py-2.5 text-[13px] font-semibold text-[var(--ws-surface)] hover:bg-[var(--ws-editorial-accent)] hover:text-white transition-colors cursor-pointer"
                    >
                      <span>{t.briefing.readDossier}</span>
                      <ArrowRight className="h-3.5 w-3.5 motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Expressive Full-Visibility Cover Plate / Verified Media Showcase */}
              <div className="xl:col-span-7 group">
                <StoryVisual
                  signal={leadSignal}
                  lang={lang}
                  context="hero"
                  variant="cover"
                  tone="light"
                  plateNumber="01"
                />
              </div>
            </div>

            {/* Poised Verification & Chronology Band (Compact, Grounded, Visible Above Fold) */}
            {leadStats &&
              (() => {
                const milestones = selectRepresentativeMilestones(
                  leadStats.timelinePoints
                );
                const milestoneColsClass =
                  milestones.length <= 1
                    ? 'grid-cols-1'
                    : milestones.length === 2
                      ? 'grid-cols-1 sm:grid-cols-2'
                      : 'grid-cols-1 sm:grid-cols-3';

                return (
                  <div className="border-t border-b border-[var(--ws-border)] bg-[var(--ws-surface-tint)]/75 px-4 py-3.5 sm:px-5 grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                    <div className="md:col-span-4 md:border-r md:border-[var(--ws-border)] md:pr-5 space-y-1.5">
                      <div className="ws-kicker text-[var(--ws-ink-muted)] text-[10.5px]">
                        {lang === 'zh-CN' ? '核查溯源摘要' : 'Verification Dossier'}
                      </div>
                      <dl className="grid grid-cols-3 gap-2 ws-meta">
                        <div>
                          <dt className="text-[11px] text-[var(--ws-ink-muted)]">
                            {t.briefing.artworkOriginsLabel}
                          </dt>
                          <dd className="mt-0.5 font-mono-tabular text-[15px] font-semibold text-[var(--ws-ink)]">
                            {leadStats.independentOriginsCount}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[11px] text-[var(--ws-ink-muted)]">
                            {t.briefing.artworkClaimsLabel}
                          </dt>
                          <dd className="mt-0.5 font-mono-tabular text-[15px] font-semibold text-[var(--ws-ink)]">
                            {leadStats.claimsCount}
                            {leadStats.confirmedClaimsCount > 0 && (
                              <span className="ml-1 text-[11px] font-medium text-[var(--ws-good)]">
                                ({leadStats.confirmedClaimsCount})
                              </span>
                            )}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[11px] text-[var(--ws-ink-muted)]">
                            {t.briefing.artworkSourcesLabel}
                          </dt>
                          <dd className="mt-0.5 font-mono-tabular text-[15px] font-semibold text-[var(--ws-ink)]">
                            {leadStats.sourcesCount}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div className="md:col-span-8 space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--ws-ink-muted)]">
                        <span className="ws-kicker text-[var(--ws-ink-secondary)] text-[10.5px]">
                          {lang === 'zh-CN'
                            ? '真实世界关键节点'
                            : 'Verified Real-World Chronology'}
                        </span>
                        {leadStats.timelineSpanLabel && (
                          <span className="font-mono-tabular text-[11px]">
                            {leadStats.timelineSpanLabel}
                          </span>
                        )}
                      </div>
                      {milestones.length > 0 ? (
                        <ol className={`grid ${milestoneColsClass} gap-4`}>
                          {milestones.map((pt, idx) => (
                            <li
                              key={`${pt.dateLabel}-${idx}`}
                              className="space-y-0.5"
                            >
                              <div className="font-mono-tabular text-[11px] font-semibold text-[var(--ws-editorial-accent)]">
                                {pt.dateLabel}
                              </div>
                              <div
                                className={`text-[12.5px] leading-[1.52] text-[var(--ws-ink-secondary)] ${
                                  milestones.length === 1
                                    ? 'max-w-[70ch]'
                                    : 'line-clamp-2'
                                }`}
                              >
                                {pt.summary}
                              </div>
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <div className="text-[12.5px] text-[var(--ws-ink-muted)]">
                          {leadSignal.event.geography.join(' · ') ||
                            leadSignal.signal_id}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
          </article>

          {/* RIGHT 3-COLUMN FRONT-PAGE DISPATCH RAIL (#02, #03, #04 Above the Fold) */}
          {frontPageRail.length > 0 && (
            <aside
              aria-label={lang === 'zh-CN' ? '本期要闻导读' : 'In this edition'}
              className="lg:col-span-3 lg:border-l lg:border-[var(--ws-border-strong)] lg:pl-7 space-y-4"
            >
              <div className="flex items-baseline justify-between gap-2 border-b-[2px] border-b-[var(--ws-ink)] pb-2">
                <span className="ws-kicker text-[var(--ws-ink)]">
                  {lang === 'zh-CN' ? '本期要闻 · 02–04' : 'In This Edition · 02–04'}
                </span>
                <button
                  type="button"
                  onClick={() => onSwitchView('expanded')}
                  className="text-[11.5px] font-semibold text-[var(--ws-editorial-accent)] hover:underline underline-offset-4 cursor-pointer whitespace-nowrap"
                >
                  {lang === 'zh-CN' ? '全部档案 →' : 'All →'}
                </button>
              </div>

              <div className="divide-y divide-[var(--ws-border)]">
                {frontPageRail.map((signal, idx) => {
                  const rankLabel = String(idx + 2).padStart(2, '0');
                  return (
                    <article
                      key={signal.signal_id}
                      className={`group space-y-2 ${
                        idx === 0 ? 'pb-4' : 'py-4'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="ws-editorial-numeral text-[21px] text-[var(--ws-ink-muted)]">
                            {rankLabel}
                          </span>
                          <span
                            className="ws-kicker text-[10.5px]"
                            style={{ color: getDomainColor(signal.domain) }}
                          >
                            {t.domains[signal.domain]}
                          </span>
                        </div>
                        <span className="font-mono-tabular text-[11px] font-semibold text-[var(--ws-ink-muted)]">
                          {signal.importance}/5
                        </span>
                      </div>

                      <h2 className="font-display text-[16.5px] font-semibold leading-[1.32] tracking-[-0.014em] text-[var(--ws-ink)]">
                        <button
                          type="button"
                          onClick={() => onOpenSignal(signal.signal_id)}
                          className="text-left ws-headline-link group-hover:text-[var(--ws-world)] cursor-pointer"
                        >
                          {signal.headline}
                        </button>
                      </h2>

                      <p className="text-[12.5px] leading-[1.6] text-[var(--ws-ink-secondary)] line-clamp-2">
                        {getSignalExcerpt(signal, 105)}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5 ws-meta text-[11px] text-[var(--ws-ink-muted)]">
                        <span>
                          {t.metaLine.origins(signal.independentOriginCount)} ·{' '}
                          {t.confidence[signal.confidence.overall]}
                        </span>
                        <button
                          type="button"
                          onClick={() => onOpenSignal(signal.signal_id)}
                          className="inline-flex items-center gap-1 font-semibold text-[var(--ws-ink)] hover:text-[var(--ws-editorial-accent)] transition-colors cursor-pointer"
                        >
                          <span>{lang === 'zh-CN' ? '研读' : 'Read'}</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </aside>
          )}
        </section>
      )}

      {/* =====================================================================
          TONAL EXECUTIVE SUMMARY SPREAD (Editorial Prose + FT Domain Ribbon)
         ===================================================================== */}
      <section
        aria-label={t.briefing.executiveSummaryTitle}
        className="ws-folio-spread px-6 py-7 sm:px-9 sm:py-9 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start"
      >
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--ws-border-strong)] pb-3">
            <div className="space-y-1">
              <div className="ws-kicker text-[var(--ws-editorial-accent)]">
                {t.briefing.coverEditionDeskLabel}
              </div>
              <h2 className="font-display text-[25px] sm:text-[30px] font-semibold tracking-[-0.02em] text-[var(--ws-ink)]">
                {t.briefing.executiveSummaryTitle}
              </h2>
            </div>
            <span className="font-mono-tabular text-[12px] text-[var(--ws-ink-muted)]">
              {frontmatter.edition_date}
            </span>
          </div>

          {summaryMarkdown && (
            <div className="space-y-3.5">
              <SafeMarkdown
                content={
                  summaryExpanded || !summaryPreview.isTruncated
                    ? summaryMarkdown
                    : summaryPreview.preview
                }
                className={
                  lang !== 'zh-CN' &&
                  /^[A-Za-z]/.test(summaryMarkdown.replace(/^[*_>#\s]+/, ''))
                    ? 'ws-prose ws-dropcap'
                    : 'ws-prose'
                }
              />
              {summaryPreview.isTruncated && (
                <button
                  type="button"
                  onClick={() => setSummaryExpanded((prev) => !prev)}
                  aria-expanded={summaryExpanded}
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--ws-world)] hover:underline underline-offset-4 cursor-pointer"
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

        <div className="lg:col-span-5 lg:border-l lg:border-[var(--ws-border-strong)] lg:pl-9 space-y-6">
          {/* FT Visual Vocabulary Domain Composition Ribbon */}
          <div className="space-y-3">
            <div className="flex items-baseline justify-between gap-2">
              <span className="ws-kicker text-[var(--ws-ink)]">
                {t.briefing.domainBalanceTitle}
              </span>
              <span className="ws-meta text-[12px] font-semibold text-[var(--ws-ink-muted)]">
                {t.masthead.signalsCount(signals.length)}
              </span>
            </div>

            <div
              className="flex h-3 w-full overflow-hidden rounded-[2px] bg-[var(--ws-border-subtle)] gap-[2px]"
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

            <div className="divide-y divide-[var(--ws-border)] border-t border-[var(--ws-border)]">
              {domainProfiles.map((item) => (
                <button
                  key={item.domain}
                  type="button"
                  onClick={() => onExploreDomain(item.domain)}
                  className="w-full py-2.5 flex items-center justify-between gap-3 text-left text-[12.5px] group cursor-pointer"
                >
                  <span className="inline-flex items-center gap-2 min-w-0">
                    <span
                      className="h-2.5 w-2.5 rounded-[1px] shrink-0"
                      style={{ backgroundColor: getDomainColor(item.domain) }}
                    />
                    <span className="font-semibold text-[var(--ws-ink)] group-hover:underline underline-offset-4 truncate">
                      {t.domains[item.domain]}
                    </span>
                  </span>
                  <span className="flex items-center gap-3 ws-meta shrink-0">
                    <span className="text-[11.5px] text-[var(--ws-ink-muted)]">
                      5/5: {item.imp5Count}
                    </span>
                    <span className="font-mono-tabular font-semibold text-[var(--ws-ink)] w-8 text-right">
                      {item.total}
                    </span>
                    <span className="font-mono-tabular text-[11.5px] text-[var(--ws-ink-muted)] w-10 text-right">
                      {item.sharePct}%
                    </span>
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
                    className="inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--ws-warn)] hover:underline cursor-pointer shrink-0"
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
          CURATED SECONDARY HIERARCHY (Feature Plate #05 + Numbered Index #06–10)
         ===================================================================== */}
      {(featuredDispatch || remainingPriority.length > 0) && (
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

          {/* Rank #05 — Asymmetric Featured Analysis Spread (Anti-Repetition Guaranteed) */}
          {featuredDispatch && (
            <article className="grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-10 pb-8 border-b border-[var(--ws-border)] items-center">
              <div className="lg:col-span-5 group">
                <StoryVisual
                  signal={featuredDispatch}
                  lang={lang}
                  context="secondary"
                  excludeAssetIds={visualAllocation.secondaryExclude}
                  excludeMediaUrls={visualAllocation.secondaryMediaExclude}
                  variant="feature"
                  plateNumber={featuredDispatchRank}
                />
              </div>

              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="ws-editorial-numeral text-[34px] text-[var(--ws-ink-faint)]">
                    {featuredDispatchRank}
                  </span>
                  <span
                    className="ws-kicker"
                    style={{ color: getDomainColor(featuredDispatch.domain) }}
                  >
                    {t.domains[featuredDispatch.domain]}
                  </span>
                  <span className="font-mono-tabular text-[12px] text-[var(--ws-ink-muted)] ml-auto">
                    {featuredDispatch.signal_id}
                  </span>
                </div>

                <h3 className="ws-headline-feature text-[var(--ws-ink)]">
                  <button
                    type="button"
                    onClick={() => onOpenSignal(featuredDispatch.signal_id)}
                    className="text-left ws-headline-link hover:text-[var(--ws-world)] cursor-pointer"
                  >
                    {featuredDispatch.headline}
                  </button>
                </h3>

                <p className="ws-deck max-w-[60ch]">
                  {getSignalExcerpt(featuredDispatch, 195)}
                </p>

                <div className="pt-1 flex flex-wrap items-center justify-between gap-4">
                  <SignalMetaLine
                    signal={featuredDispatch}
                    lang={lang}
                    showClaims
                  />
                  <button
                    type="button"
                    onClick={() => onOpenSignal(featuredDispatch.signal_id)}
                    className="group inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[var(--ws-ink)] hover:text-[var(--ws-editorial-accent)] transition-colors cursor-pointer"
                  >
                    <span>{t.briefing.readDossier}</span>
                    <ArrowRight className="h-3.5 w-3.5 motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
            </article>
          )}

          {/* Ranks #06–#10 — Numbered Broadsheet Dispatch Index */}
          {remainingPriority.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-9 gap-y-6">
              {remainingPriority.map((signal, idx) => {
                const rankLabel = String(idx + 6).padStart(2, '0');
                return (
                  <article
                    key={signal.signal_id}
                    className="group border-b border-[var(--ws-border)] pb-5 space-y-2.5"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex items-baseline gap-2.5">
                        <span className="ws-editorial-numeral text-[26px] text-[var(--ws-ink-faint)]">
                          {rankLabel}
                        </span>
                        <span
                          className="ws-kicker"
                          style={{ color: getDomainColor(signal.domain) }}
                        >
                          {t.domains[signal.domain]}
                        </span>
                      </div>
                      <span className="ws-meta text-[11.5px] font-semibold text-[var(--ws-ink-muted)]">
                        {signal.importance}/5 ·{' '}
                        {t.confidence[signal.confidence.overall]}
                      </span>
                    </div>
                    <h3 className="font-display text-[17.5px] font-semibold leading-[1.34] text-[var(--ws-ink)]">
                      <button
                        type="button"
                        onClick={() => onOpenSignal(signal.signal_id)}
                        className="text-left ws-headline-link group-hover:text-[var(--ws-world)] cursor-pointer"
                      >
                        {signal.headline}
                      </button>
                    </h3>
                    <p className="text-[13px] leading-[1.62] text-[var(--ws-ink-secondary)] line-clamp-2">
                      {getSignalExcerpt(signal, 110)}
                    </p>
                    <div className="ws-meta text-[11.5px] text-[var(--ws-ink-muted)]">
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
          THREE UNMISTAKABLY DISTINCT EDITORIAL DESKS
         ===================================================================== */}
      <section aria-label={t.briefing.domainsOverviewTitle} className="space-y-10">
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
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--ws-ink-secondary)] hover:text-[var(--ws-ink)] cursor-pointer"
            >
              <GitCompareArrows className="h-4 w-4 text-[var(--ws-editorial-accent)]" />
              <span>{t.editionCompare.triggerButton}</span>
            </button>
          )}
        </div>

        {/* DESK I — WORLD EVENTS: Crisp Warm-Ivory Foreign Affairs Broadsheet */}
        {worldProfile && (
          <div
            data-testid="desk-world-events"
            className="ws-desk-world p-6 sm:p-8 lg:p-9 space-y-7"
          >
            {/* Distinct Desk I Header with Oversized Watermark Numeral */}
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--ws-border)] pb-4">
              <div className="flex items-end gap-4">
                <span
                  aria-hidden="true"
                  className="ws-editorial-numeral text-[44px] sm:text-[54px] text-[var(--ws-world)]/42 select-none"
                >
                  01
                </span>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <DomainEditorialEmblem domain="world" className="h-4 w-4" />
                    <span
                      className="ws-kicker"
                      style={{ color: 'var(--ws-world)' }}
                    >
                      {lang === 'zh-CN'
                        ? '外交与地缘政治部'
                        : 'Foreign Affairs Desk'}
                    </span>
                  </div>
                  <h3 className="font-display text-[26px] sm:text-[32px] font-semibold tracking-[-0.02em] text-[var(--ws-ink)] leading-none">
                    {t.domains.world}
                  </h3>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <div className="ws-meta text-[12.5px] text-[var(--ws-ink-muted)]">
                  <span className="font-semibold text-[var(--ws-ink)]">
                    {worldProfile.total}
                  </span>{' '}
                  · {t.briefing.domainShareLabel(worldProfile.sharePct)} · 5/5:{' '}
                  {worldProfile.imp5Count} · 4/5: {worldProfile.imp4Count}
                </div>
                <button
                  type="button"
                  onClick={() => onExploreDomain('world')}
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold hover:underline underline-offset-4 cursor-pointer"
                  style={{ color: 'var(--ws-world)' }}
                >
                  <span>
                    {t.briefing.exploreDomain} ({worldProfile.total})
                  </span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Row 1: Panoramic Urban Skyline (Clean Top-Cropped 21:8) Above Split Foreign Feature */}
            <div className="space-y-6">
              <div className="group">
                <InterfacePhotoPlate
                  photo={getInterfacePhoto('world-city-aerial')}
                  lang={lang}
                  aspect="21/8"
                  objectPositionOverride="50% 0%"
                  compact
                  plateLabel={
                    lang === 'zh-CN' ? '国际部 · 都市天际线' : 'DESK I · METROPOLITAN CONTEXT'
                  }
                />
              </div>

              {visualAllocation.worldDeskSignal && (
                <article className="border-t border-[var(--ws-border)] pt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-baseline">
                  <div className="lg:col-span-7 space-y-3">
                    <div className="flex items-center gap-3 ws-meta text-[12px] text-[var(--ws-ink-muted)]">
                      <span className="font-semibold text-[var(--ws-world)]">
                        {visualAllocation.worldDeskSignal.topic}
                      </span>
                      <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">
                        ·
                      </span>
                      <span className="font-mono-tabular font-semibold text-[var(--ws-ink)]">
                        {t.metaLine.importance(
                          visualAllocation.worldDeskSignal.importance
                        )}
                      </span>
                    </div>
                    <h4 className="ws-headline-feature text-[var(--ws-ink)]">
                      <button
                        type="button"
                        onClick={() =>
                          onOpenSignal(
                            visualAllocation.worldDeskSignal!.signal_id
                          )
                        }
                        className="text-left ws-headline-link hover:text-[var(--ws-world)] cursor-pointer"
                      >
                        {visualAllocation.worldDeskSignal.headline}
                      </button>
                    </h4>
                  </div>

                  <div className="lg:col-span-5 space-y-3.5">
                    <p className="text-[14.5px] leading-[1.74] text-[var(--ws-ink-secondary)]">
                      {getSignalExcerpt(visualAllocation.worldDeskSignal, 190)}
                    </p>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <SignalMetaLine
                        signal={visualAllocation.worldDeskSignal}
                        lang={lang}
                        compact
                      />
                      <button
                        type="button"
                        onClick={() =>
                          onOpenSignal(
                            visualAllocation.worldDeskSignal!.signal_id
                          )
                        }
                        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--ws-ink)] hover:text-[var(--ws-world)] transition-colors cursor-pointer"
                      >
                        <span>{t.briefing.readDossier}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </article>
              )}
            </div>

            {/* Row 2: Maritime Freight Corridor Plate + 2-Column Foreign Correspondent Ledger */}
            <div className="border-t border-[var(--ws-border)] pt-6 grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-10 items-start">
              <div className="lg:col-span-4 group">
                <InterfacePhotoPlate
                  photo={getInterfacePhoto('world-maritime-port')}
                  lang={lang}
                  aspect="16/10"
                  compact
                  plateLabel={
                    lang === 'zh-CN' ? '航运贸易 · 港口语境' : 'DESK I · MARITIME CORRIDOR'
                  }
                />
              </div>

              <div className="lg:col-span-8 lg:border-l lg:border-[var(--ws-border)] lg:pl-8 grid grid-cols-1 sm:grid-cols-2 gap-x-7 gap-y-5">
                {worldDispatches.map((sig) => (
                  <article
                    key={sig.signal_id}
                    className="group border-b border-[var(--ws-border-subtle)] pb-4 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2 ws-meta text-[11.5px] text-[var(--ws-ink-muted)]">
                      <span className="truncate">{sig.topic}</span>
                      <span className="shrink-0 font-mono-tabular font-semibold text-[var(--ws-world)]">
                        {sig.importance}/5
                      </span>
                    </div>
                    <h4 className="font-display text-[17px] font-semibold leading-snug text-[var(--ws-ink)]">
                      <button
                        type="button"
                        onClick={() => onOpenSignal(sig.signal_id)}
                        className="text-left ws-headline-link group-hover:text-[var(--ws-world)] cursor-pointer"
                      >
                        {sig.headline}
                      </button>
                    </h4>
                    <p className="text-[13px] leading-relaxed text-[var(--ws-ink-secondary)] line-clamp-2">
                      {getSignalExcerpt(sig, 110)}
                    </p>
                    <div className="ws-meta text-[11.5px] text-[var(--ws-ink-muted)]">
                      {t.metaLine.origins(sig.independentOriginCount)} ·{' '}
                      {t.confidence[sig.confidence.overall]}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* DESK II — AI FRONTIER: Nocturnal Obsidian Technical Monograph */}
        {aiProfile && (
          <div
            data-testid="desk-ai-frontier"
            className="ws-desk-ai-plate p-6 sm:p-8 lg:p-9 space-y-7"
          >
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--ws-plate-border)] pb-4">
              <div className="flex items-end gap-4">
                <span
                  aria-hidden="true"
                  className="ws-editorial-numeral text-[44px] sm:text-[54px] text-[#cbb4ff]/52 select-none"
                >
                  02
                </span>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <DomainEditorialEmblem
                      domain="ai"
                      className="h-4 w-4 text-[#cbb4ff]"
                    />
                    <span className="ws-kicker text-[#cbb4ff]">
                      {lang === 'zh-CN'
                        ? '前沿计算与模型实验室'
                        : 'Frontier Compute & Systems Monograph'}
                    </span>
                  </div>
                  <h3 className="font-display text-[26px] sm:text-[32px] font-semibold tracking-[-0.02em] text-[var(--ws-plate-ink)] leading-none">
                    {t.domains.ai}
                  </h3>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <div className="ws-meta text-[12.5px] text-[var(--ws-plate-muted)]">
                  <span className="font-semibold text-[var(--ws-plate-ink)]">
                    {aiProfile.total}
                  </span>{' '}
                  · {t.briefing.domainShareLabel(aiProfile.sharePct)} · 5/5:{' '}
                  {aiProfile.imp5Count} · 4/5: {aiProfile.imp4Count}
                </div>
                <button
                  type="button"
                  onClick={() => onExploreDomain('ai')}
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#cbb4ff] hover:text-white hover:underline underline-offset-4 cursor-pointer"
                >
                  <span>
                    {t.briefing.exploreDomain} ({aiProfile.total})
                  </span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-10 items-start">
              {/* Left 4 cols: Portrait Vertical Server-Rack Instrumentation Spine */}
              <div className="lg:col-span-4 group">
                <InterfacePhotoPlate
                  photo={getInterfacePhoto('ai-data-center')}
                  lang={lang}
                  aspect="3/4"
                  tone="dark"
                  compact
                  plateLabel={
                    lang === 'zh-CN' ? '算力机柜 · 语境 I' : 'DESK II · INFRASTRUCTURE'
                  }
                />
              </div>

              {/* Right 8 cols: Featured AI Dispatch + Macro Silicon Wafer Detail + Dispatch Ledger */}
              <div className="lg:col-span-8 lg:border-l lg:border-[var(--ws-plate-border)] lg:pl-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start border-b border-[var(--ws-plate-border)] pb-6">
                  {visualAllocation.aiDeskSignal && (
                    <article className="md:col-span-7 space-y-3.5">
                      <div className="flex items-center justify-between gap-2 ws-meta text-[12px]">
                        <span className="font-semibold text-[#cbb4ff]">
                          {visualAllocation.aiDeskSignal.topic}
                        </span>
                        <span className="font-mono-tabular text-[var(--ws-plate-muted)]">
                          {t.metaLine.importance(
                            visualAllocation.aiDeskSignal.importance
                          )}
                        </span>
                      </div>
                      <h4 className="font-display text-[22px] sm:text-[26px] font-semibold leading-[1.24] tracking-[-0.016em] text-[var(--ws-plate-ink)]">
                        <button
                          type="button"
                          onClick={() =>
                            onOpenSignal(
                              visualAllocation.aiDeskSignal!.signal_id
                            )
                          }
                          className="text-left ws-headline-link hover:text-[#cbb4ff] cursor-pointer"
                        >
                          {visualAllocation.aiDeskSignal.headline}
                        </button>
                      </h4>
                      <p className="text-[14px] leading-[1.74] text-[var(--ws-plate-secondary)]">
                        {getSignalExcerpt(visualAllocation.aiDeskSignal, 185)}
                      </p>
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <span className="ws-meta text-[12px] text-[var(--ws-plate-muted)]">
                          {t.metaLine.origins(
                            visualAllocation.aiDeskSignal.independentOriginCount
                          )}{' '}
                          ·{' '}
                          {t.confidence[
                            visualAllocation.aiDeskSignal.confidence.overall
                          ]}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            onOpenSignal(
                              visualAllocation.aiDeskSignal!.signal_id
                            )
                          }
                          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--ws-plate-ink)] hover:text-[#cbb4ff] transition-colors cursor-pointer"
                        >
                          <span>{t.briefing.readDossier}</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </article>
                  )}

                  {/* Macro Silicon Wafer Plate (4:3 technical crop) */}
                  <div className="md:col-span-5 group">
                    <InterfacePhotoPlate
                      photo={getInterfacePhoto('ai-silicon-wafer')}
                      lang={lang}
                      aspect="4/3"
                      tone="dark"
                      compact
                      plateLabel={
                        lang === 'zh-CN' ? '晶圆微距 · 语境 II' : 'DESK II · SILICON MACRO'
                      }
                    />
                  </div>
                </div>

                {aiDispatches.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-7 gap-y-5">
                    {aiDispatches.map((sig) => (
                      <article
                        key={sig.signal_id}
                        className="group space-y-1.5 border-b border-[var(--ws-plate-border)] pb-4"
                      >
                        <div className="flex items-center justify-between gap-2 ws-meta text-[11.5px] text-[var(--ws-plate-muted)]">
                          <span className="truncate">{sig.topic}</span>
                          <span className="font-mono-tabular font-semibold text-[#cbb4ff] shrink-0">
                            {sig.importance}/5
                          </span>
                        </div>
                        <h4 className="font-display text-[16.5px] font-semibold leading-snug text-[var(--ws-plate-ink)]">
                          <button
                            type="button"
                            onClick={() => onOpenSignal(sig.signal_id)}
                            className="text-left ws-headline-link group-hover:text-[#cbb4ff] cursor-pointer"
                          >
                            {sig.headline}
                          </button>
                        </h4>
                        <div className="ws-meta text-[11.5px] text-[var(--ws-plate-muted)]">
                          {t.metaLine.origins(sig.independentOriginCount)} ·{' '}
                          {t.confidence[sig.confidence.overall]}
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* DESK III — ECONOMIC OUTLOOK: FT-Inspired Warm Parchment-Salmon Financial Folio */}
        {econProfile && (
          <div
            data-testid="desk-economic-outlook"
            className="ws-desk-economy p-6 sm:p-8 lg:p-9 space-y-7"
          >
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--ws-border-strong)] pb-4">
              <div className="flex items-end gap-4">
                <span
                  aria-hidden="true"
                  className="ws-editorial-numeral text-[44px] sm:text-[54px] text-[var(--ws-economy)]/44 select-none"
                >
                  03
                </span>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <DomainEditorialEmblem domain="economy" className="h-4 w-4" />
                    <span
                      className="ws-kicker"
                      style={{ color: 'var(--ws-economy)' }}
                    >
                      {lang === 'zh-CN'
                        ? '宏观经济与资本市场专刊'
                        : 'Markets & Macro Policy Folio'}
                    </span>
                  </div>
                  <h3 className="font-display text-[26px] sm:text-[32px] font-semibold tracking-[-0.02em] text-[var(--ws-ink)] leading-none">
                    {t.domains.economy}
                  </h3>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <div className="ws-meta text-[12.5px] text-[var(--ws-ink-muted)]">
                  <span className="font-semibold text-[var(--ws-ink)]">
                    {econProfile.total}
                  </span>{' '}
                  · {t.briefing.domainShareLabel(econProfile.sharePct)} · 5/5:{' '}
                  {econProfile.imp5Count} · 4/5: {econProfile.imp4Count}
                </div>
                <button
                  type="button"
                  onClick={() => onExploreDomain('economy')}
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold hover:underline underline-offset-4 cursor-pointer"
                  style={{ color: 'var(--ws-economy)' }}
                >
                  <span>
                    {t.briefing.exploreDomain} ({econProfile.total})
                  </span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Full-Width Spanning FT-Style Macro Lead Headline */}
            {visualAllocation.econDeskSignal && (
              <article className="border-b border-[var(--ws-border-strong)] pb-6 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 ws-meta text-[12px]">
                  <span className="font-semibold text-[var(--ws-economy)]">
                    {visualAllocation.econDeskSignal.topic}
                  </span>
                  <span className="font-mono-tabular font-semibold text-[var(--ws-ink-muted)]">
                    {t.metaLine.importance(
                      visualAllocation.econDeskSignal.importance
                    )}{' '}
                    ·{' '}
                    {t.confidence[
                      visualAllocation.econDeskSignal.confidence.overall
                    ]}
                  </span>
                </div>
                <h4 className="ws-headline-feature text-[var(--ws-ink)] max-w-[36ch]">
                  <button
                    type="button"
                    onClick={() =>
                      onOpenSignal(visualAllocation.econDeskSignal!.signal_id)
                    }
                    className="text-left ws-headline-link hover:text-[var(--ws-economy)] cursor-pointer"
                  >
                    {visualAllocation.econDeskSignal.headline}
                  </button>
                </h4>
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <p className="text-[14.5px] leading-[1.74] text-[var(--ws-ink-secondary)] max-w-[70ch]">
                    {getSignalExcerpt(visualAllocation.econDeskSignal, 220)}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      onOpenSignal(visualAllocation.econDeskSignal!.signal_id)
                    }
                    className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--ws-ink)] hover:text-[var(--ws-economy)] transition-colors cursor-pointer shrink-0"
                  >
                    <span>{t.briefing.readDossier}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </article>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-10 items-start">
              {/* Left 8 cols: 2-Column Analytical Markets Ledger */}
              <div className="lg:col-span-8 order-2 lg:order-1">
                {econDispatches.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                    {econDispatches.map((sig, idx) => (
                      <article
                        key={sig.signal_id}
                        className="group border-b border-[var(--ws-border)] pb-4 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2 ws-meta text-[11.5px] text-[var(--ws-ink-muted)]">
                          <span className="inline-flex items-center gap-2 truncate">
                            <span className="font-mono-tabular font-semibold text-[var(--ws-economy)]/70">
                              {String(idx + 1).padStart(2, '0')}
                            </span>
                            <span className="truncate">{sig.topic}</span>
                          </span>
                          <span className="font-mono-tabular font-semibold text-[var(--ws-economy)] shrink-0">
                            {sig.importance}/5
                          </span>
                        </div>
                        <h4 className="font-display text-[17px] font-semibold leading-snug text-[var(--ws-ink)]">
                          <button
                            type="button"
                            onClick={() => onOpenSignal(sig.signal_id)}
                            className="text-left ws-headline-link group-hover:text-[var(--ws-economy)] cursor-pointer"
                          >
                            {sig.headline}
                          </button>
                        </h4>
                        <p className="text-[13px] leading-relaxed text-[var(--ws-ink-secondary)] line-clamp-2">
                          {getSignalExcerpt(sig, 115)}
                        </p>
                        <div className="ws-meta text-[11.5px] text-[var(--ws-ink-muted)]">
                          {t.metaLine.origins(sig.independentOriginCount)} ·{' '}
                          {t.confidence[sig.confidence.overall]}
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>

              {/* Right 4 cols: Portrait Classical Institutional Architecture Plate */}
              <div className="lg:col-span-4 lg:border-l lg:border-[var(--ws-border-strong)] lg:pl-8 group order-1 lg:order-2">
                <InterfacePhotoPlate
                  photo={getInterfacePhoto('economy-stock-exchange')}
                  lang={lang}
                  aspect="3/4"
                  compact
                  plateLabel={
                    lang === 'zh-CN' ? '金融建筑 · 语境 I' : 'DESK III · INSTITUTIONAL'
                  }
                />
              </div>
            </div>
          </div>
        )}
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
            <div className="ws-kicker text-[var(--ws-plate-accent)]">
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
            className="text-left group space-y-2.5 border-t border-[var(--ws-plate-border)] pt-4 hover:border-[var(--ws-plate-accent)] transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between text-[var(--ws-plate-ink)]">
              <span className="inline-flex items-center gap-2.5 font-display text-[20px] font-semibold">
                <span className="font-mono-tabular text-[12px] text-[var(--ws-plate-muted)]">
                  01
                </span>
                <FileSearch className="h-4.5 w-4.5 text-[var(--ws-plate-accent)]" />
                {t.nav.expanded}
              </span>
              <ArrowRight className="h-4 w-4 text-[var(--ws-plate-muted)] motion-safe:transition-transform motion-safe:group-hover:translate-x-1" />
            </div>
            <p className="text-[13.5px] leading-relaxed text-[var(--ws-plate-secondary)]">
              {t.briefing.openExpandedDesc}
            </p>
          </button>

          <button
            type="button"
            onClick={() => onSwitchView('synthesis')}
            className="text-left group space-y-2.5 border-t border-[var(--ws-plate-border)] pt-4 hover:border-[var(--ws-plate-accent)] transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between text-[var(--ws-plate-ink)]">
              <span className="inline-flex items-center gap-2.5 font-display text-[20px] font-semibold">
                <span className="font-mono-tabular text-[12px] text-[var(--ws-plate-muted)]">
                  02
                </span>
                <Network className="h-4.5 w-4.5 text-[var(--ws-plate-accent)]" />
                {t.nav.synthesis}
              </span>
              <ArrowRight className="h-4 w-4 text-[var(--ws-plate-muted)] motion-safe:transition-transform motion-safe:group-hover:translate-x-1" />
            </div>
            <p className="text-[13.5px] leading-relaxed text-[var(--ws-plate-secondary)]">
              {t.briefing.openSynthesisDesc}
            </p>
          </button>

          <button
            type="button"
            onClick={() => onSwitchView('audit')}
            className="text-left group space-y-2.5 border-t border-[var(--ws-plate-border)] pt-4 hover:border-[var(--ws-plate-accent)] transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between text-[var(--ws-plate-ink)]">
              <span className="inline-flex items-center gap-2.5 font-display text-[20px] font-semibold">
                <span className="font-mono-tabular text-[12px] text-[var(--ws-plate-muted)]">
                  03
                </span>
                <ShieldCheck className="h-4.5 w-4.5 text-[var(--ws-plate-accent)]" />
                {t.nav.audit}
              </span>
              <ArrowRight className="h-4 w-4 text-[var(--ws-plate-muted)] motion-safe:transition-transform motion-safe:group-hover:translate-x-1" />
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
