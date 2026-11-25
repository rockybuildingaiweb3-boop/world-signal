import React from 'react';
import type { ParsedSignal, SignalDomain, UiLanguage } from '../../types/edition';
import { getUiStrings } from '../../lib/i18n/uiStrings';
import { buildOriginMarkerSummary } from '../../lib/intelligence/visual-metrics/editorialVisualHelpers';
import { formatEventDateRange } from '../../lib/dates/formatDates';
import { confidenceColorClass } from '../../lib/filtering/filterSignals';

interface EditorialSignalArtworkProps {
  signal: ParsedSignal;
  lang: UiLanguage;
  signalDomainById?: Map<string, SignalDomain>;
}

function domainVars(domain: SignalDomain): {
  stroke: string;
  softBg: string;
  textClass: string;
} {
  switch (domain) {
    case 'world':
      return {
        stroke: 'var(--ws-world)',
        softBg: 'var(--ws-world-soft)',
        textClass: 'text-[var(--ws-world)]',
      };
    case 'ai':
      return {
        stroke: 'var(--ws-ai)',
        softBg: 'var(--ws-ai-soft)',
        textClass: 'text-[var(--ws-ai)]',
      };
    case 'economy':
      return {
        stroke: 'var(--ws-economy)',
        softBg: 'var(--ws-economy-soft)',
        textClass: 'text-[var(--ws-economy)]',
      };
  }
}

/**
 * Minimal architectural domain emblem used in Three-Domain Overview & desk headers.
 */
export const DomainEditorialEmblem: React.FC<{
  domain: SignalDomain;
  className?: string;
}> = ({ domain, className = 'h-7 w-7' }) => {
  const { stroke } = domainVars(domain);

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={`${className} shrink-0`}
    >
      {domain === 'world' && (
        <>
          <circle cx="16" cy="16" r="12" stroke={stroke} strokeWidth="1.25" />
          <ellipse cx="16" cy="16" rx="5.5" ry="12" stroke={stroke} strokeWidth="1" opacity="0.7" />
          <line x1="4" y1="16" x2="28" y2="16" stroke={stroke} strokeWidth="1" opacity="0.7" />
          <line x1="6.5" y1="10.5" x2="25.5" y2="10.5" stroke={stroke} strokeWidth="0.8" opacity="0.4" />
          <line x1="6.5" y1="21.5" x2="25.5" y2="21.5" stroke={stroke} strokeWidth="0.8" opacity="0.4" />
          <rect x="14.5" y="14.5" width="3" height="3" fill={stroke} />
        </>
      )}
      {domain === 'ai' && (
        <>
          <polygon
            points="16,4 27,10.5 27,21.5 16,28 5,21.5 5,10.5"
            stroke={stroke}
            strokeWidth="1.25"
          />
          <polygon
            points="16,9.5 22,13 22,19 16,22.5 10,19 10,13"
            stroke={stroke}
            strokeWidth="1"
            opacity="0.72"
          />
          <line x1="16" y1="4" x2="16" y2="9.5" stroke={stroke} strokeWidth="0.9" opacity="0.55" />
          <line x1="27" y1="21.5" x2="22" y2="19" stroke={stroke} strokeWidth="0.9" opacity="0.55" />
          <line x1="5" y1="21.5" x2="10" y2="19" stroke={stroke} strokeWidth="0.9" opacity="0.55" />
          <circle cx="16" cy="16" r="2.2" fill={stroke} />
        </>
      )}
      {domain === 'economy' && (
        <>
          <line x1="4" y1="25" x2="28" y2="25" stroke={stroke} strokeWidth="1.25" />
          <line x1="4" y1="11" x2="28" y2="11" stroke={stroke} strokeWidth="0.8" strokeDasharray="2 2" opacity="0.45" />
          <rect x="6.5" y="17" width="3.8" height="8" stroke={stroke} strokeWidth="1.15" />
          <rect x="14.1" y="12.5" width="3.8" height="12.5" stroke={stroke} strokeWidth="1.15" fill={stroke} fillOpacity="0.18" />
          <rect x="21.7" y="7" width="3.8" height="18" stroke={stroke} strokeWidth="1.15" fill={stroke} fillOpacity="0.34" />
        </>
      )}
    </svg>
  );
};

