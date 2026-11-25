import React, { useMemo, useState } from 'react';
import { ExternalLink } from 'lucide-react';
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

export const AuditClaimLedger: React.FC<AuditClaimLedgerProps> = ({
  signals,
  allClaims,
  lang,
  onOpenSignal,
}) => {
  const t = getUiStrings(lang);

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

  const filteredClaims = useMemo(() => {
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
      return true;
    });
  }, [
    allClaims,
    claimConfFilter,
    claimSignalFilter,
    claimSourceCoverage,
    claimStatusFilter,
  ]);

  return (
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

              <p className="text-sm leading-relaxed text-[var(--ws-ink-secondary)] break-words">
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
                      className="inline-flex flex-wrap items-center gap-1"
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
                        [{src.independence_group || t.audit.unassignedBadge} ·{' '}
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
  );
};
