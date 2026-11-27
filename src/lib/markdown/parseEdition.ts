import yaml from 'js-yaml';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { toString as mdastToString } from 'mdast-util-to-string';
import type { Root, Content, Heading, Blockquote, Table } from 'mdast';
import type {
  ClaimStatus,
  ConfidenceLevel,
  EditionFrontmatter,
  EditionStatus,
  HorizonImpact,
  MediaAssetType,
  MediaPlacement,
  MediaRightsBasis,
  MediaSignalRelationship,
  ParsedEdition,
  ParsedSignal,
  PersonalSection,
  ScenarioItem,
  SignalClaim,
  SignalDomain,
  SignalMediaAsset,
  SignalNarrativeSections,
  SignalSource,
  SignalContinuity,
  SignalUpdate,
  SignalTimelineEvent,
  SignalRelationship,
  SignalLifecycle,
  SignalChangeType,
  SignalRelationshipType,
  SignalStatus,
  SourceClass,
  SourceRelationship,
  SynthesisThread,
  TimelineEntry,
  TopSignalRef,
  ValidationIssue,
  WatchlistRow,
} from '../../types/edition';
import {
  calculateSourceIndependence,
  getIndependenceExclusionReason,
  type SourceWithSignalRef,
} from '../source-independence/calculateIndependence';

const REQUIRED_TOP_HEADINGS = [
  'Executive Briefing',
  'World Events',
  'AI Frontier',
  'Economic Outlook',
  'Cross-Domain Synthesis',
  'Personal Implications',
  'Watchlist',
  'Audit & Methodology',
] as const;

const VALID_DOMAINS: readonly SignalDomain[] = ['world', 'ai', 'economy'];
const VALID_CONFIDENCE: readonly ConfidenceLevel[] = ['high', 'medium', 'low', 'unverified'];
const VALID_SIGNAL_STATUS: readonly SignalStatus[] = [
  'new',
  'developing',
  'ongoing',
  'confirmed',
  'disputed',
  'unverified',
  'closed',
  'corrected',
];
const VALID_CLAIM_STATUS: readonly ClaimStatus[] = [
  'confirmed',
  'reported',
  'official_claim',
  'disputed',
  'unverified',
];
const VALID_SOURCE_CLASSES: readonly Exclude<SourceClass, 'unknown'>[] = [
  'tier_1_newsroom',
  'specialist_publication',
  'primary_source',
  'research_paper',
];
const VALID_RELATIONSHIPS: readonly Exclude<SourceRelationship, 'unknown'>[] = [
  'original_reporting',
  'syndicated',
  'official_statement',
  'company_announcement',
  'research_artifact',
  'secondary_analysis',
];
const VALID_EDITION_STATUSES: readonly EditionStatus[] = ['draft', 'reviewed', 'published'];
const VALID_SIGNAL_LIFECYCLES: readonly SignalLifecycle[] = [
  'new', 'developing', 'ongoing', 'monitoring', 'resolved', 'archived',
];
const VALID_SIGNAL_CHANGE_TYPES: readonly SignalChangeType[] = [
  'initial', 'material_update', 'status_change', 'new_evidence', 'correction', 'no_material_change',
];
const VALID_SIGNAL_RELATIONSHIPS: readonly SignalRelationshipType[] = [
  'same_event', 'contextual', 'policy_response', 'market_transmission',
  'technological_dependency', 'causal_link', 'potential_link',
];
const VALID_MEDIA_TYPES: readonly MediaAssetType[] = [
  'photograph', 'illustration', 'chart', 'map', 'diagram', 'document_scan', 'screenshot',
];
const VALID_MEDIA_PLACEMENTS: readonly MediaPlacement[] = ['hero', 'supporting'];
const VALID_MEDIA_RELATIONSHIPS: readonly MediaSignalRelationship[] = [
  'direct_event_documentation', 'contextual', 'illustrative', 'data_visualization',
];
const VALID_MEDIA_RIGHTS_BASES: readonly MediaRightsBasis[] = [
  'public_domain', 'cc0', 'cc_by', 'cc_by_sa', 'explicit_permission', 'editorial_license',
];

function isValidCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;
}

function isValidIsoTimestamp(value: string): boolean {
  const isoDateTime =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})$/;
  return isoDateTime.test(value) &&
    isValidCalendarDate(value.slice(0, 10)) &&
    Number.isFinite(Date.parse(value));
}

function isValidDateOrDateTime(value: string): boolean {
  if (isValidCalendarDate(value)) return true;
  return isValidIsoTimestamp(value);
}

const SIGNAL_ID_REGEX = /^(WORLD|AI|ECON)-\d{8}-[a-z0-9-]+$/;
const INLINE_SIGNAL_ID_GLOBAL = /\b(?:WORLD|AI|ECON)-\d{8}-[a-z0-9-]+\b/g;

const markdownProcessor = unified().use(remarkParse).use(remarkGfm);

