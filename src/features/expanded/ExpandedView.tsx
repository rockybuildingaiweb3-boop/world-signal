import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import type {
  ParsedEdition,
  ParsedSignal,
  SignalFilters,
  UiLanguage,
} from '../../types/edition';
import { getUiStrings } from '../../lib/i18n/uiStrings';
import {
  DEFAULT_FILTERS,
  extractUniqueTags,
  extractUniqueTopics,
  filterSignals,
} from '../../lib/filtering/filterSignals';
import { SafeMarkdown } from '../../components/editorial/SafeMarkdown';
import { TimelineTrack } from '../../components/editorial/TimelineTrack';
import { ScenariosGrid } from '../../components/editorial/ScenariosGrid';
import { SignalFilterSidebar } from './SignalFilterSidebar';
import { SignalDossierHeader } from './SignalDossierHeader';
import { SignalEvidenceLedgers } from './SignalEvidenceLedgers';

interface ExpandedViewProps {
  edition: ParsedEdition;
  lang: UiLanguage;
  filters: SignalFilters;
  onChangeFilters: (next: SignalFilters) => void;
  selectedSignalId: string | null;
  onSelectSignal: (signalId: string) => void;
  mobileShowDetail: boolean;
  onChangeMobileShowDetail: (show: boolean) => void;
}

