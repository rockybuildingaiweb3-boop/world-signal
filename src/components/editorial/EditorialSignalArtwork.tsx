import React from 'react';
import type { ParsedSignal, SignalDomain, UiLanguage } from '../../types/edition';
import { getUiStrings } from '../../lib/i18n/uiStrings';
import { formatEventDateRange } from '../../lib/dates/formatDates';
import { buildOriginMarkerSummary } from '../../lib/intelligence/visual-metrics/editorialVisualHelpers';

interface EditorialSignalArtworkProps {
  signal: ParsedSignal;
  lang: UiLanguage;
  signalDomainById?: ReadonlyMap<string, SignalDomain>;
}

interface DomainPalette {
  stroke: string;
  softFill: string;
  borderClass: string;
  textClass: string;
  barClass: string;
}

function getDomainPalette(domain: SignalDomain): DomainPalette {
  switch (domain) {
    case 'world':
      return {
        stroke: 'var(--ws-world)',
        softFill: 'var(--ws-world-soft)',
        borderClass: 'border-[var(--ws-world-border)]',
        textClass: 'text-[var(--ws-world)]',
        barClass: 'bg-[var(--ws-world)]',
      };
    case 'ai':
      return {
        stroke: 'var(--ws-ai)',
        softFill: 'var(--ws-ai-soft)',
        borderClass: 'border-[var(--ws-ai-border)]',
        textClass: 'text-[var(--ws-ai)]',
        barClass: 'bg-[var(--ws-ai)]',
      };
    case 'economy':
      return {
        stroke: 'var(--ws-economy)',
        softFill: 'var(--ws-economy-soft)',
        borderClass: 'border-[var(--ws-economy-border)]',
        textClass: 'text-[var(--ws-economy)]',
        barClass: 'bg-[var(--ws-economy)]',
      };
  }
}

function inferTargetDomain(
  targetId: string,
  signalDomainById?: ReadonlyMap<string, SignalDomain>
): SignalDomain | null {
  const fromMap = signalDomainById?.get(targetId);
  if (fromMap) return fromMap;
  if (targetId.startsWith('WORLD-')) return 'world';
  if (targetId.startsWith('AI-')) return 'ai';
  if (targetId.startsWith('ECON-')) return 'economy';
  return null;
}

/**
 * Art-directed editorial diagram for the Lead Story hero.
 * Grounded strictly in verified structured metadata (domain, importance 1-5,
 * exact independent origin count & groups, event dates, geography, structured
 * timelineEvents, and declared relationships). Clearly marked as an illustrative
 * diagram so it is never mistaken for documentary imagery.
 */
