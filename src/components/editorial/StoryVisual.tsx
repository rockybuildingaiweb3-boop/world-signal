import React, { useMemo, useState } from 'react';
import type { ParsedSignal, SignalDomain, UiLanguage } from '../../types/edition';
import { getUiStrings } from '../../lib/i18n/uiStrings';
import {
  extractGroundedSignalStats,
  selectVisualStrategyForSignal,
  type StoryVisualMode,
  type VerifiedDocumentaryMedia,
  type VisualSlotContext,
} from '../../lib/editorial/editorialAssetRegistry';
import { EDITORIAL_ASSET_URLS } from './editorialAssetUrls';

interface StoryVisualProps {
  signal: ParsedSignal;
  lang: UiLanguage;
  mode?: StoryVisualMode;
  context?: VisualSlotContext;
  excludeAssetIds?: ReadonlySet<string> | readonly string[];
  verifiedMedia?: VerifiedDocumentaryMedia | null;
  variant?: 'hero' | 'feature' | 'dossier' | 'plate';
  tone?: 'light' | 'dark';
  plateNumber?: string;
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

export const StoryVisual: React.FC<StoryVisualProps> = ({
  signal,
  lang,
  mode,
  context = 'secondary',
  excludeAssetIds,
  verifiedMedia = null,
  variant = 'hero',
  tone = 'light',
  plateNumber = '01',
}) => {
  const t = getUiStrings(lang);
  const [imageError, setImageError] = useState(false);

  const stats = useMemo(() => extractGroundedSignalStats(signal), [signal]);
  const selection = useMemo(
    () =>
      selectVisualStrategyForSignal(signal, {
        context,
        excludeAssetIds,
        preferredMode: mode,
        verifiedMedia,
      }),
    [context, excludeAssetIds, mode, signal, verifiedMedia]
  );

  const accent = getDomainAccentVar(signal.domain);
  const isDarkPlate = tone === 'dark';

  const effectiveMode: StoryVisualMode =
    (selection.mode === 'editorial_illustration' ||
      selection.mode === 'verified_documentary') &&
    imageError
      ? 'typographic_cover'
      : selection.mode;

  const claimTotal = stats.claimsCount;
  const confirmedPct =
    claimTotal > 0
      ? Math.round((stats.confirmedClaimsCount / claimTotal) * 100)
      : 0;
  const reportedPct =
    claimTotal > 0
      ? Math.round((stats.reportedClaimsCount / claimTotal) * 100)
      : 0;
  const disputedPct =
    claimTotal > 0 ? Math.max(0, 100 - confirmedPct - reportedPct) : 0;

  const aspectClass =
    variant === 'hero'
      ? 'aspect-[16/10]'
      : variant === 'plate'
        ? 'aspect-[16/9]'
        : variant === 'dossier'
          ? 'aspect-[21/9]'
          : 'aspect-[4/3]';

  // MODE 4: Intentional Museum-Monograph Typographic Cover Plate
  if (effectiveMode === 'typographic_cover') {
    const subjectLabel =
      lang === 'zh-CN' ? selection.subjectLabelZh : selection.subjectLabelEn;
    const geoLabel =
      signal.event.geography.length > 0
        ? signal.event.geography.slice(0, 3).join(' · ')
        : null;

    return (
      <figure
        data-visual-mode="typographic_cover"
        data-subject-category={selection.subjectCategory}
        className={`relative overflow-hidden border ${
          isDarkPlate
            ? 'border-[var(--ws-plate-border)] bg-[var(--ws-plate-elevated)] text-[var(--ws-plate-ink)]'
            : 'border-[var(--ws-border-strong)] bg-[var(--ws-surface-subtle)] text-[var(--ws-ink)]'
        } p-6 sm:p-7 flex flex-col justify-between ${
          variant === 'dossier' ? 'min-h-[196px]' : 'min-h-[250px]'
        }`}
      >
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-[3px]"
          style={{ backgroundColor: accent }}
        />

        <div
          className={`flex flex-wrap items-center justify-between gap-2 border-b pb-3 ${
            isDarkPlate
              ? 'border-[var(--ws-plate-border)]'
              : 'border-[var(--ws-border)]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="ws-kicker" style={{ color: accent }}>
              {t.domains[signal.domain]}
            </span>
            <span
              aria-hidden="true"
              className={
                isDarkPlate
                  ? 'text-[var(--ws-plate-muted)]'
                  : 'text-[var(--ws-ink-faint)]'
              }
            >
              /
            </span>
            <span
              className={`text-[12px] font-medium ${
                isDarkPlate
                  ? 'text-[var(--ws-plate-secondary)]'
                  : 'text-[var(--ws-ink-secondary)]'
              }`}
            >
              {subjectLabel}
            </span>
          </div>
          <span
            className={`font-mono-tabular text-[11.5px] ${
              isDarkPlate
                ? 'text-[var(--ws-plate-muted)]'
                : 'text-[var(--ws-ink-muted)]'
            }`}
          >
            {t.briefing.coverPlateFolio[signal.domain]} · {plateNumber}
          </span>
        </div>

        <div className="py-5 grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-4 sm:gap-6 items-baseline">
          <div
            className={`font-display text-[44px] sm:text-[54px] font-semibold leading-none tracking-[-0.04em] ws-tabular ${
              isDarkPlate
                ? 'text-[var(--ws-plate-ink)]/85'
                : 'text-[var(--ws-ink)]/20'
            }`}
            aria-hidden="true"
          >
            {plateNumber}
          </div>
          <div className="space-y-2 min-w-0">
            <div className="font-display text-[19px] sm:text-[22px] font-semibold leading-snug tracking-[-0.015em] break-words">
              {signal.topic || subjectLabel}
            </div>
            {geoLabel && (
              <div
                className={`font-mono-tabular text-[12px] ${
                  isDarkPlate
                    ? 'text-[var(--ws-plate-secondary)]'
                    : 'text-[var(--ws-ink-muted)]'
                }`}
              >
                {geoLabel}
              </div>
            )}
          </div>
        </div>

        <figcaption
          className={`flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-[11.5px] font-mono-tabular ${
            isDarkPlate
              ? 'border-[var(--ws-plate-border)] text-[var(--ws-plate-muted)]'
              : 'border-[var(--ws-border)] text-[var(--ws-ink-muted)]'
          }`}
        >
          <span>
            {stats.independentOriginsCount} {t.briefing.artworkOriginsLabel} ·{' '}
            {stats.confirmedClaimsCount}/{stats.claimsCount}{' '}
            {t.briefing.artworkClaimsLabel}
          </span>
          <span>
            {stats.timelineSpanLabel || signal.event.start_date || signal.signal_id}
          </span>
        </figcaption>
      </figure>
    );
  }

  // MODE 3: Grounded Evidence & Chronology Ledger (FT Chart Doctor Discipline)
  if (effectiveMode === 'grounded_visual') {
    const timelineItems = stats.timelinePoints.slice(0, 4);
    return (
      <figure
        data-visual-mode="grounded_visual"
        data-subject-category={selection.subjectCategory}
        className={`border ${
          isDarkPlate
            ? 'border-[var(--ws-plate-border)] bg-[var(--ws-plate-elevated)] text-[var(--ws-plate-ink)]'
            : 'border-[var(--ws-border)] bg-[var(--ws-surface)] text-[var(--ws-ink)]'
        } p-5 sm:p-6 space-y-5`}
      >
        <div
          className={`flex flex-wrap items-center justify-between gap-2 border-b pb-3 ${
            isDarkPlate
              ? 'border-[var(--ws-plate-border)]'
              : 'border-[var(--ws-border-subtle)]'
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-[1px] shrink-0"
              style={{ backgroundColor: accent }}
              aria-hidden="true"
            />
            <span
              className={`ws-kicker ${
                isDarkPlate ? 'text-[var(--ws-plate-ink)]' : 'text-[var(--ws-ink)]'
              }`}
            >
              {lang === 'zh-CN' ? '循证核查图谱' : 'Evidence & Chronology Ledger'}
            </span>
          </div>
          <span
            className={`font-mono-tabular text-[11.5px] ${
              isDarkPlate
                ? 'text-[var(--ws-plate-muted)]'
                : 'text-[var(--ws-ink-muted)]'
            }`}
          >
            {signal.signal_id}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="font-display text-[28px] sm:text-[32px] font-semibold leading-none ws-tabular">
              {stats.independentOriginsCount}
            </div>
            <div
              className={`text-[12px] ${
                isDarkPlate
                  ? 'text-[var(--ws-plate-muted)]'
                  : 'text-[var(--ws-ink-muted)]'
              }`}
            >
              {t.briefing.artworkOriginsLabel}
            </div>
          </div>
          <div className="space-y-1">
            <div className="font-display text-[28px] sm:text-[32px] font-semibold leading-none ws-tabular">
              {stats.claimsCount}
            </div>
            <div
              className={`text-[12px] ${
                isDarkPlate
                  ? 'text-[var(--ws-plate-muted)]'
                  : 'text-[var(--ws-ink-muted)]'
              }`}
            >
              {t.briefing.artworkClaimsLabel}
            </div>
          </div>
          <div className="space-y-1">
            <div className="font-display text-[28px] sm:text-[32px] font-semibold leading-none ws-tabular">
              {stats.sourcesCount}
            </div>
            <div
              className={`text-[12px] ${
                isDarkPlate
                  ? 'text-[var(--ws-plate-muted)]'
                  : 'text-[var(--ws-ink-muted)]'
              }`}
            >
              {t.briefing.artworkSourcesLabel}
            </div>
          </div>
        </div>

        {claimTotal > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[12px]">
              <span
                className={`font-medium ${
                  isDarkPlate
                    ? 'text-[var(--ws-plate-secondary)]'
                    : 'text-[var(--ws-ink-secondary)]'
                }`}
              >
                {lang === 'zh-CN' ? '声明核验分布' : 'Claim Verification Split'}
              </span>
              <span
                className={`font-mono-tabular ${
                  isDarkPlate
                    ? 'text-[var(--ws-plate-muted)]'
                    : 'text-[var(--ws-ink-muted)]'
                }`}
              >
                {confirmedPct}% {lang === 'zh-CN' ? '已证实' : 'confirmed'}
              </span>
            </div>
            <div
              className={`flex h-2.5 w-full overflow-hidden rounded-[2px] ${
                isDarkPlate
                  ? 'bg-[var(--ws-plate-border)]'
                  : 'bg-[var(--ws-surface-subtle)]'
              }`}
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
            <div
              className={`flex flex-wrap gap-x-4 gap-y-1 text-[12px] ${
                isDarkPlate
                  ? 'text-[var(--ws-plate-muted)]'
                  : 'text-[var(--ws-ink-muted)]'
              }`}
            >
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-[1px] bg-[var(--ws-good)]" />
                {lang === 'zh-CN' ? '已证实' : 'Confirmed'}:{' '}
                {stats.confirmedClaimsCount}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-[1px] bg-[var(--ws-world)]" />
                {lang === 'zh-CN' ? '报道/官方' : 'Reported / Official'}:{' '}
                {stats.reportedClaimsCount}
              </span>
              {stats.disputedOrUnverifiedCount > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-[1px] bg-[var(--ws-warn)]" />
                  {lang === 'zh-CN' ? '存疑/未证实' : 'Disputed / Unverified'}:{' '}
                  {stats.disputedOrUnverifiedCount}
                </span>
              )}
            </div>
          </div>
        )}

        {timelineItems.length > 0 && (
          <div
            className={`border-t pt-3.5 space-y-2 ${
              isDarkPlate
                ? 'border-[var(--ws-plate-border)]'
                : 'border-[var(--ws-border-subtle)]'
            }`}
          >
            <div
              className={`text-[11.5px] font-semibold uppercase tracking-[0.08em] ${
                isDarkPlate
                  ? 'text-[var(--ws-plate-muted)]'
                  : 'text-[var(--ws-ink-muted)]'
              }`}
            >
              {t.briefing.artworkTimelineMilestones(stats.timelineCount)}
            </div>
            <ol className="space-y-2">
              {timelineItems.map((pt, idx) => (
                <li
                  key={`${pt.dateLabel}-${idx}`}
                  className="grid grid-cols-[84px_1fr] gap-2.5 text-[12.5px] leading-snug"
                >
                  <span
                    className={`font-mono-tabular text-[11.5px] pt-0.5 ${
                      isDarkPlate
                        ? 'text-[var(--ws-plate-muted)]'
                        : 'text-[var(--ws-ink-muted)]'
                    }`}
                  >
                    {pt.dateLabel}
                  </span>
                  <span
                    className={`line-clamp-1 ${
                      isDarkPlate
                        ? 'text-[var(--ws-plate-secondary)]'
                        : 'text-[var(--ws-ink-secondary)]'
                    }`}
                  >
                    {pt.summary}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}

        <figcaption
          className={`border-t pt-2.5 text-[11.5px] ${
            isDarkPlate
              ? 'border-[var(--ws-plate-border)] text-[var(--ws-plate-muted)]'
              : 'border-[var(--ws-border-subtle)] text-[var(--ws-ink-muted)]'
          }`}
        >
          {lang === 'zh-CN'
            ? '仅基于本期已核查声明与独立报道来源统计生成，不含推测数据。'
            : 'Computed exclusively from verified claims, independent reporting origins, and structured timeline entries in this edition.'}
        </figcaption>
      </figure>
    );
  }

  // MODE 2: Verified Documentary Media (Only rendered when real verified media is explicitly supplied)
  if (effectiveMode === 'verified_documentary' && verifiedMedia) {
    return (
      <figure
        data-visual-mode="verified_documentary"
        className="space-y-2.5"
      >
        <div
          className={`ws-art-frame ${aspectClass} w-full ${
            isDarkPlate ? 'border-[var(--ws-plate-border)] bg-[#0f131b]' : ''
          }`}
        >
          <img
            src={verifiedMedia.src}
            alt={verifiedMedia.alt}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            loading={variant === 'hero' || variant === 'plate' ? 'eager' : 'lazy'}
            className="h-full w-full object-cover object-center"
          />
        </div>
        <figcaption
          className={`flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[12px] leading-snug ${
            isDarkPlate
              ? 'text-[var(--ws-plate-muted)]'
              : 'text-[var(--ws-ink-muted)]'
          }`}
        >
          <span>{verifiedMedia.caption}</span>
          <span className="font-mono-tabular text-[11.5px]">
            {verifiedMedia.credit}
          </span>
        </figcaption>
      </figure>
    );
  }

  // MODE 1: Subject-Specific Original Editorial Print Illustration
  const asset = selection.asset;
  const assetSrc = asset ? EDITORIAL_ASSET_URLS[asset.id] : null;

  if (!asset || !assetSrc) {
    return null;
  }

  return (
    <figure
      data-visual-mode="editorial_illustration"
      data-asset-id={asset.id}
      data-subject-category={selection.subjectCategory}
      className="space-y-2.5"
    >
      <div
        className={`ws-art-frame ${aspectClass} w-full ${
          isDarkPlate ? 'border-[var(--ws-plate-border)] bg-[#0f131b]' : ''
        }`}
      >
        <img
          src={assetSrc}
          alt={lang === 'zh-CN' ? asset.altZh : asset.altEn}
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
          loading={variant === 'hero' || variant === 'plate' ? 'eager' : 'lazy'}
          className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.018]"
        />
      </div>

      <figcaption
        className={`flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[12px] leading-snug ${
          isDarkPlate
            ? 'text-[var(--ws-plate-muted)]'
            : 'text-[var(--ws-ink-muted)]'
        }`}
      >
        <span className="inline-flex items-center gap-2">
          <span
            className="h-1.5 w-4 shrink-0"
            style={{ backgroundColor: accent }}
            aria-hidden="true"
          />
          <span>
            {lang === 'zh-CN' ? asset.creditZh : asset.creditEn}
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
