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
            <span className="font-mono-tabular text-[11.5px] text-[var(--ws-ink-muted)]">
              {t.media.supportingCount(approvedAssets.length)}
            </span>
          </div>
          <h3 className="font-display text-[1.28rem] font-semibold text-[var(--ws-ink)]">
            {title ?? t.media.sectionTitle}
          </h3>
          <p className="text-[13px] leading-relaxed text-[var(--ws-ink-muted)] max-w-[70ch]">
            {t.media.sectionSubtitle}
          </p>
        </div>
      )}

      <div
        className={`grid grid-cols-1 gap-7 ${
          approvedAssets.length > 1 ? 'md:grid-cols-2' : ''
        }`}
      >
        {approvedAssets.map((asset) => {
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

          return (
            <figure
              key={asset.media_id}
              data-testid={`media-gallery-item-${asset.media_id}`}
              data-media-id={asset.media_id}
              data-media-relationship={asset.relationship_to_signal}
              data-media-type={asset.media_type}
              data-crop-allowed={String(cropAllowed)}
              className="flex flex-col justify-between border border-[var(--ws-border)] bg-[var(--ws-surface)]"
            >
              <div>
                {/* Editorial Classification Header Rule */}
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-[var(--ws-border-subtle)] bg-[var(--ws-surface-subtle)]/70 px-3.5 py-2 font-mono-tabular text-[11px] text-[var(--ws-ink-muted)]">
                  <span className="inline-flex items-center gap-2 font-semibold text-[var(--ws-ink)]">
                    <span
                      className="h-1.5 w-3 shrink-0"
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
                    <span className="text-[10.5px] text-[var(--ws-ink-muted)]">
                      {t.media.uncroppedNote}
                    </span>
                  )}
                </div>

                {/* Image Viewport or Broken-URL Fallback */}
                {isBroken ? (
                  <div
                    data-testid={`media-fallback-${asset.media_id}`}
                    className="flex min-h-[210px] flex-col items-center justify-center gap-2 bg-[var(--ws-surface-subtle)] px-6 py-8 text-center"
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
                  <div className="ws-art-frame aspect-[16/10] w-full border-0 border-b border-[var(--ws-border-subtle)]">
                    <img
                      src={asset.asset_url}
                      alt={asset.alt_text}
                      loading={asset.placement === 'hero' ? 'eager' : 'lazy'}
                      decoding="async"
                      referrerPolicy="no-referrer"
                      onError={() => markFailed(mediaKey)}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-[16/10] w-full items-center justify-center border-b border-[var(--ws-border-subtle)] bg-[var(--ws-surface-subtle)] p-3">
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

              {/* Caption, Relationship Disclosure & Provenance Attribution */}
              <figcaption className="flex flex-1 flex-col justify-between gap-3 p-4">
                <div className="space-y-1.5">
                  {asset.title.trim() &&
                    asset.title.trim() !== asset.caption.trim() && (
                      <div className="font-display text-[15px] font-semibold leading-snug text-[var(--ws-ink)]">
                        {asset.title}
                      </div>
                    )}
                  <p className="text-[13.5px] leading-[1.65] text-[var(--ws-ink-secondary)]">
                    {asset.caption}
                  </p>
                  {showDisclosure && (
                    <p className="text-[11.5px] leading-snug text-[var(--ws-ink-muted)]">
                      {t.media.relationshipDisclosures[asset.relationship_to_signal]}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5 border-t border-[var(--ws-border-subtle)] pt-2.5 font-mono-tabular text-[11.5px] text-[var(--ws-ink-muted)]">
                  <div className="text-[var(--ws-ink-secondary)] break-words">
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
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-0.5">
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
