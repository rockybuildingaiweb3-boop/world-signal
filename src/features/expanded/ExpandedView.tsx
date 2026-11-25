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
    const el = document.getElementById(`dossier-source-${sourceId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleInspectClaim = (claimId: string) => {
    setHighlightedClaimId(claimId);
    const el = document.getElementById(`dossier-claim-${claimId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
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
    if (activeSignal.sections.timeline)
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
    return list;
  }, [activeSignal, t.expanded.sections]);

  return (
    <div className="pb-16">
      {/* Split-Pane Signal Explorer */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[340px_minmax(0,1fr)] lg:items-start">
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

        {/* RIGHT PANE: Dedicated Active Signal Dossier Reading Canvas */}
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
              className="inline-flex items-center gap-1.5 rounded-md border border-[var(--ws-border)] bg-[var(--ws-surface)] px-3 py-1.5 text-xs font-medium text-[var(--ws-ink)] cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {t.expanded.backToList} ({filteredSignals.length})
            </button>
          </div>

          {!activeSignal ? (
            <div className="ws-card p-10 text-center space-y-3">
              <h2 className="font-display text-xl font-semibold text-[var(--ws-ink)]">
                {t.expanded.noMatchesTitle}
              </h2>
              <p className="text-sm text-[var(--ws-ink-muted)]">
                {t.expanded.noMatchesBody}
              </p>
            </div>
          ) : (
            <article className="ws-card p-5 sm:p-8 lg:p-10 space-y-8">
              <SignalDossierHeader
                signal={activeSignal}
                lang={lang}
                isLocalPreview={edition.isLocalPreview}
                copied={copiedId === activeSignal.signal_id}
                onCopyLink={() => void handleCopyLink(activeSignal.signal_id)}
                jumpSections={jumpSections}
              />

              {/* Editorial Dossier Narrative Body (max-w-prose rhythm) */}
              <div className="max-w-[74ch] space-y-8">
                {/* Factual Layer */}
                {activeSignal.sections.whatHappened && (
                  <section
                    id="sec-what-happened"
                    className="scroll-mt-28 lg:scroll-mt-24 space-y-2.5"
                  >
                    <h3 className="font-display text-lg font-semibold text-[var(--ws-ink)]">
                      {t.expanded.sections.whatHappened}
                    </h3>
                    <SafeMarkdown
                      content={activeSignal.sections.whatHappened}
                      onSelectSignal={handleJumpToSignal}
                      onInspectSource={handleInspectSource}
                      sources={activeSignal.sources}
                    />
                  </section>
                )}

                {activeSignal.sections.verifiedFacts && (
                  <section
                    id="sec-verified-facts"
                    className="scroll-mt-28 lg:scroll-mt-24 space-y-2.5"
                  >
                    <h3 className="font-display text-lg font-semibold text-[var(--ws-ink)]">
                      {t.expanded.sections.verifiedFacts}
                    </h3>
                    <div className="rounded-md border border-[var(--ws-border)] bg-[var(--ws-surface-elevated)] p-4 sm:p-5">
                      <SafeMarkdown
                        content={activeSignal.sections.verifiedFacts}
                        onSelectSignal={handleJumpToSignal}
                        onInspectSource={handleInspectSource}
                        sources={activeSignal.sources}
                      />
                    </div>
                  </section>
                )}

                {activeSignal.sections.timeline && (
                  <section
                    id="sec-timeline"
                    className="scroll-mt-28 lg:scroll-mt-24 space-y-3"
                  >
                    <h3 className="font-display text-lg font-semibold text-[var(--ws-ink)]">
                      {t.expanded.sections.timeline}
                    </h3>
                    <TimelineTrack
                      entries={activeSignal.sections.timelineEntries}
                      rawFallback={activeSignal.sections.timeline}
                      onSelectSignal={handleJumpToSignal}
                      onInspectSource={handleInspectSource}
                      sources={activeSignal.sources}
                    />
                  </section>
                )}

                {/* Interpretive Layer */}
                {activeSignal.sections.whyItMatters && (
                  <section className="space-y-2.5 border-t border-[var(--ws-border)] pt-6">
                    <h3 className="font-display text-lg font-semibold text-[var(--ws-ink)]">
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
                  <section className="space-y-2.5">
                    <h3 className="font-display text-lg font-semibold text-[var(--ws-ink)]">
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
                    className="scroll-mt-28 lg:scroll-mt-24 space-y-2.5"
                  >
                    <h3 className="font-display text-lg font-semibold text-[var(--ws-ink)]">
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

                {/* Uncertainties Layer */}
                {activeSignal.sections.uncertainties && (
                  <section
                    id="sec-uncertainties"
                    className="scroll-mt-28 lg:scroll-mt-24 rounded-md border border-[var(--ws-warn-border)] bg-[var(--ws-warn-soft)] p-4 sm:p-5 space-y-2.5"
                  >
                    <h3 className="font-display text-base font-semibold text-[var(--ws-warn)]">
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
                )}
              </div>

              {/* Forward-Looking Scenarios (Full Dossier Width for 3-column grid) */}
              {activeSignal.sections.scenarios && (
                <section
                  id="sec-scenarios"
                  className="scroll-mt-28 lg:scroll-mt-24 space-y-3 border-t border-[var(--ws-border)] pt-6"
                >
                  <h3 className="font-display text-lg font-semibold text-[var(--ws-ink)]">
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
              <div className="max-w-[74ch] space-y-6">
                {activeSignal.sections.personalRelevance && (
                  <section className="space-y-2">
                    <h3 className="font-display text-lg font-semibold text-[var(--ws-ink)]">
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
                  <section className="space-y-2">
                    <h3 className="font-display text-lg font-semibold text-[var(--ws-ink)]">
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