/**
 * Signature multi-composition editorial illustration plate for the Cover Story.
 * Encodes ONLY verified structured metadata from the active signal:
 * - Domain determines architectural composition (World Meridian / AI Lattice / Economy Balance)
 * - Importance (1-5) drives calibrated geometry weight
 * - Independent reporting origins drive exact plotted node count (with explicit overflow disclosure)
 * - Structured timeline events render along a chronology baseline when present
 * - Explicit non-documentary colophon clearly distinguishes illustration from photography.
 */
export const EditorialSignalArtwork: React.FC<EditorialSignalArtworkProps> = ({
  signal,
  lang,
}) => {
  const t = getUiStrings(lang);
  const originSummary = buildOriginMarkerSummary(
    signal.independentOriginCount,
    signal.independentGroups,
    8
  );
  const spec = {
    domain: signal.domain,
    importance: signal.importance,
    independentOrigins: originSummary.totalCount,
    claimCount: signal.claims.length,
    sourceRecordCount: signal.sources.length,
    timelineEventCount: signal.timelineEvents.length,
    explicitRelationshipCount: signal.relationships.length,
    geographyLabels: signal.event.geography,
  };
  const { stroke, textClass } = domainVars(spec.domain);

  const eventRange = formatEventDateRange(
    signal.event.start_date,
    signal.event.end_date,
    lang
  );
  const geoLine =
    spec.geographyLabels.length > 0 ? spec.geographyLabels.join(' · ') : signal.topic;

  const displayedOrigins = originSummary.displayedCount;
  const hasOriginOverflow = originSummary.isCapped;
  const displayedMilestones = Math.min(spec.timelineEventCount, 6);

  return (
    <figure className="overflow-hidden rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-surface)] shadow-[var(--ws-shadow-sm)]">
      {/* Figure Plate Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-[var(--ws-border-subtle)] bg-[var(--ws-surface-elevated)] px-4 py-2.5">
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-x-2 gap-y-0.5 min-w-0">
          <span className={`ws-kicker ${textClass}`}>
            {t.briefing.coverPlateTitles[spec.domain]}
          </span>
          <span aria-hidden="true" className="hidden sm:inline text-[var(--ws-ink-faint)]">
            ·
          </span>
          <span className="font-mono-tabular text-[11px] text-[var(--ws-ink-muted)] truncate max-w-[260px]">
            {geoLine}
          </span>
        </div>
        <span className="font-mono-tabular text-[11px] text-[var(--ws-ink-muted)] shrink-0">
          {eventRange}
        </span>
      </div>

      {/* Bespoke Domain-Distinct Architectural SVG Plate */}
      <div className="relative bg-[var(--ws-canvas)]/70 px-4 py-4 sm:px-6 sm:py-5">
        <svg
          viewBox="0 0 640 206"
          className="w-full h-auto block"
          role="img"
          aria-label={`${t.briefing.artworkCaption}: ${signal.headline}`}
        >
          {/* Subtle Archival Blueprint Grid Lines */}
          {[32, 82, 132, 178].map((y) => (
            <line
              key={`h-${y}`}
              x1="12"
              y1={y}
              x2="628"
              y2={y}
              stroke="var(--ws-border)"
              strokeWidth="0.7"
              strokeDasharray={y === 178 ? undefined : '2 5'}
              opacity={y === 178 ? 0.9 : 0.7}
            />
          ))}
          {[12, 166, 320, 474, 628].map((x) => (
            <line
              key={`v-${x}`}
              x1={x}
              y1="14"
              x2={x}
              y2="178"
              stroke="var(--ws-border)"
              strokeWidth="0.6"
              opacity="0.5"
            />
          ))}

          {/* DOMAIN PLATE A: WORLD EVENTS — Geopolitical Meridian Projection */}
          {spec.domain === 'world' && (
            <g>
              {/* Concentric Meridian Horizon Arcs */}
              <circle cx="195" cy="96" r="76" fill="none" stroke={stroke} strokeWidth="0.85" opacity="0.28" />
              <circle cx="195" cy="96" r="56" fill="none" stroke={stroke} strokeWidth="1.05" opacity="0.52" />
              <circle cx="195" cy="96" r="34" fill={stroke} fillOpacity="0.06" stroke={stroke} strokeWidth="1.15" opacity="0.8" />
              <ellipse cx="195" cy="96" rx="28" ry="76" fill="none" stroke={stroke} strokeWidth="0.9" opacity="0.45" />
              <ellipse cx="195" cy="96" rx="76" ry="26" fill="none" stroke={stroke} strokeWidth="0.9" opacity="0.45" />
              <line x1="104" y1="96" x2="286" y2="96" stroke={stroke} strokeWidth="0.9" opacity="0.55" />
              <line x1="195" y1="14" x2="195" y2="178" stroke={stroke} strokeWidth="0.9" opacity="0.55" />

              {/* Focal Signal Core */}
              <circle cx="195" cy="96" r="6" fill="var(--ws-surface)" stroke="var(--ws-editorial-accent)" strokeWidth="2" />
              <circle cx="195" cy="96" r="2.2" fill="var(--ws-editorial-accent)" />

              {/* Plotted Independent Origin Nodes Along Meridian Perimeter */}
              {Array.from({ length: displayedOrigins }).map((_, idx) => {
                const angle = (-Math.PI * 0.72) + (idx / Math.max(displayedOrigins - 1, 1)) * (Math.PI * 1.44);
                const nx = 195 + Math.cos(angle) * 56;
                const ny = 96 + Math.sin(angle) * 56;
                return (
                  <g key={`origin-w-${idx}`}>
                    <line x1="195" y1="96" x2={nx} y2={ny} stroke={stroke} strokeWidth="0.8" opacity="0.42" />
                    <circle cx={nx} cy={ny} r="4" fill="var(--ws-surface)" stroke={stroke} strokeWidth="1.5" />
                    <circle cx={nx} cy={ny} r="1.5" fill={stroke} />
                  </g>
                );
              })}

              {/* Right-Side Structured Calibrated Bars (Importance + Evidence Density) */}
              <g transform="translate(342, 26)">
                <text x="0" y="10" fill="var(--ws-ink-muted)" fontSize="9.5" className="font-mono-tabular">
                  {t.expanded.importanceLabel.toUpperCase()}
                </text>
                <text x="266" y="10" textAnchor="end" fill="var(--ws-ink)" fontSize="11" fontWeight="600" className="font-mono-tabular">
                  {spec.importance}/5
                </text>
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <rect
                    key={lvl}
                    x={(lvl - 1) * 54}
                    y="18"
                    width="48"
                    height="7"
                    rx="1"
                    fill={lvl <= spec.importance ? stroke : 'var(--ws-border)'}
                    opacity={lvl <= spec.importance ? 0.92 : 0.55}
                  />
                ))}

                {/* Claims vs Source Records Scale */}
                <text x="0" y="54" fill="var(--ws-ink-muted)" fontSize="9.5" className="font-mono-tabular">
                  {t.briefing.artworkClaimsLabel.toUpperCase()} ({spec.claimCount}) · {t.briefing.artworkSourcesLabel.toUpperCase()} ({spec.sourceRecordCount})
                </text>
                <rect x="0" y="62" width="266" height="5" rx="1" fill="var(--ws-border)" opacity="0.5" />
                <rect
                  x="0"
                  y="62"
                  width={Math.min(266, Math.max(24, (spec.claimCount / Math.max(spec.claimCount + spec.sourceRecordCount, 1)) * 266))}
                  height="5"
                  rx="1"
                  fill={stroke}
                />

                {/* Origin Coverage Ledger Marks */}
                <text x="0" y="98" fill="var(--ws-ink-muted)" fontSize="9.5" className="font-mono-tabular">
                  {t.briefing.artworkOriginsLabel.toUpperCase()}
                </text>
                <text x="266" y="98" textAnchor="end" fill="var(--ws-ink)" fontSize="11" fontWeight="600" className="font-mono-tabular">
                  {spec.independentOrigins}
                </text>
                <g transform="translate(0, 106)">
                  {Array.from({ length: Math.max(displayedOrigins, 1) }).map((_, idx) => (
                    <rect
                      key={`bar-o-${idx}`}
                      x={idx * 32}
                      y="0"
                      width="26"
                      height="18"
                      rx="1.5"
                      fill={spec.independentOrigins > 0 ? stroke : 'var(--ws-border)'}
                      fillOpacity={spec.independentOrigins > 0 ? 0.14 + (idx % 3) * 0.12 : 0.3}
                      stroke={spec.independentOrigins > 0 ? stroke : 'var(--ws-border-strong)'}
                      strokeWidth="1"
                    />
                  ))}
                </g>
              </g>
            </g>
          )}

          {/* DOMAIN PLATE B: AI FRONTIER — Layered Architectural Inference Lattice */}
          {spec.domain === 'ai' && (
            <g>
              {/* Layered Isometric Architectural Planes */}
              {[0, 1, 2].map((layer) => {
                const dy = layer * 24;
                return (
                  <polygon
                    key={`plane-${layer}`}
                    points={`190,${26 + dy} 298,${56 + dy} 190,${86 + dy} 82,${56 + dy}`}
                    fill={stroke}
                    fillOpacity={0.04 + layer * 0.035}
                    stroke={stroke}
                    strokeWidth={layer === 1 ? '1.3' : '0.9'}
                    opacity={0.45 + layer * 0.2}
                  />
                );
              })}
              {/* Vertical Architectural Axis */}
              <line x1="190" y1="26" x2="190" y2="152" stroke={stroke} strokeWidth="1" strokeDasharray="3 3" opacity="0.65" />
              <circle cx="190" cy="80" r="6" fill="var(--ws-surface)" stroke="var(--ws-editorial-accent)" strokeWidth="2" />
              <circle cx="190" cy="80" r="2.2" fill="var(--ws-editorial-accent)" />

              {/* Plotted Origin Nodes Along Upper Lattice Rim */}
              {Array.from({ length: displayedOrigins }).map((_, idx) => {
                const ratio = displayedOrigins > 1 ? idx / (displayedOrigins - 1) : 0.5;
                const nx = 96 + ratio * 188;
                const ny = 152 - Math.sin(ratio * Math.PI) * 18;
                return (
                  <g key={`origin-ai-${idx}`}>
                    <line x1="190" y1="80" x2={nx} y2={ny} stroke={stroke} strokeWidth="0.75" opacity="0.38" />
                    <rect x={nx - 3.5} y={ny - 3.5} width="7" height="7" fill="var(--ws-surface)" stroke={stroke} strokeWidth="1.4" />
                  </g>
                );
              })}

              {/* Right-Side Structured Calibrated Bars */}
              <g transform="translate(342, 26)">
                <text x="0" y="10" fill="var(--ws-ink-muted)" fontSize="9.5" className="font-mono-tabular">
                  {t.expanded.importanceLabel.toUpperCase()}
                </text>
                <text x="266" y="10" textAnchor="end" fill="var(--ws-ink)" fontSize="11" fontWeight="600" className="font-mono-tabular">
                  {spec.importance}/5
                </text>
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <rect
                    key={lvl}
                    x={(lvl - 1) * 54}
                    y="18"
                    width="48"
                    height="7"
                    rx="1"
                    fill={lvl <= spec.importance ? stroke : 'var(--ws-border)'}
                    opacity={lvl <= spec.importance ? 0.92 : 0.55}
                  />
                ))}

                <text x="0" y="54" fill="var(--ws-ink-muted)" fontSize="9.5" className="font-mono-tabular">
                  {t.briefing.artworkClaimsLabel.toUpperCase()} ({spec.claimCount}) · {t.briefing.artworkSourcesLabel.toUpperCase()} ({spec.sourceRecordCount})
                </text>
                <rect x="0" y="62" width="266" height="5" rx="1" fill="var(--ws-border)" opacity="0.5" />
                <rect
                  x="0"
                  y="62"
                  width={Math.min(266, Math.max(24, (spec.claimCount / Math.max(spec.claimCount + spec.sourceRecordCount, 1)) * 266))}
                  height="5"
                  rx="1"
                  fill={stroke}
                />

                <text x="0" y="98" fill="var(--ws-ink-muted)" fontSize="9.5" className="font-mono-tabular">
                  {t.briefing.artworkOriginsLabel.toUpperCase()}
                </text>
                <text x="266" y="98" textAnchor="end" fill="var(--ws-ink)" fontSize="11" fontWeight="600" className="font-mono-tabular">
                  {spec.independentOrigins}
                </text>
                <g transform="translate(0, 106)">
                  {Array.from({ length: Math.max(displayedOrigins, 1) }).map((_, idx) => (
                    <rect
                      key={`bar-ai-${idx}`}
                      x={idx * 32}
                      y="0"
                      width="26"
                      height="18"
                      rx="1.5"
                      fill={spec.independentOrigins > 0 ? stroke : 'var(--ws-border)'}
                      fillOpacity={spec.independentOrigins > 0 ? 0.14 + (idx % 3) * 0.12 : 0.3}
                      stroke={spec.independentOrigins > 0 ? stroke : 'var(--ws-border-strong)'}
                      strokeWidth="1"
                    />
                  ))}
                </g>
              </g>
            </g>
          )}

          {/* DOMAIN PLATE C: ECONOMIC OUTLOOK — Structural Balance & Corridor Plate */}
          {spec.domain === 'economy' && (
            <g>
              {/* Calibrated Structural Elevation Columns (5-Tier Importance Scale) */}
              {[1, 2, 3, 4, 5].map((tier) => {
                const bx = 54 + (tier - 1) * 46;
                const bh = 28 + tier * 21;
                const by = 160 - bh;
                const active = tier <= spec.importance;
                return (
                  <g key={`tier-${tier}`}>
                    <rect
                      x={bx}
                      y={by}
                      width="32"
                      height={bh}
                      rx="1.5"
                      fill={active ? stroke : 'var(--ws-surface-subtle)'}
                      fillOpacity={active ? 0.14 + tier * 0.1 : 0.65}
                      stroke={active ? stroke : 'var(--ws-border-strong)'}
                      strokeWidth={tier === spec.importance ? '1.6' : '1'}
                    />
                    <text
                      x={bx + 16}
                      y="173"
                      textAnchor="middle"
                      fill="var(--ws-ink-muted)"
                      fontSize="9"
                      className="font-mono-tabular"
                    >
                      0{tier}
                    </text>
                  </g>
                );
              })}
              {/* Structural Corridor Curve */}
              <path
                d="M 54 132 C 120 120, 180 78, 270 46"
                fill="none"
                stroke="var(--ws-editorial-accent)"
                strokeWidth="1.6"
                strokeDasharray="4 3"
              />
              <circle cx="270" cy="46" r="4.5" fill="var(--ws-surface)" stroke="var(--ws-editorial-accent)" strokeWidth="1.8" />

              {/* Right-Side Structured Calibrated Bars */}
              <g transform="translate(342, 26)">
                <text x="0" y="10" fill="var(--ws-ink-muted)" fontSize="9.5" className="font-mono-tabular">
                  {t.expanded.importanceLabel.toUpperCase()}
                </text>
                <text x="266" y="10" textAnchor="end" fill="var(--ws-ink)" fontSize="11" fontWeight="600" className="font-mono-tabular">
                  {spec.importance}/5
                </text>
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <rect
                    key={lvl}
                    x={(lvl - 1) * 54}
                    y="18"
                    width="48"
                    height="7"
                    rx="1"
                    fill={lvl <= spec.importance ? stroke : 'var(--ws-border)'}
                    opacity={lvl <= spec.importance ? 0.92 : 0.55}
                  />
                ))}

                <text x="0" y="54" fill="var(--ws-ink-muted)" fontSize="9.5" className="font-mono-tabular">
                  {t.briefing.artworkClaimsLabel.toUpperCase()} ({spec.claimCount}) · {t.briefing.artworkSourcesLabel.toUpperCase()} ({spec.sourceRecordCount})
                </text>
                <rect x="0" y="62" width="266" height="5" rx="1" fill="var(--ws-border)" opacity="0.5" />
                <rect
                  x="0"
                  y="62"
                  width={Math.min(266, Math.max(24, (spec.claimCount / Math.max(spec.claimCount + spec.sourceRecordCount, 1)) * 266))}
                  height="5"
                  rx="1"
                  fill={stroke}
                />

                <text x="0" y="98" fill="var(--ws-ink-muted)" fontSize="9.5" className="font-mono-tabular">
                  {t.briefing.artworkOriginsLabel.toUpperCase()}
                </text>
                <text x="266" y="98" textAnchor="end" fill="var(--ws-ink)" fontSize="11" fontWeight="600" className="font-mono-tabular">
                  {spec.independentOrigins}
                </text>
                <g transform="translate(0, 106)">
                  {Array.from({ length: Math.max(displayedOrigins, 1) }).map((_, idx) => (
                    <rect
                      key={`bar-ec-${idx}`}
                      x={idx * 32}
                      y="0"
                      width="26"
                      height="18"
                      rx="1.5"
                      fill={spec.independentOrigins > 0 ? stroke : 'var(--ws-border)'}
                      fillOpacity={spec.independentOrigins > 0 ? 0.14 + (idx % 3) * 0.12 : 0.3}
                      stroke={spec.independentOrigins > 0 ? stroke : 'var(--ws-border-strong)'}
                      strokeWidth="1"
                    />
                  ))}
                </g>
              </g>
            </g>
          )}

          {/* Integrated Chronology Baseline (Only Rendered When Real Structured Timeline Events Exist) */}
          {displayedMilestones > 0 && (
            <g transform="translate(12, 186)">
              <line x1="0" y1="7" x2="616" y2="7" stroke="var(--ws-border-strong)" strokeWidth="1" />
              {Array.from({ length: displayedMilestones }).map((_, idx) => {
                const mx =
                  displayedMilestones === 1
                    ? 308
                    : 28 + (idx / (displayedMilestones - 1)) * 560;
                const isLast = idx === displayedMilestones - 1;
                return (
                  <g key={`ms-${idx}`}>
                    <rect
                      x={mx - 3.5}
                      y="3.5"
                      width="7"
                      height="7"
                      fill={isLast ? 'var(--ws-editorial-accent)' : 'var(--ws-surface)'}
                      stroke={isLast ? 'var(--ws-editorial-accent)' : stroke}
                      strokeWidth="1.4"
                    />
                  </g>
                );
              })}
            </g>
          )}
        </svg>
      </div>

      {/* Exact Structured Telemetry & Colophon Footer */}
      <figcaption className="border-t border-[var(--ws-border-subtle)] bg-[var(--ws-surface)] px-4 py-2.5 space-y-1.5">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 font-mono-tabular text-[11px] text-[var(--ws-ink-muted)]">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
            <span>
              <strong className="text-[var(--ws-ink)]">{spec.independentOrigins}</strong>{' '}
              {t.briefing.artworkOriginsLabel}
            </span>
            <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">·</span>
            <span>
              <strong className="text-[var(--ws-ink)]">{spec.claimCount}</strong>{' '}
              {t.briefing.artworkClaimsLabel}
            </span>
            <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">·</span>
            <span>
              <strong className="text-[var(--ws-ink)]">{spec.sourceRecordCount}</strong>{' '}
              {t.briefing.artworkSourcesLabel}
            </span>
            {spec.timelineEventCount > 0 && (
              <>
                <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">·</span>
                <span>{t.briefing.artworkTimelineMilestones(spec.timelineEventCount)}</span>
              </>
            )}
            {spec.explicitRelationshipCount > 0 && (
              <>
                <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">·</span>
                <span>{t.briefing.artworkDeclaredLinks(spec.explicitRelationshipCount)}</span>
              </>
            )}
          </div>
          <span className={`font-semibold ${confidenceColorClass(signal.confidence.overall)}`}>
            {t.metaLine.confidence(t.confidence[signal.confidence.overall])}
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-0.5 text-[10.5px] text-[var(--ws-ink-faint)]">
          <span>{t.briefing.artworkIllustrativeNote}</span>
          {hasOriginOverflow && (
            <span className="font-mono-tabular">
              {t.briefing.artworkOverflowNote(displayedOrigins, spec.independentOrigins)}
            </span>
          )}
        </div>
      </figcaption>
    </figure>
  );
};
