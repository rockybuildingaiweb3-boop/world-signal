import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { ParsedSignal, SignalDomain, UiLanguage } from '../../../types/edition';
import { buildSignalNarrativeArc } from '../../../lib/editorial/narrativeArc';

interface NarrativeArcRibbonProps {
  signal: ParsedSignal;
  lang: UiLanguage;
  activeSectionId: string | null;
  onSelectSection?: (sectionId: string) => void;
}

function accentColor(domain: SignalDomain): string {
  switch (domain) {
    case 'world':
      return 'var(--ws-world)';
    case 'ai':
      return 'var(--ws-ai)';
    case 'economy':
      return 'var(--ws-economy)';
  }
}

export const NarrativeArcRibbon: React.FC<NarrativeArcRibbonProps> = ({
  signal,
  lang,
  activeSectionId,
  onSelectSection,
}) => {
  const stages = buildSignalNarrativeArc(signal);
  if (stages.length < 2) return null;

  const isZh = lang === 'zh-CN';
  const accent = accentColor(signal.domain);

  return (
    <nav
      aria-label={isZh ? '叙事推进脉络' : 'Narrative progression'}
      data-testid="dossier-narrative-arc"
      className="border-y border-[var(--ws-border)] bg-[var(--ws-surface-tint)]/65 px-4 py-3.5 sm:px-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
        <span className="ws-kicker text-[10px] text-[var(--ws-ink-muted)]">
          {isZh ? '研读脉络 · 从全局事件到现实关联' : 'Reading Arc · Event to Real-World Consequence'}
        </span>
        <span className="font-mono-tabular text-[10.5px] text-[var(--ws-ink-faint)]">
          {stages.length} {isZh ? '阶段' : 'stages'}
        </span>
      </div>

      <ol className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:items-stretch gap-2.5">
        {stages.map((stage, idx) => {
          const isActive = Boolean(
            activeSectionId &&
              stage.matchesSectionIds.includes(activeSectionId)
          );
          return (
            <li
              key={stage.id}
              className="flex items-center gap-2 lg:flex-1 min-w-0"
            >
              <a
                href={`#${stage.targetSectionId}`}
                onClick={() => onSelectSection?.(stage.targetSectionId)}
                className={`group flex-1 min-w-0 border-t-[2px] pt-2 pb-1 transition-colors ${
                  isActive
                    ? 'text-[var(--ws-ink)]'
                    : 'border-[var(--ws-border)] text-[var(--ws-ink-muted)] hover:border-[var(--ws-border-strong)] hover:text-[var(--ws-ink)]'
                }`}
                style={isActive ? { borderTopColor: accent } : undefined}
              >
                <div className="flex items-baseline gap-1.5">
                  <span
                    className="font-mono-tabular text-[10.5px] font-semibold"
                    style={isActive ? { color: accent } : undefined}
                  >
                    {stage.stepNumber}
                  </span>
                  <span className="text-[12px] font-semibold truncate">
                    {isZh ? stage.labelZh : stage.labelEn}
                  </span>
                </div>
                <div className="text-[11px] text-[var(--ws-ink-muted)] truncate mt-0.5">
                  {isZh ? stage.subZh : stage.subEn}
                </div>
              </a>
              {idx < stages.length - 1 && (
                <ArrowRight
                  aria-hidden="true"
                  className="hidden lg:block h-3 w-3 text-[var(--ws-ink-faint)] shrink-0"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
