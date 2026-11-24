import React from 'react';
import { FileCode2, RefreshCw } from 'lucide-react';
import type { UiLanguage } from '../../types/edition';
import { getUiStrings } from '../../lib/i18n/uiStrings';

interface ArchiveEmptyStateProps {
  lang: UiLanguage;
  onRefresh: () => void;
  onOpenLocalModal: () => void;
}

export const ArchiveEmptyState: React.FC<ArchiveEmptyStateProps> = ({
  lang,
  onRefresh,
  onOpenLocalModal,
}) => {
  const t = getUiStrings(lang);

  return (
    <div className="mx-auto max-w-2xl py-16 px-4">
      <div className="ws-card p-8 sm:p-10 space-y-6">
        <div className="font-mono-tabular text-xs uppercase tracking-widest text-[var(--ws-ink-muted)]">
          {t.emptyState.eyebrow}
        </div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--ws-ink)] headline-balance">
          {t.emptyState.title}
        </h1>
        <p className="text-[0.97rem] leading-relaxed text-[var(--ws-ink-secondary)]">
          {t.emptyState.body}
        </p>

        <div className="border-t border-b border-[var(--ws-border)] py-4">
          <p className="text-xs text-[var(--ws-ink-muted)] mb-3">{t.emptyState.domainsNote}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm font-medium">
            <div className="text-[var(--ws-world)]">{t.domains.world}</div>
            <div className="text-[var(--ws-ai)]">{t.domains.ai}</div>
            <div className="text-[var(--ws-economy)]">{t.domains.economy}</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-2 rounded-md bg-[var(--ws-ink)] px-4 py-2 text-sm font-medium text-[var(--ws-surface)] hover:opacity-90 cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            {t.emptyState.checkAgain}
          </button>
          <button
            type="button"
            onClick={onOpenLocalModal}
            className="inline-flex items-center gap-2 rounded-md border border-[var(--ws-border)] px-4 py-2 text-sm font-medium text-[var(--ws-ink)] hover:border-[var(--ws-border-strong)] cursor-pointer"
          >
            <FileCode2 className="h-4 w-4 text-[var(--ws-ink-muted)]" />
            {t.emptyState.openLocalTool}
          </button>
        </div>
      </div>
    </div>
  );
};
