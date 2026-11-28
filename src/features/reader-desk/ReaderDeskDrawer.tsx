import React, { useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Eye,
  GitBranch,
  HardDrive,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from 'lucide-react';
import type { ParsedEdition, UiLanguage } from '../../types/edition';
import { getUiStrings } from '../../lib/i18n/uiStrings';
import {
  confidenceColorClass,
  domainAccentTextClass,
  extractUniqueTopics,
} from '../../lib/filtering/filterSignals';
import { formatCompactTimestamp } from '../../lib/dates/formatDates';
import type {
  FollowedSignalStatus,
  ReaderState,
  ReaderStorageWarning,
} from '../../lib/intelligence/reader-state/readerState';
import type { CatchUpState } from '../../lib/intelligence/catch-up/catchUpEngine';
import type { EditionSignalChange } from '../../lib/intelligence/edition-diff/compareEditions';
import { useAccessibleModal } from '../../hooks/useAccessibleModal';

export type ReaderDeskTab = 'catchUp' | 'followed' | 'saved' | 'topics';

interface ReaderDeskDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ReaderDeskTab;
  onChangeTab: (tab: ReaderDeskTab) => void;
  lang: UiLanguage;
  currentEdition: ParsedEdition | null;
  readerState: ReaderState;
  storageWarning: ReaderStorageWarning | null;
  onDismissStorageWarning: () => void;
  followedStatuses: FollowedSignalStatus[];
  isLoadingFollowedHistory: boolean;
  catchUp: CatchUpState | null;
  onMarkAsReviewed: (edition: ParsedEdition) => void;
  onUnsaveSignal: (signalId: string) => void;
  onUnfollowSignal: (signalId: string) => void;
  onAddTopic: (topic: string) => void;
  onRemoveTopic: (topic: string) => void;
  onClearAllData: () => void;
  onOpenSignalInEdition: (editionDate: string, signalId: string) => void;
  onOpenStoryline: (signalId: string) => void;
  onFilterByTopic: (topic: string) => void;
}

const TABS: readonly ReaderDeskTab[] = ['catchUp', 'followed', 'saved', 'topics'];

