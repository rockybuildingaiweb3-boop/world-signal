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

  const totalSignals = Math.max(1, edition.signals.length);

  return (
    <div className="space-y-12 pb-16">
      {/* Header */}
      <header className="border-b border-[var(--ws-border)] pb-5 pt-2 space-y-2">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-[var(--ws-ink)]">
          {t.audit.title}
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-[var(--ws-ink-muted)]">
          {t.audit.subtitle}
        </p>
      </header>

      {/* 1. Derived Source & Evidence Overview */}
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

      {/* 4. Confidence vs. Importance Distribution */}
      <section className="space-y-4 border-t border-[var(--ws-border)] pt-8">
        <div className="space-y-1">
          <h2 className="font-display text-xl font-semibold text-[var(--ws-ink)]">
            {t.audit.distributionTitle}
          </h2>
          <p className="text-xs text-[var(--ws-ink-muted)]">
            {t.audit.distributionSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="ws-card p-5 space-y-3">
            <h3 className="font-mono-tabular text-xs font-semibold uppercase tracking-wider text-[var(--ws-ink-muted)]">
              {t.audit.confidenceDistribution}
            </h3>
            <div className="space-y-2.5">
              {CONFIDENCE_LEVELS.map((level) => {
                const count = confidenceCounts[level];
                const pct = Math.round((count / totalSignals) * 100);
                return (
                  <div key={level} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono-tabular">
                      <span
                        className={`font-medium ${confidenceColorClass(level)}`}
                      >
                        {t.confidence[level]}
                      </span>
                      <span className="text-[var(--ws-ink-muted)]">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-[var(--ws-surface-subtle)] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[var(--ws-ink-secondary)]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="ws-card p-5 space-y-3">
            <h3 className="font-mono-tabular text-xs font-semibold uppercase tracking-wider text-[var(--ws-ink-muted)]">
              {t.audit.importanceDistribution}
            </h3>
            <div className="space-y-2.5">
              {[5, 4, 3, 2, 1].map((imp) => {
                const count = importanceCounts[imp] ?? 0;
                const pct = Math.round((count / totalSignals) * 100);
                return (
                  <div key={imp} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono-tabular">
                      <span className="font-medium text-[var(--ws-ink)]">
                        {t.metaLine.importance(imp)}
                      </span>
                      <span className="text-[var(--ws-ink-muted)]">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-[var(--ws-surface-subtle)] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[var(--ws-world)]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Editorial Audit Trail */}
      <section className="space-y-4 border-t border-[var(--ws-border)] pt-8">
        <h2 className="font-display text-xl font-semibold text-[var(--ws-ink)]">
          {t.audit.editorialTrailTitle}
        </h2>

        <div
          role="tablist"
          aria-label={t.audit.editorialTrailTitle}
          className="flex flex-wrap gap-1 border-b border-[var(--ws-border)]"
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
                className={`relative px-3.5 py-2.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'text-[var(--ws-ink)] font-semibold'
                    : 'text-[var(--ws-ink-muted)] hover:text-[var(--ws-ink)]'
                }`}
              >
                {label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-2 bottom-0 h-[2px] bg-[var(--ws-ink)]"
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="ws-card p-5 sm:p-8">
          {activeTrailTab === 'sourceAudit' &&
            (edition.auditAndMethodology.sourceAudit ? (
              <div className="max-w-[74ch]">
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
              <div className="max-w-[74ch]">
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
              <div className="max-w-[74ch]">
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
              <div className="max-w-[74ch]">
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
                            className="flex items-start gap-2 rounded-md border border-[var(--ws-error-border)] bg-[var(--ws-error-soft)] p-3 text-xs text-[var(--ws-error)]"
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
                            className="flex items-start gap-2 rounded-md border border-[var(--ws-warn-border)] bg-[var(--ws-warn-soft)] p-3 text-xs text-[var(--ws-ink-secondary)]"
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
      </section>
    </div>
  );
};
