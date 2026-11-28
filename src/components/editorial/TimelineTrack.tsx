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

  // Schema-v2 evidence-linked structured timeline events — structured date-gutter chronology
  if (structuredEvents.length > 0) {
    return (
      <div className="space-y-4">
        <div className="ws-kicker text-[var(--ws-ink-muted)]">
          {t.expanded.structuredTimelineBadge} · {structuredEvents.length}
        </div>
        <ol className="divide-y divide-[var(--ws-border-subtle)] border-y border-[var(--ws-border)]">
          {structuredEvents.map((ev, idx) => {
            const isLast = idx === structuredEvents.length - 1;
            return (
              <li
                key={ev.event_id || `ev-${idx}`}
                className="py-4 grid grid-cols-1 gap-2 sm:grid-cols-[128px_minmax(0,1fr)] sm:gap-6 items-start"
              >
                {/* Chronology Date Gutter */}
                <div className="flex sm:flex-col items-baseline sm:items-start gap-2 sm:gap-1 font-mono-tabular">
                  <div className="inline-flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className={`inline-block h-2 w-2 shrink-0 border ${
                        isLast
                          ? 'border-[var(--ws-editorial-accent)] bg-[var(--ws-editorial-accent)]'
                          : 'border-[var(--ws-rule-editorial)] bg-[var(--ws-surface)]'
                      }`}
                    />
                    <span className="text-[12px] font-semibold text-[var(--ws-ink)]">
                      {ev.occurred_at}
                    </span>
                  </div>
                  <span className="text-[10.5px] text-[var(--ws-ink-faint)] sm:pl-4">
                    {String(idx + 1).padStart(2, '0')}
                    {ev.event_id ? ` · ${ev.event_id}` : ''}
                  </span>
                </div>

                {/* Milestone Narrative & Trace Links */}
                <div className="space-y-1.5 min-w-0">
                  {ev.title && (
                    <h4 className="font-display text-[1.02rem] font-semibold leading-snug text-[var(--ws-ink)] break-words">
                      {ev.title}
                    </h4>
                  )}
                  {ev.summary && (
                    <div className="ws-prose text-[14px] text-[var(--ws-ink-secondary)]">
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
                    <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 pt-1 ws-meta text-[11.5px] text-[var(--ws-ink-muted)]">
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
                                className="font-mono-tabular text-[11px] text-[var(--ws-world)] underline decoration-dotted underline-offset-2 hover:decoration-solid cursor-pointer"
                              >
                                {cid}
                              </button>
                            ) : (
                              <span key={cid} className="font-mono-tabular text-[11px]">
                                {cid}
                              </span>
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
                                <span className="font-mono-tabular text-[11px]">{sid}</span>
                                {src ? ` (${src.outlet})` : ''}
                              </button>
                            ) : (
                              <span key={sid} className="font-mono-tabular text-[11px]">
                                {sid}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
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
    <ol className="divide-y divide-[var(--ws-border-subtle)] border-y border-[var(--ws-border)]">
      {entries.map((entry, idx) => {
        const isLast = idx === entries.length - 1;
        return (
          <li
            key={`${entry.dateLabel ?? 'step'}-${idx}`}
            className="py-3.5 grid grid-cols-1 gap-1.5 sm:grid-cols-[128px_minmax(0,1fr)] sm:gap-6 items-start"
          >
            <div className="inline-flex items-center gap-2 font-mono-tabular text-[12px] font-semibold text-[var(--ws-ink)]">
              <span
                aria-hidden="true"
                className={`inline-block h-2 w-2 shrink-0 border ${
                  isLast
                    ? 'border-[var(--ws-editorial-accent)] bg-[var(--ws-editorial-accent)]'
                    : 'border-[var(--ws-rule-editorial)] bg-[var(--ws-surface)]'
                }`}
              />
              <span>{entry.dateLabel || String(idx + 1).padStart(2, '0')}</span>
            </div>
            <div className="ws-prose text-[14px]">
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
