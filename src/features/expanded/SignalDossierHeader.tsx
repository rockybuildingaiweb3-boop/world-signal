import React from 'react';
import { Check, Link2 } from 'lucide-react';
import type { ParsedSignal, UiLanguage } from '../../types/edition';
import { getUiStrings } from '../../lib/i18n/uiStrings';
import { confidenceColorClass } from '../../lib/filtering/filterSignals';
import {
  formatCompactTimestamp,
  formatEventDateRange,
} from '../../lib/dates/formatDates';
import { SignalMetaLine } from '../../components/editorial/SignalMetaLine';

interface SignalDossierHeaderProps {
  signal: ParsedSignal;
  lang: UiLanguage;
  isLocalPreview: boolean;
  copied: boolean;
  onCopyLink: () => void;
  jumpSections: Array<{ id: string; label: string }>;
}

export const SignalDossierHeader: React.FC<SignalDossierHeaderProps> = ({
  signal,
  lang,
  isLocalPreview,
  copied,
  onCopyLink,
  jumpSections,
}) => {
  const t = getUiStrings(lang);

  return (
    <header className="space-y-4 border-b border-[var(--ws-border)] pb-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono-tabular text-xs text-[var(--ws-ink-muted)] break-all">
          {signal.signal_id}
        </span>
        {!isLocalPreview && (
          <button
            type="button"
            onClick={onCopyLink}
            className="inline-flex items-center gap-1.5 rounded border border-[var(--ws-border)] px-2.5 py-1 text-xs font-medium text-[var(--ws-ink-muted)] hover:border-[var(--ws-border-strong)] hover:text-[var(--ws-ink)] cursor-pointer shrink-0"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-[var(--ws-economy)]" />
                {t.expanded.copiedLink}
              </>
            ) : (
              <>
                <Link2 className="h-3 w-3" />
                {t.expanded.copySignalLink}
              </>
            )}
          </button>
        )}
      </div>

      <h2 className="font-display text-2xl sm:text-[1.9rem] font-semibold leading-[1.22] tracking-[-0.02em] text-[var(--ws-ink)] headline-balance break-words">
        {signal.headline}
      </h2>

      <SignalMetaLine signal={signal} lang={lang} showClaims />

      {/* Provenance Metadata Grid — Strictly Separating Event Date vs. Publication/Verification Times */}
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-md border border-[var(--ws-border)] bg-[var(--ws-surface-subtle)] p-4 sm:grid-cols-4 text-xs">
        <div className="min-w-0">
          <dt className="font-mono-tabular text-[10.5px] uppercase tracking-wider text-[var(--ws-ink-muted)]">
            {t.expanded.eventDateLabel}
          </dt>
          <dd className="mt-0.5 font-mono-tabular font-medium text-[var(--ws-ink)] break-words">
            {formatEventDateRange(
              signal.event.start_date,
              signal.event.end_date,
              lang
            )}
          </dd>
        </div>

        <div className="min-w-0">
          <dt className="font-mono-tabular text-[10.5px] uppercase tracking-wider text-[var(--ws-ink-muted)]">
            {t.expanded.updatedLabel}
          </dt>
          <dd className="mt-0.5 font-mono-tabular font-medium text-[var(--ws-ink)] break-words">
            {formatCompactTimestamp(signal.updated_at, lang)}
          </dd>
        </div>

        <div className="min-w-0">
          <dt className="font-mono-tabular text-[10.5px] uppercase tracking-wider text-[var(--ws-ink-muted)]">
            {t.expanded.topicLabel}
          </dt>
          <dd className="mt-0.5 font-medium text-[var(--ws-ink)] break-words">
            {signal.topic}
          </dd>
        </div>

        <div className="min-w-0">
          <dt className="font-mono-tabular text-[10.5px] uppercase tracking-wider text-[var(--ws-ink-muted)]">
            {t.expanded.geographyLabel}
          </dt>
          <dd className="mt-0.5 font-medium text-[var(--ws-ink)] break-words">
            {signal.event.geography.length > 0
              ? signal.event.geography.join(', ')
              : '—'}
          </dd>
        </div>
      </dl>

      {/* Confidence Rationale (Separated clearly from Importance) */}
      {signal.confidence.rationale && (
        <div className="rounded-md border border-[var(--ws-border)] bg-[var(--ws-surface-elevated)] px-4 py-3 text-xs leading-relaxed text-[var(--ws-ink-secondary)]">
          <span
            className={`font-semibold ${confidenceColorClass(
              signal.confidence.overall
            )}`}
          >
            {t.expanded.confidenceRationaleTitle} (
            {t.confidence[signal.confidence.overall]}):{' '}
          </span>
          {signal.confidence.rationale}
        </div>
      )}

      {/* Compact Section Jump Strip */}
      {jumpSections.length > 0 && (
        <nav
          aria-label={t.expanded.sectionJumpLabel}
          className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-1 font-mono-tabular text-[11.5px] text-[var(--ws-ink-muted)]"
        >
          <span className="uppercase tracking-wider text-[10.5px]">
            {t.expanded.sectionJumpLabel}:
          </span>
          {jumpSections.map((sec) => (
            <a
              key={sec.id}
              href={`#${sec.id}`}
              className="hover:text-[var(--ws-ink)] underline decoration-[var(--ws-border)] underline-offset-2 hover:decoration-current"
            >
              {sec.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
};
