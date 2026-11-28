import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import type { SignalDomain, UiLanguage } from '../../types/edition';
import type { InterfacePhotoAsset } from '../../lib/editorial/interfaceImageLibrary';

export type InterfacePhotoAspect =
  | '21/8'
  | '21/9'
  | '16/9'
  | '16/10'
  | '4/3'
  | '4/5'
  | '3/4';

interface InterfacePhotoPlateProps {
  photo: InterfacePhotoAsset;
  lang: UiLanguage;
  aspect?: InterfacePhotoAspect;
  tone?: 'light' | 'dark';
  priority?: boolean;
  /** Optional custom object-position override when a specific layout needs fine framing */
  objectPositionOverride?: string;
  /** Optional figure/plate index for print-style numbering (e.g., '01', 'I') */
  plateLabel?: string;
  /** Compact mode trims caption spacing for secondary companion plates */
  compact?: boolean;
  /** Show the full non-documentary disclaimer line below the caption */
  showContextDisclosure?: boolean;
  className?: string;
}

const ASPECT_CLASSES: Record<InterfacePhotoAspect, string> = {
  '21/8': 'aspect-[21/8]',
  '21/9': 'aspect-[21/9]',
  '16/9': 'aspect-[16/9]',
  '16/10': 'aspect-[16/10]',
  '4/3': 'aspect-[4/3]',
  '4/5': 'aspect-[4/5]',
  '3/4': 'aspect-[3/4]',
};

function domainAccentColor(domain: SignalDomain): string {
  switch (domain) {
    case 'world':
      return 'var(--ws-world)';
    case 'ai':
      return 'var(--ws-ai)';
    case 'economy':
      return 'var(--ws-economy)';
  }
}

