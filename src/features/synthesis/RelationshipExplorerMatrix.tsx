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
import { confidenceColorClass } from '../../lib/filtering/filterSignals';
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
  { domain: 'world', x: 18, color: 'var(--ws-world)' },
  { domain: 'ai', x: 350, color: 'var(--ws-ai)' },
  { domain: 'economy', x: 682, color: 'var(--ws-economy)' },
];

const NODE_WIDTH = 240;
const NODE_HEIGHT = 60;
const NODE_GAP = 16;
const TOP_OFFSET = 54;
const SVG_WIDTH = 940;
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
    units += code > 0x2e80 ? 1.72 : 1;
    if (units > maxUnits) {
      return `${text.slice(0, Math.max(1, cut)).trimEnd()}…`;
    }
    cut = i + 1;
  }
  return text;
}

/**
 * Splits a signal headline into up to 2 legible SVG lines so atlas nodes
 * remain immediately recognizable in both Simplified Chinese and English.
 */
function wrapSvgHeadline(text: string, maxUnitsPerLine: number): [string, string | null] {
  let units = 0;
  let splitIdx = -1;
  let lastSpaceIdx = -1;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === ' ') lastSpaceIdx = i;
    units += text.charCodeAt(i) > 0x2e80 ? 1.72 : 1;
    if (units > maxUnitsPerLine) {
      splitIdx = lastSpaceIdx > 6 ? lastSpaceIdx : i;
      break;
    }
  }
  if (splitIdx === -1) {
    return [text, null];
  }
  const line1 = text.slice(0, splitIdx).trimEnd();
  const remainder = text.slice(splitIdx).trimStart();
  const line2 = truncateSvgLabel(remainder, maxUnitsPerLine);
  return [line1, line2];
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

    const aiBottom =
      byDomain.ai.length > 0
        ? TOP_OFFSET + byDomain.ai.length * (NODE_HEIGHT + NODE_GAP)
        : TOP_OFFSET;

    const svgHeight = Math.max(
      250,
      TOP_OFFSET + maxColNodes * (NODE_HEIGHT + NODE_GAP) + 56
    );

    return { positions, byDomain, svgHeight, aiBottom };
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
        <span className="ws-meta text-[12px] font-medium text-[var(--ws-ink-muted)] shrink-0">
          {t.synthesis.relationshipEdgeCount(visibleEdges.length, totalAllEdges)}
        </span>
      </div>

      {/* Controls Strip: Type Filters + Signal Focus Selector + Legacy Toggle */}
      <div className="space-y-3 border-y border-[var(--ws-border)] py-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1">
            {model.explicitEdges.length > 0 ? (
              <>
                <button
                  type="button"
                  onClick={() => setSelectedType('all')}
                  className={`rounded-[var(--ws-radius-sm)] px-2.5 py-1 text-[12px] font-medium transition-colors cursor-pointer tabular-nums ${
                    selectedType === 'all'
                      ? 'bg-[var(--ws-rule-editorial)] text-[var(--ws-surface)] font-semibold'
                      : 'bg-transparent text-[var(--ws-ink-secondary)] hover:bg-[var(--ws-surface-subtle)] hover:text-[var(--ws-ink)]'
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
                      className={`rounded-[var(--ws-radius-sm)] px-2.5 py-1 text-[12px] font-medium transition-colors cursor-pointer tabular-nums ${
                        isSelected
                          ? 'bg-[var(--ws-rule-editorial)] text-[var(--ws-surface)] font-semibold'
                          : 'bg-transparent text-[var(--ws-ink-secondary)] hover:bg-[var(--ws-surface-subtle)] hover:text-[var(--ws-ink)]'
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
            <label className="inline-flex items-center gap-2 text-[12px] text-[var(--ws-ink-secondary)] cursor-pointer select-none tabular-nums">
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
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--ws-border-subtle)]">
          <div className="flex flex-wrap items-center gap-2.5 min-w-0">
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
              className="max-w-[300px] sm:max-w-[380px] rounded-[var(--ws-radius-sm)] border border-[var(--ws-border)] bg-[var(--ws-surface)] px-2.5 py-1.5 text-xs text-[var(--ws-ink)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ws-editorial-accent)]"
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
                className="inline-flex items-center gap-1 text-[12px] font-medium text-[var(--ws-world)] hover:underline underline-offset-4 cursor-pointer"
              >
                <X className="h-3 w-3" />
                <span>{t.synthesis.relationshipClearFocus}</span>
              </button>
            )}
          </div>
          <span className="hidden md:inline text-[11.5px] text-[var(--ws-ink-faint)]">
            {t.synthesis.relationshipKeyboardHint}
          </span>
        </div>
      </div>

      {/* Main Workspace: Keyboard-Accessible Cross-Domain Atlas (Desktop/Tablet) + Sticky Nocturnal Inspector */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 items-start">
        <div className="hidden md:block xl:col-span-8 ws-atlas-grid border-t-2 border-t-[var(--ws-ink)] border-x border-b border-[var(--ws-border)] p-4 sm:p-5 overflow-hidden">
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
                  markerWidth="6.5"
                  markerHeight="6.5"
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
                    y1={32}
                    x2={col.x + NODE_WIDTH}
                    y2={32}
                    stroke={col.color}
                    strokeWidth="2.5"
                    opacity="0.9"
                  />
                  <text
                    x={col.x}
                    y={22}
                    fill={col.color}
                    fontSize="11.5"
                    fontWeight="600"
                    letterSpacing="0.06em"
                    className="ws-meta uppercase"
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
                  : activeEdge
                  ? 'var(--ws-border-strong)'
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
                  const offset = (onRight ? -1 : 1) * (28 + (idx % 3) * 12);
                  pathD = `M ${anchorX} ${y1} C ${anchorX + offset} ${y1}, ${anchorX + offset} ${y2}, ${anchorX} ${y2}`;
                } else if (Math.abs(src.colIndex - tgt.colIndex) === 2) {
                  // World <-> Economy cross-span: arc cleanly below the AI center column when space allows so lines don't slash behind AI nodes
                  const goingRight = src.colIndex < tgt.colIndex;
                  const x1 = goingRight ? src.x + NODE_WIDTH : src.x;
                  const x2 = goingRight ? tgt.x : tgt.x + NODE_WIDTH;
                  const detourY = Math.max(
                    layout.aiBottom + 14 + (idx % 4) * 6,
                    Math.max(y1, y2) + 18
                  );
                  const clampedY = Math.min(detourY, layout.svgHeight - 14);
                  const midX1 = goingRight ? x1 + 92 : x1 - 92;
                  const midX2 = goingRight ? x2 - 92 : x2 + 92;
                  pathD = `M ${x1} ${y1} C ${midX1} ${clampedY}, ${midX2} ${clampedY}, ${x2} ${y2}`;
                } else {
                  const goingRight = src.colIndex < tgt.colIndex;
                  const x1 = goingRight ? src.x + NODE_WIDTH : src.x;
                  const x2 = goingRight ? tgt.x : tgt.x + NODE_WIDTH;
                  const span = Math.abs(x2 - x1);
                  const ctrlOffset = Math.min(span * 0.46, 54);
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
                      strokeWidth={isSelected ? 2.4 : 1.1}
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
                            : 0.42
                          : 0.65
                      }
                    />
                  </g>
                );
              })}

              {/* Keyboard-Accessible Signal Nodes (2-Line Headline Clarity + Clean Top Hairline) */}
              {Array.from(layout.positions.values()).map(({ signal, x, y }) => {
                const isEndpoint =
                  activeEdge?.sourceSignalId === signal.signal_id ||
                  activeEdge?.targetSignalId === signal.signal_id;
                const isFocused = focusedSignalId === signal.signal_id;
                const colColor =
                  COLUMNS.find((c) => c.domain === signal.domain)?.color ??
                  'var(--ws-ink)';

                const [line1, line2] = wrapSvgHeadline(signal.headline, 24);
                const shortId = truncateSvgLabel(signal.signal_id, 26);

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
                          ? 'var(--ws-surface-elevated)'
                          : 'var(--ws-surface)'
                      }
                      stroke={
                        isEndpoint
                          ? 'var(--ws-rule-editorial)'
                          : isFocused
                          ? colColor
                          : 'var(--ws-border-strong)'
                      }
                      strokeWidth={isEndpoint || isFocused ? 1.5 : 1}
                    />
                    <rect
                      x={x + 0.5}
                      y={y + 0.5}
                      width={NODE_WIDTH - 1}
                      height={isEndpoint ? '3' : '2'}
                      rx="1"
                      fill={isEndpoint ? 'var(--ws-editorial-accent)' : colColor}
                      opacity={isEndpoint ? 1 : 0.72}
                    />
                    <text
                      x={x + 10}
                      y={line2 ? y + 19 : y + 24}
                      fill="var(--ws-ink)"
                      fontSize="11.5"
                      fontWeight={isEndpoint ? '600' : '500'}
                    >
                      {line1}
                    </text>
                    {line2 && (
                      <text
                        x={x + 10}
                        y={y + 34}
                        fill="var(--ws-ink)"
                        fontSize="11.5"
                        fontWeight={isEndpoint ? '600' : '500'}
                      >
                        {line2}
                      </text>
                    )}
                    <text
                      x={x + 10}
                      y={y + 51}
                      fill="var(--ws-ink-muted)"
                      fontSize="9.5"
                      className="font-mono-tabular"
                    >
                      {shortId}
                    </text>
                    {/* Calibrated 5-Pip Importance Micro-Bar */}
                    <g aria-hidden="true">
                      {[1, 2, 3, 4, 5].map((step) => (
                        <rect
                          key={step}
                          x={x + NODE_WIDTH - 43 + (step - 1) * 7}
                          y={y + 44.5}
                          width="5"
                          height="5"
                          rx="0.8"
                          fill={step <= signal.importance ? colColor : 'var(--ws-border)'}
                          opacity={step <= signal.importance ? 0.9 : 0.45}
                        />
                      ))}
                    </g>
                  </g>
                );
              })}
            </svg>
          )}
        </div>

        {/* Synchronized Sticky Nocturnal Evidence & Mechanism Inspector */}
        <aside className="xl:col-span-4 xl:sticky xl:top-[84px] ws-plate border border-[var(--ws-plate-border)] p-5 sm:p-6 space-y-4">
          {activeEdge ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--ws-plate-border)] pb-3 text-[11.5px]">
                <span className="inline-flex items-center gap-2 ws-kicker text-[var(--ws-plate-accent)]">
                  <span
                    aria-hidden="true"
                    className="h-[2px] w-4 bg-[var(--ws-plate-accent)]"
                  />
                  {t.signalRelationshipType[activeEdge.relationshipType]}
                </span>
                <span className="font-mono-tabular text-[11px] text-[var(--ws-plate-muted)]">
                  {activeEdge.isExplicitlyTyped
                    ? t.synthesis.relationshipExplicitBadge
                    : t.synthesis.relationshipLegacyBadge}
                </span>
              </div>

              <div className="space-y-4 border-b border-[var(--ws-plate-border)] pb-4">
                {[
                  {
                    label: t.synthesis.relationshipSourceNode,
                    id: activeEdge.sourceSignalId,
                    step: '01',
                  },
                  {
                    label: t.synthesis.relationshipTargetNode,
                    id: activeEdge.targetSignalId,
                    step: '02',
                  },
                ].map(({ label, id, step }, nodeIdx) => {
                  const sig = signalById.get(id);
                  return (
                    <div
                      key={`${label}-${id}`}
                      className={
                        nodeIdx === 1
                          ? 'space-y-1 border-t border-[var(--ws-plate-border)] pt-3.5'
                          : 'space-y-1'
                      }
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="ws-kicker text-[var(--ws-plate-muted)] text-[10.5px]">
                          {label}
                        </span>
                        <span className="font-mono-tabular text-[10.5px] text-[var(--ws-plate-muted)]">
                          {step}
                        </span>
                      </div>
                      {sig ? (
                        <button
                          type="button"
                          onClick={() => onOpenSignal(sig.signal_id)}
                          className="group text-left space-y-1 cursor-pointer w-full"
                        >
                          <div className="font-display text-[15px] font-semibold leading-snug text-[var(--ws-plate-ink)] group-hover:text-[var(--ws-plate-accent)] transition-colors break-words">
                            {sig.headline}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 ws-meta text-[11.5px] text-[var(--ws-plate-muted)]">
                            <span className="font-semibold text-[var(--ws-plate-secondary)] shrink-0 whitespace-nowrap">
                              {t.domains[sig.domain]}
                            </span>
                            <span className="font-mono-tabular text-[11px] break-all">
                              · {sig.signal_id}
                            </span>
                            <ArrowUpRight className="h-3 w-3 shrink-0 text-[var(--ws-plate-accent)]" />
                          </div>
                        </button>
                      ) : (
                        <div className="font-mono-tabular text-xs text-[var(--ws-plate-muted)] break-all">
                          {id}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[12px]">
                <span className="text-[var(--ws-plate-muted)]">
                  {t.expanded.confidenceLabel}
                </span>
                <span className="font-semibold text-[var(--ws-plate-ink)]">
                  {t.confidence[activeEdge.confidence]}
                </span>
              </div>

              {activeEdge.rationale && (
                <p className="text-[13.5px] leading-[1.68] text-[var(--ws-plate-secondary)] break-words">
                  {activeEdge.rationale}
                </p>
              )}

              {activeEdge.supportingClaimIds.length > 0 && (
                <div className="space-y-1.5 border-t border-[var(--ws-plate-border)] pt-3">
                  <div className="ws-kicker text-[var(--ws-plate-muted)] text-[10.5px]">
                    {t.synthesis.relationshipEvidenceClaims}
                  </div>
                  <div className="flex flex-wrap gap-x-2.5 gap-y-1 font-mono-tabular text-[11px] text-[#9ec5f8]">
                    {activeEdge.supportingClaimIds.map((cid) => (
                      <span key={cid}>{cid}</span>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-xs leading-relaxed text-[var(--ws-plate-muted)]">
              {t.synthesis.relationshipInspectPrompt}
            </p>
          )}
        </aside>
      </div>

      {/* Responsive Keyboard-Navigable Edge Ledger (Mobile-first & full inspection list) */}
      {visibleEdges.length > 0 && (
        <div className="ws-broadsheet-ledger overflow-hidden">
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
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 ws-meta text-[11.5px]">
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
                className="ws-meta text-[12px] font-medium text-[var(--ws-world)] hover:underline underline-offset-4 cursor-pointer"
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
        <p className="ws-meta text-[11.5px] text-[var(--ws-ink-muted)]">
          {t.synthesis.relationshipUnresolvedNote(
            model.unresolvedTargets.length
          )}
        </p>
      )}
    </section>
  );
};
