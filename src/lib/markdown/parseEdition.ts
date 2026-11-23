import yaml from 'js-yaml';
import type {
  ClaimStatus,
  ConfidenceLevel,
  EditionFrontmatter,
  EditionStatus,
  ParsedEdition,
  ParsedSignal,
  SignalClaim,
  SignalDomain,
  SignalNarrativeSections,
  SignalSource,
  SignalStatus,
  SourceClass,
  SourceRelationship,
  TopSignalRef,
  ValidationIssue,
  WatchlistRow,
} from '../../types/edition';

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
const VALID_SOURCE_CLASSES: readonly SourceClass[] = [
  'tier_1_newsroom',
  'specialist_publication',
  'primary_source',
  'research_paper',
];
const VALID_RELATIONSHIPS: readonly SourceRelationship[] = [
  'original_reporting',
  'syndicated',
  'official_statement',
  'company_announcement',
  'research_artifact',
  'secondary_analysis',
];
const VALID_EDITION_STATUSES: readonly EditionStatus[] = ['draft', 'reviewed', 'published'];

export function isSafeHttpUrl(rawUrl: string): boolean {
  if (!rawUrl || typeof rawUrl !== 'string') return false;
  try {
    const parsed = new URL(rawUrl.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
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
  issues: ValidationIssue[]
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
        edition_date: 'Unknown',
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
    const loaded = yaml.load(match[1]);
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
      edition_date: editionDate || 'Unknown',
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
 * Splits markdown by headings at a specific level while respecting fenced code blocks
 * so `#` inside YAML or code fences never split sections.
 */
function splitByHeadingLevel(markdown: string, level: 1 | 2 | 3): { preamble: string; blocks: HeadingBlock[] } {
  const lines = markdown.split(/\r?\n/);
  const blocks: HeadingBlock[] = [];
  const preambleLines: string[] = [];
  let currentTitle: string | null = null;
  let currentLines: string[] = [];
  let activeFence: { char: '`' | '~'; length: number } | null = null;

  const prefix = '#'.repeat(level) + ' ';

  for (const line of lines) {
    const fenceMatch = line.match(/^(`{3,}|~{3,})(.*)$/);
    if (fenceMatch) {
      const char = fenceMatch[1][0] as '`' | '~';
      const len = fenceMatch[1].length;
      if (!activeFence) {
        activeFence = { char, length: len };
      } else if (activeFence.char === char && len >= activeFence.length && fenceMatch[2].trim() === '') {
        activeFence = null;
      }
    }

    if (!activeFence && line.startsWith(prefix)) {
      if (currentTitle === null) {
        // Done with preamble
      } else {
        blocks.push({ title: currentTitle, content: currentLines.join('\n').trim() });
      }
      currentTitle = line.slice(prefix.length).trim();
      currentLines = [];
      continue;
    }

    if (currentTitle === null) {
      preambleLines.push(line);
    } else {
      currentLines.push(line);
    }
  }

  if (currentTitle !== null) {
    blocks.push({ title: currentTitle, content: currentLines.join('\n').trim() });
  }

  return {
    preamble: preambleLines.join('\n').trim(),
    blocks,
  };
}

function extractFirstYamlFence(blockContent: string): { yamlText: string | null; remainder: string } {
  const regex = /(?:^|\r?\n)(`{3,}|~{3,})yaml\s*\r?\n([\s\S]*?)\r?\n\1(?:\r?\n|$)/i;
  const match = blockContent.match(regex);
  if (!match || match.index === undefined) {
    return { yamlText: null, remainder: blockContent };
  }

  const before = blockContent.slice(0, match.index).trim();
  const after = blockContent.slice(match.index + match[0].length).trim();
  const remainder = [before, after].filter(Boolean).join('\n\n');

  return {
    yamlText: match[2],
    remainder,
  };
}

function parseSignalBlock(
  headingTitle: string,
  blockContent: string,
  expectedDomain: SignalDomain,
  issues: ValidationIssue[]
): ParsedSignal {
  const headingMatch = headingTitle.match(/^((?:WORLD|AI|ECON)-[A-Za-z0-9-]+|[A-Z0-9-]+)\s*(?:—|--|-|:)\s*(.+)$/);
  const fallbackId = headingMatch ? headingMatch[1].trim() : headingTitle.split(/\s+/)[0] || 'UNKNOWN-SIGNAL';
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
      const loaded = yaml.load(yamlText);
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
  const rawDomain = asString(meta.domain, expectedDomain) as SignalDomain;
  const domain = VALID_DOMAINS.includes(rawDomain) ? rawDomain : expectedDomain;
  if (!VALID_DOMAINS.includes(rawDomain)) {
    issues.push({
      severity: 'warning',
      code: 'INVALID_SIGNAL_DOMAIN',
      signalId,
      message: `Signal "${signalId}" has unexpected domain "${rawDomain}"; defaulting to "${expectedDomain}".`,
    });
  }

  const rawImportance = Number(meta.importance ?? 3);
  const clampedImportance = Math.min(5, Math.max(1, Math.round(Number.isFinite(rawImportance) ? rawImportance : 3))) as
    | 1
    | 2
    | 3
    | 4
    | 5;
  if (!Number.isInteger(rawImportance) || rawImportance < 1 || rawImportance > 5) {
    issues.push({
      severity: 'warning',
      code: 'INVALID_IMPORTANCE',
      signalId,
      message: `Signal "${signalId}" importance "${meta.importance}" should be an integer 1–5.`,
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

    const rawClass = asString(s.source_class, 'tier_1_newsroom') as SourceClass;
    const sourceClass = VALID_SOURCE_CLASSES.includes(rawClass) ? rawClass : 'tier_1_newsroom';

    const rawRel = asString(s.relationship, 'original_reporting') as SourceRelationship;
    const relationship = VALID_RELATIONSHIPS.includes(rawRel) ? rawRel : 'original_reporting';

    return {
      source_id: sourceId,
      outlet: asString(s.outlet, 'Unknown outlet'),
      title: asString(s.title, 'Untitled source'),
      url: rawUrl,
      urlSafe,
      published_at: asString(s.published_at),
      accessed_at: asString(s.accessed_at),
      source_class: sourceClass,
      registry_id: asString(s.registry_id),
      independence_group: asString(s.independence_group),
      relationship,
      count_as_independent: Boolean(s.count_as_independent),
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

  const independentGroups = Array.from(
    new Set(
      sources
        .filter((s) => s.count_as_independent && s.independence_group)
        .map((s) => s.independence_group)
    )
  );

  // Parse H3 narrative subsections
  const { blocks: h3Blocks } = splitByHeadingLevel(remainder, 3);
  const sections: SignalNarrativeSections = {
    whatHappened: '',
    verifiedFacts: '',
    timeline: '',
    whyItMatters: '',
    sourcePerspectives: '',
    analysis: '',
    uncertainties: '',
    scenarios: '',
    whatToWatch: '',
    extraSections: [],
  };

  for (const sub of h3Blocks) {
    const normalized = sub.title.toLowerCase();
    if (normalized === 'what happened') sections.whatHappened = sub.content;
    else if (normalized === 'verified facts') sections.verifiedFacts = sub.content;
    else if (normalized === 'timeline') sections.timeline = sub.content;
    else if (normalized === 'why it matters') sections.whyItMatters = sub.content;
    else if (normalized === 'source perspectives') sections.sourcePerspectives = sub.content;
    else if (normalized === 'analysis') sections.analysis = sub.content;
    else if (normalized === 'uncertainties') sections.uncertainties = sub.content;
    else if (normalized === 'scenarios') sections.scenarios = sub.content;
    else if (normalized === 'personal relevance') sections.personalRelevance = sub.content;
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
    claims,
    sources,
    independentOriginCount: independentGroups.length,
    independentGroups,
    sections,
    rawNarrative: remainder,
  };
}

function parseExecutiveBriefing(rawMarkdown: string): {
  summaryText: string;
  topSignalRefs: TopSignalRef[];
  rawMarkdown: string;
} {
  const quoteLines = rawMarkdown
    .split(/\r?\n/)
    .filter((line) => line.trim().startsWith('>'))
    .map((line) => line.replace(/^>\s?/, '').replace(/^\*\*Edition summary:\*\*\s*/i, '').trim())
    .filter(Boolean);

  const topSignalRefs: TopSignalRef[] = [];
  for (const line of rawMarkdown.split(/\r?\n/)) {
    const match = line.match(/^\s*[-*]\s+\*\*\[?((?:WORLD|AI|ECON)-[A-Za-z0-9-]+|[A-Z0-9-]+)\]?\*\*\s*(?:—|--|-|:)\s*(.+)$/);
    if (match) {
      topSignalRefs.push({
        signal_id: match[1].trim(),
        summary: match[2].trim(),
      });
    }
  }

  return {
    summaryText: quoteLines.join(' '),
    topSignalRefs,
    rawMarkdown,
  };
}

function parseWatchlistTable(rawMarkdown: string): WatchlistRow[] {
  const lines = rawMarkdown
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.startsWith('|'));

  if (lines.length < 3) return [];

  const rows: WatchlistRow[] = [];
  for (let i = 2; i < lines.length; i++) {
    const cells = lines[i]
      .split('|')
      .slice(1, -1)
      .map((cell) => cell.trim());
    if (cells.length >= 4) {
      const linked = cells[3]
        .split(/[,;\s]+/)
        .map((id) => id.replace(/[`[\]]/g, '').trim())
        .filter(Boolean);
      rows.push({
        indicator: cells[0],
        whyItMatters: cells[1],
        nextCheckpoint: cells[2],
        signalsLinked: linked,
      });
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

export function parseEditionMarkdown(
  markdown: string,
  sourceLabel: string,
  isLocalPreview = false
): ParsedEdition {
  const issues: ValidationIssue[] = [];
  const { frontmatter, body } = extractFrontmatter(markdown, issues);
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

  for (const { heading, domain } of domainMapping) {
    const content = sectionMap.get(heading) ?? '';
    const { preamble, blocks: signalBlocks } = splitByHeadingLevel(content, 2);
    domainIntros[domain] = preamble;
    for (const block of signalBlocks) {
      signals.push(parseSignalBlock(block.title, block.content, domain, issues));
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

  const execRaw = sectionMap.get('Executive Briefing') ?? '';
  const watchlistRaw = sectionMap.get('Watchlist') ?? '';
  const auditRaw = sectionMap.get('Audit & Methodology') ?? '';

  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');

  return {
    sourceLabel,
    isLocalPreview,
    frontmatter,
    executiveBriefing: parseExecutiveBriefing(execRaw),
    domainIntros,
    signals,
    crossDomainSynthesis: sectionMap.get('Cross-Domain Synthesis') ?? '',
    personalImplications: sectionMap.get('Personal Implications') ?? '',
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
