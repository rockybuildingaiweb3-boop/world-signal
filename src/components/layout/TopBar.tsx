import React from 'react';
import {
  Archive,
  Bookmark,
  FileSearch,
  Globe2,
  Network,
  Search,
  ShieldCheck,
} from 'lucide-react';
import type { UiLanguage, ViewId } from '../../types/edition';
import { getUiStrings } from '../../lib/i18n/uiStrings';

interface TopBarProps {
  activeView: ViewId;
  onSelectView: (view: ViewId) => void;
  activeEditionDate: string | null;
  isLocalPreview: boolean;
  onOpenArchive: () => void;
  onOpenSearch: () => void;
  onOpenReaderDesk: () => void;
  deskBadgeCount?: number;
  hasCatchUpChanges?: boolean;
  lang: UiLanguage;
}

const NAV_ITEMS: Array<{
  id: ViewId;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'briefing', icon: Globe2 },
  { id: 'expanded', icon: FileSearch },
  { id: 'synthesis', icon: Network },
  { id: 'audit', icon: ShieldCheck },
];

export const TopBar: React.FC<TopBarProps> = ({
  activeView,
  onSelectView,
  activeEditionDate,
  isLocalPreview,
  onOpenArchive,
  onOpenSearch,
  onOpenReaderDesk,
  deskBadgeCount = 0,
  hasCatchUpChanges = false,
  lang,
}) => {
  const t = getUiStrings(lang);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-[var(--ws-border)] bg-[var(--ws-canvas)]/96 backdrop-blur-xs">
        <div className="mx-auto flex h-[62px] max-w-[1480px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {/* Editorial Publication Nameplate Wordmark */}
          <button
            type="button"
            onClick={() => onSelectView('briefing')}
            className="flex items-center gap-2.5 text-left group cursor-pointer shrink-0"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="text-[var(--ws-ink)] shrink-0 transition-transform duration-300 group-hover:rotate-12"
            >
              <circle
                cx="12"
                cy="12"
                r="9.5"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <ellipse
                cx="12"
                cy="12"
                rx="4.4"
                ry="9.5"
                stroke="currentColor"
                strokeWidth="1.15"
              />
              <line
                x1="2.5"
                y1="12"
                x2="21.5"
                y2="12"
                stroke="currentColor"
                strokeWidth="1.15"
              />
              <circle cx="12" cy="12" r="2" fill="var(--ws-editorial-accent)" />
            </svg>
            <span className="font-display text-[19px] sm:text-[21px] font-bold tracking-[0.06em] text-[var(--ws-ink)] whitespace-nowrap leading-none">
              WORLD SIGNAL
            </span>
          </button>

          {/* Desktop 4-View Editorial Navigation */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-4 lg:gap-7 h-full"
          >
            {NAV_ITEMS.map(({ id }) => {
              const isActive = activeView === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSelectView(id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative inline-flex h-full items-center px-0.5 text-[13.5px] lg:text-[14px] tracking-[0.01em] transition-colors cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'font-semibold text-[var(--ws-ink)]'
                      : 'font-medium text-[var(--ws-ink-muted)] hover:text-[var(--ws-ink)]'
                  }`}
                >
                  {t.nav[id]}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 bottom-0 h-[2.5px] bg-[var(--ws-editorial-accent)]"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Compact Single-Line Utility Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              data-testid="topbar-search-trigger"
              onClick={onOpenSearch}
              aria-label={`${t.globalSearch.triggerLabel} (${t.globalSearch.shortcutHint})`}
              className="inline-flex h-[36px] items-center gap-2 rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-surface)] px-2.5 sm:px-3 text-[12.5px] font-medium text-[var(--ws-ink-secondary)] hover:border-[var(--ws-border-strong)] hover:text-[var(--ws-ink)] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Search className="h-3.5 w-3.5 text-[var(--ws-ink-muted)] shrink-0" />
              <span className="hidden xl:inline">{t.globalSearch.triggerLabel}</span>
              <kbd className="hidden lg:inline-block font-mono-tabular text-[10.5px] text-[var(--ws-ink-muted)] border-l border-[var(--ws-border-subtle)] pl-1.5">
                {t.globalSearch.shortcutHint}
              </kbd>
            </button>

            <button
              type="button"
              data-testid="topbar-desk-trigger"
              onClick={onOpenReaderDesk}
              aria-label={t.readerDesk.dialogTitle}
              className="relative inline-flex h-[36px] items-center gap-1.5 rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-surface)] px-2.5 sm:px-3 text-[12.5px] font-medium text-[var(--ws-ink-secondary)] hover:border-[var(--ws-border-strong)] hover:text-[var(--ws-ink)] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Bookmark className="h-3.5 w-3.5 text-[var(--ws-ink-muted)] shrink-0" />
              <span className="hidden xl:inline">{t.readerDesk.triggerLabel}</span>
              {deskBadgeCount > 0 && (
                <span className="font-mono-tabular text-[11px] font-semibold text-[var(--ws-ink)]">
                  {deskBadgeCount}
                </span>
              )}
              {hasCatchUpChanges && (
                <span
                  aria-label={t.catchUp.title}
                  className="h-1.5 w-1.5 rounded-full bg-[var(--ws-editorial-accent)] shrink-0"
                />
              )}
            </button>

            <button
              type="button"
              data-testid="topbar-archive-trigger"
              onClick={onOpenArchive}
              aria-label={t.archive.button}
              className="inline-flex h-[36px] items-center gap-2 rounded-[var(--ws-radius-sm)] border border-[var(--ws-border-strong)] bg-[var(--ws-surface)] px-2.5 sm:px-3 text-[12.5px] font-medium text-[var(--ws-ink)] hover:bg-[var(--ws-surface-hover)] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Archive className="h-3.5 w-3.5 text-[var(--ws-ink-muted)] shrink-0" />
              <span className="hidden sm:inline">{t.archive.button}</span>
              {isLocalPreview ? (
                <span className="font-mono-tabular text-[11.5px] font-semibold text-[var(--ws-warn)] border-l border-[var(--ws-border)] pl-2">
                  LOCAL
                </span>
              ) : activeEditionDate ? (
                <span className="font-mono-tabular text-[11.5px] text-[var(--ws-ink-muted)] border-l border-[var(--ws-border)] pl-2 hidden lg:inline">
                  {activeEditionDate}
                </span>
              ) : null}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Editorial Navigation Bar */}
      <nav
        aria-label="Mobile primary navigation"
        className="fixed inset-x-0 bottom-0 z-30 flex md:hidden border-t border-[var(--ws-border-strong)] bg-[var(--ws-canvas)]/98 pb-[env(safe-area-inset-bottom)]"
      >
        {NAV_ITEMS.map(({ id, icon: Icon }) => {
          const isActive = activeView === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelectView(id)}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'text-[var(--ws-ink)] font-semibold'
                  : 'text-[var(--ws-ink-muted)]'
              }`}
            >
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-4 top-0 h-[2px] bg-[var(--ws-editorial-accent)]"
                />
              )}
              <Icon className="h-4 w-4" />
              <span>{t.navShort[id]}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