export const InterfacePhotoPlate: React.FC<InterfacePhotoPlateProps> = ({
  photo,
  lang,
  aspect,
  tone = 'light',
  priority = false,
  objectPositionOverride,
  plateLabel,
  compact = false,
  showContextDisclosure = true,
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  const isDark = tone === 'dark';
  const resolvedAspect: InterfacePhotoAspect =
    aspect ?? (photo.orientation === 'portrait' ? '3/4' : '16/9');
  const aspectClass = ASPECT_CLASSES[resolvedAspect];
  const accent = domainAccentColor(photo.domain);
  const altText = lang === 'zh-CN' ? photo.altZh : photo.altEn;
  const captionText = lang === 'zh-CN' ? photo.captionZh : photo.captionEn;
  const contextNote =
    lang === 'zh-CN'
      ? photo.editorialContextNoteZh
      : photo.editorialContextNoteEn;
  const contextTag =
    lang === 'zh-CN' ? '编务语境摄影 · 非纪实证据' : 'Editorial Context · Non-Documentary';
  const photoByLabel = lang === 'zh-CN' ? '摄影' : 'Photo';
  const sourceLabel = lang === 'zh-CN' ? '来源' : 'Source';

  const responsiveSizes =
    resolvedAspect === '21/8' || resolvedAspect === '21/9'
      ? '(min-width: 1280px) 1360px, 100vw'
      : resolvedAspect === '16/9' || resolvedAspect === '16/10'
        ? '(min-width: 1024px) 780px, 100vw'
        : '(min-width: 1024px) 480px, 100vw';
  const webpWidth800 =
    photo.orientation === 'portrait'
      ? Math.round((photo.naturalWidth / photo.naturalHeight) * 800)
      : 800;
  const webpWidth1600 =
    photo.orientation === 'portrait'
      ? Math.round((photo.naturalWidth / photo.naturalHeight) * 1600)
      : 1600;

  return (
    <figure
      data-interface-photo-id={photo.id}
      data-photo-classification={photo.classification}
      data-documentary-evidence="false"
      className={`space-y-2.5 ${className}`.trim()}
    >
      <div
        className={`ws-photo-frame ${aspectClass} w-full ${
          isDark
            ? 'border-[var(--ws-plate-border)] bg-[var(--ws-plate-elevated)]'
            : 'border-[var(--ws-border)] bg-[var(--ws-surface-subtle)]'
        }`}
      >
        {!imageError ? (
          <picture className="block h-full w-full">
            <source
              type="image/webp"
              srcSet={`${photo.webp800Path} ${webpWidth800}w, ${photo.webp1600Path} ${webpWidth1600}w`}
              sizes={responsiveSizes}
            />
            <img
              src={photo.localPath}
              alt={altText}
              width={photo.naturalWidth}
              height={photo.naturalHeight}
              loading={priority ? 'eager' : 'lazy'}
              decoding="async"
              onError={() => setImageError(true)}
              style={{
                objectPosition: objectPositionOverride ?? photo.objectPosition,
              }}
              className="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-out motion-safe:group-hover:scale-[1.018]"
            />
          </picture>
        ) : (
          <div
            className={`flex h-full w-full flex-col justify-between p-5 ${
              isDark ? 'text-[var(--ws-plate-secondary)]' : 'text-[var(--ws-ink-secondary)]'
            }`}
          >
            <div className="flex items-center justify-between gap-2 ws-meta text-[11px]">
              <span className="ws-kicker" style={{ color: accent }}>
                {contextTag}
              </span>
              {plateLabel && (
                <span className="font-mono-tabular opacity-70">{plateLabel}</span>
              )}
            </div>
            <p className="font-display text-[17px] leading-snug">{captionText}</p>
            <span className="ws-meta text-[11.5px] opacity-75">
              {photoByLabel}: {photo.creator}
            </span>
          </div>
        )}
      </div>

      <figcaption
        className={`${compact ? 'space-y-1.5' : 'space-y-2'} text-[12px] leading-snug ${
          isDark
            ? 'text-[var(--ws-plate-secondary)]'
            : 'text-[var(--ws-ink-secondary)]'
        }`}
      >
        {/* Top Attribution & Explicit Non-Documentary Context Line */}
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 ws-meta text-[11px]">
          <span className="inline-flex items-center gap-2 font-semibold">
            <span
              className="h-[2px] w-3.5 shrink-0"
              style={{ backgroundColor: accent }}
              aria-hidden="true"
            />
            <span
              className={
                isDark ? 'text-[var(--ws-plate-ink)]' : 'text-[var(--ws-ink)]'
              }
            >
              {contextTag}
            </span>
          </span>
          {plateLabel && (
            <span
              className={`font-mono-tabular text-[10.5px] ${
                isDark
                  ? 'text-[var(--ws-plate-muted)]'
                  : 'text-[var(--ws-ink-faint)]'
              }`}
            >
              {plateLabel}
            </span>
          )}
        </div>

        {/* Descriptive Caption */}
        <p
          className={`${compact ? 'text-[12px]' : 'text-[12.5px]'} leading-[1.58] ${
            isDark
              ? 'text-[var(--ws-plate-secondary)]'
              : 'text-[var(--ws-ink-secondary)]'
          }`}
        >
          {captionText}
        </p>

        {/* Optional Explicit Non-Documentary Guardrail Note */}
        {showContextDisclosure && (
          <p
            className={`text-[11px] leading-[1.5] ${
              isDark
                ? 'text-[var(--ws-plate-muted)]'
                : 'text-[var(--ws-ink-muted)]'
            }`}
          >
            {contextNote}
          </p>
        )}

        {/* Quiet Photographer Credit + Source & Unsplash License Provenance */}
        <div
          className={`flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t pt-1.5 ws-meta text-[11px] ${
            isDark
              ? 'border-[var(--ws-plate-border)] text-[var(--ws-plate-muted)]'
              : 'border-[var(--ws-border-subtle)] text-[var(--ws-ink-muted)]'
          }`}
        >
          <span>
            {photoByLabel}:{' '}
            {photo.creatorProfileUrl ? (
              <a
                href={photo.creatorProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`hover:underline underline-offset-4 ${
                  isDark
                    ? 'text-[var(--ws-plate-secondary)]'
                    : 'text-[var(--ws-ink)]'
                }`}
              >
                {photo.creator}
              </a>
            ) : (
              <span
                className={
                  isDark
                    ? 'text-[var(--ws-plate-secondary)]'
                    : 'text-[var(--ws-ink)]'
                }
              >
                {photo.creator}
              </span>
            )}
          </span>

          <span className="inline-flex items-center gap-x-2.5 shrink-0">
            <a
              href={photo.sourcePageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1 hover:underline underline-offset-4 ${
                isDark ? 'text-[#9ec5f8]' : 'text-[var(--ws-world)]'
              }`}
            >
              <span>{sourceLabel}</span>
              <ExternalLink className="h-2.5 w-2.5 shrink-0" aria-hidden="true" />
            </a>
            <span aria-hidden="true" className="opacity-45">
              ·
            </span>
            <a
              href={photo.licenseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline underline-offset-4"
            >
              {photo.licenseName}
            </a>
          </span>
        </div>
      </figcaption>
    </figure>
  );
};
