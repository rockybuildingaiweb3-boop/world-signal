import React from 'react';
import { Check, Link2 } from 'lucide-react';
import type { ParsedSignal, SignalDomain, UiLanguage } from '../../types/edition';
import { getUiStrings } from '../../lib/i18n/uiStrings';
import {
  confidenceColorClass,
  domainAccentTextClass,
} from '../../lib/filtering/filterSignals';
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

function domainTopBarClass(domain: SignalDomain): string {
  switch (domain) {
    case 'world':
      return 'bg-[var(--ws-world)]';
    case 'ai':
      return 'bg-[var(--ws-ai)]';
    case 'economy':
      return 'bg-[var(--ws-economy)]';
  }
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
    <header className="space-y-5 border-b border-[var(--ws-border-strong)] pb-6">
      {/* Top Domain Rule & Kicker Strip */}
      <div className="space-y-3">
        <div
          aria-hidden="true"
          className={`h-[3px] w-14 ${domainTopBarClass(signal.domain)}`}
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono-tabular text-[11.5px]">
            <span className={`font-semibold uppercase tracking-[0.12em] ${domainAccentTextClass(signal.domain)}`}>
              {t.domains[signal.domain]}
            </span>
            <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">·</span>
            <span className="text-[var(--ws-ink-muted)] break-all">
              {signal.signal_id}
            </span>
          </div>

          {!isLocalPreview && (
            <button
              type="button"
              onClick={onCopyLink}
              className="inline-flex min-h-[30px] items-center gap-1.5 rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-canvas)]/70 px-2.5 py-1 text-xs font-medium text-[var(--ws-ink-muted)] hover:border-[var(--ws-border-strong)] hover:text-[var(--ws-ink)] transition-colors cursor-pointer shrink-0"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-[var(--ws-economy)]" />
                  <span>{t.expanded.copiedLink}</span>
                </>
              ) : (
                <>
                  <Link2 className="h-3 w-3" />
                  <span>{t.expanded.copySignalLink}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Expressive Magazine Dossier Display Headline */}
      <div className="space-y-3">
        <h2 className="font-display text-[1.7rem] sm:text-[2.15rem] lg:text-[2.35rem] font-semibold leading-[1.18] tracking-[-0.024em] text-[var(--ws-ink)] headline-balance break-words">
          {signal.headline}
        </h2>
        <SignalMetaLine signal={signal} lang={lang} showClaims />
      </div>

      {/* Clean Hairline-Divided Provenance Strip (No Heavy Box Clutter) */}
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3.5 border-y border-[var(--ws-border)] py-3.5 sm:grid-cols-4 text-xs">
        <div className="min-w-0">
          <dt className="font-mono-tabular text-[10.5px] uppercase tracking-[0.1em] text-[var(--ws-ink-muted)]">
            {t.expanded.eventDateLabel}
          </dt>
          <dd className="mt-1 font-mono-tabular font-semibold text-[var(--ws-ink)] break-words">
            {formatEventDateRange(
              signal.event.start_date,
              signal.event.end_date,
              lang
            )}
          </dd>
        </div>

        <div className="min-w-0 sm:border-l sm:border-[var(--ws-border-subtle)] sm:pl-4">
          <dt className="font-mono-tabular text-[10.5px] uppercase tracking-[0.1em] text-[var(--ws-ink-muted)]">
            {t.expanded.updatedLabel}
          </dt>
          <dd className="mt-1 font-mono-tabular font-medium text-[var(--ws-ink)] break-words">
            {formatCompactTimestamp(signal.updated_at, lang)}
          </dd>
        </div>

        <div className="min-w-0 sm:border-l sm:border-[var(--ws-border-subtle)] sm:pl-4">
          <dt className="font-mono-tabular text-[10.5px] uppercase tracking-[0.1em] text-[var(--ws-ink-muted)]">
            {t.expanded.topicLabel}
          </dt>
          <dd className="mt-1 font-medium text-[var(--ws-ink)] break-words">
            {signal.topic}
          </dd>
        </div>

        <div className="min-w-0 sm:border-l sm:border-[var(--ws-border-subtle)] sm:pl-4">
          <dt className="font-mono-tabular text-[10.5px] uppercase tracking-[0.1em] text-[var(--ws-ink-muted)]">
            {t.expanded.geographyLabel}
          </dt>
          <dd className="mt-1 font-medium text-[var(--ws-ink)] break-words">
            {signal.event.geography.length > 0
              ? signal.event.geography.join(', ')
              : '—'}
          </dd>
        </div>
      </dl>

      {/* Quiet Editorial Left-Ruled Confidence Rationale */}
      {signal.confidence.rationale && (
        <div className="border-l-2 border-[var(--ws-border-strong)] pl-4 py-0.5 text-[13px] leading-[1.65] text-[var(--ws-ink-secondary)]">
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

      {/* Editorial Section Jump Navigation */}
      {jumpSections.length > 0 && (
        <nav
          aria-label={t.expanded.sectionJumpLabel}
          className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 pt-1 font-mono-tabular text-[11.5px] text-[var(--ws-ink-muted)]"
        >
          <span className="uppercase tracking-[0.12em] text-[10.5px] text-[var(--ws-ink-faint)]">
            {t.expanded.sectionJumpLabel}
          </span>
          {jumpSections.map((sec) => (
            <a
              key={sec.id}
              href={`#${sec.id}`}
              className="hover:text-[var(--ws-ink)] underline decoration-[var(--ws-border)] underline-offset-4 hover:decoration-current transition-colors"
            >
              {sec.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
};
