import React from 'react';
import { BookOpen, FileText, ShieldCheck } from 'lucide-react';
import type { EditionsIndex } from '../types/edition';

interface ArchiveEmptyStateProps {
  index: EditionsIndex;
  onOpenLocalModal: () => void;
}

export const ArchiveEmptyState: React.FC<ArchiveEmptyStateProps> = ({
  index,
  onOpenLocalModal,
}) => {
  return (
    <div className="py-10 sm:py-16 max-w-4xl mx-auto space-y-10">
      <section className="space-y-4 border-b border-stone-200 dark:border-stone-800 pb-8">
        <p className="text-xs uppercase tracking-widest text-[#57534E] dark:text-[#A8A29E] font-medium tabular-nums">
          Archive Index Schema v{index.schema_version} · Latest Edition: None Published ·
          Generated {index.generated_at || 'N/A'}
        </p>
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#1C1917] dark:text-[#EFECE6] leading-[1.12] headline-balance">
          Awaiting the First Published Daily Edition
        </h1>
        <p className="text-base sm:text-lg text-[#44403C] dark:text-[#D6D3D1] leading-relaxed max-w-2xl">
          The static archive index at{' '}
          <code className="font-mono-tabular text-sm px-1.5 py-0.5 bg-[#F3EFE6] dark:bg-[#1F1D1A] rounded">
            /data/editions-index.json
          </code>{' '}
          is active and currently contains zero published editions. This reader renders published
          Markdown editions without fabricating sample news.
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onOpenLocalModal}
            className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 text-sm font-medium bg-[#1C1917] dark:bg-[#EFECE6] text-[#FBF9F5] dark:text-[#121110] rounded-md hover:opacity-90 transition-opacity cursor-pointer"
          >
            <FileText className="w-4 h-4" aria-hidden="true" />
            Inspect Local Markdown Edition
          </button>
        </div>
      </section>

      <section aria-labelledby="pipeline-heading" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 bg-[#F3EFE6]/60 dark:bg-[#191815] border border-stone-200 dark:border-stone-800 rounded-lg space-y-2">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-[#1E3A8A] dark:text-[#93C5FD]">
            <BookOpen className="w-4 h-4" aria-hidden="true" />
            <span>01. Canonical Markdown</span>
          </div>
          <p className="text-sm text-[#44403C] dark:text-[#D6D3D1] leading-relaxed">
            Daily editions are authored as a single cumulative Markdown file per calendar date at{' '}
            <code className="font-mono-tabular text-xs">content/editions/YYYY/MM/YYYY-MM-DD.md</code>.
          </p>
        </div>

        <div className="p-5 bg-[#F3EFE6]/60 dark:bg-[#191815] border border-stone-200 dark:border-stone-800 rounded-lg space-y-2">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-[#9A3412] dark:text-[#FDBA74]">
            <FileText className="w-4 h-4" aria-hidden="true" />
            <span>02. Static Publication</span>
          </div>
          <p className="text-sm text-[#44403C] dark:text-[#D6D3D1] leading-relaxed">
            Running{' '}
            <code className="font-mono-tabular text-xs">npm run build:content</code> validates
            frontmatter and headings, mirrors editions to{' '}
            <code className="font-mono-tabular text-xs">public/editions/</code>, and updates the
            archive index.
          </p>
        </div>

        <div className="p-5 bg-[#F3EFE6]/60 dark:bg-[#191815] border border-stone-200 dark:border-stone-800 rounded-lg space-y-2">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-[#14532D] dark:text-[#86EFAC]">
            <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            <span>03. Four Reader Views</span>
          </div>
          <p className="text-sm text-[#44403C] dark:text-[#D6D3D1] leading-relaxed">
            Once an edition is published or loaded locally, all four projections—Briefing, Expanded
            & Timelines, Synthesis & Personal, and Audit—derive from the same parsed source.
          </p>
        </div>
      </section>
    </div>
  );
};
