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

function clipEngravingLabel(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen - 1).trimEnd()}…`;
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
 * Full-canvas architectural editorial illustration plate for the Cover Story.
 * Designed as an engraved print-publication figure (never a redundant widget or chart):
 * - Domain determines architectural composition (World Meridian Atlas / AI Isometric Lattice / Economy Elevation Plate)
 * - Importance (1-5) drives calibrated structural ring/tier cadence
 * - Independent reporting origins plot exact verified nodes along the geometric frame
 * - Verified geography/topic labels and chronology milestones are engraved directly from structured metadata
 * - Explicit non-documentary colophon clearly distinguishes editorial illustration from photography.
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
    geographyLabels: signal.event.geography.slice(0, 4),
  };
  const { stroke, textClass } = domainVars(spec.domain);

  const eventRange = formatEventDateRange(
    signal.event.start_date,
    signal.event.end_date,
    lang
  );
  const geoLine =
    signal.event.geography.length > 0
      ? signal.event.geography.join(' · ')
      : signal.topic;

  const displayedOrigins = originSummary.displayedCount;
  const hasOriginOverflow = originSummary.isCapped;
  const displayedMilestones = Math.min(spec.timelineEventCount, 6);
  const engravedGeoItems =
    spec.geographyLabels.length > 0 ? spec.geographyLabels : [signal.topic];

  return (
    <figure className="ws-plate-frame overflow-hidden">
      {/* Archival Figure Plate Header */}
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-[var(--ws-border-subtle)] bg-[var(--ws-surface-elevated)] px-4 py-2">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 min-w-0">
          <span className="font-mono-tabular text-[11px] font-semibold tracking-[0.1em] text-[var(--ws-ink-faint)] shrink-0">
            {t.briefing.coverPlateFolio[spec.domain]}
          </span>
          <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">
            /
          </span>
          <span className={`ws-kicker ${textClass} shrink-0`}>
            {t.briefing.coverPlateTitles[spec.domain]}
          </span>
          <span aria-hidden="true" className="hidden sm:inline text-[var(--ws-ink-faint)]">
            ·
          </span>
          <span className="hidden sm:inline text-[12px] text-[var(--ws-ink-muted)] truncate max-w-[270px]">
            {geoLine}
          </span>
        </div>
        <span className="font-mono-tabular text-[11.5px] text-[var(--ws-ink-muted)] shrink-0">
          {eventRange}
        </span>
      </div>

      {/* Full-Canvas Architectural Editorial Engraving Plate */}
      <div className="relative bg-[var(--ws-canvas)]/75 px-3.5 py-3 sm:px-5 sm:py-4">
        <svg
          viewBox="0 0 640 198"
          className="w-full h-auto block"
          role="img"
          aria-label={`${t.briefing.artworkCaption}: ${signal.headline}`}
        >
          <defs>
            <radialGradient id={`ws-plate-glow-${spec.domain}`} cx="50%" cy="50%" r="55%">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.11" />
              <stop offset="65%" stopColor={stroke} stopOpacity="0.03" />
              <stop offset="100%" stopColor={stroke} stopOpacity="0" />
            </radialGradient>
            <linearGradient id={`ws-plate-wash-${spec.domain}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.02" />
              <stop offset="50%" stopColor={stroke} stopOpacity="0.09" />
              <stop offset="100%" stopColor={stroke} stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Subtle Archival Blueprint Grid & Registration Framing */}
          {[32, 74, 116, 158, 174].map((y) => (
            <line
              key={`h-${y}`}
              x1="12"
              y1={y}
              x2="628"
              y2={y}
              stroke="var(--ws-border)"
              strokeWidth={y === 174 ? '0.9' : '0.65'}
              strokeDasharray={y === 174 ? undefined : '2 6'}
              opacity={y === 174 ? 0.9 : 0.65}
            />
          ))}
          {[12, 135, 258, 382, 505, 628].map((x) => (
            <line
              key={`v-${x}`}
              x1={x}
              y1="10"
              x2={x}
              y2="174"
              stroke="var(--ws-border)"
              strokeWidth="0.6"
              opacity="0.45"
            />
          ))}

          {/* Fine Print Registration Corner Marks */}
          <g stroke="var(--ws-border-strong)" strokeWidth="1" opacity="0.9">
            <path d="M 12 17 L 12 10 L 19 10" fill="none" />
            <path d="M 621 10 L 628 10 L 628 17" fill="none" />
            <path d="M 12 167 L 12 174 L 19 174" fill="none" />
            <path d="M 621 174 L 628 174 L 628 167" fill="none" />
          </g>

          {/* DOMAIN PLATE A: WORLD EVENTS — Full-Span Geopolitical Meridian & Corridor Engraving */}
          {spec.domain === 'world' && (
            <g>
              {/* Atmospheric Cartographic Wash */}
              <circle cx="212" cy="92" r="88" fill={`url(#ws-plate-glow-${spec.domain})`} />

              {/* Outer Graduated Azimuth Ring */}
              <circle
                cx="212"
                cy="92"
                r="76"
                fill="none"
                stroke={stroke}
                strokeWidth="0.7"
                strokeDasharray="1.5 4.5"
                opacity="0.45"
              />

              {/* Primary Meridian Projection Sphere */}
              <circle cx="212" cy="92" r="66" fill="none" stroke={stroke} strokeWidth="1.05" opacity="0.58" />
              <circle cx="212" cy="92" r="46" fill={stroke} fillOpacity="0.035" stroke={stroke} strokeWidth="0.9" opacity="0.62" />
              <circle cx="212" cy="92" r="24" fill={stroke} fillOpacity="0.06" stroke={stroke} strokeWidth="1.1" opacity="0.84" />

              {/* Engraved Longitude & Latitude Ellipses */}
              <ellipse cx="212" cy="92" rx="34" ry="66" fill="none" stroke={stroke} strokeWidth="0.85" opacity="0.44" />
              <ellipse cx="212" cy="92" rx="14" ry="66" fill="none" stroke={stroke} strokeWidth="0.7" opacity="0.32" />
              <ellipse cx="212" cy="92" rx="66" ry="24" fill="none" stroke={stroke} strokeWidth="0.85" opacity="0.44" />
              <ellipse cx="212" cy="92" rx="66" ry="44" fill="none" stroke={stroke} strokeWidth="0.7" opacity="0.28" />

              {/* Cardinal Meridian Axes */}
              <line x1="122" y1="92" x2="302" y2="92" stroke={stroke} strokeWidth="0.85" opacity="0.55" />
              <line x1="212" y1="14" x2="212" y2="170" stroke={stroke} strokeWidth="0.85" opacity="0.55" />

              {/* Sweeping Geopolitical Corridor Arcs Extending Across Full Plate */}
              <path
                d="M 212 92 Q 320 26, 444 58 T 598 44"
                fill="none"
                stroke={stroke}
                strokeWidth="1.15"
                opacity="0.62"
              />
              <path
                d="M 212 92 Q 332 138, 456 106 T 598 118"
                fill="none"
                stroke="var(--ws-editorial-accent)"
                strokeWidth="1.15"
                strokeDasharray="4 3"
                opacity="0.72"
              />
              <path
                d="M 164 60 Q 320 76, 492 84"
                fill="none"
                stroke={stroke}
                strokeWidth="0.8"
                strokeDasharray="2 3"
                opacity="0.44"
              />

              {/* Focal Signal Epicenter */}
              <circle cx="212" cy="92" r="7.5" fill="var(--ws-surface)" stroke="var(--ws-editorial-accent)" strokeWidth="1.8" />
              <circle cx="212" cy="92" r="2.6" fill="var(--ws-editorial-accent)" />

              {/* Exact Plotted Independent Reporting Origin Nodes Along Meridian Ring */}
              {Array.from({ length: displayedOrigins }).map((_, idx) => {
                const spread = displayedOrigins === 1 ? 0 : (idx / (displayedOrigins - 1)) - 0.5;
                const angle = -Math.PI * 0.15 + spread * Math.PI * 1.35;
                const nx = 212 + Math.cos(angle) * 66;
                const ny = 92 + Math.sin(angle) * 66;
                return (
                  <g key={`origin-w-${idx}`}>
                    <line x1="212" y1="92" x2={nx} y2={ny} stroke={stroke} strokeWidth="0.8" opacity="0.4" />
                    <circle cx={nx} cy={ny} r="4.2" fill="var(--ws-surface)" stroke={stroke} strokeWidth="1.5" />
                    <circle cx={nx} cy={ny} r="1.5" fill={stroke} />
                  </g>
                );
              })}

              {/* Engraved Regional / Geography Index Along Right Meridian Field */}
              <g transform="translate(364, 28)">
                <text
                  x="0"
                  y="10"
                  fill="var(--ws-ink-faint)"
                  fontSize="9.5"
                  fontWeight="600"
                  letterSpacing="0.1em"
                  className="font-mono-tabular uppercase"
                >
                  {t.expanded.geographyLabel}
                </text>
                <line x1="0" y1="17" x2="242" y2="17" stroke="var(--ws-border-strong)" strokeWidth="0.9" />

                {engravedGeoItems.map((label, idx) => {
                  const rowY = 38 + idx * 28;
                  return (
                    <g key={`${label}-${idx}`}>
                      <circle
                        cx="5"
                        cy={rowY - 3.5}
                        r="2.6"
                        fill={idx === 0 ? 'var(--ws-editorial-accent)' : stroke}
                        opacity={idx === 0 ? 0.95 : 0.72}
                      />
                      <line
                        x1="12"
                        y1={rowY - 3.5}
                        x2="26"
                        y2={rowY - 3.5}
                        stroke="var(--ws-border-strong)"
                        strokeWidth="0.8"
                      />
                      <text
                        x="33"
                        y={rowY}
                        fill="var(--ws-ink)"
                        fontSize="11.5"
                        fontWeight={idx === 0 ? '600' : '500'}
                      >
                        {clipEngravingLabel(label, 24)}
                      </text>
                      <text
                        x="242"
                        y={rowY}
                        textAnchor="end"
                        fill="var(--ws-ink-faint)"
                        fontSize="9.5"
                        className="font-mono-tabular"
                      >
                        0{idx + 1}
                      </text>
                    </g>
                  );
                })}

                {/* Calibrated 5-Segment Editorial Weight Engraving */}
                <g transform="translate(0, 126)">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <rect
                      key={`imp-w-${lvl}`}
                      x={(lvl - 1) * 49}
                      y="0"
                      width="42"
                      height="3.5"
                      rx="0.5"
                      fill={lvl <= spec.importance ? stroke : 'var(--ws-border)'}
                      opacity={lvl <= spec.importance ? 0.88 : 0.45}
                    />
                  ))}
                </g>
              </g>
            </g>
          )}

          {/* DOMAIN PLATE B: AI FRONTIER — Full-Span Isometric Architectural Lattice */}
          {spec.domain === 'ai' && (
            <g>
              <rect x="24" y="22" width="592" height="142" fill={`url(#ws-plate-wash-${spec.domain})`} />

              {/* Three Suspended Isometric Architectural Planes Across Center-Left */}
              {[0, 1, 2].map((layer) => {
                const dy = layer * 24;
                return (
                  <polygon
                    key={`plane-${layer}`}
                    points={`228,${22 + dy} 364,${56 + dy} 228,${90 + dy} 92,${56 + dy}`}
                    fill={stroke}
                    fillOpacity={0.04 + layer * 0.035}
                    stroke={stroke}
                    strokeWidth={layer === 1 ? '1.35' : '0.95'}
                    opacity={0.48 + layer * 0.2}
                  />
                );
              })}

              {/* Structural Axis & Inter-Plane Pillars */}
              <line x1="228" y1="22" x2="228" y2="152" stroke={stroke} strokeWidth="1" strokeDasharray="3 3" opacity="0.65" />
              <line x1="92" y1="56" x2="92" y2="104" stroke={stroke} strokeWidth="0.75" opacity="0.4" />
              <line x1="364" y1="56" x2="364" y2="104" stroke={stroke} strokeWidth="0.75" opacity="0.4" />

              {/* Sweeping Inference Conduits to Right Engraving Panel */}
              <path d="M 364 80 C 404 80, 412 52, 456 52" fill="none" stroke={stroke} strokeWidth="1.05" opacity="0.6" />
              <path d="M 364 104 C 406 104, 412 122, 456 122" fill="none" stroke="var(--ws-editorial-accent)" strokeWidth="1.05" strokeDasharray="4 3" opacity="0.72" />

              {/* Focal Core */}
              <circle cx="228" cy="80" r="6.5" fill="var(--ws-surface)" stroke="var(--ws-editorial-accent)" strokeWidth="2" />
              <circle cx="228" cy="80" r="2.2" fill="var(--ws-editorial-accent)" />

              {/* Exact Plotted Independent Origin Nodes */}
              {Array.from({ length: displayedOrigins }).map((_, idx) => {
                const ratio = displayedOrigins > 1 ? idx / (displayedOrigins - 1) : 0.5;
                const nx = 96 + ratio * 264;
                const ny = 152 - Math.sin(ratio * Math.PI) * 18;
                return (
                  <g key={`origin-ai-${idx}`}>
                    <line x1="228" y1="80" x2={nx} y2={ny} stroke={stroke} strokeWidth="0.75" opacity="0.38" />
                    <rect x={nx - 3.5} y={ny - 3.5} width="7" height="7" fill="var(--ws-surface)" stroke={stroke} strokeWidth="1.4" />
                  </g>
                );
              })}

              {/* Engraved Domain Scope & Tier Scale */}
              <g transform="translate(464, 34)">
                <text x="0" y="10" fill="var(--ws-ink-faint)" fontSize="9.5" fontWeight="600" letterSpacing="0.1em" className="font-mono-tabular uppercase">
                  {t.expanded.topicLabel}
                </text>
                <line x1="0" y1="17" x2="146" y2="17" stroke="var(--ws-border-strong)" strokeWidth="0.9" />
                <text x="0" y="38" fill="var(--ws-ink)" fontSize="12" fontWeight="600">
                  {clipEngravingLabel(signal.topic, 18)}
                </text>
                {engravedGeoItems.slice(0, 2).map((gLabel, gIdx) => (
                  <text key={`ai-g-${gIdx}`} x="0" y={62 + gIdx * 20} fill="var(--ws-ink-muted)" fontSize="10.5">
                    {clipEngravingLabel(gLabel, 20)}
                  </text>
                ))}
                <g transform="translate(0, 114)">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <rect
                      key={`imp-ai-${lvl}`}
                      x={(lvl - 1) * 30}
                      y="0"
                      width="24"
                      height="3.5"
                      rx="0.5"
                      fill={lvl <= spec.importance ? stroke : 'var(--ws-border)'}
                      opacity={lvl <= spec.importance ? 0.9 : 0.45}
                    />
                  ))}
                </g>
              </g>
            </g>
          )}

          {/* DOMAIN PLATE C: ECONOMIC OUTLOOK — Full-Span Architectural Elevation & Corridor Plate */}
          {spec.domain === 'economy' && (
            <g>
              <rect x="24" y="24" width="592" height="138" fill={`url(#ws-plate-wash-${spec.domain})`} />

              {/* 5-Tier Calibrated Architectural Monoliths */}
              {[1, 2, 3, 4, 5].map((tier) => {
                const bx = 56 + (tier - 1) * 62;
                const bh = 28 + tier * 20;
                const by = 154 - bh;
                const active = tier <= spec.importance;
                return (
                  <g key={`tier-${tier}`}>
                    <rect
                      x={bx}
                      y={by}
                      width="42"
                      height={bh}
                      rx="1"
                      fill={active ? stroke : 'var(--ws-surface-subtle)'}
                      fillOpacity={active ? 0.12 + tier * 0.09 : 0.55}
                      stroke={active ? stroke : 'var(--ws-border-strong)'}
                      strokeWidth={tier === spec.importance ? '1.6' : '0.95'}
                    />
                    <text
                      x={bx + 21}
                      y="167"
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

              {/* Sweeping Macro Transmission Arc */}
              <path
                d="M 56 126 C 148 112, 232 62, 346 36 C 414 22, 488 52, 588 46"
                fill="none"
                stroke="var(--ws-editorial-accent)"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
              <circle cx="346" cy="36" r="5" fill="var(--ws-surface)" stroke="var(--ws-editorial-accent)" strokeWidth="1.8" />

              {/* Plotted Origin Nodes Along Horizon */}
              {Array.from({ length: displayedOrigins }).map((_, idx) => {
                const nx = 412 + (idx / Math.max(displayedOrigins - 1, 1)) * 184;
                const ny = 108 + (idx % 2 === 0 ? -10 : 10);
                return (
                  <g key={`origin-ec-${idx}`}>
                    <line x1={nx} y1={ny} x2={nx} y2="154" stroke={stroke} strokeWidth="0.8" opacity="0.45" />
                    <circle cx={nx} cy={ny} r="3.8" fill="var(--ws-surface)" stroke={stroke} strokeWidth="1.5" />
                  </g>
                );
              })}

              {/* Engraved Regional & Topic Scope */}
              <g transform="translate(412, 62)">
                <text x="0" y="0" fill="var(--ws-ink)" fontSize="11.5" fontWeight="600">
                  {clipEngravingLabel(geoLine, 26)}
                </text>
              </g>
            </g>
          )}

          {/* Integrated Structured Chronology Rail (Only Rendered When Real Structured Timeline Events Exist) */}
          {displayedMilestones > 0 && (
            <g transform="translate(12, 182)">
              <line x1="0" y1="6" x2="616" y2="6" stroke="var(--ws-border-strong)" strokeWidth="0.95" />
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
                      y="2.5"
                      width="7"
                      height="7"
                      fill={isLast ? 'var(--ws-editorial-accent)' : 'var(--ws-surface)'}
                      stroke={isLast ? 'var(--ws-editorial-accent)' : stroke}
                      strokeWidth="1.35"
                    />
                  </g>
                );
              })}
            </g>
          )}
        </svg>
      </div>

      {/* Concise Publication Colophon & Evidence Scope Footer */}
      <figcaption className="border-t border-[var(--ws-border-subtle)] bg-[var(--ws-surface)] px-4 py-2.5 space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[12px] text-[var(--ws-ink-muted)]">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 font-mono-tabular text-[11.5px]">
            <span>
              <strong className="text-[var(--ws-ink)]">{spec.independentOrigins}</strong>{' '}
              {t.briefing.artworkOriginsLabel}
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
          <span className={`text-[11.5px] font-semibold ${confidenceColorClass(signal.confidence.overall)}`}>
            {t.metaLine.confidence(t.confidence[signal.confidence.overall])}
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-0.5 text-[11px] text-[var(--ws-ink-faint)]">
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
