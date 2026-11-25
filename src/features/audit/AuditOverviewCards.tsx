import React from 'react';
import type {
  SourceIndependenceMetrics,
  UiLanguage,
} from '../../types/edition';
import { getUiStrings } from '../../lib/i18n/uiStrings';

interface AuditOverviewCardsProps {
  summary: SourceIndependenceMetrics;
  totalClaims: number;
  lang: UiLanguage;
}

export const AuditOverviewCards: React.FC<AuditOverviewCardsProps> = ({
  summary,
  totalClaims,
  lang,
}) => {
  const t = getUiStrings(lang);

  return (
    <section className="space-y-4">
      <h2 className="font-display text-xl font-semibold text-[var(--ws-ink)]">
        {t.audit.overviewTitle}
      </h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="ws-card p-4 space-y-1">
          <div className="font-mono-tabular text-2xl font-semibold text-[var(--ws-conf-high)]">
            {summary.independentOriginCount}
          </div>
          <div className="text-xs text-[var(--ws-ink-muted)] leading-snug">
            {t.audit.overviewCards.independentOrigins}
          </div>
        </div>

        <div className="ws-card p-4 space-y-1">
          <div className="font-mono-tabular text-2xl font-semibold text-[var(--ws-ink)]">
            {summary.qualifyingRecords}
          </div>
          <div className="text-xs text-[var(--ws-ink-muted)] leading-snug">
            {t.audit.overviewCards.qualifyingRecords}
          </div>
        </div>

        <div className="ws-card p-4 space-y-1">
          <div className="font-mono-tabular text-2xl font-semibold text-[var(--ws-ink)]">
            {summary.totalRecords}
          </div>
          <div className="text-xs text-[var(--ws-ink-muted)] leading-snug">
            {t.audit.overviewCards.totalSourceRecords}
          </div>
        </div>

        <div className="ws-card p-4 space-y-1">
          <div className="font-mono-tabular text-2xl font-semibold text-[var(--ws-ink-secondary)]">
            {summary.excludedRecords}
          </div>
          <div className="text-xs text-[var(--ws-ink-muted)] leading-snug">
            {t.audit.overviewCards.excludedRecords}
          </div>
        </div>

        <div className="ws-card p-4 space-y-1">
          <div className="font-mono-tabular text-2xl font-semibold text-[var(--ws-ink)]">
            {summary.primarySourceRecords + summary.researchPaperRecords}
          </div>
          <div className="text-xs text-[var(--ws-ink-muted)] leading-snug">
            {t.audit.overviewCards.primaryAndResearch}
          </div>
        </div>

        <div className="ws-card p-4 space-y-1">
          <div className="font-mono-tabular text-2xl font-semibold text-[var(--ws-ink)]">
            {totalClaims}
          </div>
          <div className="text-xs text-[var(--ws-ink-muted)] leading-snug">
            {t.audit.overviewCards.claimsAudited}
          </div>
        </div>
      </div>

      {/* Compact Source Class Composition Line */}
      <div className="ws-card-subtle px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono-tabular text-xs text-[var(--ws-ink-muted)]">
        <span className="font-semibold text-[var(--ws-ink)]">
          {t.audit.sourceBreakdownTitle}:
        </span>
        <span>
          {t.sourceClass.tier_1_newsroom}: {summary.tier1Records}
        </span>
        <span aria-hidden="true" className="opacity-40">
          ·
        </span>
        <span>
          {t.sourceClass.specialist_publication}: {summary.specialistRecords}
        </span>
        <span aria-hidden="true" className="opacity-40">
          ·
        </span>
        <span>
          {t.sourceClass.primary_source}: {summary.primarySourceRecords}
        </span>
        <span aria-hidden="true" className="opacity-40">
          ·
        </span>
        <span>
          {t.sourceClass.research_paper}: {summary.researchPaperRecords}
        </span>
        {summary.unknownClassRecords > 0 && (
          <>
            <span aria-hidden="true" className="opacity-40">
              ·
            </span>
            <span className="text-[var(--ws-warn)]">
              {t.sourceClass.unknown}: {summary.unknownClassRecords}
            </span>
          </>
        )}
        <span aria-hidden="true" className="opacity-40">
          ·
        </span>
        <span>
          {t.relationship.syndicated}: {summary.syndicatedRecords}
        </span>
        <span aria-hidden="true" className="opacity-40">
          ·
        </span>
        <span>
          {t.expanded.unregisteredCandidate}: {summary.unregisteredRecords}
        </span>
        {summary.unassignedRecords.length > 0 && (
          <>
            <span aria-hidden="true" className="opacity-40">
              ·
            </span>
            <span className="text-[var(--ws-warn)]">
              {t.audit.unassignedBadge}: {summary.unassignedRecords.length}
            </span>
          </>
        )}
      </div>
    </section>
  );
};
