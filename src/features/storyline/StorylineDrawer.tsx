import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Eye,
  EyeOff,
  GitBranch,
  Info,
  RefreshCw,
  X,
} from 'lucide-react';
import type { UiLanguage } from '../../types/edition';
import { getUiStrings } from '../../lib/i18n/uiStrings';
import {
  confidenceColorClass,
  domainAccentTextClass,
} from '../../lib/filtering/filterSignals';
import type {
  SignalStorylineProjection,
  StorylineRevisionDetail,
} from '../../lib/intelligence/storylines/storylineHelpers';
import type { SignalBookmarkInput } from '../../hooks/useReaderDesk';
import { useAccessibleModal } from '../../hooks/useAccessibleModal';

interface StorylineDrawerProps {
  signalId: string | null;
  onClose: () => void;
  lang: UiLanguage;
  projection: SignalStorylineProjection | null;
  isLoading: boolean;
  loadedCount: number;
  totalCount: number;
  failedDates: string[];
  error: string | null;
  onCancel: () => void;
  onRetry: () => void;
  onOpenSignalInEdition: (editionDate: string, signalId: string) => void;
  isSaved: (signalId: string) => boolean;
  isFollowed: (signalId: string) => boolean;
  onToggleSave: (input: SignalBookmarkInput) => void;
  onToggleFollow: (input: SignalBookmarkInput) => void;
}

function revisionKindAccent(kind: StorylineRevisionDetail['kind']): string {
  switch (kind) {
    case 'first_seen':
      return 'text-[var(--ws-economy)]';
    case 'material_update':
      return 'text-[var(--ws-world)]';
    case 'reappeared':
      return 'text-[var(--ws-warn)]';
    case 'unchanged':
      return 'text-[var(--ws-ink-muted)]';
  }
}

function revisionMarkerColor(kind: StorylineRevisionDetail['kind']): string {
  switch (kind) {
    case 'first_seen':
      return 'bg-[var(--ws-economy)]';
    case 'material_update':
      return 'bg-[var(--ws-world)]';
    case 'reappeared':
      return 'bg-[var(--ws-warn)]';
    case 'unchanged':
      return 'bg-[var(--ws-border-strong)]';
  }
}

