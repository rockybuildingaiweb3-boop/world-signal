import React from 'react';
import type {
  SignalSource,
  SignalTimelineEvent,
  TimelineEntry,
  UiLanguage,
} from '../../types/edition';
import { getUiStrings } from '../../lib/i18n/uiStrings';
import { SafeMarkdown } from './SafeMarkdown';

interface TimelineTrackProps {
  entries: TimelineEntry[];
  rawFallback: string;
  structuredEvents?: SignalTimelineEvent[];
  lang?: UiLanguage;
  onSelectSignal?: (signalId: string) => void;
  onInspectSource?: (sourceId: string) => void;
  onInspectClaim?: (claimId: string) => void;
  sources?: SignalSource[];
}

export const TimelineTrack: React.FC<TimelineTrackProps> = ({
  entries,
  rawFallback,
  structuredEvents = [],
  lang = 'en',
  onSelectSignal,
  onInspectSource,
  onInspectClaim,
  sources,
}) => {
  const t = getUiStrings(lang);

  // Schema-v2 evidence-linked structured timeline events
  if (structuredEvents.length > 0) {
    return (
      <div className="space-y-4">
        <div className="font-mono-tabular text-[10.5px] uppercase tracking-[0.12em] text-[var(--ws-ink-muted)]">
          {t.expanded.structuredTimelineBadge} · {structuredEvents.length}
        </div>
        <ol className="relative space-y-5 border-l border-[var(--ws-border-strong)] pl-6 ml-1.5">
          {structuredEvents.map((ev, idx) => {
            const isLast = idx === structuredEvents.length - 1;
            return (
              <li
                key={ev.event_id || `ev-${idx}`}
                className="relative pb-1 space-y-1.5"
              >
                <span
                  aria-hidden="true"
                  className={`absolute -left-[30px] top-[5px] h-2.5 w-2.5 rounded-full border-[1.5px] ${
                    isLast
                      ? 'border-[var(--ws-rule-editorial)] bg-[var(--ws-rule-editorial)]'
                      : 'border-[var(--ws-rule-editorial)] bg-[var(--ws-surface)]'
                  }`}
                />
                <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5 font-mono-tabular text-[11.5px]">
                  <span className="font-semibold tracking-[0.02em] text-[var(--ws-ink)]">
                    {ev.occurred_at}
                  </span>
                  <span className="text-[10px] text-[var(--ws-ink-faint)]">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  {ev.event_id && (
                    <span className="text-[10.5px] text-[var(--ws-ink-faint)]">
                      {ev.event_id}
                    </span>
                  )}
                </div>
                {ev.title && (
                  <h4 className="font-display text-[1rem] font-semibold leading-snug text-[var(--ws-ink)] break-words">
                    {ev.title}
                  </h4>
                )}
                {ev.summary && (
                  <div className="text-[14px] leading-[1.65] text-[var(--ws-ink-secondary)]">
                    <SafeMarkdown
                      content={ev.summary}
                      compact
                      onSelectSignal={onSelectSignal}
                      onInspectSource={onInspectSource}
                      sources={sources}
                    />
                  </div>
                )}
                {(ev.claim_ids.length > 0 || ev.source_ids.length > 0) && (
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5 font-mono-tabular text-[11px] text-[var(--ws-ink-muted)]">
                    {ev.claim_ids.length > 0 && (
                      <div className="inline-flex flex-wrap items-center gap-1.5">
                        <span className="text-[var(--ws-ink-faint)]">
                          {t.expanded.supportingClaimsLabel}:
                        </span>
                        {ev.claim_ids.map((cid) =>
                          onInspectClaim ? (
                            <button
                              key={cid}
                              type="button"
                              onClick={() => onInspectClaim(cid)}
                              className="text-[var(--ws-world)] underline decoration-dotted underline-offset-2 hover:decoration-solid cursor-pointer"
                            >
                              {cid}
                            </button>
                          ) : (
                            <span key={cid}>{cid}</span>
                          )
                        )}
                      </div>
                    )}
                    {ev.source_ids.length > 0 && (
                      <div className="inline-flex flex-wrap items-center gap-1.5">
                        <span className="text-[var(--ws-ink-faint)]">
                          {t.expanded.supportingSources}:
                        </span>
                        {ev.source_ids.map((sid) => {
                          const src = sources?.find((s) => s.source_id === sid);
                          return onInspectSource ? (
                            <button
                              key={sid}
                              type="button"
                              onClick={() => onInspectSource(sid)}
                              className="text-[var(--ws-ink-secondary)] underline decoration-[var(--ws-border-strong)] underline-offset-2 hover:text-[var(--ws-world)] cursor-pointer"
                            >
                              {sid}
                              {src ? ` (${src.outlet})` : ''}
                            </button>
                          ) : (
                            <span key={sid}>{sid}</span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    );
  }

  // Schema-v1 narrative timeline entries or Markdown fallback
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
