import React, { useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import type {
  ConfidenceLevel,
  ParsedEdition,
  SignalSource,
  UiLanguage,
} from '../../types/edition';
import { getUiStrings } from '../../lib/i18n/uiStrings';
import { confidenceColorClass } from '../../lib/filtering/filterSignals';
import { SafeMarkdown } from '../../components/editorial/SafeMarkdown';
import { buildConfidenceImportanceMatrix } from '../../lib/intelligence/visual-metrics/editorialVisualHelpers';
import { AuditOverviewCards } from './AuditOverviewCards';
import { OriginGroupExplorer } from './OriginGroupExplorer';
import { AuditClaimLedger, type FlatClaimRow } from './AuditClaimLedger';

interface AuditViewProps {
  edition: ParsedEdition;
  lang: UiLanguage;
  onOpenSignal: (signalId: string) => void;
}

type TrailTab =
  | 'sourceAudit'
  | 'openQuestions'
  | 'corrections'
  | 'methodology'
  | 'diagnostics';

const CONFIDENCE_LEVELS: readonly ConfidenceLevel[] = [
  'high',
  'medium',
  'low',
  'unverified',
];

function confidenceBarBg(level: ConfidenceLevel): string {
  switch (level) {
    case 'high':
      return 'bg-[var(--ws-conf-high)]';
    case 'medium':
      return 'bg-[var(--ws-conf-medium)]';
    case 'low':
      return 'bg-[var(--ws-conf-low)]';
    case 'unverified':
      return 'bg-[var(--ws-conf-unverified)]';
  }
}

export const AuditView: React.FC<AuditViewProps> = ({
  edition,
  lang,
  onOpenSignal,
}) => {
  const t = getUiStrings(lang);
  const summary = edition.independenceSummary;
  const [activeTrailTab, setActiveTrailTab] = useState<TrailTab>('sourceAudit');

  const allClaims: FlatClaimRow[] = useMemo(() => {
    const rows: FlatClaimRow[] = [];
    for (const signal of edition.signals) {
      const srcMap = new Map<string, SignalSource>();
      for (const s of signal.sources) srcMap.set(s.source_id, s);

      for (const claim of signal.claims) {
        const linkedSources = claim.source_ids
          .map((id) => srcMap.get(id))
          .filter((s): s is SignalSource => Boolean(s));
        const hasIndependentOrigin = linkedSources.some(
          (s) => s.qualifiesAsIndependent
        );
        rows.push({ signal, claim, linkedSources, hasIndependentOrigin });
      }
    }
    return rows;
  }, [edition.signals]);

  const confidenceCounts = useMemo(() => {
    const counts: Record<ConfidenceLevel, number> = {
      high: 0,
      medium: 0,
      low: 0,
      unverified: 0,
    };
    for (const sig of edition.signals) {
      counts[sig.confidence.overall] += 1;
    }
    return counts;
  }, [edition.signals]);

  const importanceCounts = useMemo(() => {
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    for (const sig of edition.signals) {
      counts[sig.importance] = (counts[sig.importance] ?? 0) + 1;
    }
    return counts;
  }, [edition.signals]);

  const matrix = useMemo(
    () => buildConfidenceImportanceMatrix(edition.signals),
    [edition.signals]
  );

  const totalSignals = Math.max(1, edition.signals.length);

  return (
    <div className="space-y-14 pb-16 sm:pb-20">
      {/* Publication Audit & Methodology Masthead */}
      <header className="ws-masthead-rule py-5 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 font-mono-tabular text-[11px] uppercase tracking-[0.14em] text-[var(--ws-ink-muted)]">
          <span>{t.nav.audit}</span>
          <span>{edition.frontmatter.edition_date}</span>
        </div>
        <h1 className="font-display text-[1.65rem] sm:text-[2.2rem] font-semibold leading-[1.18] tracking-[-0.024em] text-[var(--ws-ink)] headline-balance">
          {t.audit.title}
        </h1>
        <p className="max-w-3xl text-[14px] leading-[1.65] text-[var(--ws-ink-muted)]">
          {t.audit.subtitle}
        </p>
      </header>

      {/* 1. Derived Source & Evidence Overview + Proportional Composition Bar */}
      <AuditOverviewCards
        summary={summary}
        totalClaims={allClaims.length}
        lang={lang}
      />

      {/* 2. Reporting Origin Explorer & Unassigned Source Records */}
      <OriginGroupExplorer
        originGroups={summary.allOriginGroups}
        unassignedRecords={summary.unassignedRecords}
        lang={lang}
        onOpenSignal={onOpenSignal}
      />

      {/* 3. Inspectable Filterable Claim Ledger */}
      <AuditClaimLedger
        signals={edition.signals}
        allClaims={allClaims}
        lang={lang}
        onOpenSignal={onOpenSignal}
      />

      {/* 4. Confidence vs. Importance Distribution (Data-Journalism Comparison Panel) */}
      <section className="space-y-5 ws-section-rule pt-8">
        <div className="space-y-1">
          <h2 className="font-display text-[1.35rem] sm:text-[1.55rem] font-semibold tracking-[-0.015em] text-[var(--ws-ink)]">
            {t.audit.distributionTitle}
          </h2>
          <p className="text-[12.5px] text-[var(--ws-ink-muted)]">
            {t.audit.distributionSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 border-y border-[var(--ws-border-strong)] bg-[var(--ws-surface)] divide-y md:divide-y-0 md:divide-x divide-[var(--ws-border)]">
          <div className="p-5 sm:p-6 space-y-4">
            <h3 className="font-mono-tabular text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ws-ink-muted)]">
              {t.audit.confidenceDistribution}
            </h3>
            <div className="space-y-3">
              {CONFIDENCE_LEVELS.map((level) => {
                const count = confidenceCounts[level];
                const pct = Math.round((count / totalSignals) * 100);
                return (
                  <div key={level} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono-tabular">
                      <span
                        className={`font-semibold ${confidenceColorClass(level)}`}
                      >
                        {t.confidence[level]}
                      </span>
                      <span className="text-[var(--ws-ink-secondary)]">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-[1px] bg-[var(--ws-surface-subtle)] overflow-hidden">
                      <div
                        className={`h-full ${confidenceBarBg(level)}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-4">
            <h3 className="font-mono-tabular text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ws-ink-muted)]">
              {t.audit.importanceDistribution}
            </h3>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((imp) => {
                const count = importanceCounts[imp] ?? 0;
                const pct = Math.round((count / totalSignals) * 100);
                return (
                  <div key={imp} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono-tabular">
                      <span className="font-semibold text-[var(--ws-ink)]">
                        {t.metaLine.importance(imp)}
                      </span>
                      <span className="text-[var(--ws-ink-secondary)]">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-[1px] bg-[var(--ws-surface-subtle)] overflow-hidden">
                      <div
                        className="h-full bg-[var(--ws-world)]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Derived Importance × Confidence 5×4 Cross-Matrix */}
        <div className="rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-surface)] p-5 sm:p-6 space-y-4">
          <div className="space-y-1">
            <h3 className="font-mono-tabular text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ws-ink-muted)]">
              {t.audit.matrixTitle}
            </h3>
            <p className="text-xs text-[var(--ws-ink-muted)]">
              {t.audit.matrixSubtitle}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[440px] border-collapse font-mono-tabular text-xs">
              <thead>
                <tr className="border-b border-[var(--ws-border-strong)] text-[10.5px] uppercase tracking-[0.1em] text-[var(--ws-ink-muted)]">
                  <th className="py-2.5 pr-3 text-left font-semibold">
                    {t.audit.matrixImportanceAxis}
                  </th>
                  {CONFIDENCE_LEVELS.map((level) => (
                    <th
                      key={level}
                      className={`px-3 py-2.5 text-center font-semibold ${confidenceColorClass(
                        level
                      )}`}
                    >
                      {t.confidence[level]}
                    </th>
                  ))}
                  <th className="py-2.5 pl-3 text-right font-semibold text-[var(--ws-ink)]">
                    {t.audit.matrixTotalCol}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--ws-border-subtle)]">
                {matrix.rows.map((row) => (
                  <tr key={row.importance}>
                    <td className="py-2.5 pr-3 font-semibold text-[var(--ws-ink)] whitespace-nowrap">
                      {row.importance}/5
                    </td>
                    {CONFIDENCE_LEVELS.map((level) => {
                      const val = row.counts[level];
                      const ratio =
                        matrix.maxCellCount > 0
                          ? val / matrix.maxCellCount
                          : 0;
                      const cellBg =
                        val === 0
                          ? 'transparent'
                          : level === 'high'
                          ? `color-mix(in srgb, var(--ws-conf-high) ${Math.round(
                              10 + ratio * 22
                            )}%, transparent)`
                          : level === 'medium'
                          ? `color-mix(in srgb, var(--ws-conf-medium) ${Math.round(
                              10 + ratio * 22
                            )}%, transparent)`
                          : level === 'low'
                          ? `color-mix(in srgb, var(--ws-conf-low) ${Math.round(
                              10 + ratio * 22
                            )}%, transparent)`
                          : `color-mix(in srgb, var(--ws-conf-unverified) ${Math.round(
                              10 + ratio * 22
                            )}%, transparent)`;

                      return (
                        <td
                          key={level}
                          className="px-3 py-2.5 text-center border-x border-[var(--ws-border-subtle)]"
                          style={{ backgroundColor: cellBg }}
                        >
                          <span
                            className={
                              val > 0
                                ? 'font-semibold text-[var(--ws-ink)]'
                                : 'text-[var(--ws-ink-faint)]'
                            }
                          >
                            {val > 0 ? val : '—'}
                          </span>
                        </td>
                      );
                    })}
                    <td className="py-2.5 pl-3 text-right font-semibold text-[var(--ws-ink)]">
                      {row.rowTotal}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-[var(--ws-border-strong)] bg-[var(--ws-surface-subtle)]/60 font-semibold text-[var(--ws-ink)]">
                  <td className="py-2.5 pr-3 text-[11px] uppercase tracking-[0.08em] text-[var(--ws-ink-muted)]">
                    {t.audit.matrixTotalRow}
                  </td>
                  {CONFIDENCE_LEVELS.map((level) => (
                    <td
                      key={level}
                      className="px-3 py-2.5 text-center border-x border-[var(--ws-border-subtle)]"
                    >
                      {matrix.columnTotals[level]}
                    </td>
                  ))}
                  <td className="py-2.5 pl-3 text-right">
                    {matrix.totalSignals}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </section>

      {/* 5. Editorial Audit Trail */}
      <section className="space-y-5 ws-section-rule pt-8">
        <h2 className="font-display text-[1.35rem] sm:text-[1.55rem] font-semibold tracking-[-0.015em] text-[var(--ws-ink)]">
          {t.audit.editorialTrailTitle}
        </h2>

        <div className="rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-surface)] overflow-hidden">
          <div
            role="tablist"
            aria-label={t.audit.editorialTrailTitle}
            className="flex flex-wrap gap-0.5 border-b border-[var(--ws-border)] bg-[var(--ws-surface-elevated)] px-2 pt-1"
          >
            {(
              [
                ['sourceAudit', t.audit.trailTabs.sourceAudit],
                ['openQuestions', t.audit.trailTabs.openQuestions],
                ['corrections', t.audit.trailTabs.corrections],
                ['methodology', t.audit.trailTabs.methodology],
                [
                  'diagnostics',
                  `${t.audit.trailTabs.diagnostics} (${
                    edition.validation.errors.length +
                    edition.validation.warnings.length
                  })`,
                ],
              ] as const
            ).map(([tabId, label]) => {
              const isActive = activeTrailTab === tabId;
              return (
                <button
                  key={tabId}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTrailTab(tabId)}
                  className={`relative px-3.5 py-2.5 text-xs sm:text-[13px] font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'text-[var(--ws-ink)] font-semibold'
                      : 'text-[var(--ws-ink-muted)] hover:text-[var(--ws-ink)]'
                  }`}
                >
                  {label}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-2 bottom-0 h-[2.5px] bg-[var(--ws-rule-editorial)]"
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-5 sm:p-8">
            {activeTrailTab === 'sourceAudit' &&
              (edition.auditAndMethodology.sourceAudit ? (
                <div className="max-w-[72ch]">
                  <SafeMarkdown
                    content={edition.auditAndMethodology.sourceAudit}
                    onSelectSignal={onOpenSignal}
                  />
                </div>
              ) : (
                <p className="text-sm text-[var(--ws-ink-muted)]">
                  {t.audit.noItemsInSection}
                </p>
              ))}

            {activeTrailTab === 'openQuestions' &&
              (edition.auditAndMethodology.openQuestions ? (
                <div className="max-w-[72ch]">
                  <SafeMarkdown
                    content={edition.auditAndMethodology.openQuestions}
                    onSelectSignal={onOpenSignal}
                  />
                </div>
              ) : (
                <p className="text-sm text-[var(--ws-ink-muted)]">
                  {t.audit.noItemsInSection}
                </p>
              ))}

            {activeTrailTab === 'corrections' &&
              (edition.auditAndMethodology.corrections ? (
                <div className="max-w-[72ch]">
                  <SafeMarkdown
                    content={edition.auditAndMethodology.corrections}
                    onSelectSignal={onOpenSignal}
                  />
                </div>
              ) : (
                <p className="text-sm text-[var(--ws-ink-muted)]">
                  {t.audit.noItemsInSection}
                </p>
              ))}

            {activeTrailTab === 'methodology' &&
              (edition.auditAndMethodology.methodologyNotes ? (
                <div className="max-w-[72ch]">
                  <SafeMarkdown
                    content={edition.auditAndMethodology.methodologyNotes}
                    onSelectSignal={onOpenSignal}
                  />
                </div>
              ) : (
                <p className="text-sm text-[var(--ws-ink-muted)]">
                  {t.audit.noItemsInSection}
                </p>
              ))}

            {activeTrailTab === 'diagnostics' && (
              <div className="space-y-5">
                {edition.validation.errors.length === 0 &&
                edition.validation.warnings.length === 0 ? (
                  <div className="flex items-center gap-2 text-sm font-medium text-[var(--ws-conf-high)]">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{t.audit.diagnosticsValid}</span>
                  </div>
                ) : (
                  <>
                    {edition.validation.errors.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="font-mono-tabular text-xs font-semibold uppercase tracking-wider text-[var(--ws-error)]">
                          {t.audit.diagnosticsErrors} (
                          {edition.validation.errors.length})
                        </h3>
                        <ul className="space-y-2">
                          {edition.validation.errors.map((err, idx) => (
                            <li
                              key={`err-${idx}`}
                              className="flex items-start gap-2 rounded-[var(--ws-radius-sm)] border border-[var(--ws-error-border)] bg-[var(--ws-error-soft)] p-3 text-xs text-[var(--ws-error)]"
                            >
                              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                              <div>
                                <span className="font-mono-tabular font-semibold">
                                  [{err.code}]
                                </span>{' '}
                                {err.message}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {edition.validation.warnings.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="font-mono-tabular text-xs font-semibold uppercase tracking-wider text-[var(--ws-warn)]">
                          {t.audit.diagnosticsWarnings} (
                          {edition.validation.warnings.length})
                        </h3>
                        <ul className="space-y-2">
                          {edition.validation.warnings.map((warn, idx) => (
                            <li
                              key={`warn-${idx}`}
                              className="flex items-start gap-2 rounded-[var(--ws-radius-sm)] border border-[var(--ws-warn-border)] bg-[var(--ws-warn-soft)] p-3 text-xs text-[var(--ws-ink-secondary)]"
                            >
                              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--ws-warn)]" />
                              <div>
                                <span className="font-mono-tabular font-semibold text-[var(--ws-warn)]">
                                  [{warn.code}]
                                </span>{' '}
                                {warn.message}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
