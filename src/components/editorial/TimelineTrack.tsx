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
    <ol className="relative space-y-5 border-l border-[var(--ws-border-strong)] pl-6 ml-1.5">
      {entries.map((entry, idx) => {
        const isLast = idx === entries.length - 1;
        return (
          <li
            key={`${entry.dateLabel ?? 'step'}-${idx}`}
            className="relative pb-1"
          >
            {/* Editorial Chronological Marker Node */}
            <span
              aria-hidden="true"
              className={`absolute -left-[30px] top-[5px] h-2.5 w-2.5 rounded-full border-[1.5px] ${
                isLast
                  ? 'border-[var(--ws-rule-editorial)] bg-[var(--ws-rule-editorial)]'
                  : 'border-[var(--ws-rule-editorial)] bg-[var(--ws-surface)]'
              }`}
            />
            {entry.dateLabel && (
              <div className="mb-1.5 inline-flex items-center gap-2 font-mono-tabular text-[11.5px] font-semibold tracking-[0.02em] text-[var(--ws-ink)]">
                <span>{entry.dateLabel}</span>
                <span className="text-[10px] font-normal text-[var(--ws-ink-faint)]">
                  {String(idx + 1).padStart(2, '0')}
                </span>
              </div>
            )}
            <div className="text-[14px] leading-[1.65]">
              <SafeMarkdown
                content={entry.text}
                compact
                onSelectSignal={onSelectSignal}
                onInspectSource={onInspectSource}
                sources={sources}
              />
            </div>
          </li>
        );
      })}
    </ol>
  );
};
