import React, { useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react';
import type {
  ClaimStatus,
  ConfidenceLevel,
  ParsedEdition,
  ParsedSignal,
  SignalClaim,
  SignalSource,
  UiLanguage,
} from '../../types/edition';
import { getUiStrings } from '../../lib/i18n/uiStrings';
import { confidenceColorClass } from '../../lib/filtering/filterSignals';
import { SafeMarkdown } from '../../components/editorial/SafeMarkdown';

interface AuditViewProps {
  edition: ParsedEdition;
  lang: UiLanguage;
  onOpenSignal: (signalId: string) => void;
}

type OriginFilter = 'all' | 'qualifying' | 'excluded';
type TrailTab =
  | 'sourceAudit'
  | 'openQuestions'
  | 'corrections'
  | 'methodology'
  | 'diagnostics';

interface FlatClaimRow {
  signal: ParsedSignal;
  claim: SignalClaim;
  linkedSources: SignalSource[];
  hasIndependentOrigin: boolean;
}

const CLAIM_STATUSES: readonly ClaimStatus[] = [
  'confirmed',
  'reported',
  'official_claim',
  'disputed',
  'unverified',
];
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

  const [originFilter, setOriginFilter] = useState<OriginFilter>('all');
  const [claimStatusFilter, setClaimStatusFilter] = useState<ClaimStatus | 'all'>('all');
  const [claimConfFilter, setClaimConfFilter] = useState<ConfidenceLevel | 'all'>('all');
  const [claimSignalFilter, setClaimSignalFilter] = useState<string>('all');
  const [claimSourceCoverage, setClaimSourceCoverage] = useState<
    'all' | 'with_independent' | 'without_independent'
  >('all');
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

  const filteredOriginGroups = useMemo(() => {
    return summary.allOriginGroups.filter((g) => {
      if (originFilter === 'qualifying') return g.qualifiesAny;
      if (originFilter === 'excluded') return !g.qualifiesAny || g.excludedRecordCount > 0;
      return true;
    });
  }, [originFilter, summary.allOriginGroups]);

  const filteredClaims = useMemo(() => {
    return allClaims.filter((row) => {
      if (claimStatusFilter !== 'all' && row.claim.status !== claimStatusFilter) {
        return false;
      }
      if (claimConfFilter !== 'all' && row.claim.confidence !== claimConfFilter) {
        return false;
      }
      if (claimSignalFilter !== 'all' && row.signal.signal_id !== claimSignalFilter) {
        return false;
      }
      if (claimSourceCoverage === 'with_independent' && !row.hasIndependentOrigin) {
        return false;
      }
      if (claimSourceCoverage === 'without_independent' && row.hasIndependentOrigin) {
        return false;
      }
      return true;
    });
  }, [
    allClaims,
    claimConfFilter,
    claimSignalFilter,
    claimSourceCoverage,
    claimStatusFilter,
  ]);

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

      {/* 1. Derived Source & Evidence Overview (Single Authoritative Engine) */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold text-[var(--ws-ink)]">
          {t.audit.overviewTitle}
        </h2>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div className="ws-card p-4 space-y-1">
            <div className="font-mono-tabular text-2xl font-semibold text-[var(--ws-conf-high)]">
              {summary.independentOriginCount}
            </div>
            <div className="text-xs text-[var(--ws-ink-muted)] leading-snug">
              {t.audit.overviewCards.independentOrigins}
            </div>
          </div>

          <div className="ws-card p-4 space-y-1">
            <div className="font-mono-tabular text-2xl font-semibold text-[var(--ws-ink)]">
              {summary.qualifyingRecords}
            </div>
            <div className="text-xs text-[var(--ws-ink-muted)] leading-snug">
              {t.audit.overviewCards.qualifyingRecords}
            </div>
          </div>

          <div className="ws-card p-4 space-y-1">
            <div className="font-mono-tabular text-2xl font-semibold text-[var(--ws-ink)]">
              {summary.totalRecords}
            </div>
            <div className="text-xs text-[var(--ws-ink-muted)] leading-snug">
              {t.audit.overviewCards.totalSourceRecords}
            </div>
          </div>

          <div className="ws-card p-4 space-y-1">
            <div className="font-mono-tabular text-2xl font-semibold text-[var(--ws-ink-secondary)]">
              {summary.excludedRecords}
            </div>
            <div className="text-xs text-[var(--ws-ink-muted)] leading-snug">
              {t.audit.overviewCards.excludedRecords}
            </div>
          </div>

          <div className="ws-card p-4 space-y-1">
            <div className="font-mono-tabular text-2xl font-semibold text-[var(--ws-ink)]">
              {summary.primarySourceRecords + summary.researchPaperRecords}
            </div>
            <div className="text-xs text-[var(--ws-ink-muted)] leading-snug">
              {t.audit.overviewCards.primaryAndResearch}
            </div>
          </div>

          <div className="ws-card p-4 space-y-1">
            <div className="font-mono-tabular text-2xl font-semibold text-[var(--ws-ink)]">
              {allClaims.length}
            </div>
            <div className="text-xs text-[var(--ws-ink-muted)] leading-snug">
              {t.audit.overviewCards.claimsAudited}
            </div>
          </div>
        </div>

        {/* Compact Source Class Composition Line */}
        <div className="ws-card-subtle px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono-tabular text-xs text-[var(--ws-ink-muted)]">
          <span className="font-semibold text-[var(--ws-ink)]">
            {t.audit.sourceBreakdownTitle}:
          </span>
          <span>
            {t.sourceClass.tier_1_newsroom}: {summary.tier1Records}
          </span>
          <span aria-hidden="true" className="opacity-40">
            ·
          </span>
          <span>
            {t.sourceClass.specialist_publication}: {summary.specialistRecords}
          </span>
          <span aria-hidden="true" className="opacity-40">
            ·
          </span>
          <span>
            {t.sourceClass.primary_source}: {summary.primarySourceRecords}
          </span>
          <span aria-hidden="true" className="opacity-40">
            ·
          </span>
          <span>
            {t.sourceClass.research_paper}: {summary.researchPaperRecords}
          </span>
          {summary.unknownClassRecords > 0 && (
            <>
              <span aria-hidden="true" className="opacity-40">
                ·
              </span>
              <span className="text-[var(--ws-warn)]">
                {t.sourceClass.unknown}: {summary.unknownClassRecords}
              </span>
            </>
          )}
          <span aria-hidden="true" className="opacity-40">
            ·
          </span>
          <span>
            {t.relationship.syndicated}: {summary.syndicatedRecords}
          </span>
          <span aria-hidden="true" className="opacity-40">
            ·
          </span>
          <span>
            {t.expanded.unregisteredCandidate}: {summary.unregisteredRecords}
          </span>
        </div>
      </section>

      {/* 2. Reporting Origin Explorer (Grouped by independence_group) */}
      <section className="space-y-4 border-t border-[var(--ws-border)] pt-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h2 className="font-display text-xl font-semibold text-[var(--ws-ink)]">
              {t.audit.originExplorerTitle}
            </h2>
            <p className="max-w-2xl text-xs text-[var(--ws-ink-muted)]">
              {t.audit.originExplorerSubtitle}
            </p>
          </div>

          <div className="inline-flex rounded-md border border-[var(--ws-border)] bg-[var(--ws-surface-subtle)] p-0.5 text-xs shrink-0 self-start">
            {(
              [
                ['all', t.audit.originFilterAll],
                ['qualifying', t.audit.originFilterQualifying],
                ['excluded', t.audit.originFilterExcluded],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setOriginFilter(key)}
                className={`rounded px-3 py-1 font-medium transition-colors cursor-pointer ${
                  originFilter === key
                    ? 'bg-[var(--ws-surface)] text-[var(--ws-ink)] shadow-xs'
                    : 'text-[var(--ws-ink-muted)] hover:text-[var(--ws-ink)]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {filteredOriginGroups.map((group) => (
            <article
              key={group.group}
              className="ws-card p-4 space-y-2.5 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-mono-tabular text-sm font-semibold text-[var(--ws-ink)]">
                      {group.group}
                    </div>
                    <div className="font-mono-tabular text-[11px] text-[var(--ws-ink-muted)]">
                      {t.audit.originRecordsLabel(
                        group.qualifyingRecordCount,
                        group.totalRecordCount
                      )}
                    </div>
                  </div>

                  <span
                    className={`font-mono-tabular text-[11px] font-semibold ${
                      group.qualifiesAny
                        ? 'text-[var(--ws-conf-high)]'
                        : 'text-[var(--ws-ink-muted)]'
                    }`}
                  >
                    {group.qualifiesAny
                      ? t.audit.originCountedBadge
                      : t.audit.originExcludedBadge}
                  </span>
                </div>

                <div className="text-xs text-[var(--ws-ink-secondary)]">
                  <span className="font-medium text-[var(--ws-ink-muted)]">
                    {t.audit.originOutletsLabel}:{' '}
                  </span>
                  {group.outlets.join(', ')}
                </div>

                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono-tabular text-[11px] text-[var(--ws-ink-muted)]">
                  <span>
                    {group.sourceClasses.map((sc) => t.sourceClass[sc]).join(' / ')}
                  </span>
                  <span aria-hidden="true" className="opacity-40">
                    ·
                  </span>
                  <span>
                    {group.relationships.map((rel) => t.relationship[rel]).join(' / ')}
                  </span>
                </div>

                {group.exclusionReasons.length > 0 && (
                  <div className="rounded bg-[var(--ws-surface-subtle)] px-2.5 py-1.5 text-[11.5px] text-[var(--ws-ink-muted)]">
                    <span className="font-medium text-[var(--ws-ink-secondary)]">
                      {t.audit.originExclusionReasonLabel}:{' '}
                    </span>
                    {group.exclusionReasons
                      .map((r) => t.exclusionReason[r])
                      .join('; ')}
                  </div>
                )}
              </div>

              {group.signalIds.length > 0 && (
                <div className="border-t border-[var(--ws-border)] pt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono-tabular text-[11px]">
                  <span className="text-[var(--ws-ink-muted)]">
                    {t.audit.originSignalsLabel} ({group.signalIds.length}):
                  </span>
                  {group.signalIds.map((sid) => (
                    <button
                      key={sid}
                      type="button"
                      onClick={() => onOpenSignal(sid)}
                      className="text-[var(--ws-world)] underline decoration-[var(--ws-border-strong)] underline-offset-2 hover:decoration-current cursor-pointer"
                    >
                      {sid}
                    </button>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* 3. Inspectable Filterable Claim Ledger (Signal -> Claim -> Source -> Origin) */}
      <section className="space-y-4 border-t border-[var(--ws-border)] pt-8">
        <div className="space-y-1">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-xl font-semibold text-[var(--ws-ink)]">
              {t.audit.claimLedgerTitle}
            </h2>
            <span className="font-mono-tabular text-xs text-[var(--ws-ink-muted)]">
              {filteredClaims.length} / {allClaims.length}
            </span>
          </div>
          <p className="text-xs text-[var(--ws-ink-muted)]">
            {t.audit.claimLedgerSubtitle}
          </p>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <select
            aria-label={t.audit.claimFilterStatus}
            value={claimStatusFilter}
            onChange={(e) =>
              setClaimStatusFilter(e.target.value as ClaimStatus | 'all')
            }
            className="rounded-md border border-[var(--ws-border)] bg-[var(--ws-surface)] px-3 py-2 text-xs text-[var(--ws-ink)]"
          >
            <option value="all">{t.audit.claimFilterStatus}</option>
            {CLAIM_STATUSES.map((st) => (
              <option key={st} value={st}>
                {t.claimStatus[st]}
              </option>
            ))}
          </select>

          <select
            aria-label={t.audit.claimFilterConfidence}
            value={claimConfFilter}
            onChange={(e) =>
              setClaimConfFilter(e.target.value as ConfidenceLevel | 'all')
            }
            className="rounded-md border border-[var(--ws-border)] bg-[var(--ws-surface)] px-3 py-2 text-xs text-[var(--ws-ink)]"
          >
            <option value="all">{t.audit.claimFilterConfidence}</option>
            {CONFIDENCE_LEVELS.map((c) => (
              <option key={c} value={c}>
                {t.confidence[c]}
              </option>
            ))}
          </select>

          <select
            aria-label={t.audit.claimFilterSignal}
            value={claimSignalFilter}
            onChange={(e) => setClaimSignalFilter(e.target.value)}
            className="rounded-md border border-[var(--ws-border)] bg-[var(--ws-surface)] px-3 py-2 text-xs text-[var(--ws-ink)]"
          >
            <option value="all">{t.audit.claimFilterSignal}</option>
            {edition.signals.map((sig) => (
              <option key={sig.signal_id} value={sig.signal_id}>
                {sig.signal_id}
              </option>
            ))}
          </select>

          <select
            aria-label={t.audit.claimFilterSources}
            value={claimSourceCoverage}
            onChange={(e) =>
              setClaimSourceCoverage(
                e.target.value as 'all' | 'with_independent' | 'without_independent'
              )
            }
            className="rounded-md border border-[var(--ws-border)] bg-[var(--ws-surface)] px-3 py-2 text-xs text-[var(--ws-ink)]"
          >
            <option value="all">{t.audit.claimSourcesAll}</option>
            <option value="with_independent">
              {t.audit.claimSourcesWithIndependent}
            </option>
            <option value="without_independent">
              {t.audit.claimSourcesNoIndependent}
            </option>
          </select>
        </div>

        {/* Stacked Responsive Claim Evidence Trace List */}
        <div className="ws-card divide-y divide-[var(--ws-border)] max-h-[620px] overflow-y-auto ws-scroll">
          {filteredClaims.length === 0 ? (
            <div className="p-8 text-center text-sm text-[var(--ws-ink-muted)]">
              {t.audit.noItemsInSection}
            </div>
          ) : (
            filteredClaims.map(({ signal, claim, linkedSources }) => (
              <div key={claim.claim_id} className="p-4 space-y-2">
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono-tabular text-[11.5px]">
                  <button
                    type="button"
                    onClick={() => onOpenSignal(signal.signal_id)}
                    className="font-semibold text-[var(--ws-world)] hover:underline cursor-pointer"
                  >
                    {signal.signal_id}
                  </button>
                  <span aria-hidden="true" className="opacity-40">
                    →
                  </span>
                  <span className="font-semibold text-[var(--ws-ink)]">
                    {claim.claim_id}
                  </span>
                  <span aria-hidden="true" className="opacity-40">
                    ·
                  </span>
                  <span className="text-[var(--ws-ink-muted)]">
                    {t.claimStatus[claim.status]}
                  </span>
                  <span aria-hidden="true" className="opacity-40">
                    ·
                  </span>
                  <span className={confidenceColorClass(claim.confidence)}>
                    {t.confidence[claim.confidence]}
                  </span>
                </div>

                <p className="text-sm leading-relaxed text-[var(--ws-ink-secondary)]">
                  {claim.statement}
                </p>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono-tabular text-[11px] text-[var(--ws-ink-muted)]">
                  <span>{t.audit.claimTraceLabel}:</span>
                  {linkedSources.length === 0 ? (
                    <span className="text-[var(--ws-error)]">—</span>
                  ) : (
                    linkedSources.map((src) => (
                      <span
                        key={src.source_id}
                        className="inline-flex items-center gap-1"
                      >
                        <span className="font-semibold text-[var(--ws-ink)]">
                          {src.source_id}
                        </span>
                        {src.url && src.urlSafe ? (
                          <a
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-0.5 text-[var(--ws-ink-secondary)] underline decoration-[var(--ws-border-strong)] underline-offset-2 hover:text-[var(--ws-world)]"
                          >
                            {src.outlet}
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        ) : (
                          <span>{src.outlet}</span>
                        )}
                        <span>
                          [{src.independence_group || 'unassigned'} ·{' '}
                          <span
                            className={
                              src.qualifiesAsIndependent
                                ? 'text-[var(--ws-conf-high)]'
                                : 'text-[var(--ws-ink-muted)]'
                            }
                          >
                            {src.qualifiesAsIndependent
                              ? t.audit.originCountedBadge
                              : t.audit.originExcludedBadge}
                          </span>
                          ]
                        </span>
                      </span>
                    ))
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

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
                      <span className={`font-medium ${confidenceColorClass(level)}`}>
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

      {/* 5. Editorial Audit Trail (Tabbed for calm scannability) */}
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

        <div className="ws-card p-6 sm:p-8">
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
                        {t.audit.diagnosticsErrors} ({edition.validation.errors.length})
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
