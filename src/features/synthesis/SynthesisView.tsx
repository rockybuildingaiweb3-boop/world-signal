import React, { useMemo } from 'react';
import { ArrowUpRight, Info } from 'lucide-react';
import type { ParsedEdition, ParsedSignal, UiLanguage } from '../../types/edition';
import { getUiStrings } from '../../lib/i18n/uiStrings';
import { domainAccentTextClass } from '../../lib/filtering/filterSignals';
import { SafeMarkdown } from '../../components/editorial/SafeMarkdown';
import { ScenariosGrid } from '../../components/editorial/ScenariosGrid';
import { RelationshipExplorerMatrix } from './RelationshipExplorerMatrix';
import { WatchlistSection } from './WatchlistSection';

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
    () => edition.signals.filter((s) => s.sections.horizonImpacts.length > 0),
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
    <div className="space-y-14 pb-16 sm:pb-20">
      {/* Publication Strategy Dossier Masthead */}
      <header className="ws-masthead-rule py-5 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 font-mono-tabular text-[11px] uppercase tracking-[0.14em] text-[var(--ws-ink-muted)]">
          <span>{t.nav.synthesis}</span>
          <span>{edition.frontmatter.edition_date}</span>
        </div>
        <h1 className="font-display text-[1.65rem] sm:text-[2.2rem] font-semibold leading-[1.18] tracking-[-0.024em] text-[var(--ws-ink)] headline-balance">
          {t.synthesis.title}
        </h1>
        <p className="max-w-3xl text-[14px] leading-[1.65] text-[var(--ws-ink-muted)]">
          {t.synthesis.subtitle}
        </p>
      </header>

      {/* 1. Explicit Relationship Map & Matrix (Schema-v2 & Legacy Contextual) */}
      <RelationshipExplorerMatrix
        edition={edition}
        signalById={signalById}
        lang={lang}
        onOpenSignal={onOpenSignal}
      />

      {/* 2. Cross-Domain Synthesis — Magazine Monograph Layout */}
      <section className="space-y-7 ws-section-rule pt-8">
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h2 className="font-display text-[1.4rem] sm:text-[1.65rem] font-semibold tracking-[-0.018em] text-[var(--ws-ink)]">
              {t.synthesis.crossDomainTitle}
            </h2>
            <p className="max-w-3xl text-[12.5px] leading-relaxed text-[var(--ws-ink-muted)]">
              {edition.crossDomainSynthesis.intro || t.synthesis.crossDomainSubtitle}
            </p>
          </div>
        </div>

        {establishedThreads.length === 0 && unestablishedThreads.length === 0 ? (
          edition.crossDomainSynthesis.rawMarkdown ? (
            <div className="bg-[var(--ws-surface)] border border-[var(--ws-border)] rounded-[var(--ws-radius-sm)] p-6">
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
          <div className="space-y-8">
            {/* Evidence-Linked Causal Threads as Asymmetric Editorial Monographs */}
            <div className="divide-y divide-[var(--ws-border-strong)] border-y border-[var(--ws-border-strong)]">
              {establishedThreads.map((thread, idx) => (
                <article
                  key={`${thread.title}-${idx}`}
                  className="py-7 sm:py-8 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10"
                >
                  {/* Left Index & Causal Mechanism Rail */}
                  <div className="lg:col-span-4 space-y-4 min-w-0">
                    <div className="flex items-center gap-2.5">
                      <span
                        aria-hidden="true"
                        className="inline-block h-[2.5px] w-6 bg-[var(--ws-world)] shrink-0"
                      />
                      <span className="font-mono-tabular text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ws-world)]">
                        {t.synthesis.establishedLabel} · {String(idx + 1).padStart(2, '0')}
                      </span>
                    </div>

                    <h3 className="font-display text-[1.35rem] sm:text-[1.5rem] font-semibold leading-[1.26] tracking-[-0.018em] text-[var(--ws-ink)] headline-balance break-words">
                      {thread.title}
                    </h3>

                    {thread.linkedSignalIds.length > 0 && (
                      <div className="border-t border-[var(--ws-border)] pt-3.5 space-y-2">
                        <div className="font-mono-tabular text-[10.5px] uppercase tracking-[0.12em] text-[var(--ws-ink-muted)]">
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
                                className="inline-flex items-center gap-1 font-mono-tabular text-[11.5px] font-medium text-[var(--ws-ink)] hover:text-[var(--ws-world)] underline decoration-[var(--ws-border-strong)] underline-offset-4 cursor-pointer text-left break-all"
                              >
                                <span
                                  className={
                                    target ? domainAccentTextClass(target.domain) : ''
                                  }
                                >
                                  {sid}
                                </span>
                                <ArrowUpRight className="h-3 w-3 opacity-60 shrink-0" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Editorial Analysis Column */}
                  <div className="lg:col-span-8 lg:border-l lg:border-[var(--ws-border)] lg:pl-10 min-w-0">
                    <div className="max-w-[68ch]">
                      <SafeMarkdown
                        content={thread.content}
                        onSelectSignal={onOpenSignal}
                      />
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Explicitly Separated Unestablished Connections (Archival Exclusion Ledger) */}
            {unestablishedThreads.map((thread, idx) => (
              <div
                key={`unestablished-${idx}`}
                className="rounded-[var(--ws-radius-sm)] border border-dashed border-[var(--ws-border-strong)] bg-[var(--ws-surface-subtle)]/75 p-5 sm:p-6 space-y-2.5"
              >
                <div className="font-mono-tabular text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ws-ink-muted)]">
                  {t.synthesis.unestablishedLabel}
                </div>
                <h3 className="font-display text-[1.1rem] font-semibold text-[var(--ws-ink)]">
                  {thread.title}
                </h3>
                <div className="max-w-[74ch]">
                  <SafeMarkdown
                    content={thread.content}
                    compact
                    onSelectSignal={onOpenSignal}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 2. Economic & Structural Time Horizons (Connected Architectural Track) */}
      {signalsWithHorizons.length > 0 && (
        <section className="space-y-6 ws-section-rule pt-8">
          <div className="space-y-1">
            <h2 className="font-display text-[1.4rem] sm:text-[1.65rem] font-semibold tracking-[-0.018em] text-[var(--ws-ink)]">
              {t.synthesis.impactAnalysisTitle}
            </h2>
            <p className="text-[12.5px] text-[var(--ws-ink-muted)]">
              {t.synthesis.impactAnalysisSubtitle}
            </p>
          </div>

          <div className="space-y-6">
            {signalsWithHorizons.map((sig) => (
              <div
                key={sig.signal_id}
                className="rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-surface)] overflow-hidden"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--ws-border)] bg-[var(--ws-surface-elevated)] px-5 py-3.5">
                  <button
                    type="button"
                    onClick={() => onOpenSignal(sig.signal_id)}
                    className="font-display text-[1.08rem] font-semibold text-[var(--ws-ink)] hover:text-[var(--ws-world)] text-left cursor-pointer"
                  >
                    {sig.headline}
                  </button>
                  <span className="font-mono-tabular text-[11.5px] text-[var(--ws-ink-muted)] break-all sm:shrink-0">
                    {sig.signal_id}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[var(--ws-border)]">
                  {sig.sections.horizonImpacts.map((hi, hIdx) => (
                    <div
                      key={hi.horizon}
                      className="p-4 sm:p-5 space-y-2.5 relative"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono-tabular text-[11px] font-semibold uppercase tracking-[0.11em] text-[var(--ws-economy)]">
                            {hi.label}
                          </span>
                          <span className="font-mono-tabular text-[10.5px] text-[var(--ws-ink-faint)]">
                            0{hIdx + 1}
                          </span>
                        </div>
                        {/* Connected step-progression hairline */}
                        <div
                          aria-hidden="true"
                          className="flex items-center gap-1"
                        >
                          {sig.sections.horizonImpacts.map((_, stepIdx) => (
                            <span
                              key={stepIdx}
                              className={`h-[2px] flex-1 ${
                                stepIdx <= hIdx
                                  ? 'bg-[var(--ws-economy)]'
                                  : 'bg-[var(--ws-border-subtle)]'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-[13px] leading-[1.62] text-[var(--ws-ink-secondary)]">
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
        <section className="space-y-6 ws-section-rule pt-8">
          <div className="space-y-1">
            <h2 className="font-display text-[1.4rem] sm:text-[1.65rem] font-semibold tracking-[-0.018em] text-[var(--ws-ink)]">
              {t.synthesis.scenariosSectionTitle}
            </h2>
            <p className="text-[12.5px] text-[var(--ws-ink-muted)]">
              {t.synthesis.scenariosSectionSubtitle}
            </p>
          </div>

          <div className="space-y-8">
            {keyScenarioSignals.map((sig) => (
              <div
                key={sig.signal_id}
                className="space-y-3.5 border-b border-[var(--ws-border)] pb-7 last:border-b-0 last:pb-0"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenSignal(sig.signal_id)}
                    className="font-display text-[1.15rem] sm:text-[1.25rem] font-semibold text-[var(--ws-ink)] hover:text-[var(--ws-world)] text-left cursor-pointer headline-balance"
                  >
                    {sig.headline}
                  </button>
                  <span
                    className={`font-mono-tabular text-[11.5px] font-semibold break-words min-w-0 ${domainAccentTextClass(
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

      {/* 4. Personal Implications — Broadsheet Editorial Advisory */}
      {(edition.personalImplications.sections.length > 0 ||
        edition.personalImplications.rawMarkdown) && (
        <section className="space-y-6 ws-section-rule pt-8">
          <div className="space-y-3">
            <h2 className="font-display text-[1.4rem] sm:text-[1.65rem] font-semibold tracking-[-0.018em] text-[var(--ws-ink)]">
              {t.synthesis.personalImplicationsTitle}
            </h2>
            <div className="ws-folio-note flex items-start gap-2.5 px-4 py-3 text-[12.5px] leading-relaxed text-[var(--ws-ink-muted)]">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                {edition.personalImplications.disclaimer ||
                  t.synthesis.personalDisclaimerFallback}
              </span>
            </div>
          </div>

          {edition.personalImplications.sections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 border-y border-[var(--ws-border-strong)] bg-[var(--ws-surface)]">
              {edition.personalImplications.sections.map((sec, idx) => (
                <article
                  key={`${sec.title}-${idx}`}
                  className={`p-5 sm:p-6 space-y-3 ${
                    idx % 2 === 1 ? 'md:border-l md:border-[var(--ws-border)]' : ''
                  } ${
                    idx > 0 ? 'border-t border-[var(--ws-border)]' : ''
                  } ${idx < 2 ? 'md:border-t-0' : ''}`}
                >
                  <div className="flex items-baseline justify-between gap-2 border-b border-[var(--ws-border-subtle)] pb-2.5">
                    <h3 className="font-display text-[1.12rem] font-semibold text-[var(--ws-ink)]">
                      {sec.title}
                    </h3>
                    <span className="font-display text-[1.05rem] font-semibold text-[var(--ws-ink-faint)] tabular-nums shrink-0">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <SafeMarkdown
                    content={sec.content}
                    compact
                    onSelectSignal={onOpenSignal}
                  />
                </article>
              ))}
            </div>
          ) : (
            <div className="bg-[var(--ws-surface)] border border-[var(--ws-border)] rounded-[var(--ws-radius-sm)] p-6">
              <SafeMarkdown
                content={edition.personalImplications.rawMarkdown}
                onSelectSignal={onOpenSignal}
              />
            </div>
          )}
        </section>
      )}

      {/* 5. Responsive Watchlist */}
      <WatchlistSection
        rows={edition.watchlist.rows}
        rawMarkdown={edition.watchlist.rawMarkdown}
        signalById={signalById}
        lang={lang}
        onOpenSignal={onOpenSignal}
      />
    </div>
  );
};
