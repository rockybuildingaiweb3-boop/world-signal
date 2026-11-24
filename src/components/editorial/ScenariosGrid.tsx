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

function scenarioTone(kind: ScenarioItem['kind']): { accent: string; border: string } {
  switch (kind) {
    case 'base':
      return {
        accent: 'text-[var(--ws-world)]',
        border: 'border-[var(--ws-border)]',
      };
    case 'downside':
      return {
        accent: 'text-[var(--ws-conf-low)]',
        border: 'border-[var(--ws-border)]',
      };
    case 'upside':
      return {
        accent: 'text-[var(--ws-economy)]',
        border: 'border-[var(--ws-border)]',
      };
    default:
      return {
        accent: 'text-[var(--ws-ink-muted)]',
        border: 'border-[var(--ws-border)]',
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
    <div className="grid gap-3 md:grid-cols-3">
      {items.map((item, idx) => {
        const tone = scenarioTone(item.kind);
        const title = t.expanded.scenarioKinds[item.kind] || item.label;
        return (
          <div
            key={`${item.kind}-${idx}`}
            className={`rounded-md border ${tone.border} bg-[var(--ws-surface-elevated)] p-4 flex flex-col gap-2`}
          >
            <div className={`font-mono-tabular text-[11px] font-semibold uppercase tracking-wider ${tone.accent}`}>
              {title}
            </div>
            {item.condition && (
              <p className="text-xs leading-relaxed text-[var(--ws-ink-muted)] border-b border-[var(--ws-border)] pb-2">
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
        );
      })}
    </div>
  );
};
