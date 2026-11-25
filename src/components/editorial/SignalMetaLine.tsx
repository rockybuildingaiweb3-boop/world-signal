import React from 'react';
import type { ParsedSignal, UiLanguage } from '../../types/edition';
import { getUiStrings } from '../../lib/i18n/uiStrings';
import {
  confidenceColorClass,
  domainAccentTextClass,
} from '../../lib/filtering/filterSignals';

interface SignalMetaLineProps {
  signal: ParsedSignal;
  lang: UiLanguage;
  showClaims?: boolean;
  compact?: boolean;
  hideDomain?: boolean;
}

/**
 * Unboxed, zero-pill typographic metadata line separating editorial Importance (1-5)
 * from verification Confidence, and consuming the single authoritative `independentOriginCount`.
 */
export const SignalMetaLine: React.FC<SignalMetaLineProps> = ({
  signal,
  lang,
  showClaims = false,
  compact = false,
  hideDomain = false,
}) => {
  const t = getUiStrings(lang);

  return (
    <div
      className={`flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono-tabular leading-snug ${
        compact ? 'text-[11px]' : 'text-[12px]'
      } text-[var(--ws-ink-muted)]`}
    >
      {!hideDomain && (
        <>
          <span
            className={`font-semibold tracking-tight ${domainAccentTextClass(signal.domain)}`}
          >
            {t.domains[signal.domain]}
          </span>
          <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">
            ·
          </span>
        </>
      )}
      <span className="font-semibold text-[var(--ws-ink)]">
        {t.metaLine.importance(signal.importance)}
      </span>
      <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">
        ·
      </span>
      <span className={`font-medium ${confidenceColorClass(signal.confidence.overall)}`}>
        {t.metaLine.confidence(t.confidence[signal.confidence.overall])}
      </span>
      <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">
        ·
      </span>
      <span>{t.signalStatus[signal.status]}</span>
      <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">
        ·
      </span>
      <span>{t.metaLine.origins(signal.independentOriginCount)}</span>
      {showClaims && (
        <>
          <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">
            ·
          </span>
          <span>{t.metaLine.claims(signal.claims.length)}</span>
        </>
      )}
    </div>
  );
};
