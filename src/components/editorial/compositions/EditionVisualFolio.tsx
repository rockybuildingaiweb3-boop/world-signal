import React from 'react';
import { ArrowDownRight } from 'lucide-react';
import type { ParsedSignal, SignalDomain, UiLanguage } from '../../../types/edition';
import type { InterfacePhotoAsset } from '../../../lib/editorial/interfaceImageLibrary';
import { InterfacePhotoPlate } from '../InterfacePhotoPlate';

export interface EditionFolioDeskItem {
  readonly domain: SignalDomain;
  readonly numeral: string;
  readonly anchorId: string;
  readonly titleEn: string;
  readonly titleZh: string;
  readonly worldStyleEn: string;
  readonly worldStyleZh: string;
  readonly total: number;
  readonly sharePct: number;
  readonly imp5Count: number;
  readonly leadSignal: ParsedSignal | null;
  readonly photo: InterfacePhotoAsset;
}

interface EditionVisualFolioProps {
  items: readonly EditionFolioDeskItem[];
  lang: UiLanguage;
  editionDate: string;
}

function getDomainAccent(domain: SignalDomain): string {
  switch (domain) {
    case 'world':
      return 'var(--ws-world)';
    case 'ai':
      return 'var(--ws-ai)';
    case 'economy':
      return 'var(--ws-economy)';
  }
}

function getFrameStyle(
  domain: SignalDomain
): 'documentary' | 'scientific' | 'institutional' {
  switch (domain) {
    case 'world':
      return 'documentary';
    case 'ai':
      return 'scientific';
    case 'economy':
      return 'institutional';
  }
}

/**
 * Edition Visual Folio (Composition Pattern 01).
 * A 3-column architectural desk index giving readers an immediate visual
 * preview of WORLD SIGNAL's three distinct editorial visual worlds with
 * grounded signal counts and direct anchor jump links.
 */
export const EditionVisualFolio: React.FC<EditionVisualFolioProps> = ({
  items,
  lang,
  editionDate,
}) => {
  const isZh = lang === 'zh-CN';

  return (
    <nav
      aria-label={isZh ? '三大独立视觉编辑部索引' : 'Editorial Visual Worlds Index'}
      data-testid="edition-visual-folio"
      className="border-t border-b border-[var(--ws-border-strong)] py-7 sm:py-8 space-y-6"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <div className="ws-kicker text-[var(--ws-editorial-accent)]">
            {isZh
              ? '视觉导览 · 三大独立编辑部'
              : 'EDITION DESKS · VISUAL FOLIO'}
          </div>
          <h2 className="font-display text-[1.35rem] sm:text-[1.6rem] font-semibold tracking-[-0.018em] text-[var(--ws-ink)]">
            {isZh
              ? '按领域气质直达今日核心版块'
              : 'Jump Directly Into Today’s Three Editorial Worlds'}
          </h2>
        </div>
        <span className="font-mono-tabular text-[11.5px] text-[var(--ws-ink-muted)]">
          {editionDate} · 01 — 03
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0 md:divide-x md:divide-[var(--ws-border)]">
        {items.map((item) => {
          const accent = getDomainAccent(item.domain);
          return (
            <div
              key={item.domain}
              className="flex flex-col justify-between gap-4 md:px-5 first:md:pl-0 last:md:pr-0"
            >
              <div className="space-y-3.5">
                <div
                  className="border-t-[2.5px] pt-3 flex items-baseline justify-between gap-2"
                  style={{ borderTopColor: accent }}
                >
                  <div className="flex items-baseline gap-2.5 min-w-0">
                    <span
                      className="ws-editorial-numeral text-[28px] leading-none opacity-45 shrink-0"
                      style={{ color: accent }}
                    >
                      {item.numeral}
                    </span>
                    <div className="min-w-0">
                      <div
                        className="ws-kicker text-[10px] truncate"
                        style={{ color: accent }}
                      >
                        {isZh ? item.worldStyleZh : item.worldStyleEn}
                      </div>
                      <div className="font-display text-[18px] font-semibold text-[var(--ws-ink)] leading-snug">
                        {isZh ? item.titleZh : item.titleEn}
                      </div>
                    </div>
                  </div>
                  <span className="font-mono-tabular text-[12px] font-semibold text-[var(--ws-ink)] shrink-0">
                    {item.total}{' '}
                    <span className="font-normal text-[var(--ws-ink-muted)]">
                      ({item.sharePct}%)
                    </span>
                  </span>
                </div>

                <div className="group">
                  <InterfacePhotoPlate
                    photo={item.photo}
                    lang={lang}
                    aspect="16/9"
                    frameStyle={getFrameStyle(item.domain)}
                    compact
                    showContextDisclosure={false}
                    plateLabel={`FOLIO ${item.numeral}`}
                  />
                </div>

                {item.leadSignal && (
                  <p className="text-[13px] leading-[1.55] text-[var(--ws-ink-secondary)] line-clamp-2">
                    {item.leadSignal.headline}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 border-t border-[var(--ws-border-subtle)] pt-2.5 ws-meta text-[11.5px]">
                <span className="text-[var(--ws-ink-muted)]">
                  {isZh
                    ? `关键信号 5/5：${item.imp5Count}`
                    : `Critical 5/5: ${item.imp5Count}`}
                </span>
                <a
                  href={`#${item.anchorId}`}
                  className="inline-flex items-center gap-1 font-semibold hover:underline underline-offset-4"
                  style={{ color: accent }}
                >
                  <span>{isZh ? '直达版块' : 'Jump to desk'}</span>
                  <ArrowDownRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </nav>
  );
};
