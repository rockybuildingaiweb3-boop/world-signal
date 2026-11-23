export type ViewId = 'briefing' | 'expanded' | 'synthesis' | 'audit';

export type EditionStatus = 'draft' | 'reviewed' | 'published';
export type SyncRun = 'morning' | 'midday' | 'evening' | 'manual';

export type SignalDomain = 'world' | 'ai' | 'economy';
export type SignalStatus =
  | 'new'
  | 'developing'
  | 'ongoing'
  | 'confirmed'
  | 'disputed'
  | 'unverified'
  | 'closed'
  | 'corrected';

export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'unverified';

export type ClaimStatus =
  | 'confirmed'
  | 'reported'
  | 'official_claim'
  | 'disputed'
  | 'unverified';

export type SourceClass =
  | 'tier_1_newsroom'
  | 'specialist_publication'
  | 'primary_source'
  | 'research_paper';

export type SourceRelationship =
  | 'original_reporting'
  | 'syndicated'
  | 'official_statement'
  | 'company_announcement'
  | 'research_artifact'
  | 'secondary_analysis';

export interface EditionIndexEntry {
  date: string;
  title: string;
  path: string;
  updated_at: string;
  status: EditionStatus;
  language: string;
  summary: string;
}

export interface EditionsIndex {
  schema_version: number;
  latest_edition: string | null;
  generated_at: string;
  editions: EditionIndexEntry[];
}

export interface EditionFrontmatter {
  schema_version: number;
  edition_date: string;
  edition_timezone: string;
  edition_title: string;
  edition_status: EditionStatus;
  content_language: string;
  generated_at: string;
  updated_at: string;
  sync_run: SyncRun | string;
  coverage_window_start: string;
  coverage_window_end: string;
  summary: string;
}

export interface SignalClaim {
  claim_id: string;
  statement: string;
  status: ClaimStatus;
  confidence: ConfidenceLevel;
  source_ids: string[];
}

export interface SignalSource {
  source_id: string;
  outlet: string;
  title: string;
  url: string;
  urlSafe: boolean;
  published_at: string;
  accessed_at: string;
  source_class: SourceClass;
  registry_id: string;
  independence_group: string;
  relationship: SourceRelationship;
  count_as_independent: boolean;
  supports_claim_ids: string[];
}

export interface SignalNarrativeSections {
  whatHappened: string;
  verifiedFacts: string;
  timeline: string;
  whyItMatters: string;
  sourcePerspectives: string;
  analysis: string;
  uncertainties: string;
  scenarios: string;
  personalRelevance?: string;
  whatToWatch: string;
  extraSections: Array<{ heading: string; content: string }>;
}

export interface ParsedSignal {
  signal_id: string;
  headline: string;
  domain: SignalDomain;
  topic: string;
  importance: 1 | 2 | 3 | 4 | 5;
  status: SignalStatus;
  confidence: {
    overall: ConfidenceLevel;
    rationale: string;
  };
  event: {
    start_date: string;
    end_date?: string;
    geography: string[];
  };
  published_at: string;
  first_verified_at: string;
  updated_at: string;
  tags: string[];
  related_signal_ids: string[];
  claims: SignalClaim[];
  sources: SignalSource[];
  independentOriginCount: number;
  independentGroups: string[];
  sections: SignalNarrativeSections;
  rawNarrative: string;
}

export interface TopSignalRef {
  signal_id: string;
  summary: string;
}

export interface WatchlistRow {
  indicator: string;
  whyItMatters: string;
  nextCheckpoint: string;
  signalsLinked: string[];
}

export interface ValidationIssue {
  severity: 'error' | 'warning';
  code: string;
  message: string;
  signalId?: string;
}

export interface ValidationReport {
  isValid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

export interface ParsedEdition {
  sourceLabel: string;
  isLocalPreview: boolean;
  frontmatter: EditionFrontmatter;
  executiveBriefing: {
    summaryText: string;
    topSignalRefs: TopSignalRef[];
    rawMarkdown: string;
  };
  domainIntros: Record<SignalDomain, string>;
  signals: ParsedSignal[];
  crossDomainSynthesis: string;
  personalImplications: string;
  watchlist: {
    rows: WatchlistRow[];
    rawMarkdown: string;
  };
  auditAndMethodology: {
    sourceAudit: string;
    openQuestions: string;
    corrections: string;
    methodologyNotes: string;
    rawMarkdown: string;
  };
  validation: ValidationReport;
}

export interface SignalFilters {
  query: string;
  domain: SignalDomain | 'all';
  minImportance: number;
  confidence: ConfidenceLevel | 'all';
  status: SignalStatus | 'all';
  tag: string;
  sourceClass: SourceClass | 'all';
}
