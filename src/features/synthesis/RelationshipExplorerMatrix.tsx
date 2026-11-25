import React, { useMemo, useState } from 'react';
import { ArrowRight, ArrowUpRight, X } from 'lucide-react';
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
  { domain: 'world', x: 22, color: 'var(--ws-world)' },
  { domain: 'ai', x: 332, color: 'var(--ws-ai)' },
  { domain: 'economy', x: 642, color: 'var(--ws-economy)' },
];

const NODE_WIDTH = 216;
const NODE_HEIGHT = 48;
const NODE_GAP = 14;
const TOP_OFFSET = 50;
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
  const [focusedSignalId, setFocusedSignalId] = useState<string>('all');
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [showAllLedger, setShowAllLedger] = useState(false);

  const presentExplicitTypes = useMemo(
    () =>
      RELATIONSHIP_TYPE_ORDER.filter(
        (type) => (model.explicitTypeCounts[type] ?? 0) > 0
      ),
    [model.explicitTypeCounts]
  );

  // Edges matching type + legacy selection (before signal focus)
  const typeFilteredEdges = useMemo(() => {
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

  // Signals participating in current edge pool (ordered by connection count descending for hub focus selector)
  const connectedHubSignals = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of typeFilteredEdges) {
      counts.set(e.sourceSignalId, (counts.get(e.sourceSignalId) ?? 0) + 1);
      counts.set(e.targetSignalId, (counts.get(e.targetSignalId) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([id, degree]) => ({ id, degree, signal: signalById.get(id) }))
      .filter((item): item is { id: string; degree: number; signal: ParsedSignal } =>
        Boolean(item.signal)
      )
      .sort((a, b) => b.degree - a.degree || b.signal.importance - a.signal.importance);
  }, [signalById, typeFilteredEdges]);

  const visibleEdges = useMemo(() => {
    if (focusedSignalId === 'all') return typeFilteredEdges;
    return typeFilteredEdges.filter(
      (e) =>
        e.sourceSignalId === focusedSignalId ||
        e.targetSignalId === focusedSignalId
    );
  }, [focusedSignalId, typeFilteredEdges]);

  const activeEdge = useMemo(() => {
    if (selectedEdgeId) {
      const match = visibleEdges.find((e) => edgeKey(e) === selectedEdgeId);
      if (match) return match;
    }
    return visibleEdges[0] ?? null;
  }, [selectedEdgeId, visibleEdges]);

  // Cap diagram projection to keep visual lines legible; full list always remains accessible in ledger
  const diagramEdges = useMemo(() => visibleEdges.slice(0, 26), [visibleEdges]);

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
      220,
      TOP_OFFSET + maxColNodes * (NODE_HEIGHT + NODE_GAP) + 24
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

  const handleActivateNode = (signalId: string) => {
    const firstEdge = visibleEdges.find(
      (e) => e.sourceSignalId === signalId || e.targetSignalId === signalId
    );
    if (firstEdge) {
      setSelectedEdgeId(edgeKey(firstEdge));
    }
  };

  return (
    <section className="space-y-5">
      {/* Section Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h2 className="font-display text-[1.45rem] sm:text-[1.75rem] font-semibold tracking-[-0.018em] text-[var(--ws-ink)]">
            {t.synthesis.relationshipMapTitle}
          </h2>
          <p className="max-w-3xl text-[13px] leading-relaxed text-[var(--ws-ink-muted)]">
            {t.synthesis.relationshipMapSubtitle}
          </p>
        </div>
        <span className="font-mono-tabular text-[11.5px] font-medium text-[var(--ws-ink-muted)] shrink-0">
          {t.synthesis.relationshipEdgeCount(visibleEdges.length, totalAllEdges)}
        </span>
      </div>

      {/* Controls Strip: Type Filters + Signal Focus Selector + Legacy Toggle */}
      <div className="space-y-3 border-y border-[var(--ws-border)] py-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
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

        {/* Signal Focus Selector & Keyboard Navigation Hint */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-[var(--ws-border-subtle)]">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <label
              htmlFor="relationship-focus-select"
              className="ws-kicker text-[var(--ws-ink-faint)] shrink-0"
            >
              {t.synthesis.relationshipFocusLabel}
            </label>
            <select
              id="relationship-focus-select"
              value={focusedSignalId}
              onChange={(e) => {
                setFocusedSignalId(e.target.value);
                setSelectedEdgeId(null);
              }}
              className="max-w-[300px] sm:max-w-[380px] rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-surface)] px-2.5 py-1 text-xs text-[var(--ws-ink)]"
            >
              <option value="all">
                {t.synthesis.relationshipFocusAll} ({connectedHubSignals.length})
              </option>
              {connectedHubSignals.map(({ id, degree, signal }) => (
                <option key={id} value={id}>
                  [{degree}] {signal.headline}
                </option>
              ))}
            </select>
            {focusedSignalId !== 'all' && (
              <button
                type="button"
                onClick={() => setFocusedSignalId('all')}
                className="inline-flex items-center gap-1 font-mono-tabular text-[11px] font-medium text-[var(--ws-world)] hover:underline underline-offset-4 cursor-pointer"
              >
                <X className="h-3 w-3" />
                <span>{t.synthesis.relationshipClearFocus}</span>
              </button>
            )}
          </div>
          <span className="hidden md:inline font-mono-tabular text-[11px] text-[var(--ws-ink-faint)]">
            {t.synthesis.relationshipKeyboardHint}
          </span>
        </div>
      </div>

      {/* Main Workspace: Keyboard-Accessible Cross-Domain Atlas (Desktop/Tablet) + Live Inspector */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 items-start">
        <div className="hidden md:block xl:col-span-8 rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-surface)] p-4 sm:p-5 overflow-hidden shadow-[var(--ws-shadow-sm)]">
          {diagramEdges.length === 0 ? (
            <div className="py-12 text-center text-xs text-[var(--ws-ink-muted)]">
              {t.synthesis.relationshipNoExplicit}
            </div>
          ) : (
            <svg
              viewBox={`0 0 ${SVG_WIDTH} ${layout.svgHeight}`}
              className="w-full h-auto block"
              role="group"
              aria-label={t.synthesis.relationshipMapTitle}
            >
              <defs>
                <marker
                  id="ws-rel-arrow-active"
                  viewBox="0 0 8 8"
                  refX="6.5"
                  refY="4"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 7 4 L 0 7 z" fill="var(--ws-editorial-accent)" />
                </marker>
              </defs>

              {/* Column Headers & Domain Axis Guides */}
              {COLUMNS.map((col) => (
                <g key={col.domain}>
                  <line
                    x1={col.x}
                    y1={30}
                    x2={col.x + NODE_WIDTH}
                    y2={30}
                    stroke={col.color}
                    strokeWidth="2.5"
                    opacity="0.88"
                  />
                  <text
                    x={col.x}
                    y={21}
                    fill={col.color}
                    fontSize="11"
                    fontWeight="600"
                    className="font-mono-tabular uppercase"
                  >
                    {t.domains[col.domain]} ({layout.byDomain[col.domain].length})
                  </text>
                </g>
              ))}

              {/* Keyboard-Accessible Directed Relationship Arcs */}
              {diagramEdges.map((edge, idx) => {
                const src = layout.positions.get(edge.sourceSignalId);
                const tgt = layout.positions.get(edge.targetSignalId);
                if (!src || !tgt) return null;

                const key = edgeKey(edge);
                const isSelected = activeEdge ? edgeKey(activeEdge) === key : false;
                const stroke = isSelected
                  ? 'var(--ws-editorial-accent)'
                  : edgeStrokeColor(edge);
                const isDashed =
                  !edge.isExplicitlyTyped ||
                  edge.relationshipType === 'potential_link';

                let pathD = '';
                const y1 = src.y + NODE_HEIGHT / 2;
                const y2 = tgt.y + NODE_HEIGHT / 2;

                if (src.colIndex === tgt.colIndex) {
                  const onRight = src.colIndex === 2;
                  const anchorX = onRight ? src.x : src.x + NODE_WIDTH;
                  const offset = (onRight ? -1 : 1) * (24 + (idx % 3) * 11);
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

                const edgeAriaLabel = `${t.signalRelationshipType[edge.relationshipType]}: ${src.signal.headline} → ${tgt.signal.headline}`;

                return (
                  <g
                    key={key}
                    role="button"
                    tabIndex={0}
                    aria-label={edgeAriaLabel}
                    aria-pressed={isSelected}
                    onClick={() => setSelectedEdgeId(key)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedEdgeId(key);
                      }
                    }}
                    className="cursor-pointer focus:outline-none"
                  >
                    <title>{edgeAriaLabel}</title>
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
                      strokeWidth={isSelected ? 2.4 : 1.2}
                      strokeDasharray={isDashed ? '4 3' : undefined}
                      markerEnd={
                        isSelected && edge.isExplicitlyTyped
                          ? 'url(#ws-rel-arrow-active)'
                          : undefined
                      }
                      opacity={
                        activeEdge
                          ? isSelected
                            ? 1
                            : 0.22
                          : 0.65
                      }
                    />
                  </g>
                );
              })}

              {/* Keyboard-Accessible Signal Nodes (Clean Top Hairline Accent, No Left-Bar Cliché) */}
              {Array.from(layout.positions.values()).map(({ signal, x, y }) => {
                const isEndpoint =
                  activeEdge?.sourceSignalId === signal.signal_id ||
                  activeEdge?.targetSignalId === signal.signal_id;
                const isFocused = focusedSignalId === signal.signal_id;
                const colColor =
                  COLUMNS.find((c) => c.domain === signal.domain)?.color ??
                  'var(--ws-ink)';

                const shortHeadline = truncateSvgLabel(signal.headline, 22);
                const shortId = truncateSvgLabel(signal.signal_id, 24);

                return (
                  <g
                    key={signal.signal_id}
                    role="button"
                    tabIndex={0}
                    aria-label={`${signal.headline} (${t.domains[signal.domain]}, ${signal.importance}/5)`}
                    aria-pressed={isEndpoint}
                    onClick={() => handleActivateNode(signal.signal_id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleActivateNode(signal.signal_id);
                      }
                    }}
                    className="cursor-pointer focus:outline-none"
                  >
                    <title>{`${signal.headline} (${signal.signal_id})`}</title>
                    <rect
                      x={x}
                      y={y}
                      width={NODE_WIDTH}
                      height={NODE_HEIGHT}
                      rx="3"
                      fill={
                        isEndpoint || isFocused
                          ? 'var(--ws-surface-subtle)'
                          : 'var(--ws-canvas)'
                      }
                      stroke={
                        isEndpoint
                          ? 'var(--ws-editorial-accent)'
                          : isFocused
                          ? colColor
                          : 'var(--ws-border-strong)'
                      }
                      strokeWidth={isEndpoint || isFocused ? 1.5 : 0.9}
                    />
                    <rect
                      x={x + 0.5}
                      y={y + 0.5}
                      width={NODE_WIDTH - 1}
                      height="2.5"
                      rx="1"
                      fill={isEndpoint ? 'var(--ws-editorial-accent)' : colColor}
                      opacity={isEndpoint ? 1 : 0.72}
                    />
                    <text
                      x={x + 10}
                      y={y + 21}
                      fill="var(--ws-ink)"
                      fontSize="11.5"
                      fontWeight={isEndpoint ? '600' : '500'}
                    >
                      {shortHeadline}
                    </text>
                    <text
                      x={x + 10}
                      y={y + 38}
                      fill="var(--ws-ink-muted)"
                      fontSize="9.5"
                      className="font-mono-tabular"
                    >
                      {shortId}
                    </text>
                    <text
                      x={x + NODE_WIDTH - 9}
                      y={y + 38}
                      textAnchor="end"
                      fill={colColor}
                      fontSize="9.5"
                      fontWeight="600"
                      className="font-mono-tabular"
                    >
                      {signal.importance}/5
                    </text>
                  </g>
                );
              })}
            </svg>
          )}
        </div>

        {/* Synchronized Evidence & Mechanism Inspector */}
        <aside className="xl:col-span-4 ws-editorial-sheet rounded-b-[var(--ws-radius-sm)] border-x border-[var(--ws-border)] p-5 space-y-4 shadow-[var(--ws-shadow-sm)]">
          {activeEdge ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 font-mono-tabular text-[11px]">
                <span
                  className={`ws-kicker ${edgeBadgeTextClass(activeEdge)}`}
                >
                  {t.signalRelationshipType[activeEdge.relationshipType]}
                </span>
                <span className="text-[var(--ws-ink-muted)]">
                  {activeEdge.isExplicitlyTyped
                    ? t.synthesis.relationshipExplicitBadge
                    : t.synthesis.relationshipLegacyBadge}
                </span>
              </div>

              <div className="space-y-3.5 border-y border-[var(--ws-border-subtle)] py-3.5">
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
                      <div className="ws-kicker text-[var(--ws-ink-faint)]">
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

              <div className="flex items-center justify-between font-mono-tabular text-[11.5px]">
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
                <p className="ws-prose text-[13px] text-[var(--ws-ink-secondary)] break-words">
                  {activeEdge.rationale}
                </p>
              )}

              {activeEdge.supportingClaimIds.length > 0 && (
                <div className="space-y-1.5 border-t border-[var(--ws-border-subtle)] pt-3">
                  <div className="ws-kicker text-[var(--ws-ink-faint)]">
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

      {/* Responsive Keyboard-Navigable Edge Ledger (Mobile-first & full inspection list) */}
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
                    aria-pressed={isSelected}
                    onClick={() => setSelectedEdgeId(key)}
                    className={`relative w-full px-4 py-3 text-left transition-colors cursor-pointer flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between ${
                      isSelected
                        ? 'bg-[var(--ws-surface-subtle)]'
                        : 'hover:bg-[var(--ws-surface-hover)]/55'
                    }`}
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono-tabular text-[11px]">
                        <span
                          className={`ws-kicker ${edgeBadgeTextClass(edge)}`}
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
                  : t.synthesis.relationshipEdgeCount(
                      visibleEdges.length,
                      visibleEdges.length
                    )}
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
