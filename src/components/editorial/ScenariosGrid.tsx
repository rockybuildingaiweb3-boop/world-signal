import React from 'react';
import type { ScenarioItem, SignalSource, UiLanguage } from '../../types/edition';
import { getUiStrings } from '../../lib/i18n/uiStrings';
import { SafeMarkdown } from './SafeMarkdown';

interface ScenariosGridProps {
  items: ScenarioItem[];
  rawFallback: string;
  lang: UiLanguage;
  onSelectSignal?: (signalId: string) => void;
  onInspectSource?: (sourceId: string) => void;
  sources?: SignalSource[];
}

function scenarioTone(kind: ScenarioItem['kind']): {
  accent: string;
  bar: string;
  symbol: string;
} {
  switch (kind) {
    case 'base':
      return {
        accent: 'text-[var(--ws-world)]',
        bar: 'bg-[var(--ws-world)]',
        symbol: '→',
      };
    case 'downside':
      return {
        accent: 'text-[var(--ws-conf-low)]',
        bar: 'bg-[var(--ws-conf-low)]',
        symbol: '↘',
      };
    case 'upside':
      return {
        accent: 'text-[var(--ws-economy)]',
        bar: 'bg-[var(--ws-economy)]',
        symbol: '↗',
      };
    default:
      return {
        accent: 'text-[var(--ws-ink-muted)]',
        bar: 'bg-[var(--ws-border-strong)]',
        symbol: '◇',
      };
  }
}

export const ScenariosGrid: React.FC<ScenariosGridProps> = ({
  items,
  rawFallback,
  lang,
  onSelectSignal,
  onInspectSource,
  sources,
}) => {
  const t = getUiStrings(lang);

  if (items.length === 0) {
    return (
      <SafeMarkdown
        content={rawFallback}
        onSelectSignal={onSelectSignal}
        onInspectSource={onInspectSource}
        sources={sources}
      />
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-3">
      {items.map((item, idx) => {
        const tone = scenarioTone(item.kind);
        const title = t.expanded.scenarioKinds[item.kind] || item.label;
        return (
          <div
            key={`${item.kind}-${idx}`}
            className="overflow-hidden rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-surface)] flex flex-col"
          >
            <div aria-hidden="true" className={`h-[3px] w-full ${tone.bar}`} />
            <div className="flex items-baseline justify-between gap-2 border-b border-[var(--ws-border-subtle)] bg-[var(--ws-surface-tint)]/75 px-4 py-3 sm:px-5">
              <div
                className={`inline-flex items-center gap-1.5 ws-kicker ${tone.accent}`}
              >
                <span aria-hidden="true" className="text-[13px] leading-none">
                  {tone.symbol}
                </span>
                <span>{title}</span>
              </div>
              <span className="ws-editorial-numeral text-[20px] text-[var(--ws-ink-faint)]">
                {String(idx + 1).padStart(2, '0')}
              </span>
            </div>
            <div className="p-4 sm:p-5 flex-1 flex flex-col gap-3">
              {item.condition && (
                <p className="text-[12.5px] font-medium leading-relaxed text-[var(--ws-ink-secondary)] border-b border-[var(--ws-border-subtle)] pb-2.5">
                  {item.condition}
                </p>
              )}
              <SafeMarkdown
                content={item.body}
                compact
                onSelectSignal={onSelectSignal}
                onInspectSource={onInspectSource}
                sources={sources}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
