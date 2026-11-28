import React from 'react';
import type {
  SourceIndependenceMetrics,
  UiLanguage,
} from '../../types/edition';
import { getUiStrings } from '../../lib/i18n/uiStrings';

interface AuditOverviewCardsProps {
  summary: SourceIndependenceMetrics;
  totalClaims: number;
  lang: UiLanguage;
}

export const AuditOverviewCards: React.FC<AuditOverviewCardsProps> = ({
  summary,
  totalClaims,
  lang,
}) => {
  const t = getUiStrings(lang);

  // Strictly derived proportions from authoritative SourceIndependenceMetrics
  const total = Math.max(summary.totalRecords, 1);
  const qualifyingCount = summary.qualifyingRecords;
  const qualifyingSharePct =
    summary.totalRecords > 0
      ? Math.round((qualifyingCount / summary.totalRecords) * 100)
      : 0;
  const syndicatedCount = summary.syndicatedRecords;
  const primaryResearchCount =
    summary.primarySourceRecords + summary.researchPaperRecords;
  const accounted = qualifyingCount + syndicatedCount + primaryResearchCount;
  const otherExcludedCount = Math.max(0, summary.totalRecords - accounted);

  const segments = [
    {
      key: 'qualifying',
      label: t.audit.compositionQualifying,
      count: qualifyingCount,
      pct: Math.round((qualifyingCount / total) * 100),
      barClass: 'bg-[var(--ws-conf-high)]',
      labelOnBarClass: 'text-white',
    },
    {
      key: 'syndicated',
      label: t.audit.compositionSyndicated,
      count: syndicatedCount,
      pct: Math.round((syndicatedCount / total) * 100),
      barClass: 'bg-[var(--ws-world)]',
      labelOnBarClass: 'text-white',
    },
    {
      key: 'primaryResearch',
      label: t.audit.compositionPrimaryResearch,
      count: primaryResearchCount,
      pct: Math.round((primaryResearchCount / total) * 100),
      barClass: 'bg-[var(--ws-ai)]',
      labelOnBarClass: 'text-white',
    },
    {
      key: 'otherExcluded',
      label: t.audit.compositionOtherExcluded,
      count: otherExcludedCount,
      pct: Math.round((otherExcludedCount / total) * 100),
      barClass: 'bg-[var(--ws-border-strong)]',
      labelOnBarClass: 'text-[var(--ws-ink)]',
    },
  ].filter((seg) => seg.count > 0);

  const classBars = [
    {
      key: 'tier1',
      label: t.sourceClass.tier_1_newsroom,
      count: summary.tier1Records,
      barClass: 'bg-[var(--ws-world)]',
    },
    {
      key: 'specialist',
      label: t.sourceClass.specialist_publication,
      count: summary.specialistRecords,
      barClass: 'bg-[var(--ws-economy)]',
    },
    {
      key: 'primary',
      label: t.sourceClass.primary_source,
      count: summary.primarySourceRecords,
      barClass: 'bg-[var(--ws-ai)]',
    },
    {
      key: 'research',
      label: t.sourceClass.research_paper,
      count: summary.researchPaperRecords,
      barClass: 'bg-[var(--ws-ink-secondary)]',
    },
    {
      key: 'unknown',
      label: t.sourceClass.unknown,
      count: summary.unknownClassRecords,
      barClass: 'bg-[var(--ws-warn)]',
    },
  ]
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);

  const maxClassCount = Math.max(1, ...classBars.map((c) => c.count));

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-[1.45rem] sm:text-[1.75rem] font-semibold tracking-[-0.018em] text-[var(--ws-ink)]">
          {t.audit.overviewTitle}
        </h2>
        <span className="ws-meta text-[12px] text-[var(--ws-ink-muted)]">
          {t.masthead.recordsCount(summary.totalRecords)}
        </span>
      </div>

      {/* FT Visual Vocabulary Asymmetric Provenance Spread: Nocturnal Key Figures + Light Chart Doctor Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 border-t-[2.5px] border-t-[var(--ws-ink)] border-b border-b-[var(--ws-border-strong)] border-x border-x-[var(--ws-border)] overflow-hidden">
        {/* Left 5 cols: Nocturnal Provenance Summary Plate */}
        <div className="lg:col-span-5 ws-plate rounded-none shadow-none p-6 sm:p-7 flex flex-col justify-between gap-6 border-b lg:border-b-0 lg:border-r border-[var(--ws-plate-border)]">
          <div className="grid grid-cols-2 gap-6 items-end">
            <div className="space-y-1.5">
              <div className="ws-kicker text-[#62d18c]">
                {t.audit.overviewCards.independentOrigins}
              </div>
              <div className="ws-editorial-numeral text-[3.1rem] sm:text-[3.7rem] text-[#62d18c]">
                {summary.independentOriginCount}
              </div>
            </div>

            <div className="space-y-1.5 border-l border-[var(--ws-plate-border)] pl-5">
              <div className="ws-kicker text-[var(--ws-plate-muted)]">
                {t.audit.verificationRatioLabel}
              </div>
              <div className="ws-editorial-numeral text-[2.2rem] sm:text-[2.6rem] text-[var(--ws-plate-ink)]">
                {qualifyingSharePct}%
              </div>
              <div className="font-mono-tabular text-[12px] text-[var(--ws-plate-muted)]">
                {summary.qualifyingRecords} / {summary.totalRecords}
              </div>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-[var(--ws-plate-border)] pt-5">
            <div>
              <dt className="text-[11.5px] text-[var(--ws-plate-muted)]">
                {t.audit.overviewCards.claimsAudited}
              </dt>
              <dd className="mt-0.5 font-mono-tabular text-[17px] font-semibold text-[var(--ws-plate-ink)]">
                {totalClaims}
              </dd>
            </div>
            <div>
              <dt className="text-[11.5px] text-[var(--ws-plate-muted)]">
                {t.audit.overviewCards.qualifyingRecords}
              </dt>
              <dd className="mt-0.5 font-mono-tabular text-[17px] font-semibold text-[var(--ws-plate-ink)]">
                {summary.qualifyingRecords}
              </dd>
            </div>
            <div>
              <dt className="text-[11.5px] text-[var(--ws-plate-muted)]">
                {t.audit.overviewCards.primaryAndResearch}
              </dt>
              <dd className="mt-0.5 font-mono-tabular text-[17px] font-semibold text-[#cbb4ff]">
                {primaryResearchCount}
              </dd>
            </div>
            <div>
              <dt className="text-[11.5px] text-[var(--ws-plate-muted)]">
                {t.audit.overviewCards.excludedRecords}
              </dt>
              <dd className="mt-0.5 font-mono-tabular text-[17px] font-semibold text-[var(--ws-plate-secondary)]">
                {summary.excludedRecords}
              </dd>
            </div>
          </dl>
        </div>

        {/* Right 7 cols: FT Chart Doctor Part-to-Whole Ribbon + Ranked Horizontal Source Class Bars */}
        <div className="lg:col-span-7 bg-[var(--ws-surface)] p-6 sm:p-7 flex flex-col justify-between gap-7">
          {summary.totalRecords > 0 && (
            <>
              {/* Part-to-Whole Record Independence Ribbon with Direct Inline % Labels */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="ws-kicker text-[var(--ws-ink)]">
                    {t.audit.compositionTitle}
                  </h3>
                  <span className="font-mono-tabular text-[12px] text-[var(--ws-ink-muted)]">
                    100% = {summary.totalRecords}
                  </span>
                </div>

                <div
                  role="img"
                  aria-label={segments
                    .map((s) => `${s.label}: ${s.count} (${s.pct}%)`)
                    .join(', ')}
                  className="flex h-6 w-full overflow-hidden rounded-[2px] bg-[var(--ws-surface-subtle)] gap-[2px]"
                >
                  {segments.map((seg) => (
                    <div
                      key={seg.key}
                      className={`h-full ${seg.barClass} flex items-center justify-center overflow-hidden`}
                      style={{ width: `${(seg.count / total) * 100}%` }}
                      title={`${seg.label}: ${seg.count} (${seg.pct}%)`}
                    >
                      {seg.pct >= 12 && (
                        <span
                          className={`font-mono-tabular text-[11px] font-semibold leading-none ${seg.labelOnBarClass}`}
                        >
                          {seg.pct}%
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px]">
                  {segments.map((seg) => (
                    <div key={seg.key} className="inline-flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className={`h-2.5 w-2.5 rounded-[1px] ${seg.barClass} shrink-0`}
                      />
                      <span className="text-[var(--ws-ink-secondary)]">
                        {seg.label}
                      </span>
                      <span className="font-mono-tabular font-semibold text-[var(--ws-ink)]">
                        {seg.count} ({seg.pct}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* FT Chart Doctor Sorted Horizontal Ranking Bar Chart for Source Classes */}
              <div className="border-t border-[var(--ws-border)] pt-5 space-y-3.5">
                <div className="flex flex-wrap items-baseline justify-between gap-2 text-[12px]">
                  <span className="ws-kicker text-[var(--ws-ink)]">
                    {t.audit.sourceBreakdownTitle}
                  </span>
                  <span className="ws-meta text-[12px] text-[var(--ws-ink-muted)]">
                    {t.expanded.unregisteredCandidate}:{' '}
                    <span className="font-mono-tabular font-semibold text-[var(--ws-ink)]">
                      {summary.unregisteredRecords}
                    </span>
                    {summary.unassignedRecords.length > 0 && (
                      <>
                        {' · '}
                        <span className="text-[var(--ws-warn)] font-semibold">
                          {t.audit.unassignedBadge}:{' '}
                          <span className="font-mono-tabular">
                            {summary.unassignedRecords.length}
                          </span>
                        </span>
                      </>
                    )}
                  </span>
                </div>

                <div
                  role="img"
                  aria-label={classBars
                    .map((c) => `${c.label}: ${c.count}`)
                    .join(', ')}
                  className="space-y-2.5"
                >
                  {classBars.map((c) => {
                    const sharePct = Math.round((c.count / total) * 100);
                    const barWidthPct = Math.max(
                      3,
                      Math.round((c.count / maxClassCount) * 100)
                    );
                    return (
                      <div
                        key={c.key}
                        className="grid grid-cols-[minmax(118px,168px)_1fr_auto] items-center gap-3 text-[12px]"
                      >
                        <span className="truncate font-medium text-[var(--ws-ink-secondary)]">
                          {c.label}
                        </span>
                        <div className="h-3 w-full rounded-[1px] bg-[var(--ws-surface-subtle)] overflow-hidden">
                          <div
                            className={`h-full ${c.barClass}`}
                            style={{ width: `${barWidthPct}%` }}
                          />
                        </div>
                        <span className="font-mono-tabular text-[12px] font-semibold text-[var(--ws-ink)] whitespace-nowrap text-right min-w-[66px]">
                          {c.count}{' '}
                          <span className="font-normal text-[var(--ws-ink-muted)]">
                            ({sharePct}%)
                          </span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};
