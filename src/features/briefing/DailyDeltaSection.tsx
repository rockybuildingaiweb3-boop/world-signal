import React from 'react';
import {
  AlertCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  History,
  Info,
  RefreshCw,
} from 'lucide-react';
import type { UiLanguage } from '../../types/edition';
import type {
  EditionChangeKind,
  EditionSignalChange,
} from '../../lib/intelligence/edition-diff/compareEditions';
import {
  getDeltaItemsForCategory,
  getDisplaySignalForChange,
  getVerifiedUpdateSummary,
  resolveClaimForDelta,
  resolveDefaultDeltaCategory,
  resolveSignalNavigationTarget,
  resolveSourceForDelta,
  type DailyDeltaState,
} from '../../lib/intelligence/daily-delta/dailyDeltaHelpers';
import {
  confidenceColorClass,
  domainAccentTextClass,
} from '../../lib/filtering/filterSignals';
import { getUiStrings } from '../../lib/i18n/uiStrings';

interface DailyDeltaSectionProps {
  state: DailyDeltaState | null;
  lang: UiLanguage;
  onOpenSignalInEdition: (editionDate: string, signalId: string) => void;
  onRetry: () => void;
}

const CATEGORIES: readonly EditionChangeKind[] = [
  'new',
  'updated',
  'unchanged',
  'omitted',
];

const INITIAL_VISIBLE_COUNT = 4;

function categoryAccentClass(kind: EditionChangeKind): string {
  switch (kind) {
    case 'new':
      return 'text-[var(--ws-economy)]';
    case 'updated':
      return 'text-[var(--ws-world)]';
    case 'unchanged':
      return 'text-[var(--ws-ink-muted)]';
    case 'omitted':
      return 'text-[var(--ws-warn)]';
  }
}

function categoryCountFromState(
  state: Extract<DailyDeltaState, { status: 'ready' }>,
  category: EditionChangeKind
): number {
  switch (category) {
    case 'new':
      return state.diff.summary.newSignals;
    case 'updated':
      return state.diff.summary.materiallyUpdatedSignals;
    case 'unchanged':
      return state.diff.summary.unchangedSignals;
    case 'omitted':
      return state.diff.summary.omittedSignals;
  }
}

