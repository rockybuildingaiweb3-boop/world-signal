import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import type {
  ConfidenceLevel,
  SignalDomain,
  SignalFilters,
  SignalStatus,
  SourceClass,
} from '../types/edition';
import { DEFAULT_FILTERS } from '../lib/filtering/filterSignals';

interface EditionFilterBarProps {
  filters: SignalFilters;
  onChange: (next: SignalFilters) => void;
  availableTags: string[];
  totalSignals: number;
  matchedSignals: number;
}

const DOMAIN_OPTIONS: Array<{ value: SignalDomain | 'all'; label: string }> = [
  { value: 'all', label: 'All Domains' },
  { value: 'world', label: 'World Events' },
  { value: 'ai', label: 'AI Frontier' },
  { value: 'economy', label: 'Economic Outlook' },
];

export const EditionFilterBar: React.FC<EditionFilterBarProps> = ({
  filters,
  onChange,
  availableTags,
  totalSignals,
  matchedSignals,
}) => {
  const hasActiveFilters =
    filters.query !== '' ||
    filters.domain !== 'all' ||
    filters.minImportance > 1 ||
    filters.confidence !== 'all' ||
    filters.status !== 'all' ||
    filters.tag !== 'all' ||
    filters.sourceClass !== 'all';

  return (
    <section
      aria-label="Signal filters"
      className="bg-[#F3EFE6]/70 dark:bg-[#191815] border border-stone-200 dark:border-stone-800 rounded-lg p-4 space-y-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="group"
          aria-label="Domain filter"
          className="flex flex-wrap items-center gap-1 p-1 bg-stone-200/70 dark:bg-stone-900 rounded-md"
        >
          {DOMAIN_OPTIONS.map((opt) => {
            const active = filters.domain === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ ...filters, domain: opt.value })}
                aria-pressed={active}
                className={`min-h-[36px] px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-[#FBF9F5] dark:bg-[#292524] text-[#1C1917] dark:text-[#EFECE6] shadow-xs'
                    : 'text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#EFECE6]'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-[#57534E] dark:text-[#A8A29E] tabular-nums whitespace-nowrap">
            Showing {matchedSignals} of {totalSignals} {totalSignals === 1 ? 'signal' : 'signals'}
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => onChange(DEFAULT_FILTERS)}
              className="inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 text-xs font-medium text-[#1C1917] dark:text-[#EFECE6] border border-stone-300 dark:border-stone-700 rounded-md hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
        <div className="lg:col-span-2 relative">
          <label htmlFor="signal-search" className="sr-only">
            Search signals
          </label>
          <Search
            className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            id="signal-search"
            type="search"
            value={filters.query}
            onChange={(e) => onChange({ ...filters, query: e.target.value })}
            placeholder="Search ID, headline, topic, claim..."
            className="w-full min-h-[40px] pl-9 pr-3 py-2 text-sm bg-[#FBF9F5] dark:bg-[#121110] text-[#1C1917] dark:text-[#EFECE6] border border-stone-300 dark:border-stone-700 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A]"
          />
        </div>

        <div>
          <label htmlFor="filter-importance" className="sr-only">
            Minimum importance
          </label>
          <select
            id="filter-importance"
            value={filters.minImportance}
            onChange={(e) => onChange({ ...filters, minImportance: Number(e.target.value) })}
            className="w-full min-h-[40px] px-3 py-2 text-sm bg-[#FBF9F5] dark:bg-[#121110] text-[#1C1917] dark:text-[#EFECE6] border border-stone-300 dark:border-stone-700 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A]"
          >
            <option value={1}>Importance: All (1–5)</option>
            <option value={2}>Importance: 2+ (Monitor)</option>
            <option value={3}>Importance: 3+ (Material)</option>
            <option value={4}>Importance: 4+ (Major)</option>
            <option value={5}>Importance: 5 (Systemic)</option>
          </select>
        </div>

        <div>
          <label htmlFor="filter-confidence" className="sr-only">
            Confidence level
          </label>
          <select
            id="filter-confidence"
            value={filters.confidence}
            onChange={(e) =>
              onChange({ ...filters, confidence: e.target.value as ConfidenceLevel | 'all' })
            }
            className="w-full min-h-[40px] px-3 py-2 text-sm bg-[#FBF9F5] dark:bg-[#121110] text-[#1C1917] dark:text-[#EFECE6] border border-stone-300 dark:border-stone-700 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A]"
          >
            <option value="all">Confidence: All</option>
            <option value="high">Confidence: High</option>
            <option value="medium">Confidence: Medium</option>
            <option value="low">Confidence: Low</option>
            <option value="unverified">Confidence: Unverified</option>
          </select>
        </div>

        <div>
          <label htmlFor="filter-status" className="sr-only">
            Signal status
          </label>
          <select
            id="filter-status"
            value={filters.status}
            onChange={(e) =>
              onChange({ ...filters, status: e.target.value as SignalStatus | 'all' })
            }
            className="w-full min-h-[40px] px-3 py-2 text-sm bg-[#FBF9F5] dark:bg-[#121110] text-[#1C1917] dark:text-[#EFECE6] border border-stone-300 dark:border-stone-700 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A]"
          >
            <option value="all">Status: All</option>
            <option value="new">New</option>
            <option value="developing">Developing</option>
            <option value="ongoing">Ongoing</option>
            <option value="confirmed">Confirmed</option>
            <option value="disputed">Disputed</option>
            <option value="unverified">Unverified</option>
            <option value="corrected">Corrected</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="filter-tag" className="sr-only">
              Tag
            </label>
            <select
              id="filter-tag"
              value={filters.tag}
              onChange={(e) => onChange({ ...filters, tag: e.target.value })}
              className="w-full min-h-[40px] px-2.5 py-2 text-sm bg-[#FBF9F5] dark:bg-[#121110] text-[#1C1917] dark:text-[#EFECE6] border border-stone-300 dark:border-stone-700 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A]"
            >
              <option value="all">Tag: All</option>
              {availableTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filter-source-class" className="sr-only">
              Source class
            </label>
            <select
              id="filter-source-class"
              value={filters.sourceClass}
              onChange={(e) =>
                onChange({ ...filters, sourceClass: e.target.value as SourceClass | 'all' })
              }
              className="w-full min-h-[40px] px-2.5 py-2 text-sm bg-[#FBF9F5] dark:bg-[#121110] text-[#1C1917] dark:text-[#EFECE6] border border-stone-300 dark:border-stone-700 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A]"
            >
              <option value="all">Source: All</option>
              <option value="tier_1_newsroom">Tier 1 Newsroom</option>
              <option value="specialist_publication">Specialist</option>
              <option value="primary_source">Primary Source</option>
              <option value="research_paper">Research Paper</option>
            </select>
          </div>
        </div>
      </div>
    </section>
  );
};
