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
import { formatCompactTimestamp } from '../../lib/dates/formatDates';

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

    const previousFocus = document.activeElement instanceof HTMLElement
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
      ).filter((element) => !element.hasAttribute('hidden') && element.getAttribute('aria-hidden') !== 'true');
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
  const olderEdition = currentIdx >= 0 && currentIdx < editions.length - 1 ? editions[currentIdx + 1] : null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-[2px]"
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
        className="flex h-full w-full max-w-md flex-col border-l border-[var(--ws-border)] bg-[var(--ws-surface)] shadow-xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[var(--ws-border)] px-5 py-4">
          <div>
            <h2 id={dialogTitleId} className="font-display text-lg font-semibold text-[var(--ws-ink)]">
              {t.archive.title}
            </h2>
            <p className="mt-0.5 text-xs text-[var(--ws-ink-muted)]">
              {t.archive.subtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.archive.close}
            className="rounded-md p-1.5 text-[var(--ws-ink-muted)] hover:bg-[var(--ws-surface-subtle)] hover:text-[var(--ws-ink)] cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto ws-scroll px-5 py-5 space-y-6">
          {/* Local Preview Banner */}
          {isLocalPreview && (
            <div className="rounded-md border border-[var(--ws-warn-border)] bg-[var(--ws-warn-soft)] p-3.5 space-y-2">
              <div className="text-xs font-semibold text-[var(--ws-warn)]">
                {t.archive.localPreviewActive}
              </div>
              {editions.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    onExitLocalPreview();
                    onClose();
                  }}
                  className="text-xs font-medium text-[var(--ws-ink)] underline underline-offset-2 cursor-pointer"
                >
                  {t.archive.exitPreview}
                </button>
              )}
            </div>
          )}

          {/* Preferences: Appearance & Interface Language */}
          <section className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="mb-1.5 font-mono-tabular text-[11px] uppercase tracking-wider text-[var(--ws-ink-muted)]">
                  {t.archive.appearance}
                </div>
                <div className="grid grid-cols-2 rounded-md border border-[var(--ws-border)] bg-[var(--ws-surface-subtle)] p-0.5">
                  <button
                    type="button"
                    onClick={() => onChangeTheme('light')}
                    className={`inline-flex items-center justify-center gap-1.5 rounded px-2 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                      theme === 'light'
                        ? 'bg-[var(--ws-surface)] text-[var(--ws-ink)] shadow-xs'
                        : 'text-[var(--ws-ink-muted)] hover:text-[var(--ws-ink)]'
                    }`}
                  >
                    <Sun className="h-3.5 w-3.5" />
                    {t.archive.lightMode}
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeTheme('dark')}
                    className={`inline-flex items-center justify-center gap-1.5 rounded px-2 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-[var(--ws-surface)] text-[var(--ws-ink)] shadow-xs'
                        : 'text-[var(--ws-ink-muted)] hover:text-[var(--ws-ink)]'
                    }`}
                  >
                    <Moon className="h-3.5 w-3.5" />
                    {t.archive.darkMode}
                  </button>
                </div>
              </div>

              <div>
                <div className="mb-1.5 font-mono-tabular text-[11px] uppercase tracking-wider text-[var(--ws-ink-muted)]">
                  {t.archive.interfaceLanguage}
                </div>
                <div className="grid grid-cols-2 rounded-md border border-[var(--ws-border)] bg-[var(--ws-surface-subtle)] p-0.5">
                  <button
                    type="button"
                    onClick={() => onChangeLang('zh-CN')}
                    className={`rounded px-2 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                      lang === 'zh-CN'
                        ? 'bg-[var(--ws-surface)] text-[var(--ws-ink)] shadow-xs'
                        : 'text-[var(--ws-ink-muted)] hover:text-[var(--ws-ink)]'
                    }`}
                  >
                    中文
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeLang('en')}
                    className={`rounded px-2 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                      lang === 'en'
                        ? 'bg-[var(--ws-surface)] text-[var(--ws-ink)] shadow-xs'
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
          <section className="space-y-3 border-t border-[var(--ws-border)] pt-5">
            <div className="flex items-center justify-between gap-2">
              <div className="font-mono-tabular text-[11px] uppercase tracking-wider text-[var(--ws-ink-muted)]">
                {t.archive.editionsCount(editions.length)}
              </div>
              <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 rounded-md border border-[var(--ws-border)] px-2.5 py-1 text-xs font-medium text-[var(--ws-ink)] hover:border-[var(--ws-border-strong)] disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? t.archive.refreshing : t.archive.refreshEdition}
              </button>
            </div>

            {refreshFeedback && (
              <p className="text-xs text-[var(--ws-ink-muted)]">{refreshFeedback}</p>
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
                  className="inline-flex items-center justify-center gap-1.5 rounded-md border border-[var(--ws-border)] px-3 py-2 text-xs font-medium text-[var(--ws-ink)] hover:border-[var(--ws-border-strong)] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
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
                  className="inline-flex items-center justify-center gap-1.5 rounded-md border border-[var(--ws-border)] px-3 py-2 text-xs font-medium text-[var(--ws-ink)] hover:border-[var(--ws-border-strong)] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                >
                  {t.archive.nextEdition}
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {editions.length === 0 ? (
              <p className="rounded-md border border-[var(--ws-border)] bg-[var(--ws-surface-subtle)] p-4 text-sm text-[var(--ws-ink-muted)]">
                {t.archive.emptyArchive}
              </p>
            ) : (
              <ul className="space-y-2">
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
                        className={`w-full rounded-md border p-3.5 text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'border-[var(--ws-ink)] bg-[var(--ws-surface-subtle)]'
                            : 'border-[var(--ws-border)] bg-[var(--ws-surface)] hover:border-[var(--ws-border-strong)]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 font-mono-tabular text-xs">
                          <span className="font-semibold text-[var(--ws-ink)]">
                            {entry.date}
                          </span>
                          <span className="text-[11px] text-[var(--ws-ink-muted)]">
                            {isLatest ? `${t.archive.latest} · ` : ''}
                            {t.editionStatus[entry.status] ?? entry.status}
                          </span>
                        </div>
                        <div className="mt-1 font-mono-tabular text-[11px] text-[var(--ws-ink-muted)]">
                          {formatCompactTimestamp(entry.updated_at, lang)}
                        </div>
                        {entry.summary && (
                          <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-[var(--ws-ink-secondary)]">
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

          {/* Secondary Developer Utility (Explicitly separated from reader workflow) */}
          <section className="border-t border-[var(--ws-border)] pt-5 space-y-2.5">
            <div className="font-mono-tabular text-[11px] uppercase tracking-wider text-[var(--ws-ink-muted)]">
              {t.archive.developerTools}
            </div>
            <p className="text-xs leading-relaxed text-[var(--ws-ink-muted)]">
              {t.archive.developerToolsHint}
            </p>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenLocalModal();
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-[var(--ws-border)] bg-[var(--ws-surface-subtle)] px-3.5 py-2 text-xs font-medium text-[var(--ws-ink)] hover:border-[var(--ws-border-strong)] cursor-pointer"
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
