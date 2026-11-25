import React, { useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  FileCode2,
  Moon,
  RefreshCw,
  Sun,
  X,
} from 'lucide-react';
import type { EditionIndexEntry, UiLanguage } from '../../types/edition';
import { getUiStrings } from '../../lib/i18n/uiStrings';
import { formatCompactTimestamp, formatEditionDate } from '../../lib/dates/formatDates';

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
}) => {
  const t = getUiStrings(lang);
  const panelRef = useRef<HTMLDivElement>(null);
  const dialogTitleId = React.useId();

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
      } else if (!event.shiftKey && (active === last || !panel?.contains(active))) {
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
  // Editions are sorted newest-first in editions-index.json
  const newerEdition = currentIdx > 0 ? editions[currentIdx - 1] : null;
  const olderEdition =
    currentIdx >= 0 && currentIdx < editions.length - 1
      ? editions[currentIdx + 1]
      : null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-[3px]"
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
        className="flex h-full w-full max-w-[440px] flex-col border-l border-[var(--ws-border-strong)] bg-[var(--ws-canvas)] shadow-[var(--ws-shadow-lg)]"
      >
        {/* Publication Archive Header */}
        <div className="border-b border-[var(--ws-border-strong)] bg-[var(--ws-surface)] px-5 py-4.5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5">
              <div className="font-mono-tabular text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[var(--ws-ink-muted)]">
                WORLD SIGNAL
              </div>
              <h2
                id={dialogTitleId}
                className="font-display text-[1.2rem] font-semibold tracking-[-0.015em] text-[var(--ws-ink)]"
              >
                {t.archive.title}
              </h2>
              <p className="text-[12px] text-[var(--ws-ink-muted)]">
                {t.archive.subtitle}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t.archive.close}
              className="rounded-[var(--ws-radius-sm)] p-1.5 text-[var(--ws-ink-muted)] hover:bg-[var(--ws-surface-subtle)] hover:text-[var(--ws-ink)] transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Archival Body */}
        <div className="flex-1 overflow-y-auto ws-scroll px-5 py-5 space-y-6">
          {/* Local Preview Banner */}
          {isLocalPreview && (
            <div className="ws-caution-panel p-3.5 space-y-2">
              <div className="font-mono-tabular text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ws-warn)]">
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

          {/* Reading Preferences: Appearance & Interface Language */}
          <section className="rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-surface)] p-4">
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <div className="mb-2 font-mono-tabular text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[var(--ws-ink-muted)]">
                  {t.archive.appearance}
                </div>
                <div className="grid grid-cols-2 rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-surface-subtle)] p-0.5">
                  <button
                    type="button"
                    onClick={() => onChangeTheme('light')}
                    className={`inline-flex min-h-[32px] items-center justify-center gap-1.5 rounded-[3px] px-2 py-1 text-xs font-medium transition-colors cursor-pointer ${
                      theme === 'light'
                        ? 'bg-[var(--ws-surface)] text-[var(--ws-ink)] shadow-xs font-semibold'
                        : 'text-[var(--ws-ink-muted)] hover:text-[var(--ws-ink)]'
                    }`}
                  >
                    <Sun className="h-3.5 w-3.5" />
                    {t.archive.lightMode}
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeTheme('dark')}
                    className={`inline-flex min-h-[32px] items-center justify-center gap-1.5 rounded-[3px] px-2 py-1 text-xs font-medium transition-colors cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-[var(--ws-surface)] text-[var(--ws-ink)] shadow-xs font-semibold'
                        : 'text-[var(--ws-ink-muted)] hover:text-[var(--ws-ink)]'
                    }`}
                  >
                    <Moon className="h-3.5 w-3.5" />
                    {t.archive.darkMode}
                  </button>
                </div>
              </div>

              <div>
                <div className="mb-2 font-mono-tabular text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[var(--ws-ink-muted)]">
                  {t.archive.interfaceLanguage}
                </div>
                <div className="grid grid-cols-2 rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-surface-subtle)] p-0.5">
                  <button
                    type="button"
                    onClick={() => onChangeLang('zh-CN')}
                    className={`min-h-[32px] rounded-[3px] px-2 py-1 text-xs font-medium transition-colors cursor-pointer ${
                      lang === 'zh-CN'
                        ? 'bg-[var(--ws-surface)] text-[var(--ws-ink)] shadow-xs font-semibold'
                        : 'text-[var(--ws-ink-muted)] hover:text-[var(--ws-ink)]'
                    }`}
                  >
                    中文
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeLang('en')}
                    className={`min-h-[32px] rounded-[3px] px-2 py-1 text-xs font-medium transition-colors cursor-pointer ${
                      lang === 'en'
                        ? 'bg-[var(--ws-surface)] text-[var(--ws-ink)] shadow-xs font-semibold'
                        : 'text-[var(--ws-ink-muted)] hover:text-[var(--ws-ink)]'
                    }`}
                  >
                    EN
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Archive Index & Same-Day Refresh */}
          <section className="space-y-3.5">
            <div className="flex items-center justify-between gap-2 border-b border-[var(--ws-border)] pb-2.5">
              <div className="font-mono-tabular text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ws-ink-muted)]">
                {t.archive.editionsCount(editions.length)}
              </div>
              <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="inline-flex min-h-[30px] items-center gap-1.5 rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-surface)] px-2.5 py-1 text-[11.5px] font-medium text-[var(--ws-ink)] hover:border-[var(--ws-border-strong)] disabled:opacity-50 transition-colors cursor-pointer"
              >
                <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? t.archive.refreshing : t.archive.refreshEdition}
              </button>
            </div>

            {refreshFeedback && (
              <p className="font-mono-tabular text-[11.5px] text-[var(--ws-ink-muted)]">
                {refreshFeedback}
              </p>
            )}

            {/* Previous / Next Edition Controls */}
            {editions.length > 1 && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={!olderEdition}
                  onClick={() => {
                    if (olderEdition) {
                      onSelectEdition(olderEdition);
                      onClose();
                    }
                  }}
                  className="inline-flex min-h-[36px] items-center justify-center gap-1.5 rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-surface)] px-3 py-1.5 text-xs font-medium text-[var(--ws-ink)] hover:border-[var(--ws-border-strong)] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-colors"
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
                  className="inline-flex min-h-[36px] items-center justify-center gap-1.5 rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-surface)] px-3 py-1.5 text-xs font-medium text-[var(--ws-ink)] hover:border-[var(--ws-border-strong)] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-colors"
                >
                  {t.archive.nextEdition}
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {editions.length === 0 ? (
              <p className="rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-surface)] p-4 text-sm text-[var(--ws-ink-muted)]">
                {t.archive.emptyArchive}
              </p>
            ) : (
              <ul className="space-y-2.5">
                {editions.map((entry) => {
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
                        className={`relative w-full overflow-hidden rounded-[var(--ws-radius-sm)] border p-4 text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'border-[var(--ws-rule-editorial)] bg-[var(--ws-surface)] shadow-[var(--ws-shadow-sm)]'
                            : 'border-[var(--ws-border)] bg-[var(--ws-surface)]/75 hover:border-[var(--ws-border-strong)] hover:bg-[var(--ws-surface)]'
                        }`}
                      >
                        {isSelected && (
                          <span
                            aria-hidden="true"
                            className="absolute inset-y-0 left-0 w-[3px] bg-[var(--ws-rule-editorial)]"
                          />
                        )}
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="font-display text-[1rem] font-semibold text-[var(--ws-ink)]">
                            {formatEditionDate(entry.date, lang)}
                          </span>
                          <span className="font-mono-tabular text-[11px] font-medium text-[var(--ws-ink-muted)] shrink-0">
                            {isLatest ? `${t.archive.latest} · ` : ''}
                            {t.editionStatus[entry.status] ?? entry.status}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-2 font-mono-tabular text-[11px] text-[var(--ws-ink-muted)]">
                          <span>{entry.date}</span>
                          <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">·</span>
                          <span>{formatCompactTimestamp(entry.updated_at, lang)}</span>
                        </div>
                        {entry.summary && (
                          <p className="mt-2.5 line-clamp-3 text-[12.5px] leading-[1.6] text-[var(--ws-ink-secondary)]">
                            {entry.summary}
                          </p>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Secondary Local Verification Utility */}
          <section className="border-t border-[var(--ws-border)] pt-5 space-y-2.5">
            <div className="font-mono-tabular text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[var(--ws-ink-muted)]">
              {t.archive.developerTools}
            </div>
            <p className="text-[12px] leading-relaxed text-[var(--ws-ink-muted)]">
              {t.archive.developerToolsHint}
            </p>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenLocalModal();
              }}
              className="inline-flex min-h-[38px] w-full items-center justify-center gap-2 rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-surface)] px-3.5 py-2 text-xs font-medium text-[var(--ws-ink)] hover:border-[var(--ws-border-strong)] hover:bg-[var(--ws-surface-hover)] transition-colors cursor-pointer"
            >
              <FileCode2 className="h-3.5 w-3.5 text-[var(--ws-ink-muted)]" />
              {t.archive.loadLocalMarkdown}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};
