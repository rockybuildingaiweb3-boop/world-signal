export type ViewId = 'briefing' | 'expanded' | 'synthesis' | 'audit';
export type UiLanguage = 'zh-CN' | 'en';

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

export type SignalLifecycle =
  | 'new'
  | 'developing'
  | 'ongoing'
  | 'monitoring'
  | 'resolved'
  | 'archived';

export type SignalChangeType =
  | 'initial'
  | 'material_update'
  | 'status_change'
  | 'new_evidence'
  | 'correction'
  | 'no_material_change';

export type SignalRelationshipType =
  | 'same_event'
  | 'contextual'
  | 'policy_response'
  | 'market_transmission'
  | 'technological_dependency'
  | 'causal_link'
  | 'potential_link';

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
  | 'research_paper'
  | 'unknown';

export type SourceRelationship =
  | 'original_reporting'
  | 'syndicated'
  | 'official_statement'
  | 'company_announcement'
  | 'research_artifact'
  | 'secondary_analysis'
  | 'unknown';

export type IndependenceExclusionReason =
  | 'flagged_non_independent'
  | 'missing_independence_group'
  | 'primary_source'
  | 'research_paper'
  | 'unknown_source_class'
  | 'syndicated'
  | 'official_statement'
  | 'company_announcement'
  | 'research_artifact'
  | 'secondary_analysis'
  | 'unknown_relationship';

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
  rawSourceClass?: string;
  registry_id: string;
  independence_group: string;
  relationship: SourceRelationship;
  rawRelationship?: string;
  count_as_independent: boolean;
  qualifiesAsIndependent: boolean;
  exclusionReason?: IndependenceExclusionReason;
  supports_claim_ids: string[];
}

export interface SignalContinuity {
  /** First WORLD SIGNAL edition in which this signal ID was recorded (not the event start date). */
  first_seen_edition: string | null;
  /** Most recent known edition with a material factual, evidence, status or analytical change. */
  last_material_update: string | null;
  /** True only when every available canonical edition was checked for this signal ID. */
  history_complete: boolean;
  lifecycle: SignalLifecycle;
}

export interface SignalUpdate {
  change_type: SignalChangeType;
  summary: string;
  previous_edition?: string;
  evidence_changes: {
    added_claim_ids: string[];
    revised_claim_ids: string[];
    withdrawn_claim_ids: string[];
    added_source_urls: string[];
    removed_source_urls: string[];
  };
}

export interface SignalTimelineEvent {
  event_id: string;
  occurred_at: string;
  title: string;
  summary: string;
  claim_ids: string[];
  source_ids: string[];
}

export interface SignalRelationship {
  target_signal_id: string;
  relationship_type: SignalRelationshipType;
  confidence: ConfidenceLevel;
  rationale: string;
  supporting_claim_ids: string[];
}

export interface TimelineEntry {
  dateLabel: string | null;
  text: string;
}

export interface ScenarioItem {
  kind: 'base' | 'downside' | 'upside' | 'other';
  label: string;
  condition?: string;
  body: string;
}

export interface HorizonImpact {
  horizon: 'immediate' | 'near_term' | 'medium_term' | 'structural';
  label: string;
  text: string;
}

export interface SignalNarrativeSections {
  whatHappened: string;
  verifiedFacts: string;
  timeline: string;
  timelineEntries: TimelineEntry[];
  whyItMatters: string;
  sourcePerspectives: string;
  analysis: string;
  horizonImpacts: HorizonImpact[];
  uncertainties: string;
  scenarios: string;
  scenarioItems: ScenarioItem[];
  personalRelevance?: string;
  whatToWatch: string;
  extraSections: Array<{ heading: string; content: string }>;
}

export interface IndependentOriginGroup {
  group: string;
  outlets: string[];
  recordCount: number;
  signalIds: string[];
  sourceClasses: SourceClass[];
  relationships: SourceRelationship[];
}

export interface OriginGroupAuditRecord {
  group: string;
  isUnassignedGroup: boolean;
  qualifiesAny: boolean;
  qualifyingRecordCount: number;
  excludedRecordCount: number;
  totalRecordCount: number;
  outlets: string[];
  signalIds: string[];
  sourceClasses: SourceClass[];
  relationships: SourceRelationship[];
  exclusionReasons: IndependenceExclusionReason[];
}

export interface SourceIndependenceMetrics {
  totalRecords: number;
  independentOriginCount: number;
  independentGroups: IndependentOriginGroup[];
  allOriginGroups: OriginGroupAuditRecord[];
  qualifyingRecords: number;
  excludedRecords: number;
  tier1Records: number;
  specialistRecords: number;
  primarySourceRecords: number;
  researchPaperRecords: number;
  unknownClassRecords: number;
  syndicatedRecords: number;
  unregisteredRecords: number;
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
  /** Optional additive fields introduced by the schema-v2 intelligence contract. */
  continuity?: SignalContinuity;
  update?: SignalUpdate;
  timelineEvents: SignalTimelineEvent[];
  relationships: SignalRelationship[];
  claims: SignalClaim[];
  sources: SignalSource[];
  independence: SourceIndependenceMetrics;
  independentOriginCount: number;
  independentGroups: string[];
  sections: SignalNarrativeSections;
  rawNarrative: string;
  orderIndex: number;
}

export interface TopSignalRef {
  signal_id: string;
  summary: string;
}

export interface SynthesisThread {
  title: string;
  linkedSignalIds: string[];
  content: string;
  isUnestablished: boolean;
}

export interface PersonalSection {
  title: string;
  content: string;
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
    caveats: string[];
    topSignalRefs: TopSignalRef[];
    rawMarkdown: string;
  };
  domainIntros: Record<SignalDomain, string>;
  signals: ParsedSignal[];
  independenceSummary: SourceIndependenceMetrics;
  crossDomainSynthesis: {
    intro: string;
    threads: SynthesisThread[];
    rawMarkdown: string;
  };
  personalImplications: {
    disclaimer: string;
    sections: PersonalSection[];
    rawMarkdown: string;
  };
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
  topic: string;
  tag: string;
  sourceClass: SourceClass | 'all';
}
