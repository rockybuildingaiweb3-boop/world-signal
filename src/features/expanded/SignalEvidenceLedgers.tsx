import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, ShieldCheck } from 'lucide-react';
import type { ParsedSignal, UiLanguage } from '../../types/edition';
import { getUiStrings } from '../../lib/i18n/uiStrings';
import {
  confidenceColorClass,
  domainAccentTextClass,
} from '../../lib/filtering/filterSignals';
import { formatCompactTimestamp } from '../../lib/dates/formatDates';

interface SignalEvidenceLedgersProps {
  signal: ParsedSignal;
  signalById: Map<string, ParsedSignal>;
  lang: UiLanguage;
  highlightedClaimId: string | null;
  highlightedSourceId: string | null;
  onInspectSource: (sourceId: string) => void;
  onInspectClaim: (claimId: string) => void;
  onJumpToSignal: (signalId: string) => void;
  onFilterByTag: (tag: string) => void;
}

const INITIAL_LEDGER_ITEMS = 6;

export const SignalEvidenceLedgers: React.FC<SignalEvidenceLedgersProps> = ({
  signal,
  signalById,
  lang,
  highlightedClaimId,
  highlightedSourceId,
  onInspectSource,
  onInspectClaim,
  onJumpToSignal,
  onFilterByTag,
}) => {
  const t = getUiStrings(lang);
  const [showAllClaims, setShowAllClaims] = useState(false);
  const [showAllSources, setShowAllSources] = useState(false);

  // Reset progressive disclosures when switching signals
  useEffect(() => {
    setShowAllClaims(false);
    setShowAllSources(false);
  }, [signal.signal_id]);

  // Automatically expand if a cross-referenced claim or source is highlighted beyond the initial slice
  useEffect(() => {
    if (highlightedClaimId) {
      const idx = signal.claims.findIndex((c) => c.claim_id === highlightedClaimId);
      if (idx >= INITIAL_LEDGER_ITEMS) setShowAllClaims(true);
    }
  }, [highlightedClaimId, signal.claims]);

  useEffect(() => {
    if (highlightedSourceId) {
      const idx = signal.sources.findIndex((s) => s.source_id === highlightedSourceId);
      if (idx >= INITIAL_LEDGER_ITEMS) setShowAllSources(true);
    }
  }, [highlightedSourceId, signal.sources]);

  const visibleClaims = showAllClaims
    ? signal.claims
    : signal.claims.slice(0, INITIAL_LEDGER_ITEMS);
  const visibleSources = showAllSources
    ? signal.sources
    : signal.sources.slice(0, INITIAL_LEDGER_ITEMS);

  return (
    <>
      {/* Visual Provenance Chain Header */}
      <div className="border-t-2 border-[var(--ws-rule-editorial)] pt-6 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-mono-tabular text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ws-ink)]">
          <ShieldCheck className="h-3.5 w-3.5 text-[var(--ws-economy)] shrink-0" />
          <span>{t.expanded.evidenceChainLabel}</span>
        </div>
        <div className="font-mono-tabular text-[11.5px] text-[var(--ws-ink-muted)]">
          {t.metaLine.claims(signal.claims.length)} ·{' '}
          {t.masthead.recordsCount(signal.sources.length)} ·{' '}
          {t.masthead.independentOriginsCount(signal.independentOriginCount)}
        </div>
      </div>

      {/* Interactive Claim Evidence Ledger */}
      <section id="sec-claims" className="scroll-mt-24 space-y-4">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-display text-[1.2rem] font-semibold text-[var(--ws-ink)]">
            {t.expanded.sections.claims}
          </h3>
          <span className="font-mono-tabular text-xs text-[var(--ws-ink-muted)]">
            {t.metaLine.claims(signal.claims.length)}
          </span>
        </div>

        {signal.claims.length === 0 ? (
          <p className="text-xs text-[var(--ws-ink-muted)]">
            {t.expanded.claimsEmpty}
          </p>
        ) : (
          <>
            <ul className="divide-y divide-[var(--ws-border-subtle)] border-y border-[var(--ws-border)]">
              {visibleClaims.map((claim) => {
                const isHighlighted = highlightedClaimId === claim.claim_id;
                return (
                  <li
                    key={claim.claim_id}
                    id={`dossier-claim-${claim.claim_id}`}
                    className={`scroll-mt-24 py-4 px-3 -mx-3 space-y-2 transition-colors rounded-[var(--ws-radius-sm)] ${
                      isHighlighted ? 'bg-[var(--ws-world-soft)]' : ''
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono-tabular text-[11.5px] text-[var(--ws-ink-muted)]">
                      <span className="font-semibold text-[var(--ws-ink)]">
                        {claim.claim_id}
                      </span>
                      <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">
                        ·
                      </span>
                      <span>{t.claimStatus[claim.status]}</span>
                      <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">
                        ·
                      </span>
                      <span className={`font-medium ${confidenceColorClass(claim.confidence)}`}>
                        {t.confidence[claim.confidence]}
                      </span>
                    </div>
                    <p className="text-[14px] leading-[1.6] text-[var(--ws-ink-secondary)] break-words">
                      {claim.statement}
                    </p>
                    {claim.source_ids.length > 0 && (
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono-tabular text-[11.5px]">
                        <span className="text-[var(--ws-ink-muted)]">
                          {t.expanded.supportingSources}:
                        </span>
                        {claim.source_ids.map((sid) => {
                          const src = signal.sources.find(
                            (s) => s.source_id === sid
                          );
                          return (
                            <button
                              key={sid}
                              type="button"
                              onClick={() => onInspectSource(sid)}
                              className="text-[var(--ws-world)] underline decoration-[var(--ws-border-strong)] underline-offset-4 hover:decoration-current cursor-pointer"
                            >
                              {sid}
                              {src ? ` (${src.outlet})` : ''}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>

            {signal.claims.length > INITIAL_LEDGER_ITEMS && (
              <button
                type="button"
                onClick={() => setShowAllClaims((prev) => !prev)}
                className="inline-flex min-h-[34px] items-center gap-1.5 font-mono-tabular text-[11.5px] font-medium text-[var(--ws-world)] hover:underline underline-offset-4 cursor-pointer"
              >
                <span>
                  {showAllClaims
                    ? t.expanded.showFewerItems
                    : t.expanded.showAllClaims(signal.claims.length)}
                </span>
                {showAllClaims ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </button>
            )}
          </>
        )}
      </section>

      {/* Interactive Source Ledger */}
      <section
        id="sec-sources"
        className="scroll-mt-24 space-y-4 border-t border-[var(--ws-border)] pt-7"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-display text-[1.2rem] font-semibold text-[var(--ws-ink)]">
            {t.expanded.sections.sources}
          </h3>
          <span className="font-mono-tabular text-xs text-[var(--ws-ink-muted)]">
            {t.masthead.independentOriginsCount(signal.independentOriginCount)} ·{' '}
            {t.masthead.recordsCount(signal.sources.length)}
          </span>
        </div>

        {signal.sources.length === 0 ? (
          <p className="text-xs text-[var(--ws-ink-muted)]">
            {t.expanded.sourcesEmpty}
          </p>
        ) : (
          <>
            <ul className="divide-y divide-[var(--ws-border-subtle)] border-y border-[var(--ws-border)]">
              {visibleSources.map((src) => {
                const isHighlighted = highlightedSourceId === src.source_id;
                return (
                  <li
                    key={src.source_id}
                    id={`dossier-source-${src.source_id}`}
                    className={`scroll-mt-24 py-4 px-3 -mx-3 space-y-2 transition-colors rounded-[var(--ws-radius-sm)] ${
                      isHighlighted ? 'bg-[var(--ws-world-soft)]' : ''
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono-tabular text-[11.5px]">
                          <span className="font-semibold text-[var(--ws-ink)]">
                            {src.source_id}
                          </span>
                          <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">
                            ·
                          </span>
                          <span className="font-semibold text-[var(--ws-ink)]">
                            {src.outlet}
                          </span>
                          <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">
                            ·
                          </span>
                          <span className="text-[var(--ws-ink-muted)]">
                            {t.sourceClass[src.source_class]}
                          </span>
                          <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">
                            ·
                          </span>
                          <span className="text-[var(--ws-ink-muted)]">
                            {t.relationship[src.relationship]}
                          </span>
                        </div>

                        <div className="text-[14px] font-medium text-[var(--ws-ink)] leading-snug break-words">
                          {src.url && src.urlSafe ? (
                            <a
                              href={src.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-baseline gap-1.5 hover:text-[var(--ws-world)] underline decoration-[var(--ws-border-strong)] underline-offset-4 break-words"
                            >
                              <span>{src.title}</span>
                              <ExternalLink className="h-3 w-3 shrink-0 self-center" />
                            </a>
                          ) : (
                            <span>{src.title}</span>
                          )}
                        </div>
                      </div>

                      <div className="inline-flex items-center gap-1.5 font-mono-tabular text-[11px] shrink-0">
                        <span
                          aria-hidden="true"
                          className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                            src.qualifiesAsIndependent
                              ? 'bg-[var(--ws-conf-high)]'
                              : 'bg-[var(--ws-border-strong)]'
                          }`}
                        />
                        {src.qualifiesAsIndependent ? (
                          <span className="font-semibold text-[var(--ws-conf-high)]">
                            {t.expanded.qualifiesIndependent}
                          </span>
                        ) : (
                          <span className="text-[var(--ws-ink-muted)]">
                            {t.expanded.excludedFromIndependent}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono-tabular text-[11px] text-[var(--ws-ink-muted)]">
                      <span>
                        {t.expanded.sourceGroupLabel}:{' '}
                        {src.independence_group || t.audit.unassignedBadge}
                      </span>
                      <span>
                        {t.expanded.registryIdLabel}:{' '}
                        {src.registry_id &&
                        src.registry_id.toLowerCase() !== 'null'
                          ? src.registry_id
                          : t.expanded.unregisteredCandidate}
                      </span>
                      {src.published_at && (
                        <span>
                          {t.expanded.publishedLabel}:{' '}
                          {formatCompactTimestamp(src.published_at, lang)}
                        </span>
                      )}
                    </div>

                    {!src.qualifiesAsIndependent && src.exclusionReason && (
                      <div className="text-[11.5px] text-[var(--ws-ink-muted)]">
                        {t.audit.originExclusionReasonLabel}:{' '}
                        {t.exclusionReason[src.exclusionReason]}
                      </div>
                    )}

                    {src.url && !src.urlSafe && (
                      <div className="text-[11.5px] font-medium text-[var(--ws-error)]">
                        {t.expanded.unsafeUrlBlocked}
                      </div>
                    )}

                    {src.supports_claim_ids.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 pt-1 font-mono-tabular text-[11px]">
                        <span className="text-[var(--ws-ink-muted)]">
                          {t.expanded.supportsClaims}:
                        </span>
                        {src.supports_claim_ids.map((cid) => (
                          <button
                            key={cid}
                            type="button"
                            onClick={() => onInspectClaim(cid)}
                            className="text-[var(--ws-world)] underline decoration-dotted underline-offset-2 hover:decoration-solid cursor-pointer"
                          >
                            {cid}
                          </button>
                        ))}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>

            {signal.sources.length > INITIAL_LEDGER_ITEMS && (
              <button
                type="button"
                onClick={() => setShowAllSources((prev) => !prev)}
                className="inline-flex min-h-[34px] items-center gap-1.5 font-mono-tabular text-[11.5px] font-medium text-[var(--ws-world)] hover:underline underline-offset-4 cursor-pointer"
              >
                <span>
                  {showAllSources
                    ? t.expanded.showFewerItems
                    : t.expanded.showAllSources(signal.sources.length)}
                </span>
                {showAllSources ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </button>
            )}
          </>
        )}
      </section>

      {/* Declared Signal Relationships & Legacy Contextual References */}
      {(signal.relationships.length > 0 ||
        signal.related_signal_ids.length > 0) && (
        <section
          id="sec-relationships"
          className="scroll-mt-24 space-y-6 border-t border-[var(--ws-border)] pt-7"
        >
          {/* Schema-v2 Explicitly Typed Relationships */}
          {signal.relationships.length > 0 && (
            <div className="space-y-3.5">
              <div className="space-y-1">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-display text-[1.15rem] font-semibold text-[var(--ws-ink)]">
                    {t.expanded.typedRelationshipsTitle}
                  </h3>
                  <span className="font-mono-tabular text-[11px] text-[var(--ws-ink-muted)]">
                    {signal.relationships.length}
                  </span>
                </div>
                <p className="text-xs text-[var(--ws-ink-muted)]">
                  {t.expanded.typedRelationshipsSubtitle}
                </p>
              </div>

              <ul className="divide-y divide-[var(--ws-border-subtle)] border-y border-[var(--ws-border)]">
                {signal.relationships.map((rel, idx) => {
                  const target = signalById.get(rel.target_signal_id);
                  return (
                    <li
                      key={`${rel.target_signal_id}-${rel.relationship_type}-${idx}`}
                      className="py-4 space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 font-mono-tabular text-[11.5px]">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <span className="font-semibold uppercase tracking-[0.08em] text-[var(--ws-world)]">
                            {t.signalRelationshipType[rel.relationship_type]}
                          </span>
                          <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">
                            ·
                          </span>
                          <span
                            className={`font-medium ${confidenceColorClass(
                              rel.confidence
                            )}`}
                          >
                            {t.confidence[rel.confidence]}
                          </span>
                        </div>
                        {target ? (
                          <span
                            className={`text-[11px] font-semibold ${domainAccentTextClass(
                              target.domain
                            )}`}
                          >
                            {t.domains[target.domain]}
                          </span>
                        ) : (
                          <span className="text-[11px] text-[var(--ws-ink-muted)]">
                            {t.expanded.relatedNotInEdition}
                          </span>
                        )}
                      </div>

                      {target ? (
                        <button
                          type="button"
                          onClick={() => onJumpToSignal(target.signal_id)}
                          className="block text-left group cursor-pointer space-y-0.5"
                        >
                          <div className="font-display text-[1rem] font-semibold text-[var(--ws-ink)] group-hover:text-[var(--ws-world)] transition-colors break-words">
                            {target.headline}
                          </div>
                          <div className="font-mono-tabular text-[11px] text-[var(--ws-ink-muted)] break-all">
                            {target.signal_id}
                          </div>
                        </button>
                      ) : (
                        <div className="font-mono-tabular text-xs font-medium text-[var(--ws-ink-secondary)] break-all">
                          {rel.target_signal_id}
                        </div>
                      )}

                      {rel.rationale && (
                        <p className="text-[13.5px] leading-[1.6] text-[var(--ws-ink-secondary)] break-words">
                          {rel.rationale}
                        </p>
                      )}

                      {rel.supporting_claim_ids.length > 0 && (
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono-tabular text-[11px] text-[var(--ws-ink-muted)]">
                          <span>{t.expanded.supportingClaimsLabel}:</span>
                          {rel.supporting_claim_ids.map((cid) => (
                            <button
                              key={cid}
                              type="button"
                              onClick={() => onInspectClaim(cid)}
                              className="text-[var(--ws-world)] underline decoration-dotted underline-offset-2 hover:decoration-solid cursor-pointer"
                            >
                              {cid}
                            </button>
                          ))}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Coarse Legacy Contextual References (Explicitly Non-Causal) */}
          {(() => {
            const explicitTargetSet = new Set(
              signal.relationships.map((r) => r.target_signal_id)
            );
            const coarseOnlyIds = signal.related_signal_ids.filter(
              (id) => !explicitTargetSet.has(id)
            );
            if (coarseOnlyIds.length === 0) return null;
            return (
              <div className="space-y-3">
                <div className="space-y-0.5">
                  <h3 className="font-display text-base font-semibold text-[var(--ws-ink)]">
                    {signal.relationships.length > 0
                      ? t.expanded.legacyRelatedTitle
                      : t.expanded.relatedSignalsTitle}
                  </h3>
                  <p className="text-xs text-[var(--ws-ink-muted)]">
                    {t.expanded.legacyRelatedNote}
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {coarseOnlyIds.map((relId) => {
                    const target = signalById.get(relId);
                    if (!target) {
                      return (
                        <div
                          key={relId}
                          className="rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-surface-subtle)] p-3.5 text-xs text-[var(--ws-ink-muted)]"
                        >
                          <div className="font-mono-tabular break-all">{relId}</div>
                          <div className="mt-0.5 text-[11px]">
                            {t.expanded.relatedNotInEdition}
                          </div>
                        </div>
                      );
                    }
                    return (
                      <button
                        key={relId}
                        type="button"
                        onClick={() => onJumpToSignal(target.signal_id)}
                        className="rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-canvas)]/55 p-3.5 text-left hover:border-[var(--ws-border-strong)] hover:bg-[var(--ws-surface-hover)]/60 transition-colors cursor-pointer space-y-1"
                      >
                        <div className="font-mono-tabular text-[11px] text-[var(--ws-ink-muted)]">
                          <span
                            className={`font-semibold ${domainAccentTextClass(
                              target.domain
                            )}`}
                          >
                            {t.domains[target.domain]}
                          </span>{' '}
                          · {target.signal_id}
                        </div>
                        <div className="text-[13px] font-semibold text-[var(--ws-ink)] leading-snug break-words">
                          {target.headline}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </section>
      )}

      {/* Localized Tags Footer */}
      {signal.tags.length > 0 && (
        <footer className="border-t border-[var(--ws-border-subtle)] pt-4 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono-tabular text-[11.5px] text-[var(--ws-ink-muted)]">
          <span>{t.expanded.sourceTagsLabel}:</span>
          {signal.tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onFilterByTag(tag)}
              className="hover:text-[var(--ws-ink)] underline decoration-[var(--ws-border)] underline-offset-4 cursor-pointer"
            >
              #{tag}
            </button>
          ))}
        </footer>
      )}
    </>
  );
};
