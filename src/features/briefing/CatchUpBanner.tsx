import React from 'react';
import { ArrowRight, CheckCircle2, Clock, Info } from 'lucide-react';
import type { ParsedEdition, UiLanguage } from '../../types/edition';
import { getUiStrings } from '../../lib/i18n/uiStrings';
import type { CatchUpState } from '../../lib/intelligence/catch-up/catchUpEngine';

interface CatchUpBannerProps {
  catchUp: CatchUpState | null;
  edition: ParsedEdition;
  lang: UiLanguage;
  onMarkAsReviewed: (edition: ParsedEdition) => void;
  onOpenCatchUpDesk: () => void;
}

export const CatchUpBanner: React.FC<CatchUpBannerProps> = ({
  catchUp,
  edition,
  lang,
  onMarkAsReviewed,
  onOpenCatchUpDesk,
}) => {
  const t = getUiStrings(lang);

  if (!catchUp || edition.isLocalPreview) return null;

  if (catchUp.status === 'first_visit') {
    return (
      <section
        aria-label={t.catchUp.title}
        data-testid="catch-up-banner"
        data-status="first_visit"
        className="border-y border-[var(--ws-border)] py-3 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-start sm:items-center gap-2.5 min-w-0">
          <Clock className="h-4 w-4 mt-0.5 sm:mt-0 text-[var(--ws-ink-muted)] shrink-0" />
          <p className="text-[13px] leading-relaxed text-[var(--ws-ink-secondary)]">
            <span className="font-semibold text-[var(--ws-ink)] mr-1.5">
              {t.catchUp.firstVisitTitle}
            </span>
            <span aria-hidden="true" className="text-[var(--ws-ink-faint)] mr-1.5">
              ·
            </span>
            {t.catchUp.firstVisitBody(
              catchUp.currentEditionDate,
              catchUp.signalCount
            )}
          </p>
        </div>
        <button
          type="button"
          data-testid="catch-up-mark-reviewed"
          onClick={() => onMarkAsReviewed(edition)}
          className="inline-flex self-start sm:self-center min-h-[34px] items-center gap-1.5 rounded-[var(--ws-radius-sm)] border border-[var(--ws-border-strong)] bg-[var(--ws-surface)] px-3.5 py-1.5 text-[12.5px] font-medium text-[var(--ws-ink)] hover:bg-[var(--ws-surface-hover)] transition-colors cursor-pointer shrink-0 whitespace-nowrap"
        >
          <CheckCircle2 className="h-3.5 w-3.5 text-[var(--ws-economy)]" />
          <span>{t.catchUp.markAsReviewed}</span>
        </button>
      </section>
    );
  }

  if (catchUp.status === 'up_to_date') {
    return (
      <section
        aria-label={t.catchUp.title}
        data-testid="catch-up-banner"
        data-status="up_to_date"
        className="border-y border-[var(--ws-border-subtle)] py-2.5 flex flex-wrap items-center justify-between gap-2 text-[12.5px]"
      >
        <div className="flex items-center gap-2 text-[var(--ws-ink-secondary)] min-w-0">
          <CheckCircle2 className="h-3.5 w-3.5 text-[var(--ws-economy)] shrink-0" />
          <span className="font-semibold text-[var(--ws-ink)]">
            {t.catchUp.upToDateTitle}
          </span>
          <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">
            ·
          </span>
          <span className="font-mono-tabular text-[12px] text-[var(--ws-ink-muted)]">
            {t.catchUp.reviewedCheckpointLabel(catchUp.baselineEditionDate)}
          </span>
        </div>
        <button
          type="button"
          onClick={onOpenCatchUpDesk}
          className="inline-flex items-center gap-1 text-[12.5px] font-medium text-[var(--ws-ink-muted)] hover:text-[var(--ws-ink)] cursor-pointer"
        >
          <span>{t.readerDesk.dialogTitle}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </section>
    );
  }

  if (catchUp.status === 'baseline_unavailable') {
    return (
      <section
        aria-label={t.catchUp.title}
        data-testid="catch-up-banner"
        data-status="baseline_unavailable"
        className="ws-caution-panel px-4 py-3 sm:px-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-start gap-2.5 min-w-0">
          <Info className="h-4 w-4 mt-0.5 text-[var(--ws-warn)] shrink-0" />
          <div className="space-y-0.5 min-w-0">
            <div className="ws-kicker text-[var(--ws-warn)]">
              {t.catchUp.eyebrow} · {t.catchUp.baselineUnavailableTitle}
            </div>
            <p className="text-[13px] leading-relaxed text-[var(--ws-ink-secondary)]">
              {catchUp.reason === 'snapshot_missing'
                ? t.catchUp.baselineUnavailableSnapshot(
                    catchUp.lastReviewedEditionDate
                  )
                : t.catchUp.baselineUnavailableArchived(
                    catchUp.lastReviewedEditionDate
                  )}
            </p>
          </div>
        </div>
        <button
          type="button"
          data-testid="catch-up-mark-reviewed"
          onClick={() => onMarkAsReviewed(edition)}
          className="inline-flex self-start sm:self-center min-h-[34px] items-center gap-1.5 rounded-[var(--ws-radius-sm)] border border-[var(--ws-border-strong)] bg-[var(--ws-surface)] px-3.5 py-1.5 text-[12.5px] font-medium text-[var(--ws-ink)] hover:bg-[var(--ws-surface-hover)] cursor-pointer shrink-0 whitespace-nowrap"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>{t.catchUp.markAsReviewed}</span>
        </button>
      </section>
    );
  }

  return (
    <section
      aria-label={t.catchUp.title}
      data-testid="catch-up-banner"
      data-status="changes_available"
      className="border-y-2 border-y-[var(--ws-ink)] bg-[var(--ws-surface)] px-4 py-3.5 sm:px-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
    >
      <div className="space-y-1.5 min-w-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="ws-kicker text-[var(--ws-editorial-accent)]">
            {t.catchUp.title}
          </span>
          <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">
            ·
          </span>
          <span className="font-mono-tabular text-[12.5px] font-semibold text-[var(--ws-ink)]">
            {t.catchUp.changesHeadline(
              catchUp.baselineEditionDate,
              catchUp.currentEditionDate
            )}
          </span>
          {catchUp.isSameDayRevision && (
            <span className="font-mono-tabular text-[11.5px] font-semibold text-[var(--ws-world)]">
              ({t.catchUp.sameDayRevisionBadge})
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono-tabular text-[12px] text-[var(--ws-ink-muted)]">
          {catchUp.newSignals.length > 0 && (
            <span>
              <strong className="text-[var(--ws-economy)]">
                {catchUp.newSignals.length}
              </strong>{' '}
              {t.catchUp.groupNew}
            </span>
          )}
          {catchUp.updatedSignals.length > 0 && (
            <span>
              <strong className="text-[var(--ws-world)]">
                {catchUp.updatedSignals.length}
              </strong>{' '}
              {t.catchUp.groupUpdated}
            </span>
          )}
          {catchUp.reappearedSignals.length > 0 && (
            <span>
              <strong className="text-[var(--ws-warn)]">
                {catchUp.reappearedSignals.length}
              </strong>{' '}
              {t.catchUp.groupReappeared}
            </span>
          )}
          {catchUp.followedAlerts.length > 0 && (
            <span>
              <strong className="text-[var(--ws-editorial-accent)]">
                {catchUp.followedAlerts.length}
              </strong>{' '}
              {t.catchUp.personalCatchUpTitle}
            </span>
          )}
          {catchUp.omittedSignals.length > 0 && (
            <span>
              <strong className="text-[var(--ws-warn)]">
                {catchUp.omittedSignals.length}
              </strong>{' '}
              {t.catchUp.groupOmitted}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <button
          type="button"
          data-testid="catch-up-open-digest"
          onClick={onOpenCatchUpDesk}
          className="inline-flex min-h-[34px] items-center gap-1.5 rounded-[var(--ws-radius-sm)] border border-[var(--ws-border-strong)] bg-[var(--ws-canvas)] px-3.5 py-1.5 text-[12.5px] font-medium text-[var(--ws-ink)] hover:bg-[var(--ws-surface-hover)] cursor-pointer whitespace-nowrap"
        >
          <span>{t.catchUp.openFullDigest}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          data-testid="catch-up-mark-reviewed"
          onClick={() => onMarkAsReviewed(edition)}
          className="inline-flex min-h-[34px] items-center gap-1.5 rounded-[var(--ws-radius-sm)] bg-[var(--ws-ink)] px-3.5 py-1.5 text-[12.5px] font-medium text-[var(--ws-surface)] hover:opacity-90 cursor-pointer whitespace-nowrap"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>{t.catchUp.markAsReviewed}</span>
        </button>
      </div>
    </section>
  );
};
