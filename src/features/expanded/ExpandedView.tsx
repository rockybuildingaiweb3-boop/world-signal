import React, { useEffect } from 'react';
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import type { ParsedEdition, ParsedSignal } from '../../types/edition';
import { SafeMarkdown } from '../../components/SafeMarkdown';
import { SignalMetaLine } from '../../components/SignalMetaLine';
import {
  formatRelationshipLabel,
  formatSourceClassLabel,
  getConfidenceTextClass,
} from '../../lib/filtering/filterSignals';

interface ExpandedViewProps {
  edition: ParsedEdition;
  filteredSignals: ParsedSignal[];
  focusedSignalId: string | null;
  onFocusSignal: (signalId: string | null) => void;
}

const NARRATIVE_FIELDS: Array<{
  key: keyof ParsedSignal['sections'];
  label: string;
}> = [
  { key: 'whatHappened', label: 'What Happened' },
  { key: 'verifiedFacts', label: 'Verified Facts' },
  { key: 'timeline', label: 'Timeline' },
  { key: 'whyItMatters', label: 'Why It Matters' },
  { key: 'sourcePerspectives', label: 'Source Perspectives' },
  { key: 'analysis', label: 'Analysis' },
  { key: 'uncertainties', label: 'Uncertainties' },
  { key: 'scenarios', label: 'Scenarios' },
  { key: 'personalRelevance', label: 'Personal Relevance' },
  { key: 'whatToWatch', label: 'What to Watch' },
];

