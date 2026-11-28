import React, { useMemo, useState } from 'react';
import { ExternalLink, ImageOff } from 'lucide-react';
import type {
  SignalDomain,
  SignalMediaAsset,
  UiLanguage,
} from '../../types/edition';
import { getUiStrings } from '../../lib/i18n/uiStrings';
import { isApprovedMediaAsset } from '../../lib/editorial/editorialAssetRegistry';

interface SignalMediaGalleryProps {
  assets: readonly SignalMediaAsset[];
  lang: UiLanguage;
  domain: SignalDomain;
  sectionId?: string;
  title?: string;
  showHeader?: boolean;
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

function isSafeHttpsLink(url: string | undefined): boolean {
  if (!url) return false;
  try {
    return new URL(url.trim()).protocol === 'https:';
  } catch {
    return false;
  }
}

export const SignalMediaGallery: React.FC<SignalMediaGalleryProps> = ({
  assets,
  lang,
  domain,
  sectionId = 'sec-media',
  title,
  showHeader = true,
}) => {
  const t = getUiStrings(lang);
  const [failedMediaKeys, setFailedMediaKeys] = useState<ReadonlySet<string>>(
    () => new Set()
  );

  const approvedAssets = useMemo(
    () => assets.filter((item) => isApprovedMediaAsset(item)),
    [assets]
  );

  if (approvedAssets.length === 0) {
    return null;
  }

  const accent = getDomainAccentVar(domain);

  const markFailed = (mediaKey: string) => {
    setFailedMediaKeys((prev) => {
      if (prev.has(mediaKey)) return prev;
      const next = new Set(prev);
      next.add(mediaKey);
      return next;
    });
  };

  return (
    <section
      id={sectionId}
      data-testid="signal-media-gallery"
      aria-label={title ?? t.media.sectionTitle}
      className="scroll-mt-24 border-t border-[var(--ws-border)] pt-8 space-y-6"
    >
      {showHeader && (
        <div className="space-y-1.5 border-b border-[var(--ws-border-subtle)] pb-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-[1px] shrink-0"
                style={{ backgroundColor: accent }}
                aria-hidden="true"
              />
              <span className="ws-kicker text-[var(--ws-ink-muted)]">
                {t.expanded.sections.media}
              </span>
            </div>
            <span className="ws-meta text-[12px] text-[var(--ws-ink-muted)]">
              {t.media.supportingCount(approvedAssets.length)}
            </span>
          </div>
          <h3 className="font-display text-[1.32rem] font-semibold text-[var(--ws-ink)]">
            {title ?? t.media.sectionTitle}
          </h3>
          <p className="text-[13.5px] leading-relaxed text-[var(--ws-ink-muted)] max-w-[70ch]">
            {t.media.sectionSubtitle}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10">
        {approvedAssets.map((asset, index) => {
          const mediaKey = `${asset.media_id}::${asset.asset_url}`;
          const isBroken = failedMediaKeys.has(mediaKey);
          const cropAllowed = asset.rights.crop_allowed;
          const hasLicenseLink = isSafeHttpsLink(asset.rights.license_url);
          const depictedMeta = [asset.depicted_location, asset.depicted_at]
            .filter(Boolean)
            .join(' · ');
          const relationshipLabel =
            t.media.relationships[asset.relationship_to_signal];
          const typeLabel = t.media.mediaTypes[asset.media_type];
          const showDisclosure =
            asset.relationship_to_signal !== 'direct_event_documentation';
          const showCreatorSeparately =
            asset.creator.trim().length > 0 &&
            !asset.credit_line
              .toLowerCase()
              .includes(asset.creator.trim().toLowerCase());
          const isSingle = approvedAssets.length === 1;
          const isPair = approvedAssets.length === 2;
          const isFeaturedLead =
            isSingle ||
            (isPair && index === 0) ||
            (approvedAssets.length >= 3 && index === 0);
          const colSpanClass = isSingle
            ? 'md:col-span-12'
            : isPair
              ? index === 0
                ? 'md:col-span-7'
                : 'md:col-span-5'
              : index === 0
                ? 'md:col-span-12'
                : 'md:col-span-6';
          const plateIndexLabel = String(index + 1).padStart(2, '0');

          return (
            <figure
              key={asset.media_id}
              data-testid={`media-gallery-item-${asset.media_id}`}
              data-media-id={asset.media_id}
              data-media-relationship={asset.relationship_to_signal}
              data-media-type={asset.media_type}
              data-crop-allowed={String(cropAllowed)}
              className={`group flex flex-col justify-between space-y-3.5 ${colSpanClass}`}
            >
              <div className="space-y-2.5">
                {/* Editorial Classification Header Rule */}
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-[var(--ws-border-strong)] pt-2.5 ws-meta text-[11.5px] text-[var(--ws-ink-muted)]">
                  <span className="inline-flex items-center gap-2 font-semibold text-[var(--ws-ink)]">
                    <span className="font-mono-tabular text-[11px] font-semibold text-[var(--ws-ink-faint)]">
                      {plateIndexLabel}
                    </span>
                    <span
                      className="h-[2px] w-3.5 shrink-0"
                      style={{ backgroundColor: accent }}
                      aria-hidden="true"
                    />
                    <span>{relationshipLabel}</span>
                    <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">
                      ·
                    </span>
                    <span className="font-normal text-[var(--ws-ink-muted)]">
                      {typeLabel}
                    </span>
                  </span>
                  {!cropAllowed && (
                    <span className="text-[11px] text-[var(--ws-ink-muted)]">
                      {t.media.uncroppedNote}
                    </span>
                  )}
                </div>

                {/* Image Viewport or Broken-URL Fallback */}
                {isBroken ? (
                  <div
                    data-testid={`media-fallback-${asset.media_id}`}
                    className="flex min-h-[220px] flex-col items-center justify-center gap-2 border border-[var(--ws-border)] bg-[var(--ws-surface-subtle)] px-6 py-8 text-center"
                  >
                    <ImageOff
                      aria-hidden="true"
                      className="h-5 w-5 text-[var(--ws-ink-faint)]"
                    />
                    <div className="text-[13px] font-semibold text-[var(--ws-ink)]">
                      {t.media.unavailableFallbackTitle}
                    </div>
                    <p className="max-w-[42ch] text-[12px] leading-relaxed text-[var(--ws-ink-muted)]">
                      {t.media.unavailableFallbackBody}
                    </p>
                  </div>
                ) : cropAllowed ? (
                  <div
                    className={`ws-art-frame w-full ${
                      isFeaturedLead ? 'aspect-[16/9]' : 'aspect-[4/3]'
                    }`}
                  >
                    <img
                      src={asset.asset_url}
                      alt={asset.alt_text}
                      loading={asset.placement === 'hero' ? 'eager' : 'lazy'}
                      decoding="async"
                      referrerPolicy="no-referrer"
                      onError={() => markFailed(mediaKey)}
                      className="h-full w-full object-cover object-center motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out motion-safe:group-hover:scale-[1.014]"
                    />
                  </div>
                ) : (
                  <div
                    className={`flex w-full items-center justify-center border border-[var(--ws-border)] bg-[var(--ws-surface-subtle)] p-4 sm:p-5 ${
                      isFeaturedLead ? 'aspect-[16/9]' : 'aspect-[4/3]'
                    }`}
                  >
                    <img
                      src={asset.asset_url}
                      alt={asset.alt_text}
                      loading={asset.placement === 'hero' ? 'eager' : 'lazy'}
                      decoding="async"
                      referrerPolicy="no-referrer"
                      onError={() => markFailed(mediaKey)}
                      className="h-full w-full object-contain"
                    />
                  </div>
                )}
              </div>

              {/* Unboxed Museum Caption, Relationship Disclosure & Provenance Attribution */}
              <figcaption className="flex flex-1 flex-col justify-between gap-3 pt-0.5">
                <div className="space-y-1.5">
                  {asset.title.trim() &&
                    asset.title.trim() !== asset.caption.trim() && (
                      <div className="font-display text-[16.5px] font-semibold leading-snug text-[var(--ws-ink)]">
                        {asset.title}
                      </div>
                    )}
                  <p className="text-[13.5px] leading-[1.68] text-[var(--ws-ink-secondary)] max-w-[70ch]">
                    {asset.caption}
                  </p>
                  {showDisclosure && (
                    <p className="text-[12px] leading-snug text-[var(--ws-ink-muted)]">
                      {t.media.relationshipDisclosures[asset.relationship_to_signal]}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5 border-t border-[var(--ws-border-subtle)] pt-2.5 ws-meta text-[12px] text-[var(--ws-ink-muted)]">
                  <div className="text-[var(--ws-ink-secondary)] font-medium break-words">
                    {asset.credit_line}
                  </div>
                  {showCreatorSeparately && (
                    <div>
                      {t.media.creatorLabel}: {asset.creator}
                    </div>
                  )}
                  {depictedMeta && (
                    <div>
                      {t.media.depictedLabel}: {depictedMeta}
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-0.5 text-[11.5px]">
                    <a
                      href={asset.source_page_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-[var(--ws-world)] hover:underline underline-offset-4"
                    >
                      <span>{t.media.sourcePageLink}</span>
                      <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
                    </a>
                    {hasLicenseLink ? (
                      <a
                        href={asset.rights.license_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-medium text-[var(--ws-ink-secondary)] hover:text-[var(--ws-ink)] hover:underline underline-offset-4"
                      >
                        <span>
                          {t.media.licenseLink}: {asset.rights.license_name}
                        </span>
                        <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
                      </a>
                    ) : (
                      <span>
                        {t.media.licenseLink}: {asset.rights.license_name}
                      </span>
                    )}
                  </div>
                </div>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </section>
  );
};
