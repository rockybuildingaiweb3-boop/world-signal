import React, { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Search, ShieldCheck } from 'lucide-react';
import type {
  ClaimStatus,
  ConfidenceLevel,
  ParsedSignal,
  SignalClaim,
  SignalSource,
  UiLanguage,
} from '../../types/edition';
import { getUiStrings } from '../../lib/i18n/uiStrings';
import { confidenceColorClass } from '../../lib/filtering/filterSignals';

export interface FlatClaimRow {
  signal: ParsedSignal;
  claim: SignalClaim;
  linkedSources: SignalSource[];
  hasIndependentOrigin: boolean;
}

interface AuditClaimLedgerProps {
  signals: ParsedSignal[];
  allClaims: FlatClaimRow[];
  lang: UiLanguage;
  onOpenSignal: (signalId: string) => void;
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
const PAGE_SIZE = 20;

export const AuditClaimLedger: React.FC<AuditClaimLedgerProps> = ({
  signals,
  allClaims,
  lang,
  onOpenSignal,
}) => {
  const t = getUiStrings(lang);

  const [claimQuery, setClaimQuery] = useState('');
  const [claimStatusFilter, setClaimStatusFilter] = useState<
    ClaimStatus | 'all'
  >('all');
  const [claimConfFilter, setClaimConfFilter] = useState<
    ConfidenceLevel | 'all'
  >('all');
  const [claimSignalFilter, setClaimSignalFilter] = useState<string>('all');
  const [claimSourceCoverage, setClaimSourceCoverage] = useState<
    'all' | 'with_independent' | 'without_independent'
  >('all');
  const [visibleLimit, setVisibleLimit] = useState<number>(PAGE_SIZE);

  // Reset pagination whenever filters or edition claims change
  useEffect(() => {
    setVisibleLimit(PAGE_SIZE);
  }, [
    allClaims,
    claimQuery,
    claimStatusFilter,
    claimConfFilter,
    claimSignalFilter,
    claimSourceCoverage,
  ]);

  const filteredClaims = useMemo(() => {
    const q = claimQuery.trim().toLowerCase();
    return allClaims.filter((row) => {
      if (claimStatusFilter !== 'all' && row.claim.status !== claimStatusFilter) {
        return false;
      }
      if (claimConfFilter !== 'all' && row.claim.confidence !== claimConfFilter) {
        return false;
      }
      if (
        claimSignalFilter !== 'all' &&
        row.signal.signal_id !== claimSignalFilter
      ) {
        return false;
      }
      if (
        claimSourceCoverage === 'with_independent' &&
        !row.hasIndependentOrigin
      ) {
        return false;
      }
      if (
        claimSourceCoverage === 'without_independent' &&
        row.hasIndependentOrigin
      ) {
        return false;
      }
      if (q) {
        const matchesStatement = row.claim.statement.toLowerCase().includes(q);
        const matchesClaimId = row.claim.claim_id.toLowerCase().includes(q);
        const matchesSignalId = row.signal.signal_id.toLowerCase().includes(q);
        const matchesOutlet = row.linkedSources.some(
          (src) =>
            src.outlet.toLowerCase().includes(q) ||
            src.independence_group.toLowerCase().includes(q)
        );
        if (
          !matchesStatement &&
          !matchesClaimId &&
          !matchesSignalId &&
          !matchesOutlet
        ) {
          return false;
        }
      }
      return true;
    });
  }, [
    allClaims,
    claimConfFilter,
    claimQuery,
    claimSignalFilter,
    claimSourceCoverage,
    claimStatusFilter,
  ]);

  const visibleClaims = useMemo(
    () => filteredClaims.slice(0, visibleLimit),
    [filteredClaims, visibleLimit]
  );
  const remainingCount = Math.max(0, filteredClaims.length - visibleClaims.length);

  return (
    <section className="space-y-5 ws-section-rule pt-8">
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 ws-kicker text-[var(--ws-ink-muted)]">
              <ShieldCheck className="h-3.5 w-3.5 text-[var(--ws-economy)]" />
              <span>{t.audit.traceFlowLabel}</span>
            </div>
            <h2 className="font-display text-[1.4rem] sm:text-[1.65rem] font-semibold tracking-[-0.018em] text-[var(--ws-ink)]">
              {t.audit.claimLedgerTitle}
            </h2>
          </div>
          <span className="font-mono-tabular text-xs font-medium text-[var(--ws-ink-muted)]">
            {filteredClaims.length} / {allClaims.length}
          </span>
        </div>
        <p className="text-[13px] text-[var(--ws-ink-muted)]">
          {t.audit.claimLedgerSubtitle}
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--ws-ink-muted)]" />
          <input
            type="search"
            value={claimQuery}
            onChange={(e) => setClaimQuery(e.target.value)}
            placeholder={t.audit.claimSearchPlaceholder}
            aria-label={t.audit.claimSearchPlaceholder}
            className="w-full rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-surface)] py-2 pl-9 pr-3 text-xs text-[var(--ws-ink)] placeholder:text-[var(--ws-ink-muted)] focus:border-[var(--ws-border-strong)] transition-colors"
          />
        </div>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          <select
            aria-label={t.audit.claimFilterStatus}
            value={claimStatusFilter}
            onChange={(e) =>
              setClaimStatusFilter(e.target.value as ClaimStatus | 'all')
            }
            className="rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-surface)] px-3 py-2 text-xs text-[var(--ws-ink)]"
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
            className="rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-surface)] px-3 py-2 text-xs text-[var(--ws-ink)]"
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
            className="rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-surface)] px-3 py-2 text-xs text-[var(--ws-ink)]"
          >
            <option value="all">{t.audit.claimFilterSignal}</option>
            {signals.map((sig) => (
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
            className="rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-surface)] px-3 py-2 text-xs text-[var(--ws-ink)]"
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
      </div>

      {/* Paginated Claim Evidence Ledger (Zero Nested-Scroll Trap) */}
      <div className="ws-broadsheet-ledger overflow-hidden">
        <div className="divide-y divide-[var(--ws-border-subtle)]">
          {visibleClaims.length === 0 ? (
            <div className="p-8 text-center text-sm text-[var(--ws-ink-muted)]">
              {t.audit.noItemsInSection}
            </div>
          ) : (
            visibleClaims.map(
              ({ signal, claim, linkedSources, hasIndependentOrigin }) => (
                <div
                  key={claim.claim_id}
                  className="px-4 py-4.5 sm:px-6 sm:py-5 space-y-2.5 hover:bg-[var(--ws-surface-elevated)]/45 transition-colors"
                >
                  {/* Primary Claim Statement + Verification Status */}
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-5">
                    <p className="text-[14.5px] font-medium leading-[1.68] text-[var(--ws-ink)] break-words max-w-[74ch]">
                      {claim.statement}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px] shrink-0 sm:pt-0.5">
                      <span className="font-medium text-[var(--ws-ink-secondary)]">
                        {t.claimStatus[claim.status]}
                      </span>
                      <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">
                        ·
                      </span>
                      <span
                        className={`font-semibold ${confidenceColorClass(
                          claim.confidence
                        )}`}
                      >
                        {t.confidence[claim.confidence]}
                      </span>
                      <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">
                        ·
                      </span>
                      <span
                        className={`font-medium ${
                          hasIndependentOrigin
                            ? 'text-[var(--ws-conf-high)]'
                            : 'text-[var(--ws-ink-muted)]'
                        }`}
                      >
                        {hasIndependentOrigin
                          ? t.audit.originCountedBadge
                          : t.audit.originExcludedBadge}
                      </span>
                    </div>
                  </div>

                  {/* Structured Provenance Trace Footnote */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11.5px] text-[var(--ws-ink-muted)]">
                    <span className="inline-flex items-center gap-1.5 font-mono-tabular">
                      <button
                        type="button"
                        onClick={() => onOpenSignal(signal.signal_id)}
                        className="font-semibold text-[var(--ws-world)] hover:underline underline-offset-4 cursor-pointer"
                      >
                        {signal.signal_id}
                      </button>
                      <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">
                        →
                      </span>
                      <span className="font-semibold text-[var(--ws-ink-secondary)]">
                        {claim.claim_id}
                      </span>
                    </span>

                    <span aria-hidden="true" className="text-[var(--ws-border-strong)]">
                      |
                    </span>

                    <span className="text-[var(--ws-ink-faint)]">
                      {t.audit.claimTraceLabel}:
                    </span>

                    {linkedSources.length === 0 ? (
                      <span className="font-mono-tabular text-[var(--ws-error)]">—</span>
                    ) : (
                      linkedSources.map((src) => (
                        <span
                          key={src.source_id}
                          className="inline-flex flex-wrap items-center gap-1.5 font-mono-tabular"
                        >
                          <span className="font-semibold text-[var(--ws-ink)]">
                            {src.source_id}
                          </span>
                          {src.url && src.urlSafe ? (
                            <a
                              href={src.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-0.5 font-sans text-[var(--ws-ink-secondary)] underline decoration-[var(--ws-border-strong)] underline-offset-4 hover:text-[var(--ws-world)]"
                            >
                              {src.outlet}
                              <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          ) : (
                            <span className="font-sans text-[var(--ws-ink-secondary)]">
                              {src.outlet}
                            </span>
                          )}
                          <span className="text-[11px]">
                            [{src.independence_group || t.audit.unassignedBadge} ·{' '}
                            <span
                              className={
                                src.qualifiesAsIndependent
                                  ? 'text-[var(--ws-conf-high)] font-medium'
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
              )
            )
          )}
        </div>

        {/* Clean Progressive Pagination Bar */}
        {filteredClaims.length > 0 && (
          <div className="border-t border-[var(--ws-border)] bg-[var(--ws-surface-elevated)]/65 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono-tabular text-[11.5px] text-[var(--ws-ink-muted)]">
              {t.audit.claimShowingRange(
                visibleClaims.length,
                filteredClaims.length
              )}
            </span>

            {remainingCount > 0 && (
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setVisibleLimit((prev) => prev + PAGE_SIZE)
                  }
                  className="inline-flex min-h-[32px] items-center rounded-[var(--ws-radius-sm)] border border-[var(--ws-border-strong)] bg-[var(--ws-surface)] px-3 py-1 font-mono-tabular text-[11.5px] font-medium text-[var(--ws-ink)] hover:bg-[var(--ws-surface-hover)] transition-colors cursor-pointer"
                >
                  {t.audit.claimLoadMore(Math.min(PAGE_SIZE, remainingCount))}
                </button>
                <button
                  type="button"
                  onClick={() => setVisibleLimit(filteredClaims.length)}
                  className="font-mono-tabular text-[11.5px] font-medium text-[var(--ws-world)] hover:underline underline-offset-4 cursor-pointer"
                >
                  {t.audit.claimShowAll(filteredClaims.length)}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
