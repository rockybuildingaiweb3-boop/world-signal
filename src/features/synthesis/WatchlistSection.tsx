import React from 'react';
import type {
  ParsedSignal,
  UiLanguage,
  WatchlistRow,
} from '../../types/edition';
import { getUiStrings } from '../../lib/i18n/uiStrings';
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

  return (
    <section className="space-y-5 border-t border-[var(--ws-border)] pt-8">
      <div className="space-y-1">
        <h2 className="font-display text-xl font-semibold text-[var(--ws-ink)]">
          {t.synthesis.watchlistTitle}
        </h2>
        <p className="text-xs text-[var(--ws-ink-muted)]">
          {t.synthesis.watchlistSubtitle}
        </p>
      </div>

      {rows.length > 0 ? (
        <>
          {/* Desktop / Tablet Table */}
          <div className="hidden md:block ws-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-[var(--ws-surface-subtle)] font-mono-tabular text-[11px] uppercase tracking-wider text-[var(--ws-ink-muted)]">
                  <tr>
                    <th className="border-b border-[var(--ws-border)] px-4 py-3 w-[25%]">
                      {t.synthesis.watchlistCols.indicator}
                    </th>
                    <th className="border-b border-[var(--ws-border)] px-4 py-3 w-[37%]">
                      {t.synthesis.watchlistCols.whyItMatters}
                    </th>
                    <th className="border-b border-[var(--ws-border)] px-4 py-3 w-[16%]">
                      {t.synthesis.watchlistCols.nextCheckpoint}
                    </th>
                    <th className="border-b border-[var(--ws-border)] px-4 py-3 w-[22%]">
                      {t.synthesis.watchlistCols.signalsLinked}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--ws-border)] text-[13.5px]">
                  {rows.map((row, idx) => (
                    <tr
                      key={`${row.indicator}-${idx}`}
                      className="hover:bg-[var(--ws-surface-elevated)]"
                    >
                      <td className="px-4 py-3.5 align-top font-medium text-[var(--ws-ink)] break-words">
                        {row.indicator}
                      </td>
                      <td className="px-4 py-3.5 align-top text-[var(--ws-ink-secondary)] leading-relaxed break-words">
                        {row.whyItMatters}
                      </td>
                      <td className="px-4 py-3.5 align-top font-mono-tabular text-xs font-medium text-[var(--ws-ink)]">
                        {row.nextCheckpoint}
                      </td>
                      <td className="px-4 py-3.5 align-top font-mono-tabular text-xs">
                        {row.signalsLinked.length === 0 ? (
                          <span className="text-[var(--ws-ink-muted)]">
                            {t.synthesis.watchlistUnlinked}
                          </span>
                        ) : (
                          <div className="flex flex-col gap-1">
                            {row.signalsLinked.map((sid) =>
                              signalById.has(sid) ? (
                                <button
                                  key={sid}
                                  type="button"
                                  onClick={() => onOpenSignal(sid)}
                                  className="text-left text-[var(--ws-world)] underline decoration-[var(--ws-border-strong)] underline-offset-2 hover:decoration-current cursor-pointer break-all"
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
                              )
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Stacked Cards */}
          <div className="space-y-3 md:hidden">
            {rows.map((row, idx) => (
              <article
                key={`mobile-${row.indicator}-${idx}`}
                className="ws-card p-4 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-[var(--ws-ink)] leading-snug break-words">
                    {row.indicator}
                  </h3>
                  <span className="shrink-0 font-mono-tabular text-[11px] font-medium text-[var(--ws-ink-muted)]">
                    {row.nextCheckpoint}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-[var(--ws-ink-secondary)] break-words">
                  {row.whyItMatters}
                </p>
                <div className="pt-1 border-t border-[var(--ws-border)] font-mono-tabular text-[11px]">
                  {row.signalsLinked.length === 0 ? (
                    <span className="text-[var(--ws-ink-muted)]">
                      {t.synthesis.watchlistUnlinked}
                    </span>
                  ) : (
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                      {row.signalsLinked.map((sid) =>
                        signalById.has(sid) ? (
                          <button
                            key={sid}
                            type="button"
                            onClick={() => onOpenSignal(sid)}
                            className="text-[var(--ws-world)] underline underline-offset-2 cursor-pointer break-all"
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
                        )
                      )}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </>
      ) : (
        <div className="ws-card p-6">
          <SafeMarkdown content={rawMarkdown} onSelectSignal={onOpenSignal} />
        </div>
      )}
    </section>
  );
};
