import React from 'react';
import type { SignalSource, TimelineEntry } from '../../types/edition';
import { SafeMarkdown } from './SafeMarkdown';

interface TimelineTrackProps {
  entries: TimelineEntry[];
  rawFallback: string;
  onSelectSignal?: (signalId: string) => void;
  onInspectSource?: (sourceId: string) => void;
  sources?: SignalSource[];
}

export const TimelineTrack: React.FC<TimelineTrackProps> = ({
  entries,
  rawFallback,
  onSelectSignal,
  onInspectSource,
  sources,
}) => {
  if (entries.length === 0) {
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
    <ol className="relative space-y-4 border-l border-[var(--ws-border-strong)] pl-5">
      {entries.map((entry, idx) => (
        <li key={`${entry.dateLabel ?? 'step'}-${idx}`} className="relative">
          <span
            aria-hidden="true"
            className="absolute -left-[25px] top-1.5 h-2 w-2 rounded-full border border-[var(--ws-border-strong)] bg-[var(--ws-surface)]"
          />
          {entry.dateLabel && (
            <div className="mb-1 font-mono-tabular text-xs font-semibold tracking-tight text-[var(--ws-ink)]">
              {entry.dateLabel}
            </div>
          )}
          <SafeMarkdown
            content={entry.text}
            compact
            onSelectSignal={onSelectSignal}
            onInspectSource={onInspectSource}
            sources={sources}
          />
        </li>
      ))}
    </ol>
  );
};
