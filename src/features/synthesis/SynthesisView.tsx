import React, { useMemo } from 'react';
import { ArrowUpRight, Info } from 'lucide-react';
import type { ParsedEdition, ParsedSignal, UiLanguage } from '../../types/edition';
import { getUiStrings } from '../../lib/i18n/uiStrings';
import { domainAccentTextClass } from '../../lib/filtering/filterSignals';
import { SafeMarkdown } from '../../components/editorial/SafeMarkdown';
import { ScenariosGrid } from '../../components/editorial/ScenariosGrid';

interface SynthesisViewProps {
  edition: ParsedEdition;
  lang: UiLanguage;
  onOpenSignal: (signalId: string) => void;
}

export const SynthesisView: React.FC<SynthesisViewProps> = ({
  edition,
  lang,
  onOpenSignal,
}) => {
  const t = getUiStrings(lang);

  const signalById = useMemo(() => {
    const map = new Map<string, ParsedSignal>();
    for (const s of edition.signals) map.set(s.signal_id, s);
    return map;
  }, [edition.signals]);

  const establishedThreads = useMemo(
    () => edition.crossDomainSynthesis.threads.filter((th) => !th.isUnestablished),
    [edition.crossDomainSynthesis.threads]
  );

  const unestablishedThreads = useMemo(
    () => edition.crossDomainSynthesis.threads.filter((th) => th.isUnestablished),
    [edition.crossDomainSynthesis.threads]
  );

  // Only surface horizon impacts actually present in parsed signals
  const signalsWithHorizons = useMemo(
    () =>
      edition.signals.filter((s) => s.sections.horizonImpacts.length > 0),
    [edition.signals]
  );

  // Surface structured conditional scenarios from Top Signals (in editorial order)
  const keyScenarioSignals = useMemo(() => {
    const out: ParsedSignal[] = [];
    const seen = new Set<string>();
    for (const ref of edition.executiveBriefing.topSignalRefs) {
      const sig = signalById.get(ref.signal_id);
      if (sig && sig.sections.scenarioItems.length > 0 && !seen.has(sig.signal_id)) {
        seen.add(sig.signal_id);
        out.push(sig);
      }
    }
    // Include high-importance economy signals if not already listed (up to 4 total to stay focused)
    for (const sig of edition.signals) {
      if (out.length >= 4) break;
      if (
        sig.domain === 'economy' &&
        sig.importance >= 4 &&
        sig.sections.scenarioItems.length > 0 &&
        !seen.has(sig.signal_id)
      ) {
        seen.add(sig.signal_id);
        out.push(sig);
      }
    }
    return out;
  }, [edition.executiveBriefing.topSignalRefs, edition.signals, signalById]);

  return (
    <div className="space-y-12 pb-16">
      {/* Page Header */}
      <header className="border-b border-[var(--ws-border)] pb-5 pt-2 space-y-2">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-[var(--ws-ink)]">
          {t.synthesis.title}
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-[var(--ws-ink-muted)]">
          {t.synthesis.subtitle}
        </p>
      </header>

      {/* 1. Cross-Domain Synthesis */}
      <section className="space-y-5">
        <div className="space-y-1">
          <h2 className="font-display text-xl font-semibold text-[var(--ws-ink)]">
            {t.synthesis.crossDomainTitle}
          </h2>
          <p className="text-xs text-[var(--ws-ink-muted)]">
            {edition.crossDomainSynthesis.intro || t.synthesis.crossDomainSubtitle}
          </p>
        </div>

        {establishedThreads.length === 0 && unestablishedThreads.length === 0 ? (
          edition.crossDomainSynthesis.rawMarkdown ? (
            <div className="ws-card p-6">
              <SafeMarkdown
                content={edition.crossDomainSynthesis.rawMarkdown}
                onSelectSignal={onOpenSignal}
              />
            </div>
          ) : (
            <p className="text-sm text-[var(--ws-ink-muted)]">
              {t.synthesis.noThreadsFallback}
            </p>
          )
        ) : (
          <div className="space-y-5">
            {/* Evidence-Linked Causal Threads */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {establishedThreads.map((thread, idx) => (
                <article
                  key={`${thread.title}-${idx}`}
                  className="ws-card p-6 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="font-mono-tabular text-[11px] font-semibold uppercase tracking-wider text-[var(--ws-world)]">
                      {t.synthesis.establishedLabel} · 0{idx + 1}
                    </div>
                    <h3 className="font-display text-lg font-semibold leading-snug text-[var(--ws-ink)]">
                      {thread.title}
                    </h3>
                    <SafeMarkdown
                      content={thread.content}
                      compact
                      onSelectSignal={onOpenSignal}
                    />
                  </div>

                  {thread.linkedSignalIds.length > 0 && (
                    <div className="border-t border-[var(--ws-border)] pt-3 space-y-1.5">
                      <div className="font-mono-tabular text-[10.5px] uppercase tracking-wider text-[var(--ws-ink-muted)]">
                        {t.synthesis.linkedSignalsLabel}
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                        {thread.linkedSignalIds.map((sid) => {
                          const target = signalById.get(sid);
                          return (
                            <button
                              key={sid}
                              type="button"
                              onClick={() => onOpenSignal(sid)}
                              className="inline-flex items-center gap-1 font-mono-tabular text-xs font-medium text-[var(--ws-ink)] hover:text-[var(--ws-world)] underline decoration-[var(--ws-border-strong)] underline-offset-2 cursor-pointer"
                            >
                              <span
                                className={
                                  target ? domainAccentTextClass(target.domain) : ''
                                }
                              >
                                {sid}
                              </span>
                              <ArrowUpRight className="h-3 w-3 opacity-60" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>

            {/* Explicitly Separated Unestablished Connections */}
            {unestablishedThreads.map((thread, idx) => (
              <div
                key={`unestablished-${idx}`}
                className="rounded-md border border-[var(--ws-border)] bg-[var(--ws-surface-subtle)] p-5 space-y-2.5"
              >
                <div className="font-mono-tabular text-[11px] font-semibold uppercase tracking-wider text-[var(--ws-ink-muted)]">
                  {t.synthesis.unestablishedLabel}
                </div>
                <h3 className="font-display text-base font-semibold text-[var(--ws-ink)]">
                  {thread.title}
                </h3>
                <SafeMarkdown
                  content={thread.content}
                  compact
                  onSelectSignal={onOpenSignal}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 2. Economic & Structural Time Horizons (Only when explicitly supported in edition content) */}
      {signalsWithHorizons.length > 0 && (
        <section className="space-y-5 border-t border-[var(--ws-border)] pt-8">
          <div className="space-y-1">
            <h2 className="font-display text-xl font-semibold text-[var(--ws-ink)]">
              {t.synthesis.impactAnalysisTitle}
            </h2>
            <p className="text-xs text-[var(--ws-ink-muted)]">
              {t.synthesis.impactAnalysisSubtitle}
            </p>
          </div>

          <div className="space-y-4">
            {signalsWithHorizons.map((sig) => (
              <div key={sig.signal_id} className="ws-card p-5 space-y-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--ws-border)] pb-3">
                  <button
                    type="button"
                    onClick={() => onOpenSignal(sig.signal_id)}
                    className="font-display text-base font-semibold text-[var(--ws-ink)] hover:text-[var(--ws-world)] text-left cursor-pointer"
                  >
                    {sig.headline}
                  </button>
                  <span className="font-mono-tabular text-xs text-[var(--ws-ink-muted)]">
                    {sig.signal_id}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {sig.sections.horizonImpacts.map((hi) => (
                    <div
                      key={hi.horizon}
                      className="rounded-md border border-[var(--ws-border)] bg-[var(--ws-surface-elevated)] p-3.5 space-y-1.5"
                    >
                      <div className="font-mono-tabular text-[11px] font-semibold uppercase tracking-wider text-[var(--ws-economy)]">
                        {hi.label}
                      </div>
                      <p className="text-xs leading-relaxed text-[var(--ws-ink-secondary)]">
                        {hi.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Conditional Scenarios Across Key Signals */}
      {keyScenarioSignals.length > 0 && (
        <section className="space-y-5 border-t border-[var(--ws-border)] pt-8">
          <div className="space-y-1">
            <h2 className="font-display text-xl font-semibold text-[var(--ws-ink)]">
              {t.synthesis.scenariosSectionTitle}
            </h2>
            <p className="text-xs text-[var(--ws-ink-muted)]">
              {t.synthesis.scenariosSectionSubtitle}
            </p>
          </div>

          <div className="space-y-5">
            {keyScenarioSignals.map((sig) => (
              <div key={sig.signal_id} className="ws-card p-5 sm:p-6 space-y-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenSignal(sig.signal_id)}
                    className="font-display text-base font-semibold text-[var(--ws-ink)] hover:text-[var(--ws-world)] text-left cursor-pointer"
                  >
                    {sig.headline}
                  </button>
                  <span
                    className={`font-mono-tabular text-xs font-medium ${domainAccentTextClass(
                      sig.domain
                    )}`}
                  >
                    {t.domains[sig.domain]} · {sig.signal_id}
                  </span>
                </div>
                <ScenariosGrid
                  items={sig.sections.scenarioItems}
                  rawFallback={sig.sections.scenarios}
                  lang={lang}
                  onSelectSignal={onOpenSignal}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Personal Implications */}
      {(edition.personalImplications.sections.length > 0 ||
        edition.personalImplications.rawMarkdown) && (
        <section className="space-y-5 border-t border-[var(--ws-border)] pt-8">
          <div className="space-y-2.5">
            <h2 className="font-display text-xl font-semibold text-[var(--ws-ink)]">
              {t.synthesis.personalImplicationsTitle}
            </h2>
            <div className="flex items-start gap-2.5 rounded-md border border-[var(--ws-border)] bg-[var(--ws-surface-subtle)] px-4 py-3 text-xs leading-relaxed text-[var(--ws-ink-muted)]">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                {edition.personalImplications.disclaimer ||
                  t.synthesis.personalDisclaimerFallback}
              </span>
            </div>
          </div>

          {edition.personalImplications.sections.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {edition.personalImplications.sections.map((sec, idx) => (
                <article key={`${sec.title}-${idx}`} className="ws-card p-5 space-y-2.5">
                  <h3 className="font-display text-base font-semibold text-[var(--ws-ink)]">
                    {sec.title}
                  </h3>
                  <SafeMarkdown
                    content={sec.content}
                    compact
                    onSelectSignal={onOpenSignal}
                  />
                </article>
              ))}
            </div>
          ) : (
            <div className="ws-card p-6">
              <SafeMarkdown
                content={edition.personalImplications.rawMarkdown}
                onSelectSignal={onOpenSignal}
              />
            </div>
          )}
        </section>
      )}

      {/* 5. Responsive Watchlist (Table on Desktop, Stacked Cards on Mobile) */}
      <section className="space-y-5 border-t border-[var(--ws-border)] pt-8">
        <div className="space-y-1">
          <h2 className="font-display text-xl font-semibold text-[var(--ws-ink)]">
            {t.synthesis.watchlistTitle}
          </h2>
          <p className="text-xs text-[var(--ws-ink-muted)]">
            {t.synthesis.watchlistSubtitle}
          </p>
        </div>

        {edition.watchlist.rows.length > 0 ? (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block ws-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-[var(--ws-surface-subtle)] font-mono-tabular text-[11px] uppercase tracking-wider text-[var(--ws-ink-muted)]">
                    <tr>
                      <th className="border-b border-[var(--ws-border)] px-4 py-3 w-[26%]">
                        {t.synthesis.watchlistCols.indicator}
                      </th>
                      <th className="border-b border-[var(--ws-border)] px-4 py-3 w-[36%]">
                        {t.synthesis.watchlistCols.whyItMatters}
                      </th>
                      <th className="border-b border-[var(--ws-border)] px-4 py-3 w-[16%]">
                        {t.synthesis.watchlistCols.nextCheckpoint}
                      </th>
                      <th className="border-b border-[var(--ws-border)] px-4 py-3 w-[22%]">
                        {t.synthesis.watchlistCols.signalsLinked}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--ws-border)] text-[13.5px]">
                    {edition.watchlist.rows.map((row, idx) => (
                      <tr
                        key={`${row.indicator}-${idx}`}
                        className="hover:bg-[var(--ws-surface-elevated)]"
                      >
                        <td className="px-4 py-3.5 align-top font-medium text-[var(--ws-ink)]">
                          {row.indicator}
                        </td>
                        <td className="px-4 py-3.5 align-top text-[var(--ws-ink-secondary)] leading-relaxed">
                          {row.whyItMatters}
                        </td>
                        <td className="px-4 py-3.5 align-top font-mono-tabular text-xs font-medium text-[var(--ws-ink)] whitespace-nowrap">
                          {row.nextCheckpoint}
                        </td>
                        <td className="px-4 py-3.5 align-top font-mono-tabular text-xs">
                          {row.signalsLinked.length === 0 ? (
                            <span className="text-[var(--ws-ink-muted)]">
                              {t.synthesis.watchlistUnlinked}
                            </span>
                          ) : (
                            <div className="flex flex-col gap-1">
                              {row.signalsLinked.map((sid) => {
                                const exists = signalById.has(sid);
                                return exists ? (
                                  <button
                                    key={sid}
                                    type="button"
                                    onClick={() => onOpenSignal(sid)}
                                    className="text-left text-[var(--ws-world)] underline decoration-[var(--ws-border-strong)] underline-offset-2 hover:decoration-current cursor-pointer"
                                  >
                                    {sid}
                                  </button>
                                ) : (
                                  <span
                                    key={sid}
                                    className="text-[var(--ws-ink-muted)]"
                                  >
                                    {sid}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Stacked Cards */}
            <div className="space-y-3 md:hidden">
              {edition.watchlist.rows.map((row, idx) => (
                <article
                  key={`mobile-${row.indicator}-${idx}`}
                  className="ws-card p-4 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-[var(--ws-ink)] leading-snug">
                      {row.indicator}
                    </h3>
                    <span className="shrink-0 font-mono-tabular text-[11px] font-medium text-[var(--ws-ink-muted)]">
                      {row.nextCheckpoint}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-[var(--ws-ink-secondary)]">
                    {row.whyItMatters}
                  </p>
                  <div className="pt-1 border-t border-[var(--ws-border)] font-mono-tabular text-[11px]">
                    {row.signalsLinked.length === 0 ? (
                      <span className="text-[var(--ws-ink-muted)]">
                        {t.synthesis.watchlistUnlinked}
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-x-3 gap-y-1">
                        {row.signalsLinked.map((sid) =>
                          signalById.has(sid) ? (
                            <button
                              key={sid}
                              type="button"
                              onClick={() => onOpenSignal(sid)}
                              className="text-[var(--ws-world)] underline underline-offset-2 cursor-pointer"
                            >
                              {sid}
                            </button>
                          ) : (
                            <span key={sid} className="text-[var(--ws-ink-muted)]">
                              {sid}
                            </span>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="ws-card p-6">
            <SafeMarkdown
              content={edition.watchlist.rawMarkdown}
              onSelectSignal={onOpenSignal}
            />
          </div>
        )}
      </section>
    </div>
  );
};
