import React, { useMemo, useState } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import type {
  ParsedEdition,
  ParsedSignal,
  SignalDomain,
  SignalRelationshipType,
  UiLanguage,
} from '../../types/edition';
import { getUiStrings } from '../../lib/i18n/uiStrings';
import {
  confidenceColorClass,
  domainAccentTextClass,
} from '../../lib/filtering/filterSignals';
import { buildRelationshipExplorerModel } from '../../lib/intelligence/visual-metrics/editorialVisualHelpers';
import type { SignalRelationshipEdge } from '../../lib/intelligence/relationships/buildRelationshipGraph';

interface RelationshipExplorerMatrixProps {
  edition: ParsedEdition;
  signalById: Map<string, ParsedSignal>;
  lang: UiLanguage;
  onOpenSignal: (signalId: string) => void;
}

const RELATIONSHIP_TYPE_ORDER: readonly SignalRelationshipType[] = [
  'causal_link',
  'market_transmission',
  'policy_response',
  'technological_dependency',
  'same_event',
  'potential_link',
  'contextual',
];

const COLUMNS: readonly {
  domain: SignalDomain;
  x: number;
  color: string;
}[] = [
  { domain: 'world', x: 24, color: 'var(--ws-world)' },
  { domain: 'ai', x: 332, color: 'var(--ws-ai)' },
  { domain: 'economy', x: 640, color: 'var(--ws-economy)' },
];

const NODE_WIDTH = 216;
const NODE_HEIGHT = 44;
const NODE_GAP = 14;
const TOP_OFFSET = 46;
const SVG_WIDTH = 880;
const MAX_LEDGER_INITIAL = 12;

function edgeStrokeColor(edge: SignalRelationshipEdge): string {
  if (!edge.isExplicitlyTyped) return 'var(--ws-ink-faint)';
  switch (edge.relationshipType) {
    case 'market_transmission':
      return 'var(--ws-economy)';
    case 'technological_dependency':
      return 'var(--ws-ai)';
    case 'policy_response':
    case 'causal_link':
      return 'var(--ws-world)';
    case 'potential_link':
      return 'var(--ws-warn)';
    case 'same_event':
      return 'var(--ws-ink)';
    default:
      return 'var(--ws-ink-muted)';
  }
}

function edgeBadgeTextClass(edge: SignalRelationshipEdge): string {
  if (!edge.isExplicitlyTyped) return 'text-[var(--ws-ink-muted)]';
  switch (edge.relationshipType) {
    case 'market_transmission':
      return 'text-[var(--ws-economy)]';
    case 'technological_dependency':
      return 'text-[var(--ws-ai)]';
    case 'policy_response':
    case 'causal_link':
      return 'text-[var(--ws-world)]';
    case 'potential_link':
      return 'text-[var(--ws-warn)]';
    case 'same_event':
      return 'text-[var(--ws-ink)]';
    default:
      return 'text-[var(--ws-ink-secondary)]';
  }
}

function truncateSvgLabel(text: string, maxUnits: number): string {
  let units = 0;
  let cut = 0;
  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    units += code > 0x2e80 ? 1.75 : 1;
    if (units > maxUnits) {
      return `${text.slice(0, Math.max(1, cut)).trimEnd()}…`;
    }
    cut = i + 1;
  }
  return text;
}

function edgeKey(edge: SignalRelationshipEdge): string {
  return `${edge.sourceSignalId}->${edge.targetSignalId}:${edge.relationshipType}:${edge.isExplicitlyTyped ? 'exp' : 'leg'}`;
}

export const RelationshipExplorerMatrix: React.FC<
  RelationshipExplorerMatrixProps
