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
      {/* Split-Pane Editorial Research & Dossier Workspace */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[336px_minmax(0,1fr)] xl:grid-cols-[356px_minmax(0,1fr)] lg:items-start">
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

        {/* RIGHT PANE: Open Long-Form Editorial Dossier Reading Canvas */}
        <section
          ref={dossierTopRef}
          className={`${
            mobileShowDetail ? 'block' : 'hidden lg:block'
          } min-w-0 scroll-mt-24`}
        >
          {/* Mobile Back-to-List Bar (Preserves Filters & Scroll Context) */}
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
            <article className="bg-[var(--ws-surface)] border-y lg:border border-[var(--ws-border)] lg:rounded-[var(--ws-radius-sm)] -mx-4 px-4 py-6 sm:mx-0 sm:px-8 sm:py-9 lg:px-11 lg:py-10 space-y-9">
              <SignalDossierHeader
                signal={activeSignal}
                lang={lang}
                isLocalPreview={edition.isLocalPreview}
                copied={copiedId === activeSignal.signal_id}
                onCopyLink={() => void handleCopyLink(activeSignal.signal_id)}
                jumpSections={jumpSections}
              />

              {/* Long-Form Editorial Narrative Body (Comfortable 68ch Reading Measure) */}
              <div className="max-w-[70ch] space-y-9">
                {/* Part I · Factual Record & Chronology */}
                {(activeSignal.sections.whatHappened ||
                  activeSignal.sections.verifiedFacts ||
                  activeSignal.sections.timeline ||
                  activeSignal.timelineEvents.length > 0) && (
                  <div className="space-y-8">
                    <div className="font-mono-tabular text-[10.5px] font-semibold uppercase tracking-[0.15em] text-[var(--ws-ink-faint)]">
                      {t.expanded.layerFactual}
                    </div>

                    {activeSignal.sections.whatHappened && (
                      <section
                        id="sec-what-happened"
                        className="scroll-mt-24 space-y-3"
                      >
                        <h3 className="font-display text-[1.22rem] font-semibold text-[var(--ws-ink)]">
                          {t.expanded.sections.whatHappened}
                        </h3>
                        <div className="text-[15px] sm:text-[15.5px]">
                          <SafeMarkdown
                            content={activeSignal.sections.whatHappened}
                            onSelectSignal={handleJumpToSignal}
                            onInspectSource={handleInspectSource}
                            sources={activeSignal.sources}
                          />
                        </div>
                      </section>
                    )}

                    {activeSignal.sections.verifiedFacts && (
                      <section
                        id="sec-verified-facts"
                        className="scroll-mt-24 ws-folio-note px-5 py-4 space-y-3"
                      >
                        <h3 className="font-display text-[1.12rem] font-semibold text-[var(--ws-ink)]">
                          {t.expanded.sections.verifiedFacts}
                        </h3>
                        <SafeMarkdown
                          content={activeSignal.sections.verifiedFacts}
                          onSelectSignal={handleJumpToSignal}
                          onInspectSource={handleInspectSource}
                          sources={activeSignal.sources}
                        />
                      </section>
                    )}

                    {(activeSignal.sections.timeline ||
                      activeSignal.timelineEvents.length > 0) && (
                      <section
                        id="sec-timeline"
                        className="scroll-mt-24 space-y-4 border-t border-[var(--ws-border-subtle)] pt-7"
                      >
                        <h3 className="font-display text-[1.2rem] font-semibold text-[var(--ws-ink)]">
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

                {/* Part II · Interpretive Significance & Analysis */}
                {(activeSignal.sections.whyItMatters ||
                  activeSignal.sections.sourcePerspectives ||
                  activeSignal.sections.analysis) && (
                  <div className="space-y-8 border-t border-[var(--ws-border-strong)] pt-7">
                    <div className="font-mono-tabular text-[10.5px] font-semibold uppercase tracking-[0.15em] text-[var(--ws-ink-faint)]">
                      {t.expanded.layerInterpretive}
                    </div>

                    {activeSignal.sections.whyItMatters && (
                      <section className="space-y-3">
                        <h3 className="font-display text-[1.2rem] font-semibold text-[var(--ws-ink)]">
                          {t.expanded.sections.whyItMatters}
                        </h3>
                        <SafeMarkdown
                          content={activeSignal.sections.whyItMatters}
                          onSelectSignal={handleJumpToSignal}
                          onInspectSource={handleInspectSource}
                          sources={activeSignal.sources}
                        />
                      </section>
                    )}

                    {activeSignal.sections.sourcePerspectives && (
                      <section className="space-y-3 border-t border-[var(--ws-border-subtle)] pt-7">
                        <h3 className="font-display text-[1.15rem] font-semibold text-[var(--ws-ink)]">
                          {t.expanded.sections.sourcePerspectives}
                        </h3>
                        <SafeMarkdown
                          content={activeSignal.sections.sourcePerspectives}
                          onSelectSignal={handleJumpToSignal}
                          onInspectSource={handleInspectSource}
                          sources={activeSignal.sources}
                        />
                      </section>
                    )}

                    {activeSignal.sections.analysis && (
                      <section
                        id="sec-analysis"
                        className="scroll-mt-24 space-y-3 border-t border-[var(--ws-border-subtle)] pt-7"
                      >
                        <h3 className="font-display text-[1.2rem] font-semibold text-[var(--ws-ink)]">
                          {t.expanded.sections.analysis}
                        </h3>
                        <SafeMarkdown
                          content={activeSignal.sections.analysis}
                          onSelectSignal={handleJumpToSignal}
                          onInspectSource={handleInspectSource}
                          sources={activeSignal.sources}
                        />
                      </section>
                    )}
                  </div>
                )}

                {/* Part III · Uncertainties & Forward-Looking Scenarios */}
                {activeSignal.sections.uncertainties && (
                  <div className="space-y-4 border-t border-[var(--ws-border-strong)] pt-7">
                    <div className="font-mono-tabular text-[10.5px] font-semibold uppercase tracking-[0.15em] text-[var(--ws-ink-faint)]">
                      {t.expanded.layerForwardLooking}
                    </div>
                    <section
                      id="sec-uncertainties"
                      className="scroll-mt-24 ws-caution-panel p-5 space-y-2.5"
                    >
                      <h3 className="font-mono-tabular text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ws-warn)]">
                        {t.expanded.sections.uncertainties}
                      </h3>
                      <SafeMarkdown
                        content={activeSignal.sections.uncertainties}
                        compact
                        onSelectSignal={handleJumpToSignal}
                        onInspectSource={handleInspectSource}
                        sources={activeSignal.sources}
                      />
                    </section>
                  </div>
                )}
              </div>

              {/* Forward-Looking Scenarios (Full Dossier Width for 3-column architectural framing) */}
              {activeSignal.sections.scenarios && (
                <section
                  id="sec-scenarios"
                  className="scroll-mt-24 space-y-4 border-t border-[var(--ws-border)] pt-7"
                >
                  {!activeSignal.sections.uncertainties && (
                    <div className="font-mono-tabular text-[10.5px] font-semibold uppercase tracking-[0.15em] text-[var(--ws-ink-faint)]">
                      {t.expanded.layerForwardLooking}
                    </div>
                  )}
                  <h3 className="font-display text-[1.2rem] font-semibold text-[var(--ws-ink)]">
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

              {/* Personal Relevance & What to Watch */}
              {(activeSignal.sections.personalRelevance ||
                activeSignal.sections.whatToWatch) && (
                <div className="max-w-[70ch] space-y-7 border-t border-[var(--ws-border-subtle)] pt-7">
                  {activeSignal.sections.personalRelevance && (
                    <section className="space-y-2.5">
                      <h3 className="font-display text-[1.15rem] font-semibold text-[var(--ws-ink)]">
                        {t.expanded.sections.personalRelevance}
                      </h3>
                      <SafeMarkdown
                        content={activeSignal.sections.personalRelevance}
                        onSelectSignal={handleJumpToSignal}
                        onInspectSource={handleInspectSource}
                        sources={activeSignal.sources}
                      />
                    </section>
                  )}

                  {activeSignal.sections.whatToWatch && (
                    <section className="space-y-2.5">
                      <h3 className="font-display text-[1.15rem] font-semibold text-[var(--ws-ink)]">
                        {t.expanded.sections.whatToWatch}
                      </h3>
                      <SafeMarkdown
                        content={activeSignal.sections.whatToWatch}
                        onSelectSignal={handleJumpToSignal}
                        onInspectSource={handleInspectSource}
                        sources={activeSignal.sources}
                      />
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
