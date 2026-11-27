import React, { useMemo, useState } from 'react';
import type { ParsedSignal, SignalDomain, UiLanguage } from '../../types/edition';
import { getUiStrings } from '../../lib/i18n/uiStrings';

import geopoliticsCoverUrl from '../../assets/images/editorial_cover_geopolitics_1795752024180.jpg';
import aiFrontierCoverUrl from '../../assets/images/editorial_cover_ai_frontier_1795752024354.jpg';
import economyCoverUrl from '../../assets/images/editorial_cover_economy_1795752025611.jpg';
import diplomacyCoverUrl from '../../assets/images/editorial_cover_diplomacy_1795752026803.jpg';

export type StoryVisualMode =
  | 'editorial_illustration'
  | 'grounded_visual'
  | 'typographic_cover';

interface StoryVisualProps {
  signal: ParsedSignal;
  lang: UiLanguage;
  mode?: StoryVisualMode;
  variant?: 'hero' | 'feature' | 'dossier' | 'plate';
  tone?: 'light' | 'dark';
  plateNumber?: string;
}

interface IllustrationAsset {
  src: string;
  altEn: string;
  altZh: string;
  creditEn: string;
  creditZh: string;
}

const DIPLOMACY_KEYWORDS = [
  'diplom',
  'summit',
  'treaty',
  'alliance',
  'parliament',
  'election',
  'eu',
  'un',
  'nato',
  '峰会',
  '外交',
  '谈判',
  '欧盟',
  '议会',
  '协议',
  '联合国',
];

function selectIllustrationForSignal(signal: ParsedSignal): IllustrationAsset {
  if (signal.domain === 'ai') {
    return {
      src: aiFrontierCoverUrl,
      altEn:
        'Original editorial print illustration of optical prisms and architectural grids representing AI Frontier developments',
      altZh: '人工智能前沿主题原创编务版画插图：几何棱镜与建筑测绘结构',
      creditEn: 'Original Editorial Illustration · Non-documentary',
      creditZh: '原创编务插画 · 概念性视觉，非实拍纪实影像',
    };
  }
  if (signal.domain === 'economy') {
    return {
      src: economyCoverUrl,
      altEn:
        'Original editorial print illustration of sculptural columns, freight architecture, and fiscal balance representing Economic Outlook',
      altZh: '经济展望主题原创编务版画插图：国际贸易与宏观均衡结构',
      creditEn: 'Original Editorial Illustration · Non-documentary',
      creditZh: '原创编务插画 · 概念性视觉，非实拍纪实影像',
    };
  }

  const haystack = `${signal.headline} ${signal.topic} ${signal.tags.join(' ')}`.toLowerCase();
  const isDiplomatic = DIPLOMACY_KEYWORDS.some((kw) => haystack.includes(kw));

  if (isDiplomatic) {
    return {
      src: diplomacyCoverUrl,
      altEn:
        'Original editorial print illustration of a geometric diplomatic amphitheater overlooking a maritime horizon',
      altZh: '国际外交与治理主题原创编务插画：多边议事几何空间',
      creditEn: 'Original Editorial Illustration · Non-documentary',
      creditZh: '原创编务插画 · 概念性视觉，非实拍纪实影像',
    };
  }

  return {
    src: geopoliticsCoverUrl,
    altEn:
      'Original editorial print illustration of maritime trade corridors, arched colonnades, and meridian arcs representing global geopolitical events',
    altZh: '国际地缘与航运通道主题原创编务版画插图：拱廊、海浪与经纬弧线',
    creditEn: 'Original Editorial Illustration · Non-documentary',
    creditZh: '原创编务插画 · 概念性视觉，非实拍纪实影像',
  };
}

function getDomainAccentVar(domain: SignalDomain): string {
  switch (domain) {
    case 'world':
      return 'var(--ws-world)';
    case 'ai':
      return 'var(--ws-ai)';
    case 'economy':
      return 'var(--ws-economy)';
  }
}

