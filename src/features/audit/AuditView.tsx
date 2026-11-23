import React from 'react';
import { ExternalLink, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { ParsedEdition, SignalSource } from '../../types/edition';
import { SafeMarkdown } from '../../components/SafeMarkdown';
import {
  formatRelationshipLabel,
  formatSourceClassLabel,
  getConfidenceTextClass,
} from '../../lib/filtering/filterSignals';

interface AuditViewProps {
  edition: ParsedEdition;
  onInspectSignal: (signalId: string) => void;
}

interface FlattenedSource extends SignalSource {
  signal_id: string;
}

export const AuditView: React.FC<AuditViewProps> = ({ edition, onInspectSignal }) => {
  const allSources: FlattenedSource[] = edition.signals.flatMap((sig) =>
    sig.sources.map((src) => ({ ...src, signal_id: sig.signal_id }))
  );

  const uniqueIndependentGroups = Array.from(
    new Set(
      allSources
        .filter((s) => s.count_as_independent && s.independence_group)
        .map((s) => s.independence_group)
    )
  );

  const syndicatedCount = allSources.filter((s) => s.relationship === 'syndicated').length;
  const primaryOrResearchCount = allSources.filter(
    (s) => s.source_class === 'primary_source' || s.source_class === 'research_paper'
  ).length;

  const unresolvedClaims = edition.signals.flatMap((sig) =>
    sig.claims
      .filter((c) => c.status !== 'confirmed')
      .map((c) => ({ ...c, signal_id: sig.signal_id, headline: sig.headline }))
  );

  return (
    <div className="space-y-10">
      <header className="border-b border-stone-200 dark:border-stone-800 pb-4">
        <h1 className="font-display text-3xl font-semibold text-[#1C1917] dark:text-[#EFECE6]">
          Audit, Provenance & Methodology
        </h1>
        <p className="mt-1 text-sm text-[#57534E] dark:text-[#A8A29E]">
          Derived dynamically from edition source ledgers, independence groups, claim statuses,
          and schema validation.
        </p>
      </header>

      {/* Derived Source Independence Metrics */}
      <section aria-labelledby="audit-metrics-heading" className="space-y-3">
        <h2 id="audit-metrics-heading" className="sr-only">
          Source Independence Summary
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 tabular-nums">
          <div className="p-4 bg-[#F3EFE6]/60 dark:bg-[#191815] border border-stone-200 dark:border-stone-800 rounded-lg">
            <span className="block text-xs uppercase tracking-wider text-[#57534E] dark:text-[#A8A29E]">
              Total Source Records
            </span>
            <span className="mt-1 block font-display text-2xl font-semibold text-[#1C1917] dark:text-[#EFECE6]">
              {allSources.length}
            </span>
          </div>
          <div className="p-4 bg-[#F3EFE6]/60 dark:bg-[#191815] border border-stone-200 dark:border-stone-800 rounded-lg">
            <span className="block text-xs uppercase tracking-wider text-[#57534E] dark:text-[#A8A29E]">
              Unique Reporting Origins
            </span>
            <span className="mt-1 block font-display text-2xl font-semibold text-[#14532D] dark:text-[#86EFAC]">
              {uniqueIndependentGroups.length}
            </span>
          </div>
          <div className="p-4 bg-[#F3EFE6]/60 dark:bg-[#191815] border border-stone-200 dark:border-stone-800 rounded-lg">
            <span className="block text-xs uppercase tracking-wider text-[#57534E] dark:text-[#A8A29E]">
              Primary & Research Artifacts
            </span>
            <span className="mt-1 block font-display text-2xl font-semibold text-[#1C1917] dark:text-[#EFECE6]">
              {primaryOrResearchCount}
            </span>
          </div>
          <div className="p-4 bg-[#F3EFE6]/60 dark:bg-[#191815] border border-stone-200 dark:border-stone-800 rounded-lg">
            <span className="block text-xs uppercase tracking-wider text-[#57534E] dark:text-[#A8A29E]">
              Syndicated Copies Excluded
            </span>
            <span className="mt-1 block font-display text-2xl font-semibold text-[#1C1917] dark:text-[#EFECE6]">
              {syndicatedCount}
            </span>
          </div>
        </div>
      </section>

      {/* Schema & Reference Validation Status */}
      <section aria-labelledby="validation-heading" className="space-y-3">
        <h2
          id="validation-heading"
          className="font-display text-2xl font-semibold text-[#1C1917] dark:text-[#EFECE6] border-b border-stone-200 dark:border-stone-800 pb-2"
        >
          Schema & Evidence Integrity Check
        </h2>
        {edition.validation.errors.length === 0 && edition.validation.warnings.length === 0 ? (
          <div className="flex items-center gap-2.5 p-4 bg-[#F3EFE6]/60 dark:bg-[#191815] border border-stone-200 dark:border-stone-800 rounded-lg text-sm text-[#14532D] dark:text-[#86EFAC]">
            <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>
              All required headings, metadata fields, source references, and HTTP/HTTPS URL checks
              passed cleanly.
            </span>
          </div>
        ) : (
          <ul className="space-y-2">
            {[...edition.validation.errors, ...edition.validation.warnings].map((issue, idx) => (
              <li
                key={`${issue.code}-${idx}`}
                className="flex items-start gap-2.5 p-3.5 border border-stone-200 dark:border-stone-800 rounded-md bg-[#F3EFE6]/50 dark:bg-[#191815] text-sm"
              >
                <AlertTriangle
                  className={`w-4 h-4 mt-0.5 shrink-0 ${
                    issue.severity === 'error'
                      ? 'text-[#991B1B] dark:text-[#FCA5A5]'
                      : 'text-[#78350F] dark:text-[#FCD34D]'
                  }`}
                  aria-hidden="true"
                />
                <div>
                  <span className="font-mono-tabular text-xs font-semibold uppercase mr-2">
                    [{issue.severity}] {issue.code}
                  </span>
                  <span className="text-[#1C1917] dark:text-[#EFECE6]">{issue.message}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Master Source Ledger */}
      <section aria-labelledby="master-ledger-heading" className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-stone-200 dark:border-stone-800 pb-2">
          <h2
            id="master-ledger-heading"
            className="font-display text-2xl font-semibold text-[#1C1917] dark:text-[#EFECE6]"
          >
            Edition Source Ledger
          </h2>
          <span className="text-xs text-[#57534E] dark:text-[#A8A29E] tabular-nums">
            Independent origin count derives from unique independence_group with
            count_as_independent: true
          </span>
        </div>

        {allSources.length === 0 ? (
          <p className="text-sm text-[#57534E] dark:text-[#A8A29E]">
            No source records found in this edition.
          </p>
        ) : (
          <div className="overflow-x-auto border border-stone-200 dark:border-stone-800 rounded-lg bg-[#FBF9F5] dark:bg-[#191815]">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-[#F3EFE6] dark:bg-[#141311] text-xs uppercase tracking-wider text-[#57534E] dark:text-[#A8A29E]">
                  <th className="px-3 py-2.5 font-semibold">Signal / Source</th>
                  <th className="px-3 py-2.5 font-semibold">Outlet & Document</th>
                  <th className="px-3 py-2.5 font-semibold">Class & Registry ID</th>
                  <th className="px-3 py-2.5 font-semibold">Independence Group</th>
                  <th className="px-3 py-2.5 font-semibold">Counts?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                {allSources.map((src, idx) => (
                  <tr key={`${src.signal_id}-${src.source_id}-${idx}`} className="align-top">
                    <td className="px-3 py-2.5 font-mono-tabular text-xs whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onInspectSignal(src.signal_id)}
                        className="text-[#1E3A8A] dark:text-[#93C5FD] underline underline-offset-4 cursor-pointer"
                      >
                        {src.signal_id}
                      </button>
                      <span className="block text-[#57534E] dark:text-[#A8A29E] mt-0.5">
                        {src.source_id}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 space-y-1">
                      <div className="font-semibold text-[#1C1917] dark:text-[#EFECE6]">
                        {src.outlet}
                      </div>
                      {src.urlSafe ? (
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-[#1E3A8A] dark:text-[#93C5FD] underline underline-offset-4 hover:opacity-80"
                        >
                          <span>{src.title}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" aria-hidden="true" />
                        </a>
                      ) : (
                        <span className="block text-xs text-[#991B1B] dark:text-[#FCA5A5]">
                          {src.title} (URL invalid or blocked)
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-xs whitespace-nowrap">
                      <div>{formatSourceClassLabel(src.source_class)}</div>
                      <div className="font-mono-tabular text-[#57534E] dark:text-[#A8A29E]">
                        {src.registry_id || 'unregistered'} ·{' '}
                        {formatRelationshipLabel(src.relationship)}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 font-mono-tabular text-xs whitespace-nowrap">
                      {src.independence_group || '—'}
                    </td>
                    <td className="px-3 py-2.5 text-xs whitespace-nowrap">
                      {src.count_as_independent ? (
                        <span className="font-semibold text-[#14532D] dark:text-[#86EFAC]">
                          Independent
                        </span>
                      ) : (
                        <span className="text-[#57534E] dark:text-[#A8A29E]">Not counted</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Non-Confirmed / Disputed / Unverified Claims */}
      <section aria-labelledby="unresolved-claims-heading" className="space-y-3">
        <h2
          id="unresolved-claims-heading"
          className="font-display text-2xl font-semibold text-[#1C1917] dark:text-[#EFECE6] border-b border-stone-200 dark:border-stone-800 pb-2"
        >
          Claims Requiring Qualification or Verification ({unresolvedClaims.length})
        </h2>
        {unresolvedClaims.length === 0 ? (
          <p className="text-sm text-[#57534E] dark:text-[#A8A29E]">
            No unconfirmed, official-only, or disputed claims listed in structured claim ledgers.
          </p>
        ) : (
          <div className="space-y-2.5">
            {unresolvedClaims.map((claim) => (
              <div
                key={claim.claim_id}
                className="p-4 border border-stone-200 dark:border-stone-800 rounded-md bg-[#F3EFE6]/40 dark:bg-[#191815] space-y-1"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#57534E] dark:text-[#A8A29E] tabular-nums">
                  <button
                    type="button"
                    onClick={() => onInspectSignal(claim.signal_id)}
                    className="font-mono-tabular text-[#1E3A8A] dark:text-[#93C5FD] underline underline-offset-4 cursor-pointer"
                  >
                    {claim.claim_id}
                  </button>
                  <span aria-hidden="true">·</span>
                  <span className="capitalize">Status: {claim.status.replace(/_/g, ' ')}</span>
                  <span aria-hidden="true">·</span>
                  <span className={`capitalize font-semibold ${getConfidenceTextClass(claim.confidence)}`}>
                    {claim.confidence} confidence
                  </span>
                </div>
                <p className="text-sm text-[#1C1917] dark:text-[#EFECE6]">{claim.statement}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Editorial Audit & Methodology Narrative */}
      <section aria-labelledby="editorial-audit-heading" className="space-y-6">
        <h2
          id="editorial-audit-heading"
          className="font-display text-2xl font-semibold text-[#1C1917] dark:text-[#EFECE6] border-b border-stone-200 dark:border-stone-800 pb-2"
        >
          Editorial Audit & Methodology Notes
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { title: 'Source Audit', content: edition.auditAndMethodology.sourceAudit },
            { title: 'Open Questions', content: edition.auditAndMethodology.openQuestions },
            { title: 'Corrections', content: edition.auditAndMethodology.corrections },
            { title: 'Methodology Notes', content: edition.auditAndMethodology.methodologyNotes },
          ].map((block) => (
            <div
              key={block.title}
              className="p-5 bg-[#F3EFE6]/50 dark:bg-[#191815] border border-stone-200 dark:border-stone-800 rounded-lg space-y-2"
            >
              <h3 className="text-xs uppercase tracking-widest font-semibold text-[#57534E] dark:text-[#A8A29E]">
                {block.title}
              </h3>
              {block.content ? (
                <SafeMarkdown
                  content={block.content}
                  className="text-sm"
                  onSelectSignal={onInspectSignal}
                />
              ) : (
                <p className="text-sm text-[#57534E] dark:text-[#A8A29E]">
                  No notes recorded under this heading.
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
