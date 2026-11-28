import React from 'react';
import { ArrowRight, Globe2, Compass, Cpu, Landmark } from 'lucide-react';
import type {
  ParsedSignal,
  SignalDomain,
  UiLanguage,
} from '../../../types/edition';
import type { DomainEditionProfile } from '../../../lib/intelligence/visual-metrics/editorialVisualHelpers';
import type { InterfacePhotoAsset } from '../../../lib/editorial/interfaceImageLibrary';
import { getUiStrings } from '../../../lib/i18n/uiStrings';
import { DomainEditorialEmblem } from '../EditorialSignalArtwork';
import { InterfacePhotoPlate } from '../InterfacePhotoPlate';
import { SignalMetaLine } from '../SignalMetaLine';

export interface DomainDeskPhotoSet {
  primary: InterfacePhotoAsset;
  secondary: InterfacePhotoAsset;
  tertiary: InterfacePhotoAsset;
}

interface BaseDeskProps {
  profile: DomainEditionProfile;
  leadSignal: ParsedSignal | null;
  dispatches: ParsedSignal[];
  photos: DomainDeskPhotoSet;
  lang: UiLanguage;
  getSignalExcerpt: (signal: ParsedSignal, maxLength?: number) => string;
  onOpenSignal: (signalId: string) => void;
  onExploreDomain: (domain: SignalDomain) => void;
}

// =============================================================================
// DESK I — WORLD EVENTS: GLOBAL DOCUMENTARY
// Panoramic geographic photography, cartographic meridian rule, regional datelines,
// asymmetric 7:5 foreign-correspondent opener, dual documentary plates, 3-col wire.
// =============================================================================