export const ExpandedView: React.FC<ExpandedViewProps> = ({
  edition,
  filteredSignals,
  focusedSignalId,
  onFocusSignal,
}) => {
  useEffect(() => {
    if (focusedSignalId) {
      const el = document.getElementById(`signal-${focusedSignalId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [focusedSignalId]);

  return (
    <div className="space-y-8">
      <header className="border-b border-stone-200 dark:border-stone-800 pb-4 flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-[#1C1917] dark:text-[#EFECE6]">
            Expanded Dossiers & Timelines
          </h1>
          <p className="mt-1 text-sm text-[#57534E] dark:text-[#A8A29E]">
            Full narrative, chronological developments, claim-level evidence ledgers, and source
            provenance for each signal.
          </p>
        </div>
        <span className="font-mono-tabular text-xs text-[#57534E] dark:text-[#A8A29E]">
          {filteredSignals.length} {filteredSignals.length === 1 ? 'dossier' : 'dossiers'}
        </span>
      </header>

      {filteredSignals.length === 0 ? (
        <div className="p-8 text-center border border-stone-200 dark:border-stone-800 rounded-lg bg-[#F3EFE6]/30 dark:bg-[#191815]">
          <p className="text-sm text-[#57534E] dark:text-[#A8A29E]">
            No signals match the active filter criteria.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {filteredSignals.map((sig) => {
            const isExpanded = focusedSignalId === null || focusedSignalId === sig.signal_id;
            const sourceMap = new Map(sig.sources.map((s) => [s.source_id, s]));

            return (
              <article
                key={sig.signal_id}
                id={`signal-${sig.signal_id}`}
                className="bg-[#FBF9F5] dark:bg-[#191815] border border-stone-200 dark:border-stone-800 rounded-lg p-6 sm:p-8 space-y-6 scroll-mt-24"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
                  <div className="space-y-2">
                    <SignalMetaLine signal={sig} />
                    <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#1C1917] dark:text-[#EFECE6] headline-balance">
                      {sig.headline}
                    </h2>
                  </div>

                  {focusedSignalId !== null && (
                    <button
                      type="button"
                      onClick={() =>
                        onFocusSignal(focusedSignalId === sig.signal_id ? null : sig.signal_id)
                      }
                      className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 text-xs font-medium border border-stone-300 dark:border-stone-700 rounded-md hover:bg-[#F3EFE6] dark:hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {isExpanded ? (
                        <>
                          Show all signals
                          <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
                        </>
                      ) : (
                        <>
                          Expand dossier
                          <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Timestamps & Provenance Dates Grid */}
                <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-[#F3EFE6]/60 dark:bg-[#141311] rounded-md text-xs tabular-nums">
                  <div>
                    <dt className="uppercase tracking-wider text-[#57534E] dark:text-[#A8A29E] font-medium">
                      Event Window
                    </dt>
                    <dd className="mt-1 font-mono-tabular text-[#1C1917] dark:text-[#EFECE6]">
                      {sig.event.start_date || 'Unspecified'}
                      {sig.event.end_date && sig.event.end_date !== sig.event.start_date
                        ? ` → ${sig.event.end_date}`
                        : ''}
                    </dd>
                  </div>
                  <div>
                    <dt className="uppercase tracking-wider text-[#57534E] dark:text-[#A8A29E] font-medium">
                      Published At
                    </dt>
                    <dd className="mt-1 font-mono-tabular text-[#1C1917] dark:text-[#EFECE6]">
                      {sig.published_at || 'Unspecified'}
                    </dd>
                  </div>
                  <div>
                    <dt className="uppercase tracking-wider text-[#57534E] dark:text-[#A8A29E] font-medium">
                      First Verified
                    </dt>
                    <dd className="mt-1 font-mono-tabular text-[#1C1917] dark:text-[#EFECE6]">
                      {sig.first_verified_at || 'Unspecified'}
                    </dd>
                  </div>
                  <div>
                    <dt className="uppercase tracking-wider text-[#57534E] dark:text-[#A8A29E] font-medium">
                      Signal Updated
                    </dt>
                    <dd className="mt-1 font-mono-tabular text-[#1C1917] dark:text-[#EFECE6]">
                      {sig.updated_at || 'Unspecified'}
                    </dd>
                  </div>
                </dl>

                {/* Confidence & Importance separation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="p-4 border border-stone-200 dark:border-stone-800 rounded-md">
                    <span className="block text-xs uppercase tracking-wider font-medium text-[#57534E] dark:text-[#A8A29E]">
                      Importance Rating
                    </span>
                    <p className="mt-1 font-semibold text-[#1C1917] dark:text-[#EFECE6] tabular-nums">
                      {sig.importance} / 5
                    </p>
                    {sig.event.geography.length > 0 && (
                      <p className="mt-1 text-xs text-[#57534E] dark:text-[#A8A29E]">
                        Geography: {sig.event.geography.join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="p-4 border border-stone-200 dark:border-stone-800 rounded-md">
                    <span className="block text-xs uppercase tracking-wider font-medium text-[#57534E] dark:text-[#A8A29E]">
                      Confidence Level & Rationale
                    </span>
                    <p className="mt-1">
                      <span className={`font-semibold capitalize ${getConfidenceTextClass(sig.confidence.overall)}`}>
                        {sig.confidence.overall}
                      </span>
                      {' — '}
                      <span className="text-[#44403C] dark:text-[#D6D3D1]">
                        {sig.confidence.rationale || 'No rationale supplied.'}
                      </span>
                    </p>
                  </div>
                </div>

                {isExpanded && (
                  <>
                    {/* Narrative Subsections */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-2">
                      <div className="lg:col-span-8 space-y-6">
                        {NARRATIVE_FIELDS.map(({ key, label }) => {
                          const content = sig.sections[key];
                          if (!content || typeof content !== 'string') return null;
                          return (
                            <section key={key} className="space-y-2">
                              <h3 className="text-xs uppercase tracking-widest font-semibold text-[#57534E] dark:text-[#A8A29E] border-b border-stone-200/80 dark:border-stone-800/80 pb-1">
                                {label}
                              </h3>
                              <SafeMarkdown
                                content={content}
                                onSelectSignal={(id) => onFocusSignal(id)}
                              />
                            </section>
                          );
                        })}

                        {sig.sections.extraSections.map((extra) => (
                          <section key={extra.heading} className="space-y-2">
                            <h3 className="text-xs uppercase tracking-widest font-semibold text-[#57534E] dark:text-[#A8A29E] border-b border-stone-200/80 dark:border-stone-800/80 pb-1">
                              {extra.heading}
                            </h3>
                            <SafeMarkdown
                              content={extra.content}
                              onSelectSignal={(id) => onFocusSignal(id)}
                            />
                          </section>
                        ))}
                      </div>

                      {/* Side Rail: Related Signals, Tags, Quick Origin Summary */}
                      <aside className="lg:col-span-4 space-y-5">
                        <div className="p-4 bg-[#F3EFE6]/60 dark:bg-[#141311] border border-stone-200 dark:border-stone-800 rounded-md space-y-3">
                          <h3 className="text-xs uppercase tracking-widest font-semibold text-[#57534E] dark:text-[#A8A29E]">
                            Reporting Origin Summary
                          </h3>
                          <p className="text-sm text-[#1C1917] dark:text-[#EFECE6] tabular-nums">
                            <strong className="font-semibold">{sig.independentOriginCount}</strong>{' '}
                            unique independent reporting{' '}
                            {sig.independentOriginCount === 1 ? 'origin' : 'origins'} across{' '}
                            <strong className="font-semibold">{sig.sources.length}</strong> total
                            source {sig.sources.length === 1 ? 'record' : 'records'}.
                          </p>
                          {sig.independentGroups.length > 0 && (
                            <p className="text-xs text-[#57534E] dark:text-[#A8A29E]">
                              Independent groups: {sig.independentGroups.join(', ')}
                            </p>
                          )}
                        </div>

                        {sig.related_signal_ids.length > 0 && (
                          <div className="p-4 border border-stone-200 dark:border-stone-800 rounded-md space-y-2.5">
                            <h3 className="text-xs uppercase tracking-widest font-semibold text-[#57534E] dark:text-[#A8A29E]">
                              Related Signals
                            </h3>
                            <ul className="space-y-1.5">
                              {sig.related_signal_ids.map((relId) => {
                                const relSig = edition.signals.find((s) => s.signal_id === relId);
                                return (
                                  <li key={relId}>
                                    <button
                                      type="button"
                                      onClick={() => onFocusSignal(relId)}
                                      className="text-left w-full p-2 rounded hover:bg-[#F3EFE6] dark:hover:bg-stone-800 transition-colors cursor-pointer"
                                    >
                                      <span className="block font-mono-tabular text-xs font-medium text-[#1E3A8A] dark:text-[#93C5FD]">
                                        {relId}
                                      </span>
                                      {relSig && (
                                        <span className="block text-xs text-[#44403C] dark:text-[#D6D3D1] mt-0.5">
                                          {relSig.headline}
                                        </span>
                                      )}
                                    </button>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )}

                        {sig.tags.length > 0 && (
                          <div className="p-4 border border-stone-200 dark:border-stone-800 rounded-md space-y-1.5">
                            <h3 className="text-xs uppercase tracking-widest font-semibold text-[#57534E] dark:text-[#A8A29E]">
                              Topics & Tags
                            </h3>
                            <p className="text-xs text-[#44403C] dark:text-[#D6D3D1]">
                              {sig.tags.join(' · ')}
                            </p>
                          </div>
                        )}
                      </aside>
                    </div>

                    {/* Claim-Level Evidence Ledger */}
                    <section className="space-y-3 pt-4 border-t border-stone-200 dark:border-stone-800">
                      <h3 className="text-xs uppercase tracking-widest font-semibold text-[#57534E] dark:text-[#A8A29E]">
                        Claim-Level Evidence Ledger ({sig.claims.length})
                      </h3>
                      {sig.claims.length === 0 ? (
                        <p className="text-sm text-[#57534E] dark:text-[#A8A29E]">
                          No structured claims recorded for this signal.
                        </p>
                      ) : (
                        <div className="overflow-x-auto border border-stone-200 dark:border-stone-800 rounded-md">
                          <table className="w-full text-sm text-left border-collapse">
                            <thead>
                              <tr className="bg-[#F3EFE6] dark:bg-[#141311] text-xs uppercase tracking-wider text-[#57534E] dark:text-[#A8A29E]">
                                <th className="px-3 py-2.5 font-semibold">Claim ID</th>
                                <th className="px-3 py-2.5 font-semibold">Factual Statement</th>
                                <th className="px-3 py-2.5 font-semibold">Status</th>
                                <th className="px-3 py-2.5 font-semibold">Confidence</th>
                                <th className="px-3 py-2.5 font-semibold">Supporting Sources</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                              {sig.claims.map((claim) => (
                                <tr key={claim.claim_id} className="align-top">
                                  <td className="px-3 py-2.5 font-mono-tabular text-xs whitespace-nowrap">
                                    {claim.claim_id}
                                  </td>
                                  <td className="px-3 py-2.5 text-[#1C1917] dark:text-[#EFECE6]">
                                    {claim.statement}
                                  </td>
                                  <td className="px-3 py-2.5 text-xs capitalize whitespace-nowrap">
                                    {claim.status.replace(/_/g, ' ')}
                                  </td>
                                  <td
                                    className={`px-3 py-2.5 text-xs font-semibold capitalize whitespace-nowrap ${getConfidenceTextClass(
                                      claim.confidence
                                    )}`}
                                  >
                                    {claim.confidence}
                                  </td>
                                  <td className="px-3 py-2.5 text-xs">
                                    <div className="flex flex-col gap-1">
                                      {claim.source_ids.map((sid) => {
                                        const src = sourceMap.get(sid);
                                        if (!src) {
                                          return (
                                            <span
                                              key={sid}
                                              className="font-mono-tabular text-[#991B1B] dark:text-[#FCA5A5]"
                                            >
                                              [{sid}] Missing source
                                            </span>
                                          );
                                        }
                                        return (
                                          <span key={sid}>
                                            <span className="font-mono-tabular font-semibold">
                                              [{sid}]
                                            </span>{' '}
                                            {src.outlet}
                                          </span>
                                        );
                                      })}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </section>

                    {/* Signal Source Ledger */}
                    <section className="space-y-3 pt-4 border-t border-stone-200 dark:border-stone-800">
                      <h3 className="text-xs uppercase tracking-widest font-semibold text-[#57534E] dark:text-[#A8A29E]">
                        Source Ledger ({sig.sources.length})
                      </h3>
                      {sig.sources.length === 0 ? (
                        <p className="text-sm text-[#57534E] dark:text-[#A8A29E]">
                          No source records listed.
                        </p>
                      ) : (
                        <div className="overflow-x-auto border border-stone-200 dark:border-stone-800 rounded-md">
                          <table className="w-full text-sm text-left border-collapse">
                            <thead>
                              <tr className="bg-[#F3EFE6] dark:bg-[#141311] text-xs uppercase tracking-wider text-[#57534E] dark:text-[#A8A29E]">
                                <th className="px-3 py-2.5 font-semibold">ID</th>
                                <th className="px-3 py-2.5 font-semibold">Outlet & Document</th>
                                <th className="px-3 py-2.5 font-semibold">Class</th>
                                <th className="px-3 py-2.5 font-semibold">Origin Group</th>
                                <th className="px-3 py-2.5 font-semibold">Independent?</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                              {sig.sources.map((src) => (
                                <tr key={src.source_id} className="align-top">
                                  <td className="px-3 py-2.5 font-mono-tabular text-xs whitespace-nowrap">
                                    {src.source_id}
                                  </td>
                                  <td className="px-3 py-2.5 space-y-1">
                                    <div className="font-semibold text-[#1C1917] dark:text-[#EFECE6]">
                                      {src.outlet}
                                    </div>
                                    {src.urlSafe ? (
                                      <a
                                        href={src.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs text-[#1E3A8A] dark:text-[#93C5FD] underline underline-offset-4 hover:opacity-80"
                                      >
                                        <span>{src.title}</span>
                                        <ExternalLink className="w-3 h-3 shrink-0" aria-hidden="true" />
                                      </a>
                                    ) : (
                                      <span className="block text-xs text-[#991B1B] dark:text-[#FCA5A5]">
                                        {src.title} (URL invalid or blocked)
                                      </span>
                                    )}
                                    <div className="text-xs text-[#57534E] dark:text-[#A8A29E] font-mono-tabular">
                                      Published: {src.published_at || 'N/A'} · Accessed:{' '}
                                      {src.accessed_at || 'N/A'}
                                    </div>
                                  </td>
                                  <td className="px-3 py-2.5 text-xs whitespace-nowrap">
                                    <div>{formatSourceClassLabel(src.source_class)}</div>
                                    <div className="text-[#57534E] dark:text-[#A8A29E] capitalize">
                                      {formatRelationshipLabel(src.relationship)}
                                    </div>
                                  </td>
                                  <td className="px-3 py-2.5 font-mono-tabular text-xs whitespace-nowrap">
                                    {src.independence_group || 'N/A'}
                                  </td>
                                  <td className="px-3 py-2.5 text-xs whitespace-nowrap">
                                    {src.count_as_independent ? (
                                      <span className="font-semibold text-[#14532D] dark:text-[#86EFAC]">
                                        Yes (Origin)
                                      </span>
                                    ) : (
                                      <span className="text-[#57534E] dark:text-[#A8A29E]">
                                        No ({formatRelationshipLabel(src.relationship)})
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </section>
                  </>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
