import React, { useMemo, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import type { ParsedSignal, SignalDomain, UiLanguage } from '../../types/edition';
import { getUiStrings } from '../../lib/i18n/uiStrings';
import {
  extractGroundedSignalStats,
  resolveBrokenMediaFallback,
  selectVisualStrategyForSignal,
  type EditorialAsset,
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
  excludeMediaUrls?: ReadonlySet<string> | readonly string[];
  verifiedMedia?: VerifiedDocumentaryMedia | null;
  variant?: 'hero' | 'feature' | 'dossier' | 'plate';
  tone?: 'light' | 'dark';
  plateNumber?: string;
}

function isSafeHttpsLink(url: string | undefined): boolean {
  if (!url) return false;
  try {
    return new URL(url.trim()).protocol === 'https:';
  } catch {
    return false;
  }
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
  excludeMediaUrls,
  verifiedMedia = null,
  variant = 'hero',
  tone = 'light',
  plateNumber = '01',
}) => {
  const t = getUiStrings(lang);
  const [failedUrls, setFailedUrls] = useState<ReadonlySet<string>>(
    () => new Set()
  );

  const markUrlFailed = (url: string) => {
    setFailedUrls((prev) => {
      if (prev.has(url)) return prev;
      const next = new Set(prev);
      next.add(url);
      return next;
    });
  };

  const stats = useMemo(() => extractGroundedSignalStats(signal), [signal]);
  const selection = useMemo(
    () =>
      selectVisualStrategyForSignal(signal, {
        context,
        excludeAssetIds,
        excludeMediaUrls,
        preferredMode: mode,
        verifiedMedia,
      }),
    [context, excludeAssetIds, excludeMediaUrls, mode, signal, verifiedMedia]
  );

  const accent = getDomainAccentVar(signal.domain);
  const isDarkPlate = tone === 'dark';

  const mediaUrlBroken = Boolean(
    selection.selectedMedia && failedUrls.has(selection.selectedMedia.asset_url)
  );
  const legacyVerifiedBroken = Boolean(
    verifiedMedia?.src && failedUrls.has(verifiedMedia.src)
  );

  let effectiveMode: StoryVisualMode = selection.mode;
  let effectiveAsset: EditorialAsset | null = selection.asset;
  let usedBrokenMediaFallback = false;

  if (selection.mode === 'verified_media' && mediaUrlBroken) {
    const fallback = resolveBrokenMediaFallback(selection);
    effectiveMode = fallback.mode;
    effectiveAsset = fallback.asset;
    usedBrokenMediaFallback = true;
  } else if (selection.mode === 'verified_documentary' && legacyVerifiedBroken) {
    effectiveMode = 'typographic_cover';
    effectiveAsset = null;
    usedBrokenMediaFallback = true;
  }

  if (effectiveMode === 'editorial_illustration') {
    const localUrl = effectiveAsset
      ? EDITORIAL_ASSET_URLS[effectiveAsset.id]
      : null;
    if (!localUrl || failedUrls.has(localUrl)) {
      effectiveMode = 'typographic_cover';
      effectiveAsset = null;
    }
  }

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
      ? 'aspect-[16/9]'
      : variant === 'plate'
        ? 'aspect-[16/9]'
        : variant === 'dossier'
          ? 'aspect-[21/9]'
          : 'aspect-[4/3]';

  // MODE 4: Expressive Contemporary Print Typographic Cover Plate
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
        data-media-fallback={usedBrokenMediaFallback ? 'true' : undefined}
        className={`relative overflow-hidden border ${
          isDarkPlate
            ? 'border-[var(--ws-plate-border)] bg-[var(--ws-plate-elevated)] text-[var(--ws-plate-ink)]'
            : 'border-[var(--ws-border-strong)] bg-[var(--ws-surface-tint)] text-[var(--ws-ink)]'
        } p-6 sm:p-7 flex flex-col justify-between ${
          variant === 'dossier' ? 'min-h-[210px]' : 'min-h-[268px]'
        }`}
      >
        {/* Top Domain Ink Rule */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-[3px]"
          style={{ backgroundColor: accent }}
        />

        {/* Subtle Engraved Domain Geometric Backdrop (Swiss Print Printmaking Craft) */}
        <svg
          aria-hidden="true"
          viewBox="0 0 360 220"
          fill="none"
          className="pointer-events-none absolute -right-6 -bottom-6 h-[86%] w-auto opacity-[0.11]"
        >
          {signal.domain === 'world' && (
            <g stroke={accent} strokeWidth="1.2">
              <circle cx="240" cy="120" r="96" />
              <circle cx="240" cy="120" r="64" strokeDasharray="3 4" />
              <ellipse cx="240" cy="120" rx="42" ry="96" />
              <ellipse cx="240" cy="120" rx="96" ry="38" />
              <line x1="120" y1="120" x2="348" y2="120" />
              <line x1="240" y1="12" x2="240" y2="216" />
            </g>
          )}
          {signal.domain === 'ai' && (
            <g stroke={accent} strokeWidth="1.2">
              <polygon points="240,26 332,74 240,122 148,74" />
              <polygon points="240,56 332,104 240,152 148,104" />
              <polygon points="240,86 332,134 240,182 148,134" />
              <line x1="240" y1="26" x2="240" y2="182" strokeDasharray="3 4" />
            </g>
          )}
          {signal.domain === 'economy' && (
            <g stroke={accent} strokeWidth="1.2">
              <line x1="112" y1="186" x2="344" y2="186" />
              <rect x="136" y="132" width="32" height="54" />
              <rect x="186" y="102" width="32" height="84" />
              <rect x="236" y="68" width="32" height="118" />
              <rect x="286" y="38" width="32" height="148" />
              <path d="M 136 124 C 192 108, 240 62, 318 32" strokeDasharray="4 3" />
            </g>
          )}
        </svg>

        <div
          className={`relative z-10 flex flex-wrap items-center justify-between gap-2 border-b pb-3 ${
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
            className={`font-mono-tabular text-[11px] uppercase tracking-[0.08em] ${
              isDarkPlate
                ? 'text-[var(--ws-plate-muted)]'
                : 'text-[var(--ws-ink-muted)]'
            }`}
          >
            {t.briefing.coverPlateFolio[signal.domain]} · {plateNumber}
          </span>
        </div>

        <div className="relative z-10 py-6 grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-4 sm:gap-7 items-end">
          <div
            className={`ws-editorial-numeral text-[52px] sm:text-[68px] ${
              isDarkPlate
                ? 'text-[var(--ws-plate-ink)]/85'
                : 'text-[var(--ws-ink)]/18'
            }`}
            aria-hidden="true"
          >
            {plateNumber}
          </div>
          <div className="space-y-2 min-w-0">
            <div className="font-display text-[21px] sm:text-[24px] font-semibold leading-[1.2] tracking-[-0.018em] break-words">
              {signal.topic || subjectLabel}
            </div>
            {geoLabel && (
              <div
                className={`ws-meta text-[12.5px] ${
                  isDarkPlate
                    ? 'text-[var(--ws-plate-secondary)]'
                    : 'text-[var(--ws-ink-muted)]'
                }`}
              >
                {geoLabel}
              </div>
            )}
            {/* Calibrated 5-Segment Editorial Importance Register */}
            <div className="flex items-center gap-1.5 pt-1" aria-hidden="true">
              {[1, 2, 3, 4, 5].map((step) => (
                <span
                  key={step}
                  className="h-[3px] w-6 rounded-[1px]"
                  style={{
                    backgroundColor:
                      step <= signal.importance
                        ? accent
                        : isDarkPlate
                          ? 'var(--ws-plate-border)'
                          : 'var(--ws-border-strong)',
                    opacity: step <= signal.importance ? 0.92 : 0.35,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <figcaption
          className={`relative z-10 flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-[12px] ws-meta ${
            isDarkPlate
              ? 'border-[var(--ws-plate-border)] text-[var(--ws-plate-muted)]'
              : 'border-[var(--ws-border)] text-[var(--ws-ink-muted)]'
          }`}
        >
          <span>
            <strong
              className={
                isDarkPlate ? 'text-[var(--ws-plate-ink)]' : 'text-[var(--ws-ink)]'
              }
            >
              {stats.independentOriginsCount}
            </strong>{' '}
            {t.briefing.artworkOriginsLabel} ·{' '}
            <strong
              className={
                isDarkPlate ? 'text-[var(--ws-plate-ink)]' : 'text-[var(--ws-ink)]'
              }
            >
              {stats.confirmedClaimsCount}/{stats.claimsCount}
            </strong>{' '}
            {t.briefing.artworkClaimsLabel}
          </span>
          <span className="font-mono-tabular text-[11.5px]">
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
        className={`relative border ${
          isDarkPlate
            ? 'border-[var(--ws-plate-border)] bg-[var(--ws-plate-elevated)] text-[var(--ws-plate-ink)]'
            : 'border-[var(--ws-border-strong)] bg-[var(--ws-surface)] text-[var(--ws-ink)]'
        } p-5 sm:p-6 space-y-5`}
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

        <div className="grid grid-cols-3 gap-4 border-b border-[var(--ws-border-subtle)] pb-4">
          <div className="space-y-1">
            <div className="ws-editorial-numeral font-mono-tabular text-[30px] sm:text-[36px]">
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
            <div className="ws-editorial-numeral font-mono-tabular text-[30px] sm:text-[36px]">
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
            <div className="ws-editorial-numeral font-mono-tabular text-[30px] sm:text-[36px]">
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
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-[12px]">
              <span
                className={`font-semibold ${
                  isDarkPlate
                    ? 'text-[var(--ws-plate-secondary)]'
                    : 'text-[var(--ws-ink-secondary)]'
                }`}
              >
                {lang === 'zh-CN' ? '声明核验分布' : 'Claim Verification Split'}
              </span>
              <span
                className={`font-mono-tabular font-semibold ${
                  isDarkPlate
                    ? 'text-[var(--ws-plate-ink)]'
                    : 'text-[var(--ws-ink)]'
                }`}
              >
                {confirmedPct}% {lang === 'zh-CN' ? '已证实' : 'confirmed'}
              </span>
            </div>
            <div
              className={`flex h-3.5 w-full overflow-hidden rounded-[2px] gap-[1.5px] ${
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
            className={`border-t pt-3.5 space-y-2.5 ${
              isDarkPlate
                ? 'border-[var(--ws-plate-border)]'
                : 'border-[var(--ws-border-subtle)]'
            }`}
          >
            <div
              className={`ws-kicker text-[11px] ${
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
                  className="grid grid-cols-[88px_1fr] gap-2.5 text-[12.5px] leading-snug"
                >
                  <span
                    className={`font-mono-tabular text-[11.5px] font-semibold pt-0.5 ${
                      isDarkPlate
                        ? 'text-[var(--ws-plate-accent)]'
                        : 'text-[var(--ws-ink)]'
                    }`}
                  >
                    {pt.dateLabel}
                  </span>
                  <span
                    className={`line-clamp-2 ${
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

  // MODE 1A: Verified Editorial Media Asset from Signal Schema v2 (`media_assets`)
  if (effectiveMode === 'verified_media' && selection.selectedMedia) {
    const media = selection.selectedMedia;
    const cropAllowed = media.rights.crop_allowed;
    const hasLicenseLink = isSafeHttpsLink(media.rights.license_url);
    const relationshipLabel = t.media.relationships[media.relationship_to_signal];
    const mediaTypeLabel = t.media.mediaTypes[media.media_type];
    const showDisclosure =
      media.relationship_to_signal !== 'direct_event_documentation';
    const depictedMeta = [media.depicted_location, media.depicted_at]
      .filter(Boolean)
      .join(' · ');

    return (
      <figure
        data-visual-mode="verified_media"
        data-media-id={media.media_id}
        data-media-relationship={media.relationship_to_signal}
        data-media-type={media.media_type}
        data-crop-allowed={String(cropAllowed)}
        className="space-y-2.5"
      >
        {cropAllowed ? (
          <div
            className={`ws-art-frame ${aspectClass} w-full ${
              isDarkPlate
                ? 'border-[var(--ws-plate-border)] bg-[var(--ws-plate-elevated)]'
                : ''
            }`}
          >
            <img
              src={media.asset_url}
              alt={media.alt_text}
              referrerPolicy="no-referrer"
              decoding="async"
              onError={() => markUrlFailed(media.asset_url)}
              loading={
                variant === 'hero' || variant === 'plate' || variant === 'dossier'
                  ? 'eager'
                  : 'lazy'
              }
              className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.014]"
            />
          </div>
        ) : (
          <div
            className={`relative overflow-hidden border ${aspectClass} w-full flex items-center justify-center p-3 sm:p-4 ${
              isDarkPlate
                ? 'border-[var(--ws-plate-border)] bg-[var(--ws-plate-elevated)]'
                : 'border-[var(--ws-border)] bg-[var(--ws-surface-tint)]'
            }`}
          >
            <img
              src={media.asset_url}
              alt={media.alt_text}
              referrerPolicy="no-referrer"
              decoding="async"
              onError={() => markUrlFailed(media.asset_url)}
              loading={
                variant === 'hero' || variant === 'plate' || variant === 'dossier'
                  ? 'eager'
                  : 'lazy'
              }
              className="h-full w-full object-contain"
            />
          </div>
        )}

        <figcaption
          className={`space-y-2 text-[12.5px] leading-snug ${
            isDarkPlate
              ? 'text-[var(--ws-plate-secondary)]'
              : 'text-[var(--ws-ink-secondary)]'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 ws-meta text-[11.5px]">
            <span className="inline-flex items-center gap-2 font-semibold">
              <span
                className="h-1.5 w-3.5 shrink-0"
                style={{ backgroundColor: accent }}
                aria-hidden="true"
              />
              <span
                className={
                  isDarkPlate
                    ? 'text-[var(--ws-plate-ink)]'
                    : 'text-[var(--ws-ink)]'
                }
              >
                {relationshipLabel}
              </span>
              <span
                aria-hidden="true"
                className={
                  isDarkPlate
                    ? 'text-[var(--ws-plate-muted)]'
                    : 'text-[var(--ws-ink-faint)]'
                }
              >
                ·
              </span>
              <span
                className={`font-normal ${
                  isDarkPlate
                    ? 'text-[var(--ws-plate-muted)]'
                    : 'text-[var(--ws-ink-muted)]'
                }`}
              >
                {mediaTypeLabel}
              </span>
            </span>
            {!cropAllowed && (
              <span
                className={`text-[11px] ${
                  isDarkPlate
                    ? 'text-[var(--ws-plate-muted)]'
                    : 'text-[var(--ws-ink-muted)]'
                }`}
              >
                {t.media.uncroppedNote}
              </span>
            )}
          </div>

          <p className="leading-[1.6] break-words">{media.caption}</p>

          {showDisclosure && (
            <p
              className={`text-[11.5px] leading-snug ${
                isDarkPlate
                  ? 'text-[var(--ws-plate-muted)]'
                  : 'text-[var(--ws-ink-muted)]'
              }`}
            >
              {t.media.relationshipDisclosures[media.relationship_to_signal]}
            </p>
          )}

          <div
            className={`flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t pt-2 ws-meta text-[11.5px] ${
              isDarkPlate
                ? 'border-[var(--ws-plate-border)] text-[var(--ws-plate-muted)]'
                : 'border-[var(--ws-border-subtle)] text-[var(--ws-ink-muted)]'
            }`}
          >
            <span className="break-words">
              {media.credit_line}
              {depictedMeta ? ` · ${depictedMeta}` : ''}
            </span>
            <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-0.5 shrink-0">
              <a
                href={media.source_page_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1 font-medium hover:underline underline-offset-4 ${
                  isDarkPlate
                    ? 'text-[#9ec5f8]'
                    : 'text-[var(--ws-world)]'
                }`}
              >
                <span>{t.media.sourcePageLink}</span>
                <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
              </a>
              {hasLicenseLink ? (
                <a
                  href={media.rights.license_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1 hover:underline underline-offset-4 ${
                    isDarkPlate
                      ? 'text-[var(--ws-plate-secondary)]'
                      : 'text-[var(--ws-ink-secondary)]'
                  }`}
                >
                  <span>{media.rights.license_name}</span>
                  <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
                </a>
              ) : (
                <span>{media.rights.license_name}</span>
              )}
            </span>
          </div>
        </figcaption>
      </figure>
    );
  }

  // MODE 2: Legacy Verified Documentary Media Prop (Backward Compatibility)
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
            onError={() => markUrlFailed(verifiedMedia.src)}
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

  // MODE 1B: Subject-Specific Original Editorial Print Illustration
  const asset = effectiveAsset;
  const assetSrc = asset ? EDITORIAL_ASSET_URLS[asset.id] : null;

  if (!asset || !assetSrc) {
    return null;
  }

  return (
    <figure
      data-visual-mode="editorial_illustration"
      data-asset-id={asset.id}
      data-subject-category={selection.subjectCategory}
      data-media-fallback={usedBrokenMediaFallback ? 'true' : undefined}
      className="space-y-2.5"
    >
      <div
        className={`ws-art-frame ${aspectClass} w-full ${
          isDarkPlate
            ? 'border-[var(--ws-plate-border)] bg-[var(--ws-plate-elevated)]'
            : ''
        }`}
      >
        <img
          src={assetSrc}
          alt={lang === 'zh-CN' ? asset.altZh : asset.altEn}
          referrerPolicy="no-referrer"
          onError={() => markUrlFailed(assetSrc)}
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
            className="h-[2px] w-4 shrink-0"
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
