import React from 'react';
import type { ParsedSignal, SignalDomain, UiLanguage } from '../../types/edition';
import { getUiStrings } from '../../lib/i18n/uiStrings';

interface EditorialSignalArtworkProps {
  signal: ParsedSignal;
  lang: UiLanguage;
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

/**
 * Art-directed geometric editorial composition for the Lead Story hero.
 * Clearly illustrative institutional visual design grounded strictly in real
 * structured signal metadata (domain, importance 1-5, independent origin count,
 * structured claims count, and geography/event date) — zero fabricated charts,
 * photos, probabilities, or geographic coordinates.
 */
export const EditorialSignalArtwork: React.FC<EditorialSignalArtworkProps> = ({
  signal,
  lang,
}) => {
  const t = getUiStrings(lang);
  const palette = getDomainPalette(signal.domain);

  // Cap rendered orbital markers to a clean architectural range while preserving exact numeric label
  const originNodeCount = Math.min(Math.max(signal.independentOriginCount, 0), 8);
  const originNodes = Array.from({ length: originNodeCount }, (_, idx) => {
    const angle = (-Math.PI / 2) + (idx * (Math.PI * 2)) / Math.max(originNodeCount, 1);
    const radius = idx % 2 === 0 ? 54 : 38;
    return {
      cx: 120 + Math.cos(angle) * radius,
      cy: 84 + Math.sin(angle) * radius,
    };
  });

  const importanceSteps = [1, 2, 3, 4, 5];

  return (
    <figure
      aria-label={`${t.domains[signal.domain]} · ${signal.headline}`}
      className="relative overflow-hidden rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-surface)] ws-grid-paper"
    >
      {/* Top domain architectural accent bar */}
      <div className={`h-[3px] w-full ${palette.barClass}`} aria-hidden="true" />

      <div className="p-3.5 sm:p-5 flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Bespoke Abstract Editorial SVG Composition */}
        <div className="relative flex items-center justify-center sm:w-[46%] shrink-0">
          <svg
            viewBox="0 0 240 168"
            fill="none"
            role="img"
            aria-hidden="true"
            className="w-full max-w-[156px] sm:max-w-[232px] h-auto"
          >
            {/* Outer architectural frame ticks */}
            <path
              d="M12 20V12H20M228 20V12H220M12 148V156H20M228 148V156H220"
              stroke="var(--ws-border-strong)"
              strokeWidth="1"
            />

            {/* Subtle tinted focal disc */}
            <circle
              cx="120"
              cy="84"
              r="62"
              fill={palette.softFill}
              opacity="0.85"
            />

            {/* Editorial coordinate axes */}
            <line
              x1="28"
              y1="84"
              x2="212"
              y2="84"
              stroke="var(--ws-border-strong)"
              strokeWidth="0.9"
              strokeDasharray="3 3"
            />
            <line
              x1="120"
              y1="14"
              x2="120"
              y2="154"
              stroke="var(--ws-border-strong)"
              strokeWidth="0.9"
              strokeDasharray="3 3"
            />

            {/* Domain-specific geometric editorial emblem */}
            {signal.domain === 'world' && (
              <>
                <circle
                  cx="120"
                  cy="84"
                  r="54"
                  stroke={palette.stroke}
                  strokeWidth="1.25"
                  opacity="0.85"
                />
                <ellipse
                  cx="120"
                  cy="84"
                  rx="24"
                  ry="54"
                  stroke={palette.stroke}
                  strokeWidth="1"
                  opacity="0.6"
                />
                <ellipse
                  cx="120"
                  cy="84"
                  rx="54"
                  ry="20"
                  stroke={palette.stroke}
                  strokeWidth="0.9"
                  opacity="0.45"
                />
                <circle
                  cx="120"
                  cy="84"
                  r="38"
                  stroke="var(--ws-border-strong)"
                  strokeWidth="0.85"
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
                  r="54"
                  stroke="var(--ws-border-strong)"
                  strokeWidth="0.85"
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
                  r="54"
                  stroke="var(--ws-border-strong)"
                  strokeWidth="0.85"
                  strokeDasharray="2 4"
                />
              </>
            )}

            {/* Origin verification rays & nodes — exact count mirrors signal.independentOriginCount */}
            {originNodes.map((pt, idx) => (
              <g key={idx}>
                <line
                  x1="120"
                  y1="84"
                  x2={pt.cx}
                  y2={pt.cy}
                  stroke={palette.stroke}
                  strokeWidth="0.95"
                  opacity="0.5"
                />
                <circle
                  cx={pt.cx}
                  cy={pt.cy}
                  r="4.2"
                  fill="var(--ws-surface)"
                  stroke={palette.stroke}
                  strokeWidth="1.6"
                />
              </g>
            ))}

            {/* Central focal point */}
            <circle
              cx="120"
              cy="84"
              r="7"
              fill="var(--ws-surface)"
              stroke={palette.stroke}
              strokeWidth="1.75"
            />
            <circle cx="120" cy="84" r="2.75" fill={palette.stroke} />
          </svg>
        </div>

        {/* Right: Real Structured Signal Dossier Telemetry */}
        <figcaption className="flex-1 min-w-0 border-t border-[var(--ws-border)] pt-3.5 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-5 space-y-3.5">
          <div className="space-y-1">
            <div className={`font-mono-tabular text-[10.5px] font-semibold uppercase tracking-[0.14em] ${palette.textClass}`}>
              {t.briefing.artworkCaption}
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono-tabular text-[11px] text-[var(--ws-ink-muted)]">
              <span className="font-semibold text-[var(--ws-ink)]">
                {t.domains[signal.domain]}
              </span>
              {signal.event.geography.length > 0 && (
                <>
                  <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">·</span>
                  <span className="truncate max-w-[200px]">
                    {signal.event.geography.join(', ')}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Importance 1–5 Calibrated Architectural Scale */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between font-mono-tabular text-[11px]">
              <span className="text-[var(--ws-ink-muted)]">{t.expanded.importanceLabel}</span>
              <span className="font-semibold text-[var(--ws-ink)]">
                {signal.importance} / 5
              </span>
            </div>
            <div
              className="grid grid-cols-5 gap-1"
              aria-hidden="true"
            >
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

          {/* Key Derived Evidence Figures */}
          <dl className="grid grid-cols-3 gap-2 border-t border-[var(--ws-border-subtle)] pt-3 font-mono-tabular">
            <div className="min-w-0">
              <dt className="text-[10px] uppercase tracking-[0.06em] text-[var(--ws-ink-muted)] truncate">
                {t.briefing.artworkOriginsLabel}
              </dt>
              <dd className="mt-0.5 font-display text-[1.25rem] font-semibold leading-none text-[var(--ws-ink)] tabular-nums">
                {signal.independentOriginCount}
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
          <circle cx="14" cy="14" r="11" fill={palette.softFill} stroke={palette.stroke} strokeWidth="1.25" />
          <ellipse cx="14" cy="14" rx="4.8" ry="11" stroke={palette.stroke} strokeWidth="1.05" />
          <line x1="3" y1="14" x2="25" y2="14" stroke={palette.stroke} strokeWidth="1.05" />
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
          <line x1="14" y1="3" x2="14" y2="25" stroke={palette.stroke} strokeWidth="0.95" opacity="0.55" />
          <line x1="4.5" y1="8.5" x2="23.5" y2="19.5" stroke={palette.stroke} strokeWidth="0.95" opacity="0.55" />
          <line x1="23.5" y1="8.5" x2="4.5" y2="19.5" stroke={palette.stroke} strokeWidth="0.95" opacity="0.55" />
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
          <line x1="8" y1="19" x2="20" y2="19" stroke={palette.stroke} strokeWidth="1.2" />
          <rect x="8.5" y="13.5" width="2.6" height="5.5" fill={palette.stroke} opacity="0.55" />
          <rect x="12.7" y="10.5" width="2.6" height="8.5" fill={palette.stroke} opacity="0.8" />
          <rect x="16.9" y="7.5" width="2.6" height="11.5" fill={palette.stroke} />
        </>
      )}
    </svg>
  );
};
