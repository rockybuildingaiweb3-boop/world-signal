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
    <header className="sticky top-0 z-30 border-b border-[var(--ws-border)] bg-[var(--ws-canvas)]/95 backdrop-blur-sm">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6">
        {/* Strict 3-Zone Editorial Top Bar */}
        <div className="flex h-14 items-center justify-between gap-4">
          {/* Zone 1: Brand / Publication Mark */}
          <button
            type="button"
            onClick={() => onSelectView('briefing')}
            className="flex items-center gap-2.5 text-left group cursor-pointer shrink-0"
            aria-label="WORLD SIGNAL"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="text-[var(--ws-ink)] shrink-0"
            >
              <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.4" />
              <ellipse cx="12" cy="12" rx="4.2" ry="9.5" stroke="currentColor" strokeWidth="1.2" />
              <line x1="2.5" y1="12" x2="21.5" y2="12" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="12" cy="12" r="1.8" fill="currentColor" />
            </svg>
            <span className="font-display text-[17px] sm:text-[18px] font-semibold tracking-[-0.02em] text-[var(--ws-ink)]">
              WORLD SIGNAL
            </span>
          </button>

          {/* Zone 2: Primary 4-View Navigation (Desktop) */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-1"
          >
            {VIEWS.map((viewId) => {
              const isActive = activeView === viewId;
              return (
                <button
                  key={viewId}
                  type="button"
                  onClick={() => onSelectView(viewId)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative px-3.5 py-2 text-[13.5px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'text-[var(--ws-ink)] font-semibold'
                      : 'text-[var(--ws-ink-muted)] hover:text-[var(--ws-ink)]'
                  }`}
                >
                  {t.nav[viewId]}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-3 -bottom-[11px] h-[2px] bg-[var(--ws-ink)]"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Archive & Settings Drawer Trigger */}
          <button
            type="button"
            data-testid="archive-trigger"
            onClick={onOpenArchive}
            className="inline-flex items-center gap-2 rounded-md border border-[var(--ws-border)] bg-[var(--ws-surface)] px-3 py-1.5 text-[13px] font-medium text-[var(--ws-ink)] hover:border-[var(--ws-border-strong)] transition-colors cursor-pointer shrink-0"
          >
            <Archive className="h-3.5 w-3.5 text-[var(--ws-ink-muted)]" />
            <span>{t.archive.button}</span>
            {activeEditionDate && (
              <span className="hidden sm:inline font-mono-tabular text-[11.5px] text-[var(--ws-ink-muted)] border-l border-[var(--ws-border)] pl-2">
                {isLocalPreview ? 'LOCAL' : activeEditionDate}
              </span>
            )}
          </button>
        </div>

        {/* Compact Mobile 4-View Navigation Strip (total header height ~94px, <12% of 844px viewport) */}
        <nav
          aria-label="Mobile primary navigation"
          className="grid grid-cols-4 border-t border-[var(--ws-border)] md:hidden -mx-4 px-2"
        >
          {VIEWS.map((viewId) => {
            const isActive = activeView === viewId;
            return (
              <button
                key={viewId}
                type="button"
                onClick={() => onSelectView(viewId)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative py-2.5 text-center text-[12.5px] font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'text-[var(--ws-ink)] font-semibold'
                    : 'text-[var(--ws-ink-muted)]'
                }`}
              >
                {t.navShort[viewId]}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-3 bottom-0 h-[2px] bg-[var(--ws-ink)]"
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