export const EditorialSignalArtwork: React.FC<EditorialSignalArtworkProps> = ({
  signal,
  lang,
  signalDomainById,
}) => {
  const t = getUiStrings(lang);
  const palette = getDomainPalette(signal.domain);

  // Honest orbital node math — explicit overflow marker whenever total > 8
  const originSummary = buildOriginMarkerSummary(
    signal.independentOriginCount,
    signal.independentGroups,
    8
  );

  const originNodes = Array.from(
    { length: originSummary.displayedCount },
    (_, idx) => {
      const angle =
        -Math.PI / 2 +
        (idx * (Math.PI * 2)) / Math.max(originSummary.displayedCount, 1);
      const radius = idx % 2 === 0 ? 52 : 39;
      return {
        cx: 120 + Math.cos(angle) * radius,
        cy: 84 + Math.sin(angle) * radius,
        label: originSummary.namedGroups[idx] ?? null,
      };
    }
  );

  // Real structured timeline milestones (schema v2)
  const timelineMilestones = signal.timelineEvents.slice(0, 5);
  const totalMilestones = signal.timelineEvents.length;

  // Real declared outbound relationships (schema v2)
  const declaredRelationships = signal.relationships;
  const relDomainCounts = declaredRelationships.reduce<
    Partial<Record<SignalDomain, number>>
  >((acc, rel) => {
    const d = inferTargetDomain(rel.target_signal_id, signalDomainById);
    if (d) acc[d] = (acc[d] ?? 0) + 1;
    return acc;
  }, {});

  const importanceSteps = [1, 2, 3, 4, 5];
  const eventRange = formatEventDateRange(
    signal.event.start_date,
    signal.event.end_date,
    lang
  );

  return (
    <figure
      aria-label={`${t.domains[signal.domain]} · ${signal.headline}`}
      className="relative overflow-hidden rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-surface)] ws-grid-paper"
    >
      {/* Top domain architectural accent rule */}
      <div className={`h-[3px] w-full ${palette.barClass}`} aria-hidden="true" />

      <div className="p-4 sm:p-5 flex flex-col gap-4 sm:flex-row sm:items-stretch sm:justify-between">
        {/* Left: Story-Informed Abstract Editorial SVG Composition */}
        <div className="relative flex flex-col items-center justify-center sm:w-[44%] shrink-0">
          <svg
            viewBox="0 0 240 168"
            fill="none"
            role="img"
            aria-hidden="true"
            className="w-full max-w-[172px] sm:max-w-[228px] h-auto"
          >
            {/* Corner registration ticks */}
            <path
              d="M10 18V10H18M230 18V10H222M10 150V158H18M230 150V158H222"
              stroke="var(--ws-border-strong)"
              strokeWidth="1"
            />

            {/* Subtle tinted archival disc */}
            <circle
              cx="120"
              cy="84"
              r="60"
              fill={palette.softFill}
              opacity="0.85"
            />

            {/* Architectural crosshairs */}
            <line
              x1="24"
              y1="84"
              x2="216"
              y2="84"
              stroke="var(--ws-border-strong)"
              strokeWidth="0.85"
              strokeDasharray="3 3"
            />
            <line
              x1="120"
              y1="14"
              x2="120"
              y2="154"
              stroke="var(--ws-border-strong)"
              strokeWidth="0.85"
              strokeDasharray="3 3"
            />

            {/* Domain-specific geometric visual language */}
            {signal.domain === 'world' && (
              <>
                <circle
                  cx="120"
                  cy="84"
                  r="52"
                  stroke={palette.stroke}
                  strokeWidth="1.25"
                  opacity="0.85"
                />
                <ellipse
                  cx="120"
                  cy="84"
                  rx="23"
                  ry="52"
                  stroke={palette.stroke}
                  strokeWidth="1"
                  opacity="0.58"
                />
                <ellipse
                  cx="120"
                  cy="84"
                  rx="52"
                  ry="19"
                  stroke={palette.stroke}
                  strokeWidth="0.9"
                  opacity="0.45"
                />
                <circle
                  cx="120"
                  cy="84"
                  r="39"
                  stroke="var(--ws-border-strong)"
                  strokeWidth="0.8"
                  strokeDasharray="2 4"
                />
              </>
            )}

            {signal.domain === 'ai' && (
              <>
                <polygon
                  points="120,28 168,56 168,112 120,140 72,112 72,56"
                  stroke={palette.stroke}
                  strokeWidth="1.25"
                  opacity="0.85"
                />
                <polygon
                  points="120,46 152,65 152,103 120,122 88,103 88,65"
                  stroke={palette.stroke}
                  strokeWidth="1"
                  opacity="0.55"
                />
                <circle
                  cx="120"
                  cy="84"
                  r="52"
                  stroke="var(--ws-border-strong)"
                  strokeWidth="0.8"
                  strokeDasharray="2 4"
                />
              </>
            )}

            {signal.domain === 'economy' && (
              <>
                <rect
                  x="68"
                  y="32"
                  width="104"
                  height="104"
                  stroke={palette.stroke}
                  strokeWidth="1.2"
                  opacity="0.75"
                />
                <rect
                  x="84"
                  y="48"
                  width="72"
                  height="72"
                  transform="rotate(45 120 84)"
                  stroke={palette.stroke}
                  strokeWidth="1"
                  opacity="0.6"
                />
                <circle
                  cx="120"
                  cy="84"
                  r="52"
                  stroke="var(--ws-border-strong)"
                  strokeWidth="0.8"
                  strokeDasharray="2 4"
                />
              </>
            )}

            {/* Outbound declared relationship rays along outer rim when schema-v2 relationships exist */}
            {declaredRelationships.slice(0, 6).map((rel, idx) => {
              const targetDomain = inferTargetDomain(
                rel.target_signal_id,
                signalDomainById
              );
              const targetStroke = targetDomain
                ? getDomainPalette(targetDomain).stroke
                : 'var(--ws-border-strong)';
              const angle =
                Math.PI * 0.15 + (idx * (Math.PI * 1.7)) / Math.max(declaredRelationships.slice(0, 6).length, 1);
              const x1 = 120 + Math.cos(angle) * 55;
              const y1 = 84 + Math.sin(angle) * 55;
              const x2 = 120 + Math.cos(angle) * 69;
              const y2 = 84 + Math.sin(angle) * 69;
              return (
                <g key={`${rel.target_signal_id}-${idx}`}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={targetStroke}
                    strokeWidth="1.25"
                    strokeDasharray={rel.relationship_type === 'potential_link' ? '2 2' : undefined}
                    opacity="0.78"
                  />
                  <rect
                    x={x2 - 2.2}
                    y={y2 - 2.2}
                    width="4.4"
                    height="4.4"
                    fill={targetStroke}
                    opacity="0.9"
                  />
                </g>
              );
            })}

            {/* Independent origin verification rays & nodes */}
            {originNodes.map((pt, idx) => (
              <g key={idx}>
                <line
                  x1="120"
                  y1="84"
                  x2={pt.cx}
                  y2={pt.cy}
                  stroke={palette.stroke}
                  strokeWidth="1"
                  opacity="0.55"
                />
                <circle
                  cx={pt.cx}
                  cy={pt.cy}
                  r="4.2"
                  fill="var(--ws-surface)"
                  stroke={palette.stroke}
                  strokeWidth="1.65"
                />
              </g>
            ))}

            {/* Explicit non-misleading overflow indicator when independent origins > 8 */}
            {originSummary.isCapped && (
              <g>
                <rect
                  x="174"
                  y="14"
                  width="46"
                  height="18"
                  rx="2"
                  fill="var(--ws-surface)"
                  stroke={palette.stroke}
                  strokeWidth="1"
                />
                <text
                  x="197"
                  y="26.5"
                  textAnchor="middle"
                  fill={palette.stroke}
                  fontSize="10"
                  fontFamily="var(--font-mono)"
                  fontWeight="600"
                >
                  +{originSummary.overflowCount}
                </text>
              </g>
            )}

            {/* Central focal point */}
            <circle
              cx="120"
              cy="84"
              r="7.5"
              fill="var(--ws-surface)"
              stroke={palette.stroke}
              strokeWidth="1.75"
            />
            <circle cx="120" cy="84" r="3" fill={palette.stroke} />
          </svg>

          {originSummary.isCapped && (
            <p className="mt-1 text-center font-mono-tabular text-[10px] text-[var(--ws-ink-muted)]">
              {t.briefing.artworkOverflowNote(
                originSummary.displayedCount,
                originSummary.totalCount
              )}
            </p>
          )}
        </div>

        {/* Right: Structured Signal Context & Derived Evidence Summary */}
        <figcaption className="flex-1 min-w-0 border-t border-[var(--ws-border)] pt-3.5 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-5 flex flex-col justify-between gap-3.5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span
                className={`font-mono-tabular text-[10.5px] font-semibold uppercase tracking-[0.12em] ${palette.textClass}`}
              >
                {t.briefing.artworkCaption}
              </span>
              {eventRange && (
                <span className="font-mono-tabular text-[10.5px] text-[var(--ws-ink-muted)]">
                  {eventRange}
                </span>
              )}
            </div>

            {signal.event.geography.length > 0 && (
              <div className="text-[11.5px] leading-snug text-[var(--ws-ink-secondary)] break-words">
                {signal.event.geography.join(' · ')}
              </div>
            )}

            {originSummary.namedGroups.length > 0 && (
              <div className="font-mono-tabular text-[10.5px] text-[var(--ws-ink-muted)] break-words">
                {originSummary.namedGroups.slice(0, 4).join(' · ')}
                {originSummary.namedGroups.length > 4
                  ? ` +${originSummary.namedGroups.length - 4}`
                  : ''}
              </div>
            )}
          </div>

          {/* Importance 1–5 Calibrated Architectural Scale */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between font-mono-tabular text-[11px]">
              <span className="text-[var(--ws-ink-muted)]">
                {t.expanded.importanceLabel}
              </span>
              <span className="font-semibold text-[var(--ws-ink)]">
                {signal.importance} / 5
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1" aria-hidden="true">
              {importanceSteps.map((step) => (
                <span
                  key={step}
                  className={`h-[5px] rounded-[1px] ${
                    step <= signal.importance
                      ? palette.barClass
                      : 'bg-[var(--ws-border)]'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Story-Specific Structured Timeline & Declared Linkages Strip (Schema v2 when present) */}
          {(totalMilestones > 0 || declaredRelationships.length > 0) && (
            <div className="border-t border-[var(--ws-border-subtle)] pt-2.5 space-y-2">
              {timelineMilestones.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between font-mono-tabular text-[10px] text-[var(--ws-ink-muted)]">
                    <span>{t.briefing.artworkTimelineMilestones(totalMilestones)}</span>
                    <span>
                      {timelineMilestones[0]?.occurred_at}
                      {timelineMilestones.length > 1
                        ? ` → ${timelineMilestones[timelineMilestones.length - 1]?.occurred_at}`
                        : ''}
                    </span>
                  </div>
                  <div className="relative flex items-center justify-between px-1 py-1" aria-hidden="true">
                    <div className="absolute inset-x-1 top-1/2 h-[1px] -translate-y-1/2 bg-[var(--ws-border-strong)]" />
                    {timelineMilestones.map((ev, idx) => (
                      <span
                        key={ev.event_id}
                        className={`relative z-10 h-2 w-2 rounded-full border ${
                          idx === timelineMilestones.length - 1
                            ? `${palette.barClass} border-transparent`
                            : 'bg-[var(--ws-surface)] border-[var(--ws-rule-editorial)]'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {declaredRelationships.length > 0 && (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono-tabular text-[10.5px] text-[var(--ws-ink-muted)]">
                  <span className="font-semibold text-[var(--ws-ink-secondary)]">
                    {t.briefing.artworkDeclaredLinks(declaredRelationships.length)}
                  </span>
                  {(['world', 'ai', 'economy'] as const).map((d) =>
                    relDomainCounts[d] ? (
                      <span key={d} className={getDomainPalette(d).textClass}>
                        · {t.domains[d]} {relDomainCounts[d]}
                      </span>
                    ) : null
                  )}
                </div>
              )}
            </div>
          )}

          {/* Key Derived Evidence Figures */}
          <dl className="grid grid-cols-3 gap-2 border-t border-[var(--ws-border-subtle)] pt-2.5 font-mono-tabular">
            <div className="min-w-0">
              <dt className="text-[10px] uppercase tracking-[0.06em] text-[var(--ws-ink-muted)] truncate">
                {t.briefing.artworkOriginsLabel}
              </dt>
              <dd className="mt-0.5 font-display text-[1.25rem] font-semibold leading-none text-[var(--ws-ink)] tabular-nums">
                {originSummary.totalCount}
              </dd>
            </div>
            <div className="min-w-0 border-l border-[var(--ws-border-subtle)] pl-2.5">
              <dt className="text-[10px] uppercase tracking-[0.06em] text-[var(--ws-ink-muted)] truncate">
                {t.briefing.artworkClaimsLabel}
              </dt>
              <dd className="mt-0.5 font-display text-[1.25rem] font-semibold leading-none text-[var(--ws-ink)] tabular-nums">
                {signal.claims.length}
              </dd>
            </div>
            <div className="min-w-0 border-l border-[var(--ws-border-subtle)] pl-2.5">
              <dt className="text-[10px] uppercase tracking-[0.06em] text-[var(--ws-ink-muted)] truncate">
                {t.briefing.artworkSourcesLabel}
              </dt>
              <dd className="mt-0.5 font-display text-[1.25rem] font-semibold leading-none text-[var(--ws-ink)] tabular-nums">
                {signal.sources.length}
              </dd>
            </div>
          </dl>
        </figcaption>
      </div>

      {/* Explicit Illustrative Non-Documentary Footnote */}
      <div className="border-t border-[var(--ws-border-subtle)] bg-[var(--ws-surface-elevated)]/85 px-4 py-1.5 font-mono-tabular text-[10px] leading-snug text-[var(--ws-ink-faint)]">
        {t.briefing.artworkIllustrativeNote}
      </div>
    </figure>
  );
};

/**
 * Crisp geometric domain emblem for the Three-Domain Overview & domain headers.
 */
export const DomainEditorialEmblem: React.FC<{
  domain: SignalDomain;
  className?: string;
}> = ({ domain, className = 'h-7 w-7' }) => {
  const palette = getDomainPalette(domain);

  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
      className={`${className} shrink-0`}
    >
      {domain === 'world' && (
        <>
          <circle
            cx="14"
            cy="14"
            r="11"
            fill={palette.softFill}
            stroke={palette.stroke}
            strokeWidth="1.25"
          />
          <ellipse
            cx="14"
            cy="14"
            rx="4.8"
            ry="11"
            stroke={palette.stroke}
            strokeWidth="1.05"
          />
          <line
            x1="3"
            y1="14"
            x2="25"
            y2="14"
            stroke={palette.stroke}
            strokeWidth="1.05"
          />
          <circle cx="14" cy="14" r="2" fill={palette.stroke} />
        </>
      )}
      {domain === 'ai' && (
        <>
          <polygon
            points="14,3 23.5,8.5 23.5,19.5 14,25 4.5,19.5 4.5,8.5"
            fill={palette.softFill}
            stroke={palette.stroke}
            strokeWidth="1.25"
          />
          <line
            x1="14"
            y1="3"
            x2="14"
            y2="25"
            stroke={palette.stroke}
            strokeWidth="0.95"
            opacity="0.55"
          />
          <line
            x1="4.5"
            y1="8.5"
            x2="23.5"
            y2="19.5"
            stroke={palette.stroke}
            strokeWidth="0.95"
            opacity="0.55"
          />
          <line
            x1="23.5"
            y1="8.5"
            x2="4.5"
            y2="19.5"
            stroke={palette.stroke}
            strokeWidth="0.95"
            opacity="0.55"
          />
          <circle cx="14" cy="14" r="2.6" fill={palette.stroke} />
        </>
      )}
      {domain === 'economy' && (
        <>
          <rect
            x="4"
            y="4"
            width="20"
            height="20"
            rx="1.5"
            fill={palette.softFill}
            stroke={palette.stroke}
            strokeWidth="1.25"
          />
          <line
            x1="8"
            y1="19"
            x2="20"
            y2="19"
            stroke={palette.stroke}
            strokeWidth="1.2"
          />
          <rect
            x="8.5"
            y="13.5"
            width="2.6"
            height="5.5"
            fill={palette.stroke}
            opacity="0.55"
          />
          <rect
            x="12.7"
            y="10.5"
            width="2.6"
            height="8.5"
            fill={palette.stroke}
            opacity="0.8"
          />
          <rect
            x="16.9"
            y="7.5"
            width="2.6"
            height="11.5"
            fill={palette.stroke}
          />
        </>
      )}
    </svg>
  );
};