export const ExpandedView: React.FC<ExpandedViewProps> = ({
  edition,
  lang,
  filters,
  onChangeFilters,
  selectedSignalId,
  onSelectSignal,
  mobileShowDetail,
  onChangeMobileShowDetail,
}) => {
  const t = getUiStrings(lang);
  const [highlightedSourceId, setHighlightedSourceId] = useState<string | null>(
    null
  );
  const [highlightedClaimId, setHighlightedClaimId] = useState<string | null>(
    null
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const dossierTopRef = useRef<HTMLDivElement | null>(null);

  const uniqueTopics = useMemo(
    () => extractUniqueTopics(edition.signals),
    [edition.signals]
  );
  const uniqueTags = useMemo(
    () => extractUniqueTags(edition.signals),
    [edition.signals]
  );
  const filteredSignals = useMemo(
    () => filterSignals(edition.signals, filters),
    [edition.signals, filters]
  );

  const signalById = useMemo(() => {
    const map = new Map<string, ParsedSignal>();
    for (const s of edition.signals) map.set(s.signal_id, s);
    return map;
  }, [edition.signals]);

  const activeSignal: ParsedSignal | null = useMemo(() => {
    if (selectedSignalId) {
      const inFiltered = filteredSignals.find(
        (s) => s.signal_id === selectedSignalId
      );
      if (inFiltered) return inFiltered;
    }
    return filteredSignals[0] ?? null;
  }, [filteredSignals, selectedSignalId]);

  useEffect(() => {
    setHighlightedSourceId(null);
    setHighlightedClaimId(null);
  }, [activeSignal?.signal_id]);

  const handleSelectFromList = (signalId: string) => {
    onSelectSignal(signalId);
    onChangeMobileShowDetail(true);
    if (dossierTopRef.current && window.innerWidth >= 1024) {
      dossierTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (window.innerWidth < 1024) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleJumpToSignal = (signalId: string) => {
    if (!signalById.has(signalId)) return;
    const isVisible = filteredSignals.some((s) => s.signal_id === signalId);
    if (!isVisible) {
      onChangeFilters({ ...DEFAULT_FILTERS });
    }
    handleSelectFromList(signalId);
  };

  const handleInspectSource = (sourceId: string) => {
    setHighlightedSourceId(sourceId);
    window.requestAnimationFrame(() => {
      const el = document.getElementById(`dossier-source-${sourceId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  };

  const handleInspectClaim = (claimId: string) => {
    setHighlightedClaimId(claimId);
    window.requestAnimationFrame(() => {
      const el = document.getElementById(`dossier-claim-${claimId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  };

  const handleCopyLink = async (signalId: string) => {
    if (edition.isLocalPreview) return;
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('edition', edition.frontmatter.edition_date);
      url.searchParams.set('view', 'expanded');
      url.searchParams.set('signal', signalId);
      await navigator.clipboard.writeText(url.toString());
      setCopiedId(signalId);
      window.setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // Clipboard unavailable in restricted context
    }
  };

  const jumpSections = useMemo(() => {
    if (!activeSignal) return [];
    const list: Array<{ id: string; label: string }> = [];
    if (activeSignal.sections.whatHappened)
      list.push({
        id: 'sec-what-happened',
        label: t.expanded.sections.whatHappened,
      });
    if (activeSignal.sections.verifiedFacts)
      list.push({
        id: 'sec-verified-facts',
        label: t.expanded.sections.verifiedFacts,
      });
    if (activeSignal.sections.timeline || activeSignal.timelineEvents.length > 0)
      list.push({ id: 'sec-timeline', label: t.expanded.sections.timeline });
    if (activeSignal.sections.analysis)
      list.push({ id: 'sec-analysis', label: t.expanded.sections.analysis });
    if (activeSignal.sections.uncertainties)
      list.push({
        id: 'sec-uncertainties',
        label: t.expanded.sections.uncertainties,
      });
    if (activeSignal.sections.scenarios)
      list.push({ id: 'sec-scenarios', label: t.expanded.sections.scenarios });
    list.push({ id: 'sec-claims', label: t.expanded.sections.claims });
    list.push({ id: 'sec-sources', label: t.expanded.sections.sources });
    if (
      activeSignal.relationships.length > 0 ||
      activeSignal.related_signal_ids.length > 0
    ) {
      list.push({
        id: 'sec-relationships',
        label: t.expanded.sections.related,
      });
    }
    return list;
  }, [activeSignal, t.expanded.sections]);

  return (
    <div className="pb-16">
      {/* Split-Pane Editorial Research & Monograph Dossier Workspace */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[332px_minmax(0,1fr)] xl:grid-cols-[352px_minmax(0,1fr)] lg:items-start">
        <SignalFilterSidebar
          totalCount={edition.signals.length}
          filteredSignals={filteredSignals}
          activeSignalId={activeSignal?.signal_id ?? null}
          filters={filters}
          onChangeFilters={onChangeFilters}
          uniqueTopics={uniqueTopics}
          uniqueTags={uniqueTags}
          lang={lang}
          mobileShowDetail={mobileShowDetail}
          onSelectSignal={handleSelectFromList}
        />

        {/* RIGHT PANE: Long-Form Investigative Monograph Canvas */}
        <section
          ref={dossierTopRef}
          className={`${
            mobileShowDetail ? 'block' : 'hidden lg:block'
          } min-w-0 scroll-mt-24`}
        >
          {/* Mobile Back-to-List Bar */}
          <div className="mb-4 lg:hidden">
            <button
              type="button"
              onClick={() => onChangeMobileShowDetail(false)}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-surface)] px-3 py-1.5 text-xs font-medium text-[var(--ws-ink)] hover:border-[var(--ws-border-strong)] cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {t.expanded.backToList} ({filteredSignals.length})
            </button>
          </div>

          {!activeSignal ? (
            <div className="ws-editorial-sheet rounded-b-[var(--ws-radius-sm)] border-x border-[var(--ws-border)] p-10 text-center space-y-3">
              <h2 className="font-display text-xl font-semibold text-[var(--ws-ink)]">
                {t.expanded.noMatchesTitle}
              </h2>
              <p className="text-sm text-[var(--ws-ink-muted)]">
                {t.expanded.noMatchesBody}
              </p>
            </div>
          ) : (
            <article className="bg-[var(--ws-surface)] border-y lg:border border-[var(--ws-border)] lg:rounded-[var(--ws-radius-sm)] -mx-4 px-4 py-6 sm:mx-0 sm:px-8 sm:py-9 lg:px-12 lg:py-11 space-y-10 shadow-[var(--ws-shadow-sm)]">
              <SignalDossierHeader
                signal={activeSignal}
                lang={lang}
                isLocalPreview={edition.isLocalPreview}
                copied={copiedId === activeSignal.signal_id}
                onCopyLink={() => void handleCopyLink(activeSignal.signal_id)}
                jumpSections={jumpSections}
              />

              {/* PART I · FACTUAL RECORD & CHRONOLOGY */}
              {(activeSignal.sections.whatHappened ||
                activeSignal.sections.verifiedFacts ||
                activeSignal.sections.timeline ||
                activeSignal.timelineEvents.length > 0) && (
                <div className="max-w-[70ch] space-y-8">
                  <div className="ws-kicker text-[var(--ws-ink-faint)]">
                    {t.expanded.layerFactual}
                  </div>

                  {/* Layer 1: What Happened — Authoritative Magazine Opening Deck */}
                  {activeSignal.sections.whatHappened && (
                    <section
                      id="sec-what-happened"
                      className="scroll-mt-24 space-y-3"
                    >
                      <h3 className="ws-kicker text-[var(--ws-ink-muted)]">
                        {t.expanded.sections.whatHappened}
                      </h3>
                      <div className="ws-prose text-[16px] sm:text-[16.75px] text-[var(--ws-ink)]">
                        <SafeMarkdown
                          content={activeSignal.sections.whatHappened}
                          className="text-[var(--ws-ink)]"
                          onSelectSignal={handleJumpToSignal}
                          onInspectSource={handleInspectSource}
                          sources={activeSignal.sources}
                        />
                      </div>
                    </section>
                  )}

                  {/* Layer 2: Verified Facts — Crisp Archival Dossier Box */}
                  {activeSignal.sections.verifiedFacts && (
                    <section
                      id="sec-verified-facts"
                      className="scroll-mt-24 ws-folio-note border-t-2 border-t-[var(--ws-rule-editorial)] px-5 py-5 sm:px-6 space-y-3"
                    >
                      <h3 className="font-display text-[1.15rem] font-semibold text-[var(--ws-ink)]">
                        {t.expanded.sections.verifiedFacts}
                      </h3>
                      <div className="ws-prose">
                        <SafeMarkdown
                          content={activeSignal.sections.verifiedFacts}
                          onSelectSignal={handleJumpToSignal}
                          onInspectSource={handleInspectSource}
                          sources={activeSignal.sources}
                        />
                      </div>
                    </section>
                  )}

                  {/* Layer 3: Timeline — Structured Chronological Spine */}
                  {(activeSignal.sections.timeline ||
                    activeSignal.timelineEvents.length > 0) && (
                    <section
                      id="sec-timeline"
                      className="scroll-mt-24 space-y-4 border-t border-[var(--ws-border-subtle)] pt-7"
                    >
                      <h3 className="font-display text-[1.25rem] font-semibold text-[var(--ws-ink)]">
                        {t.expanded.sections.timeline}
                      </h3>
                      <TimelineTrack
                        entries={activeSignal.sections.timelineEntries}
                        rawFallback={activeSignal.sections.timeline}
                        structuredEvents={activeSignal.timelineEvents}
                        lang={lang}
                        onSelectSignal={handleJumpToSignal}
                        onInspectSource={handleInspectSource}
                        onInspectClaim={handleInspectClaim}
                        sources={activeSignal.sources}
                      />
                    </section>
                  )}
                </div>
              )}

              {/* PART II · INTERPRETIVE SIGNIFICANCE & LONG-FORM ANALYSIS */}
              {(activeSignal.sections.whyItMatters ||
                activeSignal.sections.sourcePerspectives ||
                activeSignal.sections.analysis) && (
                <div className="max-w-[70ch] space-y-8 border-t border-[var(--ws-border-strong)] pt-8">
                  <div className="ws-kicker text-[var(--ws-ink-faint)]">
                    {t.expanded.layerInterpretive}
                  </div>

                  {/* Layer 4: Why It Matters — Elevated Significance Band (Top & Bottom Hairlines) */}
                  {activeSignal.sections.whyItMatters && (
                    <section className="ws-significance-band px-5 py-5 sm:px-6 sm:py-6 space-y-2.5">
                      <h3 className="ws-kicker text-[var(--ws-editorial-accent)]">
                        {t.expanded.sections.whyItMatters}
                      </h3>
                      <div className="ws-prose text-[15.5px] text-[var(--ws-ink)]">
                        <SafeMarkdown
                          content={activeSignal.sections.whyItMatters}
                          className="text-[var(--ws-ink)]"
                          onSelectSignal={handleJumpToSignal}
                          onInspectSource={handleInspectSource}
                          sources={activeSignal.sources}
                        />
                      </div>
                    </section>
                  )}

                  {/* Layer 5: Source Perspectives — Multi-Voice Attribution Band */}
                  {activeSignal.sections.sourcePerspectives && (
                    <section className="rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-canvas)]/55 px-5 py-4.5 sm:px-6 space-y-3">
                      <h3 className="font-display text-[1.15rem] font-semibold text-[var(--ws-ink)]">
                        {t.expanded.sections.sourcePerspectives}
                      </h3>
                      <div className="ws-prose">
                        <SafeMarkdown
                          content={activeSignal.sections.sourcePerspectives}
                          compact
                          onSelectSignal={handleJumpToSignal}
                          onInspectSource={handleInspectSource}
                          sources={activeSignal.sources}
                        />
                      </div>
                    </section>
                  )}

                  {/* Layer 6: Analysis — Open Long-Form Essay Measure */}
                  {activeSignal.sections.analysis && (
                    <section
                      id="sec-analysis"
                      className="scroll-mt-24 space-y-3 pt-1"
                    >
                      <h3 className="font-display text-[1.3rem] font-semibold text-[var(--ws-ink)]">
                        {t.expanded.sections.analysis}
                      </h3>
                      <div className="ws-prose">
                        <SafeMarkdown
                          content={activeSignal.sections.analysis}
                          onSelectSignal={handleJumpToSignal}
                          onInspectSource={handleInspectSource}
                          sources={activeSignal.sources}
                        />
                      </div>
                    </section>
                  )}
                </div>
              )}

              {/* PART III · UNCERTAINTIES & FORWARD-LOOKING SCENARIOS */}
              {activeSignal.sections.uncertainties && (
                <div className="max-w-[70ch] space-y-4 border-t border-[var(--ws-border-strong)] pt-8">
                  <div className="ws-kicker text-[var(--ws-ink-faint)]">
                    {t.expanded.layerForwardLooking}
                  </div>
                  {/* Layer 7: Uncertainties — Restrained Amber Caution Folio */}
                  <section
                    id="sec-uncertainties"
                    className="scroll-mt-24 ws-caution-panel p-5 sm:p-6 space-y-2.5"
                  >
                    <h3 className="ws-kicker text-[var(--ws-warn)]">
                      {t.expanded.sections.uncertainties}
                    </h3>
                    <div className="ws-prose">
                      <SafeMarkdown
                        content={activeSignal.sections.uncertainties}
                        compact
                        onSelectSignal={handleJumpToSignal}
                        onInspectSource={handleInspectSource}
                        sources={activeSignal.sources}
                      />
                    </div>
                  </section>
                </div>
              )}

              {/* Layer 8: Scenarios — Full Dossier Width Architectural Pathways */}
              {activeSignal.sections.scenarios && (
                <section
                  id="sec-scenarios"
                  className="scroll-mt-24 space-y-4 border-t border-[var(--ws-border)] pt-8"
                >
                  {!activeSignal.sections.uncertainties && (
                    <div className="ws-kicker text-[var(--ws-ink-faint)]">
                      {t.expanded.layerForwardLooking}
                    </div>
                  )}
                  <h3 className="font-display text-[1.28rem] font-semibold text-[var(--ws-ink)]">
                    {t.expanded.sections.scenarios}
                  </h3>
                  <ScenariosGrid
                    items={activeSignal.sections.scenarioItems}
                    rawFallback={activeSignal.sections.scenarios}
                    lang={lang}
                    onSelectSignal={handleJumpToSignal}
                    onInspectSource={handleInspectSource}
                    sources={activeSignal.sources}
                  />
                </section>
              )}

              {/* Layers 9 & 10: Personal Relevance & What to Watch — Intentional Split Practical Brief */}
              {(activeSignal.sections.personalRelevance ||
                activeSignal.sections.whatToWatch) && (
                <div className="border-t border-[var(--ws-border)] pt-8 grid grid-cols-1 gap-7 md:grid-cols-2 md:gap-0">
                  {activeSignal.sections.personalRelevance && (
                    <section
                      className={`space-y-3 ${
                        activeSignal.sections.whatToWatch
                          ? 'md:border-r md:border-[var(--ws-border)] md:pr-8'
                          : 'md:col-span-2 max-w-[70ch]'
                      }`}
                    >
                      <h3 className="font-display text-[1.18rem] font-semibold text-[var(--ws-ink)]">
                        {t.expanded.sections.personalRelevance}
                      </h3>
                      <div className="ws-prose">
                        <SafeMarkdown
                          content={activeSignal.sections.personalRelevance}
                          compact
                          onSelectSignal={handleJumpToSignal}
                          onInspectSource={handleInspectSource}
                          sources={activeSignal.sources}
                        />
                      </div>
                    </section>
                  )}

                  {activeSignal.sections.whatToWatch && (
                    <section
                      className={`space-y-3 ${
                        activeSignal.sections.personalRelevance
                          ? 'border-t border-[var(--ws-border-subtle)] pt-6 md:border-t-0 md:pt-0 md:pl-8'
                          : 'md:col-span-2 max-w-[70ch]'
                      }`}
                    >
                      <h3 className="font-display text-[1.18rem] font-semibold text-[var(--ws-ink)]">
                        {t.expanded.sections.whatToWatch}
                      </h3>
                      <div className="ws-prose">
                        <SafeMarkdown
                          content={activeSignal.sections.whatToWatch}
                          compact
                          onSelectSignal={handleJumpToSignal}
                          onInspectSource={handleInspectSource}
                          sources={activeSignal.sources}
                        />
                      </div>
                    </section>
                  )}
                </div>
              )}

              <SignalEvidenceLedgers
                signal={activeSignal}
                signalById={signalById}
                lang={lang}
                highlightedClaimId={highlightedClaimId}
                highlightedSourceId={highlightedSourceId}
                onInspectSource={handleInspectSource}
                onInspectClaim={handleInspectClaim}
                onJumpToSignal={handleJumpToSignal}
                onFilterByTag={(tag) => {
                  onChangeFilters({ ...DEFAULT_FILTERS, tag });
                  onChangeMobileShowDetail(false);
                }}
              />
            </article>
          )}
        </section>
      </div>
    </div>
  );
};
