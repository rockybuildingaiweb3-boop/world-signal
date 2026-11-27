import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  FileCode2,
  Moon,
  RefreshCw,
  Search,
  Sun,
  X,
} from 'lucide-react';
import type { EditionIndexEntry, UiLanguage } from '../../types/edition';
import { getUiStrings } from '../../lib/i18n/uiStrings';
import {
  formatCompactTimestamp,
  formatEditionDate,
} from '../../lib/dates/formatDates';

interface ArchiveDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  editions: EditionIndexEntry[];
  latestDate: string | null;
  selectedDate: string | null;
  onSelectEdition: (entry: EditionIndexEntry) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  refreshFeedback: string | null;
  theme: 'light' | 'dark';
  onChangeTheme: (next: 'light' | 'dark') => void;
  lang: UiLanguage;
  onChangeLang: (next: UiLanguage) => void;
  isLocalPreview: boolean;
  onExitLocalPreview: () => void;
  onOpenLocalModal: () => void;
  onOpenComparison: () => void;
}

export const ArchiveDrawer: React.FC<ArchiveDrawerProps> = ({
  isOpen,
  onClose,
  editions,
  latestDate,
  selectedDate,
  onSelectEdition,
  onRefresh,
  isRefreshing,
  refreshFeedback,
  theme,
  onChangeTheme,
  lang,
  onChangeLang,
  isLocalPreview,
  onExitLocalPreview,
  onOpenLocalModal,
  onOpenComparison,
}) => {
  const t = getUiStrings(lang);
  const panelRef = useRef<HTMLDivElement>(null);
  const dialogTitleId = React.useId();
  const [archiveQuery, setArchiveQuery] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setArchiveQuery('');
    }
  }, [isOpen]);

  const filteredEditions = useMemo(() => {
    const q = archiveQuery.trim().toLowerCase();
    if (!q) return editions;
    return editions.filter((entry) => {
      const statusLocalized = (
        t.editionStatus[entry.status] ?? entry.status
      ).toLowerCase();
      return (
        entry.date.toLowerCase().includes(q) ||
        entry.status.toLowerCase().includes(q) ||
        statusLocalized.includes(q) ||
        (entry.summary ?? '').toLowerCase().includes(q)
      );
    });
  }, [archiveQuery, editions, t.editionStatus]);

  useEffect(() => {
    if (!isOpen) return;

    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const getFocusable = () => {
      const panel = panelRef.current;
      if (!panel) return [];
      return Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter(
        (element) =>
          !element.hasAttribute('hidden') &&
          element.getAttribute('aria-hidden') !== 'true'
      );
    };

    const panel = panelRef.current;
    const firstFocusable = getFocusable()[0];
    (firstFocusable ?? panel)?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = getFocusable();
      if (focusable.length === 0) {
        event.preventDefault();
        panel?.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || !panel?.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (active === last || !panel?.contains(active))
      ) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentIdx = editions.findIndex((e) => e.date === selectedDate);
  const newerEdition = currentIdx > 0 ? editions[currentIdx - 1] : null;
  const olderEdition =
    currentIdx >= 0 && currentIdx < editions.length - 1
      ? editions[currentIdx + 1]
      : null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/55"
      role="dialog"
      aria-modal="true"
      aria-labelledby={dialogTitleId}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="flex h-full w-full max-w-[460px] flex-col border-l border-[var(--ws-border-strong)] bg-[var(--ws-canvas)] shadow-2xl"
      >
        {/* Editorial Publication Archive Header */}
        <div className="border-b-2 border-[var(--ws-ink)] bg-[var(--ws-surface)] px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="ws-kicker text-[var(--ws-editorial-accent)]">
                WORLD SIGNAL · {t.archive.editionsCount(editions.length)}
              </div>
              <h2
                id={dialogTitleId}
                className="font-display text-[24px] font-semibold tracking-[-0.02em] leading-tight text-[var(--ws-ink)]"
              >
                {t.archive.title}
              </h2>
              <p className="text-[12.5px] text-[var(--ws-ink-muted)]">
                {t.archive.subtitle}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t.archive.close}
              className="rounded-[var(--ws-radius-sm)] p-1.5 text-[var(--ws-ink-muted)] hover:bg-[var(--ws-surface-subtle)] hover:text-[var(--ws-ink)] transition-colors cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* Chronological Issue Archive Body (Foregrounded First) */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {isLocalPreview && (
            <div className="ws-caution-panel p-3.5 space-y-2">
              <div className="ws-kicker text-[var(--ws-warn)]">
                {t.archive.localPreviewActive}
              </div>
              {editions.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    onExitLocalPreview();
                    onClose();
                  }}
                  className="text-xs font-semibold text-[var(--ws-ink)] underline underline-offset-4 cursor-pointer"
                >
                  {t.archive.exitPreview}
                </button>
              )}
            </div>
          )}

          {/* Quick Edition Navigation & Comparison Actions */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {editions.length > 1 && (
                  <>
                    <button
                      type="button"
                      disabled={!olderEdition}
                      onClick={() => {
                        if (olderEdition) {
                          onSelectEdition(olderEdition);
                          onClose();
                        }
                      }}
                      className="inline-flex min-h-[34px] items-center gap-1 rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-surface)] px-2.5 py-1 text-[12px] font-medium text-[var(--ws-ink)] hover:border-[var(--ws-border-strong)] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      {t.archive.previousEdition}
                    </button>
                    <button
                      type="button"
                      disabled={!newerEdition}
                      onClick={() => {
                        if (newerEdition) {
                          onSelectEdition(newerEdition);
                          onClose();
                        }
                      }}
                      className="inline-flex min-h-[34px] items-center gap-1 rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-surface)] px-2.5 py-1 text-[12px] font-medium text-[var(--ws-ink)] hover:border-[var(--ws-border-strong)] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-colors"
                    >
                      {t.archive.nextEdition}
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="inline-flex min-h-[34px] items-center gap-1.5 rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-surface)] px-2.5 py-1 text-[12px] font-medium text-[var(--ws-ink)] hover:border-[var(--ws-border-strong)] disabled:opacity-50 transition-colors cursor-pointer"
              >
                <RefreshCw
                  className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`}
                />
                {isRefreshing ? t.archive.refreshing : t.archive.refreshEdition}
              </button>
            </div>

            {refreshFeedback && (
              <p className="font-mono-tabular text-[11.5px] text-[var(--ws-ink-muted)]">
                {refreshFeedback}
              </p>
            )}

            {editions.length > 1 && (
              <button
                type="button"
                data-testid="archive-compare-editions-btn"
                onClick={() => {
                  onClose();
                  onOpenComparison();
                }}
                className="inline-flex min-h-[36px] w-full items-center justify-center gap-2 rounded-[var(--ws-radius-sm)] border border-[var(--ws-border-strong)] bg-[var(--ws-surface)] px-3 py-1.5 text-[12.5px] font-semibold text-[var(--ws-ink)] hover:bg-[var(--ws-surface-hover)] transition-colors cursor-pointer"
              >
                <ArrowLeftRight className="h-3.5 w-3.5 text-[var(--ws-editorial-accent)]" />
                <span>{t.editionCompare.triggerButton}</span>
              </button>
            )}

            {editions.length > 0 && (
              <div className="space-y-1.5">
                <div className="relative">
                  <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--ws-ink-faint)]"
                  />
                  <input
                    type="search"
                    value={archiveQuery}
                    onChange={(e) => setArchiveQuery(e.target.value)}
                    placeholder={t.archive.searchPlaceholder}
                    aria-label={t.archive.searchPlaceholder}
                    className="w-full min-h-[38px] rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-surface)] py-1.5 pl-9 pr-8 text-[13px] text-[var(--ws-ink)] placeholder:text-[var(--ws-ink-faint)] focus:border-[var(--ws-border-strong)] focus:outline-none"
                  />
                  {archiveQuery.trim().length > 0 && (
                    <button
                      type="button"
                      onClick={() => setArchiveQuery('')}
                      aria-label={t.archive.close}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[var(--ws-ink-muted)] hover:text-[var(--ws-ink)] cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                {archiveQuery.trim().length > 0 && (
                  <div className="font-mono-tabular text-[11.5px] text-[var(--ws-ink-muted)]">
                    {t.archive.matchingCount(
                      filteredEditions.length,
                      editions.length
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Chronological Edition Ledger */}
          {editions.length === 0 ? (
            <p className="border-y border-[var(--ws-border)] bg-[var(--ws-surface)] p-4 text-sm text-[var(--ws-ink-muted)]">
              {t.archive.emptyArchive}
            </p>
          ) : filteredEditions.length === 0 ? (
            <p className="border-y border-[var(--ws-border)] bg-[var(--ws-surface)] p-4 text-xs text-[var(--ws-ink-muted)]">
              {t.archive.noMatchingEditions}
            </p>
          ) : (
            <ul className="border-t-2 border-b border-[var(--ws-border-strong)] bg-[var(--ws-surface)] divide-y divide-[var(--ws-border)]">
              {filteredEditions.map((entry) => {
                const isSelected = !isLocalPreview && entry.date === selectedDate;
                const isLatest = entry.date === latestDate;
                return (
                  <li key={`${entry.date}-${entry.path}`}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectEdition(entry);
                        onClose();
                      }}
                      className={`relative w-full px-4 py-4 text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[var(--ws-surface-subtle)]'
                          : 'hover:bg-[var(--ws-surface-hover)]/70'
                      }`}
                    >
                      {isSelected && (
                        <span
                          aria-hidden="true"
                          className="absolute inset-x-0 top-0 h-[2.5px] bg-[var(--ws-editorial-accent)]"
                        />
                      )}
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-display text-[17.5px] font-semibold tracking-[-0.015em] text-[var(--ws-ink)]">
                          {formatEditionDate(entry.date, lang)}
                        </span>
                        <span
                          className={`text-[11.5px] font-semibold shrink-0 ${
                            isLatest
                              ? 'text-[var(--ws-editorial-accent)]'
                              : 'text-[var(--ws-ink-muted)]'
                          }`}
                        >
                          {isLatest ? `${t.archive.latest} · ` : ''}
                          {t.editionStatus[entry.status] ?? entry.status}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2 font-mono-tabular text-[11.5px] text-[var(--ws-ink-muted)]">
                        <span>{entry.date}</span>
                        <span
                          aria-hidden="true"
                          className="text-[var(--ws-ink-faint)]"
                        >
                          ·
                        </span>
                        <span>
                          {formatCompactTimestamp(entry.updated_at, lang)}
                        </span>
                      </div>
                      {entry.summary && (
                        <p className="mt-2 line-clamp-2 text-[13px] leading-[1.6] text-[var(--ws-ink-secondary)]">
                          {entry.summary}
                        </p>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Quiet Local Verification Utility */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenLocalModal();
              }}
              className="inline-flex items-center gap-2 text-[12.5px] font-medium text-[var(--ws-ink-muted)] hover:text-[var(--ws-ink)] transition-colors cursor-pointer"
            >
              <FileCode2 className="h-3.5 w-3.5" />
              <span>{t.archive.loadLocalMarkdown}</span>
            </button>
          </div>
        </div>

        {/* Quiet Docked Reader Preferences Bar (Theme & Language) */}
        <div className="border-t border-[var(--ws-border-strong)] bg-[var(--ws-surface)] px-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--ws-ink-muted)]">
                {t.archive.appearance}
              </div>
              <div className="grid grid-cols-2 rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-surface-subtle)] p-0.5">
                <button
                  type="button"
                  onClick={() => onChangeTheme('light')}
                  className={`inline-flex min-h-[32px] items-center justify-center gap-1.5 rounded-[2px] px-2 py-1 text-[12px] font-medium transition-colors cursor-pointer ${
                    theme === 'light'
                      ? 'bg-[var(--ws-surface)] text-[var(--ws-ink)] font-semibold'
                      : 'text-[var(--ws-ink-muted)] hover:text-[var(--ws-ink)]'
                  }`}
                >
                  <Sun className="h-3.5 w-3.5" />
                  {t.archive.lightMode}
                </button>
                <button
                  type="button"
                  onClick={() => onChangeTheme('dark')}
                  className={`inline-flex min-h-[32px] items-center justify-center gap-1.5 rounded-[2px] px-2 py-1 text-[12px] font-medium transition-colors cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-[var(--ws-surface)] text-[var(--ws-ink)] font-semibold'
                      : 'text-[var(--ws-ink-muted)] hover:text-[var(--ws-ink)]'
                  }`}
                >
                  <Moon className="h-3.5 w-3.5" />
                  {t.archive.darkMode}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--ws-ink-muted)]">
                {t.archive.interfaceLanguage}
              </div>
              <div className="grid grid-cols-2 rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-surface-subtle)] p-0.5">
                <button
                  type="button"
                  onClick={() => onChangeLang('zh-CN')}
                  className={`min-h-[32px] rounded-[2px] px-2 py-1 text-[12px] font-medium transition-colors cursor-pointer ${
                    lang === 'zh-CN'
                      ? 'bg-[var(--ws-surface)] text-[var(--ws-ink)] font-semibold'
                      : 'text-[var(--ws-ink-muted)] hover:text-[var(--ws-ink)]'
                  }`}
                >
                  中文
                </button>
                <button
                  type="button"
                  onClick={() => onChangeLang('en')}
                  className={`min-h-[32px] rounded-[2px] px-2 py-1 text-[12px] font-medium transition-colors cursor-pointer ${
                    lang === 'en'
                      ? 'bg-[var(--ws-surface)] text-[var(--ws-ink)] font-semibold'
                      : 'text-[var(--ws-ink-muted)] hover:text-[var(--ws-ink)]'
                  }`}
                >
                  EN
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
