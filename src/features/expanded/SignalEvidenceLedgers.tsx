import React from 'react';
import { ExternalLink } from 'lucide-react';
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

  return (
    <>
      {/* Interactive Claim Evidence Ledger */}
      <section
        id="sec-claims"
        className="scroll-mt-28 lg:scroll-mt-24 space-y-4 border-t border-[var(--ws-border)] pt-7"
      >
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-display text-lg font-semibold text-[var(--ws-ink)]">
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
          <ul className="divide-y divide-[var(--ws-border)] rounded-md border border-[var(--ws-border)] bg-[var(--ws-surface-elevated)]">
            {signal.claims.map((claim) => {
              const isHighlighted = highlightedClaimId === claim.claim_id;
              return (
                <li
                  key={claim.claim_id}
                  id={`dossier-claim-${claim.claim_id}`}
                  className={`scroll-mt-28 lg:scroll-mt-24 p-4 space-y-2 transition-colors ${
                    isHighlighted ? 'bg-[var(--ws-world-soft)]' : ''
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono-tabular text-[11.5px] text-[var(--ws-ink-muted)]">
                    <span className="font-semibold text-[var(--ws-ink)]">
                      {claim.claim_id}
                    </span>
                    <span aria-hidden="true" className="opacity-40">
                      ·
                    </span>
                    <span>{t.claimStatus[claim.status]}</span>
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
                  {claim.source_ids.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 font-mono-tabular text-[11.5px]">
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
                            className="text-[var(--ws-world)] underline decoration-[var(--ws-border-strong)] underline-offset-2 hover:decoration-current cursor-pointer"
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
        )}
      </section>

      {/* Interactive Source Ledger */}
      <section
        id="sec-sources"
        className="scroll-mt-28 lg:scroll-mt-24 space-y-4 border-t border-[var(--ws-border)] pt-7"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-display text-lg font-semibold text-[var(--ws-ink)]">
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
          <ul className="space-y-3">
            {signal.sources.map((src) => {
              const isHighlighted = highlightedSourceId === src.source_id;
              return (
                <li
                  key={src.source_id}
                  id={`dossier-source-${src.source_id}`}
                  className={`scroll-mt-28 lg:scroll-mt-24 rounded-md border p-4 space-y-2 transition-colors ${
                    isHighlighted
                      ? 'border-[var(--ws-world)] bg-[var(--ws-world-soft)]'
                      : 'border-[var(--ws-border)] bg-[var(--ws-surface-elevated)]'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono-tabular text-[11.5px]">
                        <span className="font-semibold text-[var(--ws-ink)]">
                          {src.source_id}
                        </span>
                        <span aria-hidden="true" className="opacity-40">
                          ·
                        </span>
                        <span className="font-semibold text-[var(--ws-ink)]">
                          {src.outlet}
                        </span>
                        <span aria-hidden="true" className="opacity-40">
                          ·
                        </span>
                        <span className="text-[var(--ws-ink-muted)]">
                          {t.sourceClass[src.source_class]}
                        </span>
                        <span aria-hidden="true" className="opacity-40">
                          ·
                        </span>
                        <span className="text-[var(--ws-ink-muted)]">
                          {t.relationship[src.relationship]}
                        </span>
                      </div>

                      <div className="text-sm font-medium text-[var(--ws-ink)] leading-snug break-words">
                        {src.url && src.urlSafe ? (
                          <a
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-baseline gap-1.5 hover:text-[var(--ws-world)] underline decoration-[var(--ws-border-strong)] underline-offset-2 break-words"
                          >
                            <span>{src.title}</span>
                            <ExternalLink className="h-3 w-3 shrink-0 self-center" />
                          </a>
                        ) : (
                          <span>{src.title}</span>
                        )}
                      </div>
                    </div>

                    <div className="font-mono-tabular text-[11px] shrink-0">
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
                      Group:{' '}
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
        )}
      </section>

      {/* Related Signals Navigation */}
      {signal.related_signal_ids.length > 0 && (
        <section className="space-y-3 border-t border-[var(--ws-border)] pt-6">
          <h3 className="font-display text-base font-semibold text-[var(--ws-ink)]">
            {t.expanded.relatedSignalsTitle}
          </h3>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {signal.related_signal_ids.map((relId) => {
              const target = signalById.get(relId);
              if (!target) {
                return (
                  <div
                    key={relId}
                    className="rounded-md border border-[var(--ws-border)] bg-[var(--ws-surface-subtle)] p-3 text-xs text-[var(--ws-ink-muted)]"
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
                  className="rounded-md border border-[var(--ws-border)] bg-[var(--ws-surface-elevated)] p-3 text-left hover:border-[var(--ws-border-strong)] transition-colors cursor-pointer space-y-1"
                >
                  <div className="font-mono-tabular text-[11px] text-[var(--ws-ink-muted)]">
                    <span className={domainAccentTextClass(target.domain)}>
                      {t.domains[target.domain]}
                    </span>{' '}
                    · {target.signal_id}
                  </div>
                  <div className="text-xs font-semibold text-[var(--ws-ink)] leading-snug break-words">
                    {target.headline}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Tags Footer */}
      {signal.tags.length > 0 && (
        <footer className="border-t border-[var(--ws-border)] pt-4 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono-tabular text-[11.5px] text-[var(--ws-ink-muted)]">
          <span>Tags:</span>
          {signal.tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onFilterByTag(tag)}
              className="hover:text-[var(--ws-ink)] underline decoration-[var(--ws-border)] underline-offset-2 cursor-pointer"
            >
              #{tag}
            </button>
          ))}
        </footer>
      )}
    </>
  );
};
