import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeftRight,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  GitBranch,
  History,
  RefreshCw,
  X,
} from 'lucide-react';
import type { EditionIndexEntry, UiLanguage } from '../../types/edition';
import { getUiStrings } from '../../lib/i18n/uiStrings';
import {
  confidenceColorClass,
  domainAccentTextClass,
} from '../../lib/filtering/filterSignals';
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
  resolveSourceForDelta,
} from '../../lib/intelligence/daily-delta/dailyDeltaHelpers';
import type {
  ArbitraryComparisonResult,
  ComparisonValidationError,
} from '../../lib/intelligence/edition-diff/arbitraryComparison';
import { useAccessibleModal } from '../../hooks/useAccessibleModal';

interface EditionComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: UiLanguage;
  editions: EditionIndexEntry[];
  fromDate: string;
  toDate: string;
  onChangeFromDate: (date: string) => void;
  onChangeToDate: (date: string) => void;
  onSwapDates: () => void;
  validationError: ComparisonValidationError | null;
  wasReversedInput: boolean;
  result: ArbitraryComparisonResult | null;
  isLoading: boolean;
  fetchError: string | null;
  onRetry: () => void;
  onOpenSignalInEdition: (editionDate: string, signalId: string) => void;
  onOpenStoryline: (signalId: string) => void;
}

const CATEGORIES: readonly EditionChangeKind[] = [
  'new',
  'updated',
  'unchanged',
  'omitted',
];

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

