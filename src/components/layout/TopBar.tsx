import React, { useEffect, useState } from 'react';
import {
  Archive,
  Bookmark,
  FileSearch,
  Globe2,
  Moon,
  Network,
  Search,
  ShieldCheck,
  Sun,
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
  onChangeLang: (lang: UiLanguage) => void;
  theme: 'light' | 'dark';
  onChangeTheme: (theme: 'light' | 'dark') => void;
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
  onChangeLang,
  theme,
  onChangeTheme,
}) => {
  const t = getUiStrings(lang);
  const [scrolledPastMasthead, setScrolledPastMasthead] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolledPastMasthead(window.scrollY > 108);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const deferDesktopWordmark =
    activeView === 'briefing' && !scrolledPastMasthead;

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-[var(--ws-border)] bg-[var(--ws-canvas)]/95 backdrop-blur-sm">
        <div className="mx-auto flex h-[54px] max-w-[1480px] items-center justify-between gap-2 sm:gap-3 lg:gap-4 px-3 sm:px-5 lg:px-8">
          {/* Editorial Publication Nameplate Wordmark */}
          <button
            type="button"
            onClick={() => onSelectView('briefing')}
            aria-label="WORLD SIGNAL"
            className="flex items-center gap-1.5 sm:gap-2.5 text-left group cursor-pointer shrink-0"
          >
            <svg
              width="18"
              height="18"
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
            <span
              className={`font-display text-[14px] sm:text-[15px] lg:text-[15.5px] font-semibold tracking-[0.08em] sm:tracking-[0.11em] text-[var(--ws-ink)] whitespace-nowrap leading-none ${
                deferDesktopWordmark ? 'lg:hidden' : ''
              }`}
            >
              WORLD SIGNAL
            </span>
            {deferDesktopWordmark && (
              <span className="hidden lg:inline-flex items-center gap-2 ws-kicker text-[11px] text-[var(--ws-ink-muted)] whitespace-nowrap">
                <span>{lang === 'zh-CN' ? '每日简报' : 'DAILY EDITION'}</span>
                {activeEditionDate && (
                  <>
                    <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">
                      ·
                    </span>
                    <span className="font-mono-tabular font-semibold text-[var(--ws-ink)]">
                      {activeEditionDate}
                    </span>
                  </>
                )}
              </span>
            )}
          </button>

          {/* Desktop 4-View Editorial Navigation */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-3.5 lg:gap-7 h-full"
          >
            {NAV_ITEMS.map(({ id }) => {
              const isActive = activeView === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSelectView(id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`group relative inline-flex h-full items-center px-0.5 text-[13px] lg:text-[14px] tracking-[0.012em] transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'font-semibold text-[var(--ws-ink)]'
                      : 'font-medium text-[var(--ws-ink-muted)] hover:text-[var(--ws-ink)]'
                  }`}
                >
                  {t.nav[id]}
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-0 bottom-0 h-[2.5px] transition-opacity duration-200 ${
                      isActive
                        ? 'bg-[var(--ws-editorial-accent)] opacity-100'
                        : 'bg-[var(--ws-border-strong)] opacity-0 group-hover:opacity-55'
                    }`}
                  />
                </button>
              );
            })}
          </nav>

          {/* Cohesive Editorial Utility Cluster (Hairline-Separated, Non-Boxy) */}
          <div className="flex items-center gap-0.5 lg:gap-1 shrink-0">
            <button
              type="button"
              data-testid="topbar-search-trigger"
              onClick={onOpenSearch}
              aria-label={`${t.globalSearch.triggerLabel} (${t.globalSearch.shortcutHint})`}
              className="inline-flex h-[32px] items-center gap-1.5 rounded-[var(--ws-radius-sm)] px-1.5 sm:px-2 lg:px-2.5 text-[12.5px] font-medium text-[var(--ws-ink-secondary)] hover:bg-[var(--ws-surface-subtle)] hover:text-[var(--ws-ink)] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Search className="h-3.5 w-3.5 text-[var(--ws-ink-muted)] shrink-0" />
              <span className="hidden xl:inline">{t.globalSearch.triggerLabel}</span>
              <kbd className="hidden lg:inline-block font-mono-tabular text-[10.5px] text-[var(--ws-ink-faint)] pl-0.5">
                {t.globalSearch.shortcutHint}
              </kbd>
            </button>

            <span
              aria-hidden="true"
              className="hidden lg:block h-3.5 w-px bg-[var(--ws-border)] mx-0.5"
            />

            <button
              type="button"
              data-testid="topbar-desk-trigger"
              onClick={onOpenReaderDesk}
              aria-label={t.readerDesk.dialogTitle}
              className="relative inline-flex h-[32px] items-center gap-1.5 rounded-[var(--ws-radius-sm)] px-1.5 sm:px-2 lg:px-2.5 text-[12.5px] font-medium text-[var(--ws-ink-secondary)] hover:bg-[var(--ws-surface-subtle)] hover:text-[var(--ws-ink)] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Bookmark
                className={`h-3.5 w-3.5 shrink-0 ${
                  hasCatchUpChanges
                    ? 'text-[var(--ws-editorial-accent)]'
                    : 'text-[var(--ws-ink-muted)]'
                }`}
              />
              <span className="hidden xl:inline">{t.readerDesk.triggerLabel}</span>
              {deskBadgeCount > 0 && (
                <span
                  className={`font-mono-tabular text-[11px] font-semibold ${
                    hasCatchUpChanges
                      ? 'text-[var(--ws-editorial-accent)]'
                      : 'text-[var(--ws-ink)]'
                  }`}
                >
                  {deskBadgeCount}
                </span>
              )}
              {hasCatchUpChanges && deskBadgeCount === 0 && (
                <span className="sr-only">{t.catchUp.title}</span>
              )}
            </button>

            <span
              aria-hidden="true"
              className="hidden lg:block h-3.5 w-px bg-[var(--ws-border)] mx-0.5"
            />

            {/* Quick Bilingual Switch (EN / 中文) */}
            <button
              type="button"
              data-testid="topbar-lang-toggle"
              onClick={() => onChangeLang(lang === 'en' ? 'zh-CN' : 'en')}
              aria-label={lang === 'en' ? '切换至中文界面' : 'Switch interface to English'}
              title={lang === 'en' ? '切换至中文' : 'Switch to English'}
              className="inline-flex h-[32px] items-center justify-center rounded-[var(--ws-radius-sm)] px-1.5 sm:px-2 text-[11.5px] font-semibold tracking-[0.02em] text-[var(--ws-ink-secondary)] hover:bg-[var(--ws-surface-subtle)] hover:text-[var(--ws-ink)] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {lang === 'en' ? '中文' : 'EN'}
            </button>

            {/* Quick Light / Dark Editorial Theme Toggle */}
            <button
              type="button"
              data-testid="topbar-theme-toggle"
              onClick={() => onChangeTheme(theme === 'light' ? 'dark' : 'light')}
              aria-label={
                theme === 'light'
                  ? lang === 'zh-CN'
                    ? '切换深色阅读模式'
                    : 'Switch to dark mode'
                  : lang === 'zh-CN'
                    ? '切换浅色纸面模式'
                    : 'Switch to light mode'
              }
              title={
                theme === 'light'
                  ? lang === 'zh-CN'
                    ? '深色模式'
                    : 'Dark edition'
                  : lang === 'zh-CN'
                    ? '浅色纸面'
                    : 'Light paper'
              }
              className="inline-flex h-[32px] w-[28px] sm:w-[32px] items-center justify-center rounded-[var(--ws-radius-sm)] text-[var(--ws-ink-muted)] hover:bg-[var(--ws-surface-subtle)] hover:text-[var(--ws-ink)] transition-colors cursor-pointer shrink-0"
            >
              {theme === 'light' ? (
                <Moon className="h-3.5 w-3.5" />
              ) : (
                <Sun className="h-3.5 w-3.5" />
              )}
            </button>

            <span
              aria-hidden="true"
              className="hidden lg:block h-3.5 w-px bg-[var(--ws-border)] mx-0.5"
            />

            <button
              type="button"
              data-testid="topbar-archive-trigger"
              onClick={onOpenArchive}
              aria-label={t.archive.button}
              className="inline-flex h-[32px] items-center gap-1.5 lg:gap-2 rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-surface)] px-2 lg:px-3 text-[12.5px] font-medium text-[var(--ws-ink)] hover:border-[var(--ws-border-strong)] hover:bg-[var(--ws-surface-subtle)] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Archive className="h-3.5 w-3.5 text-[var(--ws-ink-muted)] shrink-0" />
              <span className="hidden lg:inline">{t.archive.button}</span>
              {isLocalPreview ? (
                <span className="font-mono-tabular text-[11px] font-semibold text-[var(--ws-warn)] border-l border-[var(--ws-border)] pl-2">
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
        className="fixed inset-x-0 bottom-0 z-30 flex md:hidden border-t border-[var(--ws-border-strong)] bg-[var(--ws-canvas)]/96 backdrop-blur-sm pb-[env(safe-area-inset-bottom)]"
      >
        {NAV_ITEMS.map(({ id, icon: Icon }) => {
          const isActive = activeView === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelectView(id)}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[11px] transition-colors cursor-pointer ${
                isActive
                  ? 'text-[var(--ws-ink)] font-semibold'
                  : 'text-[var(--ws-ink-muted)] font-medium'
              }`}
            >
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-5 top-0 h-[2px] bg-[var(--ws-editorial-accent)]"
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