export function isSafeHttpUrl(rawUrl: string): boolean {
  if (!rawUrl || typeof rawUrl !== 'string') return false;
  try {
    const parsed = new URL(rawUrl.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function isSafeHttpsUrl(rawUrl: string): boolean {
  if (!rawUrl || typeof rawUrl !== 'string') return false;
  try {
    const parsed = new URL(rawUrl.trim());
    return parsed.protocol === 'https:' && Boolean(parsed.hostname);
  } catch {
    return false;
  }
}

function asString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (value instanceof Date) return value.toISOString();
  return fallback;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => asString(item)).filter(Boolean);
}

function extractFrontmatter(
  markdown: string,
  issues: ValidationIssue[],
  expectedDate?: string
): { frontmatter: EditionFrontmatter; body: string } {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) {
    issues.push({
      severity: 'error',
      code: 'MISSING_FRONTMATTER',
      message: 'Edition is missing YAML frontmatter delimited by --- fences.',
    });
    return {
      frontmatter: {
        schema_version: 1,
        edition_date: expectedDate ?? 'Unknown',
        edition_timezone: 'America/Los_Angeles',
        edition_title: 'WORLD SIGNAL — Daily Intelligence Briefing',
        edition_status: 'draft',
        content_language: 'en',
        generated_at: '',
        updated_at: '',
        sync_run: 'manual',
        coverage_window_start: '',
        coverage_window_end: '',
        summary: '',
      },
      body: markdown,
    };
  }

  let parsedRaw: Record<string, unknown> = {};
  try {
    const loaded = yaml.load(match[1], { schema: yaml.JSON_SCHEMA });
    if (loaded && typeof loaded === 'object' && !Array.isArray(loaded)) {
      parsedRaw = loaded as Record<string, unknown>;
    } else {
      issues.push({
        severity: 'error',
        code: 'INVALID_FRONTMATTER_TYPE',
        message: 'YAML frontmatter must evaluate to a key-value mapping.',
      });
    }
  } catch (error) {
    issues.push({
      severity: 'error',
      code: 'YAML_FRONTMATTER_ERROR',
      message: `Failed to parse edition YAML frontmatter: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }

  const rawStatus = asString(parsedRaw.edition_status, 'draft') as EditionStatus;
  if (!VALID_EDITION_STATUSES.includes(rawStatus)) {
    issues.push({
      severity: 'warning',
      code: 'INVALID_EDITION_STATUS',
      message: `Unexpected edition_status "${rawStatus}". Expected draft, reviewed, or published.`,
    });
  }

  const editionDate = asString(parsedRaw.edition_date);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(editionDate)) {
    issues.push({
      severity: 'error',
      code: 'INVALID_EDITION_DATE',
      message: `edition_date "${editionDate}" must follow YYYY-MM-DD format.`,
    });
  } else if (expectedDate && editionDate !== expectedDate) {
    issues.push({
      severity: 'warning',
      code: 'EDITION_DATE_PATH_MISMATCH',
      message: `Frontmatter edition_date "${editionDate}" does not match archive path date "${expectedDate}".`,
    });
  }

  const schemaVersion = Number(parsedRaw.schema_version ?? 1);
  if (!Number.isFinite(schemaVersion) || schemaVersion < 1) {
    issues.push({
      severity: 'warning',
      code: 'INVALID_SCHEMA_VERSION',
      message: 'schema_version should be a positive integer.',
    });
  }

  return {
    frontmatter: {
      schema_version: Number.isFinite(schemaVersion) ? schemaVersion : 1,
      edition_date: editionDate || expectedDate || 'Unknown',
      edition_timezone: asString(parsedRaw.edition_timezone, 'America/Los_Angeles'),
      edition_title: asString(parsedRaw.edition_title, 'WORLD SIGNAL — Daily Intelligence Briefing'),
      edition_status: VALID_EDITION_STATUSES.includes(rawStatus) ? rawStatus : 'draft',
      content_language: asString(parsedRaw.content_language, 'en'),
      generated_at: asString(parsedRaw.generated_at),
      updated_at: asString(parsedRaw.updated_at),
      sync_run: asString(parsedRaw.sync_run, 'manual'),
      coverage_window_start: asString(parsedRaw.coverage_window_start),
      coverage_window_end: asString(parsedRaw.coverage_window_end),
      summary: asString(parsedRaw.summary),
    },
    body: markdown.slice(match[0].length),
  };
}

interface HeadingBlock {
  title: string;
  content: string;
}

/**
 * Splits markdown by headings at a specific AST depth using unified/remark-parse,
 * preserving exact raw Markdown slices for each block while ignoring `#` inside
 * code fences or blockquotes.
 */
function splitByHeadingLevel(
  markdown: string,
  depth: 1 | 2 | 3
): { preamble: string; blocks: HeadingBlock[] } {
  const tree = markdownProcessor.parse(markdown) as Root;
  const headingNodes: Array<{ title: string; start: number; end: number }> = [];

  for (const node of tree.children) {
    if (node.type === 'heading' && node.depth === depth && node.position) {
      const start = node.position.start.offset;
      const end = node.position.end.offset;
      if (typeof start === 'number' && typeof end === 'number') {
        headingNodes.push({
          title: mdastToString(node as Heading).trim(),
          start,
          end,
        });
      }
    }
  }

  if (headingNodes.length === 0) {
    return { preamble: markdown.trim(), blocks: [] };
  }

  const preamble = markdown.slice(0, headingNodes[0].start).trim();
  const blocks: HeadingBlock[] = [];

  for (let i = 0; i < headingNodes.length; i++) {
    const current = headingNodes[i];
    const nextStart = i + 1 < headingNodes.length ? headingNodes[i + 1].start : markdown.length;
    blocks.push({
      title: current.title,
      content: markdown.slice(current.end, nextStart).trim(),
    });
  }

  return { preamble, blocks };
}

function extractFirstYamlFence(blockContent: string): { yamlText: string | null; remainder: string } {
  const tree = markdownProcessor.parse(blockContent) as Root;
  for (const node of tree.children) {
    if (
      node.type === 'code' &&
      node.lang &&
      node.lang.trim().toLowerCase() === 'yaml' &&
      node.position &&
      typeof node.position.start.offset === 'number' &&
      typeof node.position.end.offset === 'number'
    ) {
      const before = blockContent.slice(0, node.position.start.offset).trim();
      const after = blockContent.slice(node.position.end.offset).trim();
      return {
        yamlText: node.value,
        remainder: [before, after].filter(Boolean).join('\n\n'),
      };
    }
  }

  return { yamlText: null, remainder: blockContent };
}

function parseTimelineEntries(rawTimeline: string): TimelineEntry[] {
  if (!rawTimeline.trim()) return [];
  const entries: TimelineEntry[] = [];

  for (const rawLine of rawTimeline.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || !/^[-*+]\s+/.test(line)) continue;
    const cleaned = line.replace(/^[-*+]\s+/, '').trim();
    const match = cleaned.match(
      /^(\d{4}-\d{2}-\d{2}(?:\s*[–—-]\s*(?:\d{4}-\d{2}-\d{2}|\d{2}-\d{2}|\d{2}))?|\d{4}-\d{2}|\d{4}\s*年\s*\d{1,2}\s*月(?:\s*\d{1,2}\s*日)?)\s*(?:—|--|–|:|：)\s*(.+)$/
    );
    if (match) {
      entries.push({
        dateLabel: match[1].trim(),
        text: match[2].trim(),
      });
    } else {
      entries.push({
        dateLabel: null,
        text: cleaned,
      });
    }
  }

  return entries;
}

function parseScenarioItems(rawScenarios: string): ScenarioItem[] {
  if (!rawScenarios.trim()) return [];
  const items: ScenarioItem[] = [];

  for (const rawLine of rawScenarios.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || !/^[-*+]\s+/.test(line)) continue;
    const cleaned = line.replace(/^[-*+]\s+/, '').trim();

    // Matches:
    // - **Base case（条件：** ...**）：** body
    // - **Downside（触发：** ...**）：** body
    // - **Base case:** body
    // - **Upside case:** body
    const zhConditionalMatch = cleaned.match(
      /^\*\*(Base\s*case|Downside(?:\s*case)?|Upside(?:\s*case)?)[（(]([^）)：:]+)[：:]\*\*\s*(.+?)\*\*[）)][：:]\*\*\s*(.+)$/i
    );
    if (zhConditionalMatch) {
      const rawLabel = zhConditionalMatch[1].trim();
      const lower = rawLabel.toLowerCase();
      const kind: ScenarioItem['kind'] = lower.includes('base')
        ? 'base'
        : lower.includes('downside')
          ? 'downside'
          : lower.includes('upside')
            ? 'upside'
            : 'other';
      items.push({
        kind,
        label: rawLabel,
        condition: `${zhConditionalMatch[2].trim()}：${zhConditionalMatch[3].trim()}`,
        body: zhConditionalMatch[4].trim(),
      });
      continue;
    }

    const stdMatch = cleaned.match(
      /^\*\*([^*\n]+?)(?:[：:]\*\*|\*\*\s*[：:—–-])\s*(.+)$/
    );
    if (stdMatch) {
      const rawLabel = stdMatch[1].trim();
      const lower = rawLabel.toLowerCase();
      const kind: ScenarioItem['kind'] =
        lower.includes('base') || rawLabel.includes('基准')
          ? 'base'
          : lower.includes('downside') || rawLabel.includes('下行')
            ? 'downside'
            : lower.includes('upside') || rawLabel.includes('上行')
              ? 'upside'
              : 'other';
      items.push({
        kind,
        label: rawLabel,
        body: stdMatch[2].trim(),
      });
      continue;
    }

    items.push({
      kind: 'other',
      label: '',
      body: cleaned,
    });
  }

  return items;
}

/**
 * Extracts explicit horizon impacts (Immediate / Near-term / Medium-term / Structural)
 * ONLY when present in the signal's Analysis text. Never invents time horizons.
 */
function extractHorizonImpacts(analysisText: string): HorizonImpact[] {
  if (!analysisText.trim()) return [];
  const results: HorizonImpact[] = [];

  const zhPatterns: Array<{
    horizon: HorizonImpact['horizon'];
    label: string;
    regex: RegExp;
  }> = [
    {
      horizon: 'immediate',
      label: '即时影响',
      regex: /即时影响(?:（[^）]+）|\([^)]+\))?\s*(?:是|为|：|:)\s*([^；。\n]+)/,
    },
    {
      horizon: 'near_term',
      label: '短期影响',
      regex: /短期影响(?:（[^）]+）|\([^)]+\))?\s*(?:是|为|取决于|：|:)\s*([^；。\n]+)/,
    },
    {
      horizon: 'medium_term',
      label: '中期影响',
      regex: /中期影响(?:（[^）]+）|\([^)]+\))?\s*(?:是|为|取决于|：|:)\s*([^；。\n]+)/,
    },
    {
      horizon: 'structural',
      label: '结构性影响',
      regex: /结构性影响(?:（[^）]+）|\([^)]+\))?\s*(?:是|为|取决于|：|:)\s*([^；。\n]+)/,
    },
  ];

  for (const pat of zhPatterns) {
    const match = analysisText.match(pat.regex);
    if (match && match[1]) {
      results.push({
        horizon: pat.horizon,
        label: pat.label,
        text: match[0].trim(),
      });
    }
  }

  if (results.length > 0) return results;

  const enPatterns: Array<{
    horizon: HorizonImpact['horizon'];
    label: string;
    regex: RegExp;
  }> = [
    {
      horizon: 'immediate',
      label: 'Immediate',
      regex: /\bImmediate(?:\s+impact)?(?:\s*\([^)]+\))?\s*[:—-]\s*([^\n;]+)/i,
    },
    {
      horizon: 'near_term',
      label: 'Near-term',
      regex: /\bNear-term(?:\s+impact)?(?:\s*\([^)]+\))?\s*[:—-]\s*([^\n;]+)/i,
    },
    {
      horizon: 'medium_term',
      label: 'Medium-term',
      regex: /\bMedium-term(?:\s+impact)?(?:\s*\([^)]+\))?\s*[:—-]\s*([^\n;]+)/i,
    },
    {
      horizon: 'structural',
      label: 'Structural',
      regex: /\bStructural(?:\s+impact)?(?:\s*\([^)]+\))?\s*[:—-]\s*([^\n;]+)/i,
    },
  ];

  for (const pat of enPatterns) {
    const match = analysisText.match(pat.regex);
    if (match && match[1]) {
      results.push({
        horizon: pat.horizon,
        label: pat.label,
        text: match[1].trim(),
      });
    }
  }

  return results;
}

