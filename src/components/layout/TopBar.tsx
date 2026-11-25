import React, { useEffect, useState } from 'react';
import {
  Archive,
  BookOpen,
  Compass,
  Newspaper,
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
  lang: UiLanguage;
}

const VIEWS: readonly ViewId[] = ['briefing', 'expanded', 'synthesis', 'audit'];

function viewIcon(viewId: ViewId) {
  switch (viewId) {
    case 'briefing':
      return Newspaper;
    case 'expanded':
      return BookOpen;
    case 'synthesis':
      return Compass;
    case 'audit':
      return ShieldCheck;
  }
}

export const TopBar: React.FC<TopBarProps> = ({
  activeView,
  onSelectView,
  activeEditionDate,
  isLocalPreview,
  onOpenArchive,
  lang,
}) => {
  const t = getUiStrings(lang);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let rafId: number | null = null;
    const updateProgress = () => {
      rafId = null;
      const doc = document.documentElement;
      const maxScroll = doc.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) {
        setScrollProgress(0);
        return;
      }
      setScrollProgress(Math.min(1, Math.max(0, window.scrollY / maxScroll)));
    };
    const onScroll = () => {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(updateProgress);
      }
    };
    updateProgress();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, [activeView, activeEditionDate]);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-[var(--ws-border)] bg-[var(--ws-canvas)]/95 backdrop-blur-[8px]">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6">
          {/* Compact Single-Row Publication Masthead Bar (48px mobile, 60px desktop) */}
          <div className="flex h-12 md:h-[60px] items-center justify-between gap-2 sm:gap-4">
            {/* Zone 1: Publication Masthead Lockup */}
            <button
              type="button"
              onClick={() => onSelectView('briefing')}
              className="flex items-center gap-2 sm:gap-2.5 text-left group cursor-pointer shrink-0 transition-opacity duration-150 hover:opacity-80"
              aria-label="WORLD SIGNAL"
            >
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                className="text-[var(--ws-ink)] shrink-0 sm:w-5 sm:h-5"
              >
                <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.35" />
                <ellipse cx="12" cy="12" rx="4.2" ry="9.5" stroke="currentColor" strokeWidth="1.15" />
                <line x1="2.5" y1="12" x2="21.5" y2="12" stroke="currentColor" strokeWidth="1.15" />
                <circle cx="12" cy="12" r="1.8" fill="currentColor" />
              </svg>
              <div className="flex items-baseline gap-2.5">
                <span className="font-display text-[15px] sm:text-[16.5px] md:text-[18px] font-semibold tracking-[0.02em] sm:tracking-[0.03em] text-[var(--ws-ink)] whitespace-nowrap">
                  WORLD SIGNAL
                </span>
                <span className="hidden xl:inline-block border-l border-[var(--ws-border-strong)] pl-2.5 font-mono-tabular text-[11px] tracking-[0.04em] text-[var(--ws-ink-muted)] whitespace-nowrap">
                  {t.brandTagline}
                </span>
              </div>
            </button>

            {/* Zone 2: Primary 4-View Navigation (Desktop & Tablet) */}
            <nav
              aria-label="Primary navigation"
              className="hidden md:flex h-full items-stretch gap-1 lg:gap-2"
            >
              {VIEWS.map((viewId) => {
                const isActive = activeView === viewId;
                return (
                  <button
                    key={viewId}
                    type="button"
                    onClick={() => onSelectView(viewId)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`relative inline-flex items-center px-3 lg:px-4 text-[13.5px] tracking-[-0.005em] transition-colors duration-150 whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'text-[var(--ws-ink)] font-semibold'
                        : 'text-[var(--ws-ink-muted)] font-medium hover:text-[var(--ws-ink)]'
                    }`}
                  >
                    {t.nav[viewId]}
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-2.5 bottom-0 h-[2.5px] bg-[var(--ws-rule-editorial)]"
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Zone 3: Edition Context & Archive Drawer Trigger */}
            <button
              type="button"
              data-testid="archive-trigger"
              onClick={onOpenArchive}
              className="inline-flex min-h-[34px] md:min-h-[36px] items-center gap-1.5 sm:gap-2 rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-surface)] px-2 sm:px-3 py-1.5 text-[11.5px] sm:text-[12.5px] font-medium text-[var(--ws-ink)] hover:border-[var(--ws-border-strong)] hover:bg-[var(--ws-surface-hover)] transition-colors duration-150 cursor-pointer shrink-0"
            >
              <Archive className="h-3.5 w-3.5 text-[var(--ws-ink-muted)] shrink-0" />
              <span>{t.archive.button}</span>
              {activeEditionDate && (
                <span className="font-mono-tabular text-[11px] sm:text-[11.5px] text-[var(--ws-ink-muted)] border-l border-[var(--ws-border)] pl-1.5 sm:pl-2">
                  {isLocalPreview ? (
                    'LOCAL'
                  ) : (
                    <>
                      <span className="sm:hidden">{activeEditionDate.slice(5)}</span>
                      <span className="hidden sm:inline">{activeEditionDate}</span>
                    </>
                  )}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Subtle Editorial Reading Progress Hairline */}
        <div
          aria-hidden="true"
          className="h-[1.5px] w-full bg-transparent overflow-hidden"
        >
          <div
            className="h-full w-full bg-[var(--ws-rule-editorial)]/65 ws-progress-bar"
            style={{ transform: `scaleX(${scrollProgress})` }}
          />
        </div>
      </header>

      {/* Fixed Mobile Bottom Navigation Bar (< md) — reclaims top-of-screen reading height */}
      <nav
        aria-label="Mobile primary navigation"
        data-testid="mobile-bottom-nav"
        className="fixed bottom-0 inset-x-0 z-30 border-t border-[var(--ws-border)] bg-[var(--ws-surface)]/95 backdrop-blur-[10px] md:hidden pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(20,19,17,0.06)]"
      >
        <div className="grid grid-cols-4">
          {VIEWS.map((viewId) => {
            const isActive = activeView === viewId;
            const Icon = viewIcon(viewId);
            return (
              <button
                key={viewId}
                type="button"
                onClick={() => onSelectView(viewId)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative flex min-h-[54px] flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-center transition-colors duration-150 cursor-pointer ${
                  isActive
                    ? 'text-[var(--ws-ink)] font-semibold'
                    : 'text-[var(--ws-ink-muted)] font-medium hover:text-[var(--ws-ink)]'
                }`}
              >
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-3 top-0 h-[2px] bg-[var(--ws-rule-editorial)]"
                  />
                )}
                <Icon className="h-[17px] w-[17px] shrink-0" strokeWidth={isActive ? 2.1 : 1.7} />
                <span className="text-[11px] leading-tight truncate max-w-full">
                  {t.navShort[viewId]}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
