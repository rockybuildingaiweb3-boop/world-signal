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
} {
  switch (kind) {
    case 'base':
      return {
        accent: 'text-[var(--ws-world)]',
        bar: 'bg-[var(--ws-world)]',
      };
    case 'downside':
      return {
        accent: 'text-[var(--ws-conf-low)]',
        bar: 'bg-[var(--ws-conf-low)]',
      };
    case 'upside':
      return {
        accent: 'text-[var(--ws-economy)]',
        bar: 'bg-[var(--ws-economy)]',
      };
    default:
      return {
        accent: 'text-[var(--ws-ink-muted)]',
        bar: 'bg-[var(--ws-border-strong)]',
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
    <div className="grid gap-4 md:grid-cols-3">
      {items.map((item, idx) => {
        const tone = scenarioTone(item.kind);
        const title = t.expanded.scenarioKinds[item.kind] || item.label;
        return (
          <div
            key={`${item.kind}-${idx}`}
            className="overflow-hidden rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-canvas)]/55 flex flex-col"
          >
            <div aria-hidden="true" className={`h-[2.5px] w-full ${tone.bar}`} />
            <div className="p-4 flex-1 flex flex-col gap-2.5">
              <div className="flex items-center justify-between gap-2">
                <div
                  className={`font-mono-tabular text-[11px] font-semibold uppercase tracking-[0.12em] ${tone.accent}`}
                >
                  {title}
                </div>
                <span className="font-mono-tabular text-[10.5px] text-[var(--ws-ink-faint)]">
                  {String(idx + 1).padStart(2, '0')}
                </span>
              </div>
              {item.condition && (
                <p className="text-[12.5px] leading-relaxed text-[var(--ws-ink-muted)] border-b border-[var(--ws-border-subtle)] pb-2.5">
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
