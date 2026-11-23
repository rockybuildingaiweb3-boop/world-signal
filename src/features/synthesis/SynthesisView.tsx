import React from 'react';
import type { ParsedEdition } from '../../types/edition';
import { SafeMarkdown } from '../../components/SafeMarkdown';
import { getConfidenceTextClass } from '../../lib/filtering/filterSignals';

interface SynthesisViewProps {
  edition: ParsedEdition;
  onInspectSignal: (signalId: string) => void;
}

export const SynthesisView: React.FC<SynthesisViewProps> = ({
  edition,
  onInspectSignal,
}) => {
  const economicSignals = edition.signals.filter((s) => s.domain === 'economy');

  return (
    <div className="space-y-10">
      <header className="border-b border-stone-200 dark:border-stone-800 pb-4">
        <h1 className="font-display text-3xl font-semibold text-[#1C1917] dark:text-[#EFECE6]">
          Synthesis, Personal Implications & Watchlist
        </h1>
        <p className="mt-1 text-sm text-[#57534E] dark:text-[#A8A29E]">
          Cross-domain connections supported by edition evidence, macroeconomic interpretation,
          practical decision framing, and observable checkpoints.
        </p>
      </header>

      {/* Cross-Domain Synthesis */}
      <section aria-labelledby="synthesis-heading" className="space-y-4">
        <h2
          id="synthesis-heading"
          className="font-display text-2xl font-semibold text-[#1C1917] dark:text-[#EFECE6] border-b border-stone-200 dark:border-stone-800 pb-2"
        >
          Cross-Domain Synthesis
        </h2>
        {edition.crossDomainSynthesis ? (
          <SafeMarkdown
            content={edition.crossDomainSynthesis}
            onSelectSignal={onInspectSignal}
          />
        ) : (
          <p className="text-sm text-[#57534E] dark:text-[#A8A29E]">
            No cross-domain synthesis recorded for this edition.
          </p>
        )}
      </section>

      {/* Economic Outlook Framing */}
      <section aria-labelledby="econ-framing-heading" className="space-y-4">
        <h2
          id="econ-framing-heading"
          className="font-display text-2xl font-semibold text-[#1C1917] dark:text-[#EFECE6] border-b border-stone-200 dark:border-stone-800 pb-2"
        >
          Economic Outlook & Scenarios
        </h2>
        {economicSignals.length === 0 ? (
          <p className="text-sm text-[#57534E] dark:text-[#A8A29E]">
            No qualifying Economic Outlook signals in this edition.
          </p>
        ) : (
          <div className="space-y-4">
            {economicSignals.map((sig) => (
              <div
                key={sig.signal_id}
                className="p-5 bg-[#F3EFE6]/50 dark:bg-[#191815] border border-stone-200 dark:border-stone-800 rounded-lg space-y-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-[#57534E] dark:text-[#A8A29E] tabular-nums">
                      <button
                        type="button"
                        onClick={() => onInspectSignal(sig.signal_id)}
                        className="font-mono-tabular font-semibold text-[#1E3A8A] dark:text-[#93C5FD] underline underline-offset-4 cursor-pointer"
                      >
                        {sig.signal_id}
                      </button>
                      <span aria-hidden="true">·</span>
                      <span>Importance {sig.importance}/5</span>
                      <span aria-hidden="true">·</span>
                      <span className={`capitalize font-semibold ${getConfidenceTextClass(sig.confidence.overall)}`}>
                        {sig.confidence.overall} confidence
                      </span>
                    </div>
                    <h3 className="font-display text-xl font-semibold text-[#1C1917] dark:text-[#EFECE6] mt-1">
                      {sig.headline}
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {sig.sections.analysis && (
                    <div className="space-y-1.5">
                      <h4 className="text-xs uppercase tracking-wider font-semibold text-[#57534E] dark:text-[#A8A29E]">
                        Horizon Analysis
                      </h4>
                      <SafeMarkdown
                        content={sig.sections.analysis}
                        className="text-sm"
                        onSelectSignal={onInspectSignal}
                      />
                    </div>
                  )}
                  {sig.sections.scenarios && (
                    <div className="space-y-1.5">
                      <h4 className="text-xs uppercase tracking-wider font-semibold text-[#57534E] dark:text-[#A8A29E]">
                        Conditional Scenarios
                      </h4>
                      <SafeMarkdown
                        content={sig.sections.scenarios}
                        className="text-sm"
                        onSelectSignal={onInspectSignal}
                      />
                    </div>
                  )}
                </div>

                {sig.sections.personalRelevance && (
                  <div className="pt-3 border-t border-stone-200 dark:border-stone-800 space-y-1.5">
                    <h4 className="text-xs uppercase tracking-wider font-semibold text-[#57534E] dark:text-[#A8A29E]">
                      Personal Relevance
                    </h4>
                    <SafeMarkdown
                      content={sig.sections.personalRelevance}
                      className="text-sm"
                      onSelectSignal={onInspectSignal}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Personal Implications */}
      <section aria-labelledby="personal-impl-heading" className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-stone-200 dark:border-stone-800 pb-2">
          <h2
            id="personal-impl-heading"
            className="font-display text-2xl font-semibold text-[#1C1917] dark:text-[#EFECE6]"
          >
            Personal Implications
          </h2>
          <span className="text-xs text-[#57534E] dark:text-[#A8A29E]">
            General decision-support framework · Not individualized financial advice
          </span>
        </div>
        {edition.personalImplications ? (
          <SafeMarkdown
            content={edition.personalImplications}
            onSelectSignal={onInspectSignal}
          />
        ) : (
          <p className="text-sm text-[#57534E] dark:text-[#A8A29E]">
            No personal implications section recorded for this edition.
          </p>
        )}
      </section>

      {/* Watchlist */}
      <section aria-labelledby="watchlist-heading" className="space-y-4">
        <h2
          id="watchlist-heading"
          className="font-display text-2xl font-semibold text-[#1C1917] dark:text-[#EFECE6] border-b border-stone-200 dark:border-stone-800 pb-2"
        >
          Observable Watchlist
        </h2>

        {edition.watchlist.rows.length > 0 ? (
          <div className="overflow-x-auto border border-stone-200 dark:border-stone-800 rounded-lg bg-[#FBF9F5] dark:bg-[#191815]">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-[#F3EFE6] dark:bg-[#141311] text-xs uppercase tracking-wider text-[#57534E] dark:text-[#A8A29E]">
                  <th className="px-4 py-3 font-semibold">Indicator or Event</th>
                  <th className="px-4 py-3 font-semibold">Why It Matters</th>
                  <th className="px-4 py-3 font-semibold">Next Checkpoint</th>
                  <th className="px-4 py-3 font-semibold">Linked Signals</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                {edition.watchlist.rows.map((row, idx) => (
                  <tr key={`${row.indicator}-${idx}`} className="align-top">
                    <td className="px-4 py-3 font-medium text-[#1C1917] dark:text-[#EFECE6]">
                      {row.indicator}
                    </td>
                    <td className="px-4 py-3 text-[#44403C] dark:text-[#D6D3D1]">
                      {row.whyItMatters}
                    </td>
                    <td className="px-4 py-3 font-mono-tabular text-xs whitespace-nowrap text-[#1C1917] dark:text-[#EFECE6]">
                      {row.nextCheckpoint}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <div className="flex flex-wrap gap-2">
                        {row.signalsLinked.map((id) => (
                          <button
                            key={id}
                            type="button"
                            onClick={() => onInspectSignal(id)}
                            className="font-mono-tabular text-[#1E3A8A] dark:text-[#93C5FD] underline underline-offset-4 hover:opacity-80 cursor-pointer"
                          >
                            {id}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : edition.watchlist.rawMarkdown ? (
          <SafeMarkdown
            content={edition.watchlist.rawMarkdown}
            onSelectSignal={onInspectSignal}
          />
        ) : (
          <p className="text-sm text-[#57534E] dark:text-[#A8A29E]">
            No watchlist checkpoints recorded for this edition.
          </p>
        )}
      </section>
    </div>
  );
};