export const StorylineDrawer: React.FC<StorylineDrawerProps> = ({
  signalId,
  onClose,
  lang,
  projection,
  isLoading,
  loadedCount,
  totalCount,
  failedDates,
  error,
  onCancel,
  onRetry,
  onOpenSignalInEdition,
  isSaved,
  isFollowed,
  onToggleSave,
  onToggleFollow,
}) => {
  const t = getUiStrings(lang);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const titleId = React.useId();
  const isOpen = Boolean(signalId);

  const [selectedEditionDate, setSelectedEditionDate] = useState<string | null>(
    null
  );

  useAccessibleModal(isOpen, onClose, panelRef);

  // Default to the newest revision whenever projection changes
  useEffect(() => {
    if (!projection || projection.revisions.length === 0) {
      setSelectedEditionDate(null);
      return;
    }
    setSelectedEditionDate((prev) => {
      if (prev && projection.revisions.some((r) => r.editionDate === prev)) {
        return prev;
      }
      return projection.revisions[projection.revisions.length - 1].editionDate;
    });
  }, [projection]);

  if (!isOpen || !signalId) return null;

  const selectedRevision: StorylineRevisionDetail | null =
    projection?.revisions.find((r) => r.editionDate === selectedEditionDate) ??
    projection?.revisions[projection.revisions.length - 1] ??
    null;

  const saved = isSaved(signalId);
  const followed = isFollowed(signalId);

  const bookmarkInput: SignalBookmarkInput | null = projection
    ? {
        signalId: projection.signalId,
        editionDate: projection.lastAvailableAppearance,
        headline: projection.headline,
        domain: projection.domain,
      }
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#141311]/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      data-testid="storyline-drawer"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="flex h-full w-full max-w-[680px] flex-col border-l border-[var(--ws-border-strong)] bg-[var(--ws-canvas)] shadow-[var(--ws-shadow-lg)]"
      >
        {/* Header */}
        <div className="ws-drawer-masthead px-5 py-4.5 sm:px-6 space-y-2.5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 ws-kicker text-[var(--ws-editorial-accent)]">
                <GitBranch className="h-3.5 w-3.5 shrink-0" />
                <span>{t.storyline.dialogTitle}</span>
              </div>
              <h2
                id={titleId}
                className="font-display text-[1.28rem] sm:text-[1.42rem] font-semibold leading-snug tracking-[-0.015em] text-[var(--ws-ink)] break-words"
              >
                {projection ? projection.headline : signalId}
              </h2>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 ws-meta text-[11.5px] text-[var(--ws-ink-muted)]">
                {projection && (
                  <>
                    <span
                      className={`ws-kicker ${domainAccentTextClass(
                        projection.domain
                      )}`}
                    >
                      {t.domains[projection.domain]}
                    </span>
                    <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">
                      ·
                    </span>
                  </>
                )}
                <span className="font-mono-tabular text-[11px] break-all">{signalId}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label={t.storyline.close}
              data-testid="storyline-close"
              className="rounded-[var(--ws-radius-sm)] p-1.5 text-[var(--ws-ink-muted)] hover:bg-[var(--ws-surface-subtle)] hover:text-[var(--ws-ink)] transition-colors cursor-pointer shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Quick Personal Desk Actions */}
          {bookmarkInput && (
            <div className="pt-0.5">
              <div className="inline-flex flex-wrap items-center rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-canvas)] divide-x divide-[var(--ws-border-subtle)] overflow-hidden">
                <button
                  type="button"
                  data-testid="storyline-follow-btn"
                  onClick={() => onToggleFollow(bookmarkInput)}
                  aria-pressed={followed}
                  className={`inline-flex min-h-[30px] items-center gap-1.5 px-2.5 py-1 text-[11.5px] font-medium cursor-pointer transition-colors ${
                    followed
                      ? 'bg-[var(--ws-world-soft)] text-[var(--ws-world)]'
                      : 'text-[var(--ws-ink-secondary)] hover:bg-[var(--ws-surface-hover)] hover:text-[var(--ws-ink)]'
                  }`}
                >
                  {followed ? (
                    <Eye className="h-3.5 w-3.5" />
                  ) : (
                    <EyeOff className="h-3.5 w-3.5" />
                  )}
                  <span>
                    {followed
                      ? t.readerDesk.followingAction
                      : t.readerDesk.followAction}
                  </span>
                </button>

                <button
                  type="button"
                  data-testid="storyline-save-btn"
                  onClick={() => onToggleSave(bookmarkInput)}
                  aria-pressed={saved}
                  className={`inline-flex min-h-[30px] items-center gap-1.5 px-2.5 py-1 text-[11.5px] font-medium cursor-pointer transition-colors ${
                    saved
                      ? 'bg-[var(--ws-surface-elevated)] text-[var(--ws-editorial-accent)]'
                      : 'text-[var(--ws-ink-secondary)] hover:bg-[var(--ws-surface-hover)] hover:text-[var(--ws-ink)]'
                  }`}
                >
                  {saved ? (
                    <BookmarkCheck className="h-3.5 w-3.5" />
                  ) : (
                    <Bookmark className="h-3.5 w-3.5" />
                  )}
                  <span>
                    {saved ? t.readerDesk.savedAction : t.readerDesk.saveAction}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto ws-scroll px-5 py-5 space-y-5">
          {/* Incremental Loading Banner */}
          {isLoading && (
            <div className="ws-folio-note px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-[12px] text-[var(--ws-ink-secondary)]">
              <div className="flex items-center gap-2 ws-meta">
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-[var(--ws-world)] shrink-0" />
                <span>{t.storyline.loadingHistory(loadedCount, totalCount)}</span>
              </div>
              <button
                type="button"
                onClick={onCancel}
                className="text-[11.5px] font-semibold text-[var(--ws-ink)] underline underline-offset-4 cursor-pointer"
              >
                {t.storyline.cancelLoading}
              </button>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="rounded-[var(--ws-radius-sm)] border border-[var(--ws-error-border)] bg-[var(--ws-error-soft)] px-4 py-3 space-y-2">
              <div className="ws-kicker text-[var(--ws-error)]">
                {t.storyline.errorTitle}
              </div>
              <p className="text-[12.5px] text-[var(--ws-ink-secondary)]">{error}</p>
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[var(--ws-ink)] underline underline-offset-4 cursor-pointer"
              >
                <RefreshCw className="h-3 w-3" />
                <span>{t.storyline.retryLoading}</span>
              </button>
            </div>
          )}

          {/* Empty State */}
          {!projection && !isLoading && !error && (
            <div className="ws-folio-panel p-6 text-center space-y-2">
              <h3 className="font-display text-base font-semibold text-[var(--ws-ink)]">
                {t.storyline.emptyTitle}
              </h3>
              <p className="text-[13px] text-[var(--ws-ink-muted)]">
                {t.storyline.emptyBody}
              </p>
            </div>
          )}

          {projection && (
            <>
              {/* Storyline Overview Grid */}
              <section className="border-y border-[var(--ws-border-strong)] bg-[var(--ws-surface)] p-4">
                <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3.5 text-xs">
                  <div>
                    <dt className="ws-kicker text-[var(--ws-ink-faint)]">
                      {t.storyline.firstSeenLabel}
                    </dt>
                    <dd className="mt-1 font-mono-tabular text-[12.5px] font-semibold text-[var(--ws-ink)]">
                      {projection.firstAvailableAppearance}
                    </dd>
                  </div>
                  <div>
                    <dt className="ws-kicker text-[var(--ws-ink-faint)]">
                      {t.storyline.lastSeenLabel}
                    </dt>
                    <dd className="mt-1 font-mono-tabular text-[12.5px] font-semibold text-[var(--ws-ink)]">
                      {projection.lastAvailableAppearance}
                    </dd>
                  </div>
                  <div>
                    <dt className="ws-kicker text-[var(--ws-ink-faint)]">
                      {t.storyline.lastMaterialUpdateLabel}
                    </dt>
                    <dd className="mt-1 font-mono-tabular text-[12.5px] font-semibold text-[var(--ws-world)]">
                      {projection.lastMaterialUpdate}
                    </dd>
                  </div>
                  <div>
                    <dt className="ws-kicker text-[var(--ws-ink-faint)]">
                      {t.storyline.appearancesLabel}
                    </dt>
                    <dd className="mt-1 font-mono-tabular text-[12.5px] font-semibold text-[var(--ws-ink)]">
                      {projection.appearanceCount} / {projection.coverage.loadedEditionCount}
                    </dd>
                  </div>
                  <div>
                    <dt className="ws-kicker text-[var(--ws-ink-faint)]">
                      {t.storyline.lifecycleLabel}
                    </dt>
                    <dd className="mt-1 text-[12.5px] font-semibold text-[var(--ws-ink)]">
                      {t.signalStatus[projection.lifecycleStatus]}
                      {projection.schemaV2Lifecycle &&
                        t.signalLifecycle[projection.schemaV2Lifecycle.lifecycle] !==
                          t.signalStatus[projection.lifecycleStatus] && (
                          <span className="ml-1.5 ws-meta text-[11.5px] font-normal text-[var(--ws-ink-muted)]">
                            ({t.signalLifecycle[projection.schemaV2Lifecycle.lifecycle]})
                          </span>
                        )}
                    </dd>
                  </div>
                  <div>
                    <dt className="ws-kicker text-[var(--ws-ink-faint)]">
                      {t.storyline.coverageLabel}
                    </dt>
                    <dd
                      data-testid="storyline-coverage-status"
                      className={`mt-1 ws-meta text-[12px] font-semibold ${
                        projection.coverage.isArchiveCoverageComplete
                          ? 'text-[var(--ws-economy)]'
                          : 'text-[var(--ws-warn)]'
                      }`}
                    >
                      {projection.coverage.isArchiveCoverageComplete
                        ? t.storyline.coverageComplete(
                            projection.coverage.loadedEditionCount
                          )
                        : t.storyline.coverageIncomplete(
                            projection.coverage.loadedEditionCount,
                            projection.coverage.totalArchiveEditionCount
                          )}
                    </dd>
                  </div>
                </dl>

                <p className="mt-3 pt-2.5 border-t border-[var(--ws-border-subtle)] text-[11.5px] leading-relaxed text-[var(--ws-ink-muted)]">
                  {t.storyline.coverageLimitedNote(
                    projection.coverage.loadedEditionCount
                  )}
                </p>
              </section>

              {/* Failed Editions Warning */}
              {failedDates.length > 0 && (
                <div className="ws-caution-panel px-4 py-3 text-[12px] text-[var(--ws-warn)]">
                  {t.storyline.failedEditionsWarning(failedDates.join(', '))}
                </div>
              )}

              {/* Explicit Omission != Resolution Safeguard */}
              {projection.coverage.absentFromLatestLoadedEdition &&
                projection.coverage.latestLoadedEdition && (
                  <div
                    data-testid="storyline-absent-warning"
                    className="ws-caution-panel px-4 py-3 space-y-1"
                  >
                    <div className="flex items-center gap-1.5 ws-kicker text-[var(--ws-warn)]">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      <span>{t.storyline.absentNotResolvedTitle}</span>
                    </div>
                    <p className="text-[12.5px] leading-relaxed text-[var(--ws-ink-secondary)]">
                      {t.storyline.absentNotResolvedBody(
                        projection.lastAvailableAppearance,
                        projection.coverage.latestLoadedEdition
                      )}
                    </p>
                  </div>
                )}

              {/* Chronological Storyline Revision Timeline */}
              <section className="space-y-3">
                <div className="space-y-1">
                  <h3 className="font-display text-[1.1rem] font-semibold text-[var(--ws-ink)]">
                    {t.storyline.revisionTimelineTitle}
                  </h3>
                  <p className="text-[12px] text-[var(--ws-ink-muted)]">
                    {t.storyline.revisionTimelineNote}
                  </p>
                </div>

                {/* Explicit Event Timeline vs Storyline Revision Timeline Distinction */}
                <div className="ws-folio-note px-3.5 py-2.5 flex items-start gap-2 text-[12px] leading-relaxed text-[var(--ws-ink-muted)]">
                  <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-[var(--ws-ink-faint)]" />
                  <span>{t.storyline.eventTimelineDistinctionNote}</span>
                </div>

                {/* Vertical Revision Spine */}
                <ol
                  data-testid="storyline-revisions-list"
                  className="border-y border-[var(--ws-border)] bg-[var(--ws-surface)] divide-y divide-[var(--ws-border-subtle)]"
                >
                  {projection.revisions.map((rev) => {
                    const isSelected =
                      selectedRevision?.editionDate === rev.editionDate;
                    return (
                      <li key={rev.editionDate}>
                        <button
                          type="button"
                          data-testid={`storyline-rev-${rev.editionDate}`}
                          onClick={() => setSelectedEditionDate(rev.editionDate)}
                          className={`relative w-full px-4 py-3 text-left transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[var(--ws-surface-elevated)]'
                              : 'hover:bg-[var(--ws-surface-hover)]/70'
                          }`}
                        >
                          {isSelected && (
                            <span
                              aria-hidden="true"
                              className="absolute inset-x-0 top-0 h-[2px] bg-[var(--ws-editorial-accent)]"
                            />
                          )}
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <span
                                aria-hidden="true"
                                className={`h-3.5 w-[2.5px] shrink-0 ${revisionMarkerColor(
                                  rev.kind
                                )}`}
                              />
                              <span className="font-mono-tabular text-[12.5px] font-semibold text-[var(--ws-ink)]">
                                {rev.editionDate}
                              </span>
                              <span
                                className={`ws-kicker ${revisionKindAccent(
                                  rev.kind
                                )}`}
                              >
                                {t.storyline.revisionKinds[rev.kind]}
                              </span>
                              {rev.kind === 'reappeared' &&
                                rev.gapDaysFromPrevious > 1 && (
                                  <span className="ws-meta text-[11.5px] text-[var(--ws-warn)]">
                                    ({t.storyline.reappearedAfterGap(rev.gapDaysFromPrevious)})
                                  </span>
                                )}
                            </div>
                            <span className="ws-meta text-[11.5px] text-[var(--ws-ink-muted)]">
                              {t.metaLine.importance(rev.signal.importance)} ·{' '}
                              <span
                                className={confidenceColorClass(
                                  rev.signal.confidence.overall
                                )}
                              >
                                {t.confidence[rev.signal.confidence.overall]}
                              </span>{' '}
                              · {t.signalStatus[rev.signal.status]}
                            </span>
                          </div>

                          <div className="mt-1 text-[13px] font-medium text-[var(--ws-ink)] break-words">
                            {rev.signal.headline}
                          </div>

                          {rev.diff.reasons.length > 0 && rev.kind !== 'first_seen' && (
                            <div className="mt-1 ws-meta text-[11.5px] text-[var(--ws-ink-muted)]">
                              {t.dailyDelta.updatedReasonsPrefix}:{' '}
                              {rev.diff.reasons
                                .map((r) => t.dailyDelta.reasons[r])
                                .join(' · ')}
                            </div>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </section>

              {/* Selected Revision Detail Inspector */}
              {selectedRevision && (
                <section
                  data-testid="storyline-revision-inspector"
                  className="border border-[var(--ws-border-strong)] bg-[var(--ws-surface)] p-4 sm:p-5 space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--ws-border)] pb-3">
                    <div className="space-y-0.5">
                      <h4 className="font-display text-[1.05rem] font-semibold text-[var(--ws-ink)]">
                        {t.storyline.inspectRevisionTitle(
                          selectedRevision.editionDate
                        )}
                      </h4>
                      <div className="ws-meta text-[11.5px] text-[var(--ws-ink-muted)]">
                        {t.storyline.revisionKinds[selectedRevision.kind]} ·{' '}
                        <span className="font-mono-tabular text-[11px]">
                          Schema v{selectedRevision.schemaVersion}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      data-testid={`storyline-open-dossier-${selectedRevision.editionDate}`}
                      onClick={() => {
                        onOpenSignalInEdition(
                          selectedRevision.editionDate,
                          projection.signalId
                        );
                        onClose();
                      }}
                      className="inline-flex min-h-[34px] items-center gap-1.5 rounded-[var(--ws-radius-sm)] bg-[var(--ws-ink)] px-3 py-1.5 text-[12px] font-medium text-[var(--ws-surface)] hover:opacity-90 cursor-pointer"
                    >
                      <span>
                        {t.storyline.openHistoricalDossier(
                          selectedRevision.editionDate
                        )}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {selectedRevision.schemaVersion === 1 && (
                    <p className="text-[11.5px] text-[var(--ws-ink-muted)]">
                      {t.storyline.schemaV1Note}
                    </p>
                  )}

                  {selectedRevision.kind === 'first_seen' ? (
                    <p className="text-[13px] leading-relaxed text-[var(--ws-ink-secondary)]">
                      {t.storyline.firstObservedNote}{' '}
                      <span className="ws-meta text-[12px] text-[var(--ws-ink-muted)]">
                        ({t.metaLine.claims(selectedRevision.signal.claims.length)} ·{' '}
                        {t.metaLine.origins(
                          selectedRevision.signal.independentOriginCount
                        )}
                        )
                      </span>
                    </p>
                  ) : selectedRevision.kind === 'unchanged' ? (
                    <p className="text-[13px] leading-relaxed text-[var(--ws-ink-muted)]">
                      {t.storyline.noMaterialDiffNote}
                    </p>
                  ) : (
                    <RevisionDiffDetails
                      revision={selectedRevision}
                      lang={lang}
                    />
                  )}
                </section>
              )}

              {/* Same-Day Revision Boundary Disclosure */}
              <div className="ws-folio-note px-4 py-3 space-y-1">
                <div className="ws-kicker text-[var(--ws-ink-muted)]">
                  {t.storyline.sameDayLimitationTitle}
                </div>
                <p className="text-[12px] leading-relaxed text-[var(--ws-ink-muted)]">
                  {t.storyline.sameDayLimitationBody}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const RevisionDiffDetails: React.FC<{
  revision: StorylineRevisionDetail;
  lang: UiLanguage;
}> = ({ revision, lang }) => {
  const t = getUiStrings(lang);
  const { diff, previousSignal, signal } = revision;

  const prevClaimsById = new Map(
    (previousSignal?.claims ?? []).map((c) => [c.claim_id, c])
  );
  const currClaimsById = new Map(signal.claims.map((c) => [c.claim_id, c]));

  const prevSourcesByKey = new Map(
    (previousSignal?.sources ?? []).map((s) => [
      (s.url || s.source_id).trim().toLowerCase(),
      s,
    ])
  );
  const currSourcesByKey = new Map(
    signal.sources.map((s) => [(s.url || s.source_id).trim().toLowerCase(), s])
  );

  return (
    <div className="space-y-3.5 text-[12.5px]">
      {/* Field-level transitions */}
      {previousSignal && (
        <ul className="space-y-1.5 text-[var(--ws-ink-secondary)]">
          {previousSignal.headline !== signal.headline && (
            <li className="italic text-[var(--ws-ink-muted)]">
              {t.dailyDelta.headlineChangedNote(previousSignal.headline)}
            </li>
          )}
          {previousSignal.importance !== signal.importance && (
            <li className="ws-meta font-semibold text-[var(--ws-ink)]">
              {t.dailyDelta.transitionImportance(
                previousSignal.importance,
                signal.importance
              )}
            </li>
          )}
          {previousSignal.status !== signal.status && (
            <li className="ws-meta font-semibold text-[var(--ws-ink)]">
              {t.dailyDelta.transitionStatus(
                t.signalStatus[previousSignal.status],
                t.signalStatus[signal.status]
              )}
            </li>
          )}
          {previousSignal.confidence.overall !== signal.confidence.overall && (
            <li className="ws-meta font-semibold text-[var(--ws-ink)]">
              {t.dailyDelta.transitionConfidence(
                t.confidence[previousSignal.confidence.overall],
                t.confidence[signal.confidence.overall]
              )}
            </li>
          )}
          {diff.reasons.includes('topic') && (
            <li>
              {t.storyline.topicChangedNote(previousSignal.topic, signal.topic)}
            </li>
          )}
          {diff.reasons.includes('event') && (
            <li>{t.storyline.eventMetaChangedNote}</li>
          )}
          {diff.reasons.includes('relationships') && (
            <li>
              {t.storyline.relationshipsChangedNote(
                previousSignal.relationships.length ||
                  previousSignal.related_signal_ids.length,
                signal.relationships.length || signal.related_signal_ids.length
              )}
            </li>
          )}
          {diff.reasons.includes('narrative') && (
            <li className="text-[var(--ws-ink-muted)]">
              {t.storyline.narrativeChangedNote}
            </li>
          )}
        </ul>
      )}

      {/* Claim Diffs */}
      {(diff.addedClaimIds.length > 0 ||
        diff.revisedClaimIds.length > 0 ||
        diff.withdrawnClaimIds.length > 0) && (
        <div className="space-y-2.5 border-t border-[var(--ws-border-subtle)] pt-3">
          {diff.addedClaimIds.length > 0 && (
            <div className="space-y-1">
              <div className="ws-kicker text-[var(--ws-economy)]">
                {t.dailyDelta.addedClaimsLabel} ({diff.addedClaimIds.length})
              </div>
              <ul className="space-y-1">
                {diff.addedClaimIds.map((id) => (
                  <li key={id} className="text-[12px]">
                    <span className="font-mono-tabular font-semibold text-[var(--ws-ink)]">
                      {id}
                    </span>
                    {currClaimsById.get(id) && (
                      <span className="ml-1.5 text-[var(--ws-ink-secondary)]">
                        — {currClaimsById.get(id)!.statement}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {diff.revisedClaimIds.length > 0 && (
            <div className="space-y-1">
              <div className="ws-kicker text-[var(--ws-world)]">
                {t.dailyDelta.revisedClaimsLabel} ({diff.revisedClaimIds.length})
              </div>
              <ul className="space-y-1">
                {diff.revisedClaimIds.map((id) => (
                  <li key={id} className="text-[12px]">
                    <span className="font-mono-tabular font-semibold text-[var(--ws-ink)]">
                      {id}
                    </span>
                    {currClaimsById.get(id) && (
                      <span className="ml-1.5 text-[var(--ws-ink-secondary)]">
                        — {currClaimsById.get(id)!.statement}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {diff.withdrawnClaimIds.length > 0 && (
            <div className="space-y-1">
              <div className="ws-kicker text-[var(--ws-warn)]">
                {t.dailyDelta.withdrawnClaimsLabel} ({diff.withdrawnClaimIds.length})
              </div>
              <ul className="space-y-1">
                {diff.withdrawnClaimIds.map((id) => (
                  <li key={id} className="text-[12px]">
                    <span className="font-mono-tabular font-semibold text-[var(--ws-ink)]">
                      {id}
                    </span>
                    {prevClaimsById.get(id) && (
                      <span className="ml-1.5 text-[var(--ws-ink-muted)]">
                        — {prevClaimsById.get(id)!.statement}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Source Diffs */}
      {(diff.addedSourceUrls.length > 0 ||
        diff.revisedSourceUrls.length > 0 ||
        diff.removedSourceUrls.length > 0) && (
        <div className="space-y-2.5 border-t border-[var(--ws-border-subtle)] pt-3">
          {(
            [
              {
                label: t.dailyDelta.addedSourcesLabel,
                keys: diff.addedSourceUrls,
                map: currSourcesByKey,
                color: 'text-[var(--ws-economy)]',
              },
              {
                label: t.dailyDelta.revisedSourcesLabel,
                keys: diff.revisedSourceUrls,
                map: currSourcesByKey,
                color: 'text-[var(--ws-world)]',
              },
              {
                label: t.dailyDelta.removedSourcesLabel,
                keys: diff.removedSourceUrls,
                map: prevSourcesByKey,
                color: 'text-[var(--ws-warn)]',
              },
            ] as const
          ).map(
            (group) =>
              group.keys.length > 0 && (
                <div key={group.label} className="space-y-1">
                  <div className={`ws-kicker ${group.color}`}>
                    {group.label} ({group.keys.length})
                  </div>
                  <ul className="space-y-1.5">
                    {group.keys.map((key) => {
                      const src = group.map.get(key.trim().toLowerCase());
                      return (
                        <li key={key} className="text-[12px]">
                          {src ? (
                            <div className="space-y-0.5">
                              <div>
                                <span className="font-semibold text-[var(--ws-ink)]">
                                  {src.outlet}
                                </span>{' '}
                                <span className="text-[var(--ws-ink-secondary)]">
                                  {src.title}
                                </span>
                              </div>
                              {src.urlSafe && src.url && (
                                <a
                                  href={src.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 font-mono-tabular text-[10.5px] text-[var(--ws-world)] hover:underline break-all"
                                >
                                  <span>{src.url}</span>
                                  <ExternalLink className="h-3 w-3 shrink-0" />
                                </a>
                              )}
                            </div>
                          ) : (
                            <span className="font-mono-tabular text-[11px] text-[var(--ws-ink-muted)] break-all">
                              {key}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )
          )}
        </div>
      )}
    </div>
  );
};
