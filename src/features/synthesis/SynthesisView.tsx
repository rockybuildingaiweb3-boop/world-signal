import React, { useMemo } from 'react';
import { ArrowRight, ArrowUpRight, Info } from 'lucide-react';
import type { ParsedEdition, ParsedSignal, UiLanguage } from '../../types/edition';
import { getUiStrings } from '../../lib/i18n/uiStrings';
import { domainAccentTextClass } from '../../lib/filtering/filterSignals';
import { SafeMarkdown } from '../../components/editorial/SafeMarkdown';
import { ScenariosGrid } from '../../components/editorial/ScenariosGrid';
import { RelationshipExplorerMatrix } from './RelationshipExplorerMatrix';
import { WatchlistSection } from './WatchlistSection';
import { DocumentaryImageBreak } from '../../components/editorial/compositions/DocumentaryImageBreak';
import { getInterfacePhoto } from '../../lib/editorial/interfaceImageLibrary';

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

  const signalsWithHorizons = useMemo(
    () => edition.signals.filter((s) => s.sections.horizonImpacts.length > 0),
    [edition.signals]
  );

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
      {/* Strategic Intelligence Desk Masthead */}
      <header className="ws-masthead-rule py-6 space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
          <div className="lg:col-span-8 space-y-2.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                aria-hidden="true"
                className="inline-block h-[2.5px] w-5 bg-[var(--ws-editorial-accent)]"
              />
              <span className="ws-kicker text-[var(--ws-editorial-accent)]">
                {t.nav.synthesis}
              </span>
              <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">
                /
              </span>
              <span className="font-mono-tabular text-[11.5px] text-[var(--ws-ink-muted)]">
                {edition.frontmatter.edition_date}
              </span>
            </div>
            <h1 className="font-display ws-headline-dossier text-[1.95rem] sm:text-[2.6rem] font-semibold text-[var(--ws-ink)] headline-balance">
              {t.synthesis.title}
            </h1>
            <p className="max-w-3xl text-[14.5px] leading-[1.7] text-[var(--ws-ink-secondary)]">
              {t.synthesis.subtitle}
            </p>
          </div>

          <dl className="lg:col-span-4 lg:border-l lg:border-[var(--ws-border)] lg:pl-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-4 ws-meta">
            <div>
              <dt className="text-[11px] text-[var(--ws-ink-muted)]">
                {lang === 'zh-CN' ? '跨域主线' : 'Synthesis Threads'}
              </dt>
              <dd className="mt-0.5 ws-editorial-numeral text-[26px] text-[var(--ws-ink)]">
                {establishedThreads.length}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] text-[var(--ws-ink-muted)]">
                {lang === 'zh-CN' ? '显性关联' : 'Explicit Links'}
              </dt>
              <dd className="mt-0.5 ws-editorial-numeral text-[26px] text-[var(--ws-world)]">
                {edition.signals.reduce((acc, s) => acc + s.relationships.length, 0)}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] text-[var(--ws-ink-muted)]">
                {lang === 'zh-CN' ? '情景推演' : 'Scenario Briefs'}
              </dt>
              <dd className="mt-0.5 ws-editorial-numeral text-[26px] text-[var(--ws-economy)]">
                {keyScenarioSignals.length}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] text-[var(--ws-ink-muted)]">
                {lang === 'zh-CN' ? '跟踪清单' : 'Watchlist Items'}
              </dt>
              <dd className="mt-0.5 ws-editorial-numeral text-[26px] text-[var(--ws-ink)]">
                {edition.watchlist.rows.length}
              </dd>
            </div>
          </dl>
        </div>
      </header>

      {/* 1. Keyboard-Accessible Strategic Relationship Atlas */}
      <RelationshipExplorerMatrix
        edition={edition}
        signalById={signalById}
        lang={lang}
        onOpenSignal={onOpenSignal}
      />

      {/* Phase 10 Editorial Visual Bridge — Connecting Network Topology to Long-Form Monographs */}
      <DocumentaryImageBreak
        photo={getInterfacePhoto('world-coastline-geography')}
        lang={lang}
        kickerEn="Cross-Domain Transmission · Visual Chapter"
        kickerZh="跨领域传导 · 视觉章节过渡"
        titleEn="From Declared Signal Links to Multi-Horizon Structural Synthesis"
        titleZh="从显性信号图谱进入多时间维度结构性研判"
        bodyEn="Below, WORLD SIGNAL synthesizes declared cross-domain mechanisms, horizon impacts, conditional scenarios, and forward monitoring checkpoints grounded strictly in this edition."
        bodyZh="以下章节严格基于本期已核查信号，逐项展开跨领域传导主线、分时间维度影响、条件情景与后续观察节点。"
        folioCode={`SYNTHESIS ${edition.frontmatter.edition_date} · PLATE V`}
      />

      {/* 2. Cross-Domain Synthesis — Asymmetric Editorial Monographs */}
      <section className="space-y-7 ws-section-rule pt-8">
        <div className="space-y-1">
          <h2 className="font-display text-[1.45rem] sm:text-[1.75rem] font-semibold tracking-[-0.018em] text-[var(--ws-ink)]">
            {t.synthesis.crossDomainTitle}
          </h2>
          <p className="max-w-3xl text-[13px] leading-relaxed text-[var(--ws-ink-muted)]">
            {edition.crossDomainSynthesis.intro || t.synthesis.crossDomainSubtitle}
          </p>
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
            <div className="divide-y divide-[var(--ws-border-strong)] border-y border-[var(--ws-border-strong)]">
              {establishedThreads.map((thread, idx) => (
                <article
                  key={`${thread.title}-${idx}`}
                  className="py-7 sm:py-8 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10"
                >
                  <div className="lg:col-span-4 space-y-4 min-w-0">
                    <div className="flex items-baseline gap-3">
                      <span
                        aria-hidden="true"
                        className="ws-editorial-numeral text-[36px] sm:text-[44px] text-[var(--ws-world)]/48 select-none"
                      >
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="ws-kicker text-[var(--ws-world)]">
                        {t.synthesis.establishedLabel}
                      </span>
                    </div>

                    <h3 className="font-display text-[1.35rem] sm:text-[1.6rem] font-semibold leading-[1.24] tracking-[-0.018em] text-[var(--ws-ink)] headline-balance break-words">
                      {thread.title}
                    </h3>

                    {thread.linkedSignalIds.length > 0 && (
                      <div className="border-t border-[var(--ws-border)] pt-3.5 space-y-2">
                        <div className="ws-kicker text-[var(--ws-ink-faint)]">
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

                  <div className="lg:col-span-8 lg:border-l lg:border-[var(--ws-border)] lg:pl-10 min-w-0">
                    <div className="max-w-[68ch] ws-prose">
                      <SafeMarkdown
                        content={thread.content}
                        onSelectSignal={onOpenSignal}
                      />
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {unestablishedThreads.map((thread, idx) => (
              <div
                key={`unestablished-${idx}`}
                className="ws-caution-panel border-dashed p-5 sm:p-7 space-y-3"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className="inline-block h-[2px] w-6 bg-[var(--ws-warn)] shrink-0"
                  />
                  <span className="ws-kicker text-[var(--ws-warn)]">
                    {t.synthesis.unestablishedLabel}
                  </span>
                </div>
                <h3 className="font-display text-[1.22rem] font-semibold text-[var(--ws-ink)]">
                  {thread.title}
                </h3>
                <div className="max-w-[70ch] ws-prose">
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

      {/* 3. Economic & Structural Time Horizons — Connected Temporal Continuum */}
      {signalsWithHorizons.length > 0 && (
        <section className="space-y-6 ws-section-rule pt-8">
          <div className="space-y-1">
            <h2 className="font-display text-[1.45rem] sm:text-[1.75rem] font-semibold tracking-[-0.018em] text-[var(--ws-ink)]">
              {t.synthesis.impactAnalysisTitle}
            </h2>
            <p className="text-[13px] text-[var(--ws-ink-muted)]">
              {t.synthesis.impactAnalysisSubtitle}
            </p>
          </div>

          <div className="space-y-6">
            {signalsWithHorizons.map((sig) => (
              <div
                key={sig.signal_id}
                className="ws-broadsheet-ledger overflow-hidden"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--ws-border)] bg-[var(--ws-surface-elevated)] px-5 py-3.5">
                  <button
                    type="button"
                    onClick={() => onOpenSignal(sig.signal_id)}
                    className="font-display text-[1.12rem] font-semibold text-[var(--ws-ink)] hover:text-[var(--ws-world)] text-left cursor-pointer headline-balance"
                  >
                    {sig.headline}
                  </button>
                  <span className="font-mono-tabular text-[11.5px] text-[var(--ws-ink-muted)] break-all sm:shrink-0">
                    {sig.signal_id}
                  </span>
                </div>

                {/* Connected Temporal Track */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[var(--ws-border)]">
                  {sig.sections.horizonImpacts.map((hi, hIdx) => {
                    const isLastStage = hIdx === sig.sections.horizonImpacts.length - 1;
                    return (
                      <div
                        key={hi.horizon}
                        className="p-4 sm:p-5 space-y-3 relative"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="ws-kicker text-[var(--ws-economy)]">
                              {hi.label}
                            </span>
                            <span className="inline-flex items-center gap-1 font-mono-tabular text-[10.5px] text-[var(--ws-ink-faint)]">
                              <span>0{hIdx + 1}</span>
                              {!isLastStage && (
                                <ArrowRight className="hidden lg:inline h-3 w-3 text-[var(--ws-border-strong)]" />
                              )}
                            </span>
                          </div>
                          <div
                            aria-hidden="true"
                            className="flex items-center gap-1"
                          >
                            {sig.sections.horizonImpacts.map((_, stepIdx) => (
                              <span
                                key={stepIdx}
                                className={`h-[2.5px] flex-1 ${
                                  stepIdx <= hIdx
                                    ? 'bg-[var(--ws-economy)]'
                                    : 'bg-[var(--ws-border-subtle)]'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="ws-prose text-[13.5px] text-[var(--ws-ink-secondary)]">
                          {hi.text}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Conditional Scenarios Across Key Signals */}
      {keyScenarioSignals.length > 0 && (
        <section className="space-y-6 ws-section-rule pt-8">
          <div className="space-y-1">
            <h2 className="font-display text-[1.45rem] sm:text-[1.75rem] font-semibold tracking-[-0.018em] text-[var(--ws-ink)]">
              {t.synthesis.scenariosSectionTitle}
            </h2>
            <p className="text-[13px] text-[var(--ws-ink-muted)]">
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
                    className="font-display text-[1.18rem] sm:text-[1.28rem] font-semibold text-[var(--ws-ink)] hover:text-[var(--ws-world)] text-left cursor-pointer headline-balance"
                  >
                    {sig.headline}
                  </button>
                  <span className="ws-meta text-[12px] break-words min-w-0 text-[var(--ws-ink-muted)]">
                    <span className={`font-semibold ${domainAccentTextClass(sig.domain)}`}>
                      {t.domains[sig.domain]}
                    </span>{' '}
                    ·{' '}
                    <span className="font-mono-tabular text-[11.5px]">
                      {sig.signal_id}
                    </span>
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

      {/* 5. Personal Implications — Intentional Editorial Advisory Folio (Not Generic 2x2 Cards) */}
      {(edition.personalImplications.sections.length > 0 ||
        edition.personalImplications.rawMarkdown) && (
        <section className="space-y-6 ws-section-rule pt-8">
          <div className="space-y-3">
            <h2 className="font-display text-[1.45rem] sm:text-[1.75rem] font-semibold tracking-[-0.018em] text-[var(--ws-ink)]">
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
            <div className="divide-y divide-[var(--ws-border)] border-y border-[var(--ws-border-strong)] bg-[var(--ws-surface)]">
              {edition.personalImplications.sections.map((sec, idx) => (
                <article
                  key={`${sec.title}-${idx}`}
                  className="p-5 sm:p-6 lg:px-7 grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-8 items-start"
                >
                  <div className="lg:col-span-4 flex items-baseline gap-4 min-w-0">
                    <span className="ws-editorial-numeral text-[30px] text-[var(--ws-ink-faint)] shrink-0">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <h3 className="font-display text-[1.18rem] font-semibold leading-snug text-[var(--ws-ink)]">
                      {sec.title}
                    </h3>
                  </div>
                  <div className="lg:col-span-8 lg:border-l lg:border-[var(--ws-border-subtle)] lg:pl-8 min-w-0 ws-prose">
                    <SafeMarkdown
                      content={sec.content}
                      compact
                      onSelectSignal={onOpenSignal}
                    />
                  </div>
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

      {/* 6. Responsive Watchlist */}
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
