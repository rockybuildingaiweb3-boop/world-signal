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
import { StoryVisual } from '../../components/editorial/StoryVisual';

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
    <header className="space-y-6 border-b border-[var(--ws-border-strong)] pb-7">
      {/* Top Domain Rule & Quiet Accession Line */}
      <div className="space-y-3">
        <div
          aria-hidden="true"
          className={`h-[3px] w-16 ${domainTopBarClass(signal.domain)}`}
        />
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 font-mono-tabular text-[12px]">
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
                className="inline-flex min-h-[32px] items-center gap-1.5 rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-canvas)]/70 px-3 py-1 text-xs font-medium text-[var(--ws-ink-secondary)] hover:border-[var(--ws-border-strong)] hover:text-[var(--ws-ink)] transition-colors cursor-pointer shrink-0"
              >
                <GitBranch className="h-3.5 w-3.5 text-[var(--ws-world)]" />
                <span>{t.storyline.triggerButton}</span>
              </button>
            )}

            <button
              type="button"
              data-testid="dossier-follow-btn"
              onClick={onToggleFollow}
              aria-pressed={isFollowed}
              className={`inline-flex min-h-[32px] items-center gap-1.5 rounded-[var(--ws-radius-sm)] border px-3 py-1 text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                isFollowed
                  ? 'border-[var(--ws-world)] bg-[var(--ws-surface-elevated)] text-[var(--ws-world)]'
                  : 'border-[var(--ws-border)] bg-[var(--ws-canvas)]/70 text-[var(--ws-ink-muted)] hover:border-[var(--ws-border-strong)] hover:text-[var(--ws-ink)]'
              }`}
            >
              {isFollowed ? (
                <Eye className="h-3.5 w-3.5" />
              ) : (
                <EyeOff className="h-3.5 w-3.5" />
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
              className={`inline-flex min-h-[32px] items-center gap-1.5 rounded-[var(--ws-radius-sm)] border px-3 py-1 text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                isSaved
                  ? 'border-[var(--ws-editorial-accent)] bg-[var(--ws-surface-elevated)] text-[var(--ws-editorial-accent)]'
                  : 'border-[var(--ws-border)] bg-[var(--ws-canvas)]/70 text-[var(--ws-ink-muted)] hover:border-[var(--ws-border-strong)] hover:text-[var(--ws-ink)]'
              }`}
            >
              {isSaved ? (
                <BookmarkCheck className="h-3.5 w-3.5" />
              ) : (
                <Bookmark className="h-3.5 w-3.5" />
              )}
              <span>
                {isSaved ? t.readerDesk.savedAction : t.readerDesk.saveAction}
              </span>
            </button>

            {!isLocalPreview && (
              <button
                type="button"
                onClick={onCopyLink}
                className="inline-flex min-h-[32px] items-center gap-1.5 rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-canvas)]/70 px-3 py-1 text-xs font-medium text-[var(--ws-ink-muted)] hover:border-[var(--ws-border-strong)] hover:text-[var(--ws-ink)] transition-colors cursor-pointer shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-[var(--ws-economy)]" />
                    <span>{t.expanded.copiedLink}</span>
                  </>
                ) : (
                  <>
                    <Link2 className="h-3.5 w-3.5" />
                    <span>{t.expanded.copySignalLink}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Monumental Investigative Magazine Headline */}
      <div className="space-y-3.5">
        <h2 className="font-display ws-headline-dossier text-[1.95rem] sm:text-[2.45rem] lg:text-[2.75rem] font-semibold text-[var(--ws-ink)] headline-balance break-words">
          {signal.headline}
        </h2>
        <SignalMetaLine signal={signal} lang={lang} showClaims />
      </div>

      {/* Editorial Media or Art-Directed Investigative Dossier Cover Plate */}
      {(signal.importance >= 4 || signal.mediaAssets.length > 0) && (
        <div className="pt-1">
          <StoryVisual
            signal={signal}
            lang={lang}
            context="dossier"
            variant="dossier"
            plateNumber={String(signal.orderIndex + 1).padStart(2, '0')}
          />
        </div>
      )}

      {/* Hairline Provenance Strip (Explicitly Separating Real-World Event Date vs Edition Revision Time) */}
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-y border-[var(--ws-border)] py-4 xl:grid-cols-4 text-xs">
        <div className="min-w-0">
          <dt className="ws-kicker text-[var(--ws-ink-faint)]">
            {t.expanded.eventDateLabel}
          </dt>
          <dd className="mt-1 font-mono-tabular text-[13px] font-semibold text-[var(--ws-ink)] whitespace-nowrap">
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
          <dd className="mt-1 font-mono-tabular text-[13px] font-medium text-[var(--ws-ink)] whitespace-nowrap">
            {formatCompactTimestamp(signal.updated_at, lang)}
          </dd>
        </div>

        <div className="min-w-0 xl:border-l xl:border-[var(--ws-border-subtle)] xl:pl-4">
          <dt className="ws-kicker text-[var(--ws-ink-faint)]">
            {t.expanded.topicLabel}
          </dt>
          <dd className="mt-1 text-[13.5px] font-medium text-[var(--ws-ink)] break-words">
            {signal.topic}
          </dd>
        </div>

        <div className="min-w-0 border-l border-[var(--ws-border-subtle)] pl-4">
          <dt className="ws-kicker text-[var(--ws-ink-faint)]">
            {t.expanded.geographyLabel}
          </dt>
          <dd className="mt-1 text-[13.5px] font-medium text-[var(--ws-ink)] break-words">
            {signal.event.geography.length > 0
              ? signal.event.geography.join(' · ')
              : '—'}
          </dd>
        </div>
      </dl>

      {/* Calibrated Importance Scale & Schema-v2 Storyline Revision Tracking */}
      <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2 text-[12px] font-mono-tabular text-[var(--ws-ink-muted)]">
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
        <div className="ws-folio-note px-4 py-3.5 text-[13.5px] leading-[1.7] text-[var(--ws-ink-secondary)]">
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
