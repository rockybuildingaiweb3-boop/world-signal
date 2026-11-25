import React, { useMemo, useState } from 'react';
import { AlertCircle, ExternalLink } from 'lucide-react';
import type {
  OriginGroupAuditRecord,
  UiLanguage,
  UnassignedSourceRecord,
} from '../../types/edition';
import { getUiStrings } from '../../lib/i18n/uiStrings';

type OriginFilter = 'all' | 'qualifying' | 'excluded';

interface OriginGroupExplorerProps {
  originGroups: OriginGroupAuditRecord[];
  unassignedRecords: UnassignedSourceRecord[];
  lang: UiLanguage;
  onOpenSignal: (signalId: string) => void;
}

const MAX_COLLAPSED_OUTLETS = 5;
const MAX_COLLAPSED_SIGNALS = 6;

export const OriginGroupExplorer: React.FC<OriginGroupExplorerProps> = ({
  originGroups,
  unassignedRecords,
  lang,
  onOpenSignal,
}) => {
  const t = getUiStrings(lang);
  const [originFilter, setOriginFilter] = useState<OriginFilter>('all');
  const [expandedOutlets, setExpandedOutlets] = useState<Set<string>>(
    () => new Set()
  );
  const [expandedSignals, setExpandedSignals] = useState<Set<string>>(
    () => new Set()
  );

  const toggleOutletGroup = (groupKey: string) => {
    setExpandedOutlets((prev) => {
      const next = new Set(prev);
      if (next.has(groupKey)) next.delete(groupKey);
      else next.add(groupKey);
      return next;
    });
  };

  const toggleSignalGroup = (groupKey: string) => {
    setExpandedSignals((prev) => {
      const next = new Set(prev);
      if (next.has(groupKey)) next.delete(groupKey);
      else next.add(groupKey);
      return next;
    });
  };

  const qualifyingGroupCount = useMemo(
    () => originGroups.filter((g) => g.qualifiesAny).length,
    [originGroups]
  );
  const excludedGroupCount = originGroups.length - qualifyingGroupCount;

  const filteredOriginGroups = useMemo(() => {
    return originGroups.filter((g) => {
      if (originFilter === 'qualifying') return g.qualifiesAny;
      if (originFilter === 'excluded')
        return !g.qualifiesAny || g.excludedRecordCount > 0;
      return true;
    });
  }, [originFilter, originGroups]);

  const showUnassignedPanel =
    unassignedRecords.length > 0 && originFilter !== 'qualifying';

  return (
    <section className="space-y-5 ws-section-rule pt-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1.5">
          <h2 className="font-display text-[1.35rem] sm:text-[1.55rem] font-semibold tracking-[-0.015em] text-[var(--ws-ink)]">
            {t.audit.originExplorerTitle}
          </h2>
          <p className="max-w-2xl text-[12.5px] leading-relaxed text-[var(--ws-ink-muted)]">
            {t.audit.originExplorerSubtitle}
          </p>
          {originGroups.length > 0 && (
            <div className="pt-0.5 font-mono-tabular text-[11.5px] font-medium text-[var(--ws-ink-secondary)]">
              {t.audit.originSummaryRibbon(qualifyingGroupCount, excludedGroupCount)}
            </div>
          )}
        </div>

        <div className="inline-flex rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-surface-subtle)] p-0.5 text-xs shrink-0 self-start">
          {(
            [
              ['all', t.audit.originFilterAll],
              ['qualifying', t.audit.originFilterQualifying],
              ['excluded', t.audit.originFilterExcluded],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setOriginFilter(key)}
              className={`rounded-[3px] px-3 py-1.5 font-medium transition-colors cursor-pointer ${
                originFilter === key
                  ? 'bg-[var(--ws-surface)] text-[var(--ws-ink)] shadow-xs font-semibold'
                  : 'text-[var(--ws-ink-muted)] hover:text-[var(--ws-ink)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filteredOriginGroups.length === 0 ? (
        <div className="ws-broadsheet-ledger p-6 text-center text-xs text-[var(--ws-ink-muted)]">
          {t.audit.noItemsInSection}
        </div>
      ) : (
        <div className="ws-broadsheet-ledger divide-y divide-[var(--ws-border)]">
          {filteredOriginGroups.map((group) => {
            const qualifyingRatio =
              group.totalRecordCount > 0
                ? Math.round(
                    (group.qualifyingRecordCount / group.totalRecordCount) * 100
                  )
                : 0;
            const isOutletsExpanded = expandedOutlets.has(group.group);
            const isSignalsExpanded = expandedSignals.has(group.group);
            const visibleOutlets = isOutletsExpanded
              ? group.outlets
              : group.outlets.slice(0, MAX_COLLAPSED_OUTLETS);
            const hiddenOutletsCount =
              group.outlets.length - visibleOutlets.length;
            const visibleSignals = isSignalsExpanded
              ? group.signalIds
              : group.signalIds.slice(0, MAX_COLLAPSED_SIGNALS);
            const hiddenSignalsCount =
              group.signalIds.length - visibleSignals.length;

            return (
              <article
                key={group.group}
                className={`p-4 sm:px-6 sm:py-5 grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6 items-start transition-colors ${
                  group.qualifiesAny
                    ? 'hover:bg-[var(--ws-surface-elevated)]/45'
                    : 'bg-[var(--ws-surface-elevated)]/40 hover:bg-[var(--ws-surface-elevated)]/70'
                }`}
              >
                {/* Left 4 cols: Origin Group Identity, Status & Qualifying Ratio */}
                <div className="lg:col-span-4 space-y-2.5 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="font-mono-tabular text-[14.5px] font-semibold text-[var(--ws-ink)] break-words min-w-0">
                      {group.group}
                    </div>
                    <span
                      className={`text-[11.5px] font-semibold shrink-0 ${
                        group.qualifiesAny
                          ? 'text-[var(--ws-conf-high)]'
                          : 'text-[var(--ws-ink-muted)]'
                      }`}
                    >
                      {group.qualifiesAny
                        ? t.audit.originCountedBadge
                        : t.audit.originExcludedBadge}
                    </span>
                  </div>

                  {/* Derived Qualifying vs. Total Proportion Micro-Bar */}
                  <div className="h-1.5 w-full overflow-hidden rounded-[1px] bg-[var(--ws-surface-subtle)]">
                    <div
                      className={`h-full ${
                        group.qualifiesAny
                          ? 'bg-[var(--ws-conf-high)]'
                          : 'bg-[var(--ws-border-strong)]'
                      }`}
                      style={{ width: `${qualifyingRatio}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2 font-mono-tabular text-[11.5px] text-[var(--ws-ink-muted)]">
                    <span>
                      {t.audit.originRecordsLabel(
                        group.qualifyingRecordCount,
                        group.totalRecordCount
                      )}
                    </span>
                    <span className="font-semibold text-[var(--ws-ink-secondary)]">
                      {qualifyingRatio}%
                    </span>
                  </div>
                </div>

                {/* Right 8 cols: Outlets, Classification, Exclusion Rationale & Linked Signals */}
                <div className="lg:col-span-8 space-y-2.5 min-w-0 lg:border-l lg:border-[var(--ws-border-subtle)] lg:pl-6">
                  {/* Outlets with Progressive Disclosure */}
                  <div className="text-[13px] leading-[1.6] text-[var(--ws-ink-secondary)] break-words">
                    <span className="font-semibold text-[var(--ws-ink-muted)]">
                      {t.audit.originOutletsLabel}:{' '}
                    </span>
                    <span>{visibleOutlets.join(', ')}</span>
                    {group.outlets.length > MAX_COLLAPSED_OUTLETS && (
                      <>
                        {' '}
                        <button
                          type="button"
                          onClick={() => toggleOutletGroup(group.group)}
                          className="font-mono-tabular text-[11.5px] font-medium text-[var(--ws-world)] hover:underline underline-offset-4 cursor-pointer"
                        >
                          {isOutletsExpanded
                            ? t.audit.showFewerList
                            : t.audit.showMoreOutlets(hiddenOutletsCount)}
                        </button>
                      </>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px] text-[var(--ws-ink-muted)]">
                    <span>
                      {group.sourceClasses
                        .map((sc) => t.sourceClass[sc])
                        .join(' / ')}
                    </span>
                    <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">
                      ·
                    </span>
                    <span>
                      {group.relationships
                        .map((rel) => t.relationship[rel])
                        .join(' / ')}
                    </span>
                  </div>

                  {group.exclusionReasons.length > 0 && (
                    <div className="ws-folio-note px-3 py-1.5 text-[12px] text-[var(--ws-ink-muted)]">
                      <span className="font-medium text-[var(--ws-ink-secondary)]">
                        {t.audit.originExclusionReasonLabel}:{' '}
                      </span>
                      {group.exclusionReasons
                        .map((r) => t.exclusionReason[r])
                        .join('; ')}
                    </div>
                  )}

                  {group.signalIds.length > 0 && (
                    <div className="pt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono-tabular text-[11.5px]">
                      <span className="font-sans text-[var(--ws-ink-muted)]">
                        {t.audit.originSignalsLabel} ({group.signalIds.length}):
                      </span>
                      {visibleSignals.map((sid) => (
                        <button
                          key={sid}
                          type="button"
                          onClick={() => onOpenSignal(sid)}
                          className="text-[var(--ws-world)] underline decoration-[var(--ws-border-strong)] underline-offset-4 hover:decoration-current cursor-pointer"
                        >
                          {sid}
                        </button>
                      ))}
                      {group.signalIds.length > MAX_COLLAPSED_SIGNALS && (
                        <button
                          type="button"
                          onClick={() => toggleSignalGroup(group.group)}
                          className="font-medium text-[var(--ws-ink-secondary)] hover:text-[var(--ws-ink)] underline decoration-dotted underline-offset-4 cursor-pointer"
                        >
                          {isSignalsExpanded
                            ? t.audit.showFewerList
                            : t.audit.showMoreSignals(hiddenSignalsCount)}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Administrative Section: Unassigned Source Records (Never merged into one reporting origin) */}
      {showUnassignedPanel && (
        <div className="ws-caution-panel p-5 space-y-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--ws-warn)]">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <h3>
                {t.audit.unassignedTitle} ({unassignedRecords.length})
              </h3>
            </div>
            <p className="text-[12.5px] leading-relaxed text-[var(--ws-ink-secondary)]">
              {t.audit.unassignedSubtitle}
            </p>
          </div>

          <ul className="border-y border-[var(--ws-border)] bg-[var(--ws-surface)] divide-y divide-[var(--ws-border-subtle)]">
            {unassignedRecords.map((rec, idx) => (
              <li
                key={`${rec.signal_id ?? 'edition'}-${rec.source_id}-${idx}`}
                className="px-4 py-3.5 space-y-1.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 font-mono-tabular text-[11.5px]">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="font-semibold text-[var(--ws-ink)]">
                      {rec.source_id}
                    </span>
                    <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">
                      ·
                    </span>
                    <span className="font-semibold text-[var(--ws-ink)]">
                      {rec.outlet}
                    </span>
                    {rec.signal_id && (
                      <>
                        <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">
                          ·
                        </span>
                        <button
                          type="button"
                          onClick={() => onOpenSignal(rec.signal_id!)}
                          className="text-[var(--ws-world)] underline decoration-[var(--ws-border-strong)] underline-offset-4 hover:decoration-current cursor-pointer"
                        >
                          {rec.signal_id}
                        </button>
                      </>
                    )}
                  </div>
                  <span className="text-[var(--ws-warn)] font-semibold">
                    {t.audit.unassignedBadge}
                  </span>
                </div>

                {rec.title && (
                  <div className="text-xs font-medium text-[var(--ws-ink-secondary)] break-words">
                    {rec.url && rec.urlSafe ? (
                      <a
                        href={rec.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-baseline gap-1 hover:text-[var(--ws-world)] underline decoration-[var(--ws-border-strong)] underline-offset-4"
                      >
                        <span>{rec.title}</span>
                        <ExternalLink className="h-2.5 w-2.5 shrink-0 self-center" />
                      </a>
                    ) : (
                      <span>{rec.title}</span>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono-tabular text-[11px] text-[var(--ws-ink-muted)]">
                  <span>{t.sourceClass[rec.source_class]}</span>
                  <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">
                    ·
                  </span>
                  <span>{t.relationship[rec.relationship]}</span>
                  <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">
                    ·
                  </span>
                  <span>{t.exclusionReason[rec.exclusionReason]}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};