function parseSignalBlock(
  headingTitle: string,
  blockContent: string,
  expectedDomain: SignalDomain,
  schemaVersion: number,
  orderIndex: number,
  issues: ValidationIssue[]
): ParsedSignal {
  const headingMatch = headingTitle.match(
    /^((?:WORLD|AI|ECON)-[A-Za-z0-9-]+|[A-Z0-9-]+)\s*(?:—|--|-|:)\s*(.+)$/
  );
  const fallbackId = headingMatch
    ? headingMatch[1].trim()
    : headingTitle.split(/\s+/)[0] || `UNKNOWN-SIGNAL-${orderIndex + 1}`;
  const headline = headingMatch ? headingMatch[2].trim() : headingTitle.trim();

  const { yamlText, remainder } = extractFirstYamlFence(blockContent);
  let meta: Record<string, unknown> = {};

  if (!yamlText) {
    issues.push({
      severity: 'error',
      code: 'MISSING_SIGNAL_YAML',
      signalId: fallbackId,
      message: `Signal "${fallbackId}" is missing its YAML metadata fence.`,
    });
  } else {
    try {
      const loaded = yaml.load(yamlText, { schema: yaml.JSON_SCHEMA });
      if (loaded && typeof loaded === 'object' && !Array.isArray(loaded)) {
        meta = loaded as Record<string, unknown>;
      } else {
        issues.push({
          severity: 'error',
          code: 'INVALID_SIGNAL_YAML_TYPE',
          signalId: fallbackId,
          message: `Signal "${fallbackId}" metadata fence must be a YAML object.`,
        });
      }
    } catch (error) {
      issues.push({
        severity: 'error',
        code: 'SIGNAL_YAML_PARSE_ERROR',
        signalId: fallbackId,
        message: `Signal "${fallbackId}" YAML parse error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }

  const signalId = asString(meta.signal_id, fallbackId);
  if (!SIGNAL_ID_REGEX.test(signalId)) {
    issues.push({
      severity: 'warning',
      code: 'INVALID_SIGNAL_ID_FORMAT',
      signalId,
      message: `Signal ID "${signalId}" does not match expected DOMAIN-YYYYMMDD-slug format.`,
    });
  }

  const rawDomain = asString(meta.domain, expectedDomain) as SignalDomain;
  const domain = VALID_DOMAINS.includes(rawDomain) ? rawDomain : expectedDomain;
  if (!VALID_DOMAINS.includes(rawDomain)) {
    issues.push({
      severity: 'warning',
      code: 'INVALID_SIGNAL_DOMAIN',
      signalId,
      message: `Signal "${signalId}" has unexpected domain "${rawDomain}"; defaulting to "${expectedDomain}".`,
    });
  } else if (rawDomain !== expectedDomain) {
    issues.push({
      severity: 'warning',
      code: 'DOMAIN_SECTION_MISMATCH',
      signalId,
      message: `Signal "${signalId}" has domain "${rawDomain}" inside "${expectedDomain}" section.`,
    });
  }

  const rawImportance = Number(meta.importance ?? 3);
  const clampedImportance = Math.min(
    5,
    Math.max(1, Math.round(Number.isFinite(rawImportance) ? rawImportance : 3))
  ) as 1 | 2 | 3 | 4 | 5;
  if (!Number.isInteger(rawImportance) || rawImportance < 1 || rawImportance > 5) {
    issues.push({
      severity: 'warning',
      code: 'INVALID_IMPORTANCE',
      signalId,
      message: `Signal "${signalId}" importance "${String(meta.importance)}" should be an integer 1–5.`,
    });
  }

  const rawStatus = asString(meta.status, 'developing') as SignalStatus;
  const status = VALID_SIGNAL_STATUS.includes(rawStatus) ? rawStatus : 'developing';
  if (!VALID_SIGNAL_STATUS.includes(rawStatus)) {
    issues.push({
      severity: 'warning',
      code: 'INVALID_SIGNAL_STATUS',
      signalId,
      message: `Signal "${signalId}" has unknown status "${rawStatus}".`,
    });
  }

  const confObj =
    meta.confidence && typeof meta.confidence === 'object' && !Array.isArray(meta.confidence)
      ? (meta.confidence as Record<string, unknown>)
      : {};
  const rawConf = asString(confObj.overall, 'unverified') as ConfidenceLevel;
  const overallConfidence = VALID_CONFIDENCE.includes(rawConf) ? rawConf : 'unverified';
  if (!VALID_CONFIDENCE.includes(rawConf)) {
    issues.push({
      severity: 'warning',
      code: 'INVALID_CONFIDENCE',
      signalId,
      message: `Signal "${signalId}" confidence "${rawConf}" is invalid.`,
    });
  }

  const eventObj =
    meta.event && typeof meta.event === 'object' && !Array.isArray(meta.event)
      ? (meta.event as Record<string, unknown>)
      : {};

  const continuityRaw =
    meta.continuity && typeof meta.continuity === 'object' && !Array.isArray(meta.continuity)
      ? (meta.continuity as Record<string, unknown>)
      : null;
  if (schemaVersion >= 2 && !continuityRaw) {
    issues.push({
      severity: 'error',
      code: 'MISSING_V2_CONTINUITY',
      signalId,
      message: `Schema-v2 signal "${signalId}" is missing its continuity object.`,
    });
  }
  let continuity: SignalContinuity | undefined;
  if (continuityRaw) {
    const firstSeen =
      continuityRaw.first_seen_edition === null
        ? null
        : asString(continuityRaw.first_seen_edition);
    const lastMaterialUpdate =
      continuityRaw.last_material_update === null
        ? null
        : asString(continuityRaw.last_material_update);
    const rawLifecycle = asString(continuityRaw.lifecycle) as SignalLifecycle;
    const historyCompleteRaw = continuityRaw.history_complete;
    const historyComplete =
      typeof historyCompleteRaw === 'boolean' ? historyCompleteRaw : false;
    const validFirstSeen = firstSeen === null || isValidCalendarDate(firstSeen);
    const validLastUpdate =
      lastMaterialUpdate === null || isValidCalendarDate(lastMaterialUpdate);
    const issueSeverity = schemaVersion >= 2 ? 'error' : 'warning';

    if (!validFirstSeen || !validLastUpdate) {
      issues.push({
        severity: issueSeverity,
        code: 'INVALID_SIGNAL_CONTINUITY_DATE',
        signalId,
        message: `Signal "${signalId}" continuity dates must be valid YYYY-MM-DD dates or explicit null values.`,
      });
    }
    if (schemaVersion >= 2 && typeof historyCompleteRaw !== 'boolean') {
      issues.push({
        severity: 'error',
        code: 'MISSING_V2_HISTORY_COMPLETENESS',
        signalId,
        message: `Schema-v2 signal "${signalId}" must declare continuity.history_complete as a boolean.`,
      });
    }
    if (historyComplete && (!firstSeen || !lastMaterialUpdate)) {
      issues.push({
        severity: issueSeverity,
        code: 'INCOMPLETE_HISTORY_WITH_COMPLETE_FLAG',
        signalId,
        message: `Signal "${signalId}" cannot mark history complete while first_seen_edition or last_material_update is unknown.`,
      });
    }
    if (!VALID_SIGNAL_LIFECYCLES.includes(rawLifecycle)) {
      issues.push({
        severity: issueSeverity,
        code: 'INVALID_SIGNAL_LIFECYCLE',
        signalId,
        message: `Signal "${signalId}" has unknown lifecycle "${rawLifecycle}".`,
      });
    }
    if (validFirstSeen && validLastUpdate &&
        (typeof historyCompleteRaw === 'boolean' || schemaVersion < 2) &&
        VALID_SIGNAL_LIFECYCLES.includes(rawLifecycle) &&
        !(historyComplete && (!firstSeen || !lastMaterialUpdate))) {
      continuity = {
        first_seen_edition: firstSeen,
        last_material_update: lastMaterialUpdate,
        history_complete: historyComplete,
        lifecycle: rawLifecycle,
      };
    }
  }

  const updateRaw =
    meta.update && typeof meta.update === 'object' && !Array.isArray(meta.update)
      ? (meta.update as Record<string, unknown>)
      : null;
  if (schemaVersion >= 2 && !updateRaw) {
    issues.push({
      severity: 'error',
      code: 'MISSING_V2_UPDATE',
      signalId,
      message: `Schema-v2 signal "${signalId}" is missing its update object.`,
    });
  }
  let update: SignalUpdate | undefined;
  if (updateRaw) {
    const rawChangeType = asString(updateRaw.change_type) as SignalChangeType;
    const summary = asString(updateRaw.summary);
    const previousEdition = asString(updateRaw.previous_edition);
    const evidenceRaw =
      updateRaw.evidence_changes && typeof updateRaw.evidence_changes === 'object' &&
      !Array.isArray(updateRaw.evidence_changes)
        ? (updateRaw.evidence_changes as Record<string, unknown>)
        : {};
    if (!VALID_SIGNAL_CHANGE_TYPES.includes(rawChangeType)) {
      issues.push({
        severity: 'warning',
        code: 'INVALID_SIGNAL_CHANGE_TYPE',
        signalId,
        message: `Signal "${signalId}" has unknown change_type "${rawChangeType}".`,
      });
    }
    if (!summary) {
      issues.push({
        severity: 'warning',
        code: 'MISSING_SIGNAL_UPDATE_SUMMARY',
        signalId,
        message: `Signal "${signalId}" update metadata should include a concise summary.`,
      });
    }
    if (previousEdition && !isValidCalendarDate(previousEdition)) {
      issues.push({
        severity: 'warning',
        code: 'INVALID_PREVIOUS_EDITION_DATE',
        signalId,
        message: `Signal "${signalId}" previous_edition must be a valid YYYY-MM-DD date.`,
      });
    }
    if (schemaVersion >= 2) {
      const requiredEvidenceArrays = [
        'added_claim_ids',
        'revised_claim_ids',
        'withdrawn_claim_ids',
        'added_source_urls',
        'removed_source_urls',
      ];
      for (const key of requiredEvidenceArrays) {
        if (!Array.isArray(evidenceRaw[key])) {
          issues.push({
            severity: 'error',
            code: 'MISSING_V2_EVIDENCE_CHANGE_ARRAY',
            signalId,
            message: `Schema-v2 signal "${signalId}" update.evidence_changes.${key} must be an array.`,
          });
        }
      }
    }
    if (VALID_SIGNAL_CHANGE_TYPES.includes(rawChangeType) && summary) {
      update = {
        change_type: rawChangeType,
        summary,
        previous_edition: isValidCalendarDate(previousEdition) ? previousEdition : undefined,
        evidence_changes: {
          added_claim_ids: asStringArray(evidenceRaw.added_claim_ids),
          revised_claim_ids: asStringArray(evidenceRaw.revised_claim_ids),
          withdrawn_claim_ids: asStringArray(evidenceRaw.withdrawn_claim_ids),
          added_source_urls: asStringArray(evidenceRaw.added_source_urls),
          removed_source_urls: asStringArray(evidenceRaw.removed_source_urls),
        },
      };
    }
  }

  if (schemaVersion >= 2 && !Array.isArray(meta.timeline_events)) {
    issues.push({
      severity: 'error',
      code: 'MISSING_V2_TIMELINE_EVENTS',
      signalId,
      message: `Schema-v2 signal "${signalId}" must include timeline_events as an array (it may be empty).`,
    });
  }
  const timelineEventsRaw = Array.isArray(meta.timeline_events) ? meta.timeline_events : [];
  const timelineEvents: SignalTimelineEvent[] = timelineEventsRaw.flatMap((item, idx) => {
    const raw = item && typeof item === 'object' && !Array.isArray(item)
      ? (item as Record<string, unknown>)
      : {};
    const eventId = asString(raw.event_id);
    const occurredAt = asString(raw.occurred_at);
    const title = asString(raw.title);
    const summary = asString(raw.summary);
    if (!eventId || !isValidDateOrDateTime(occurredAt) || !title || !summary) {
      issues.push({
        severity: 'warning',
        code: 'INVALID_TIMELINE_EVENT',
        signalId,
        message: `Timeline event #${idx + 1} in "${signalId}" requires event_id, valid occurred_at, title and summary.`,
      });
      return [];
    }
    return [{
      event_id: eventId,
      occurred_at: occurredAt,
      title,
      summary,
      claim_ids: asStringArray(raw.claim_ids),
      source_ids: asStringArray(raw.source_ids),
    }];
  });

  if (schemaVersion >= 2 && !Array.isArray(meta.relationships)) {
    issues.push({
      severity: 'error',
      code: 'MISSING_V2_RELATIONSHIPS',
      signalId,
      message: `Schema-v2 signal "${signalId}" must include relationships as an array (it may be empty).`,
    });
  }
  const relationshipsRaw = Array.isArray(meta.relationships) ? meta.relationships : [];
  const relationships: SignalRelationship[] = relationshipsRaw.flatMap((item, idx) => {
    const raw = item && typeof item === 'object' && !Array.isArray(item)
      ? (item as Record<string, unknown>)
      : {};
    const targetSignalId = asString(raw.target_signal_id);
    const rawType = asString(raw.relationship_type) as SignalRelationshipType;
    const rawConfidence = asString(raw.confidence, 'unverified') as ConfidenceLevel;
    const rationale = asString(raw.rationale);
    if (!SIGNAL_ID_REGEX.test(targetSignalId) ||
        !VALID_SIGNAL_RELATIONSHIPS.includes(rawType) ||
        !VALID_CONFIDENCE.includes(rawConfidence) ||
        !rationale) {
      issues.push({
        severity: 'warning',
        code: 'INVALID_SIGNAL_RELATIONSHIP',
        signalId,
        message: `Relationship #${idx + 1} in "${signalId}" requires a valid target ID, relationship type, confidence and rationale.`,
      });
      return [];
    }
    const supportingClaimIds = asStringArray(raw.supporting_claim_ids);
    if (rawType === 'causal_link' && supportingClaimIds.length === 0) {
      issues.push({
        severity: 'warning',
        code: 'UNSUPPORTED_CAUSAL_RELATIONSHIP',
        signalId,
        message: `Causal relationship from "${signalId}" to "${targetSignalId}" has no supporting claim references.`,
      });
    }
    return [{
      target_signal_id: targetSignalId,
      relationship_type: rawType,
      confidence: rawConfidence,
      rationale,
      supporting_claim_ids: supportingClaimIds,
    }];
  });

  // Optional additive schema-v2 visual media metadata (strictly isolated from sources & independence)
  const mediaAssets: SignalMediaAsset[] = [];
  if (meta.media_assets !== undefined) {
    if (!Array.isArray(meta.media_assets)) {
      issues.push({
        severity: 'error',
        code: 'INVALID_MEDIA_ASSETS_TYPE',
        signalId,
        message: `Signal "${signalId}" media_assets must be an array when present.`,
      });
    } else {
      const seenMediaIds = new Set<string>();
      meta.media_assets.forEach((item, idx) => {
        const raw =
          item && typeof item === 'object' && !Array.isArray(item)
            ? (item as Record<string, unknown>)
            : null;
        if (!raw) {
          issues.push({
            severity: 'error',
            code: 'INVALID_MEDIA_ASSET_OBJECT',
            signalId,
            message: `Media asset #${idx + 1} in "${signalId}" must be a structured YAML object.`,
          });
          return;
        }

        const mediaId = asString(raw.media_id);
        const label = mediaId || `#${idx + 1}`;
        let hasError = false;

        if (!mediaId) {
          hasError = true;
          issues.push({
            severity: 'error',
            code: 'MISSING_MEDIA_ID',
            signalId,
            message: `Media asset #${idx + 1} in "${signalId}" is missing a non-empty media_id.`,
          });
        } else if (seenMediaIds.has(mediaId)) {
          hasError = true;
          issues.push({
            severity: 'error',
            code: 'DUPLICATE_MEDIA_ID',
            signalId,
            message: `Duplicate media_id "${mediaId}" in signal "${signalId}".`,
          });
        } else {
          seenMediaIds.add(mediaId);
        }

        const rawMediaType = asString(raw.media_type) as MediaAssetType;
        if (!VALID_MEDIA_TYPES.includes(rawMediaType)) {
          hasError = true;
          issues.push({
            severity: 'error',
            code: 'INVALID_MEDIA_TYPE',
            signalId,
            message: `Media asset "${label}" in "${signalId}" has unsupported media_type "${rawMediaType || '(empty)'}".`,
          });
        }

        const rawPlacement = asString(raw.placement) as MediaPlacement;
        if (!VALID_MEDIA_PLACEMENTS.includes(rawPlacement)) {
          hasError = true;
          issues.push({
            severity: 'error',
            code: 'INVALID_MEDIA_PLACEMENT',
            signalId,
            message: `Media asset "${label}" in "${signalId}" has unsupported placement "${rawPlacement || '(empty)'}".`,
          });
        }

        const rawRel = asString(raw.relationship_to_signal) as MediaSignalRelationship;
        if (!VALID_MEDIA_RELATIONSHIPS.includes(rawRel)) {
          hasError = true;
          issues.push({
            severity: 'error',
            code: 'INVALID_MEDIA_RELATIONSHIP',
            signalId,
            message: `Media asset "${label}" in "${signalId}" has unsupported relationship_to_signal "${rawRel || '(empty)'}".`,
          });
        }

        const assetUrl = asString(raw.asset_url);
        if (!isSafeHttpsUrl(assetUrl)) {
          hasError = true;
          issues.push({
            severity: 'error',
            code: 'INVALID_MEDIA_ASSET_URL',
            signalId,
            message: `Media asset "${label}" in "${signalId}" requires a valid HTTPS asset_url.`,
          });
        }

        const sourcePageUrl = asString(raw.source_page_url);
        if (!isSafeHttpsUrl(sourcePageUrl)) {
          hasError = true;
          issues.push({
            severity: 'error',
            code: 'INVALID_MEDIA_SOURCE_PAGE_URL',
            signalId,
            message: `Media asset "${label}" in "${signalId}" requires a valid HTTPS source_page_url.`,
          });
        }

        const title = asString(raw.title);
        const caption = asString(raw.caption);
        const altText = asString(raw.alt_text);
        const creator = asString(raw.creator);
        const creditLine = asString(raw.credit_line);

        if (!caption || !altText) {
          hasError = true;
          issues.push({
            severity: 'error',
            code: 'MISSING_MEDIA_TEXT',
            signalId,
            message: `Media asset "${label}" in "${signalId}" requires non-empty plain-text caption and alt_text.`,
          });
        }

        if (!creator || !creditLine) {
          hasError = true;
          issues.push({
            severity: 'error',
            code: 'MISSING_MEDIA_ATTRIBUTION',
            signalId,
            message: `Media asset "${label}" in "${signalId}" requires non-empty creator and credit_line.`,
          });
        }

        const rawDepictedAt = asString(raw.depicted_at);
        let depictedAt: string | undefined;
        if (rawDepictedAt) {
          if (isValidDateOrDateTime(rawDepictedAt)) {
            depictedAt = rawDepictedAt;
          } else {
            issues.push({
              severity: 'warning',
              code: 'INVALID_MEDIA_DEPICTED_AT',
              signalId,
              message: `Media asset "${label}" in "${signalId}" has invalid depicted_at "${rawDepictedAt}".`,
            });
          }
        }

        const depictedLocation = asString(raw.depicted_location) || undefined;

        const rightsRaw =
          raw.rights && typeof raw.rights === 'object' && !Array.isArray(raw.rights)
            ? (raw.rights as Record<string, unknown>)
            : null;
        if (!rightsRaw) {
          hasError = true;
          issues.push({
            severity: 'error',
            code: 'MISSING_MEDIA_RIGHTS',
            signalId,
            message: `Media asset "${label}" in "${signalId}" is missing its rights object.`,
          });
        }

        const rawBasis = asString(rightsRaw?.basis) as MediaRightsBasis;
        const licenseName = asString(rightsRaw?.license_name);
        const licenseUrl = asString(rightsRaw?.license_url);
        const rightsHolder = asString(rightsRaw?.rights_holder);
        const verifiedAt = asString(rightsRaw?.verified_at);
        const publicWebDisplayAllowed = rightsRaw?.public_web_display_allowed;
        const cropAllowed = rightsRaw?.crop_allowed;

        if (rightsRaw) {
          if (!VALID_MEDIA_RIGHTS_BASES.includes(rawBasis)) {
            hasError = true;
            issues.push({
              severity: 'error',
              code: 'INVALID_MEDIA_RIGHTS_BASIS',
              signalId,
              message: `Media asset "${label}" in "${signalId}" has unsupported rights.basis "${rawBasis || '(empty)'}".`,
            });
          }

          if (!licenseName) {
            hasError = true;
            issues.push({
              severity: 'error',
              code: 'MISSING_MEDIA_LICENSE_NAME',
              signalId,
              message: `Media asset "${label}" in "${signalId}" requires a non-empty rights.license_name.`,
            });
          }

          if (rawBasis === 'public_domain') {
            if (licenseUrl && !isSafeHttpsUrl(licenseUrl)) {
              hasError = true;
              issues.push({
                severity: 'error',
                code: 'INVALID_MEDIA_LICENSE_URL',
                signalId,
                message: `Media asset "${label}" in "${signalId}" has a non-HTTPS rights.license_url.`,
              });
            } else if (!licenseUrl) {
              issues.push({
                severity: 'warning',
                code: 'MISSING_PUBLIC_DOMAIN_POLICY_URL',
                signalId,
                message: `Public-domain media asset "${label}" in "${signalId}" should include a rights-policy HTTPS license_url documenting jurisdiction.`,
              });
            }
          } else if (!isSafeHttpsUrl(licenseUrl)) {
            hasError = true;
            issues.push({
              severity: 'error',
              code: 'MISSING_MEDIA_LICENSE_URL',
              signalId,
              message: `Media asset "${label}" in "${signalId}" requires a valid HTTPS rights.license_url for basis "${rawBasis || '(unknown)'}".`,
            });
          }

          if (!isValidIsoTimestamp(verifiedAt)) {
            hasError = true;
            issues.push({
              severity: 'error',
              code: 'INVALID_MEDIA_VERIFIED_AT',
              signalId,
              message: `Media asset "${label}" in "${signalId}" requires a valid ISO 8601 rights.verified_at timestamp.`,
            });
          }

          if (publicWebDisplayAllowed !== true) {
            hasError = true;
            issues.push({
              severity: 'error',
              code: 'MEDIA_DISPLAY_NOT_ALLOWED',
              signalId,
              message: `Media asset "${label}" in "${signalId}" does not have rights.public_web_display_allowed set to true.`,
            });
          }

          if (typeof cropAllowed !== 'boolean') {
            hasError = true;
            issues.push({
              severity: 'error',
              code: 'INVALID_MEDIA_CROP_ALLOWED',
              signalId,
              message: `Media asset "${label}" in "${signalId}" must declare rights.crop_allowed as a boolean.`,
            });
          }
        }

        const verificationRaw =
          raw.verification &&
          typeof raw.verification === 'object' &&
          !Array.isArray(raw.verification)
            ? (raw.verification as Record<string, unknown>)
            : null;

        const sourcePageChecked = verificationRaw?.source_page_checked === true;
        const directAssetChecked = verificationRaw?.direct_asset_checked === true;
        const visualContentChecked = verificationRaw?.visual_content_checked === true;
        const captionContextChecked = verificationRaw?.caption_context_checked === true;

        if (
          !verificationRaw ||
          !sourcePageChecked ||
          !directAssetChecked ||
          !visualContentChecked ||
          !captionContextChecked
        ) {
          hasError = true;
          issues.push({
            severity: 'error',
            code: 'UNVERIFIED_MEDIA_ASSET',
            signalId,
            message: `Media asset "${label}" in "${signalId}" must confirm all four verification flags (source_page_checked, direct_asset_checked, visual_content_checked, caption_context_checked).`,
          });
        }

        if (!hasError) {
          mediaAssets.push({
            media_id: mediaId,
            media_type: rawMediaType,
            placement: rawPlacement,
            relationship_to_signal: rawRel,
            asset_url: assetUrl,
            source_page_url: sourcePageUrl,
            title: title || caption,
            caption,
            alt_text: altText,
            creator,
            credit_line: creditLine,
            depicted_at: depictedAt,
            depicted_location: depictedLocation,
            rights: {
              basis: rawBasis,
              license_name: licenseName,
              license_url: licenseUrl,
              rights_holder: rightsHolder || creator,
              verified_at: verifiedAt,
              public_web_display_allowed: true,
              crop_allowed: cropAllowed as boolean,
            },
            verification: {
              source_page_checked: true,
              direct_asset_checked: true,
              visual_content_checked: true,
              caption_context_checked: true,
            },
            isApprovedForDisplay: true,
          });
        }
      });
    }
  }

  const sourcesRaw = Array.isArray(meta.sources) ? meta.sources : [];
  const sources: SignalSource[] = sourcesRaw.map((item, idx) => {
    const s = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>;
    const sourceId = asString(s.source_id, `S${idx + 1}`);
    const rawUrl = asString(s.url);
    const urlSafe = isSafeHttpUrl(rawUrl);
    if (rawUrl && !urlSafe) {
      issues.push({
        severity: 'error',
        code: 'UNSAFE_SOURCE_URL',
        signalId,
        message: `Source "${sourceId}" in "${signalId}" has a blocked or invalid URL protocol.`,
      });
    }

    // CRITICAL DATA INTEGRITY RULE:
    // Never silently default invalid/missing source_class to 'tier_1_newsroom'
    // or invalid/missing relationship to 'original_reporting'.
    const rawClass = asString(s.source_class);
    let sourceClass: SourceClass = 'unknown';
    if ((VALID_SOURCE_CLASSES as readonly string[]).includes(rawClass)) {
      sourceClass = rawClass as SourceClass;
    } else {
      issues.push({
        severity: 'warning',
        code: 'INVALID_SOURCE_CLASS',
        signalId,
        message: `Source "${sourceId}" in "${signalId}" has missing or unknown source_class "${rawClass || '(empty)'}"; classified as "unknown" and excluded from independent newsroom counts.`,
      });
    }

    const rawRel = asString(s.relationship);
    let relationship: SourceRelationship = 'unknown';
    if ((VALID_RELATIONSHIPS as readonly string[]).includes(rawRel)) {
      relationship = rawRel as SourceRelationship;
    } else {
      issues.push({
        severity: 'warning',
        code: 'INVALID_SOURCE_RELATIONSHIP',
        signalId,
        message: `Source "${sourceId}" in "${signalId}" has missing or unknown relationship "${rawRel || '(empty)'}"; classified as "unknown" and excluded from independent newsroom counts.`,
      });
    }

    const countFlag = s.count_as_independent === true;
    const independenceGroup = asString(s.independence_group);
    const exclusionReason = getIndependenceExclusionReason({
      count_as_independent: countFlag,
      independence_group: independenceGroup,
      source_class: sourceClass,
      relationship,
    });

    // Surface inconsistency warning if YAML says count_as_independent: true on a disallowed record
    if (countFlag && exclusionReason !== null) {
      issues.push({
        severity: 'warning',
        code: 'INDEPENDENCE_POLICY_OVERRIDE',
        signalId,
        message: `Source "${sourceId}" in "${signalId}" sets count_as_independent: true, but is excluded under Source Policy (${exclusionReason}).`,
      });
    }

    return {
      source_id: sourceId,
      outlet: asString(s.outlet, 'Unknown outlet'),
      title: asString(s.title, 'Untitled source'),
      url: rawUrl,
      urlSafe,
      published_at: asString(s.published_at),
      accessed_at: asString(s.accessed_at),
      source_class: sourceClass,
      rawSourceClass: rawClass || undefined,
      registry_id: asString(s.registry_id),
      independence_group: independenceGroup,
      relationship,
      rawRelationship: rawRel || undefined,
      count_as_independent: countFlag,
      qualifiesAsIndependent: exclusionReason === null,
      exclusionReason: exclusionReason ?? undefined,
      supports_claim_ids: asStringArray(s.supports_claim_ids),
    };
  });

  const sourceIdSet = new Set(sources.map((s) => s.source_id));

  const claimsRaw = Array.isArray(meta.claims) ? meta.claims : [];
  const claims: SignalClaim[] = claimsRaw.map((item, idx) => {
    const c = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>;
    const claimId = asString(c.claim_id, `${signalId}-C${String(idx + 1).padStart(2, '0')}`);
    const rawClaimStatus = asString(c.status, 'reported') as ClaimStatus;
    const rawClaimConf = asString(c.confidence, 'medium') as ConfidenceLevel;
    const claimSources = asStringArray(c.source_ids);

    if (!VALID_CLAIM_STATUS.includes(rawClaimStatus)) {
      issues.push({
        severity: 'warning',
        code: 'INVALID_CLAIM_STATUS',
        signalId,
        message: `Claim "${claimId}" has unknown status "${rawClaimStatus}".`,
      });
    }
    if (!VALID_CONFIDENCE.includes(rawClaimConf)) {
      issues.push({
        severity: 'warning',
        code: 'INVALID_CLAIM_CONFIDENCE',
        signalId,
        message: `Claim "${claimId}" has unknown confidence "${rawClaimConf}".`,
      });
    }

    for (const refId of claimSources) {
      if (!sourceIdSet.has(refId)) {
        issues.push({
          severity: 'error',
          code: 'BROKEN_SOURCE_REF',
          signalId,
          message: `Claim "${claimId}" references unknown source_id "${refId}".`,
        });
      }
    }

    return {
      claim_id: claimId,
      statement: asString(c.statement),
      status: VALID_CLAIM_STATUS.includes(rawClaimStatus) ? rawClaimStatus : 'reported',
      confidence: VALID_CONFIDENCE.includes(rawClaimConf) ? rawClaimConf : 'medium',
      source_ids: claimSources,
    };
  });

  // Validate additive timeline and relationship references against this signal's ledgers.
  const claimIdSet = new Set(claims.map((c) => c.claim_id));
  for (const timelineEvent of timelineEvents) {
    for (const claimId of timelineEvent.claim_ids) {
      if (!claimIdSet.has(claimId)) {
        issues.push({
          severity: 'warning',
          code: 'BROKEN_TIMELINE_CLAIM_REF',
          signalId,
          message: `Timeline event "${timelineEvent.event_id}" references unknown claim_id "${claimId}".`,
        });
      }
    }
    for (const sourceId of timelineEvent.source_ids) {
      if (!sourceIdSet.has(sourceId)) {
        issues.push({
          severity: 'warning',
          code: 'BROKEN_TIMELINE_SOURCE_REF',
          signalId,
          message: `Timeline event "${timelineEvent.event_id}" references unknown source_id "${sourceId}".`,
        });
      }
    }
  }
  for (const relationship of relationships) {
    for (const claimId of relationship.supporting_claim_ids) {
      if (!claimIdSet.has(claimId)) {
        issues.push({
          severity: 'warning',
          code: 'BROKEN_RELATIONSHIP_CLAIM_REF',
          signalId,
          message: `Relationship to "${relationship.target_signal_id}" references unknown claim_id "${claimId}".`,
        });
      }
    }
  }

  // Check reverse links: source.supports_claim_ids -> claims
  for (const src of sources) {
    for (const supportedClaimId of src.supports_claim_ids) {
      if (!claimIdSet.has(supportedClaimId)) {
        issues.push({
          severity: 'warning',
          code: 'BROKEN_CLAIM_REF',
          signalId,
          message: `Source "${src.source_id}" in "${signalId}" references unknown claim_id "${supportedClaimId}".`,
        });
      }
    }
  }

  // Authoritative independence calculation for this signal
  const independence = calculateSourceIndependence(
    sources.map((src) => ({ ...src, signal_id: signalId }))
  );

  // Parse H3 narrative subsections via AST splitter
  const { blocks: h3Blocks } = splitByHeadingLevel(remainder, 3);
  const sections: SignalNarrativeSections = {
    whatHappened: '',
    verifiedFacts: '',
    timeline: '',
    timelineEntries: [],
    whyItMatters: '',
    sourcePerspectives: '',
    analysis: '',
    horizonImpacts: [],
    uncertainties: '',
    scenarios: '',
    scenarioItems: [],
    whatToWatch: '',
    extraSections: [],
  };

  for (const sub of h3Blocks) {
    const normalized = sub.title.toLowerCase();
    if (normalized === 'what happened') sections.whatHappened = sub.content;
    else if (normalized === 'verified facts') sections.verifiedFacts = sub.content;
    else if (normalized === 'timeline') {
      sections.timeline = sub.content;
      sections.timelineEntries = parseTimelineEntries(sub.content);
    } else if (normalized === 'why it matters') sections.whyItMatters = sub.content;
    else if (normalized === 'source perspectives') sections.sourcePerspectives = sub.content;
    else if (normalized === 'analysis') {
      sections.analysis = sub.content;
      sections.horizonImpacts = extractHorizonImpacts(sub.content);
    } else if (normalized === 'uncertainties') sections.uncertainties = sub.content;
    else if (normalized === 'scenarios') {
      sections.scenarios = sub.content;
      sections.scenarioItems = parseScenarioItems(sub.content);
    } else if (normalized === 'personal relevance') sections.personalRelevance = sub.content;
    else if (normalized === 'what to watch') sections.whatToWatch = sub.content;
    else sections.extraSections.push({ heading: sub.title, content: sub.content });
  }

  return {
    signal_id: signalId,
    headline,
    domain,
    topic: asString(meta.topic, 'general'),
    importance: clampedImportance,
    status,
    confidence: {
      overall: overallConfidence,
      rationale: asString(confObj.rationale),
    },
    event: {
      start_date: asString(eventObj.start_date),
      end_date: asString(eventObj.end_date) || undefined,
      geography: asStringArray(eventObj.geography),
    },
    published_at: asString(meta.published_at),
    first_verified_at: asString(meta.first_verified_at),
    updated_at: asString(meta.updated_at),
    tags: asStringArray(meta.tags),
    related_signal_ids: asStringArray(meta.related_signal_ids),
    continuity,
    update,
    timelineEvents,
    relationships,
    mediaAssets,
    claims,
    sources,
    independence,
    independentOriginCount: independence.independentOriginCount,
    independentGroups: independence.independentGroups.map((g) => g.group),
    sections,
    rawNarrative: remainder,
    orderIndex,
  };
}

