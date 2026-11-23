import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { ParsedEdition, ParsedSignal, SignalDomain } from '../../types/edition';
import { SafeMarkdown } from '../../components/SafeMarkdown';
import { SignalMetaLine } from '../../components/SignalMetaLine';
import { formatDomainLabel, getConfidenceTextClass } from '../../lib/filtering/filterSignals';

interface BriefingViewProps {
  edition: ParsedEdition;
  filteredSignals: ParsedSignal[];
  onInspectSignal: (signalId: string) => void;
}

export const BriefingView: React.FC<BriefingViewProps> = ({
  edition,
  filteredSignals,
  onInspectSignal,
}) => {
  const { frontmatter, executiveBriefing, domainIntros, signals } = edition;

  const domainCounts: Record<SignalDomain, number> = {
    world: signals.filter((s) => s.domain === 'world').length,
    ai: signals.filter((s) => s.domain === 'ai').length,
    economy: signals.filter((s) => s.domain === 'economy').length,
  };

  const prioritizedSignals = [...filteredSignals].sort((a, b) => {
    if (b.importance !== a.importance) return b.importance - a.importance;
    return a.signal_id.localeCompare(b.signal_id);
  });

  return (
    <div className="space-y-10">
      {/* Edition Dossier Masthead */}
      <header className="pb-8 border-b border-stone-200 dark:border-stone-800 space-y-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs uppercase tracking-widest text-[#57534E] dark:text-[#A8A29E] tabular-nums">
          <span>Edition {frontmatter.edition_date}</span>
          <span aria-hidden="true">·</span>
          <span className="capitalize">Status: {frontmatter.edition_status}</span>
          <span aria-hidden="true">·</span>
          <span className="capitalize">Cycle: {frontmatter.sync_run}</span>
          <span aria-hidden="true">·</span>
          <span>Timezone: {frontmatter.edition_timezone}</span>
          <span aria-hidden="true">·</span>
          <span>Language: {frontmatter.content_language}</span>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl lg:text-[42px] font-semibold tracking-tight text-[#1C1917] dark:text-[#EFECE6] leading-[1.14] headline-balance max-w-4xl">
          {frontmatter.edition_title}
        </h1>

        {(frontmatter.summary || executiveBriefing.summaryText) && (
          <p className="text-base sm:text-lg text-[#44403C] dark:text-[#D6D3D1] leading-relaxed max-w-3xl">
            {executiveBriefing.summaryText || frontmatter.summary}
          </p>
        )}

        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 text-xs text-[#57534E] dark:text-[#A8A29E] tabular-nums">
          <div>
            <dt className="uppercase tracking-wider font-medium">Updated Timestamp</dt>
            <dd className="mt-0.5 font-mono-tabular text-[#1C1917] dark:text-[#EFECE6]">
              {frontmatter.updated_at || 'Not specified'}
            </dd>
          </div>
          <div>
            <dt className="uppercase tracking-wider font-medium">Coverage Window</dt>
            <dd className="mt-0.5 font-mono-tabular text-[#1C1917] dark:text-[#EFECE6]">
              {frontmatter.coverage_window_start && frontmatter.coverage_window_end
                ? `${frontmatter.coverage_window_start} → ${frontmatter.coverage_window_end}`
                : 'Not specified'}
            </dd>
          </div>
          <div>
            <dt className="uppercase tracking-wider font-medium">Edition Source</dt>
            <dd className="mt-0.5 font-mono-tabular text-[#1C1917] dark:text-[#EFECE6] truncate">
              {edition.sourceLabel}
            </dd>
          </div>
        </dl>
      </header>

      {/* Executive Briefing Top Signals */}
      <section aria-labelledby="exec-briefing-heading" className="space-y-4">
        <div className="flex items-baseline justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-2">
          <h2
            id="exec-briefing-heading"
            className="font-display text-2xl font-semibold text-[#1C1917] dark:text-[#EFECE6]"
          >
            Executive Briefing
          </h2>
          <span className="text-xs uppercase tracking-wider text-[#57534E] dark:text-[#A8A29E] tabular-nums">
            {executiveBriefing.topSignalRefs.length} highlighted{' '}
            {executiveBriefing.topSignalRefs.length === 1 ? 'signal' : 'signals'}
          </span>
        </div>

        {executiveBriefing.topSignalRefs.length > 0 ? (
          <ol className="divide-y divide-stone-200 dark:divide-stone-800 border border-stone-200 dark:border-stone-800 rounded-lg bg-[#F3EFE6]/50 dark:bg-[#191815]">
            {executiveBriefing.topSignalRefs.map((ref, idx) => {
              const matched = signals.find((s) => s.signal_id === ref.signal_id);
              return (
                <li
                  key={ref.signal_id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                >
                  <div className="space-y-1.5 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#57534E] dark:text-[#A8A29E] tabular-nums">
                      <span className="font-mono-tabular font-semibold text-[#9A3412] dark:text-[#FDBA74]">
                        {String(idx + 1).padStart(2, '0')}.
                      </span>
                      <span className="font-mono-tabular text-[#1C1917] dark:text-[#EFECE6]">
                        {ref.signal_id}
                      </span>
                      {matched && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{formatDomainLabel(matched.domain)}</span>
                          <span aria-hidden="true">·</span>
                          <span>Importance {matched.importance}/5</span>
                          <span aria-hidden="true">·</span>
                          <span className={`capitalize font-medium ${getConfidenceTextClass(matched.confidence.overall)}`}>
                            {matched.confidence.overall} confidence
                          </span>
                        </>
                      )}
                    </div>
                    {matched && (
                      <h3 className="font-display text-lg font-medium text-[#1C1917] dark:text-[#EFECE6]">
                        {matched.headline}
                      </h3>
                    )}
                    <p className="text-sm text-[#44403C] dark:text-[#D6D3D1] leading-relaxed">
                      {ref.summary}
                    </p>
                  </div>
                  {matched && (
                    <button
                      type="button"
                      onClick={() => onInspectSignal(ref.signal_id)}
                      className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 text-xs font-medium text-[#1C1917] dark:text-[#EFECE6] border border-stone-300 dark:border-stone-700 rounded-md hover:bg-[#FBF9F5] dark:hover:bg-[#24221E] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Inspect signal
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  )}
                </li>
              );
            })}
          </ol>
        ) : (
          <SafeMarkdown
            content={executiveBriefing.rawMarkdown}
            onSelectSignal={onInspectSignal}
          />
        )}
      </section>

      {/* Three Domain Coverage Summary */}
      <section aria-labelledby="domain-overview-heading" className="space-y-4">
        <h2
          id="domain-overview-heading"
          className="font-display text-2xl font-semibold text-[#1C1917] dark:text-[#EFECE6] border-b border-stone-200 dark:border-stone-800 pb-2"
        >
          Domain Coverage
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['world', 'ai', 'economy'] as SignalDomain[]).map((domain) => (
            <div
              key={domain}
              className="p-5 bg-[#F3EFE6]/50 dark:bg-[#191815] border border-stone-200 dark:border-stone-800 rounded-lg space-y-2"
            >
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-display text-lg font-semibold text-[#1C1917] dark:text-[#EFECE6]">
                  {formatDomainLabel(domain)}
                </h3>
                <span className="font-mono-tabular text-xs text-[#57534E] dark:text-[#A8A29E]">
                  {domainCounts[domain]} {domainCounts[domain] === 1 ? 'signal' : 'signals'}
                </span>
              </div>
              {domainIntros[domain] ? (
                <SafeMarkdown
                  content={domainIntros[domain]}
                  className="text-sm"
                  onSelectSignal={onInspectSignal}
                />
              ) : (
                <p className="text-sm text-[#57534E] dark:text-[#A8A29E]">
                  {domainCounts[domain] === 0
                    ? 'No qualifying developments recorded in this domain for this edition.'
                    : 'Signals prioritized by editorial consequence and verified evidence.'}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Prioritized Signals List */}
      <section aria-labelledby="signals-briefing-heading" className="space-y-4">
        <div className="flex items-baseline justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-2">
          <h2
            id="signals-briefing-heading"
            className="font-display text-2xl font-semibold text-[#1C1917] dark:text-[#EFECE6]"
          >
            Signals Overview
          </h2>
          <span className="text-xs text-[#57534E] dark:text-[#A8A29E] tabular-nums">
            Ordered by importance (1–5) · Confidence assessed separately
          </span>
        </div>

        {prioritizedSignals.length === 0 ? (
          <div className="p-8 text-center border border-stone-200 dark:border-stone-800 rounded-lg bg-[#F3EFE6]/30 dark:bg-[#191815]">
            <p className="text-sm text-[#57534E] dark:text-[#A8A29E]">
              No signals match the active filter criteria.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {prioritizedSignals.map((sig) => (
              <article
                key={sig.signal_id}
                className="p-6 bg-[#FBF9F5] dark:bg-[#191815] border border-stone-200 dark:border-stone-800 rounded-lg space-y-4"
              >
                <div className="space-y-2">
                  <SignalMetaLine signal={sig} />
                  <h3 className="font-display text-xl sm:text-2xl font-semibold text-[#1C1917] dark:text-[#EFECE6] headline-balance">
                    {sig.headline}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-3 border-y border-stone-200 dark:border-stone-800 text-sm">
                  <div>
                    <span className="block text-xs uppercase tracking-wider text-[#57534E] dark:text-[#A8A29E] font-medium">
                      Importance Assessment
                    </span>
                    <p className="mt-1 font-medium text-[#1C1917] dark:text-[#EFECE6] tabular-nums">
                      {sig.importance} / 5
                      {sig.event.geography.length > 0 && (
                        <span className="font-normal text-[#57534E] dark:text-[#A8A29E]">
                          {' '}
                          · Geography: {sig.event.geography.join(', ')}
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="block text-xs uppercase tracking-wider text-[#57534E] dark:text-[#A8A29E] font-medium">
                      Confidence Rationale
                    </span>
                    <p className="mt-1 text-[#44403C] dark:text-[#D6D3D1]">
                      <span className={`font-semibold capitalize ${getConfidenceTextClass(sig.confidence.overall)}`}>
                        {sig.confidence.overall}:
                      </span>{' '}
                      {sig.confidence.rationale || 'No rationale recorded.'}
                    </p>
                  </div>
                </div>

                {sig.sections.whatHappened && (
                  <div className="space-y-1">
                    <h4 className="text-xs uppercase tracking-wider font-semibold text-[#57534E] dark:text-[#A8A29E]">
                      What Happened
                    </h4>
                    <SafeMarkdown
                      content={sig.sections.whatHappened}
                      onSelectSignal={onInspectSignal}
                    />
                  </div>
                )}

                {sig.sections.whyItMatters && (
                  <div className="space-y-1">
                    <h4 className="text-xs uppercase tracking-wider font-semibold text-[#57534E] dark:text-[#A8A29E]">
                      Why It Matters
                    </h4>
                    <SafeMarkdown
                      content={sig.sections.whyItMatters}
                      onSelectSignal={onInspectSignal}
                    />
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-stone-200/70 dark:border-stone-800/70 text-xs text-[#57534E] dark:text-[#A8A29E] tabular-nums">
                  <div className="flex flex-wrap items-center gap-2">
                    <span>{sig.claims.length} tracked {sig.claims.length === 1 ? 'claim' : 'claims'}</span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {sig.sources.length} source {sig.sources.length === 1 ? 'record' : 'records'} ({sig.independentOriginCount} independent)
                    </span>
                    {sig.tags.length > 0 && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>Tags: {sig.tags.join(', ')}</span>
                      </>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => onInspectSignal(sig.signal_id)}
                    className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 text-xs font-medium bg-[#1C1917] dark:bg-[#EFECE6] text-[#FBF9F5] dark:text-[#121110] rounded-md hover:opacity-90 transition-opacity whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Open full dossier & timeline
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