export interface GroundedSignalStats {
  independentOriginsCount: number;
  claimsCount: number;
  sourcesCount: number;
  confirmedClaimsCount: number;
  reportedClaimsCount: number;
  disputedOrUnverifiedCount: number;
  timelineCount: number;
  timelineSpanLabel: string | null;
  timelinePoints: Array<{ dateLabel: string; summary: string }>;
}

export function extractGroundedSignalStats(
  signal: ParsedSignal
): GroundedSignalStats {
  let confirmedClaimsCount = 0;
  let reportedClaimsCount = 0;
  let disputedOrUnverifiedCount = 0;

  for (const claim of signal.claims) {
    if (claim.status === 'confirmed') confirmedClaimsCount += 1;
    else if (claim.status === 'reported' || claim.status === 'official_claim') {
      reportedClaimsCount += 1;
    } else {
      disputedOrUnverifiedCount += 1;
    }
  }

  const timelinePoints =
    signal.timelineEvents.length > 0
      ? signal.timelineEvents.map((ev) => ({
          dateLabel: ev.occurred_at.slice(0, 10),
          summary: ev.title || ev.summary,
        }))
      : signal.sections.timelineEntries.map((entry) => ({
          dateLabel: entry.dateLabel || '—',
          summary: entry.text,
        }));

  const datedLabels = timelinePoints
    .map((p) => p.dateLabel)
    .filter((d) => d && d !== '—');
  const timelineSpanLabel =
    datedLabels.length >= 2
      ? `${datedLabels[0]} – ${datedLabels[datedLabels.length - 1]}`
      : datedLabels[0] ?? signal.event.start_date ?? null;

  return {
    independentOriginsCount: signal.independentOriginCount,
    claimsCount: signal.claims.length,
    sourcesCount: signal.sources.length,
    confirmedClaimsCount,
    reportedClaimsCount,
    disputedOrUnverifiedCount,
    timelineCount: timelinePoints.length,
    timelineSpanLabel,
    timelinePoints,
  };
}