function parseExecutiveBriefing(rawMarkdown: string): {
  summaryText: string;
  caveats: string[];
  topSignalRefs: TopSignalRef[];
  rawMarkdown: string;
} {
  const tree = markdownProcessor.parse(rawMarkdown) as Root;
  let summaryText = '';
  const caveats: string[] = [];

  for (const node of tree.children) {
    if (node.type === 'blockquote') {
      const text = mdastToString(node as Blockquote).trim();
      if (!text) continue;
      if (/^Edition summary\s*:/i.test(text)) {
        summaryText = text.replace(/^Edition summary\s*:\s*/i, '').trim();
      } else if (!summaryText && !/(局限|limitation|caveat|note before reading)/i.test(text)) {
        summaryText = text;
      } else {
        caveats.push(
          text.replace(/^(?:阅读本期前须知的局限|Limitations|Caveats)\s*[：:]\s*/i, '').trim()
        );
      }
    }
  }

  const topSignalRefs: TopSignalRef[] = [];
  for (const line of rawMarkdown.split(/\r?\n/)) {
    const match = line.match(
      /^\s*[-*]\s+\*\*\[?((?:WORLD|AI|ECON)-[A-Za-z0-9-]+|[A-Z0-9-]+)\]?\*\*\s*(?:—|--|–|-|:)\s*(.+)$/
    );
    if (match) {
      topSignalRefs.push({
        signal_id: match[1].trim(),
        summary: match[2].trim(),
      });
    }
  }

  return {
    summaryText,
    caveats,
    topSignalRefs,
    rawMarkdown,
  };
}

