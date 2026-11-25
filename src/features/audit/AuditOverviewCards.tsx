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
      dotClass: 'bg-[var(--ws-conf-high)]',
    },
    {
      key: 'syndicated',
      label: t.audit.compositionSyndicated,
      count: syndicatedCount,
      pct: Math.round((syndicatedCount / total) * 100),
      barClass: 'bg-[var(--ws-world)]/70',
      dotClass: 'bg-[var(--ws-world)]/70',
    },
    {
      key: 'primaryResearch',
      label: t.audit.compositionPrimaryResearch,
      count: primaryResearchCount,
      pct: Math.round((primaryResearchCount / total) * 100),
      barClass: 'bg-[var(--ws-ai)]/75',
      dotClass: 'bg-[var(--ws-ai)]/75',
    },
    {
      key: 'otherExcluded',
      label: t.audit.compositionOtherExcluded,
      count: otherExcludedCount,
      pct: Math.round((otherExcludedCount / total) * 100),
      barClass: 'bg-[var(--ws-border-strong)]',
      dotClass: 'bg-[var(--ws-border-strong)]',
    },
  ].filter((seg) => seg.count > 0);

  const metrics = [
    {
      value: summary.independentOriginCount,
      label: t.audit.overviewCards.independentOrigins,
      accent: 'text-[var(--ws-conf-high)]',
    },
    {
      value: summary.qualifyingRecords,
      label: t.audit.overviewCards.qualifyingRecords,
      accent: 'text-[var(--ws-ink)]',
    },
    {
      value: summary.totalRecords,
      label: t.audit.overviewCards.totalSourceRecords,
      accent: 'text-[var(--ws-ink)]',
    },
    {
      value: summary.excludedRecords,
      label: t.audit.overviewCards.excludedRecords,
      accent: 'text-[var(--ws-ink-secondary)]',
    },
    {
      value: primaryResearchCount,
      label: t.audit.overviewCards.primaryAndResearch,
      accent: 'text-[var(--ws-ai)]',
    },
    {
      value: totalClaims,
      label: t.audit.overviewCards.claimsAudited,
      accent: 'text-[var(--ws-ink)]',
    },
  ];

  return (
    <section className="space-y-5">
      <h2 className="font-display text-[1.35rem] sm:text-[1.55rem] font-semibold tracking-[-0.015em] text-[var(--ws-ink)]">
        {t.audit.overviewTitle}
      </h2>

      {/* Architectural Hairline-Divided KPI Ledger */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 border-y border-[var(--ws-border-strong)] bg-[var(--ws-surface)]">
        {metrics.map((item, idx) => (
          <div
            key={item.label}
            className={`p-4 sm:p-5 space-y-1.5 ${
              idx % 2 === 1 ? 'border-l border-[var(--ws-border)]' : ''
            } ${
              idx >= 2 ? 'border-t border-[var(--ws-border)] sm:border-t-0' : ''
            } ${
              idx >= 3 ? 'sm:border-t sm:border-[var(--ws-border)] lg:border-t-0' : ''
            } ${
              idx % 3 !== 0 ? 'sm:border-l sm:border-[var(--ws-border)]' : 'sm:border-l-0'
            } ${
              idx > 0 ? 'lg:border-l lg:border-[var(--ws-border)]' : 'lg:border-l-0'
            }`}
          >
            <div
              className={`font-display text-[1.75rem] sm:text-[2rem] font-semibold leading-none tabular-nums ${item.accent}`}
            >
              {item.value}
            </div>
            <div className="text-[11.5px] leading-snug text-[var(--ws-ink-muted)]">
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {/* Real Derived Proportional Source Record Composition Bar */}
      {summary.totalRecords > 0 && (
        <div className="rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-surface)] p-4 sm:p-5 space-y-3.5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-mono-tabular text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ws-ink-muted)]">
              {t.audit.compositionTitle}
            </h3>
            <span className="font-mono-tabular text-[11.5px] font-medium text-[var(--ws-ink)]">
              {t.masthead.recordsCount(summary.totalRecords)}
            </span>
          </div>

          <div
            role="img"
            aria-label={segments.map((s) => `${s.label}: ${s.count} (${s.pct}%)`).join(', ')}
            className="flex h-2.5 w-full overflow-hidden rounded-[2px] bg-[var(--ws-surface-subtle)] gap-[2px]"
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

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 font-mono-tabular text-[11.5px]">
            {segments.map((seg) => (
              <div key={seg.key} className="inline-flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className={`h-2.5 w-2.5 rounded-[1px] ${seg.dotClass} shrink-0`}
                />
                <span className="text-[var(--ws-ink-secondary)]">{seg.label}:</span>
                <span className="font-semibold text-[var(--ws-ink)]">
                  {seg.count} ({seg.pct}%)
                </span>
              </div>
            ))}
          </div>

          {/* Derived Proportional Source Class Breakdown */}
          <div className="border-t border-[var(--ws-border-subtle)] pt-3.5 space-y-2.5">
            <div className="flex flex-wrap items-baseline justify-between gap-2 font-mono-tabular text-[11px]">
              <span className="font-semibold uppercase tracking-[0.1em] text-[var(--ws-ink-muted)]">
                {t.audit.sourceBreakdownTitle}
              </span>
              <span className="text-[var(--ws-ink-muted)]">
                {t.expanded.unregisteredCandidate}: {summary.unregisteredRecords}
                {summary.unassignedRecords.length > 0 && (
                  <>
                    {' · '}
                    <span className="text-[var(--ws-warn)]">
                      {t.audit.unassignedBadge}: {summary.unassignedRecords.length}
                    </span>
                  </>
                )}
              </span>
            </div>

            {(() => {
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
                <div className="space-y-2">
                  <div
                    role="img"
                    aria-label={classBars
                      .map((c) => `${c.label}: ${c.count}`)
                      .join(', ')}
                    className="flex h-2 w-full overflow-hidden rounded-[2px] bg-[var(--ws-surface-subtle)] gap-[2px]"
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
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono-tabular text-[11px] text-[var(--ws-ink-muted)]">
                    {classBars.map((c) => (
                      <span
                        key={c.key}
                        className="inline-flex items-center gap-1.5"
                      >
                        <span
                          aria-hidden="true"
                          className={`h-2 w-2 rounded-[1px] ${c.barClass} shrink-0`}
                        />
                        <span>{c.label}:</span>
                        <span className="font-semibold text-[var(--ws-ink)]">
                          {c.count}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </section>
  );
};
