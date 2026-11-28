import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { UiLanguage } from '../../../types/edition';
import type { InterfacePhotoAsset } from '../../../lib/editorial/interfaceImageLibrary';
import { InterfacePhotoPlate } from '../InterfacePhotoPlate';

interface DocumentaryImageBreakProps {
  photo: InterfacePhotoAsset;
  lang: UiLanguage;
  kickerEn: string;
  kickerZh: string;
  titleEn: string;
  titleZh: string;
  bodyEn: string;
  bodyZh: string;
  folioCode: string;
  ctaLabelEn?: string;
  ctaLabelZh?: string;
  onCtaClick?: () => void;
}

/**
 * Wide editorial visual interruption (Composition Pattern 4: DocumentaryImageBreak).
 * Introduces deliberate visual breathing room between dense typographic dispatch lists
 * and domain-specific desks without pretending generic photography is event evidence.
 */
export const DocumentaryImageBreak: React.FC<DocumentaryImageBreakProps> = ({
  photo,
  lang,
  kickerEn,
  kickerZh,
  titleEn,
  titleZh,
  bodyEn,
  bodyZh,
  folioCode,
  ctaLabelEn,
  ctaLabelZh,
  onCtaClick,
}) => {
  const isZh = lang === 'zh-CN';

  return (
    <section
      aria-label={isZh ? titleZh : titleEn}
      data-testid="editorial-documentary-break"
      className="ws-documentary-break scroll-mt-20 border-y border-[var(--ws-border-strong)] py-7 sm:py-9 space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-9 items-end">
        <div className="lg:col-span-7 space-y-2">
          <div className="flex items-center gap-3 ws-meta text-[11px] text-[var(--ws-ink-muted)]">
            <span className="ws-kicker text-[var(--ws-editorial-accent)]">
              {isZh ? kickerZh : kickerEn}
            </span>
            <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">
              /
            </span>
            <span className="font-mono-tabular">{folioCode}</span>
          </div>
          <h2 className="font-display text-[22px] sm:text-[28px] font-semibold leading-[1.2] tracking-[-0.02em] text-[var(--ws-ink)]">
            {isZh ? titleZh : titleEn}
          </h2>
        </div>

        <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3">
          <p className="text-[13.5px] leading-[1.68] text-[var(--ws-ink-secondary)] lg:text-right max-w-[46ch]">
            {isZh ? bodyZh : bodyEn}
          </p>
          {onCtaClick && (ctaLabelEn || ctaLabelZh) && (
            <button
              type="button"
              onClick={onCtaClick}
              className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[var(--ws-ink)] hover:text-[var(--ws-editorial-accent)] transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>{isZh ? ctaLabelZh : ctaLabelEn}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="group">
        <InterfacePhotoPlate
          photo={photo}
          lang={lang}
          aspect="21/7"
          frameStyle="documentary"
          compact
          plateLabel={folioCode}
        />
      </div>
    </section>
  );
};