function parseCrossDomainSynthesis(rawMarkdown: string): {
  intro: string;
  threads: SynthesisThread[];
  rawMarkdown: string;
} {
  const { preamble, blocks } = splitByHeadingLevel(rawMarkdown, 2);
  const threads: SynthesisThread[] = blocks.map((block) => {
    const matches = block.content.match(INLINE_SIGNAL_ID_GLOBAL) ?? [];
    const linkedSignalIds = Array.from(new Set(matches));
    const lowerTitle = block.title.toLowerCase();
    const isUnestablished =
      lowerTitle.includes('unestablished') ||
      lowerTitle.includes('not established') ||
      block.title.includes('未建立');
    return {
      title: block.title,
      linkedSignalIds,
      content: block.content,
      isUnestablished,
    };
  });

  return {
    intro: preamble,
    threads,
    rawMarkdown,
  };
}

function parsePersonalImplications(rawMarkdown: string): {
  disclaimer: string;
  sections: PersonalSection[];
  rawMarkdown: string;
} {
  const { preamble, blocks } = splitByHeadingLevel(rawMarkdown, 2);
  const tree = markdownProcessor.parse(preamble) as Root;
  const quoteParts: string[] = [];
  for (const node of tree.children) {
    if (node.type === 'blockquote') {
      const txt = mdastToString(node as Blockquote).trim();
      if (txt) quoteParts.push(txt);
    }
  }
  const disclaimer = quoteParts.join(' ').trim() || preamble.replace(/^>\s*/gm, '').trim();

  const sections: PersonalSection[] = blocks.map((block) => ({
    title: block.title,
    content: block.content,
  }));

  return {
    disclaimer,
    sections,
    rawMarkdown,
  };
}

