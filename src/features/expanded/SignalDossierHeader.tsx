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
import { InterfacePhotoPlate } from '../../components/editorial/InterfacePhotoPlate';
import { selectEditorialPhotoForDossier } from '../../lib/editorial/interfaceImageLibrary';

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
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 ws-meta text-[12px]">
            <span className={`ws-kicker ${domainAccentTextClass(signal.domain)}`}>
              {t.domains[signal.domain]}
            </span>
            <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">/</span>
            <span className="font-mono-tabular text-[11.5px] text-[var(--ws-ink-muted)] break-all">
              {signal.signal_id}
            </span>
          </div>

          <div className="inline-flex flex-wrap items-center rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-canvas)]/65 divide-x divide-[var(--ws-border-subtle)] overflow-hidden shrink-0">
            {!isLocalPreview && (
              <button
                type="button"
                data-testid="dossier-storyline-btn"
                onClick={onOpenStoryline}
                className="inline-flex min-h-[32px] items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium text-[var(--ws-ink-secondary)] hover:bg-[var(--ws-surface-hover)] hover:text-[var(--ws-ink)] transition-colors cursor-pointer shrink-0"
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
              className={`inline-flex min-h-[32px] items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium transition-colors cursor-pointer shrink-0 ${
                isFollowed
                  ? 'bg-[var(--ws-world-soft)] text-[var(--ws-world)]'
                  : 'text-[var(--ws-ink-muted)] hover:bg-[var(--ws-surface-hover)] hover:text-[var(--ws-ink)]'
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
              className={`inline-flex min-h-[32px] items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium transition-colors cursor-pointer shrink-0 ${
                isSaved
                  ? 'bg-[var(--ws-surface-elevated)] text-[var(--ws-editorial-accent)]'
                  : 'text-[var(--ws-ink-muted)] hover:bg-[var(--ws-surface-hover)] hover:text-[var(--ws-ink)]'
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
                className="inline-flex min-h-[32px] items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium text-[var(--ws-ink-muted)] hover:bg-[var(--ws-surface-hover)] hover:text-[var(--ws-ink)] transition-colors cursor-pointer shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-[var(--ws-economy)]" />
                    <span className="text-[var(--ws-economy)]">{t.expanded.copiedLink}</span>
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

      {/* Editorial Media, Selective Contextual Photography Opener, or Investigative Dossier Cover Plate */}
      {(() => {
        const dossierPhoto = selectEditorialPhotoForDossier(signal);
        const plateNum = String(signal.orderIndex + 1).padStart(2, '0');
        const isPortraitPhoto = dossierPhoto?.orientation === 'portrait';

        const provenanceGrid = (
          <dl
            className={
              isPortraitPhoto
                ? 'grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4 border-y border-[var(--ws-border)] py-4 text-xs'
                : 'grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3.5 border-y border-[var(--ws-border)] py-4 xl:grid-cols-4 text-xs'
            }
          >
            <div className="min-w-0">
              <dt className="ws-kicker text-[var(--ws-ink-faint)]">
                {t.expanded.eventDateLabel}
              </dt>
              <dd className="mt-1 font-mono-tabular text-[13px] font-semibold text-[var(--ws-ink)] sm:whitespace-nowrap">
                {formatEventDateRange(
                  signal.event.start_date,
                  signal.event.end_date,
                  lang
                )}
              </dd>
            </div>

            <div className="min-w-0 sm:border-l sm:border-[var(--ws-border-subtle)] sm:pl-4">
              <dt className="ws-kicker text-[var(--ws-ink-faint)]">
                {t.expanded.updatedLabel}
              </dt>
              <dd className="mt-1 font-mono-tabular text-[13px] font-medium text-[var(--ws-ink)] sm:whitespace-nowrap">
                {formatCompactTimestamp(signal.updated_at, lang)}
              </dd>
            </div>

            <div
              className={`min-w-0 ${
                isPortraitPhoto
                  ? ''
                  : 'xl:border-l xl:border-[var(--ws-border-subtle)] xl:pl-4'
              }`}
            >
              <dt className="ws-kicker text-[var(--ws-ink-faint)]">
                {t.expanded.topicLabel}
              </dt>
              <dd className="mt-1 text-[13.5px] font-medium text-[var(--ws-ink)] break-words">
                {signal.topic}
              </dd>
            </div>

            <div className="min-w-0 sm:border-l sm:border-[var(--ws-border-subtle)] sm:pl-4">
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
        );

        const importanceAndContinuity = (
          <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2 text-[12px] ws-meta text-[var(--ws-ink-muted)]">
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
              <span className="font-mono-tabular font-semibold text-[var(--ws-ink)]">
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
                    <span className="font-mono-tabular text-[var(--ws-ink)]">
                      {signal.continuity.first_seen_edition}
                    </span>
                  </span>
                )}
                {signal.continuity.last_material_update && (
                  <span>
                    {t.expanded.lastUpdateLabel}:{' '}
                    <span className="font-mono-tabular text-[var(--ws-ink)]">
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
        );

        const confidenceRationaleBlock = signal.confidence.rationale ? (
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
        ) : null;

        if (dossierPhoto && isPortraitPhoto) {
          const plateLabel =
            lang === 'zh-CN'
              ? `档案 ${plateNum} · 编务语境`
              : `DOSSIER ${plateNum} · CONTEXT`;

          return (
            <div
              data-testid="dossier-editorial-photo"
              className="pt-2 grid grid-cols-1 md:grid-cols-12 gap-7 lg:gap-9 items-start"
            >
              <div className="md:col-span-5 group">
                <InterfacePhotoPlate
                  photo={dossierPhoto}
                  lang={lang}
                  aspect="4/5"
                  priority
                  compact
                  plateLabel={plateLabel}
                />
              </div>
              <div className="md:col-span-7 md:border-l md:border-[var(--ws-border)] md:pl-7 space-y-5">
                {/* Grounded Dossier Evidence Figures */}
                <div className="space-y-2.5">
                  <div className="ws-kicker text-[var(--ws-ink-faint)]">
                    {lang === 'zh-CN' ? '档案核查概览' : 'Dossier Verification Summary'}
                  </div>
                  <dl className="grid grid-cols-3 gap-4 ws-meta">
                    <div>
                      <dt className="text-[11.5px] text-[var(--ws-ink-muted)]">
                        {t.briefing.artworkOriginsLabel}
                      </dt>
                      <dd className="mt-1 ws-editorial-numeral text-[28px] sm:text-[34px] text-[var(--ws-ink)]">
                        {signal.independentOriginCount}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11.5px] text-[var(--ws-ink-muted)]">
                        {t.briefing.artworkClaimsLabel}
                      </dt>
                      <dd className="mt-1 ws-editorial-numeral text-[28px] sm:text-[34px] text-[var(--ws-ink)]">
                        {signal.claims.length}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11.5px] text-[var(--ws-ink-muted)]">
                        {t.briefing.artworkSourcesLabel}
                      </dt>
                      <dd className="mt-1 ws-editorial-numeral text-[28px] sm:text-[34px] text-[var(--ws-ink)]">
                        {signal.sources.length}
                      </dd>
                    </div>
                  </dl>
                </div>

                {provenanceGrid}
                {importanceAndContinuity}
                {confidenceRationaleBlock}
              </div>
            </div>
          );
        }

        return (
          <>
            {dossierPhoto ? (
              <div data-testid="dossier-editorial-photo" className="pt-1 group">
                <InterfacePhotoPlate
                  photo={dossierPhoto}
                  lang={lang}
                  aspect={dossierPhoto.id === 'world-city-aerial' ? '21/8' : '21/9'}
                  objectPositionOverride={
                    dossierPhoto.id === 'world-city-aerial' ? '50% 0%' : undefined
                  }
                  priority
                  plateLabel={
                    lang === 'zh-CN'
                      ? `档案 ${plateNum} · 编务语境`
                      : `DOSSIER ${plateNum} · CONTEXT`
                  }
                />
              </div>
            ) : signal.importance >= 4 || signal.mediaAssets.length > 0 ? (
              <div className="pt-1">
                <StoryVisual
                  signal={signal}
                  lang={lang}
                  context="dossier"
                  variant="dossier"
                  plateNumber={plateNum}
                />
              </div>
            ) : null}

            {provenanceGrid}
            {importanceAndContinuity}
            {confidenceRationaleBlock}
          </>
        );
      })()}

      {/* Editorial Section Jump Navigation (Compact viewports; xl+ uses Sticky Editorial Margin Rail) */}
      {jumpSections.length > 0 && (
        <nav
          aria-label={t.expanded.sectionJumpLabel}
          className="xl:hidden flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 ws-meta text-[12px] text-[var(--ws-ink-muted)]"
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