export const EditionComparisonModal: React.FC<EditionComparisonModalProps> = ({
  isOpen,
  onClose,
  lang,
  editions,
  fromDate,
  toDate,
  onChangeFromDate,
  onChangeToDate,
  onSwapDates,
  validationError,
  wasReversedInput,
  result,
  isLoading,
  fetchError,
  onRetry,
  onOpenSignalInEdition,
  onOpenStoryline,
}) => {
  const t = getUiStrings(lang);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const titleId = React.useId();

  const [activeCategory, setActiveCategory] =
    useState<EditionChangeKind>('updated');
  const [expandedSignalIds, setExpandedSignalIds] = useState<Set<string>>(
    () => new Set()
  );

  useAccessibleModal(isOpen, onClose, dialogRef);

  const pairKey = result ? `${result.fromDate}->${result.toDate}` : 'none';
  useEffect(() => {
    if (result) {
      setActiveCategory(resolveDefaultDeltaCategory(result.diff));
    }
    setExpandedSignalIds(new Set());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pairKey]);

  if (!isOpen) return null;

  const sortedEditionsDesc = [...editions].sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  const toggleExpand = (signalId: string) => {
    setExpandedSignalIds((prev) => {
      const next = new Set(prev);
      if (next.has(signalId)) next.delete(signalId);
      else next.add(signalId);
      return next;
    });
  };

  const openVersion = (editionDate: string, signalId: string) => {
    onOpenSignalInEdition(editionDate, signalId);
    onClose();
  };

  const items = result
    ? getDeltaItemsForCategory(result.diff, activeCategory)
    : [];

  const categoryCount = (category: EditionChangeKind): number => {
    if (!result) return 0;
    switch (category) {
      case 'new':
        return result.diff.summary.newSignals;
      case 'updated':
        return result.diff.summary.materiallyUpdatedSignals;
      case 'unchanged':
        return result.diff.summary.unchangedSignals;
      case 'omitted':
        return result.diff.summary.omittedSignals;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-[#141311]/55 p-0 sm:p-5 md:p-8 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      data-testid="edition-compare-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="flex h-full sm:h-auto sm:max-h-[90vh] w-full max-w-[980px] flex-col border border-[var(--ws-border-strong)] bg-[var(--ws-canvas)] shadow-[var(--ws-shadow-lg)] sm:rounded-[var(--ws-radius-md)] overflow-hidden"
      >
        {/* Header & Edition Pair Controls */}
        <div className="ws-drawer-masthead px-5 py-4.5 sm:px-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2 ws-kicker text-[var(--ws-editorial-accent)]">
                <History className="h-3.5 w-3.5 shrink-0" />
                <span>WORLD SIGNAL · EDITION DIFF</span>
              </div>
              <h2
                id={titleId}
                className="font-display text-[1.32rem] sm:text-[1.5rem] font-semibold tracking-[-0.018em] text-[var(--ws-ink)]"
              >
                {t.editionCompare.dialogTitle}
              </h2>
              <p className="text-[12.5px] text-[var(--ws-ink-muted)]">
                {t.editionCompare.dialogSubtitle}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t.editionCompare.close}
              data-testid="edition-compare-close"
              className="rounded-[var(--ws-radius-sm)] p-1.5 text-[var(--ws-ink-muted)] hover:bg-[var(--ws-surface-subtle)] hover:text-[var(--ws-ink)] cursor-pointer shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* From / To Archive Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-2.5 items-end">
            <label className="space-y-1 text-[12px]">
              <span className="block ws-kicker text-[var(--ws-ink-faint)]">
                {t.editionCompare.fromEditionLabel}
              </span>
              <select
                data-testid="compare-from-select"
                value={fromDate}
                onChange={(e) => onChangeFromDate(e.target.value)}
                className="w-full min-h-[38px] rounded-[var(--ws-radius-sm)] border border-[var(--ws-border-strong)] bg-[var(--ws-canvas)] px-3 py-1.5 font-mono-tabular text-[12.5px] font-medium text-[var(--ws-ink)]"
              >
                <option value="">—</option>
                {sortedEditionsDesc.map((entry) => (
                  <option key={entry.date} value={entry.date}>
                    {entry.date} — {entry.title}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              data-testid="compare-swap-btn"
              onClick={onSwapDates}
              title={t.editionCompare.swapOrder}
              aria-label={t.editionCompare.swapOrder}
              className="inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-canvas)] px-3 py-1.5 text-[12px] font-medium text-[var(--ws-ink-secondary)] hover:border-[var(--ws-border-strong)] hover:text-[var(--ws-ink)] cursor-pointer"
            >
              <ArrowLeftRight className="h-3.5 w-3.5" />
              <span className="sm:hidden">{t.editionCompare.swapOrder}</span>
            </button>

            <label className="space-y-1 text-[12px]">
              <span className="block ws-kicker text-[var(--ws-ink-faint)]">
                {t.editionCompare.toEditionLabel}
              </span>
              <select
                data-testid="compare-to-select"
                value={toDate}
                onChange={(e) => onChangeToDate(e.target.value)}
                className="w-full min-h-[38px] rounded-[var(--ws-radius-sm)] border border-[var(--ws-border-strong)] bg-[var(--ws-canvas)] px-3 py-1.5 font-mono-tabular text-[12.5px] font-medium text-[var(--ws-ink)]"
              >
                <option value="">—</option>
                {sortedEditionsDesc.map((entry) => (
                  <option key={entry.date} value={entry.date}>
                    {entry.date} — {entry.title}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* Scrollable Comparison Body */}
        <div className="flex-1 overflow-y-auto ws-scroll px-4 py-4 sm:px-6 sm:py-5 space-y-4">
          {/* Validation Error */}
          {validationError && (
            <div
              data-testid="compare-validation-error"
              className="ws-caution-panel px-4 py-3 text-[13px] text-[var(--ws-ink-secondary)]"
            >
              {t.editionCompare.validationErrors[validationError]}
            </div>
          )}

          {/* Chronological Reorder Note */}
          {!validationError && wasReversedInput && result && (
            <div className="ws-folio-note px-4 py-2.5 text-[12px] text-[var(--ws-ink-muted)]">
              {t.editionCompare.reorderedNote(result.fromDate, result.toDate)}
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="py-12 flex items-center justify-center gap-2.5 font-mono-tabular text-[12.5px] text-[var(--ws-ink-muted)]">
              <RefreshCw className="h-4 w-4 animate-spin text-[var(--ws-world)]" />
              <span>{t.editionCompare.loadingPair(fromDate, toDate)}</span>
            </div>
          )}

          {/* Fetch Error */}
          {fetchError && !isLoading && (
            <div className="rounded-[var(--ws-radius-sm)] border border-[var(--ws-error-border)] bg-[var(--ws-error-soft)] p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 mt-0.5 text-[var(--ws-error)] shrink-0" />
                <div className="space-y-0.5">
                  <div className="ws-kicker text-[var(--ws-error)]">
                    {t.editionCompare.loadErrorTitle}
                  </div>
                  <p className="text-[12.5px] text-[var(--ws-ink-secondary)]">
                    {fetchError}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex min-h-[32px] items-center gap-1.5 rounded-[var(--ws-radius-sm)] border border-[var(--ws-border-strong)] bg-[var(--ws-surface)] px-3 py-1 text-[12px] font-medium text-[var(--ws-ink)] cursor-pointer"
              >
                <RefreshCw className="h-3 w-3" />
                <span>{t.editionCompare.retry}</span>
              </button>
            </div>
          )}

          {/* Deterministic Comparison Result */}
          {result && !isLoading && !fetchError && (
            <div className="space-y-4">
              {/* Comparison Metadata Strip */}
              <div className="flex flex-wrap items-center justify-between gap-2 font-mono-tabular text-[12px] text-[var(--ws-ink-muted)]">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    data-testid="compare-range-label"
                    className="font-semibold text-[var(--ws-ink)]"
                  >
                    {t.dailyDelta.comparingRange(result.fromDate, result.toDate)}
                  </span>
                  {result.dayGapCount > 0 && (
                    <span>· {t.editionCompare.daySpanLabel(result.dayGapCount)}</span>
                  )}
                </div>
                <span className="text-[11px]">
                  {t.dailyDelta.routineMetadataNote}
                </span>
              </div>

              {result.fromSchemaVersion !== result.toSchemaVersion && (
                <div className="ws-folio-note px-4 py-2 text-[12px] text-[var(--ws-ink-muted)]">
                  {t.dailyDelta.schemaTransitionNote(
                    result.fromSchemaVersion,
                    result.toSchemaVersion
                  )}
                </div>
              )}

              {/* 4-Category Broadsheet Comparison Ledger */}
              <div className="ws-broadsheet-ledger overflow-hidden">
                <div
                  role="tablist"
                  aria-label={t.editionCompare.dialogTitle}
                  className="grid grid-cols-2 lg:grid-cols-4 border-b border-[var(--ws-border)] bg-[var(--ws-surface-elevated)]"
                >
                  {CATEGORIES.map((category, idx) => {
                    const isActive = activeCategory === category;
                    const count = categoryCount(category);
                    const borderClasses = [
                      idx % 2 === 1 ? 'border-l border-[var(--ws-border)]' : '',
                      idx >= 2
                        ? 'border-t border-[var(--ws-border)] lg:border-t-0'
                        : '',
                      idx === 2 ? 'lg:border-l lg:border-[var(--ws-border)]' : '',
                    ]
                      .filter(Boolean)
                      .join(' ');
                    const topBar =
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
                        data-testid={`compare-tab-${category}`}
                        onClick={() => {
                          setActiveCategory(category);
                          setExpandedSignalIds(new Set());
                        }}
                        className={`relative text-left px-4 py-3 transition-colors cursor-pointer ${borderClasses} ${
                          isActive
                            ? 'bg-[var(--ws-surface)]'
                            : 'hover:bg-[var(--ws-surface-hover)]/75'
                        }`}
                      >
                        {isActive && (
                          <span
                            aria-hidden="true"
                            className={`absolute inset-x-0 top-0 h-[3px] ${topBar}`}
                          />
                        )}
                        <div className="flex items-baseline justify-between gap-2">
                          <span
                            className={`ws-kicker ${
                              isActive
                                ? categoryAccentClass(category)
                                : 'text-[var(--ws-ink-muted)]'
                            }`}
                          >
                            {t.dailyDelta.categories[category]}
                          </span>
                          <span
                            data-testid={`compare-count-${category}`}
                            className="font-display text-[1.45rem] font-semibold leading-none tabular-nums text-[var(--ws-ink)]"
                          >
                            {count}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="px-4 py-4 sm:px-5 space-y-4">
                  {/* Permanent Omitted Is Not Resolved Safeguard */}
                  {activeCategory === 'omitted' && (
                    <div
                      data-testid="compare-omitted-safeguard"
                      className="ws-caution-panel px-4 py-3 space-y-1"
                    >
                      <div className="ws-kicker text-[var(--ws-warn)]">
                        {t.dailyDelta.omittedNoticeTitle}
                      </div>
                      <p className="text-[12.5px] leading-relaxed text-[var(--ws-ink-secondary)]">
                        {t.dailyDelta.omittedNoticeBody(
                          result.fromDate,
                          result.toDate
                        )}
                      </p>
                    </div>
                  )}

                  {items.length === 0 ? (
                    <p className="py-4 text-[13px] text-[var(--ws-ink-muted)]">
                      {t.dailyDelta.emptyCategory}
                    </p>
                  ) : (
                    <div className="divide-y divide-[var(--ws-border-subtle)]">
                      {items.map((change) => (
                        <ComparisonSignalRow
                          key={change.signalId}
                          change={change}
                          fromDate={result.fromDate}
                          toDate={result.toDate}
                          lang={lang}
                          isExpanded={expandedSignalIds.has(change.signalId)}
                          onToggleExpand={() => toggleExpand(change.signalId)}
                          onOpenVersion={openVersion}
                          onOpenStoryline={(sigId) => {
                            onClose();
                            onOpenStoryline(sigId);
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ComparisonSignalRow: React.FC<{
  change: EditionSignalChange;
  fromDate: string;
  toDate: string;
  lang: UiLanguage;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onOpenVersion: (editionDate: string, signalId: string) => void;
  onOpenStoryline: (signalId: string) => void;
}> = ({
  change,
  fromDate,
  toDate,
  lang,
  isExpanded,
  onToggleExpand,
  onOpenVersion,
  onOpenStoryline,
}) => {
  const t = getUiStrings(lang);
  const displaySignal = getDisplaySignalForChange(change);
  if (!displaySignal) return null;

  const claimChangesCount =
    change.diff.addedClaimIds.length +
    change.diff.revisedClaimIds.length +
    change.diff.withdrawnClaimIds.length;
  const sourceChangesCount =
    change.diff.addedSourceUrls.length +
    change.diff.revisedSourceUrls.length +
    change.diff.removedSourceUrls.length;
  const hasEvidence =
    (change.kind === 'updated' || change.kind === 'new') &&
    (claimChangesCount > 0 || sourceChangesCount > 0);

  const verifiedSummary = getVerifiedUpdateSummary(change, fromDate);

  return (
    <article
      data-testid={`compare-item-${change.signalId}`}
      className="py-4 first:pt-1 last:pb-1 space-y-2"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 font-mono-tabular text-[11px] text-[var(--ws-ink-muted)]">
        <div className="flex flex-wrap items-center gap-x-2">
          <span
            className={`font-semibold uppercase tracking-[0.08em] ${categoryAccentClass(
              change.kind
            )}`}
          >
            {t.dailyDelta.categoryBadges[change.kind]}
          </span>
          <span>·</span>
          <span className={`font-semibold ${domainAccentTextClass(displaySignal.domain)}`}>
            {t.domains[displaySignal.domain]}
          </span>
          <span>·</span>
          <span className="font-semibold text-[var(--ws-ink)]">
            {t.metaLine.importance(displaySignal.importance)}
          </span>
          <span>·</span>
          <span className={confidenceColorClass(displaySignal.confidence.overall)}>
            {t.metaLine.confidence(t.confidence[displaySignal.confidence.overall])}
          </span>
        </div>
        <span className="text-[10.5px] text-[var(--ws-ink-faint)] break-all">
          {change.signalId}
        </span>
      </div>

      <h3 className="font-display text-[1.04rem] font-semibold leading-snug text-[var(--ws-ink)]">
        {displaySignal.headline}
      </h3>

      {change.kind === 'updated' && (
        <div className="space-y-1 text-[12px] text-[var(--ws-ink-secondary)]">
          {change.diff.reasons.length > 0 && (
            <div className="font-mono-tabular text-[11.5px] text-[var(--ws-ink-muted)]">
              <strong className="text-[var(--ws-ink-secondary)]">
                {t.dailyDelta.updatedReasonsPrefix}:{' '}
              </strong>
              {change.diff.reasons
                .map((r) => t.dailyDelta.reasons[r])
                .join(' · ')}
            </div>
          )}
          {change.previous &&
            change.current &&
            change.previous.headline !== change.current.headline && (
              <p className="italic text-[var(--ws-ink-muted)]">
                {t.dailyDelta.headlineChangedNote(change.previous.headline)}
              </p>
            )}
          {verifiedSummary && (
            <p className="leading-relaxed">{verifiedSummary}</p>
          )}
        </div>
      )}

      {change.kind === 'omitted' && (
        <p className="text-[12px] text-[var(--ws-warn)]">
          {t.dailyDelta.omittedItemExplanation(fromDate, toDate)}
        </p>
      )}

      {/* Evidence Disclosure Panel */}
      {hasEvidence && isExpanded && (
        <div className="mt-2 rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-surface-elevated)] p-3 space-y-2.5 text-[12px]">
          {(
            [
              {
                label: t.dailyDelta.addedClaimsLabel,
                ids: change.diff.addedClaimIds,
                prev: false,
                color: 'text-[var(--ws-economy)]',
              },
              {
                label: t.dailyDelta.revisedClaimsLabel,
                ids: change.diff.revisedClaimIds,
                prev: false,
                color: 'text-[var(--ws-world)]',
              },
              {
                label: t.dailyDelta.withdrawnClaimsLabel,
                ids: change.diff.withdrawnClaimIds,
                prev: true,
                color: 'text-[var(--ws-warn)]',
              },
            ] as const
          ).map(
            (grp) =>
              grp.ids.length > 0 && (
                <div key={grp.label} className="space-y-1">
                  <div className={`ws-kicker ${grp.color}`}>
                    {grp.label} ({grp.ids.length})
                  </div>
                  <ul className="space-y-1">
                    {grp.ids.map((cid) => {
                      const claim = resolveClaimForDelta(change, cid, grp.prev);
                      return (
                        <li key={cid}>
                          <span className="font-mono-tabular font-semibold text-[var(--ws-ink)]">
                            {cid}
                          </span>
                          {claim && (
                            <span className="ml-1.5 text-[var(--ws-ink-secondary)]">
                              — {claim.statement}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )
          )}

          {(
            [
              {
                label: t.dailyDelta.addedSourcesLabel,
                keys: change.diff.addedSourceUrls,
                prev: false,
                color: 'text-[var(--ws-economy)]',
              },
              {
                label: t.dailyDelta.revisedSourcesLabel,
                keys: change.diff.revisedSourceUrls,
                prev: false,
                color: 'text-[var(--ws-world)]',
              },
              {
                label: t.dailyDelta.removedSourcesLabel,
                keys: change.diff.removedSourceUrls,
                prev: true,
                color: 'text-[var(--ws-warn)]',
              },
            ] as const
          ).map(
            (grp) =>
              grp.keys.length > 0 && (
                <div key={grp.label} className="space-y-1">
                  <div className={`ws-kicker ${grp.color}`}>
                    {grp.label} ({grp.keys.length})
                  </div>
                  <ul className="space-y-1">
                    {grp.keys.map((key) => {
                      const src = resolveSourceForDelta(change, key, grp.prev);
                      return (
                        <li key={key}>
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

      {/* Action Footer: Open Previous Version, Open Current Version, Storyline */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[12px]">
        <div className="flex flex-wrap items-center gap-3">
          {hasEvidence && (
            <button
              type="button"
              onClick={onToggleExpand}
              className="inline-flex items-center gap-1 font-mono-tabular text-[11.5px] text-[var(--ws-ink-muted)] hover:text-[var(--ws-ink)] cursor-pointer"
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
          <button
            type="button"
            onClick={() => onOpenStoryline(change.signalId)}
            className="inline-flex items-center gap-1 font-mono-tabular text-[11.5px] text-[var(--ws-world)] hover:underline underline-offset-4 cursor-pointer"
          >
            <GitBranch className="h-3 w-3" />
            <span>{t.globalSearch.openStoryline}</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {change.previous && (
            <button
              type="button"
              data-testid={`compare-open-prev-${change.signalId}`}
              onClick={() => onOpenVersion(fromDate, change.signalId)}
              className="inline-flex items-center gap-1 text-[12px] font-medium text-[var(--ws-ink-secondary)] hover:text-[var(--ws-world)] hover:underline underline-offset-4 cursor-pointer"
            >
              <span>{t.editionCompare.openPreviousVersion(fromDate)}</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          )}
          {change.current && (
            <button
              type="button"
              data-testid={`compare-open-curr-${change.signalId}`}
              onClick={() => onOpenVersion(toDate, change.signalId)}
              className="inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--ws-ink)] hover:text-[var(--ws-world)] hover:underline underline-offset-4 cursor-pointer"
            >
              <span>{t.editionCompare.openCurrentVersion(toDate)}</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
