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

interface BriefingViewProps {
  edition: ParsedEdition;
  lang: UiLanguage;
  onOpenSignal: (signalId: string) => void;
  onExploreDomain: (domain: SignalDomain) => void;
  onSwitchView: (view: ViewId) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

const DOMAINS: readonly SignalDomain[] = ['world', 'ai', 'economy'];

export const BriefingView: React.FC<BriefingViewProps> = ({
  edition,
  lang,
  onOpenSignal,
  onExploreDomain,
  onSwitchView,
  onRefresh,
  isRefreshing,
}) => {
  const t = getUiStrings(lang);
  const [summaryExpanded, setSummaryExpanded] = React.useState(false);

  const summarySource =
    edition.executiveBriefing.summaryText || edition.frontmatter.summary;
  const isLongSummary = summarySource.length > 320;

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
      // Fallback strictly to document order if Top Signals section is absent
      for (const sig of edition.signals.slice(0, 4)) {
        entries.push({ signal: sig, editorialSummary: sig.sections.whatHappened });
      }
    }
    return entries;
  }, [edition.executiveBriefing.topSignalRefs, edition.signals, signalById]);

  const leadEntry = orderedTopEntries[0] ?? null;
  const secondaryTopEntries = orderedTopEntries.slice(1);
  const topIdSet = React.useMemo(
    () => new Set(orderedTopEntries.map((e) => e.signal.signal_id)),
    [orderedTopEntries]
  );

  const totalClaims = React.useMemo(
    () => edition.signals.reduce((acc, s) => acc + s.claims.length, 0),
    [edition.signals]
  );

  const domainSummaries = React.useMemo(() => {
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
    <div className="space-y-12 pb-16">
      {/* 1. Editorial Masthead Strip */}
      <section className="border-b border-[var(--ws-border)] pb-6 pt-2">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono-tabular text-[12px] text-[var(--ws-ink-muted)]">
              <span className="font-semibold text-[var(--ws-ink)]">
                {formatEditionDate(edition.frontmatter.edition_date, lang)}
              </span>
              <span aria-hidden="true" className="opacity-45">
                ·
              </span>
              <span>{syncLabel}</span>
              <span aria-hidden="true" className="opacity-45">
                ·
              </span>
              <span>{statusLabel}</span>
              {edition.isLocalPreview && (
                <>
                  <span aria-hidden="true" className="opacity-45">
                    ·
                  </span>
                  <span className="font-semibold text-[var(--ws-warn)]">
                    {t.archive.localPreviewActive}
                  </span>
                </>
              )}
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-[var(--ws-ink)] headline-balance break-words">
              {edition.frontmatter.edition_title}
            </h1>
            <p className="text-xs font-mono-tabular text-[var(--ws-ink-muted)]">
              {t.masthead.updatedLabel}:{' '}
              <span className="text-[var(--ws-ink-secondary)]">
                {formatPublicationTimestamp(edition.frontmatter.updated_at, lang)}
              </span>
              {edition.frontmatter.coverage_window_start && (
                <>
                  {' '}
                  <span aria-hidden="true" className="mx-1.5 opacity-45">
                    |
                  </span>{' '}
                  {t.masthead.coverageWindowLabel}:{' '}
                  <span className="text-[var(--ws-ink-secondary)]">
                    {formatCoverageWindow(
                      edition.frontmatter.coverage_window_start,
                      edition.frontmatter.coverage_window_end,
                      lang
                    )}
                  </span>
                </>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-mono-tabular text-[var(--ws-ink-muted)]">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <span className="font-semibold text-[var(--ws-ink)]">
                {t.masthead.signalsCount(edition.signals.length)}
              </span>
              <span aria-hidden="true" className="opacity-40">
                ·
              </span>
              <span>
                {t.masthead.independentOriginsCount(
                  edition.independenceSummary.independentOriginCount
                )}
              </span>
              <span aria-hidden="true" className="opacity-40">
                ·
              </span>
              <span>{t.masthead.claimsCount(totalClaims)}</span>
              <span aria-hidden="true" className="opacity-40">
                ·
              </span>
              <span>
                {t.masthead.recordsCount(edition.independenceSummary.totalRecords)}
              </span>
            </div>

            {!edition.isLocalPreview && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 rounded border border-[var(--ws-border)] bg-[var(--ws-surface)] px-2.5 py-1 text-[11.5px] font-medium text-[var(--ws-ink)] hover:border-[var(--ws-border-strong)] disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? t.archive.refreshing : t.archive.refreshEdition}
              </button>
            )}

            {diagnosticCount > 0 && (
              <button
                type="button"
                onClick={() => onSwitchView('audit')}
                className="inline-flex items-center gap-1 text-[11.5px] text-[var(--ws-warn)] underline decoration-dotted underline-offset-2 hover:opacity-80 cursor-pointer"
              >
                <AlertCircle className="h-3 w-3" />
                {t.masthead.diagnosticsLink(
                  edition.validation.errors.length,
                  edition.validation.warnings.length
                )}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 2. Lead Development + Executive Summary & Limitations */}
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
        {/* Primary Column: Lead Development */}
        {leadEntry && (
          <article className="lg:col-span-7 ws-card p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono-tabular text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ws-ink-muted)]">
                {t.briefing.leadKicker}
              </span>
              <span className="font-mono-tabular text-[11px] text-[var(--ws-ink-muted)]">
                {leadEntry.signal.signal_id}
              </span>
            </div>

            <div className="space-y-3">
              <SignalMetaLine signal={leadEntry.signal} lang={lang} showClaims />
              <h2 className="font-display text-2xl sm:text-[2rem] font-semibold leading-[1.2] tracking-[-0.02em] text-[var(--ws-ink)] headline-balance break-words">
                <button
                  type="button"
                  onClick={() => onOpenSignal(leadEntry.signal.signal_id)}
                  className="text-left hover:underline decoration-[var(--ws-border-strong)] underline-offset-4 cursor-pointer"
                >
                  {leadEntry.signal.headline}
                </button>
              </h2>
            </div>

            <div className="border-t border-[var(--ws-border)] pt-4">
              <SafeMarkdown
                content={leadEntry.editorialSummary}
                onSelectSignal={onOpenSignal}
              />
            </div>

            {leadEntry.signal.confidence.rationale && (
              <p className="text-xs leading-relaxed text-[var(--ws-ink-muted)]">
                <span className="font-semibold text-[var(--ws-ink-secondary)]">
                  {t.expanded.confidenceRationaleTitle}:{' '}
                </span>
                {leadEntry.signal.confidence.rationale}
              </p>
            )}

            <div className="pt-1">
              <button
                type="button"
                onClick={() => onOpenSignal(leadEntry.signal.signal_id)}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--ws-ink)] hover:text-[var(--ws-world)] transition-colors cursor-pointer"
              >
                <span>{t.briefing.readDossier}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </article>
        )}

        {/* Secondary Column: Executive Summary & Editorial Limitations */}
        <aside className={`${leadEntry ? 'lg:col-span-5' : 'lg:col-span-12'} space-y-5`}>
          <div className="ws-card-subtle p-6 space-y-3">
            <h2 className="font-mono-tabular text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ws-ink-muted)]">
              {t.briefing.executiveSummaryTitle}
            </h2>
            <div className={!summaryExpanded && isLongSummary ? 'line-clamp-6' : ''}>
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
                className="font-mono-tabular text-xs font-medium text-[var(--ws-world)] hover:underline underline-offset-2 cursor-pointer"
              >
                {summaryExpanded
                  ? lang === 'zh-CN'
                    ? '收起完整提要'
                    : 'Show less'
                  : lang === 'zh-CN'
                    ? '展开完整提要'
                    : 'Read full summary'}
              </button>
            )}
          </div>

          {edition.executiveBriefing.caveats.length > 0 && (
            <div className="rounded-md border border-[var(--ws-warn-border)] bg-[var(--ws-warn-soft)] p-5 space-y-2.5">
              <h3 className="font-mono-tabular text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--ws-warn)]">
                {t.briefing.editorialLimitationsTitle}
              </h3>
              <div className="space-y-2">
                {edition.executiveBriefing.caveats.map((caveat, idx) => (
                  <SafeMarkdown
                    key={idx}
                    content={caveat}
                    compact
                    onSelectSignal={onOpenSignal}
                  />
                ))}
              </div>
            </div>
          )}
        </aside>
      </section>

      {/* 3. Editorially Selected Top Signals (Remaining items in exact edition order) */}
      {secondaryTopEntries.length > 0 && (
        <section className="space-y-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--ws-border)] pb-3">
            <h2 className="font-display text-xl font-semibold text-[var(--ws-ink)]">
              {t.briefing.topSignalsTitle}
            </h2>
            <span className="font-mono-tabular text-xs text-[var(--ws-ink-muted)]">
              {t.briefing.topSignalsNote}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {secondaryTopEntries.map(({ signal, editorialSummary }, idx) => (
              <article
                key={signal.signal_id}
                className="ws-card p-5 sm:p-6 flex flex-col justify-between gap-4 hover:border-[var(--ws-border-strong)] transition-colors"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2 font-mono-tabular text-[11px] text-[var(--ws-ink-muted)]">
                    <span>0{idx + 2}</span>
                    <span>{signal.signal_id}</span>
                  </div>
                  <SignalMetaLine signal={signal} lang={lang} compact />
                  <h3 className="font-display text-lg font-semibold leading-snug text-[var(--ws-ink)] break-words">
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

                <div className="pt-1 border-t border-[var(--ws-border)] flex items-center justify-between text-xs">
                  <span className="font-mono-tabular text-[var(--ws-ink-muted)]">
                    {t.metaLine.claims(signal.claims.length)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenSignal(signal.signal_id)}
                    className="inline-flex items-center gap-1.5 font-semibold text-[var(--ws-ink)] hover:text-[var(--ws-world)] cursor-pointer"
                  >
                    {t.briefing.readDossier}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* 4. Three-Domain Overview */}
      <section className="space-y-5">
        <div className="border-b border-[var(--ws-border)] pb-3">
          <h2 className="font-display text-xl font-semibold text-[var(--ws-ink)]">
            {t.briefing.domainsOverviewTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {domainSummaries.map((item) => (
            <div
              key={item.domain}
              className="ws-card p-5 flex flex-col justify-between gap-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-baseline justify-between gap-2">
                  <h3
                    className={`font-display text-lg font-semibold ${domainAccentTextClass(
                      item.domain
                    )}`}
                  >
                    {t.domains[item.domain]}
                  </h3>
                  <span className="font-mono-tabular text-xs font-semibold text-[var(--ws-ink)]">
                    {t.masthead.signalsCount(item.total)}
                  </span>
                </div>
                <div className="font-mono-tabular text-[11.5px] text-[var(--ws-ink-muted)]">
                  {t.masthead.independentOriginsCount(item.independentOrigins)}
                </div>
                {item.intro && (
                  <p className="text-xs leading-relaxed text-[var(--ws-ink-secondary)]">
                    {item.intro}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => onExploreDomain(item.domain)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--ws-ink)] hover:text-[var(--ws-world)] pt-2 border-t border-[var(--ws-border)] cursor-pointer"
              >
                <span>{t.briefing.exploreDomain}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Compact Secondary Index of Additional Signals (No Full Dossier Repetition) */}
      <section className="space-y-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--ws-border)] pb-3">
          <h2 className="font-display text-xl font-semibold text-[var(--ws-ink)]">
            {t.briefing.additionalSignalsTitle}
          </h2>
          <span className="text-xs text-[var(--ws-ink-muted)]">
            {t.briefing.additionalSignalsSubtitle}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {domainSummaries.map((group) => (
            <div key={group.domain} className="space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--ws-border)] pb-2">
                <h3
                  className={`font-mono-tabular text-xs font-semibold uppercase tracking-wider ${domainAccentTextClass(
                    group.domain
                  )}`}
                >
                  {t.domains[group.domain]}
                </h3>
                <span className="font-mono-tabular text-xs text-[var(--ws-ink-muted)]">
                  {group.additionalSignals.length}
                </span>
              </div>

              <ul className="divide-y divide-[var(--ws-border)]">
                {group.additionalSignals.map((sig) => (
                  <li key={sig.signal_id} className="py-3 first:pt-1">
                    <button
                      type="button"
                      onClick={() => onOpenSignal(sig.signal_id)}
                      className="group w-full text-left space-y-1.5 cursor-pointer"
                    >
                      <div className="text-sm font-medium leading-snug text-[var(--ws-ink)] group-hover:text-[var(--ws-world)] transition-colors break-words">
                        {sig.headline}
                      </div>
                      <SignalMetaLine signal={sig} lang={lang} compact />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Editorial Reading Path */}
      <section className="space-y-4 border-t border-[var(--ws-border)] pt-8">
        <div>
          <h2 className="font-display text-lg font-semibold text-[var(--ws-ink)]">
            {t.briefing.readingPathTitle}
          </h2>
          <p className="mt-1 text-xs text-[var(--ws-ink-muted)]">
            {t.briefing.readingPathSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <button
            type="button"
            onClick={() => onSwitchView('expanded')}
            className="ws-card p-5 text-left space-y-2 hover:border-[var(--ws-border-strong)] transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <BookOpen className="h-4 w-4 text-[var(--ws-ink-muted)]" />
              <ArrowRight className="h-4 w-4 text-[var(--ws-ink-muted)] group-hover:text-[var(--ws-ink)] transition-colors" />
            </div>
            <div className="font-display text-base font-semibold text-[var(--ws-ink)]">
              {t.nav.expanded}
            </div>
            <p className="text-xs leading-relaxed text-[var(--ws-ink-muted)]">
              {t.briefing.openExpandedDesc}
            </p>
          </button>

          <button
            type="button"
            onClick={() => onSwitchView('synthesis')}
            className="ws-card p-5 text-left space-y-2 hover:border-[var(--ws-border-strong)] transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <Compass className="h-4 w-4 text-[var(--ws-ink-muted)]" />
              <ArrowRight className="h-4 w-4 text-[var(--ws-ink-muted)] group-hover:text-[var(--ws-ink)] transition-colors" />
            </div>
            <div className="font-display text-base font-semibold text-[var(--ws-ink)]">
              {t.nav.synthesis}
            </div>
            <p className="text-xs leading-relaxed text-[var(--ws-ink-muted)]">
              {t.briefing.openSynthesisDesc}
            </p>
          </button>

          <button
            type="button"
            onClick={() => onSwitchView('audit')}
            className="ws-card p-5 text-left space-y-2 hover:border-[var(--ws-border-strong)] transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <ShieldCheck className="h-4 w-4 text-[var(--ws-ink-muted)]" />
              <ArrowRight className="h-4 w-4 text-[var(--ws-ink-muted)] group-hover:text-[var(--ws-ink)] transition-colors" />
            </div>
            <div className="font-display text-base font-semibold text-[var(--ws-ink)]">
              {t.nav.audit}
            </div>
            <p className="text-xs leading-relaxed text-[var(--ws-ink-muted)]">
              {t.briefing.openAuditDesc}
            </p>
          </button>
        </div>
      </section>
    </div>
  );
};