> = ({ edition, signalById, lang, onOpenSignal }) => {
  const t = getUiStrings(lang);

  const model = useMemo(
    () => buildRelationshipExplorerModel(edition),
    [edition]
  );

  const [selectedType, setSelectedType] = useState<
    SignalRelationshipType | 'all'
  >('all');
  const [includeLegacy, setIncludeLegacy] = useState(
    model.explicitEdges.length === 0 && model.legacyContextualEdges.length > 0
  );
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [showAllLedger, setShowAllLedger] = useState(false);

  const presentExplicitTypes = useMemo(
    () =>
      RELATIONSHIP_TYPE_ORDER.filter(
        (type) => (model.explicitTypeCounts[type] ?? 0) > 0
      ),
    [model.explicitTypeCounts]
  );

  const visibleEdges = useMemo(() => {
    const explicit =
      selectedType === 'all'
        ? model.explicitEdges
        : model.explicitEdges.filter(
            (e) => e.relationshipType === selectedType
          );
    if (!includeLegacy) return explicit;
    if (selectedType === 'all' || selectedType === 'contextual') {
      return [...explicit, ...model.legacyContextualEdges];
    }
    return explicit;
  }, [
    includeLegacy,
    model.explicitEdges,
    model.legacyContextualEdges,
    selectedType,
  ]);

  const activeEdge = useMemo(() => {
    if (selectedEdgeId) {
      const match = visibleEdges.find((e) => edgeKey(e) === selectedEdgeId);
      if (match) return match;
    }
    return visibleEdges[0] ?? null;
  }, [selectedEdgeId, visibleEdges]);

  // Project only nodes participating in the currently visible edges (capped to explicit or first 24 edges for diagram readability)
  const diagramEdges = useMemo(() => visibleEdges.slice(0, 28), [visibleEdges]);

  const layout = useMemo(() => {
    const participatingIds = new Set<string>();
    for (const edge of diagramEdges) {
      participatingIds.add(edge.sourceSignalId);
      participatingIds.add(edge.targetSignalId);
    }

    const byDomain: Record<SignalDomain, ParsedSignal[]> = {
      world: [],
      ai: [],
      economy: [],
    };
    for (const sig of edition.signals) {
      if (participatingIds.has(sig.signal_id)) {
        byDomain[sig.domain].push(sig);
      }
    }

    const positions = new Map<
      string,
      {
        signal: ParsedSignal;
        x: number;
        y: number;
        colIndex: number;
      }
    >();

    let maxColNodes = 0;
    COLUMNS.forEach((col, colIndex) => {
      const list = byDomain[col.domain];
      if (list.length > maxColNodes) maxColNodes = list.length;
      list.forEach((sig, rowIdx) => {
        positions.set(sig.signal_id, {
          signal: sig,
          x: col.x,
          y: TOP_OFFSET + rowIdx * (NODE_HEIGHT + NODE_GAP),
          colIndex,
        });
      });
    });

    const svgHeight = Math.max(
      210,
      TOP_OFFSET + maxColNodes * (NODE_HEIGHT + NODE_GAP) + 22
    );

    return { positions, byDomain, svgHeight };
  }, [diagramEdges, edition.signals]);

  const totalAllEdges =
    model.explicitEdges.length + model.legacyContextualEdges.length;

  if (totalAllEdges === 0) {
    return null;
  }

  const displayedLedgerEdges = showAllLedger
    ? visibleEdges
    : visibleEdges.slice(0, MAX_LEDGER_INITIAL);

  return (
    <section className="space-y-5">
      {/* Section Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h2 className="font-display text-[1.4rem] sm:text-[1.65rem] font-semibold tracking-[-0.018em] text-[var(--ws-ink)]">
            {t.synthesis.relationshipMapTitle}
          </h2>
          <p className="max-w-3xl text-[12.5px] leading-relaxed text-[var(--ws-ink-muted)]">
            {t.synthesis.relationshipMapSubtitle}
          </p>
        </div>
        <span className="font-mono-tabular text-[11.5px] text-[var(--ws-ink-muted)] shrink-0">
          {t.synthesis.relationshipEdgeCount(visibleEdges.length, totalAllEdges)}
        </span>
      </div>

      {/* Type Filter Strip & Legacy Contextual Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-y border-[var(--ws-border)] py-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {model.explicitEdges.length > 0 ? (
            <>
              <button
                type="button"
                onClick={() => setSelectedType('all')}
                className={`rounded-[var(--ws-radius-sm)] border px-2.5 py-1 font-mono-tabular text-[11px] font-medium transition-colors cursor-pointer ${
                  selectedType === 'all'
                    ? 'border-[var(--ws-rule-editorial)] bg-[var(--ws-rule-editorial)] text-[var(--ws-surface)]'
                    : 'border-[var(--ws-border)] bg-[var(--ws-surface)] text-[var(--ws-ink-secondary)] hover:border-[var(--ws-border-strong)]'
                }`}
              >
                {t.synthesis.relationshipFilterAllExplicit} ({model.explicitEdges.length})
              </button>
              {presentExplicitTypes.map((type) => {
                const isSelected = selectedType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedType(type)}
                    className={`rounded-[var(--ws-radius-sm)] border px-2.5 py-1 font-mono-tabular text-[11px] font-medium transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-[var(--ws-rule-editorial)] bg-[var(--ws-rule-editorial)] text-[var(--ws-surface)]'
                        : 'border-[var(--ws-border)] bg-[var(--ws-surface)] text-[var(--ws-ink-secondary)] hover:border-[var(--ws-border-strong)]'
                    }`}
                  >
                    {t.signalRelationshipType[type]} ({model.explicitTypeCounts[type]})
                  </button>
                );
              })}
            </>
          ) : (
            <span className="text-xs text-[var(--ws-ink-muted)]">
              {t.synthesis.relationshipNoExplicit}
            </span>
          )}
        </div>

        {model.legacyContextualEdges.length > 0 && (
          <label className="inline-flex items-center gap-2 font-mono-tabular text-[11.5px] text-[var(--ws-ink-secondary)] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeLegacy}
              onChange={(e) => setIncludeLegacy(e.target.checked)}
              className="h-3.5 w-3.5 accent-[var(--ws-world)] cursor-pointer"
            />
            <span>
              {t.synthesis.relationshipToggleLegacy(
                model.legacyContextualEdges.length
              )}
            </span>
          </label>
        )}
      </div>

      {/* Main Workspace: 3-Column Spatial Map (Desktop/Tablet) + Selected Link Inspector */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 items-start">
        {/* Desktop/Tablet Architectural Cross-Domain SVG Diagram */}
        <div className="hidden md:block xl:col-span-8 rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-surface)] p-4 overflow-hidden">
          {diagramEdges.length === 0 ? (
            <div className="py-12 text-center text-xs text-[var(--ws-ink-muted)]">
              {t.synthesis.relationshipNoExplicit}
            </div>
          ) : (
            <svg
              viewBox={`0 0 ${SVG_WIDTH} ${layout.svgHeight}`}
              className="w-full h-auto block"
              role="img"
              aria-label={t.synthesis.relationshipMapTitle}
            >
              {/* Column Headers & Guide Rules */}
              {COLUMNS.map((col) => (
                <g key={col.domain}>
                  <line
                    x1={col.x}
                    y1={28}
                    x2={col.x + NODE_WIDTH}
                    y2={28}
                    stroke={col.color}
                    strokeWidth="2"
                    opacity="0.8"
                  />
                  <text
                    x={col.x}
                    y={20}
                    fill={col.color}
                    fontSize="11"
                    fontWeight="600"
                    className="font-mono-tabular uppercase"
                  >
                    {t.domains[col.domain]} ({layout.byDomain[col.domain].length})
                  </text>
                </g>
              ))}

              {/* Directed Relationship Paths */}
              {diagramEdges.map((edge, idx) => {
                const src = layout.positions.get(edge.sourceSignalId);
                const tgt = layout.positions.get(edge.targetSignalId);
                if (!src || !tgt) return null;

                const key = edgeKey(edge);
                const isSelected = activeEdge ? edgeKey(activeEdge) === key : false;
                const stroke = edgeStrokeColor(edge);
                const isDashed =
                  !edge.isExplicitlyTyped ||
                  edge.relationshipType === 'potential_link';

                let pathD = '';
                const y1 = src.y + NODE_HEIGHT / 2;
                const y2 = tgt.y + NODE_HEIGHT / 2;

                if (src.colIndex === tgt.colIndex) {
                  // Same-column loop routed cleanly on the inner/outer rail
                  const onRight = src.colIndex === 2;
                  const anchorX = onRight ? src.x : src.x + NODE_WIDTH;
                  const offset = (onRight ? -1 : 1) * (24 + (idx % 3) * 10);
                  pathD = `M ${anchorX} ${y1} C ${anchorX + offset} ${y1}, ${anchorX + offset} ${y2}, ${anchorX} ${y2}`;
                } else {
                  const goingRight = src.colIndex < tgt.colIndex;
                  const x1 = goingRight ? src.x + NODE_WIDTH : src.x;
                  const x2 = goingRight ? tgt.x : tgt.x + NODE_WIDTH;
                  const span = Math.abs(x2 - x1);
                  const ctrlOffset = Math.min(span * 0.45, 95);
                  const cx1 = goingRight ? x1 + ctrlOffset : x1 - ctrlOffset;
                  const cx2 = goingRight ? x2 - ctrlOffset : x2 + ctrlOffset;
                  pathD = `M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`;
                }

                return (
                  <g
                    key={key}
                    onClick={() => setSelectedEdgeId(key)}
                    className="cursor-pointer"
                  >
                    {/* Wider invisible hit target for easy clicking */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke="transparent"
                      strokeWidth="12"
                    />
                    <path
                      d={pathD}
                      fill="none"
                      stroke={stroke}
                      strokeWidth={isSelected ? 2.4 : 1.25}
                      strokeDasharray={isDashed ? '4 3' : undefined}
                      opacity={
                        activeEdge
                          ? isSelected
                            ? 0.98
                            : 0.28
                          : 0.65
                      }
                    />
                  </g>
                );
              })}

              {/* Signal Nodes */}
              {Array.from(layout.positions.values()).map(({ signal, x, y }) => {
                const isEndpoint =
                  activeEdge?.sourceSignalId === signal.signal_id ||
                  activeEdge?.targetSignalId === signal.signal_id;
                const colColor =
                  COLUMNS.find((c) => c.domain === signal.domain)?.color ??
                  'var(--ws-ink)';

                const shortHeadline = truncateSvgLabel(signal.headline, 24);
                const shortId = truncateSvgLabel(signal.signal_id, 28);

                return (
                  <g
                    key={signal.signal_id}
                    onClick={() => {
                      const firstEdge = visibleEdges.find(
                        (e) =>
                          e.sourceSignalId === signal.signal_id ||
                          e.targetSignalId === signal.signal_id
                      );
                      if (firstEdge) setSelectedEdgeId(edgeKey(firstEdge));
                    }}
                    className="cursor-pointer"
                  >
                    <title>{`${signal.headline} (${signal.signal_id})`}</title>
                    <rect
                      x={x}
                      y={y}
                      width={NODE_WIDTH}
                      height={NODE_HEIGHT}
                      rx="3"
                      fill={
                        isEndpoint
                          ? 'var(--ws-surface-subtle)'
                          : 'var(--ws-canvas)'
                      }
                      stroke={isEndpoint ? colColor : 'var(--ws-border-strong)'}
                      strokeWidth={isEndpoint ? 1.5 : 0.9}
                    />
                    <rect
                      x={x}
                      y={y}
                      width="3"
                      height={NODE_HEIGHT}
                      rx="1"
                      fill={colColor}
                      opacity={isEndpoint ? 1 : 0.65}
                    />
                    <text
                      x={x + 10}
                      y={y + 18}
                      fill="var(--ws-ink)"
                      fontSize="11.5"
                      fontWeight={isEndpoint ? '600' : '500'}
                    >
                      {shortHeadline}
                    </text>
                    <text
                      x={x + 10}
                      y={y + 34}
                      fill="var(--ws-ink-muted)"
                      fontSize="9.5"
                      className="font-mono-tabular"
                    >
                      {shortId}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}
        </div>

        {/* Selected Relationship Evidence Inspector */}
        <aside className="xl:col-span-4 rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-surface)] p-5 space-y-4">
          {activeEdge ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 font-mono-tabular text-[11px]">
                <span
                  className={`font-semibold uppercase tracking-[0.08em] ${edgeBadgeTextClass(
                    activeEdge
                  )}`}
                >
                  {t.signalRelationshipType[activeEdge.relationshipType]}
                </span>
                <span className="text-[var(--ws-ink-muted)]">
                  {activeEdge.isExplicitlyTyped
                    ? t.synthesis.relationshipExplicitBadge
                    : t.synthesis.relationshipLegacyBadge}
                </span>
              </div>

              <div className="space-y-3 border-y border-[var(--ws-border-subtle)] py-3.5">
                {[
                  {
                    label: t.synthesis.relationshipSourceNode,
                    id: activeEdge.sourceSignalId,
                  },
                  {
                    label: t.synthesis.relationshipTargetNode,
                    id: activeEdge.targetSignalId,
                  },
                ].map(({ label, id }) => {
                  const sig = signalById.get(id);
                  return (
                    <div key={`${label}-${id}`} className="space-y-0.5">
                      <div className="font-mono-tabular text-[10px] uppercase tracking-[0.12em] text-[var(--ws-ink-faint)]">
                        {label}
                      </div>
                      {sig ? (
                        <button
                          type="button"
                          onClick={() => onOpenSignal(sig.signal_id)}
                          className="group text-left space-y-0.5 cursor-pointer"
                        >
                          <div className="text-[13.5px] font-semibold leading-snug text-[var(--ws-ink)] group-hover:text-[var(--ws-world)] transition-colors break-words">
                            {sig.headline}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5 font-mono-tabular text-[11px] text-[var(--ws-ink-muted)]">
                            <span
                              className={`font-semibold shrink-0 whitespace-nowrap ${domainAccentTextClass(
                                sig.domain
                              )}`}
                            >
                              {t.domains[sig.domain]}
                            </span>
                            <span className="break-all">· {sig.signal_id}</span>
                            <ArrowUpRight className="h-3 w-3 shrink-0 opacity-65" />
                          </div>
                        </button>
                      ) : (
                        <div className="font-mono-tabular text-xs text-[var(--ws-ink-muted)] break-all">
                          {id}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between font-mono-tabular text-[11px]">
                <span className="text-[var(--ws-ink-muted)]">
                  {t.expanded.confidenceLabel}
                </span>
                <span
                  className={`font-semibold ${confidenceColorClass(
                    activeEdge.confidence
                  )}`}
                >
                  {t.confidence[activeEdge.confidence]}
                </span>
              </div>

              {activeEdge.rationale && (
                <p className="text-[13px] leading-[1.6] text-[var(--ws-ink-secondary)] break-words">
                  {activeEdge.rationale}
                </p>
              )}

              {activeEdge.supportingClaimIds.length > 0 && (
                <div className="space-y-1.5 border-t border-[var(--ws-border-subtle)] pt-3">
                  <div className="font-mono-tabular text-[10.5px] uppercase tracking-[0.1em] text-[var(--ws-ink-muted)]">
                    {t.synthesis.relationshipEvidenceClaims}
                  </div>
                  <div className="flex flex-wrap gap-x-2.5 gap-y-1 font-mono-tabular text-[11px] text-[var(--ws-world)]">
                    {activeEdge.supportingClaimIds.map((cid) => (
                      <span key={cid}>{cid}</span>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-xs leading-relaxed text-[var(--ws-ink-muted)]">
              {t.synthesis.relationshipInspectPrompt}
            </p>
          )}
        </aside>
      </div>

      {/* Responsive Interactive Edge Ledger (Mobile-first & full inspection list) */}
      {visibleEdges.length > 0 && (
        <div className="rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-surface)] overflow-hidden">
          <ul className="divide-y divide-[var(--ws-border-subtle)]">
            {displayedLedgerEdges.map((edge) => {
              const key = edgeKey(edge);
              const isSelected = activeEdge ? edgeKey(activeEdge) === key : false;
              const src = signalById.get(edge.sourceSignalId);
              const tgt = signalById.get(edge.targetSignalId);
              return (
                <li key={key}>
                  <button
                    type="button"
                    onClick={() => setSelectedEdgeId(key)}
                    className={`w-full px-4 py-3 text-left transition-colors cursor-pointer flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between ${
                      isSelected
                        ? 'bg-[var(--ws-surface-subtle)]'
                        : 'hover:bg-[var(--ws-surface-hover)]/55'
                    }`}
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono-tabular text-[11px]">
                        <span
                          className={`font-semibold uppercase tracking-[0.06em] ${edgeBadgeTextClass(
                            edge
                          )}`}
                        >
                          {t.signalRelationshipType[edge.relationshipType]}
                        </span>
                        <span aria-hidden="true" className="text-[var(--ws-ink-faint)]">
                          ·
                        </span>
                        <span
                          className={`font-medium ${confidenceColorClass(
                            edge.confidence
                          )}`}
                        >
                          {t.confidence[edge.confidence]}
                        </span>
                        {!edge.isExplicitlyTyped && (
                          <span className="text-[var(--ws-ink-muted)]">
                            · {t.synthesis.relationshipLegacyBadge}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 text-[13px] text-[var(--ws-ink)] leading-snug">
                        <span className="font-medium break-words">
                          {src ? src.headline : edge.sourceSignalId}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-[var(--ws-ink-faint)] shrink-0" />
                        <span className="font-medium break-words">
                          {tgt ? tgt.headline : edge.targetSignalId}
                        </span>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>

          {visibleEdges.length > MAX_LEDGER_INITIAL && (
            <div className="border-t border-[var(--ws-border-subtle)] px-4 py-2.5 bg-[var(--ws-surface-elevated)]">
              <button
                type="button"
                onClick={() => setShowAllLedger((prev) => !prev)}
                className="font-mono-tabular text-[11.5px] font-medium text-[var(--ws-world)] hover:underline underline-offset-4 cursor-pointer"
              >
                {showAllLedger
                  ? t.expanded.showFewerItems
                  : `${t.synthesis.relationshipEdgeCount(
                      visibleEdges.length,
                      visibleEdges.length
                    )}`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Unresolved Cross-Edition References Disclosure */}
      {model.unresolvedTargets.length > 0 && (
        <p className="font-mono-tabular text-[11px] text-[var(--ws-ink-muted)]">
          {t.synthesis.relationshipUnresolvedNote(
            model.unresolvedTargets.length
          )}
        </p>
      )}
    </section>
  );
};