export const StoryVisual: React.FC<StoryVisualProps> = ({
  signal,
  lang,
  mode = 'editorial_illustration',
  variant = 'hero',
  tone = 'light',
  plateNumber = '01',
}) => {
  const t = getUiStrings(lang);
  const [imageError, setImageError] = useState(false);

  const stats = useMemo(() => extractGroundedSignalStats(signal), [signal]);
  const illustration = useMemo(() => selectIllustrationForSignal(signal), [signal]);
  const accent = getDomainAccentVar(signal.domain);

  const isDarkPlate = tone === 'dark';

  const effectiveMode: StoryVisualMode =
    mode === 'editorial_illustration' && imageError ? 'typographic_cover' : mode;

  const claimTotal = stats.claimsCount;
  const confirmedPct =
    claimTotal > 0 ? Math.round((stats.confirmedClaimsCount / claimTotal) * 100) : 0;
  const reportedPct =
    claimTotal > 0 ? Math.round((stats.reportedClaimsCount / claimTotal) * 100) : 0;
  const disputedPct =
    claimTotal > 0 ? Math.max(0, 100 - confirmedPct - reportedPct) : 0;

  if (effectiveMode === 'typographic_cover') {
    return (
      <figure
        className={`relative overflow-hidden border ${
          isDarkPlate
            ? 'border-[var(--ws-plate-border)] bg-[var(--ws-plate-elevated)] text-[var(--ws-plate-ink)]'
            : 'border-[var(--ws-border)] bg-[var(--ws-plate)] text-[var(--ws-plate-ink)]'
        } p-6 sm:p-8 flex flex-col justify-between min-h-[260px]`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-[var(--ws-plate-border)] pb-3">
          <span className="ws-kicker text-[var(--ws-editorial-accent)]">
            {t.domains[signal.domain]}
          </span>
          <span className="font-mono-tabular text-[12px] text-[var(--ws-plate-muted)]">
            {t.briefing.coverPlateFolio[signal.domain]} · {plateNumber}
          </span>
        </div>

        <div className="py-6 space-y-3">
          <div
            className="font-display text-[48px] sm:text-[60px] font-semibold leading-none tracking-[-0.04em] text-[var(--ws-plate-ink)]/90"
            aria-hidden="true"
          >
            {plateNumber}
          </div>
          <p className="font-display text-[19px] sm:text-[22px] leading-snug text-[var(--ws-plate-ink)] max-w-[32ch]">
            {signal.topic || signal.headline}
          </p>
        </div>

        <figcaption className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--ws-plate-border)] pt-3 text-[12px] text-[var(--ws-plate-muted)] font-mono-tabular">
          <span>
            {stats.independentOriginsCount} {t.briefing.artworkOriginsLabel} ·{' '}
            {stats.claimsCount} {t.briefing.artworkClaimsLabel}
          </span>
          <span>{signal.event.start_date || signal.signal_id}</span>
        </figcaption>
      </figure>
    );
  }

  if (effectiveMode === 'grounded_visual') {
    const timelineItems = stats.timelinePoints.slice(0, 4);
    return (
      <figure
        className={`border ${
          isDarkPlate
            ? 'border-[var(--ws-plate-border)] bg-[var(--ws-plate-elevated)] text-[var(--ws-plate-ink)]'
            : 'border-[var(--ws-border)] bg-[var(--ws-surface)] text-[var(--ws-ink)]'
        } p-5 sm:p-6 space-y-5`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--ws-border-subtle)] pb-3">
          <div className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: accent }}
              aria-hidden="true"
            />
            <span className="ws-kicker text-[var(--ws-ink)]">
              {lang === 'zh-CN' ? '循证核查图谱' : 'Evidence & Chronology Ledger'}
            </span>
          </div>
          <span className="font-mono-tabular text-[12px] text-[var(--ws-ink-muted)]">
            {signal.signal_id}
          </span>
        </div>

        {/* Grounded Metric Trio */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="font-display text-[28px] sm:text-[32px] font-semibold leading-none ws-tabular">
              {stats.independentOriginsCount}
            </div>
            <div className="text-[12px] text-[var(--ws-ink-muted)]">
              {t.briefing.artworkOriginsLabel}
            </div>
          </div>
          <div className="space-y-1">
            <div className="font-display text-[28px] sm:text-[32px] font-semibold leading-none ws-tabular">
              {stats.claimsCount}
            </div>
            <div className="text-[12px] text-[var(--ws-ink-muted)]">
              {t.briefing.artworkClaimsLabel}
            </div>
          </div>
          <div className="space-y-1">
            <div className="font-display text-[28px] sm:text-[32px] font-semibold leading-none ws-tabular">
              {stats.sourcesCount}
            </div>
            <div className="text-[12px] text-[var(--ws-ink-muted)]">
              {t.briefing.artworkSourcesLabel}
            </div>
          </div>
        </div>

        {/* FT Chart Doctor Style Proportional Claim Verification Bar */}
        {claimTotal > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[12px]">
              <span className="font-medium text-[var(--ws-ink-secondary)]">
                {lang === 'zh-CN' ? '声明核验分布' : 'Claim Verification Split'}
              </span>
              <span className="font-mono-tabular text-[var(--ws-ink-muted)]">
                {confirmedPct}% {lang === 'zh-CN' ? '已证实' : 'confirmed'}
              </span>
            </div>
            <div
              className="flex h-2.5 w-full overflow-hidden rounded-[2px] bg-[var(--ws-surface-subtle)]"
              role="img"
              aria-label={
                lang === 'zh-CN'
                  ? `已证实 ${stats.confirmedClaimsCount}，报道/官方声称 ${stats.reportedClaimsCount}，存疑或未证实 ${stats.disputedOrUnverifiedCount}`
                  : `${stats.confirmedClaimsCount} confirmed, ${stats.reportedClaimsCount} reported or official, ${stats.disputedOrUnverifiedCount} disputed or unverified`
              }
            >
              {stats.confirmedClaimsCount > 0 && (
                <div
                  style={{ width: `${confirmedPct}%` }}
                  className="bg-[var(--ws-good)]"
                />
              )}
              {stats.reportedClaimsCount > 0 && (
                <div
                  style={{ width: `${reportedPct}%` }}
                  className="bg-[var(--ws-world)]"
                />
              )}
              {stats.disputedOrUnverifiedCount > 0 && (
                <div
                  style={{ width: `${disputedPct}%` }}
                  className="bg-[var(--ws-warn)]"
                />
              )}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-[var(--ws-ink-muted)]">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[var(--ws-good)]" />
                {lang === 'zh-CN' ? '已证实' : 'Confirmed'}: {stats.confirmedClaimsCount}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[var(--ws-world)]" />
                {lang === 'zh-CN' ? '报道/官方' : 'Reported / Official'}:{' '}
                {stats.reportedClaimsCount}
              </span>
              {stats.disputedOrUnverifiedCount > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[var(--ws-warn)]" />
                  {lang === 'zh-CN' ? '存疑/未证实' : 'Disputed / Unverified'}:{' '}
                  {stats.disputedOrUnverifiedCount}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Grounded Real-World Milestones */}
        {timelineItems.length > 0 && (
          <div className="border-t border-[var(--ws-border-subtle)] pt-3.5 space-y-2">
            <div className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-[var(--ws-ink-muted)]">
              {t.briefing.artworkTimelineMilestones(stats.timelineCount)}
            </div>
            <ol className="space-y-2">
              {timelineItems.map((pt, idx) => (
                <li
                  key={`${pt.dateLabel}-${idx}`}
                  className="grid grid-cols-[84px_1fr] gap-2.5 text-[12.5px] leading-snug"
                >
                  <span className="font-mono-tabular text-[11.5px] text-[var(--ws-ink-muted)] pt-0.5">
                    {pt.dateLabel}
                  </span>
                  <span className="text-[var(--ws-ink-secondary)] line-clamp-1">
                    {pt.summary}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}

        <figcaption className="border-t border-[var(--ws-border-subtle)] pt-2.5 text-[11.5px] text-[var(--ws-ink-muted)]">
          {lang === 'zh-CN'
            ? '仅基于本期已核查声明与独立报道来源统计生成，不含推测数据。'
            : 'Computed exclusively from verified claims, independent reporting origins, and structured timeline entries in this edition.'}
        </figcaption>
      </figure>
    );
  }

  // Primary Mode: Art-Directed Original Editorial Print Illustration
  const aspectClass =
    variant === 'hero'
      ? 'aspect-[16/10]'
      : variant === 'plate'
        ? 'aspect-[16/9]'
        : variant === 'dossier'
          ? 'aspect-[21/9]'
          : 'aspect-[4/3]';

  return (
    <figure className="space-y-2.5">
      <div
        className={`ws-art-frame ${aspectClass} w-full ${
          isDarkPlate ? 'border-[var(--ws-plate-border)] bg-[#0f131b]' : ''
        }`}
      >
        <img
          src={illustration.src}
          alt={lang === 'zh-CN' ? illustration.altZh : illustration.altEn}
          onError={() => setImageError(true)}
          loading={variant === 'hero' || variant === 'plate' ? 'eager' : 'lazy'}
          className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.02]"
        />
      </div>

      <figcaption
        className={`flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[12px] leading-snug ${
          isDarkPlate ? 'text-[var(--ws-plate-muted)]' : 'text-[var(--ws-ink-muted)]'
        }`}
      >
        <span className="inline-flex items-center gap-2">
          <span
            className="h-1.5 w-4 shrink-0"
            style={{ backgroundColor: accent }}
            aria-hidden="true"
          />
          <span>
            {lang === 'zh-CN' ? illustration.creditZh : illustration.creditEn}
          </span>
        </span>
        {stats.timelineSpanLabel && (
          <span className="font-mono-tabular text-[11.5px]">
            {stats.timelineSpanLabel}
          </span>
        )}
      </figcaption>
    </figure>
  );
};