export const DailyDeltaSection: React.FC<DailyDeltaSectionProps> = ({
  state,
  lang,
  onOpenSignalInEdition,
  onRetry,
}) => {
  const t = getUiStrings(lang);
  const [activeCategory, setActiveCategory] =
    React.useState<EditionChangeKind>('updated');
  const [showAllInCategory, setShowAllInCategory] = React.useState(false);
  const [expandedSignalIds, setExpandedSignalIds] = React.useState<Set<string>>(
    () => new Set()
  );

  // Reset active category and expansion state when the compared edition pair changes
  const comparisonKey =
    state?.status === 'ready'
      ? `${state.previousDate}->${state.currentDate}`
      : state?.status ?? 'none';

  React.useEffect(() => {
    if (state?.status === 'ready') {
      setActiveCategory(resolveDefaultDeltaCategory(state.diff));
    }
    setShowAllInCategory(false);
    setExpandedSignalIds(new Set());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comparisonKey]);

  const handleSelectCategory = (category: EditionChangeKind) => {
    setActiveCategory(category);
    setShowAllInCategory(false);
    setExpandedSignalIds(new Set());
  };

  const toggleEvidenceDisclosure = (signalId: string) => {
    setExpandedSignalIds((prev) => {
      const next = new Set(prev);
      if (next.has(signalId)) {
        next.delete(signalId);
      } else {
        next.add(signalId);
      }
      return next;
    });
  };

  if (!state) return null;

  // Loading preceding edition state
  if (state.status === 'loading') {
    return (
      <section
        aria-label={t.dailyDelta.eyebrow}
        data-testid="daily-delta-loading"
        className="border-b border-[var(--ws-border)] pb-6"
      >
        <div className="flex items-center gap-2.5 text-[12.5px] font-mono-tabular text-[var(--ws-ink-muted)]">
          <RefreshCw className="h-3.5 w-3.5 animate-spin shrink-0" />
          <span>{t.dailyDelta.loadingLabel(state.previousDate)}</span>
        </div>
      </section>
    );
  }

  // Explicit unavailable states (never fabricate zero counts)
  if (state.status === 'unavailable') {
    let message = t.dailyDelta.unavailableIncomplete;
    if (state.reason === 'local_preview') {
      message = t.dailyDelta.unavailableLocalPreview;
    } else if (state.reason === 'no_previous_edition') {
      message = t.dailyDelta.unavailableNoPrevious(state.currentDate);
    } else if (state.reason === 'previous_load_failed') {
      message = t.dailyDelta.unavailableLoadFailed(state.previousDate);
    }

    const isError = state.reason === 'previous_load_failed';

    return (
      <section
        aria-label={t.dailyDelta.eyebrow}
        data-testid="daily-delta-unavailable"
        data-reason={state.reason}
        className="border-b border-[var(--ws-border)] pb-7"
      >
        <div
          className={`${
            isError
              ? 'rounded-[var(--ws-radius-sm)] border border-[var(--ws-error-border)] bg-[var(--ws-error-soft)]'
              : 'ws-editorial-panel'
          } px-4 py-3.5 sm:px-5 sm:py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`}
        >
          <div className="flex items-start gap-2.5 min-w-0">
            {isError ? (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ws-error)]" />
            ) : (
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ws-ink-muted)]" />
            )}
            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono-tabular text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ws-ink-muted)]">
                <span>{t.dailyDelta.eyebrow}</span>
                <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">
                  ·
                </span>
                <span className={isError ? 'text-[var(--ws-error)]' : 'text-[var(--ws-ink-secondary)]'}>
                  {t.dailyDelta.unavailableTitle}
                </span>
              </div>
              <p className="text-[13px] leading-relaxed text-[var(--ws-ink-secondary)]">
                {message}
              </p>
              {isError && state.errorMessage && (
                <p className="font-mono-tabular text-[11.5px] text-[var(--ws-error)] break-words">
                  {state.errorMessage}
                </p>
              )}
            </div>
          </div>

          {isError && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex self-start sm:self-center min-h-[34px] items-center gap-1.5 rounded-[var(--ws-radius-sm)] border border-[var(--ws-border-strong)] bg-[var(--ws-surface)] px-3 py-1.5 font-mono-tabular text-[11.5px] font-medium text-[var(--ws-ink)] hover:bg-[var(--ws-surface-hover)] transition-colors duration-150 cursor-pointer shrink-0"
            >
              <RefreshCw className="h-3 w-3" />
              <span>{t.dailyDelta.retryComparison}</span>
            </button>
          )}
        </div>
      </section>
    );
  }

  // Ready state — deterministic comparison from compareEditions()
  const items = getDeltaItemsForCategory(state.diff, activeCategory);
  const visibleItems = showAllInCategory
    ? items
    : items.slice(0, INITIAL_VISIBLE_COUNT);
  const hasMoreItems = items.length > INITIAL_VISIBLE_COUNT;

  const hasSchemaTransition =
    state.previousSchemaVersion !== state.currentSchemaVersion;

  return (
    <section
      aria-label={t.dailyDelta.title}
      data-testid="daily-delta-section"
      className="ws-section-rule pt-7 space-y-5"
    >
      {/* Header Row */}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono-tabular text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ws-ink-muted)]">
            <History className="h-3.5 w-3.5 text-[var(--ws-ink-muted)] shrink-0" />
            <span>{t.dailyDelta.eyebrow}</span>
          </div>
          <h2 className="font-display text-[1.4rem] sm:text-[1.65rem] font-semibold tracking-[-0.018em] text-[var(--ws-ink)]">
            {t.dailyDelta.title}
          </h2>
        </div>

        <div className="flex flex-col gap-0.5 md:items-end">
          <div className="font-mono-tabular text-[12px] font-semibold text-[var(--ws-ink)]">
            {t.dailyDelta.comparingRange(state.previousDate, state.currentDate)}
          </div>
          <div className="text-[11.5px] text-[var(--ws-ink-muted)]">
            {t.dailyDelta.routineMetadataNote}
          </div>
        </div>
      </div>

      {/* Explicit Archive Gap or Schema Version Context Notes (never hidden) */}
      {(state.hasDateGap || hasSchemaTransition) && (
        <div className="space-y-1.5 text-[12px] leading-relaxed text-[var(--ws-ink-muted)] border-l-2 border-[var(--ws-border-strong)] pl-3.5">
          {state.hasDateGap && (
            <p>{t.dailyDelta.dateGapNote(state.dayGapCount, state.previousDate)}</p>
          )}
          {hasSchemaTransition && (
            <p>
              {t.dailyDelta.schemaTransitionNote(
                state.previousSchemaVersion,
                state.currentSchemaVersion
              )}
            </p>
          )}
        </div>
      )}

      {/* Editorial Intelligence Sheet Container */}
      <div className="rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-surface)] overflow-hidden shadow-[var(--ws-shadow-sm)]">
        {/* 4-Category Editorial Ledger Navigation (2x2 mobile, 4-col desktop) */}
        <div
          role="tablist"
          aria-label={t.dailyDelta.title}
          className="grid grid-cols-2 lg:grid-cols-4 border-b border-[var(--ws-border)] bg-[var(--ws-surface-elevated)]"
        >
          {CATEGORIES.map((category, idx) => {
            const isActive = activeCategory === category;
            const count = categoryCountFromState(state, category);
            const borderClasses = [
              idx % 2 === 1 ? 'border-l border-[var(--ws-border)]' : '',
              idx >= 2 ? 'border-t border-[var(--ws-border)] lg:border-t-0' : '',
              idx === 2 ? 'lg:border-l lg:border-[var(--ws-border)]' : '',
            ]
              .filter(Boolean)
              .join(' ');

            const topBarColor =
              category === 'new'
                ? 'bg-[var(--ws-economy)]'
                : category === 'updated'
                ? 'bg-[var(--ws-world)]'
                : category === 'omitted'
                ? 'bg-[var(--ws-warn)]'
                : 'bg-[var(--ws-rule-editorial)]';

            return (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={isActive}
                data-testid={`delta-tab-${category}`}
                onClick={() => handleSelectCategory(category)}
                className={`relative text-left px-3.5 py-3 sm:px-5 sm:py-4 transition-colors duration-150 cursor-pointer ${borderClasses} ${
                  isActive
                    ? 'bg-[var(--ws-surface)]'
                    : 'hover:bg-[var(--ws-surface-hover)]/75'
                }`}
              >
                {isActive && (
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-0 top-0 h-[3px] ${topBarColor}`}
                  />
                )}
                <div className="flex items-baseline justify-between gap-2">
                  <span
                    className={`font-mono-tabular text-[11px] font-semibold uppercase tracking-[0.09em] ${
                      isActive
                        ? categoryAccentClass(category)
                        : 'text-[var(--ws-ink-muted)]'
                    }`}
                  >
                    {t.dailyDelta.categories[category]}
                  </span>
                  <span
                    data-testid={`delta-count-${category}`}
                    className={`font-display text-[1.45rem] sm:text-[1.65rem] font-semibold leading-none tabular-nums ${
                      isActive ? 'text-[var(--ws-ink)]' : 'text-[var(--ws-ink-secondary)]'
                    }`}
                  >
                    {count}
                  </span>
                </div>
                <p className="mt-1.5 hidden sm:block text-[11.5px] leading-snug text-[var(--ws-ink-muted)]">
                  {t.dailyDelta.categoryDescriptions[category]}
                </p>
              </button>
            );
          })}
        </div>

        <div className="px-4 py-4 sm:px-6 sm:py-5">

      {/* Focused Category Signal List */}
      <div role="tabpanel" className="space-y-4">
        {/* Explicit Editorial Safeguard Banner for OMITTED Category */}
        {activeCategory === 'omitted' && (
          <div
            data-testid="delta-omitted-safeguard"
            className="ws-caution-panel px-4 py-3 space-y-1"
          >
            <div className="font-mono-tabular text-[11px] font-semibold uppercase tracking-[0.11em] text-[var(--ws-warn)]">
              {t.dailyDelta.omittedNoticeTitle}
            </div>
            <p className="text-[12.5px] leading-relaxed text-[var(--ws-ink-secondary)]">
              {t.dailyDelta.omittedNoticeBody(state.previousDate, state.currentDate)}
            </p>
          </div>
        )}

        {items.length === 0 ? (
          <p className="py-4 text-[13px] text-[var(--ws-ink-muted)]">
            {t.dailyDelta.emptyCategory}
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8">
              {visibleItems.map((change) => (
                <DeltaSignalRow
                  key={change.signalId}
                  change={change}
                  currentDate={state.currentDate}
                  previousDate={state.previousDate}
                  lang={lang}
                  isExpanded={expandedSignalIds.has(change.signalId)}
                  onToggleEvidence={() => toggleEvidenceDisclosure(change.signalId)}
                  onOpenSignalInEdition={onOpenSignalInEdition}
                />
              ))}
            </div>

            {hasMoreItems && (
              <div className="pt-1 flex items-center justify-between border-t border-[var(--ws-border-subtle)]">
                <button
                  type="button"
                  data-testid="delta-toggle-all"
                  onClick={() => setShowAllInCategory((prev) => !prev)}
                  className="inline-flex min-h-[36px] items-center gap-1.5 font-mono-tabular text-[12px] font-medium text-[var(--ws-world)] hover:underline underline-offset-4 cursor-pointer"
                >
                  {showAllInCategory ? (
                    <>
                      <span>{t.dailyDelta.showFewerCategory}</span>
                      <ChevronUp className="h-3.5 w-3.5" />
                    </>
                  ) : (
                    <>
                      <span>
                        {t.dailyDelta.showAllCategory(
                          items.length,
                          t.dailyDelta.categories[activeCategory]
                        )}
                      </span>
                      <ChevronDown className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
                <span className="font-mono-tabular text-[11.5px] text-[var(--ws-ink-faint)]">
                  {visibleItems.length} / {items.length}
                </span>
              </div>
            )}
          </>
        )}
      </div>
        </div>
      </div>
    </section>
  );
};

interface DeltaSignalRowProps {
  change: EditionSignalChange;
  currentDate: string;
  previousDate: string;
  lang: UiLanguage;
  isExpanded: boolean;
  onToggleEvidence: () => void;
  onOpenSignalInEdition: (editionDate: string, signalId: string) => void;
}

const DeltaSignalRow: React.FC<DeltaSignalRowProps> = ({
  change,
  currentDate,
  previousDate,
  lang,
  isExpanded,
  onToggleEvidence,
  onOpenSignalInEdition,
}) => {
  const t = getUiStrings(lang);
  const signal = getDisplaySignalForChange(change);
  if (!signal) return null;

  const navTarget = resolveSignalNavigationTarget(
    change,
    currentDate,
    previousDate
  );

  const claimChangesCount =
    change.diff.addedClaimIds.length +
    change.diff.revisedClaimIds.length +
    change.diff.withdrawnClaimIds.length;
  const sourceChangesCount =
    change.diff.addedSourceUrls.length +
    change.diff.revisedSourceUrls.length +
    change.diff.removedSourceUrls.length;
  const hasEvidenceDisclosure =
    (change.kind === 'updated' || change.kind === 'new') &&
    (claimChangesCount > 0 || sourceChangesCount > 0);

  // Build deterministic field-level transitions for UPDATED signals
  const transitions: string[] = [];
  if (change.kind === 'updated' && change.previous && change.current) {
    if (change.previous.importance !== change.current.importance) {
      transitions.push(
        t.dailyDelta.transitionImportance(
          change.previous.importance,
          change.current.importance
        )
      );
    }
    if (change.previous.status !== change.current.status) {
      transitions.push(
        t.dailyDelta.transitionStatus(
          t.signalStatus[change.previous.status],
          t.signalStatus[change.current.status]
        )
      );
    }
    if (
      change.previous.confidence.overall !== change.current.confidence.overall
    ) {
      transitions.push(
        t.dailyDelta.transitionConfidence(
          t.confidence[change.previous.confidence.overall],
          t.confidence[change.current.confidence.overall]
        )
      );
    }
  }

  const verifiedUpdateSummary = getVerifiedUpdateSummary(change, previousDate);
  const headlineChanged =
    change.kind === 'updated' &&
    change.previous &&
    change.current &&
    change.previous.headline !== change.current.headline;

  const handleOpen = () => {
    if (!navTarget) return;
    onOpenSignalInEdition(navTarget.editionDate, navTarget.signalId);
  };

  return (
    <article
      data-testid={`delta-item-${change.signalId}`}
      className="border-b border-[var(--ws-border-subtle)] py-4 flex flex-col justify-between gap-2.5 min-w-0"
    >
      <div className="space-y-2 min-w-0">
        {/* Compact Unboxed Metadata Line */}
        <div className="flex flex-wrap items-center justify-between gap-x-2.5 gap-y-1 font-mono-tabular text-[11px] text-[var(--ws-ink-muted)]">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span
              className={`font-semibold uppercase tracking-[0.08em] ${categoryAccentClass(
                change.kind
              )}`}
            >
              {t.dailyDelta.categoryBadges[change.kind]}
            </span>
            <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">
              ·
            </span>
            <span
              className={`font-semibold ${domainAccentTextClass(signal.domain)}`}
            >
              {t.domains[signal.domain]}
            </span>
            <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">
              ·
            </span>
            <span className="font-semibold text-[var(--ws-ink)]">
              {t.metaLine.importance(signal.importance)}
            </span>
            <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">
              ·
            </span>
            <span
              className={`font-medium ${confidenceColorClass(
                signal.confidence.overall
              )}`}
            >
              {t.metaLine.confidence(t.confidence[signal.confidence.overall])}
            </span>
          </div>
          <span className="text-[10.5px] text-[var(--ws-ink-faint)] break-all sm:break-normal">
            {change.signalId}
          </span>
        </div>

        {/* Signal Headline */}
        <h3 className="font-display text-[1rem] sm:text-[1.0625rem] font-semibold leading-[1.35] text-[var(--ws-ink)] headline-balance">
          <button
            type="button"
            onClick={handleOpen}
            className="text-left hover:text-[var(--ws-world)] hover:underline decoration-[var(--ws-border-strong)] underline-offset-4 transition-colors duration-150 cursor-pointer"
          >
            {signal.headline}
          </button>
        </h3>

        {/* Concise Change Explanation */}
        <div className="space-y-1.5 text-[12.5px] leading-relaxed text-[var(--ws-ink-secondary)]">
          {change.kind === 'updated' && (
            <>
              {change.diff.reasons.length > 0 && (
                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 font-mono-tabular text-[11.5px] text-[var(--ws-ink-muted)]">
                  <span className="font-semibold text-[var(--ws-ink-secondary)]">
                    {t.dailyDelta.updatedReasonsPrefix}:
                  </span>
                  <span>
                    {change.diff.reasons
                      .map((reason) => t.dailyDelta.reasons[reason])
                      .join(' · ')}
                  </span>
                </div>
              )}

              {transitions.length > 0 && (
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 font-mono-tabular text-[11.5px] font-medium text-[var(--ws-ink)]">
                  {transitions.map((item, idx) => (
                    <span key={idx}>{item}</span>
                  ))}
                </div>
              )}

              {headlineChanged && change.previous && (
                <p className="text-[12px] italic text-[var(--ws-ink-muted)]">
                  {t.dailyDelta.headlineChangedNote(change.previous.headline)}
                </p>
              )}

              {verifiedUpdateSummary && (
                <p
                  className={`text-[12.5px] leading-relaxed text-[var(--ws-ink-secondary)] ${
                    isExpanded ? '' : 'line-clamp-2'
                  }`}
                >
                  {verifiedUpdateSummary}
                </p>
              )}
            </>
          )}

          {change.kind === 'new' && (
            <p className="text-[12.5px] text-[var(--ws-ink-muted)]">
              {t.dailyDelta.newItemExplanation(
                currentDate,
                signal.claims.length,
                signal.sources.length
              )}
            </p>
          )}

          {change.kind === 'unchanged' && (
            <p className="text-[12.5px] text-[var(--ws-ink-muted)]">
              {t.dailyDelta.unchangedItemExplanation(previousDate)}
            </p>
          )}

          {change.kind === 'omitted' && (
            <p className="text-[12.5px] text-[var(--ws-warn)]">
              {t.dailyDelta.omittedItemExplanation(previousDate, currentDate)}
            </p>
          )}
        </div>

        {/* Compact Evidence Delta Summary (before expansion) */}
        {hasEvidenceDisclosure && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 font-mono-tabular text-[11px] text-[var(--ws-ink-muted)]">
            {claimChangesCount > 0 && (
              <span>
                {t.dailyDelta.evidenceSummaryClaims(
                  change.diff.addedClaimIds.length,
                  change.diff.revisedClaimIds.length,
                  change.diff.withdrawnClaimIds.length
                )}
              </span>
            )}
            {sourceChangesCount > 0 && (
              <span>
                {t.dailyDelta.evidenceSummarySources(
                  change.diff.addedSourceUrls.length,
                  change.diff.revisedSourceUrls.length,
                  change.diff.removedSourceUrls.length
                )}
              </span>
            )}
          </div>
        )}

        {/* Progressive Disclosure Panel: Claim IDs & Source URLs */}
        {hasEvidenceDisclosure && isExpanded && (
          <div
            data-testid={`delta-evidence-${change.signalId}`}
            className="mt-2 rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-surface)] p-3.5 space-y-3 text-[12px]"
          >
            <EvidenceClaimGroup
              label={t.dailyDelta.addedClaimsLabel}
              claimIds={change.diff.addedClaimIds}
              change={change}
              preferPrevious={false}
              accentClass="text-[var(--ws-economy)]"
            />
            <EvidenceClaimGroup
              label={t.dailyDelta.revisedClaimsLabel}
              claimIds={change.diff.revisedClaimIds}
              change={change}
              preferPrevious={false}
              accentClass="text-[var(--ws-world)]"
            />
            <EvidenceClaimGroup
              label={t.dailyDelta.withdrawnClaimsLabel}
              claimIds={change.diff.withdrawnClaimIds}
              change={change}
              preferPrevious
              accentClass="text-[var(--ws-warn)]"
            />
            <EvidenceSourceGroup
              label={t.dailyDelta.addedSourcesLabel}
              sourceKeys={change.diff.addedSourceUrls}
              change={change}
              preferPrevious={false}
              accentClass="text-[var(--ws-economy)]"
            />
            <EvidenceSourceGroup
              label={t.dailyDelta.revisedSourcesLabel}
              sourceKeys={change.diff.revisedSourceUrls}
              change={change}
              preferPrevious={false}
              accentClass="text-[var(--ws-world)]"
            />
            <EvidenceSourceGroup
              label={t.dailyDelta.removedSourcesLabel}
              sourceKeys={change.diff.removedSourceUrls}
              change={change}
              preferPrevious
              accentClass="text-[var(--ws-warn)]"
            />
          </div>
        )}
      </div>

      {/* Footer Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[12px]">
        <div>
          {hasEvidenceDisclosure && (
            <button
              type="button"
              data-testid={`delta-inspect-${change.signalId}`}
              onClick={onToggleEvidence}
              aria-expanded={isExpanded}
              className="inline-flex min-h-[30px] items-center gap-1 font-mono-tabular text-[11.5px] font-medium text-[var(--ws-ink-muted)] hover:text-[var(--ws-ink)] transition-colors duration-150 cursor-pointer"
            >
              <span>
                {isExpanded
                  ? t.dailyDelta.evidenceToggleHide
                  : t.dailyDelta.evidenceToggleShow}
              </span>
              {isExpanded ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>

        <button
          type="button"
          data-testid={`delta-open-${change.signalId}`}
          onClick={handleOpen}
          className="group inline-flex min-h-[30px] items-center gap-1.5 font-semibold text-[var(--ws-ink)] hover:text-[var(--ws-world)] transition-colors duration-150 cursor-pointer"
        >
          <span>
            {change.kind === 'omitted'
              ? t.dailyDelta.openPreviousDossier(previousDate)
              : t.dailyDelta.openCurrentDossier}
          </span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
        </button>
      </div>
    </article>
  );
};

interface EvidenceClaimGroupProps {
  label: string;
  claimIds: string[];
  change: EditionSignalChange;
  preferPrevious: boolean;
  accentClass: string;
}

const EvidenceClaimGroup: React.FC<EvidenceClaimGroupProps> = ({
  label,
  claimIds,
  change,
  preferPrevious,
  accentClass,
}) => {
  if (claimIds.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <div
        className={`font-mono-tabular text-[10.5px] font-semibold uppercase tracking-[0.1em] ${accentClass}`}
      >
        {label} ({claimIds.length})
      </div>
      <ul className="space-y-1.5">
        {claimIds.map((claimId) => {
          const claim = resolveClaimForDelta(change, claimId, preferPrevious);
          return (
            <li
              key={claimId}
              className="border-l border-[var(--ws-border-strong)] pl-2.5 space-y-0.5"
            >
              <div className="font-mono-tabular text-[11px] font-semibold text-[var(--ws-ink)] break-all">
                {claimId}
              </div>
              {claim && (
                <p className="text-[12px] leading-snug text-[var(--ws-ink-secondary)]">
                  {claim.statement}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

interface EvidenceSourceGroupProps {
  label: string;
  sourceKeys: string[];
  change: EditionSignalChange;
  preferPrevious: boolean;
  accentClass: string;
}

const EvidenceSourceGroup: React.FC<EvidenceSourceGroupProps> = ({
  label,
  sourceKeys,
  change,
  preferPrevious,
  accentClass,
}) => {
  if (sourceKeys.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <div
        className={`font-mono-tabular text-[10.5px] font-semibold uppercase tracking-[0.1em] ${accentClass}`}
      >
        {label} ({sourceKeys.length})
      </div>
      <ul className="space-y-1.5">
        {sourceKeys.map((sourceKey) => {
          const source = resolveSourceForDelta(change, sourceKey, preferPrevious);
          return (
            <li
              key={sourceKey}
              className="border-l border-[var(--ws-border-strong)] pl-2.5 space-y-0.5"
            >
              {source ? (
                <>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11.5px]">
                    <span className="font-semibold text-[var(--ws-ink)]">
                      {source.outlet}
                    </span>
                    <span className="text-[var(--ws-ink-secondary)] break-words">
                      {source.title}
                    </span>
                  </div>
                  {source.urlSafe && source.url ? (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-mono-tabular text-[10.5px] text-[var(--ws-world)] hover:underline break-all"
                    >
                      <span>{source.url}</span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  ) : (
                    <div className="font-mono-tabular text-[10.5px] text-[var(--ws-ink-faint)] break-all">
                      {sourceKey}
                    </div>
                  )}
                </>
              ) : (
                <div className="font-mono-tabular text-[11px] text-[var(--ws-ink-muted)] break-all">
                  {sourceKey}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
