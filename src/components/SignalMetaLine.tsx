import React from 'react';
import type { ParsedSignal } from '../types/edition';
import {
  formatDomainLabel,
  getConfidenceTextClass,
  getDomainTextClass,
} from '../lib/filtering/filterSignals';

interface SignalMetaLineProps {
  signal: ParsedSignal;
}

/**
 * Renders unboxed typographic metadata with subtle middot separators (Zero-Pill discipline).
 * Separates Importance (1–5) from Confidence (high/medium/low/unverified) and Event Date from Publication Date.
 */
export const SignalMetaLine: React.FC<SignalMetaLineProps> = ({ signal }) => {
  return (
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#57534E] dark:text-[#A8A29E] tabular-nums">
      <span className={`font-semibold uppercase tracking-wider ${getDomainTextClass(signal.domain)}`}>
        {formatDomainLabel(signal.domain)}
      </span>
      <span aria-hidden="true">·</span>
      <span className="font-mono-tabular text-[#44403C] dark:text-[#D6D3D1]">
        {signal.signal_id}
      </span>
      <span aria-hidden="true">·</span>
      <span>Topic: {signal.topic}</span>
      <span aria-hidden="true">·</span>
      <span className="capitalize">Status: {signal.status.replace(/_/g, ' ')}</span>
      <span aria-hidden="true">·</span>
      <span>Importance {signal.importance}/5</span>
      <span aria-hidden="true">·</span>
      <span className={`font-semibold capitalize ${getConfidenceTextClass(signal.confidence.overall)}`}>
        Confidence: {signal.confidence.overall}
      </span>
      <span aria-hidden="true">·</span>
      <span>
        {signal.independentOriginCount} independent{' '}
        {signal.independentOriginCount === 1 ? 'origin' : 'origins'}
      </span>
      {signal.event.start_date && (
        <>
          <span aria-hidden="true">·</span>
          <span>
            Event date: {signal.event.start_date}
            {signal.event.end_date && signal.event.end_date !== signal.event.start_date
              ? ` to ${signal.event.end_date}`
              : ''}
          </span>
        </>
      )}
    </div>
  );
};
