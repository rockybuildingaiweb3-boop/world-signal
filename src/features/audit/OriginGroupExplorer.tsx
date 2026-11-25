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

export const OriginGroupExplorer: React.FC<OriginGroupExplorerProps> = ({
  originGroups,
  unassignedRecords,
  lang,
  onOpenSignal,
}) => {
  const t = getUiStrings(lang);
  const [originFilter, setOriginFilter] = useState<OriginFilter>('all');

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
    <section className="space-y-5 border-t border-[var(--ws-border)] pt-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h2 className="font-display text-xl font-semibold text-[var(--ws-ink)]">
            {t.audit.originExplorerTitle}
          </h2>
          <p className="max-w-2xl text-xs text-[var(--ws-ink-muted)]">
            {t.audit.originExplorerSubtitle}
          </p>
        </div>

        <div className="inline-flex rounded-md border border-[var(--ws-border)] bg-[var(--ws-surface-subtle)] p-0.5 text-xs shrink-0 self-start">
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
              className={`rounded px-3 py-1 font-medium transition-colors cursor-pointer ${
                originFilter === key
                  ? 'bg-[var(--ws-surface)] text-[var(--ws-ink)] shadow-xs'
                  : 'text-[var(--ws-ink-muted)] hover:text-[var(--ws-ink)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filteredOriginGroups.length === 0 ? (
        <div className="ws-card p-6 text-center text-xs text-[var(--ws-ink-muted)]">
          {t.audit.noItemsInSection}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {filteredOriginGroups.map((group) => (
            <article
              key={group.group}
              className="ws-card p-4 space-y-2.5 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-mono-tabular text-sm font-semibold text-[var(--ws-ink)] break-words">
                      {group.group}
                    </div>
                    <div className="font-mono-tabular text-[11px] text-[var(--ws-ink-muted)]">
                      {t.audit.originRecordsLabel(
                        group.qualifyingRecordCount,
                        group.totalRecordCount
                      )}
                    </div>
                  </div>

                  <span
                    className={`font-mono-tabular text-[11px] font-semibold shrink-0 ${
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

                <div className="text-xs text-[var(--ws-ink-secondary)] break-words">
                  <span className="font-medium text-[var(--ws-ink-muted)]">
                    {t.audit.originOutletsLabel}:{' '}
                  </span>
                  {group.outlets.join(', ')}
                </div>

                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono-tabular text-[11px] text-[var(--ws-ink-muted)]">
                  <span>
                    {group.sourceClasses
                      .map((sc) => t.sourceClass[sc])
                      .join(' / ')}
                  </span>
                  <span aria-hidden="true" className="opacity-40">
                    ·
                  </span>
                  <span>
                    {group.relationships
                      .map((rel) => t.relationship[rel])
                      .join(' / ')}
                  </span>
                </div>

                {group.exclusionReasons.length > 0 && (
                  <div className="rounded bg-[var(--ws-surface-subtle)] px-2.5 py-1.5 text-[11.5px] text-[var(--ws-ink-muted)]">
                    <span className="font-medium text-[var(--ws-ink-secondary)]">
                      {t.audit.originExclusionReasonLabel}:{' '}
                    </span>
                    {group.exclusionReasons
                      .map((r) => t.exclusionReason[r])
                      .join('; ')}
                  </div>
                )}
              </div>

              {group.signalIds.length > 0 && (
                <div className="border-t border-[var(--ws-border)] pt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono-tabular text-[11px]">
                  <span className="text-[var(--ws-ink-muted)]">
                    {t.audit.originSignalsLabel} ({group.signalIds.length}):
                  </span>
                  {group.signalIds.map((sid) => (
                    <button
                      key={sid}
                      type="button"
                      onClick={() => onOpenSignal(sid)}
                      className="text-[var(--ws-world)] underline decoration-[var(--ws-border-strong)] underline-offset-2 hover:decoration-current cursor-pointer"
                    >
                      {sid}
                    </button>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {/* Administrative Section: Unassigned Source Records (Never merged into one reporting origin) */}
      {showUnassignedPanel && (
        <div className="rounded-md border border-[var(--ws-warn-border)] bg-[var(--ws-warn-soft)] p-5 space-y-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--ws-warn)]">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <h3>
                {t.audit.unassignedTitle} ({unassignedRecords.length})
              </h3>
            </div>
            <p className="text-xs leading-relaxed text-[var(--ws-ink-secondary)]">
              {t.audit.unassignedSubtitle}
            </p>
          </div>

          <ul className="space-y-2">
            {unassignedRecords.map((rec, idx) => (
              <li
                key={`${rec.signal_id ?? 'edition'}-${rec.source_id}-${idx}`}
                className="rounded-md border border-[var(--ws-border)] bg-[var(--ws-surface)] p-3.5 space-y-1.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 font-mono-tabular text-[11.5px]">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="font-semibold text-[var(--ws-ink)]">
                      {rec.source_id}
                    </span>
                    <span aria-hidden="true" className="opacity-40">
                      ·
                    </span>
                    <span className="font-semibold text-[var(--ws-ink)]">
                      {rec.outlet}
                    </span>
                    {rec.signal_id && (
                      <>
                        <span aria-hidden="true" className="opacity-40">
                          ·
                        </span>
                        <button
                          type="button"
                          onClick={() => onOpenSignal(rec.signal_id!)}
                          className="text-[var(--ws-world)] underline decoration-[var(--ws-border-strong)] underline-offset-2 hover:decoration-current cursor-pointer"
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
                        className="inline-flex items-baseline gap-1 hover:text-[var(--ws-world)] underline decoration-[var(--ws-border-strong)] underline-offset-2"
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
                  <span aria-hidden="true" className="opacity-40">
                    ·
                  </span>
                  <span>{t.relationship[rec.relationship]}</span>
                  <span aria-hidden="true" className="opacity-40">
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
