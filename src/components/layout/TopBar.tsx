import React from 'react';
import { Archive } from 'lucide-react';
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

export const TopBar: React.FC<TopBarProps> = ({
  activeView,
  onSelectView,
  activeEditionDate,
  isLocalPreview,
  onOpenArchive,
  lang,
}) => {
  const t = getUiStrings(lang);

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--ws-border)] bg-[var(--ws-canvas)]/95 backdrop-blur-[6px]">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6">
        {/* Strict 3-Zone Editorial Publication Bar */}
        <div className="flex h-[52px] sm:h-14 items-center justify-between gap-4">
          {/* Zone 1: Publication Masthead Mark */}
          <button
            type="button"
            onClick={() => onSelectView('briefing')}
            className="flex items-center gap-2.5 text-left group cursor-pointer shrink-0 transition-opacity duration-150 hover:opacity-80"
            aria-label="WORLD SIGNAL"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="text-[var(--ws-ink)] shrink-0"
            >
              <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.35" />
              <ellipse cx="12" cy="12" rx="4.2" ry="9.5" stroke="currentColor" strokeWidth="1.15" />
              <line x1="2.5" y1="12" x2="21.5" y2="12" stroke="currentColor" strokeWidth="1.15" />
              <circle cx="12" cy="12" r="1.75" fill="currentColor" />
            </svg>
            <span className="font-display text-[16.5px] sm:text-[17.5px] font-semibold tracking-[0.025em] text-[var(--ws-ink)] whitespace-nowrap">
              WORLD SIGNAL
            </span>
          </button>

          {/* Zone 2: Primary 4-View Navigation (Desktop) */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex h-full items-stretch gap-1 lg:gap-2.5"
          >
            {VIEWS.map((viewId) => {
              const isActive = activeView === viewId;
              return (
                <button
                  key={viewId}
                  type="button"
                  onClick={() => onSelectView(viewId)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative inline-flex items-center px-3 lg:px-3.5 text-[13.5px] tracking-[-0.005em] transition-colors duration-150 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'text-[var(--ws-ink)] font-semibold'
                      : 'text-[var(--ws-ink-muted)] font-medium hover:text-[var(--ws-ink)]'
                  }`}
                >
                  {t.nav[viewId]}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-2.5 bottom-0 h-[2px] bg-[var(--ws-rule-editorial)]"
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
            className="inline-flex min-h-[36px] sm:min-h-[34px] items-center gap-2 rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-surface)] px-3 py-1.5 text-[12.5px] font-medium text-[var(--ws-ink)] hover:border-[var(--ws-border-strong)] hover:bg-[var(--ws-surface-hover)] transition-colors duration-150 cursor-pointer shrink-0"
          >
            <Archive className="h-3.5 w-3.5 text-[var(--ws-ink-muted)] shrink-0" />
            <span>{t.archive.button}</span>
            {activeEditionDate && (
              <span className="hidden sm:inline font-mono-tabular text-[11.5px] text-[var(--ws-ink-muted)] border-l border-[var(--ws-border)] pl-2">
                {isLocalPreview ? 'LOCAL' : activeEditionDate}
              </span>
            )}
          </button>
        </div>

        {/* Compact Mobile 4-View Navigation Strip (total sticky height 96px, 11.4% of 844px viewport) */}
        <nav
          aria-label="Mobile primary navigation"
          className="grid grid-cols-4 border-t border-[var(--ws-border-subtle)] md:hidden -mx-4 px-2"
        >
          {VIEWS.map((viewId) => {
            const isActive = activeView === viewId;
            return (
              <button
                key={viewId}
                type="button"
                onClick={() => onSelectView(viewId)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative flex h-11 items-center justify-center text-center text-[12.5px] transition-colors duration-150 cursor-pointer ${
                  isActive
                    ? 'text-[var(--ws-ink)] font-semibold'
                    : 'text-[var(--ws-ink-muted)] font-medium hover:text-[var(--ws-ink)]'
                }`}
              >
                {t.navShort[viewId]}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-3 bottom-0 h-[2px] bg-[var(--ws-rule-editorial)]"
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
