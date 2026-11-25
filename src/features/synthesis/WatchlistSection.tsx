import React, { useMemo, useState } from 'react';
import type {
  ParsedSignal,
  UiLanguage,
  WatchlistRow,
} from '../../types/edition';
import { getUiStrings } from '../../lib/i18n/uiStrings';
import { domainAccentTextClass } from '../../lib/filtering/filterSignals';
import { SafeMarkdown } from '../../components/editorial/SafeMarkdown';

interface WatchlistSectionProps {
  rows: WatchlistRow[];
  rawMarkdown: string;
  signalById: Map<string, ParsedSignal>;
  lang: UiLanguage;
  onOpenSignal: (signalId: string) => void;
}

export const WatchlistSection: React.FC<WatchlistSectionProps> = ({
  rows,
  rawMarkdown,
  signalById,
  lang,
  onOpenSignal,
}) => {
  const t = getUiStrings(lang);
  const [filterMode, setFilterMode] = useState<'all' | 'linked'>('all');

  const linkedRowCount = useMemo(
    () => rows.filter((r) => r.signalsLinked.length > 0).length,
    [rows]
  );

  const visibleRows = useMemo(() => {
    if (filterMode === 'linked') {
      return rows.filter((r) => r.signalsLinked.length > 0);
    }
    return rows;
  }, [filterMode, rows]);

  const showFilterToggle = rows.length > 0 && linkedRowCount < rows.length;

  return (
    <section className="space-y-5 ws-section-rule pt-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h2 className="font-display text-[1.4rem] sm:text-[1.65rem] font-semibold tracking-[-0.018em] text-[var(--ws-ink)]">
            {t.synthesis.watchlistTitle}
          </h2>
          <p className="text-[12.5px] text-[var(--ws-ink-muted)]">
            {t.synthesis.watchlistSubtitle}
          </p>
        </div>

        {showFilterToggle && (
          <div className="inline-flex rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-surface-subtle)] p-0.5 text-xs shrink-0 self-start">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`rounded-[3px] px-3 py-1.5 font-medium transition-colors cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-[var(--ws-surface)] text-[var(--ws-ink)] shadow-xs font-semibold'
                  : 'text-[var(--ws-ink-muted)] hover:text-[var(--ws-ink)]'
              }`}
            >
              {t.synthesis.watchlistFilterAll} ({rows.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('linked')}
              className={`rounded-[3px] px-3 py-1.5 font-medium transition-colors cursor-pointer ${
                filterMode === 'linked'
                  ? 'bg-[var(--ws-surface)] text-[var(--ws-ink)] shadow-xs font-semibold'
                  : 'text-[var(--ws-ink-muted)] hover:text-[var(--ws-ink)]'
              }`}
            >
              {t.synthesis.watchlistFilterLinked} ({linkedRowCount})
            </button>
          </div>
        )}
      </div>

      {rows.length > 0 ? (
        <>
          {/* Desktop / Tablet Institutional Ledger Table */}
          <div className="hidden md:block ws-editorial-sheet rounded-b-[var(--ws-radius-sm)] border-x border-[var(--ws-border)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-[var(--ws-surface-elevated)] font-mono-tabular text-[11px] uppercase tracking-[0.1em] text-[var(--ws-ink-muted)]">
                  <tr>
                    <th className="border-b border-[var(--ws-border-strong)] px-5 py-3.5 w-[24%]">
                      {t.synthesis.watchlistCols.indicator}
                    </th>
                    <th className="border-b border-[var(--ws-border-strong)] px-5 py-3.5 w-[38%]">
                      {t.synthesis.watchlistCols.whyItMatters}
                    </th>
                    <th className="border-b border-[var(--ws-border-strong)] px-5 py-3.5 w-[16%]">
                      {t.synthesis.watchlistCols.nextCheckpoint}
                    </th>
                    <th className="border-b border-[var(--ws-border-strong)] px-5 py-3.5 w-[22%]">
                      {t.synthesis.watchlistCols.signalsLinked}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--ws-border-subtle)] text-[13.5px]">
                  {visibleRows.map((row, idx) => (
                    <tr
                      key={`${row.indicator}-${idx}`}
                      className="hover:bg-[var(--ws-surface-hover)]/55 transition-colors"
                    >
                      <td className="px-5 py-4 align-top font-semibold text-[var(--ws-ink)] break-words">
                        {row.indicator}
                      </td>
                      <td className="px-5 py-4 align-top text-[var(--ws-ink-secondary)] leading-[1.6] break-words">
                        {row.whyItMatters}
                      </td>
                      <td className="px-5 py-4 align-top font-mono-tabular text-xs font-semibold text-[var(--ws-ink)]">
                        {row.nextCheckpoint}
                      </td>
                      <td className="px-5 py-4 align-top font-mono-tabular text-xs">
                        {row.signalsLinked.length === 0 ? (
                          <span className="text-[var(--ws-ink-muted)]">
                            {t.synthesis.watchlistUnlinked}
                          </span>
                        ) : (
                          <div className="flex flex-col gap-1">
                            {row.signalsLinked.map((sid) => {
                              const target = signalById.get(sid);
                              return target ? (
                                <button
                                  key={sid}
                                  type="button"
                                  onClick={() => onOpenSignal(sid)}
                                  className={`text-left font-medium underline decoration-[var(--ws-border-strong)] underline-offset-4 hover:decoration-current cursor-pointer break-all ${domainAccentTextClass(
                                    target.domain
                                  )}`}
                                >
                                  {sid}
                                </button>
                              ) : (
                                <span
                                  key={sid}
                                  className="text-[var(--ws-ink-muted)] break-all"
                                >
                                  {sid}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Stacked Editorial Ledger Rows */}
          <div className="divide-y divide-[var(--ws-border)] border-y border-[var(--ws-border-strong)] bg-[var(--ws-surface)] md:hidden">
            {visibleRows.map((row, idx) => (
              <article
                key={`mobile-${row.indicator}-${idx}`}
                className="p-4 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-[15px] font-semibold text-[var(--ws-ink)] leading-snug break-words">
                    {row.indicator}
                  </h3>
                  <span className="shrink-0 font-mono-tabular text-[11px] font-semibold text-[var(--ws-ink)]">
                    {row.nextCheckpoint}
                  </span>
                </div>
                <p className="text-[13px] leading-[1.6] text-[var(--ws-ink-secondary)] break-words">
                  {row.whyItMatters}
                </p>
                <div className="pt-1.5 border-t border-[var(--ws-border-subtle)] font-mono-tabular text-[11px]">
                  {row.signalsLinked.length === 0 ? (
                    <span className="text-[var(--ws-ink-muted)]">
                      {t.synthesis.watchlistUnlinked}
                    </span>
                  ) : (
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                      {row.signalsLinked.map((sid) => {
                        const target = signalById.get(sid);
                        return target ? (
                          <button
                            key={sid}
                            type="button"
                            onClick={() => onOpenSignal(sid)}
                            className={`font-medium underline underline-offset-4 cursor-pointer break-all ${domainAccentTextClass(
                              target.domain
                            )}`}
                          >
                            {sid}
                          </button>
                        ) : (
                          <span
                            key={sid}
                            className="text-[var(--ws-ink-muted)] break-all"
                          >
                            {sid}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-[var(--ws-surface)] border border-[var(--ws-border)] rounded-[var(--ws-radius-sm)] p-6">
          <SafeMarkdown content={rawMarkdown} onSelectSignal={onOpenSignal} />
        </div>
      )}
    </section>
  );
};