function parseWatchlistTable(rawMarkdown: string): WatchlistRow[] {
  const tree = markdownProcessor.parse(rawMarkdown) as Root;
  const rows: WatchlistRow[] = [];

  for (const node of tree.children as Content[]) {
    if (node.type === 'table') {
      const tableNode = node as Table;
      // Skip header row (index 0)
      for (let i = 1; i < tableNode.children.length; i++) {
        const row = tableNode.children[i];
        const cells = row.children.map((cell) => mdastToString(cell).trim());
        if (cells.length >= 4) {
          const rawLinked = cells[3];
          // Only extract real signal IDs (ignore '—', '-', 'N/A', prose placeholders)
          const matchedIds = rawLinked.match(INLINE_SIGNAL_ID_GLOBAL) ?? [];
          const signalsLinked = Array.from(new Set(matchedIds));

          rows.push({
            indicator: cells[0],
            whyItMatters: cells[1],
            nextCheckpoint: cells[2],
            signalsLinked,
          });
        }
      }
    }
  }

  return rows;
}

function parseAuditSection(rawMarkdown: string) {
  const { blocks } = splitByHeadingLevel(rawMarkdown, 2);
  let sourceAudit = '';
  let openQuestions = '';
  let corrections = '';
  let methodologyNotes = '';

  for (const block of blocks) {
    const key = block.title.toLowerCase();
    if (key === 'source audit') sourceAudit = block.content;
    else if (key === 'open questions') openQuestions = block.content;
    else if (key === 'corrections') corrections = block.content;
    else if (key === 'methodology notes') methodologyNotes = block.content;
  }

  return {
    sourceAudit,
    openQuestions,
    corrections,
    methodologyNotes,
    rawMarkdown,
  };
}

