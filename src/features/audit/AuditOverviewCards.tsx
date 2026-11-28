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
    },
    {
      key: 'syndicated',
      label: t.audit.compositionSyndicated,
      count: syndicatedCount,
      pct: Math.round((syndicatedCount / total) * 100),
      barClass: 'bg-[var(--ws-world)]/75',
    },
    {
      key: 'primaryResearch',
      label: t.audit.compositionPrimaryResearch,
      count: primaryResearchCount,
      pct: Math.round((primaryResearchCount / total) * 100),
      barClass: 'bg-[var(--ws-ai)]/80',
    },
    {
      key: 'otherExcluded',
      label: t.audit.compositionOtherExcluded,
      count: otherExcludedCount,
      pct: Math.round((otherExcludedCount / total) * 100),
      barClass: 'bg-[var(--ws-border-strong)]',
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
  ].filter((c) => c.count > 0);

  return (
    <section className="space-y-5">
      <h2 className="font-display text-[1.4rem] sm:text-[1.65rem] font-semibold tracking-[-0.018em] text-[var(--ws-ink)]">
        {t.audit.overviewTitle}
      </h2>

      {/* Asymmetric Editorial Verification Brief (Open Broadsheet Ledger) */}
      <div className="ws-broadsheet-ledger grid grid-cols-1 lg:grid-cols-12">
        {/* Primary Provenance Hero Column (5 cols) */}
        <div className="lg:col-span-5 p-5 sm:p-7 flex flex-col justify-start gap-6 border-b lg:border-b-0 lg:border-r border-[var(--ws-border)]">
          <div className="grid grid-cols-2 gap-6 items-end">
            <div className="space-y-1.5">
              <div className="ws-kicker text-[var(--ws-conf-high)]">
                {t.audit.overviewCards.independentOrigins}
              </div>
              <div className="font-display text-[2.75rem] sm:text-[3.35rem] font-semibold leading-none tracking-[-0.03em] text-[var(--ws-conf-high)] tabular-nums">
                {summary.independentOriginCount}
              </div>
            </div>

            <div className="space-y-1.5 border-l border-[var(--ws-border-subtle)] pl-5">
              <div className="ws-kicker text-[var(--ws-ink-muted)]">
                {t.audit.verificationRatioLabel}
              </div>
              <div className="font-display text-[2rem] sm:text-[2.4rem] font-semibold leading-none tracking-[-0.02em] text-[var(--ws-ink)] tabular-nums">
                {qualifyingSharePct}%
              </div>
              <div className="font-mono-tabular text-[12px] text-[var(--ws-ink-muted)]">
                {summary.qualifyingRecords} / {summary.totalRecords}
              </div>
            </div>
          </div>

          {/* Quiet Secondary Audit Ledger */}
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3.5 border-t border-[var(--ws-border-subtle)] pt-4">
            <div>
              <dt className="text-[12px] text-[var(--ws-ink-muted)]">
                {t.audit.overviewCards.claimsAudited}
              </dt>
              <dd className="mt-0.5 font-mono-tabular text-[16px] font-semibold text-[var(--ws-ink)]">
                {totalClaims}
              </dd>
            </div>
            <div>
              <dt className="text-[12px] text-[var(--ws-ink-muted)]">
                {t.audit.overviewCards.qualifyingRecords}
              </dt>
              <dd className="mt-0.5 font-mono-tabular text-[16px] font-semibold text-[var(--ws-ink)]">
                {summary.qualifyingRecords}
              </dd>
            </div>
            <div>
              <dt className="text-[12px] text-[var(--ws-ink-muted)]">
                {t.audit.overviewCards.primaryAndResearch}
              </dt>
              <dd className="mt-0.5 font-mono-tabular text-[16px] font-semibold text-[var(--ws-ai)]">
                {primaryResearchCount}
              </dd>
            </div>
            <div>
              <dt className="text-[12px] text-[var(--ws-ink-muted)]">
                {t.audit.overviewCards.excludedRecords}
              </dt>
              <dd className="mt-0.5 font-mono-tabular text-[16px] font-semibold text-[var(--ws-ink-secondary)]">
                {summary.excludedRecords}
              </dd>
            </div>
          </dl>
        </div>

        {/* Proportional Composition & Source Class Analysis Column (7 cols) */}
        <div className="lg:col-span-7 p-5 sm:p-7 flex flex-col justify-start gap-6 bg-[var(--ws-surface-elevated)]/45">
          {summary.totalRecords > 0 && (
            <>
              {/* Derived Record Independence Composition */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="ws-kicker text-[var(--ws-ink-muted)]">
                    {t.audit.compositionTitle}
                  </h3>
                  <span className="ws-meta text-[12px] font-semibold text-[var(--ws-ink)]">
                    {t.masthead.recordsCount(summary.totalRecords)}
                  </span>
                </div>

                <div
                  role="img"
                  aria-label={segments
                    .map((s) => `${s.label}: ${s.count} (${s.pct}%)`)
                    .join(', ')}
                  className="flex h-3 w-full overflow-hidden rounded-[2px] bg-[var(--ws-surface-subtle)] gap-[2px]"
                >
                  {segments.map((seg) => (
                    <div
                      key={seg.key}
                      className={`h-full ${seg.barClass}`}
                      style={{ width: `${(seg.count / total) * 100}%` }}
                      title={`${seg.label}: ${seg.count} (${seg.pct}%)`}
                    />
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

              {/* Source Class Breakdown */}
              <div className="border-t border-[var(--ws-border)] pt-5 space-y-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2 text-[12px]">
                  <span className="ws-kicker text-[var(--ws-ink-muted)]">
                    {t.audit.sourceBreakdownTitle}
                  </span>
                  <span className="ws-meta text-[12px] text-[var(--ws-ink-muted)]">
                    {t.expanded.unregisteredCandidate}:{' '}
                    <span className="font-mono-tabular font-semibold text-[var(--ws-ink-secondary)]">
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
                  className="flex h-2.5 w-full overflow-hidden rounded-[2px] bg-[var(--ws-surface-subtle)] gap-[2px]"
                >
                  {classBars.map((c) => (
                    <div
                      key={c.key}
                      className={`h-full ${c.barClass}`}
                      style={{ width: `${(c.count / total) * 100}%` }}
                      title={`${c.label}: ${c.count}`}
                    />
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-[var(--ws-ink-muted)]">
                  {classBars.map((c) => (
                    <span
                      key={c.key}
                      className="inline-flex items-center gap-1.5"
                    >
                      <span
                        aria-hidden="true"
                        className={`h-2 w-2 rounded-[1px] ${c.barClass} shrink-0`}
                      />
                      <span>{c.label}</span>
                      <span className="font-mono-tabular font-semibold text-[var(--ws-ink)]">
                        {c.count}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};
