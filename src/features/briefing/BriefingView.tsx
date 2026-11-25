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
  formatEventDateRange,
  formatPublicationTimestamp,
} from '../../lib/dates/formatDates';
import { domainAccentTextClass } from '../../lib/filtering/filterSignals';
import { SignalMetaLine } from '../../components/editorial/SignalMetaLine';
import { SafeMarkdown } from '../../components/editorial/SafeMarkdown';
import {
  DomainEditorialEmblem,
  EditorialSignalArtwork,
} from '../../components/editorial/EditorialSignalArtwork';
import { buildDomainEditionProfiles } from '../../lib/intelligence/visual-metrics/editorialVisualHelpers';
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

  React.useEffect(() => {
    setSummaryExpanded(false);
    setLimitationsExpanded(false);
  }, [edition.frontmatter.edition_date, edition.frontmatter.updated_at]);

  const summarySource =
    edition.executiveBriefing.summaryText || edition.frontmatter.summary;
  const isLongSummary = summarySource.length > 340;

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
  const featureDispatch = secondaryTopEntries[0] ?? null; // Editorial Rank #02
  const deckDispatches = secondaryTopEntries.slice(1); // Editorial Rank #03+

  const topIdSet = React.useMemo(
    () => new Set(orderedTopEntries.map((e) => e.signal.signal_id)),
    [orderedTopEntries]
  );

  const totalClaims = React.useMemo(
    () => edition.signals.reduce((acc, s) => acc + s.claims.length, 0),
    [edition.signals]
  );

  const signalDomainById = React.useMemo(() => {
    const map = new Map<string, SignalDomain>();
    for (const sig of edition.signals) {
      map.set(sig.signal_id, sig.domain);
    }
    return map;
  }, [edition.signals]);

  const domainSummaries = React.useMemo(
    () =>
      buildDomainEditionProfiles(
        edition.signals,
        edition.domainIntros,
        topIdSet
      ),
    [edition.domainIntros, edition.signals, topIdSet]
  );

  const syncLabel =
    t.syncRun[edition.frontmatter.sync_run] ?? edition.frontmatter.sync_run;
  const statusLabel =
    t.editionStatus[edition.frontmatter.edition_status] ??
    edition.frontmatter.edition_status;

  const diagnosticCount =
    edition.validation.errors.length + edition.validation.warnings.length;

  return (
    <div className="space-y-8 sm:space-y-14 lg:space-y-16 pb-16 sm:pb-20">
      {/* 1. Publication Front-Page Masthead & Edition Dateline */}
      <section className="ws-masthead-rule pt-3 pb-3.5 sm:pt-4 sm:pb-4 space-y-2.5 sm:space-y-3">
        {/* Top Dateline & Edition Scope Folio */}
        <div className="flex flex-col gap-1 lg:flex-row lg:items-center lg:justify-between border-b border-[var(--ws-border-subtle)] pb-2 sm:pb-2.5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-[var(--ws-ink-muted)]">
            <span className="font-semibold text-[var(--ws-ink)] tabular-nums">
              {formatEditionDate(edition.frontmatter.edition_date, lang)}
            </span>
            <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">·</span>
            <span>{syncLabel}</span>
            <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">·</span>
            <span>{statusLabel}</span>
            {edition.isLocalPreview && (
              <>
                <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">·</span>
                <span className="font-semibold text-[var(--ws-warn)]">
                  {t.archive.localPreviewActive}
                </span>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono-tabular text-[11.5px] text-[var(--ws-ink-muted)]">
            <span className="font-semibold text-[var(--ws-ink)]">
              {t.masthead.signalsCount(edition.signals.length)}
            </span>
            <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">·</span>
            <span>
              {t.masthead.independentOriginsCount(
                edition.independenceSummary.independentOriginCount
              )}
            </span>
            <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">·</span>
            <span>{t.masthead.claimsCount(totalClaims)}</span>
            <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">·</span>
            <span>
              {t.masthead.recordsCount(edition.independenceSummary.totalRecords)}
            </span>

            {diagnosticCount > 0 && (
              <>
                <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">·</span>
                <button
                  type="button"
                  onClick={() => onSwitchView('audit')}
                  className="inline-flex items-center gap-1 text-[11.5px] text-[var(--ws-warn)] underline decoration-dotted underline-offset-2 hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  <span>
                    {t.masthead.diagnosticsLink(
                      edition.validation.errors.length,
                      edition.validation.warnings.length
                    )}
                  </span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Front-Page Nameplate & Operational Timestamps */}
        <div className="flex flex-col gap-2.5 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
              <span className="ws-kicker text-[var(--ws-editorial-accent)]">
                {t.briefing.mastheadDescriptor}
              </span>
              {edition.frontmatter.coverage_window_start && (
                <span className="font-mono-tabular text-[11.5px] text-[var(--ws-ink-muted)]">
                  {t.masthead.coverageWindowLabel}:{' '}
                  <span className="text-[var(--ws-ink-secondary)]">
                    {formatCoverageWindow(
                      edition.frontmatter.coverage_window_start,
                      edition.frontmatter.coverage_window_end,
                      lang
                    )}
                  </span>
                </span>
              )}
            </div>
            <h1 className="font-display text-[1.35rem] sm:text-[1.7rem] font-semibold leading-tight tracking-[-0.018em] text-[var(--ws-ink)] headline-balance">
              {edition.frontmatter.edition_title}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <span className="font-mono-tabular text-[11.5px] text-[var(--ws-ink-muted)] whitespace-nowrap">
              {t.masthead.updatedLabel}:{' '}
              <span className="text-[var(--ws-ink-secondary)]">
                {formatPublicationTimestamp(edition.frontmatter.updated_at, lang)}
              </span>
            </span>

            {!edition.isLocalPreview && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="inline-flex min-h-[32px] items-center gap-1.5 rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-surface)] px-3 py-1 text-[12px] font-medium text-[var(--ws-ink-secondary)] hover:text-[var(--ws-ink)] hover:border-[var(--ws-border-strong)] hover:bg-[var(--ws-surface-hover)] disabled:opacity-50 transition-colors duration-150 cursor-pointer shrink-0"
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
        </div>
      </section>

      {/* 2. Front-Page Cover Story Spread: Commanding Lead Story (7) + Open Edition Desk Folio (5) */}
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-0 lg:items-start">
        {leadEntry && (
          <article className="lg:col-span-7 lg:border-r lg:border-[var(--ws-border)] lg:pr-10 space-y-5">
            {/* Lead Kicker & Signal Identifier */}
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
              <div className="flex items-center gap-2.5 shrink-0">
                <span
                  aria-hidden="true"
                  className="inline-block h-[2.5px] w-7 bg-[var(--ws-editorial-accent)]"
                />
                <span className="ws-kicker text-[var(--ws-editorial-accent)]">
                  {t.briefing.leadKicker}
                </span>
              </div>
              <span className="font-mono-tabular text-[11.5px] text-[var(--ws-ink-faint)]">
                {leadEntry.signal.signal_id}
              </span>
            </div>

            {/* Monumental Cover Headline + Clean Provenance Metadata */}
            <div className="space-y-3">
              <h2 className="font-display ws-headline-cover text-[1.95rem] sm:text-[2.45rem] lg:text-[2.85rem] font-semibold text-[var(--ws-ink)] headline-balance">
                <button
                  type="button"
                  onClick={() => onOpenSignal(leadEntry.signal.signal_id)}
                  className="text-left hover:underline decoration-[var(--ws-border-strong)] decoration-[1.5px] underline-offset-[6px] cursor-pointer"
                >
                  {leadEntry.signal.headline}
                </button>
              </h2>
              <SignalMetaLine signal={leadEntry.signal} lang={lang} showClaims />
            </div>

            {/* Cover Editorial Deck — Above Artwork for Immediate 5-Second Comprehension */}
            <div className="max-w-[64ch] ws-prose text-[15.5px] sm:text-[16px]">
              <SafeMarkdown
                content={leadEntry.editorialSummary}
                onSelectSignal={onOpenSignal}
              />
            </div>

            {/* Bespoke Art-Directed Full-Canvas Editorial Visual Plate */}
            <EditorialSignalArtwork
              signal={leadEntry.signal}
              lang={lang}
              signalDomainById={signalDomainById}
            />

            {leadEntry.signal.confidence.rationale && (
              <div className="max-w-[64ch] ws-folio-note px-4 py-3">
                <p className="text-[12.5px] leading-relaxed text-[var(--ws-ink-muted)]">
                  <span className="font-semibold text-[var(--ws-ink-secondary)]">
                    {t.expanded.confidenceRationaleTitle}:{' '}
                  </span>
                  {leadEntry.signal.confidence.rationale}
                </p>
              </div>
            )}

            <div className="pt-0.5">
              <button
                type="button"
                onClick={() => onOpenSignal(leadEntry.signal.signal_id)}
                className="group inline-flex min-h-[40px] items-center gap-2.5 text-[14px] font-semibold text-[var(--ws-ink)] hover:text-[var(--ws-editorial-accent)] transition-colors duration-150 cursor-pointer"
              >
                <span className="border-b-[1.5px] border-[var(--ws-rule-editorial)] pb-0.5 group-hover:border-[var(--ws-editorial-accent)] transition-colors duration-150">
                  {t.briefing.readDossier}
                </span>
                <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
              </button>
            </div>
          </article>
        )}

        {/* Right Folio Column: Open Broadsheet Edition Desk Executive Summary & Caveats */}
        <aside
          className={`${
            leadEntry ? 'lg:col-span-5 lg:pl-10' : 'lg:col-span-12'
          } space-y-6`}
        >
          <div className="ws-folio-panel px-5 py-5 sm:px-6 sm:py-6 space-y-4">
            <div className="flex items-baseline justify-between gap-2 border-b border-[var(--ws-border-subtle)] pb-3">
              <div className="space-y-0.5">
                <div className="ws-kicker text-[var(--ws-ink-faint)]">
                  {t.briefing.coverEditionDeskLabel}
                </div>
                <h2 className="font-display text-[1.22rem] font-semibold text-[var(--ws-ink)]">
                  {t.briefing.executiveSummaryTitle}
                </h2>
              </div>
              <span className="font-mono-tabular text-[11.5px] text-[var(--ws-ink-muted)]">
                {edition.frontmatter.edition_date}
              </span>
            </div>

            <div className={`ws-prose ${!summaryExpanded && isLongSummary ? 'line-clamp-8' : ''}`}>
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
                className="text-[12.5px] font-semibold text-[var(--ws-world)] hover:underline underline-offset-4 cursor-pointer"
              >
                {summaryExpanded ? t.briefing.summaryCollapse : t.briefing.summaryExpand}
              </button>
            )}

            {/* Real Edition Domain Footprint Micro-Strip */}
            {edition.signals.length > 0 && (
              <div className="border-t border-[var(--ws-border-subtle)] pt-4 space-y-2.5">
                <div
                  role="img"
                  aria-label={domainSummaries
                    .map((d) => `${t.domains[d.domain]}: ${d.total} (${d.sharePct}%)`)
                    .join(', ')}
                  className="flex h-2 w-full overflow-hidden rounded-[1px] gap-[2px] bg-[var(--ws-surface-subtle)]"
                >
                  {domainSummaries.map((d) =>
                    d.total > 0 ? (
                      <div
                        key={d.domain}
                        className={`h-full ${domainAccentRuleClass(d.domain)}`}
                        style={{
                          width: `${(d.total / edition.signals.length) * 100}%`,
                        }}
                      />
                    ) : null
                  )}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 text-[12px]">
                  {domainSummaries.map((d) => (
                    <button
                      key={d.domain}
                      type="button"
                      onClick={() => onExploreDomain(d.domain)}
                      className="inline-flex items-center gap-1.5 text-[var(--ws-ink-muted)] hover:text-[var(--ws-ink)] transition-colors cursor-pointer"
                    >
                      <span
                        aria-hidden="true"
                        className={`h-2 w-2 rounded-[1px] ${domainAccentRuleClass(d.domain)}`}
                      />
                      <span className={`font-medium ${domainAccentTextClass(d.domain)}`}>
                        {t.domains[d.domain]}
                      </span>
                      <span className="font-mono-tabular font-semibold text-[var(--ws-ink)]">
                        {d.total}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {edition.executiveBriefing.caveats.length > 0 && (
            <div className="ws-caution-panel px-5 py-4.5 sm:px-6 space-y-2.5">
              <h3 className="ws-kicker text-[var(--ws-warn)]">
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
                  className="pt-0.5 text-[12px] font-semibold text-[var(--ws-warn)] hover:underline underline-offset-4 cursor-pointer"
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

      {/* 3. Daily Delta Cross-Edition Intelligence Ledger */}
      <DailyDeltaSection
        state={dailyDelta}
        lang={lang}
        onOpenSignalInEdition={onOpenSignalInEdition}
        onRetry={onRetryDailyDelta}
      />

      {/* 4. Editorially Selected Secondary Dispatches (Varied Broadsheet Weights, Exact Edition Order) */}
      {secondaryTopEntries.length > 0 && (
        <section className="ws-section-rule pt-8 space-y-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-[1.5rem] sm:text-[1.8rem] font-semibold tracking-[-0.018em] text-[var(--ws-ink)]">
              {t.briefing.topSignalsTitle}
            </h2>
            <span className="text-[12px] text-[var(--ws-ink-muted)]">
              {t.briefing.topSignalsNote}
            </span>
          </div>

          {/* Rank #02 — Asymmetric Wide Broadsheet Feature Dispatch */}
          {featureDispatch && (
            <article className="border-y border-[var(--ws-border-strong)] bg-[var(--ws-surface)] p-5 sm:p-7 lg:p-8 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10 items-start">
              <div className="lg:col-span-8 space-y-3.5 min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-display text-[1.55rem] font-semibold leading-none text-[var(--ws-ink-faint)] tabular-nums">
                    02
                  </span>
                  <span
                    aria-hidden="true"
                    className={`inline-block h-[2.5px] w-6 ${domainAccentRuleClass(
                      featureDispatch.signal.domain
                    )}`}
                  />
                  <SignalMetaLine signal={featureDispatch.signal} lang={lang} compact />
                </div>

                <h3 className="font-display text-[1.45rem] sm:text-[1.8rem] font-semibold leading-[1.22] tracking-[-0.02em] text-[var(--ws-ink)] headline-balance">
                  <button
                    type="button"
                    onClick={() => onOpenSignal(featureDispatch.signal.signal_id)}
                    className="text-left hover:underline decoration-[var(--ws-border-strong)] underline-offset-4 cursor-pointer"
                  >
                    {featureDispatch.signal.headline}
                  </button>
                </h3>

                <div className="max-w-[64ch] ws-prose">
                  <SafeMarkdown
                    content={featureDispatch.editorialSummary}
                    onSelectSignal={onOpenSignal}
                  />
                </div>
              </div>

              {/* Complementary Evidence Folio Rail for Dispatch #02 */}
              <div className="lg:col-span-4 lg:border-l lg:border-[var(--ws-border)] lg:pl-8 flex flex-col justify-between gap-5 h-full">
                <dl className="grid grid-cols-2 lg:grid-cols-1 gap-4 text-xs">
                  <div>
                    <dt className="ws-kicker text-[var(--ws-ink-faint)]">
                      {t.expanded.eventDateLabel}
                    </dt>
                    <dd className="mt-1 font-mono-tabular text-[12.5px] font-semibold text-[var(--ws-ink)]">
                      {formatEventDateRange(
                        featureDispatch.signal.event.start_date,
                        featureDispatch.signal.event.end_date,
                        lang
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="ws-kicker text-[var(--ws-ink-faint)]">
                      {t.expanded.geographyLabel}
                    </dt>
                    <dd className="mt-1 text-[13px] font-medium text-[var(--ws-ink-secondary)]">
                      {featureDispatch.signal.event.geography.length > 0
                        ? featureDispatch.signal.event.geography.join(' · ')
                        : featureDispatch.signal.topic}
                    </dd>
                  </div>
                  <div>
                    <dt className="ws-kicker text-[var(--ws-ink-faint)]">
                      {t.briefing.artworkClaimsLabel} / {t.briefing.artworkOriginsLabel}
                    </dt>
                    <dd className="mt-1 font-mono-tabular text-[12.5px] text-[var(--ws-ink)]">
                      {t.metaLine.claims(featureDispatch.signal.claims.length)} ·{' '}
                      {t.metaLine.origins(featureDispatch.signal.independentOriginCount)}
                    </dd>
                  </div>
                </dl>

                <div className="border-t border-[var(--ws-border-subtle)] pt-3.5 flex items-center justify-between gap-2">
                  <span className="font-mono-tabular text-[11px] text-[var(--ws-ink-faint)] truncate">
                    {featureDispatch.signal.signal_id}
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenSignal(featureDispatch.signal.signal_id)}
                    className="group inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--ws-ink)] hover:text-[var(--ws-editorial-accent)] transition-colors cursor-pointer shrink-0"
                  >
                    <span>{t.briefing.readDossier}</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
            </article>
          )}

          {/* Ranks #03+ — Multi-Column Editorial Dispatch Deck (Open Hairline Columns, Clean Eyebrow + Single-Line Meta) */}
          {deckDispatches.length > 0 && (
            <div
              className={`grid grid-cols-1 gap-8 md:grid-cols-2 ${
                deckDispatches.length >= 3 ? 'xl:grid-cols-3' : ''
              } md:gap-x-9 md:gap-y-9`}
            >
              {deckDispatches.map(({ signal, editorialSummary }, idx) => {
                const isLeadDeck = idx === 0 && deckDispatches.length === 2;
                return (
                  <article
                    key={signal.signal_id}
                    className={`flex flex-col justify-between gap-4 border-t-[1.5px] border-[var(--ws-border-strong)] pt-5 ${
                      isLeadDeck ? 'md:pr-2' : ''
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            aria-hidden="true"
                            className={`inline-block h-[2.5px] w-4 shrink-0 ${domainAccentRuleClass(
                              signal.domain
                            )}`}
                          />
                          <span className="font-mono-tabular text-[12px] font-semibold text-[var(--ws-ink)]">
                            {formatEditorialIndex(idx + 3)}
                          </span>
                          <span
                            className={`ws-kicker truncate ${domainAccentTextClass(
                              signal.domain
                            )}`}
                          >
                            {t.domains[signal.domain]}
                          </span>
                        </div>
                        <span className="font-mono-tabular text-[11px] text-[var(--ws-ink-faint)] truncate max-w-[140px] shrink-0">
                          {signal.event.geography[0] ?? signal.topic}
                        </span>
                      </div>

                      <h3 className="font-display text-[1.2rem] sm:text-[1.28rem] font-semibold leading-[1.3] tracking-[-0.015em] text-[var(--ws-ink)] headline-balance">
                        <button
                          type="button"
                          onClick={() => onOpenSignal(signal.signal_id)}
                          className="text-left hover:underline decoration-[var(--ws-border-strong)] underline-offset-4 cursor-pointer"
                        >
                          {signal.headline}
                        </button>
                      </h3>

                      <SignalMetaLine signal={signal} lang={lang} compact hideDomain />

                      <div className="line-clamp-4 ws-prose pt-0.5">
                        <SafeMarkdown
                          content={editorialSummary}
                          compact
                          onSelectSignal={onOpenSignal}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-[var(--ws-border-subtle)] pt-3 text-xs">
                      <span className="font-mono-tabular text-[11.5px] text-[var(--ws-ink-muted)]">
                        {t.metaLine.claims(signal.claims.length)}
                      </span>
                      <button
                        type="button"
                        onClick={() => onOpenSignal(signal.signal_id)}
                        className="group inline-flex items-center gap-1.5 font-semibold text-[var(--ws-ink)] hover:text-[var(--ws-editorial-accent)] transition-colors duration-150 cursor-pointer"
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

      {/* 5. Three-Domain Overview — Unified Editorial Coverage Composition Band (Not 3 Identical Boxes) */}
      <section className="ws-section-rule pt-8 space-y-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <h2 className="font-display text-[1.45rem] sm:text-[1.75rem] font-semibold tracking-[-0.018em] text-[var(--ws-ink)]">
            {t.briefing.domainsOverviewTitle}
          </h2>
          <span className="font-mono-tabular text-[11.5px] text-[var(--ws-ink-muted)]">
            {t.briefing.domainBalanceTitle}
          </span>
        </div>

        {/* Unified Edition Proportional Coverage Ribbon */}
        {edition.signals.length > 0 && (
          <div className="space-y-2.5">
            <div
              role="img"
              aria-label={domainSummaries
                .map((d) => `${t.domains[d.domain]}: ${d.total} (${d.sharePct}%)`)
                .join(', ')}
              className="flex h-3 w-full overflow-hidden rounded-[2px] gap-[3px] bg-[var(--ws-surface-subtle)]"
            >
              {domainSummaries.map((d) =>
                d.total > 0 ? (
                  <div
                    key={d.domain}
                    className={`h-full ${domainAccentRuleClass(d.domain)}`}
                    style={{
                      width: `${(d.total / edition.signals.length) * 100}%`,
                    }}
                    title={`${t.domains[d.domain]}: ${d.total} (${d.sharePct}%)`}
                  />
                ) : null
              )}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1.5 font-mono-tabular text-[11.5px] text-[var(--ws-ink-muted)]">
              {domainSummaries.map((d) => (
                <div key={d.domain} className="inline-flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className={`h-2.5 w-2.5 rounded-[1px] ${domainAccentRuleClass(d.domain)}`}
                  />
                  <span className={`font-semibold ${domainAccentTextClass(d.domain)}`}>
                    {t.domains[d.domain]}
                  </span>
                  <span className="text-[var(--ws-ink)] font-semibold tabular-nums">
                    {d.total} ({d.sharePct}%)
                  </span>
                  <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">·</span>
                  <span>{t.briefing.domainHighPriorityCount(d.imp5Count + d.imp4Count)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Horizontal Editorial Desk Ledger Rows (Breaks the 3-Identical-Card Pattern) */}
        <div className="border-y border-[var(--ws-border-strong)] bg-[var(--ws-surface)] divide-y divide-[var(--ws-border)]">
          {domainSummaries.map((item) => {
            const safeTotal = Math.max(item.total, 1);
            const imp5Pct = (item.imp5Count / safeTotal) * 100;
            const imp4Pct = (item.imp4Count / safeTotal) * 100;
            const impOtherPct = (item.impLowerCount / safeTotal) * 100;

            return (
              <div
                key={item.domain}
                className="group p-5 sm:p-6 grid grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-7 items-center hover:bg-[var(--ws-surface-elevated)] transition-colors duration-150"
              >
                {/* Desk Identity & Monumental Count */}
                <div className="lg:col-span-3 flex items-center justify-between lg:justify-start gap-4 min-w-0">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <DomainEditorialEmblem domain={item.domain} className="h-8 w-8" />
                    <div className="min-w-0">
                      <h3
                        className={`font-display text-[1.2rem] font-semibold tracking-[-0.012em] ${domainAccentTextClass(
                          item.domain
                        )}`}
                      >
                        {t.domains[item.domain]}
                      </h3>
                      <div className="font-mono-tabular text-[11.5px] text-[var(--ws-ink-muted)]">
                        {t.briefing.domainShareLabel(item.sharePct)} ·{' '}
                        {t.masthead.independentOriginsCount(item.independentOrigins)}
                      </div>
                    </div>
                  </div>
                  <div className="font-display text-[2rem] font-semibold leading-none text-[var(--ws-ink)] tabular-nums lg:hidden">
                    {item.total}
                  </div>
                </div>

                {/* Editorial Desk Brief */}
                <div className="lg:col-span-4 min-w-0">
                  {item.intro ? (
                    <p className="text-[13.5px] leading-[1.68] text-[var(--ws-ink-secondary)]">
                      {item.intro}
                    </p>
                  ) : (
                    <p className="font-mono-tabular text-[12px] text-[var(--ws-ink-muted)]">
                      {t.masthead.claimsCount(item.totalClaims)}
                    </p>
                  )}
                </div>

                {/* Real Importance Intensity Profile */}
                <div className="lg:col-span-3 space-y-2 min-w-0">
                  <div className="flex h-2 w-full overflow-hidden rounded-[1px] gap-[1.5px] bg-[var(--ws-surface-subtle)]">
                    {item.imp5Count > 0 && (
                      <div
                        className={`h-full ${domainAccentRuleClass(item.domain)}`}
                        style={{ width: `${imp5Pct}%` }}
                      />
                    )}
                    {item.imp4Count > 0 && (
                      <div
                        className={`h-full ${domainAccentRuleClass(item.domain)} opacity-55`}
                        style={{ width: `${imp4Pct}%` }}
                      />
                    )}
                    {item.impLowerCount > 0 && (
                      <div
                        className="h-full bg-[var(--ws-border-strong)]"
                        style={{ width: `${impOtherPct}%` }}
                      />
                    )}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 font-mono-tabular text-[11.5px] text-[var(--ws-ink-muted)]">
                    <span>
                      {t.briefing.domainImp5Label}:{' '}
                      <strong className="text-[var(--ws-ink)]">{item.imp5Count}</strong>
                    </span>
                    <span>
                      {t.briefing.domainImp4Label}:{' '}
                      <strong className="text-[var(--ws-ink)]">{item.imp4Count}</strong>
                    </span>
                    <span>
                      {t.briefing.domainImpOtherLabel}:{' '}
                      <strong className="text-[var(--ws-ink)]">{item.impLowerCount}</strong>
                    </span>
                  </div>
                  <div className="font-mono-tabular text-[11.5px] text-[var(--ws-ink-faint)]">
                    {t.masthead.claimsCount(item.totalClaims)}
                  </div>
                </div>

                {/* Desktop Monumental Count & Desk Action */}
                <div className="lg:col-span-2 flex lg:flex-col items-center lg:items-end justify-between gap-2 border-t border-[var(--ws-border-subtle)] pt-3 lg:border-t-0 lg:pt-0">
                  <div className="hidden lg:block font-display text-[2.1rem] font-semibold leading-none text-[var(--ws-ink)] tabular-nums">
                    {item.total}
                  </div>
                  <button
                    type="button"
                    onClick={() => onExploreDomain(item.domain)}
                    className={`inline-flex items-center gap-1.5 text-[12.5px] font-semibold ${domainAccentTextClass(
                      item.domain
                    )} hover:underline underline-offset-4 transition-colors duration-150 cursor-pointer whitespace-nowrap`}
                  >
                    <span>{t.briefing.exploreDomain}</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Compact Broadsheet Index of Additional Signals */}
      <section className="space-y-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--ws-border)] pb-3.5">
          <h2 className="font-display text-[1.45rem] sm:text-[1.75rem] font-semibold tracking-[-0.018em] text-[var(--ws-ink)]">
            {t.briefing.additionalSignalsTitle}
          </h2>
          <span className="text-[12.5px] text-[var(--ws-ink-muted)]">
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
                        className={`ws-kicker ${domainAccentTextClass(
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
                          <div className="flex flex-col items-center gap-1 pt-[2px] shrink-0">
                            <span className="font-mono-tabular text-[11px] font-medium text-[var(--ws-ink-faint)]">
                              {formatEditorialIndex(idx + 1)}
                            </span>
                            <span
                              aria-hidden="true"
                              className="flex flex-col gap-[1.5px]"
                            >
                              {[5, 4, 3, 2, 1].map((lvl) => (
                                <span
                                  key={lvl}
                                  className={`h-[2px] w-2.5 ${
                                    lvl <= sig.importance
                                      ? domainAccentRuleClass(group.domain)
                                      : 'bg-[var(--ws-border)]'
                                  }`}
                                />
                              ))}
                            </span>
                          </div>
                          <div className="min-w-0 space-y-1.5">
                            <div className="text-[14px] font-medium leading-[1.46] text-[var(--ws-ink)] group-hover:text-[var(--ws-world)] transition-colors duration-150 break-words">
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

      {/* 7. Quiet Editorial Section Directory */}
      <section className="ws-section-rule pt-8 space-y-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <h2 className="font-display text-lg font-semibold text-[var(--ws-ink)]">
            {t.briefing.readingPathTitle}
          </h2>
          <p className="text-[12.5px] text-[var(--ws-ink-muted)]">
            {t.briefing.readingPathSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 border-y border-[var(--ws-border)] bg-[var(--ws-surface)]/70 divide-y md:divide-y-0 md:divide-x divide-[var(--ws-border)]">
          <button
            type="button"
            onClick={() => onSwitchView('expanded')}
            className="group flex flex-col justify-between gap-2.5 p-5 text-left hover:bg-[var(--ws-surface)] transition-colors duration-150 cursor-pointer"
          >
            <div className="flex items-center justify-between text-[var(--ws-ink-muted)]">
              <span className="inline-flex items-center gap-2 font-mono-tabular text-[11px]">
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
              <span className="inline-flex items-center gap-2 font-mono-tabular text-[11px]">
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
              <span className="inline-flex items-center gap-2 font-mono-tabular text-[11px]">
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