export interface ParseEditionOptions {
  isLocalPreview?: boolean;
  expectedDate?: string;
}

export function parseEditionMarkdown(
  markdown: string,
  sourceLabel: string,
  optionsOrLocalPreview: boolean | ParseEditionOptions = false
): ParsedEdition {
  const options: ParseEditionOptions =
    typeof optionsOrLocalPreview === 'boolean'
      ? { isLocalPreview: optionsOrLocalPreview }
      : optionsOrLocalPreview;

  const isLocalPreview = options.isLocalPreview ?? false;
  const issues: ValidationIssue[] = [];
  const { frontmatter, body } = extractFrontmatter(markdown, issues, options.expectedDate);
  const { blocks: h1Blocks } = splitByHeadingLevel(body, 1);

  const sectionMap = new Map<string, string>();
  for (const block of h1Blocks) {
    sectionMap.set(block.title.trim(), block.content);
  }

  for (const requiredHeading of REQUIRED_TOP_HEADINGS) {
    if (!sectionMap.has(requiredHeading)) {
      issues.push({
        severity: 'error',
        code: 'MISSING_SECTION',
        message: `Missing required top-level section "# ${requiredHeading}".`,
      });
    }
  }

  const signals: ParsedSignal[] = [];
  const domainIntros: Record<SignalDomain, string> = {
    world: '',
    ai: '',
    economy: '',
  };

  const domainMapping: Array<{ heading: string; domain: SignalDomain }> = [
    { heading: 'World Events', domain: 'world' },
    { heading: 'AI Frontier', domain: 'ai' },
    { heading: 'Economic Outlook', domain: 'economy' },
  ];

  let orderCounter = 0;
  for (const { heading, domain } of domainMapping) {
    const content = sectionMap.get(heading) ?? '';
    const { preamble, blocks: signalBlocks } = splitByHeadingLevel(content, 2);
    domainIntros[domain] = preamble.replace(/^>\s*/gm, '').trim();
    for (const block of signalBlocks) {
      signals.push(parseSignalBlock(block.title, block.content, domain, frontmatter.schema_version, orderCounter, issues));
      orderCounter += 1;
    }
  }

  const seenIds = new Set<string>();
  for (const sig of signals) {
    if (seenIds.has(sig.signal_id)) {
      issues.push({
        severity: 'error',
        code: 'DUPLICATE_SIGNAL_ID',
        signalId: sig.signal_id,
        message: `Duplicate signal_id "${sig.signal_id}" detected in edition.`,
      });
    }
    seenIds.add(sig.signal_id);
  }

  // Validate related_signal_ids referential integrity (warnings for missing links)
  for (const sig of signals) {
    for (const relId of sig.related_signal_ids) {
      if (!seenIds.has(relId)) {
        issues.push({
          severity: 'warning',
          code: 'BROKEN_RELATED_SIGNAL_REF',
          signalId: sig.signal_id,
          message: `Signal "${sig.signal_id}" links to unknown related_signal_id "${relId}".`,
        });
      }
    }
  }

  const execRaw = sectionMap.get('Executive Briefing') ?? '';
  const executiveBriefing = parseExecutiveBriefing(execRaw);
  for (const topRef of executiveBriefing.topSignalRefs) {
    if (!seenIds.has(topRef.signal_id)) {
      issues.push({
        severity: 'warning',
        code: 'BROKEN_TOP_SIGNAL_REF',
        signalId: topRef.signal_id,
        message: `Executive Briefing Top Signals references unknown signal_id "${topRef.signal_id}".`,
      });
    }
  }

  // Edition-wide source independence computed via the single authoritative engine
  const allSourcesWithRefs: SourceWithSignalRef[] = signals.flatMap((sig) =>
    sig.sources.map((src) => ({ ...src, signal_id: sig.signal_id }))
  );
  const independenceSummary = calculateSourceIndependence(allSourcesWithRefs);

  const synthesisRaw = sectionMap.get('Cross-Domain Synthesis') ?? '';
  const personalRaw = sectionMap.get('Personal Implications') ?? '';
  const watchlistRaw = sectionMap.get('Watchlist') ?? '';
  const auditRaw = sectionMap.get('Audit & Methodology') ?? '';

  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');

  return {
    sourceLabel,
    isLocalPreview,
    frontmatter,
    executiveBriefing,
    domainIntros,
    signals,
    independenceSummary,
    crossDomainSynthesis: parseCrossDomainSynthesis(synthesisRaw),
    personalImplications: parsePersonalImplications(personalRaw),
    watchlist: {
      rows: parseWatchlistTable(watchlistRaw),
      rawMarkdown: watchlistRaw,
    },
    auditAndMethodology: parseAuditSection(auditRaw),
    validation: {
      isValid: errors.length === 0,
      errors,
      warnings,
    },
  };
}