export const ReaderDeskDrawer: React.FC<ReaderDeskDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  onChangeTab,
  lang,
  currentEdition,
  readerState,
  storageWarning,
  onDismissStorageWarning,
  followedStatuses,
  isLoadingFollowedHistory,
  catchUp,
  onMarkAsReviewed,
  onUnsaveSignal,
  onUnfollowSignal,
  onAddTopic,
  onRemoveTopic,
  onClearAllData,
  onOpenSignalInEdition,
  onOpenStoryline,
  onFilterByTopic,
}) => {
  const t = getUiStrings(lang);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const titleId = React.useId();

  const [confirmClear, setConfirmClear] = useState(false);
  const [selectedTopicToAdd, setSelectedTopicToAdd] = useState('');

  useAccessibleModal(isOpen, onClose, panelRef);

  const availableTopics = useMemo(() => {
    if (!currentEdition) return [];
    const existingLower = new Set(
      readerState.followedTopics.map((item) => item.toLowerCase())
    );
    return extractUniqueTopics(currentEdition.signals).filter(
      (topic) => !existingLower.has(topic.toLowerCase())
    );
  }, [currentEdition, readerState.followedTopics]);

  const topicCountsInEdition = useMemo(() => {
    const counts = new Map<string, number>();
    if (!currentEdition) return counts;
    for (const sig of currentEdition.signals) {
      const key = sig.topic.trim().toLowerCase();
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
  }, [currentEdition]);

  if (!isOpen) return null;

  const openAndClose = (editionDate: string, signalId: string) => {
    onOpenSignalInEdition(editionDate, signalId);
    onClose();
  };

  const tabCount = (tab: ReaderDeskTab): number | null => {
    if (tab === 'followed') return readerState.followedSignals.length;
    if (tab === 'saved') return readerState.savedSignals.length;
    if (tab === 'topics') return readerState.followedTopics.length;
    if (tab === 'catchUp' && catchUp?.status === 'changes_available') {
      return (
        catchUp.newSignals.length +
        catchUp.updatedSignals.length +
        catchUp.reappearedSignals.length
      );
    }
    return null;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#141311]/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      data-testid="reader-desk-drawer"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="flex h-full w-full max-w-[580px] flex-col border-l border-[var(--ws-border-strong)] bg-[var(--ws-canvas)] shadow-[var(--ws-shadow-lg)]"
      >
        {/* Header */}
        <div className="ws-drawer-masthead px-5 py-4.5 sm:px-6 space-y-2.5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5 min-w-0">
              <div className="ws-kicker text-[var(--ws-editorial-accent)]">
                {lang === 'zh-CN'
                  ? 'WORLD SIGNAL · 读者工作台'
                  : 'WORLD SIGNAL · READER FOLIO'}
              </div>
              <h2
                id={titleId}
                className="font-display text-[1.32rem] sm:text-[1.45rem] font-semibold tracking-[-0.018em] text-[var(--ws-ink)]"
              >
                {t.readerDesk.dialogTitle}
              </h2>
              <p className="text-[12.5px] text-[var(--ws-ink-muted)]">
                {t.readerDesk.dialogSubtitle}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t.readerDesk.close}
              data-testid="reader-desk-close"
              className="rounded-[var(--ws-radius-sm)] p-1.5 text-[var(--ws-ink-muted)] hover:bg-[var(--ws-surface-subtle)] hover:text-[var(--ws-ink)] transition-colors cursor-pointer shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Explicit Device-Storage Privacy Disclosure */}
          <div
            data-testid="reader-desk-local-notice"
            className="flex items-center gap-2 ws-meta text-[11.5px] text-[var(--ws-ink-muted)]"
          >
            <HardDrive className="h-3.5 w-3.5 shrink-0 text-[var(--ws-ink-faint)]" />
            <span>{t.readerDesk.localStorageNotice}</span>
          </div>
        </div>

        {/* Hairline Tab Strip */}
        <div
          role="tablist"
          aria-label={t.readerDesk.dialogTitle}
          className="grid grid-cols-4 border-b border-[var(--ws-border)] bg-[var(--ws-surface-elevated)]"
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            const count = tabCount(tab);
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={isActive}
                data-testid={`desk-tab-${tab}`}
                onClick={() => onChangeTab(tab)}
                className={`relative min-h-[42px] px-2 py-2.5 text-[12px] transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[var(--ws-canvas)] font-semibold text-[var(--ws-ink)]'
                    : 'text-[var(--ws-ink-muted)] font-medium hover:text-[var(--ws-ink)]'
                }`}
              >
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-[2.5px] bg-[var(--ws-editorial-accent)]"
                  />
                )}
                <span>{t.readerDesk.tabs[tab]}</span>
                {count !== null && count > 0 && (
                  <span className="ml-1 font-mono-tabular text-[10.5px] text-[var(--ws-ink-muted)]">
                    ({count})
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto ws-scroll px-5 py-5 space-y-5">
          {/* Storage Warning Banner (corrupt recovery, unavailable, quota, migration) */}
          {storageWarning && (
            <div
              data-testid="reader-desk-storage-warning"
              className="ws-caution-panel px-4 py-3 flex items-start justify-between gap-3 text-[12px]"
            >
              <div className="space-y-0.5">
                <div className="ws-kicker text-[var(--ws-warn)]">
                  {t.readerDesk.storageWarningPrefix}
                </div>
                <p className="text-[var(--ws-ink-secondary)]">
                  {t.readerDesk.storageWarnings[storageWarning]}
                </p>
              </div>
              <button
                type="button"
                onClick={onDismissStorageWarning}
                aria-label={t.readerDesk.close}
                className="p-1 text-[var(--ws-ink-muted)] hover:text-[var(--ws-ink)] cursor-pointer shrink-0"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* TAB 1: SINCE YOUR LAST VISIT (CATCH-UP) */}
          {activeTab === 'catchUp' && (
            <div data-testid="desk-panel-catchUp" className="space-y-5">
              {/* Explicit Checkpoint Action Bar */}
              {currentEdition && !currentEdition.isLocalPreview && (
                <div className="border-y border-[var(--ws-border-strong)] bg-[var(--ws-surface)] p-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="ws-kicker text-[var(--ws-ink-faint)]">
                      {t.catchUp.eyebrow}
                    </div>
                    <div className="ws-meta text-[12px] text-[var(--ws-ink)]">
                      {readerState.lastReviewedEditionDate
                        ? t.catchUp.reviewedCheckpointLabel(
                            readerState.lastReviewedEditionDate
                          )
                        : t.catchUp.firstVisitTitle}
                    </div>
                  </div>
                  <button
                    type="button"
                    data-testid="desk-mark-reviewed-btn"
                    onClick={() => onMarkAsReviewed(currentEdition)}
                    className="inline-flex min-h-[34px] items-center gap-1.5 rounded-[var(--ws-radius-sm)] bg-[var(--ws-ink)] px-3 py-1.5 text-[12px] font-medium text-[var(--ws-surface)] hover:opacity-90 cursor-pointer shrink-0"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{t.catchUp.markAsReviewed}</span>
                  </button>
                </div>
              )}

              {!catchUp ? (
                <p className="text-[13px] text-[var(--ws-ink-muted)]">
                  {t.dailyDelta.unavailableLocalPreview}
                </p>
              ) : catchUp.status === 'first_visit' ? (
                <div className="ws-folio-panel p-5 space-y-2">
                  <h3 className="font-display text-base font-semibold text-[var(--ws-ink)]">
                    {t.catchUp.firstVisitTitle}
                  </h3>
                  <p className="text-[13px] leading-relaxed text-[var(--ws-ink-secondary)]">
                    {t.catchUp.firstVisitBody(
                      catchUp.currentEditionDate,
                      catchUp.signalCount
                    )}
                  </p>
                </div>
              ) : catchUp.status === 'baseline_unavailable' ? (
                <div className="ws-caution-panel p-4 space-y-1.5">
                  <div className="ws-kicker text-[var(--ws-warn)]">
                    {t.catchUp.baselineUnavailableTitle}
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
              ) : catchUp.status === 'up_to_date' ? (
                <div className="ws-folio-panel p-5 space-y-1.5">
                  <div className="flex items-center gap-2 text-[var(--ws-economy)]">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <h3 className="font-display text-base font-semibold text-[var(--ws-ink)]">
                      {t.catchUp.upToDateTitle}
                    </h3>
                  </div>
                  <p className="text-[13px] leading-relaxed text-[var(--ws-ink-secondary)]">
                    {t.catchUp.upToDateBody(catchUp.baselineEditionDate)}
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-[1.1rem] font-semibold text-[var(--ws-ink)]">
                        {t.catchUp.changesHeadline(
                          catchUp.baselineEditionDate,
                          catchUp.currentEditionDate
                        )}
                      </h3>
                      {catchUp.isSameDayRevision && (
                        <span className="ws-kicker text-[var(--ws-world)]">
                          · {t.catchUp.sameDayRevisionBadge}
                        </span>
                      )}
                    </div>
                    {catchUp.usedLocalSnapshot && (
                      <p className="text-[12px] text-[var(--ws-ink-muted)]">
                        {t.catchUp.usedLocalSnapshotNote}
                      </p>
                    )}
                  </div>

                  {/* Personal Catch-Up (Followed Signals) */}
                  <section className="space-y-2.5">
                    <div className="ws-kicker text-[var(--ws-editorial-accent)]">
                      {t.catchUp.personalCatchUpTitle} ({catchUp.followedAlerts.length})
                    </div>
                    {catchUp.followedAlerts.length === 0 ? (
                      <p className="ws-folio-note px-3.5 py-2.5 text-[12.5px] text-[var(--ws-ink-muted)]">
                        {t.catchUp.personalCatchUpEmpty}
                      </p>
                    ) : (
                      <ul className="border-y border-[var(--ws-border-strong)] bg-[var(--ws-surface)] divide-y divide-[var(--ws-border-subtle)]">
                        {catchUp.followedAlerts.map((alert) => (
                          <li
                            key={`${alert.signalId}-${alert.kind}`}
                            className="p-3.5 space-y-1.5"
                          >
                            <div className="flex items-center justify-between gap-2 ws-meta text-[11.5px]">
                              <span className="ws-kicker text-[var(--ws-world)]">
                                {t.catchUp.followedAlertKinds[alert.kind]}
                              </span>
                              <span className="font-mono-tabular text-[11px] text-[var(--ws-ink-faint)]">
                                {alert.signalId}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                openAndClose(alert.targetEditionDate, alert.signalId)
                              }
                              className="text-left font-display text-[0.98rem] font-semibold text-[var(--ws-ink)] hover:text-[var(--ws-world)] hover:underline underline-offset-4 cursor-pointer"
                            >
                              {alert.headline}
                            </button>
                            {alert.kind === 'omitted' && (
                              <p className="text-[11.5px] text-[var(--ws-warn)]">
                                {t.readerDesk.followedAbsentLatestNote}
                              </p>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>

                  {/* General Catch-Up Groups */}
                  <section className="space-y-4">
                    <div className="ws-kicker text-[var(--ws-ink-muted)]">
                      {t.catchUp.generalCatchUpTitle}
                    </div>

                    <CatchUpChangeGroup
                      title={t.catchUp.groupNew}
                      items={catchUp.newSignals}
                      editionDate={catchUp.currentEditionDate}
                      accentClass="text-[var(--ws-economy)]"
                      lang={lang}
                      onOpen={openAndClose}
                    />
                    <CatchUpChangeGroup
                      title={t.catchUp.groupUpdated}
                      items={catchUp.updatedSignals}
                      editionDate={catchUp.currentEditionDate}
                      accentClass="text-[var(--ws-world)]"
                      lang={lang}
                      onOpen={openAndClose}
                    />
                    <CatchUpChangeGroup
                      title={t.catchUp.groupReappeared}
                      items={catchUp.reappearedSignals}
                      editionDate={catchUp.currentEditionDate}
                      accentClass="text-[var(--ws-warn)]"
                      lang={lang}
                      onOpen={openAndClose}
                    />
                    <CatchUpChangeGroup
                      title={t.catchUp.groupClaimChanges}
                      items={catchUp.claimChangeSignals}
                      editionDate={catchUp.currentEditionDate}
                      accentClass="text-[var(--ws-ink)]"
                      lang={lang}
                      onOpen={openAndClose}
                    />
                    <CatchUpChangeGroup
                      title={t.catchUp.groupSourceChanges}
                      items={catchUp.sourceChangeSignals}
                      editionDate={catchUp.currentEditionDate}
                      accentClass="text-[var(--ws-ink)]"
                      lang={lang}
                      onOpen={openAndClose}
                    />
                    {catchUp.omittedSignals.length > 0 && (
                      <div className="space-y-2">
                        <div className="ws-caution-panel px-3.5 py-2 text-[11.5px] text-[var(--ws-ink-secondary)]">
                          <span className="font-semibold text-[var(--ws-warn)]">
                            {t.dailyDelta.omittedNoticeTitle}:{' '}
                          </span>
                          {t.dailyDelta.omittedNoticeBody(
                            catchUp.baselineEditionDate,
                            catchUp.currentEditionDate
                          )}
                        </div>
                        <CatchUpChangeGroup
                          title={t.catchUp.groupOmitted}
                          items={catchUp.omittedSignals}
                          editionDate={catchUp.baselineEditionDate}
                          accentClass="text-[var(--ws-warn)]"
                          lang={lang}
                          onOpen={openAndClose}
                        />
                      </div>
                    )}
                  </section>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: FOLLOWED SIGNALS */}
          {activeTab === 'followed' && (
            <div data-testid="desk-panel-followed" className="space-y-4">
              {isLoadingFollowedHistory && (
                <div className="flex items-center gap-2 ws-meta text-[12px] text-[var(--ws-ink-muted)]">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-[var(--ws-world)]" />
                  <span>{t.readerDesk.followedLoading}</span>
                </div>
              )}

              {followedStatuses.length === 0 ? (
                <div className="ws-folio-panel p-6 text-center space-y-2">
                  <Eye className="h-5 w-5 mx-auto text-[var(--ws-ink-faint)]" />
                  <h3 className="font-display text-base font-semibold text-[var(--ws-ink)]">
                    {t.readerDesk.followedEmptyTitle}
                  </h3>
                  <p className="text-[13px] text-[var(--ws-ink-muted)]">
                    {t.readerDesk.followedEmptyBody}
                  </p>
                </div>
              ) : (
                <ul className="border-y border-[var(--ws-border-strong)] bg-[var(--ws-surface)] divide-y divide-[var(--ws-border-subtle)]">
                  {followedStatuses.map((item) => {
                    const targetDate =
                      item.latestAvailableEdition ||
                      item.entry.lastKnownEditionDate ||
                      currentEdition?.frontmatter.edition_date ||
                      '';
                    return (
                      <li
                        key={item.entry.signalId}
                        data-testid={`desk-followed-${item.entry.signalId}`}
                        className="p-4 space-y-2"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 ws-meta text-[11.5px] text-[var(--ws-ink-muted)]">
                          <div className="flex flex-wrap items-center gap-x-2">
                            <span
                              className={`ws-kicker ${domainAccentTextClass(
                                item.domain
                              )}`}
                            >
                              {t.domains[item.domain]}
                            </span>
                            {item.importance !== null && (
                              <>
                                <span>·</span>
                                <span className="font-semibold text-[var(--ws-ink)]">
                                  {t.metaLine.importance(item.importance)}
                                </span>
                              </>
                            )}
                            {item.confidence !== null && (
                              <>
                                <span>·</span>
                                <span className={confidenceColorClass(item.confidence)}>
                                  {t.confidence[item.confidence]}
                                </span>
                              </>
                            )}
                          </div>
                          <span className="font-mono-tabular text-[10.5px] text-[var(--ws-ink-faint)] break-all">
                            {item.entry.signalId}
                          </span>
                        </div>

                        <h3 className="font-display text-[1rem] font-semibold leading-snug text-[var(--ws-ink)]">
                          <button
                            type="button"
                            disabled={!targetDate}
                            onClick={() =>
                              targetDate &&
                              openAndClose(targetDate, item.entry.signalId)
                            }
                            className="text-left hover:text-[var(--ws-world)] hover:underline underline-offset-4 cursor-pointer disabled:cursor-default"
                          >
                            {item.currentHeadline}
                          </button>
                        </h3>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 ws-meta text-[11.5px] text-[var(--ws-ink-muted)]">
                          <span>
                            {t.readerDesk.followedLatestAppearance}:{' '}
                            <strong className="font-mono-tabular text-[11px] text-[var(--ws-ink)]">
                              {item.latestAvailableEdition ?? '—'}
                            </strong>
                          </span>
                          {item.lastMaterialUpdateEdition && (
                            <span>
                              {t.readerDesk.followedLastMaterialUpdate}:{' '}
                              <strong className="font-mono-tabular text-[11px] text-[var(--ws-world)]">
                                {item.lastMaterialUpdateEdition}
                              </strong>
                            </span>
                          )}
                          <span>
                            {t.readerDesk.followedVersionsCount(item.appearanceCount)}
                          </span>
                        </div>

                        {item.latestRevisionKind !== 'missing' &&
                          item.latestChangeReasons.length > 0 && (
                            <div className="ws-meta text-[11.5px] text-[var(--ws-world)]">
                              {t.storyline.revisionKinds[item.latestRevisionKind]} ·{' '}
                              {item.latestChangeReasons
                                .map((r) => t.dailyDelta.reasons[r])
                                .join(', ')}
                            </div>
                          )}

                        {item.latestRevisionKind === 'missing' ? (
                          <p className="text-[12px] text-[var(--ws-warn)]">
                            {t.readerDesk.followedMissingArchiveNote}
                          </p>
                        ) : !item.presentInLatestEdition ? (
                          <p className="flex items-start gap-1.5 text-[12px] text-[var(--ws-warn)]">
                            <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                            <span>{t.readerDesk.followedAbsentLatestNote}</span>
                          </p>
                        ) : null}

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                          <div className="flex items-center gap-3">
                            {targetDate && (
                              <button
                                type="button"
                                onClick={() =>
                                  openAndClose(targetDate, item.entry.signalId)
                                }
                                className="inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--ws-ink)] hover:text-[var(--ws-world)] cursor-pointer"
                              >
                                <span>
                                  {t.readerDesk.openSavedSignal(targetDate)}
                                </span>
                                <ArrowRight className="h-3 w-3" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                onOpenStoryline(item.entry.signalId);
                              }}
                              className="inline-flex items-center gap-1 ws-meta text-[11.5px] font-medium text-[var(--ws-world)] hover:underline underline-offset-4 cursor-pointer"
                            >
                              <GitBranch className="h-3 w-3" />
                              <span>{t.globalSearch.openStoryline}</span>
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => onUnfollowSignal(item.entry.signalId)}
                            className="text-[11.5px] font-medium text-[var(--ws-ink-muted)] hover:text-[var(--ws-error)] cursor-pointer"
                          >
                            {t.readerDesk.unfollowAction}
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

          {/* TAB 3: SAVED FOR LATER */}
          {activeTab === 'saved' && (
            <div data-testid="desk-panel-saved" className="space-y-4">
              {readerState.savedSignals.length === 0 ? (
                <div className="ws-folio-panel p-6 text-center space-y-2">
                  <Bookmark className="h-5 w-5 mx-auto text-[var(--ws-ink-faint)]" />
                  <h3 className="font-display text-base font-semibold text-[var(--ws-ink)]">
                    {t.readerDesk.savedEmptyTitle}
                  </h3>
                  <p className="text-[13px] text-[var(--ws-ink-muted)]">
                    {t.readerDesk.savedEmptyBody}
                  </p>
                </div>
              ) : (
                <ul className="border-y border-[var(--ws-border-strong)] bg-[var(--ws-surface)] divide-y divide-[var(--ws-border-subtle)]">
                  {readerState.savedSignals.map((entry) => {
                    const targetDate =
                      entry.editionDate ||
                      currentEdition?.frontmatter.edition_date ||
                      '';
                    return (
                      <li
                        key={entry.signalId}
                        data-testid={`desk-saved-${entry.signalId}`}
                        className="p-4 space-y-2"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 ws-meta text-[11.5px] text-[var(--ws-ink-muted)]">
                          <span
                            className={`ws-kicker ${domainAccentTextClass(
                              entry.domain
                            )}`}
                          >
                            {t.domains[entry.domain]}
                          </span>
                          <span className="font-mono-tabular text-[10.5px] text-[var(--ws-ink-faint)] break-all">
                            {entry.signalId}
                          </span>
                        </div>

                        <h3 className="font-display text-[1rem] font-semibold leading-snug text-[var(--ws-ink)]">
                          <button
                            type="button"
                            disabled={!targetDate}
                            onClick={() =>
                              targetDate &&
                              openAndClose(targetDate, entry.signalId)
                            }
                            className="text-left hover:text-[var(--ws-world)] hover:underline underline-offset-4 cursor-pointer"
                          >
                            {entry.headlineSnapshot}
                          </button>
                        </h3>

                        <div className="ws-meta text-[11.5px] text-[var(--ws-ink-muted)]">
                          {t.readerDesk.savedOnLabel(
                            formatCompactTimestamp(entry.savedAt, lang)
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1">
                          {targetDate ? (
                            <button
                              type="button"
                              onClick={() =>
                                openAndClose(targetDate, entry.signalId)
                              }
                              className="inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--ws-ink)] hover:text-[var(--ws-world)] cursor-pointer"
                            >
                              <span>
                                {t.readerDesk.openSavedSignal(targetDate)}
                              </span>
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          ) : (
                            <span />
                          )}
                          <button
                            type="button"
                            onClick={() => onUnsaveSignal(entry.signalId)}
                            className="text-[11.5px] font-medium text-[var(--ws-ink-muted)] hover:text-[var(--ws-error)] cursor-pointer"
                          >
                            {t.readerDesk.unsaveAction}
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

          {/* TAB 4: FOLLOWED TOPICS */}
          {activeTab === 'topics' && (
            <div data-testid="desk-panel-topics" className="space-y-4">
              {availableTopics.length > 0 && (
                <div className="flex items-end gap-2">
                  <label className="flex-1 space-y-1 text-[12px]">
                    <span className="block ws-kicker text-[var(--ws-ink-faint)]">
                      {t.readerDesk.topicsAddLabel}
                    </span>
                    <select
                      value={selectedTopicToAdd}
                      onChange={(e) => setSelectedTopicToAdd(e.target.value)}
                      className="w-full min-h-[36px] rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-surface)] px-2.5 py-1.5 text-[12.5px] text-[var(--ws-ink)]"
                    >
                      <option value="">—</option>
                      {availableTopics.map((topic) => (
                        <option key={topic} value={topic}>
                          {topic}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    disabled={!selectedTopicToAdd}
                    onClick={() => {
                      if (!selectedTopicToAdd) return;
                      onAddTopic(selectedTopicToAdd);
                      setSelectedTopicToAdd('');
                    }}
                    className="inline-flex min-h-[36px] items-center gap-1.5 rounded-[var(--ws-radius-sm)] border border-[var(--ws-border-strong)] bg-[var(--ws-surface)] px-3 py-1.5 text-[12px] font-medium text-[var(--ws-ink)] hover:bg-[var(--ws-surface-hover)] disabled:opacity-40 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>{t.readerDesk.topicsAddButton}</span>
                  </button>
                </div>
              )}

              {readerState.followedTopics.length === 0 ? (
                <div className="ws-folio-panel p-6 text-center space-y-2">
                  <h3 className="font-display text-base font-semibold text-[var(--ws-ink)]">
                    {t.readerDesk.topicsEmptyTitle}
                  </h3>
                  <p className="text-[13px] text-[var(--ws-ink-muted)]">
                    {t.readerDesk.topicsEmptyBody}
                  </p>
                </div>
              ) : (
                <ul className="border-y border-[var(--ws-border-strong)] bg-[var(--ws-surface)] divide-y divide-[var(--ws-border-subtle)]">
                  {readerState.followedTopics.map((topic) => {
                    const count =
                      topicCountsInEdition.get(topic.toLowerCase()) ?? 0;
                    return (
                      <li
                        key={topic}
                        className="px-4 py-3 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => {
                              onFilterByTopic(topic);
                              onClose();
                            }}
                            className="text-left text-[13.5px] font-semibold text-[var(--ws-ink)] hover:text-[var(--ws-world)] hover:underline underline-offset-4 cursor-pointer"
                          >
                            {topic}
                          </button>
                          <div className="ws-meta text-[11.5px] text-[var(--ws-ink-muted)]">
                            {t.readerDesk.topicsCurrentMatches(count)}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveTopic(topic)}
                          className="text-[11.5px] font-medium text-[var(--ws-ink-muted)] hover:text-[var(--ws-error)] cursor-pointer shrink-0"
                        >
                          {t.readerDesk.topicsRemoveAction}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Footer: Local Data Control */}
        <div className="border-t border-[var(--ws-border)] bg-[var(--ws-surface)] px-5 py-3.5">
          {!confirmClear ? (
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono-tabular text-[11px] text-[var(--ws-ink-faint)]">
                v{readerState.version} · localStorage
              </span>
              <button
                type="button"
                data-testid="desk-clear-data-btn"
                onClick={() => setConfirmClear(true)}
                className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--ws-ink-muted)] hover:text-[var(--ws-error)] cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{t.readerDesk.clearDataButton}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-[12px] text-[var(--ws-ink-secondary)]">
                {t.readerDesk.clearDataWarning}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  data-testid="desk-clear-data-confirm"
                  onClick={() => {
                    onClearAllData();
                    setConfirmClear(false);
                  }}
                  className="inline-flex min-h-[32px] items-center gap-1.5 rounded-[var(--ws-radius-sm)] bg-[var(--ws-error)] px-3 py-1 text-[12px] font-semibold text-white hover:opacity-90 cursor-pointer"
                >
                  {t.readerDesk.clearDataConfirm}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="inline-flex min-h-[32px] items-center rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] px-3 py-1 text-[12px] font-medium text-[var(--ws-ink)] cursor-pointer"
                >
                  {t.readerDesk.clearDataCancel}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CatchUpChangeGroup: React.FC<{
  title: string;
  items: EditionSignalChange[];
  editionDate: string;
  accentClass: string;
  lang: UiLanguage;
  onOpen: (editionDate: string, signalId: string) => void;
}> = ({ title, items, editionDate, accentClass, lang, onOpen }) => {
  const t = getUiStrings(lang);
  if (items.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <div className={`ws-kicker ${accentClass}`}>
        {title} ({items.length})
      </div>
      <ul className="border-y border-[var(--ws-border)] bg-[var(--ws-surface)] divide-y divide-[var(--ws-border-subtle)]">
        {items.map((change) => {
          const sig = change.current ?? change.previous;
          if (!sig) return null;
          return (
            <li
              key={`${title}-${change.signalId}`}
              className="px-3.5 py-2.5 space-y-1"
            >
              <div className="font-mono-tabular text-[10.5px] text-[var(--ws-ink-faint)] break-all">
                {change.signalId}
              </div>
              <button
                type="button"
                onClick={() => onOpen(editionDate, change.signalId)}
                className="block text-left text-[13px] font-medium leading-snug text-[var(--ws-ink)] hover:text-[var(--ws-world)] hover:underline underline-offset-4 cursor-pointer break-words"
              >
                {sig.headline}
              </button>
              {change.diff.reasons.length > 0 && change.kind === 'updated' && (
                <div className="ws-meta text-[11.5px] text-[var(--ws-ink-muted)]">
                  {change.diff.reasons
                    .map((r) => t.dailyDelta.reasons[r])
                    .join(' · ')}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