export const WorldDocumentaryDesk: React.FC<BaseDeskProps> = ({
  profile,
  leadSignal,
  dispatches,
  photos,
  lang,
  getSignalExcerpt,
  onOpenSignal,
  onExploreDomain,
}) => {
  const t = getUiStrings(lang);
  const isZh = lang === 'zh-CN';

  // Grounded geographic datelines present in this edition's World signals
  const activeGeographies = Array.from(
    new Set(
      [leadSignal, ...dispatches]
        .filter((s): s is ParsedSignal => s !== null)
        .flatMap((s) => s.event.geography)
    )
  ).slice(0, 6);

  return (
    <section
      id="desk-world-events"
      aria-label={t.domains.world}
      data-testid="desk-world-events"
      data-desk-personality="global-documentary"
      className="ws-desk-world scroll-mt-20 p-6 sm:p-8 lg:p-10 space-y-7"
    >
      {/* Documentary Broadsheet Header with Cartographic Folio Coordinates */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--ws-border-strong)] pb-4">
          <div className="flex items-end gap-4">
            <span
              aria-hidden="true"
              className="ws-editorial-numeral text-[46px] sm:text-[56px] text-[var(--ws-world)]/45 select-none"
            >
              01
            </span>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <DomainEditorialEmblem domain="world" className="h-4 w-4" />
                <span
                  className="ws-kicker"
                  style={{ color: 'var(--ws-world)' }}
                >
                  {isZh
                    ? '全球纪实 · 外交与地缘政治部'
                    : 'Global Documentary · Foreign Affairs Desk'}
                </span>
              </div>
              <h3 className="font-display text-[28px] sm:text-[34px] font-semibold tracking-[-0.022em] text-[var(--ws-ink)] leading-none">
                {t.domains.world}
              </h3>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <div className="ws-meta text-[12.5px] text-[var(--ws-ink-muted)]">
              <span className="font-semibold text-[var(--ws-ink)]">
                {profile.total}
              </span>{' '}
              · {t.briefing.domainShareLabel(profile.sharePct)} · 5/5:{' '}
              {profile.imp5Count} · 4/5: {profile.imp4Count}
            </div>
            <button
              type="button"
              onClick={() => onExploreDomain('world')}
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold hover:underline underline-offset-4 cursor-pointer"
              style={{ color: 'var(--ws-world)' }}
            >
              <span>
                {t.briefing.exploreDomain} ({profile.total})
              </span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Cartographic Regional Dateline Ribbon (Strictly grounded in real signal geographies) */}
        {activeGeographies.length > 0 && (
          <div className="ws-cartographic-strip flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 py-2 text-[11.5px] ws-meta text-[var(--ws-ink-muted)]">
            <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--ws-world)]">
              <Compass className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>
                {isZh ? '本期地理坐标' : 'Edition Datelines'}
              </span>
            </span>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {activeGeographies.map((geo, idx) => (
                <React.Fragment key={geo}>
                  {idx > 0 && (
                    <span
                      aria-hidden="true"
                      className="text-[var(--ws-ink-faint)]"
                    >
                      ·
                    </span>
                  )}
                  <span className="text-[var(--ws-ink-secondary)] font-medium">
                    {geo}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Panoramic 21:7 Geographic Opener */}
      <div className="group">
        <InterfacePhotoPlate
          photo={photos.primary}
          lang={lang}
          aspect="21/7"
          frameStyle="documentary"
          compact
          plateLabel={
            isZh ? '世界部 · 全景地理语境' : 'FOLIO I · PANORAMIC CONTEXT'
          }
        />
      </div>

      {/* Asymmetric 7:5 Foreign Affairs Feature Spread */}
      {leadSignal && (
        <article className="border-t border-[var(--ws-border-strong)] pt-6 grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
          <div className="lg:col-span-7 space-y-3">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 ws-meta text-[12px] text-[var(--ws-ink-muted)]">
              <Globe2
                className="h-3.5 w-3.5 text-[var(--ws-world)] shrink-0"
                aria-hidden="true"
              />
              <span className="font-semibold text-[var(--ws-world)]">
                {leadSignal.event.geography.slice(0, 2).join(' · ') ||
                  leadSignal.topic}
              </span>
              <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">
                /
              </span>
              <span>{leadSignal.topic}</span>
              <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">
                ·
              </span>
              <span className="font-mono-tabular font-semibold text-[var(--ws-ink)]">
                {t.metaLine.importance(leadSignal.importance)}
              </span>
            </div>
            <h4 className="ws-headline-feature text-[var(--ws-ink)]">
              <button
                type="button"
                onClick={() => onOpenSignal(leadSignal.signal_id)}
                className="text-left ws-headline-link hover:text-[var(--ws-world)] cursor-pointer"
              >
                {leadSignal.headline}
              </button>
            </h4>
          </div>

          <div className="lg:col-span-5 lg:border-l lg:border-[var(--ws-border)] lg:pl-7 space-y-4">
            <p className="text-[14.5px] leading-[1.78] text-[var(--ws-ink-secondary)]">
              {getSignalExcerpt(leadSignal, 200)}
            </p>
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <SignalMetaLine signal={leadSignal} lang={lang} compact />
              <button
                type="button"
                onClick={() => onOpenSignal(leadSignal.signal_id)}
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--ws-ink)] hover:text-[var(--ws-world)] transition-colors cursor-pointer"
              >
                <span>{t.briefing.readDossier}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </article>
      )}

      {/* Dual Documentary Context Strip + 3-Column Correspondent Wire */}
      <div className="border-t border-[var(--ws-border)] pt-7 grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-9 items-start">
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
          <div className="group">
            <InterfacePhotoPlate
              photo={photos.secondary}
              lang={lang}
              aspect="16/10"
              frameStyle="documentary"
              compact
              plateLabel={
                isZh ? '地理通道 · 语境 II' : 'FOLIO I · CORRIDOR CONTEXT'
              }
            />
          </div>
          <div className="group">
            <InterfacePhotoPlate
              photo={photos.tertiary}
              lang={lang}
              aspect="16/9"
              frameStyle="documentary"
              compact
              showContextDisclosure={false}
              plateLabel={
                isZh ? '制度空间 · 语境 III' : 'FOLIO I · INSTITUTIONAL CONTEXT'
              }
            />
          </div>
        </div>

        <div className="lg:col-span-7 lg:border-l lg:border-[var(--ws-border)] lg:pl-8 divide-y divide-[var(--ws-border)]">
          {dispatches.map((sig, idx) => (
            <article
              key={sig.signal_id}
              className={`group space-y-2 ${idx === 0 ? 'pb-5' : 'py-5'}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 ws-meta text-[11.5px] text-[var(--ws-ink-muted)]">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono-tabular font-semibold text-[var(--ws-world)]">
                    {sig.event.start_date}
                  </span>
                  <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">
                    ·
                  </span>
                  <span className="truncate text-[var(--ws-ink-secondary)]">
                    {sig.event.geography[0] || sig.topic}
                  </span>
                </div>
                <span className="shrink-0 font-mono-tabular font-semibold text-[var(--ws-world)]">
                  {sig.importance}/5
                </span>
              </div>
              <h4 className="font-display text-[18px] font-semibold leading-[1.32] text-[var(--ws-ink)]">
                <button
                  type="button"
                  onClick={() => onOpenSignal(sig.signal_id)}
                  className="text-left ws-headline-link group-hover:text-[var(--ws-world)] cursor-pointer"
                >
                  {sig.headline}
                </button>
              </h4>
              <p className="text-[13.5px] leading-[1.68] text-[var(--ws-ink-secondary)] line-clamp-2">
                {getSignalExcerpt(sig, 130)}
              </p>
              <div className="flex items-center justify-between gap-2 ws-meta text-[11.5px] text-[var(--ws-ink-muted)]">
                <span>
                  {t.metaLine.origins(sig.independentOriginCount)} ·{' '}
                  {t.metaLine.claims(sig.claims.length)} ·{' '}
                  {t.confidence[sig.confidence.overall]}
                </span>
                <button
                  type="button"
                  onClick={() => onOpenSignal(sig.signal_id)}
                  className="inline-flex items-center gap-1 font-semibold text-[var(--ws-ink)] hover:text-[var(--ws-world)] cursor-pointer"
                >
                  <span>{isZh ? '研读' : 'Read'}</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

// =============================================================================
// DESK II — AI FRONTIER: SCIENTIFIC MODERNISM
// Nocturnal obsidian architectural drafting surface, vertical 3:4 hardware spine,
// precision macro diptych (wafer + laboratory/engineering), tabular technical index
// with calibrated 5-segment importance bars — zero neon clichés.
// =============================================================================

export const AiModernistDesk: React.FC<BaseDeskProps> = ({
  profile,
  leadSignal,
  dispatches,
  photos,
  lang,
  getSignalExcerpt,
  onOpenSignal,
  onExploreDomain,
}) => {
  const t = getUiStrings(lang);
  const isZh = lang === 'zh-CN';

  return (
    <section
      id="desk-ai-frontier"
      aria-label={t.domains.ai}
      data-testid="desk-ai-frontier"
      data-desk-personality="scientific-modernism"
      className="ws-desk-ai-plate ws-scientific-grid scroll-mt-20 p-6 sm:p-8 lg:p-10 space-y-7"
    >
      {/* Precision Scientific Monograph Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--ws-plate-border)] pb-5">
        <div className="flex items-end gap-4">
          <span
            aria-hidden="true"
            className="ws-editorial-numeral font-mono-tabular text-[44px] sm:text-[54px] text-[#cbb4ff]/58 select-none"
          >
            02
          </span>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <DomainEditorialEmblem
                domain="ai"
                className="h-4 w-4 text-[#cbb4ff]"
              />
              <span className="ws-kicker text-[#cbb4ff]">
                {isZh
                  ? '科学现代主义 · 前沿计算与系统实验部'
                  : 'Scientific Modernism · Frontier Compute & Systems'}
              </span>
            </div>
            <h3 className="font-display text-[28px] sm:text-[34px] font-semibold tracking-[-0.02em] text-[var(--ws-plate-ink)] leading-none">
              {t.domains.ai}
            </h3>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div className="font-mono-tabular text-[12px] text-[var(--ws-plate-muted)]">
            <span className="font-semibold text-[var(--ws-plate-ink)]">
              {profile.total}
            </span>{' '}
            · {t.briefing.domainShareLabel(profile.sharePct)} · 5/5:{' '}
            {profile.imp5Count} · 4/5: {profile.imp4Count}
          </div>
          <button
            type="button"
            onClick={() => onExploreDomain('ai')}
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#cbb4ff] hover:text-white hover:underline underline-offset-4 cursor-pointer"
          >
            <span>
              {t.briefing.exploreDomain} ({profile.total})
            </span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Asymmetric Technical Monograph Grid: 4-col Portrait Spine + 8-col Modular Lab Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-9 items-start">
        {/* Left 4 Cols: Vertical Portrait Compute/Hardware Architecture Spine */}
        <div className="lg:col-span-4 space-y-5">
          <div className="group">
            <InterfacePhotoPlate
              photo={photos.primary}
              lang={lang}
              aspect="3/4"
              tone="dark"
              frameStyle="scientific"
              compact
              plateLabel={
                isZh ? 'SPEC.02-A · 算力硬件' : 'SPEC.02-A · INFRASTRUCTURE'
              }
            />
          </div>

          {/* Quiet Precision Specification Ledger (Strictly Grounded Edition Metrics) */}
          <dl className="border-t border-[var(--ws-plate-border)] pt-4 grid grid-cols-2 gap-4 font-mono-tabular text-[11.5px]">
            <div>
              <dt className="text-[var(--ws-plate-muted)]">
                {isZh ? '板块覆盖率' : 'Edition Share'}
              </dt>
              <dd className="mt-1 text-[22px] font-semibold text-[var(--ws-plate-ink)]">
                {profile.sharePct}%
              </dd>
            </div>
            <div className="border-l border-[var(--ws-plate-border)] pl-4">
              <dt className="text-[var(--ws-plate-muted)]">
                {isZh ? '核心优先级 (≥4/5)' : 'Priority (≥4/5)'}
              </dt>
              <dd className="mt-1 text-[22px] font-semibold text-[#cbb4ff]">
                {profile.imp5Count + profile.imp4Count}/{profile.total}
              </dd>
            </div>
          </dl>
        </div>

        {/* Right 8 Cols: Lead Monograph + Technical Macro/Lab Diptych + Tabular Index */}
        <div className="lg:col-span-8 lg:border-l lg:border-[var(--ws-plate-border)] lg:pl-8 space-y-6">
          {/* Lead AI Signal with Technical Header */}
          {leadSignal && (
            <article className="border-b border-[var(--ws-plate-border)] pb-6 space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2 font-mono-tabular text-[11.5px]">
                <span className="inline-flex items-center gap-2 font-semibold text-[#cbb4ff]">
                  <Cpu className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{leadSignal.topic}</span>
                </span>
                <span className="text-[var(--ws-plate-muted)]">
                  {leadSignal.signal_id} ·{' '}
                  {t.metaLine.importance(leadSignal.importance)}
                </span>
              </div>

              <h4 className="font-display text-[23px] sm:text-[28px] font-semibold leading-[1.2] tracking-[-0.018em] text-[var(--ws-plate-ink)]">
                <button
                  type="button"
                  onClick={() => onOpenSignal(leadSignal.signal_id)}
                  className="text-left ws-headline-link hover:text-[#cbb4ff] cursor-pointer"
                >
                  {leadSignal.headline}
                </button>
              </h4>

              <p className="text-[14.5px] leading-[1.76] text-[var(--ws-plate-secondary)] max-w-[66ch]">
                {getSignalExcerpt(leadSignal, 200)}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <span className="font-mono-tabular text-[11.5px] text-[var(--ws-plate-muted)]">
                  {t.metaLine.origins(leadSignal.independentOriginCount)} ·{' '}
                  {t.metaLine.claims(leadSignal.claims.length)} ·{' '}
                  {t.confidence[leadSignal.confidence.overall]}
                </span>
                <button
                  type="button"
                  onClick={() => onOpenSignal(leadSignal.signal_id)}
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--ws-plate-ink)] hover:text-[#cbb4ff] transition-colors cursor-pointer"
                >
                  <span>{t.briefing.readDossier}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </article>
          )}

          {/* Dual Scientific Materiality & Laboratory Diptych */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-[var(--ws-plate-border)] pb-6">
            <div className="group">
              <InterfacePhotoPlate
                photo={photos.secondary}
                lang={lang}
                aspect="4/3"
                tone="dark"
                frameStyle="scientific"
                compact
                showContextDisclosure={false}
                plateLabel={
                  isZh ? 'SPEC.02-B · 微距材料' : 'SPEC.02-B · MATERIAL MACRO'
                }
              />
            </div>
            <div className="group">
              <InterfacePhotoPlate
                photo={photos.tertiary}
                lang={lang}
                aspect="4/3"
                tone="dark"
                frameStyle="scientific"
                compact
                showContextDisclosure={false}
                plateLabel={
                  isZh ? 'SPEC.02-C · 科研实验' : 'SPEC.02-C · LABORATORY'
                }
              />
            </div>
          </div>

          {/* Precision Tabular Technical Index */}
          {dispatches.length > 0 && (
            <div className="divide-y divide-[var(--ws-plate-border)]">
              {dispatches.map((sig, idx) => (
                <article
                  key={sig.signal_id}
                  className="group py-3.5 first:pt-0 last:pb-0 grid grid-cols-[34px_minmax(0,1fr)_auto] gap-4 items-baseline"
                >
                  <span className="font-mono-tabular text-[12px] font-semibold text-[#cbb4ff]/75">
                    {String(idx + 1).padStart(2, '0')}
                  </span>

                  <div className="min-w-0 space-y-1">
                    <h4 className="font-display text-[16.5px] font-semibold leading-snug text-[var(--ws-plate-ink)]">
                      <button
                        type="button"
                        onClick={() => onOpenSignal(sig.signal_id)}
                        className="text-left ws-headline-link group-hover:text-[#cbb4ff] cursor-pointer"
                      >
                        {sig.headline}
                      </button>
                    </h4>
                    <div className="font-mono-tabular text-[11px] text-[var(--ws-plate-muted)]">
                      {sig.topic} · {t.metaLine.origins(sig.independentOriginCount)}{' '}
                      · {t.confidence[sig.confidence.overall]}
                    </div>
                  </div>

                  {/* Calibrated 5-Segment Importance Register */}
                  <div
                    className="hidden sm:flex items-center gap-1 shrink-0"
                    aria-label={`${sig.importance}/5`}
                  >
                    {[1, 2, 3, 4, 5].map((step) => (
                      <span
                        key={step}
                        aria-hidden="true"
                        className={`h-2 w-2 rounded-[1px] ${
                          step <= sig.importance
                            ? 'bg-[#cbb4ff]'
                            : 'bg-[var(--ws-plate-border)]'
                        }`}
                      />
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

// =============================================================================
// DESK III — ECONOMIC OUTLOOK: INSTITUTIONAL & ECONOMIC HUMANISM
// FT/Economist warm parchment folio, full-width spanning macro lead, grounded
// Edition Indicator Strip, institutional architecture spine, and a bottom
// Real-Economy diptych linking macro policy to industry, energy, and trade.
// =============================================================================

export const EconomicHumanismDesk: React.FC<BaseDeskProps> = ({
  profile,
  leadSignal,
  dispatches,
  photos,
  lang,
  getSignalExcerpt,
  onOpenSignal,
  onExploreDomain,
}) => {
  const t = getUiStrings(lang);
  const isZh = lang === 'zh-CN';

  const econSignals = [leadSignal, ...dispatches].filter(
    (s): s is ParsedSignal => s !== null
  );
  const totalClaims = econSignals.reduce((sum, s) => sum + s.claims.length, 0);
  const avgOrigins =
    econSignals.length > 0
      ? (
          econSignals.reduce((sum, s) => sum + s.independentOriginCount, 0) /
          econSignals.length
        ).toFixed(1)
      : '0.0';

  return (
    <section
      id="desk-economic-outlook"
      aria-label={t.domains.economy}
      data-testid="desk-economic-outlook"
      data-desk-personality="institutional-economic-humanism"
      className="ws-desk-economy scroll-mt-20 p-6 sm:p-8 lg:p-10 space-y-7"
    >
      {/* Institutional Financial Folio Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-[2px] border-b-[var(--ws-ink)] pb-4">
        <div className="flex items-end gap-4">
          <span
            aria-hidden="true"
            className="ws-editorial-numeral text-[46px] sm:text-[56px] text-[var(--ws-economy)]/48 select-none"
          >
            03
          </span>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <DomainEditorialEmblem domain="economy" className="h-4 w-4" />
              <span
                className="ws-kicker"
                style={{ color: 'var(--ws-economy)' }}
              >
                {isZh
                  ? '制度与经济人文 · 宏观经济与产业专刊'
                  : 'Institutional & Economic Humanism · Markets & Industry Folio'}
              </span>
            </div>
            <h3 className="font-display text-[28px] sm:text-[34px] font-semibold tracking-[-0.022em] text-[var(--ws-ink)] leading-none">
              {t.domains.economy}
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onExploreDomain('economy')}
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold hover:underline underline-offset-4 cursor-pointer"
          style={{ color: 'var(--ws-economy)' }}
        >
          <span>
            {t.briefing.exploreDomain} ({profile.total})
          </span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Grounded Edition Numerical Indicator Bar (FT Data Strip — Strictly Real Edition Counts) */}
      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-[var(--ws-border-strong)] pb-5">
        <div className="space-y-0.5">
          <dt className="ws-kicker text-[10px] text-[var(--ws-ink-muted)]">
            {isZh ? '本期经济信号' : 'Economic Signals'}
          </dt>
          <dd className="ws-editorial-numeral font-mono-tabular text-[28px] sm:text-[32px] text-[var(--ws-ink)]">
            {profile.total}
            <span className="ml-1.5 text-[12px] font-sans font-medium text-[var(--ws-ink-muted)]">
              ({profile.sharePct}%)
            </span>
          </dd>
        </div>

        <div className="sm:border-l sm:border-[var(--ws-border-strong)] sm:pl-4 space-y-0.5">
          <dt className="ws-kicker text-[10px] text-[var(--ws-ink-muted)]">
            {isZh ? '最高权重 (5/5)' : 'Critical Signals (5/5)'}
          </dt>
          <dd className="ws-editorial-numeral font-mono-tabular text-[28px] sm:text-[32px] text-[var(--ws-economy)]">
            {profile.imp5Count}
          </dd>
        </div>

        <div className="sm:border-l sm:border-[var(--ws-border-strong)] sm:pl-4 space-y-0.5">
          <dt className="ws-kicker text-[10px] text-[var(--ws-ink-muted)]">
            {isZh ? '均独立来源数' : 'Avg. Origins / Lead'}
          </dt>
          <dd className="ws-editorial-numeral font-mono-tabular text-[28px] sm:text-[32px] text-[var(--ws-ink)]">
            {avgOrigins}
          </dd>
        </div>

        <div className="sm:border-l sm:border-[var(--ws-border-strong)] sm:pl-4 space-y-0.5">
          <dt className="ws-kicker text-[10px] text-[var(--ws-ink-muted)]">
            {isZh ? '重点档案核验声明' : 'Lead Claims Logged'}
          </dt>
          <dd className="ws-editorial-numeral font-mono-tabular text-[28px] sm:text-[32px] text-[var(--ws-ink)]">
            {totalClaims}
          </dd>
        </div>
      </dl>

      {/* Full-Width Spanning FT-Style Macro Lead Headline */}
      {leadSignal && (
        <article className="border-b border-[var(--ws-border-strong)] pb-6 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 ws-meta text-[12px]">
            <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--ws-economy)]">
              <Landmark className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{leadSignal.topic}</span>
            </span>
            <span className="font-mono-tabular font-semibold text-[var(--ws-ink-muted)]">
              {t.metaLine.importance(leadSignal.importance)} ·{' '}
              {t.confidence[leadSignal.confidence.overall]}
            </span>
          </div>
          <h4 className="ws-headline-feature text-[var(--ws-ink)] max-w-[38ch]">
            <button
              type="button"
              onClick={() => onOpenSignal(leadSignal.signal_id)}
              className="text-left ws-headline-link hover:text-[var(--ws-economy)] cursor-pointer"
            >
              {leadSignal.headline}
            </button>
          </h4>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <p className="text-[14.5px] leading-[1.76] text-[var(--ws-ink-secondary)] max-w-[70ch]">
              {getSignalExcerpt(leadSignal, 225)}
            </p>
            <button
              type="button"
              onClick={() => onOpenSignal(leadSignal.signal_id)}
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--ws-ink)] hover:text-[var(--ws-economy)] transition-colors cursor-pointer shrink-0"
            >
              <span>{t.briefing.readDossier}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </article>
      )}

      {/* Asymmetric 8:4 Institutional Markets Ledger + Portrait Financial Institution Plate */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-9 items-start">
        <div className="lg:col-span-8 order-2 lg:order-1 space-y-6">
          {dispatches.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
              {dispatches.map((sig, idx) => (
                <article
                  key={sig.signal_id}
                  className="ws-financial-ledger-row group pb-4 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2 ws-meta text-[11.5px] text-[var(--ws-ink-muted)]">
                    <span className="inline-flex items-center gap-2 truncate">
                      <span className="font-mono-tabular font-semibold text-[var(--ws-economy)]">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="truncate">{sig.topic}</span>
                    </span>
                    <span className="font-mono-tabular font-semibold text-[var(--ws-economy)] shrink-0">
                      {sig.importance}/5
                    </span>
                  </div>
                  <h4 className="font-display text-[17px] font-semibold leading-snug text-[var(--ws-ink)]">
                    <button
                      type="button"
                      onClick={() => onOpenSignal(sig.signal_id)}
                      className="text-left ws-headline-link group-hover:text-[var(--ws-economy)] cursor-pointer"
                    >
                      {sig.headline}
                    </button>
                  </h4>
                  <p className="text-[13px] leading-[1.64] text-[var(--ws-ink-secondary)] line-clamp-2">
                    {getSignalExcerpt(sig, 118)}
                  </p>
                  <div className="ws-meta text-[11.5px] text-[var(--ws-ink-muted)]">
                    {t.metaLine.origins(sig.independentOriginCount)} ·{' '}
                    {t.confidence[sig.confidence.overall]}
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Real-Economy & Industry Visual Strip (Connecting Macro Policy to Real-World Production) */}
          <div className="border-t border-[var(--ws-border-strong)] pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="group">
              <InterfacePhotoPlate
                photo={photos.secondary}
                lang={lang}
                aspect="16/10"
                frameStyle="institutional"
                compact
                showContextDisclosure={false}
                plateLabel={
                  isZh ? '实体经济 · 产业与能源' : 'FOLIO III · REAL ECONOMY'
                }
              />
            </div>
            <div className="group">
              <InterfacePhotoPlate
                photo={photos.tertiary}
                lang={lang}
                aspect="16/10"
                frameStyle="institutional"
                compact
                showContextDisclosure={false}
                plateLabel={
                  isZh ? '大宗与供应链 · 语境' : 'FOLIO III · SUPPLY & RESOURCES'
                }
              />
            </div>
          </div>
        </div>

        {/* Right 4 cols: Portrait Institutional Financial Architecture Spine */}
        <div className="lg:col-span-4 lg:border-l lg:border-[var(--ws-border-strong)] lg:pl-8 group order-1 lg:order-2">
          <InterfacePhotoPlate
            photo={photos.primary}
            lang={lang}
            aspect="3/4"
            frameStyle="institutional"
            compact
            plateLabel={
              isZh ? '金融制度 · 建筑语境' : 'FOLIO III · INSTITUTIONAL'
            }
          />
        </div>
      </div>
    </section>
  );
};
