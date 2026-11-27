import React from 'react';
import {
  Bookmark,
  BookmarkCheck,
  Check,
  Eye,
  EyeOff,
  GitBranch,
  Link2,
} from 'lucide-react';
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
  onOpenStoryline: () => void;
  isSaved: boolean;
  isFollowed: boolean;
  onToggleSave: () => void;
  onToggleFollow: () => void;
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
  onOpenStoryline,
  isSaved,
  isFollowed,
  onToggleSave,
  onToggleFollow,
  jumpSections,
}) => {
  const t = getUiStrings(lang);

  return (
    <header className="space-y-5 border-b border-[var(--ws-border-strong)] pb-6">
      {/* Top Domain Rule & Quiet Accession Line */}
      <div className="space-y-3">
        <div
          aria-hidden="true"
          className={`h-[3px] w-14 ${domainTopBarClass(signal.domain)}`}
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono-tabular text-[11.5px]">
            <span className={`ws-kicker ${domainAccentTextClass(signal.domain)}`}>
              {t.domains[signal.domain]}
            </span>
            <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">/</span>
            <span className="text-[var(--ws-ink-muted)] break-all">
              {signal.signal_id}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            {!isLocalPreview && (
              <button
                type="button"
                data-testid="dossier-storyline-btn"
                onClick={onOpenStoryline}
                className="inline-flex min-h-[30px] items-center gap-1.5 rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-canvas)]/70 px-2.5 py-1 text-xs font-medium text-[var(--ws-ink-secondary)] hover:border-[var(--ws-border-strong)] hover:text-[var(--ws-ink)] transition-colors cursor-pointer shrink-0"
              >
                <GitBranch className="h-3 w-3 text-[var(--ws-world)]" />
                <span>{t.storyline.triggerButton}</span>
              </button>
            )}

            <button
              type="button"
              data-testid="dossier-follow-btn"
              onClick={onToggleFollow}
              aria-pressed={isFollowed}
              className={`inline-flex min-h-[30px] items-center gap-1.5 rounded-[var(--ws-radius-sm)] border px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                isFollowed
                  ? 'border-[var(--ws-world)] bg-[var(--ws-surface-elevated)] text-[var(--ws-world)]'
                  : 'border-[var(--ws-border)] bg-[var(--ws-canvas)]/70 text-[var(--ws-ink-muted)] hover:border-[var(--ws-border-strong)] hover:text-[var(--ws-ink)]'
              }`}
            >
              {isFollowed ? (
                <Eye className="h-3 w-3" />
              ) : (
                <EyeOff className="h-3 w-3" />
              )}
              <span>
                {isFollowed ? t.readerDesk.followingAction : t.readerDesk.followAction}
              </span>
            </button>

            <button
              type="button"
              data-testid="dossier-save-btn"
              onClick={onToggleSave}
              aria-pressed={isSaved}
              className={`inline-flex min-h-[30px] items-center gap-1.5 rounded-[var(--ws-radius-sm)] border px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                isSaved
                  ? 'border-[var(--ws-editorial-accent)] bg-[var(--ws-surface-elevated)] text-[var(--ws-editorial-accent)]'
                  : 'border-[var(--ws-border)] bg-[var(--ws-canvas)]/70 text-[var(--ws-ink-muted)] hover:border-[var(--ws-border-strong)] hover:text-[var(--ws-ink)]'
              }`}
            >
              {isSaved ? (
                <BookmarkCheck className="h-3 w-3" />
              ) : (
                <Bookmark className="h-3 w-3" />
              )}
              <span>
                {isSaved ? t.readerDesk.savedAction : t.readerDesk.saveAction}
              </span>
            </button>

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
      </div>

      {/* Monumental Magazine Dossier Headline */}
      <div className="space-y-3">
        <h2 className="font-display ws-headline-dossier text-[1.75rem] sm:text-[2.25rem] lg:text-[2.5rem] font-semibold text-[var(--ws-ink)] headline-balance break-words">
          {signal.headline}
        </h2>
        <SignalMetaLine signal={signal} lang={lang} showClaims />
      </div>

      {/* Hairline Provenance Strip (2x2 on compact/1024px to prevent timestamp splits, 4-col on xl+) */}
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-y border-[var(--ws-border)] py-4 xl:grid-cols-4 text-xs">
        <div className="min-w-0">
          <dt className="ws-kicker text-[var(--ws-ink-faint)]">
            {t.expanded.eventDateLabel}
          </dt>
          <dd className="mt-1 font-mono-tabular text-[12.5px] font-semibold text-[var(--ws-ink)] whitespace-nowrap">
            {formatEventDateRange(
              signal.event.start_date,
              signal.event.end_date,
              lang
            )}
          </dd>
        </div>

        <div className="min-w-0 border-l border-[var(--ws-border-subtle)] pl-4">
          <dt className="ws-kicker text-[var(--ws-ink-faint)]">
            {t.expanded.updatedLabel}
          </dt>
          <dd className="mt-1 font-mono-tabular text-[12.5px] font-medium text-[var(--ws-ink)] whitespace-nowrap">
            {formatCompactTimestamp(signal.updated_at, lang)}
          </dd>
        </div>

        <div className="min-w-0 xl:border-l xl:border-[var(--ws-border-subtle)] xl:pl-4">
          <dt className="ws-kicker text-[var(--ws-ink-faint)]">
            {t.expanded.topicLabel}
          </dt>
          <dd className="mt-1 text-[13px] font-medium text-[var(--ws-ink)] break-words">
            {signal.topic}
          </dd>
        </div>

        <div className="min-w-0 border-l border-[var(--ws-border-subtle)] pl-4">
          <dt className="ws-kicker text-[var(--ws-ink-faint)]">
            {t.expanded.geographyLabel}
          </dt>
          <dd className="mt-1 text-[13px] font-medium text-[var(--ws-ink)] break-words">
            {signal.event.geography.length > 0
              ? signal.event.geography.join(' · ')
              : '—'}
          </dd>
        </div>
      </dl>

      {/* Calibrated Importance Scale & Schema-v2 Storyline Continuity */}
      <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2 text-[11.5px] font-mono-tabular text-[var(--ws-ink-muted)]">
        <div className="inline-flex items-center gap-2.5">
          <span className="ws-kicker text-[var(--ws-ink-faint)]">
            {t.expanded.importanceLabel}
          </span>
          <span
            aria-label={t.metaLine.importance(signal.importance)}
            className="inline-flex items-center gap-1"
          >
            {[1, 2, 3, 4, 5].map((step) => (
              <span
                key={step}
                aria-hidden="true"
                className={`h-2.5 w-2 rounded-[1px] ${
                  step <= signal.importance
                    ? domainTopBarClass(signal.domain)
                    : 'bg-[var(--ws-border)]'
                }`}
              />
            ))}
          </span>
          <span className="font-semibold text-[var(--ws-ink)]">
            {signal.importance}/5
          </span>
        </div>

        {signal.continuity && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="ws-kicker text-[var(--ws-ink-faint)]">
              {t.expanded.continuityLabel}
            </span>
            <span className="font-semibold text-[var(--ws-ink)]">
              {t.signalLifecycle[signal.continuity.lifecycle]}
            </span>
            {signal.continuity.first_seen_edition && (
              <span>
                {t.expanded.firstSeenLabel}:{' '}
                <span className="text-[var(--ws-ink)]">
                  {signal.continuity.first_seen_edition}
                </span>
              </span>
            )}
            {signal.continuity.last_material_update && (
              <span>
                {t.expanded.lastUpdateLabel}:{' '}
                <span className="text-[var(--ws-ink)]">
                  {signal.continuity.last_material_update}
                </span>
              </span>
            )}
            {!signal.continuity.history_complete && (
              <span className="text-[var(--ws-warn)]">
                · {t.expanded.historyIncompleteNote}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Hairline-Framed Confidence Rationale */}
      {signal.confidence.rationale && (
        <div className="ws-folio-note px-4 py-3 text-[13px] leading-[1.68] text-[var(--ws-ink-secondary)]">
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

      {/* Editorial Section Jump Navigation (Compact viewports; xl+ uses Sticky Editorial Margin Rail) */}
      {jumpSections.length > 0 && (
        <nav
          aria-label={t.expanded.sectionJumpLabel}
          className="xl:hidden flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 font-mono-tabular text-[11.5px] text-[var(--ws-ink-muted)]"
        >
          <span className="ws-kicker text-[var(--ws-ink-faint)]">
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
