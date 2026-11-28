import React from 'react';
import type { SignalDomain, SignalSource } from '../../../types/edition';
import { extractLeadThesis } from '../../../lib/editorial/editorialPullQuote';
import { SafeMarkdown } from '../SafeMarkdown';

interface PullQuoteBandProps {
  kicker: string;
  content: string;
  domain?: SignalDomain;
  id?: string;
  onSelectSignal?: (signalId: string) => void;
  onInspectSource?: (sourceId: string) => void;
  sources?: SignalSource[];
}

function getAccentVar(domain?: SignalDomain): string {
  if (domain === 'world') return 'var(--ws-world)';
  if (domain === 'ai') return 'var(--ws-ai)';
  if (domain === 'economy') return 'var(--ws-economy)';
  return 'var(--ws-editorial-accent)';
}

/**
 * Editorial analytical thesis pull-quote band (Composition Pattern 06).
 * Strictly surfaces the real opening sentence from canonical signal prose
 * in display serif framed by fine horizontal hairline rules, preserving full
 * interactive citations in the accompanying prose underneath.
 */
export const PullQuoteBand: React.FC<PullQuoteBandProps> = ({
  kicker,
  content,
  domain,
  id,
  onSelectSignal,
  onInspectSource,
  sources,
}) => {
  const extracted = extractLeadThesis(content);
  const accent = getAccentVar(domain);

  return (
    <section
      id={id}
      data-testid="editorial-pull-quote-band"
      className="scroll-mt-24 border-y border-[var(--ws-border-strong)] bg-[var(--ws-surface-tint)]/55 px-5 py-6 sm:px-7 sm:py-7 space-y-4"
    >
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="inline-block h-[2px] w-6 shrink-0"
          style={{ backgroundColor: accent }}
        />
        <h3 className="ws-kicker" style={{ color: accent }}>
          {kicker}
        </h3>
      </div>

      {extracted ? (
        <>
          <blockquote className="m-0 p-0 font-display text-[1.16rem] sm:text-[1.3rem] font-semibold leading-[1.46] tracking-[-0.014em] text-[var(--ws-ink)] [text-wrap:pretty]">
            {extracted.thesis}
          </blockquote>

          {extracted.remainderMarkdown && (
            <div className="border-t border-[var(--ws-border)] pt-4 ws-prose text-[15px] text-[var(--ws-ink-secondary)]">
              <SafeMarkdown
                content={extracted.remainderMarkdown}
                className="text-[var(--ws-ink-secondary)]"
                onSelectSignal={onSelectSignal}
                onInspectSource={onInspectSource}
                sources={sources}
              />
            </div>
          )}
        </>
      ) : (
        <div className="ws-prose text-[15.5px] text-[var(--ws-ink)]">
          <SafeMarkdown
            content={content}
            className="text-[var(--ws-ink)]"
            onSelectSignal={onSelectSignal}
            onInspectSource={onInspectSource}
            sources={sources}
          />
        </div>
      )}
    </section>
  );
};
