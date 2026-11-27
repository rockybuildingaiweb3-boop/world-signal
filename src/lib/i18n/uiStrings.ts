import type {
  ClaimStatus,
  ConfidenceLevel,
  EditionStatus,
  IndependenceExclusionReason,
  MediaAssetType,
  MediaSignalRelationship,
  SignalDomain,
  SignalLifecycle,
  SignalRelationshipType,
  SignalStatus,
  SourceClass,
  SourceRelationship,
  UiLanguage,
  ViewId,
} from '../../types/edition';
import type {
  EditionChangeKind,
  SignalChangeReason,
} from '../intelligence/edition-diff/compareEditions';

export interface UiDictionary {
  brandTagline: string;
  nav: Record<ViewId, string>;
  navShort: Record<ViewId, string>;
  archive: {
    button: string;
    title: string;
    subtitle: string;
    latest: string;
    previousEdition: string;
    nextEdition: string;
    editionsCount: (count: number) => string;
    emptyArchive: string;
    refreshEdition: string;
    refreshing: string;
    refreshedNotice: string;
    appearance: string;
    lightMode: string;
    darkMode: string;
    interfaceLanguage: string;
    developerTools: string;
    developerToolsHint: string;
    loadLocalMarkdown: string;
    localPreviewActive: string;
    exitPreview: string;
    close: string;
    searchPlaceholder: string;
    noMatchingEditions: string;
    matchingCount: (shown: number, total: number) => string;
  };
  masthead: {
    editionLabel: string;
    updatedLabel: string;
    syncCycleLabel: string;
    statusLabel: string;
    coverageWindowLabel: string;
    signalsCount: (n: number) => string;
    independentOriginsCount: (n: number) => string;
    claimsCount: (n: number) => string;
    recordsCount: (n: number) => string;
    diagnosticsLink: (errors: number, warnings: number) => string;
  };
  briefing: {
    leadKicker: string;
    executiveSummaryTitle: string;
    editorialLimitationsTitle: string;
    topSignalsTitle: string;
    topSignalsNote: string;
    readDossier: string;
    domainsOverviewTitle: string;
    exploreDomain: string;
    additionalSignalsTitle: string;
    additionalSignalsSubtitle: string;
    readingPathTitle: string;
    readingPathSubtitle: string;
    openExpandedDesc: string;
    openSynthesisDesc: string;
    openAuditDesc: string;
    summaryExpand: string;
    summaryCollapse: string;
    limitationsExpand: (count: number) => string;
    limitationsCollapse: string;
    artworkCaption: string;
    artworkIllustrativeNote: string;
    artworkOriginsLabel: string;
    artworkClaimsLabel: string;
    artworkSourcesLabel: string;
    artworkTimelineMilestones: (count: number) => string;
    artworkDeclaredLinks: (count: number) => string;
    artworkOverflowNote: (displayed: number, total: number) => string;
    domainShareLabel: (pct: number) => string;
    domainBalanceTitle: string;
    domainHighPriorityCount: (count: number) => string;
    domainImp5Label: string;
    domainImp4Label: string;
    domainImpOtherLabel: string;
    mastheadDescriptor: string;
    coverPlateTitles: Record<SignalDomain, string>;
    coverPlateFolio: Record<SignalDomain, string>;
    coverEditionDeskLabel: string;
  };
  dailyDelta: {
    eyebrow: string;
    title: string;
    comparingRange: (previousDate: string, currentDate: string) => string;
    dateGapNote: (days: number, previousDate: string) => string;
    schemaTransitionNote: (prevVersion: number, currVersion: number) => string;
    loadingLabel: (previousDate: string) => string;
    categories: Record<EditionChangeKind, string>;
    categoryDescriptions: Record<EditionChangeKind, string>;
    categoryBadges: Record<EditionChangeKind, string>;
    reasons: Record<SignalChangeReason, string>;
    emptyCategory: string;
    omittedNoticeTitle: string;
    omittedNoticeBody: (previousDate: string, currentDate: string) => string;
    omittedItemExplanation: (previousDate: string, currentDate: string) => string;
    newItemExplanation: (currentDate: string, claims: number, sources: number) => string;
    unchangedItemExplanation: (previousDate: string) => string;
    updatedReasonsPrefix: string;
    evidenceToggleShow: string;
    evidenceToggleHide: string;
    evidenceSummaryClaims: (added: number, revised: number, withdrawn: number) => string;
    evidenceSummarySources: (added: number, revised: number, removed: number) => string;
    addedClaimsLabel: string;
    revisedClaimsLabel: string;
    withdrawnClaimsLabel: string;
    addedSourcesLabel: string;
    revisedSourcesLabel: string;
    removedSourcesLabel: string;
    routineMetadataNote: string;
    openCurrentDossier: string;
    openPreviousDossier: (previousDate: string) => string;
    showAllCategory: (total: number, categoryLabel: string) => string;
    showFewerCategory: string;
    unavailableTitle: string;
    unavailableLocalPreview: string;
    unavailableNoPrevious: (currentDate: string | null) => string;
    unavailableLoadFailed: (previousDate: string | null) => string;
    unavailableIncomplete: string;
    retryComparison: string;
    transitionImportance: (prev: number, curr: number) => string;
    transitionStatus: (prev: string, curr: string) => string;
    transitionConfidence: (prev: string, curr: string) => string;
    headlineChangedNote: (prevHeadline: string) => string;
  };
  expanded: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    filtersButton: string;
    resetFilters: string;
    showingCount: (shown: number, total: number) => string;
    allDomains: string;
    allConfidence: string;
    allStatus: string;
    allTopics: string;
    allTags: string;
    allSourceClasses: string;
    importanceMin: (n: number) => string;
    noMatchesTitle: string;
    noMatchesBody: string;
    backToList: string;
    copySignalLink: string;
    copiedLink: string;
    eventDateLabel: string;
    publishedLabel: string;
    firstVerifiedLabel: string;
    updatedLabel: string;
    geographyLabel: string;
    topicLabel: string;
    importanceLabel: string;
    confidenceLabel: string;
    confidenceRationaleTitle: string;
    sectionJumpLabel: string;
    sections: {
      whatHappened: string;
      verifiedFacts: string;
      timeline: string;
      whyItMatters: string;
      sourcePerspectives: string;
      analysis: string;
      uncertainties: string;
      scenarios: string;
      personalRelevance: string;
      whatToWatch: string;
      media: string;
      claims: string;
      sources: string;
      related: string;
    };
    scenarioKinds: {
      base: string;
      downside: string;
      upside: string;
      other: string;
    };
    claimsEmpty: string;
    sourcesEmpty: string;
    supportingSources: string;
    supportsClaims: string;
    qualifiesIndependent: string;
    excludedFromIndependent: string;
    registryIdLabel: string;
    unregisteredCandidate: string;
    unsafeUrlBlocked: string;
    openSource: string;
    relatedSignalsTitle: string;
    relatedNotInEdition: string;
    domainTabShort: {
      all: string;
      world: string;
      ai: string;
      economy: string;
    };
    evidenceChainLabel: string;
    sourceGroupLabel: string;
    sourceTagsLabel: string;
    showAllClaims: (total: number) => string;
    showAllSources: (total: number) => string;
    showFewerItems: string;
    activeFiltersLabel: (count: number) => string;
    continuityLabel: string;
    firstSeenLabel: string;
    lastUpdateLabel: string;
    historyIncompleteNote: string;
    layerFactual: string;
    layerInterpretive: string;
    layerForwardLooking: string;
    typedRelationshipsTitle: string;
    typedRelationshipsSubtitle: string;
    supportingClaimsLabel: string;
    legacyRelatedTitle: string;
    legacyRelatedNote: string;
    structuredTimelineBadge: string;
    dossierOutlineTitle: string;
    evidenceSnapshotTitle: string;
    prevSignal: string;
    nextSignal: string;
    signalPosition: (current: number, total: number) => string;
  };
  synthesis: {
    title: string;
    subtitle: string;
    crossDomainTitle: string;
    crossDomainSubtitle: string;
    establishedLabel: string;
    unestablishedLabel: string;
    linkedSignalsLabel: string;
    impactAnalysisTitle: string;
    impactAnalysisSubtitle: string;
    scenariosSectionTitle: string;
    scenariosSectionSubtitle: string;
    personalImplicationsTitle: string;
    personalDisclaimerFallback: string;
    watchlistTitle: string;
    watchlistSubtitle: string;
    watchlistCols: {
      indicator: string;
      whyItMatters: string;
      nextCheckpoint: string;
      signalsLinked: string;
    };
    watchlistUnlinked: string;
    noThreadsFallback: string;
    relationshipMapTitle: string;
    relationshipMapSubtitle: string;
    relationshipFilterAllExplicit: string;
    relationshipToggleLegacy: (count: number) => string;
    relationshipInspectPrompt: string;
    relationshipNoExplicit: string;
    relationshipExplicitBadge: string;
    relationshipLegacyBadge: string;
    relationshipUnresolvedNote: (count: number) => string;
    relationshipSourceNode: string;
    relationshipTargetNode: string;
    relationshipEvidenceClaims: string;
    relationshipEdgeCount: (shown: number, total: number) => string;
    watchlistFilterAll: string;
    watchlistFilterLinked: string;
    relationshipFocusAll: string;
    relationshipFocusLabel: string;
    relationshipClearFocus: string;
    relationshipKeyboardHint: string;
  };
  audit: {
    title: string;
    subtitle: string;
    overviewTitle: string;
    overviewCards: {
      independentOrigins: string;
      qualifyingRecords: string;
      totalSourceRecords: string;
      excludedRecords: string;
      primaryAndResearch: string;
      claimsAudited: string;
    };
    sourceBreakdownTitle: string;
    originExplorerTitle: string;
    originExplorerSubtitle: string;
    originFilterAll: string;
    originFilterQualifying: string;
    originFilterExcluded: string;
    originCountedBadge: string;
    originExcludedBadge: string;
    originOutletsLabel: string;
    originSignalsLabel: string;
    originRecordsLabel: (qualifying: number, total: number) => string;
    originExclusionReasonLabel: string;
    unassignedTitle: string;
    unassignedSubtitle: string;
    unassignedBadge: string;
    claimLedgerTitle: string;
    claimLedgerSubtitle: string;
    claimFilterStatus: string;
    claimFilterConfidence: string;
    claimFilterSignal: string;
    claimFilterSources: string;
    claimSourcesAll: string;
    claimSourcesWithIndependent: string;
    claimSourcesNoIndependent: string;
    claimTraceLabel: string;
    distributionTitle: string;
    distributionSubtitle: string;
    confidenceDistribution: string;
    importanceDistribution: string;
    editorialTrailTitle: string;
    trailTabs: {
      sourceAudit: string;
      openQuestions: string;
      corrections: string;
      methodology: string;
      diagnostics: string;
    };
    diagnosticsValid: string;
    diagnosticsErrors: string;
    diagnosticsWarnings: string;
    noItemsInSection: string;
    compositionTitle: string;
    compositionQualifying: string;
    compositionSyndicated: string;
    compositionPrimaryResearch: string;
    compositionOtherExcluded: string;
    showMoreOutlets: (count: number) => string;
    showMoreSignals: (count: number) => string;
    showFewerList: string;
    traceFlowLabel: string;
    claimSearchPlaceholder: string;
    matrixTitle: string;
    matrixSubtitle: string;
    matrixImportanceAxis: string;
    matrixTotalCol: string;
    matrixTotalRow: string;
    claimLoadMore: (count: number) => string;
    claimShowAll: (total: number) => string;
    claimShowingRange: (shown: number, total: number) => string;
    verificationRatioLabel: string;
    matrixAxisNote: string;
    originSummaryRibbon: (qualifying: number, excluded: number) => string;
  };
  emptyState: {
    eyebrow: string;
    title: string;
    body: string;
    domainsNote: string;
    checkAgain: string;
    openLocalTool: string;
  };
  localModal: {
    title: string;
    subtitle: string;
    uploadFile: string;
    pasteLabel: string;
    pastePlaceholder: string;
    previewButton: string;
    cancelButton: string;
    emptyWarning: string;
  };
  errorState: {
    title: string;
    retry: string;
    openArchive: string;
  };
  loading: string;
  domains: Record<SignalDomain, string>;
  confidence: Record<ConfidenceLevel, string>;
  signalStatus: Record<SignalStatus, string>;
  claimStatus: Record<ClaimStatus, string>;
  editionStatus: Record<EditionStatus, string>;
  syncRun: Record<string, string>;
  sourceClass: Record<SourceClass, string>;
  relationship: Record<SourceRelationship, string>;
  signalRelationshipType: Record<SignalRelationshipType, string>;
  signalLifecycle: Record<SignalLifecycle, string>;
  exclusionReason: Record<IndependenceExclusionReason, string>;
  metaLine: {
    importance: (n: number) => string;
    confidence: (label: string) => string;
    origins: (n: number) => string;
    claims: (n: number) => string;
  };
  globalSearch: {
    triggerLabel: string;
    shortcutHint: string;
    dialogTitle: string;
    dialogSubtitle: string;
    inputPlaceholder: string;
    clearQuery: string;
    close: string;
    sortLabel: string;
    sortOptions: {
      relevance: string;
      latest: string;
      importance: string;
      confidence: string;
    };
    sortExplainer: {
      relevance: string;
      latest: string;
      importance: string;
      confidence: string;
    };
    filtersToggle: string;
    activeFiltersCount: (count: number) => string;
    resetFilters: string;
    dateFromLabel: string;
    dateToLabel: string;
    claimStatusLabel: string;
    allClaimStatuses: string;
    publisherLabel: string;
    publisherPlaceholder: string;
    indexingStatus: (indexed: number, total: number) => string;
    indexedCompleteStatus: (total: number) => string;
    partialResultsBanner: (indexed: number, total: number) => string;
    cancelSearch: string;
    resumeIndexing: string;
    cancelledBanner: (indexed: number, total: number) => string;
    failedEditionsBanner: (count: number, dates: string) => string;
    malformedEditionsNote: (count: number) => string;
    initialPromptTitle: string;
    initialPromptBody: string;
    searchingEmptyNote: (indexed: number, total: number) => string;
    noResultsTitle: string;
    noResultsBody: string;
    resultsSummary: (signals: number, occurrences: number) => string;
    matchedInPrefix: string;
    matchFields: {
      signal_id: string;
      headline: string;
      topic: string;
      tags: string;
      geography: string;
      claim_id: string;
      claim_statement: string;
      source_outlet: string;
      source_title: string;
      source_group: string;
      edition: string;
      event_date: string;
      narrative: string;
    };
    appearancesCount: (count: number) => string;
    materialUpdatesCount: (count: number) => string;
    expandHistory: string;
    collapseHistory: string;
    openEditionSignal: (date: string) => string;
    openStoryline: string;
    materialUpdateTag: string;
    keyboardHint: string;
  };
  storyline: {
    triggerButton: string;
    dialogTitle: string;
    dialogSubtitle: string;
    close: string;
    loadingHistory: (loaded: number, total: number) => string;
    cancelLoading: string;
    retryLoading: string;
    errorTitle: string;
    emptyTitle: string;
    emptyBody: string;
    firstSeenLabel: string;
    lastSeenLabel: string;
    lastMaterialUpdateLabel: string;
    appearancesLabel: string;
    lifecycleLabel: string;
    coverageLabel: string;
    coverageComplete: (count: number) => string;
    coverageIncomplete: (loaded: number, total: number) => string;
    coverageLimitedNote: (count: number) => string;
    failedEditionsWarning: (dates: string) => string;
    sameDayLimitationTitle: string;
    sameDayLimitationBody: string;
    absentNotResolvedTitle: string;
    absentNotResolvedBody: (lastSeen: string, latestDate: string) => string;
    revisionTimelineTitle: string;
    revisionTimelineNote: string;
    eventTimelineDistinctionNote: string;
    revisionKinds: {
      first_seen: string;
      material_update: string;
      unchanged: string;
      reappeared: string;
    };
    reappearedAfterGap: (days: number) => string;
    inspectRevisionTitle: (date: string) => string;
    openHistoricalDossier: (date: string) => string;
    noMaterialDiffNote: string;
    firstObservedNote: string;
    schemaV1Note: string;
    narrativeChangedNote: string;
    topicChangedNote: (prev: string, curr: string) => string;
    eventMetaChangedNote: string;
    relationshipsChangedNote: (prevCount: number, currCount: number) => string;
  };
  readerDesk: {
    triggerLabel: string;
    dialogTitle: string;
    dialogSubtitle: string;
    close: string;
    localStorageNotice: string;
    storageWarningPrefix: string;
    storageWarnings: {
      storage_unavailable: string;
      corrupt_state_recovered: string;
      migrated_legacy_state: string;
      quota_exceeded: string;
    };
    tabs: {
      catchUp: string;
      followed: string;
      saved: string;
      topics: string;
    };
    saveAction: string;
    savedAction: string;
    unsaveAction: string;
    followAction: string;
    followingAction: string;
    unfollowAction: string;
    savedEmptyTitle: string;
    savedEmptyBody: string;
    savedOnLabel: (date: string) => string;
    openSavedSignal: (date: string) => string;
    followedEmptyTitle: string;
    followedEmptyBody: string;
    followedLoading: string;
    followedLastKnownEdition: string;
    followedLatestAppearance: string;
    followedLastMaterialUpdate: string;
    followedVersionsCount: (count: number) => string;
    followedAbsentLatestNote: string;
    followedMissingArchiveNote: string;
    topicsEmptyTitle: string;
    topicsEmptyBody: string;
    topicsAddLabel: string;
    topicsAddButton: string;
    topicsRemoveAction: string;
    topicsCurrentMatches: (count: number) => string;
    clearDataButton: string;
    clearDataConfirm: string;
    clearDataCancel: string;
    clearDataWarning: string;
  };
  catchUp: {
    eyebrow: string;
    title: string;
    firstVisitTitle: string;
    firstVisitBody: (editionDate: string, count: number) => string;
    markAsReviewed: string;
    reviewedCheckpointLabel: (date: string) => string;
    upToDateTitle: string;
    upToDateBody: (date: string) => string;
    baselineUnavailableTitle: string;
    baselineUnavailableSnapshot: (date: string) => string;
    baselineUnavailableArchived: (date: string) => string;
    changesHeadline: (fromDate: string, toDate: string) => string;
    sameDayRevisionBadge: string;
    usedLocalSnapshotNote: string;
    generalCatchUpTitle: string;
    personalCatchUpTitle: string;
    personalCatchUpEmpty: string;
    groupNew: string;
    groupUpdated: string;
    groupReappeared: string;
    groupClaimChanges: string;
    groupSourceChanges: string;
    groupOmitted: string;
    openFullDigest: string;
    inspectNextHint: string;
    followedAlertKinds: {
      new: string;
      updated: string;
      reappeared: string;
      omitted: string;
    };
  };
  editionCompare: {
    triggerButton: string;
    dialogTitle: string;
    dialogSubtitle: string;
    close: string;
    fromEditionLabel: string;
    toEditionLabel: string;
    swapOrder: string;
    reorderedNote: (fromDate: string, toDate: string) => string;
    validationErrors: {
      insufficient_archive: string;
      missing_date: string;
      invalid_date_not_in_archive: string;
      same_edition_selected: string;
    };
    loadingPair: (fromDate: string, toDate: string) => string;
    loadErrorTitle: string;
    retry: string;
    openPreviousVersion: (date: string) => string;
    openCurrentVersion: (date: string) => string;
    daySpanLabel: (days: number) => string;
    compareAction: string;
  };
  media: {
    sectionTitle: string;
    sectionSubtitle: string;
    relationships: Record<MediaSignalRelationship, string>;
    relationshipDisclosures: Record<MediaSignalRelationship, string>;
    mediaTypes: Record<MediaAssetType, string>;
    sourcePageLink: string;
    licenseLink: string;
    creatorLabel: string;
    depictedLabel: string;
    uncroppedNote: string;
    unavailableFallbackTitle: string;
    unavailableFallbackBody: string;
    nonEvidenceNote: string;
    supportingCount: (count: number) => string;
  };
}

const EN_DICT: UiDictionary = {
  brandTagline: 'Evidence-Led Daily Intelligence Briefing',
  nav: {
    briefing: 'Briefing',
    expanded: 'Expanded',
    synthesis: 'Synthesis',
    audit: 'Audit',
  },
  navShort: {
    briefing: 'Briefing',
    expanded: 'Expanded',
    synthesis: 'Synthesis',
    audit: 'Audit',
  },
  archive: {
    button: 'Archive',
    title: 'Edition Archive & Settings',
    subtitle: 'Static Markdown editions indexed in Pacific Time',
    latest: 'Latest',
    previousEdition: 'Previous edition',
    nextEdition: 'Next edition',
    editionsCount: (n) => (n === 1 ? '1 edition archived' : `${n} editions archived`),
    emptyArchive: 'No published editions in the archive yet.',
    refreshEdition: 'Check for same-day update',
    refreshing: 'Checking…',
    refreshedNotice: 'Checked against latest archive index.',
    appearance: 'Appearance',
    lightMode: 'Light',
    darkMode: 'Dark',
    interfaceLanguage: 'Interface Language',
    developerTools: 'Local Verification Utility',
    developerToolsHint:
      'Preview a local edition Markdown file in memory without modifying the published archive.',
    loadLocalMarkdown: 'Load local Markdown preview',
    localPreviewActive: 'Local Markdown Preview (not from archive)',
    exitPreview: 'Return to published archive',
    close: 'Close',
    searchPlaceholder: 'Filter editions by date, status, or summary…',
    noMatchingEditions: 'No archived editions match this query.',
    matchingCount: (shown, total) => `${shown} of ${total} editions`,
  },
  masthead: {
    editionLabel: 'Edition',
    updatedLabel: 'Last updated',
    syncCycleLabel: 'Sync',
    statusLabel: 'Status',
    coverageWindowLabel: 'Coverage window',
    signalsCount: (n) => `${n} signals`,
    independentOriginsCount: (n) => `${n} independent origins`,
    claimsCount: (n) => `${n} claims`,
    recordsCount: (n) => `${n} source records`,
    diagnosticsLink: (errors, warnings) =>
      `${errors} error${errors === 1 ? '' : 's'} · ${warnings} warning${warnings === 1 ? '' : 's'}`,
  },
  briefing: {
    leadKicker: 'Lead Development',
    executiveSummaryTitle: 'Executive Summary',
    editorialLimitationsTitle: 'Editorial Limitations & Coverage Scope',
    topSignalsTitle: 'Top Signals',
    topSignalsNote: 'Editorially selected order from this edition',
    readDossier: 'Read full dossier',
    domainsOverviewTitle: 'Three-Domain Overview',
    exploreDomain: 'Explore domain',
    additionalSignalsTitle: 'Additional Signals in This Edition',
    additionalSignalsSubtitle:
      'Compact index of signals beyond the top selection, grouped by domain.',
    readingPathTitle: 'Continue Reading',
    readingPathSubtitle: 'Move from the executive summary to deep dossiers, synthesis, or full source verification.',
    openExpandedDesc: 'Inspect full timelines, claims, source perspectives, and scenarios across all signals.',
    openSynthesisDesc: 'Review cross-domain causal threads, horizon impacts, personal implications, and the watchlist.',
    openAuditDesc: 'Inspect deduplicated reporting origins, claim-to-source provenance, corrections, and open questions.',
    summaryExpand: 'Read full summary',
    summaryCollapse: 'Show less',
    limitationsExpand: (count) =>
      count > 1 ? `Read all ${count} editorial notes` : 'Read full editorial note',
    limitationsCollapse: 'Collapse editorial notes',
    artworkCaption: 'Structured Signal Diagram',
    artworkIllustrativeNote: 'Illustrative diagram derived strictly from structured metadata — not documentary imagery.',
    artworkOriginsLabel: 'Origins',
    artworkClaimsLabel: 'Claims',
    artworkSourcesLabel: 'Records',
    artworkTimelineMilestones: (count) => `${count} dated ${count === 1 ? 'milestone' : 'milestones'}`,
    artworkDeclaredLinks: (count) => `${count} declared ${count === 1 ? 'link' : 'links'}`,
    artworkOverflowNote: (displayed, total) => `${displayed} orbital nodes shown of ${total} exact origins`,
    domainShareLabel: (pct) => `${pct}% of edition`,
    domainBalanceTitle: 'Edition Coverage Balance Across Domains',
    domainHighPriorityCount: (count) => `${count} high-priority (4–5/5)`,
    domainImp5Label: 'Imp 5',
    domainImp4Label: 'Imp 4',
    domainImpOtherLabel: 'Imp 1–3',
    mastheadDescriptor: 'Independent Global Intelligence',
    coverPlateTitles: {
      world: 'Geopolitical Meridian Plate',
      ai: 'Frontier Topology Plate',
      economy: 'Macro Balance Plate',
    },
    coverPlateFolio: {
      world: 'PLATE I',
      ai: 'PLATE II',
      economy: 'PLATE III',
    },
    coverEditionDeskLabel: 'Edition Desk',
  },
  dailyDelta: {
    eyebrow: 'Daily Delta',
    title: 'Cross-Edition Change Ledger',
    comparingRange: (prev, curr) => `Comparing ${prev} → ${curr}`,
    dateGapNote: (days, prev) =>
      `${days}-day archive gap: compared against the immediately preceding available edition (${prev}).`,
    schemaTransitionNote: (prevV, currV) =>
      `Schema v${prevV} → v${currV}: newly introduced structured fields (such as timeline events or typed relationships) may reflect schema migration alongside editorial updates.`,
    loadingLabel: (prev) => `Loading preceding edition (${prev}) for deterministic comparison…`,
    categories: {
      new: 'New',
      updated: 'Updated',
      unchanged: 'Unchanged',
      omitted: 'Omitted',
    },
    categoryDescriptions: {
      new: 'First appearance relative to previous edition',
      updated: 'Material factual, status, or evidence changes',
      unchanged: 'Materially unchanged (routine sync ignored)',
      omitted: 'Absent here; not necessarily resolved',
    },
    categoryBadges: {
      new: 'NEW',
      updated: 'UPDATED',
      unchanged: 'UNCHANGED',
      omitted: 'OMITTED',
    },
    reasons: {
      headline: 'Headline',
      importance: 'Importance',
      status: 'Status',
      confidence: 'Confidence',
      topic: 'Topic & Tags',
      event: 'Event Details',
      claims: 'Claims',
      sources: 'Sources',
      relationships: 'Relationships',
      narrative: 'Narrative',
    },
    emptyCategory: 'No signals fall into this category for this edition pair.',
    omittedNoticeTitle: 'Omission Is Not Resolution',
    omittedNoticeBody: (prev, curr) =>
      `These signals appeared in ${prev} but are absent from ${curr}. Absence from an edition does not mean an event concluded, resolved, or was retracted. Selecting a signal opens its dossier in the ${prev} edition.`,
    omittedItemExplanation: (prev, curr) =>
      `Present in ${prev}; absent from ${curr}. Omission does not imply resolution.`,
    newItemExplanation: (curr, claims, sources) =>
      `First observed in ${curr} with ${claims} structured ${claims === 1 ? 'claim' : 'claims'} and ${sources} source ${sources === 1 ? 'record' : 'records'}.`,
    unchangedItemExplanation: (prev) =>
      `Materially unchanged since ${prev}. Routine sync and source access timestamps do not trigger updates.`,
    updatedReasonsPrefix: 'Changed',
    evidenceToggleShow: 'Inspect evidence changes',
    evidenceToggleHide: 'Hide evidence changes',
    evidenceSummaryClaims: (added, revised, withdrawn) => {
      const parts: string[] = [];
      if (added > 0) parts.push(`+${added} added`);
      if (revised > 0) parts.push(`${revised} revised`);
      if (withdrawn > 0) parts.push(`${withdrawn} withdrawn`);
      return `Claims: ${parts.join(', ')}`;
    },
    evidenceSummarySources: (added, revised, removed) => {
      const parts: string[] = [];
      if (added > 0) parts.push(`+${added} added`);
      if (revised > 0) parts.push(`${revised} revised`);
      if (removed > 0) parts.push(`${removed} removed`);
      return `Sources: ${parts.join(', ')}`;
    },
    addedClaimsLabel: 'Added Claims',
    revisedClaimsLabel: 'Revised Claims',
    withdrawnClaimsLabel: 'Withdrawn Claims',
    addedSourcesLabel: 'Added Sources',
    revisedSourcesLabel: 'Revised Sources',
    removedSourcesLabel: 'Removed Sources',
    routineMetadataNote:
      'Deterministic comparison by stable signal_id. Routine edition sync and source access timestamps are excluded.',
    openCurrentDossier: 'Open dossier',
    openPreviousDossier: (prev) => `Open in ${prev} edition`,
    showAllCategory: (total, label) => `Show all ${total} ${label.toLowerCase()} signals`,
    showFewerCategory: 'Show fewer',
    unavailableTitle: 'Comparison Unavailable',
    unavailableLocalPreview:
      'Daily Delta compares archived editions only and is disabled during local Markdown preview so no historical counts are fabricated.',
    unavailableNoPrevious: (curr) =>
      curr
        ? `${curr} is the earliest available edition in this archive. No preceding edition exists for cross-edition comparison.`
        : 'No preceding edition exists in this archive for cross-edition comparison.',
    unavailableLoadFailed: (prev) =>
      prev
        ? `Unable to load the immediately preceding edition (${prev}) to compute Daily Delta.`
        : 'Unable to load the preceding edition to compute Daily Delta.',
    unavailableIncomplete:
      'Historical comparison is currently incomplete or unavailable for this edition.',
    retryComparison: 'Retry comparison',
    transitionImportance: (prev, curr) => `Importance ${prev}/5 → ${curr}/5`,
    transitionStatus: (prev, curr) => `Status: ${prev} → ${curr}`,
    transitionConfidence: (prev, curr) => `Confidence: ${prev} → ${curr}`,
    headlineChangedNote: (prevHeadline) => `Previous headline: “${prevHeadline}”`,
  },
  expanded: {
    title: 'Signal Explorer',
    subtitle: 'Filter and inspect complete signal dossiers with claim and source ledgers.',
    searchPlaceholder: 'Search headlines, facts, claims, outlets…',
    filtersButton: 'Filters',
    resetFilters: 'Reset',
    showingCount: (shown, total) => `${shown} of ${total} signals`,
    allDomains: 'All domains',
    allConfidence: 'All confidence',
    allStatus: 'All statuses',
    allTopics: 'All topics',
    allTags: 'All tags',
    allSourceClasses: 'All source classes',
    importanceMin: (n) => (n === 1 ? 'Any importance' : `Importance ≥ ${n}/5`),
    noMatchesTitle: 'No signals match these filters',
    noMatchesBody: 'Adjust or reset your active filters to view signals in this edition.',
    backToList: 'All signals',
    copySignalLink: 'Copy link',
    copiedLink: 'Copied',
    eventDateLabel: 'Event date',
    publishedLabel: 'Published',
    firstVerifiedLabel: 'First verified',
    updatedLabel: 'Updated',
    geographyLabel: 'Geography',
    topicLabel: 'Topic',
    importanceLabel: 'Importance',
    confidenceLabel: 'Confidence',
    confidenceRationaleTitle: 'Confidence Rationale',
    sectionJumpLabel: 'Jump to',
    sections: {
      whatHappened: 'What Happened',
      verifiedFacts: 'Verified Facts',
      timeline: 'Timeline',
      whyItMatters: 'Why It Matters',
      sourcePerspectives: 'Source Perspectives',
      analysis: 'Analysis',
      uncertainties: 'Uncertainties',
      scenarios: 'Scenarios',
      personalRelevance: 'Personal Relevance',
      whatToWatch: 'What to Watch',
      media: 'Editorial Media',
      claims: 'Claim Ledger',
      sources: 'Source Ledger',
      related: 'Related Signals',
    },
    scenarioKinds: {
      base: 'Base Case',
      downside: 'Downside',
      upside: 'Upside',
      other: 'Scenario',
    },
    claimsEmpty: 'No structured claims recorded for this signal.',
    sourcesEmpty: 'No source records attached to this signal.',
    supportingSources: 'Sources',
    supportsClaims: 'Supports claims',
    qualifiesIndependent: 'Counts as independent origin',
    excludedFromIndependent: 'Excluded from independent count',
    registryIdLabel: 'Registry',
    unregisteredCandidate: 'Unregistered candidate',
    unsafeUrlBlocked: 'Unsafe URL blocked',
    openSource: 'Open source',
    relatedSignalsTitle: 'Related Signals in This Edition',
    relatedNotInEdition: 'Referenced outside current edition',
    domainTabShort: {
      all: 'All',
      world: 'World',
      ai: 'AI',
      economy: 'Econ',
    },
    evidenceChainLabel: 'Signal → Claim → Source → Independent Origin',
    sourceGroupLabel: 'Origin group',
    sourceTagsLabel: 'Tags',
    showAllClaims: (total) => `Show all ${total} claims`,
    showAllSources: (total) => `Show all ${total} sources`,
    showFewerItems: 'Show fewer',
    activeFiltersLabel: (count) => `${count} active ${count === 1 ? 'filter' : 'filters'}`,
    continuityLabel: 'Storyline Continuity',
    firstSeenLabel: 'First seen',
    lastUpdateLabel: 'Last material update',
    historyIncompleteNote: 'Archive lookback incomplete',
    layerFactual: 'Part I · Verified Record & Chronology',
    layerInterpretive: 'Part II · Significance & Analysis',
    layerForwardLooking: 'Part III · Uncertainties & Forward Scenarios',
    typedRelationshipsTitle: 'Declared Signal Relationships',
    typedRelationshipsSubtitle: 'Explicitly typed, evidence-linked connections declared in edition metadata.',
    supportingClaimsLabel: 'Supporting claims',
    legacyRelatedTitle: 'Coarse Contextual References',
    legacyRelatedNote: 'Declared in related_signal_ids only; contextual association without causal assertion.',
    structuredTimelineBadge: 'Evidence-linked chronology',
    dossierOutlineTitle: 'Dossier Sections',
    evidenceSnapshotTitle: 'Evidence Ledger',
    prevSignal: 'Previous signal',
    nextSignal: 'Next signal',
    signalPosition: (current, total) => `Signal ${String(current).padStart(2, '0')} of ${String(total).padStart(2, '0')}`,
  },
  synthesis: {
    title: 'Cross-Domain Synthesis & Implications',
    subtitle: 'Evidence-backed causal connections across domains, conditional scenarios, practical implications, and watchlist checkpoints.',
    crossDomainTitle: 'Cross-Domain Synthesis',
    crossDomainSubtitle: 'Only evidence-supported cross-domain connections are recorded; unestablished connections are explicitly separated.',
    establishedLabel: 'Evidence-linked thread',
    unestablishedLabel: 'Unestablished connections (excluded from inference)',
    linkedSignalsLabel: 'Linked signals',
    impactAnalysisTitle: 'Economic & Structural Time Horizons',
    impactAnalysisSubtitle: 'Explicit horizon impacts documented in this edition’s economic signals.',
    scenariosSectionTitle: 'Conditional Scenarios Across Key Signals',
    scenariosSectionSubtitle: 'Qualitative base, downside, and upside pathways without fabricated probability scores.',
    personalImplicationsTitle: 'Personal Implications',
    personalDisclaimerFallback:
      'General decision-support analysis only. Not personalized investment, financial, legal, or medical advice.',
    watchlistTitle: 'Watchlist & Next Checkpoints',
    watchlistSubtitle: 'Scheduled releases, policy meetings, and verification triggers to monitor next.',
    watchlistCols: {
      indicator: 'Indicator or Event',
      whyItMatters: 'Why It Matters',
      nextCheckpoint: 'Next Checkpoint',
      signalsLinked: 'Linked Signals',
    },
    watchlistUnlinked: 'No linked signal',
    noThreadsFallback: 'No structured cross-domain threads recorded in this edition.',
    relationshipMapTitle: 'Explicit Relationship Map & Matrix',
    relationshipMapSubtitle: 'Spatial projection of relationships explicitly declared in this edition. No links are inferred from timing or similarity.',
    relationshipFilterAllExplicit: 'All typed links',
    relationshipToggleLegacy: (count) => `Include coarse contextual links (${count})`,
    relationshipInspectPrompt: 'Select any link on the map or ledger below to inspect its rationale and supporting claims.',
    relationshipNoExplicit: 'No explicitly typed schema-v2 relationships are declared in this edition.',
    relationshipExplicitBadge: 'Explicit typed link',
    relationshipLegacyBadge: 'Coarse contextual (non-causal)',
    relationshipUnresolvedNote: (count) => `${count} declared ${count === 1 ? 'reference points' : 'references point'} to signals outside this edition.`,
    relationshipSourceNode: 'From',
    relationshipTargetNode: 'To',
    relationshipEvidenceClaims: 'Supporting claims',
    relationshipEdgeCount: (shown, total) => `${shown} of ${total} links`,
    watchlistFilterAll: 'All checkpoints',
    watchlistFilterLinked: 'Linked to signals',
    relationshipFocusAll: 'All connected signals',
    relationshipFocusLabel: 'Focus signal',
    relationshipClearFocus: 'Show full map',
    relationshipKeyboardHint: 'Use Tab and Enter to inspect any node or link.',
  },
  audit: {
    title: 'Audit, Provenance & Methodology',
    subtitle: 'Transparent source-independence ledger, claim-level verification trace, corrections log, and schema diagnostics.',
    overviewTitle: 'Derived Source & Evidence Overview',
    overviewCards: {
      independentOrigins: 'Independent Reporting Origins',
      qualifyingRecords: 'Qualifying Original Records',
      totalSourceRecords: 'Total Source Records',
      excludedRecords: 'Excluded / Non-Independent',
      primaryAndResearch: 'Primary & Research Records',
      claimsAudited: 'Claims Audited',
    },
    sourceBreakdownTitle: 'Source Class Breakdown',
    originExplorerTitle: 'Reporting Origin Explorer',
    originExplorerSubtitle:
      'All source records grouped by independence_group using the single Source Policy engine, showing both qualifying reporting origins and excluded records.',
    originFilterAll: 'All groups',
    originFilterQualifying: 'Qualifying origins',
    originFilterExcluded: 'Excluded only',
    originCountedBadge: 'Independent origin',
    originExcludedBadge: 'Excluded',
    originOutletsLabel: 'Outlets',
    originSignalsLabel: 'Signals',
    originRecordsLabel: (q, t) => `${q} qualifying / ${t} total`,
    originExclusionReasonLabel: 'Exclusion basis',
    unassignedTitle: 'Unassigned Source Records (No Reporting Origin Group)',
    unassignedSubtitle:
      'These records lack an independence_group identifier. They are excluded from independent-origin counts and listed individually below — they do not share a common reporting organization.',
    unassignedBadge: 'Unassigned record',
    claimLedgerTitle: 'Inspectable Claim Ledger',
    claimLedgerSubtitle: 'Trace every claim from Signal → Claim → Source Record → Reporting Origin.',
    claimFilterStatus: 'All claim statuses',
    claimFilterConfidence: 'All confidence levels',
    claimFilterSignal: 'All signals',
    claimFilterSources: 'Source coverage',
    claimSourcesAll: 'All claims',
    claimSourcesWithIndependent: 'With independent origin',
    claimSourcesNoIndependent: 'No independent origin',
    claimTraceLabel: 'Evidence trace',
    distributionTitle: 'Confidence vs. Importance Distribution',
    distributionSubtitle: 'Confidence reflects verification strength and is kept strictly separate from editorial importance.',
    confidenceDistribution: 'By Confidence Level',
    importanceDistribution: 'By Importance (1–5)',
    editorialTrailTitle: 'Editorial Audit Trail',
    trailTabs: {
      sourceAudit: 'Source Audit',
      openQuestions: 'Open Questions',
      corrections: 'Corrections',
      methodology: 'Methodology Notes',
      diagnostics: 'Schema Diagnostics',
    },
    diagnosticsValid: 'All required schema checks passed.',
    diagnosticsErrors: 'Errors',
    diagnosticsWarnings: 'Warnings',
    noItemsInSection: 'No entries recorded in this section.',
    compositionTitle: 'Derived Source Record Composition',
    compositionQualifying: 'Qualifying Original',
    compositionSyndicated: 'Syndicated Wire',
    compositionPrimaryResearch: 'Primary & Research',
    compositionOtherExcluded: 'Other Excluded',
    showMoreOutlets: (count) => `+${count} more outlets`,
    showMoreSignals: (count) => `+${count} more signals`,
    showFewerList: 'Collapse',
    traceFlowLabel: 'Signal → Claim → Source → Origin',
    claimSearchPlaceholder: 'Search claim text, claim ID, or signal ID…',
    matrixTitle: 'Importance × Confidence Cross-Matrix',
    matrixSubtitle: 'Exact signal counts showing how editorial importance is assessed independently from verification confidence.',
    matrixImportanceAxis: 'Importance',
    matrixTotalCol: 'Total',
    matrixTotalRow: 'Column Total',
    claimLoadMore: (count) => `Load ${count} more claims`,
    claimShowAll: (total) => `Show all ${total} claims`,
    claimShowingRange: (shown, total) => `Showing ${shown} of ${total} matching claims`,
    verificationRatioLabel: 'Qualifying original share',
    matrixAxisNote: 'Rows measure editorial importance (impact); columns measure verification confidence.',
    originSummaryRibbon: (q, e) => `${q} qualifying independent ${q === 1 ? 'origin' : 'origins'} · ${e} excluded/syndicated ${e === 1 ? 'group' : 'groups'}`,
  },
  emptyState: {
    eyebrow: 'Archive Status',
    title: 'No Published Edition Yet',
    body: 'The WORLD SIGNAL static archive currently contains no published Markdown editions. Real editions appear here automatically once generated and indexed.',
    domainsNote: 'Coverage tracks three core domains: World Events, AI Frontier, and Economic Outlook.',
    checkAgain: 'Check archive again',
    openLocalTool: 'Open local Markdown preview',
  },
  localModal: {
    title: 'Local Markdown Verification Preview',
    subtitle: 'Inspect a local WORLD SIGNAL Markdown file in-memory. Nothing is uploaded or persisted.',
    uploadFile: 'Select .md file',
    pasteLabel: 'Or paste raw edition Markdown',
    pastePlaceholder: '---\nschema_version: 1\nedition_date: "2026-11-23"\n...',
    previewButton: 'Render preview',
    cancelButton: 'Cancel',
    emptyWarning: 'Please select a Markdown file or paste edition content first.',
  },
  errorState: {
    title: 'Unable to Load Edition',
    retry: 'Retry',
    openArchive: 'Open Archive',
  },
  loading: 'Loading intelligence briefing…',
  domains: {
    world: 'World Events',
    ai: 'AI Frontier',
    economy: 'Economic Outlook',
  },
  confidence: {
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    unverified: 'Unverified',
  },
  signalStatus: {
    new: 'New',
    developing: 'Developing',
    ongoing: 'Ongoing',
    confirmed: 'Confirmed',
    disputed: 'Disputed',
    unverified: 'Unverified',
    closed: 'Closed',
    corrected: 'Corrected',
  },
  claimStatus: {
    confirmed: 'Confirmed',
    reported: 'Reported',
    official_claim: 'Official Claim',
    disputed: 'Disputed',
    unverified: 'Unverified',
  },
  editionStatus: {
    draft: 'Draft',
    reviewed: 'Reviewed',
    published: 'Published',
  },
  syncRun: {
    morning: 'Morning Sync',
    midday: 'Midday Sync',
    evening: 'Evening Sync',
    manual: 'Manual Sync',
  },
  sourceClass: {
    tier_1_newsroom: 'Tier-1 Newsroom',
    specialist_publication: 'Specialist Publication',
    primary_source: 'Primary Source',
    research_paper: 'Research Paper',
    unknown: 'Unclassified',
  },
  relationship: {
    original_reporting: 'Original Reporting',
    syndicated: 'Syndicated Wire',
    official_statement: 'Official Statement',
    company_announcement: 'Company Announcement',
    research_artifact: 'Research Artifact',
    secondary_analysis: 'Secondary Analysis',
    unknown: 'Unknown Relationship',
  },
  signalRelationshipType: {
    same_event: 'Same Event',
    contextual: 'Contextual',
    policy_response: 'Policy Response',
    market_transmission: 'Market Transmission',
    technological_dependency: 'Tech Dependency',
    causal_link: 'Causal Link',
    potential_link: 'Potential Link',
  },
  signalLifecycle: {
    new: 'New',
    developing: 'Developing',
    ongoing: 'Ongoing',
    monitoring: 'Monitoring',
    resolved: 'Resolved',
    archived: 'Archived',
  },
  exclusionReason: {
    flagged_non_independent: 'Marked non-independent in edition metadata',
    missing_independence_group: 'Missing independence_group',
    primary_source: 'Primary source (does not count as independent newsroom)',
    research_paper: 'Research paper (does not count as independent newsroom)',
    unknown_source_class: 'Unknown / unclassified source_class',
    syndicated: 'Syndicated copy (deduplicated from independent count)',
    official_statement: 'Official statement',
    company_announcement: 'Company announcement',
    research_artifact: 'Research artifact',
    secondary_analysis: 'Secondary analysis',
    unknown_relationship: 'Unknown source relationship',
  },
  metaLine: {
    importance: (n) => `Importance ${n}/5`,
    confidence: (label) => `Confidence: ${label}`,
    origins: (n) => `${n} independent ${n === 1 ? 'origin' : 'origins'}`,
    claims: (n) => `${n} ${n === 1 ? 'claim' : 'claims'}`,
  },
  globalSearch: {
    triggerLabel: 'Search',
    shortcutHint: '⌘K',
    dialogTitle: 'Global Intelligence Search',
    dialogSubtitle: 'Deterministic full-archive search across canonical Markdown editions',
    inputPlaceholder: 'Search signal IDs, headlines, claims, outlets, topics, or Chinese keywords…',
    clearQuery: 'Clear query',
    close: 'Close search',
    sortLabel: 'Sort by',
    sortOptions: {
      relevance: 'Relevance',
      latest: 'Latest appearance',
      importance: 'Importance',
      confidence: 'Confidence',
    },
    sortExplainer: {
      relevance: 'Deterministic field-match priority (Signal ID > Headline > Claims > Sources > Narrative)',
      latest: 'Most recent matching edition date first',
      importance: 'Editorial importance 5 to 1 (independent of verification confidence)',
      confidence: 'Verification confidence High to Unverified (independent of importance)',
    },
    filtersToggle: 'Advanced filters',
    activeFiltersCount: (count) => `${count} active`,
    resetFilters: 'Reset filters',
    dateFromLabel: 'From edition',
    dateToLabel: 'To edition',
    claimStatusLabel: 'Claim status',
    allClaimStatuses: 'All claim statuses',
    publisherLabel: 'Publisher / outlet',
    publisherPlaceholder: 'e.g. Reuters, FT, Bloomberg',
    indexingStatus: (indexed, total) => `Searching ${indexed} of ${total} archived editions…`,
    indexedCompleteStatus: (total) => `Searched all ${total} archived ${total === 1 ? 'edition' : 'editions'}`,
    partialResultsBanner: (indexed, total) =>
      `Partial results: ${indexed} of ${total} editions indexed so far. Historical editions are loading incrementally.`,
    cancelSearch: 'Stop indexing',
    resumeIndexing: 'Index remaining editions',
    cancelledBanner: (indexed, total) =>
      `Indexing paused after ${indexed} of ${total} editions. Results reflect only indexed editions.`,
    failedEditionsBanner: (count, dates) =>
      `${count} historical ${count === 1 ? 'edition' : 'editions'} could not be loaded (${dates}). Results may be incomplete.`,
    malformedEditionsNote: (count) =>
      `${count} ${count === 1 ? 'edition' : 'editions'} contained validation errors; parsed fields remain searchable.`,
    initialPromptTitle: 'Search across the WORLD SIGNAL archive',
    initialPromptBody:
      'Enter a stable Signal ID, English or Chinese keyword, claim text, or outlet name, or apply filters to inspect historical signals.',
    searchingEmptyNote: (indexed, total) =>
      `No matches found in the first ${indexed} of ${total} editions yet — continuing to search earlier editions…`,
    noResultsTitle: 'No matching signals found',
    noResultsBody:
      'Try broadening your query, checking spelling, or resetting active archive filters.',
    resultsSummary: (signals, occurrences) =>
      `${signals} unique ${signals === 1 ? 'signal' : 'signals'} across ${occurrences} edition ${occurrences === 1 ? 'appearance' : 'appearances'}`,
    matchedInPrefix: 'Matched in',
    matchFields: {
      signal_id: 'Signal ID',
      headline: 'Headline',
      topic: 'Topic',
      tags: 'Tags',
      geography: 'Geography',
      claim_id: 'Claim ID',
      claim_statement: 'Claim',
      source_outlet: 'Publisher',
      source_title: 'Source title',
      source_group: 'Origin group',
      edition: 'Edition',
      event_date: 'Event date',
      narrative: 'Narrative',
    },
    appearancesCount: (count) => `${count} ${count === 1 ? 'edition' : 'editions'}`,
    materialUpdatesCount: (count) => `${count} material ${count === 1 ? 'update' : 'updates'}`,
    expandHistory: 'Show edition history',
    collapseHistory: 'Hide edition history',
    openEditionSignal: (date) => `Open ${date}`,
    openStoryline: 'Storyline',
    materialUpdateTag: 'Material update',
    keyboardHint: '↑↓ Navigate · Enter Open · Esc Close',
  },
  storyline: {
    triggerButton: 'Storyline History',
    dialogTitle: 'Longitudinal Storyline Tracker',
    dialogSubtitle: 'Editorial revision history across retained archive editions',
    close: 'Close storyline tracker',
    loadingHistory: (loaded, total) => `Loading archive editions (${loaded}/${total})…`,
    cancelLoading: 'Cancel',
    retryLoading: 'Retry loading',
    errorTitle: 'Unable to load storyline history',
    emptyTitle: 'No historical snapshots found',
    emptyBody: 'This signal ID does not appear in the currently loaded archive editions.',
    firstSeenLabel: 'First available appearance',
    lastSeenLabel: 'Last available appearance',
    lastMaterialUpdateLabel: 'Last material update',
    appearancesLabel: 'Appearances',
    lifecycleLabel: 'Recorded status',
    coverageLabel: 'Archive coverage',
    coverageComplete: (count) => `All ${count} retained archive editions inspected`,
    coverageIncomplete: (loaded, total) => `Incomplete coverage (${loaded} of ${total} archive editions loaded)`,
    coverageLimitedNote: (count) =>
      `Coverage reflects only the ${count} archived daily editions available in this publication index — not necessarily the complete historical life of the event.`,
    failedEditionsWarning: (dates) => `Failed to load edition(s): ${dates}.`,
    sameDayLimitationTitle: 'Same-day revision boundary',
    sameDayLimitationBody:
      'Each calendar date stores one canonical cumulative Markdown file. This tracker shows changes across retained daily edition snapshots, not every intraday sync run.',
    absentNotResolvedTitle: 'Absent from latest edition (not resolved)',
    absentNotResolvedBody: (lastSeen, latestDate) =>
      `Last recorded in ${lastSeen} and absent from ${latestDate}. Absence is an editorial omission, never proof that the underlying event is resolved or retracted.`,
    revisionTimelineTitle: 'Storyline Revision Timeline',
    revisionTimelineNote:
      'Chronological record of how WORLD SIGNAL recorded and revised this signal across archived editions.',
    eventTimelineDistinctionNote:
      'Distinct from the real-world Event Timeline inside the dossier narrative.',
    revisionKinds: {
      first_seen: 'First Seen',
      material_update: 'Material Update',
      unchanged: 'Unchanged',
      reappeared: 'Reappeared',
    },
    reappearedAfterGap: (days) => `Reappeared after ${days}-day gap`,
    inspectRevisionTitle: (date) => `Edition Snapshot · ${date}`,
    openHistoricalDossier: (date) => `Open ${date} Dossier`,
    noMaterialDiffNote:
      'No material factual, evidence, status, or narrative changes compared with the preceding appearance.',
    firstObservedNote:
      'Earliest observed snapshot of this stable signal ID in the available archive.',
    schemaV1Note: 'Recorded in Schema v1 edition format (continuity metadata derived deterministically).',
    narrativeChangedNote: 'Editorial narrative or event timeline updated.',
    topicChangedNote: (prev, curr) => `Topic/tags updated (${prev} → ${curr})`,
    eventMetaChangedNote: 'Event dates or geographic scope updated.',
    relationshipsChangedNote: (prevCount, currCount) =>
      `Declared relationships updated (${prevCount} → ${currCount})`,
  },
  readerDesk: {
    triggerLabel: 'Desk',
    dialogTitle: 'My Intelligence Desk',
    dialogSubtitle: 'Personal local research workspace',
    close: 'Close reader desk',
    localStorageNotice: 'Your Reader Desk is stored on this device. No account or remote sync is used.',
    storageWarningPrefix: 'Local storage notice',
    storageWarnings: {
      storage_unavailable: 'Browser storage is unavailable. Changes apply only to this session.',
      corrupt_state_recovered: 'Malformed local Reader Desk data was detected and safely reset.',
      migrated_legacy_state: 'Your saved Reader Desk data was migrated to the current format.',
      quota_exceeded: 'Device storage quota was reached; some local snapshots could not be saved.',
    },
    tabs: {
      catchUp: 'Catch-up',
      followed: 'Following',
      saved: 'Saved',
      topics: 'Topics',
    },
    saveAction: 'Save',
    savedAction: 'Saved',
    unsaveAction: 'Remove',
    followAction: 'Follow',
    followingAction: 'Following',
    unfollowAction: 'Unfollow',
    savedEmptyTitle: 'No saved signals yet',
    savedEmptyBody:
      'Save any signal from a dossier or Global Search to keep a reading list on this device.',
    savedOnLabel: (date) => `Saved · ${date}`,
    openSavedSignal: (date) => `Open ${date} dossier`,
    followedEmptyTitle: 'Not following any signals yet',
    followedEmptyBody:
      'Follow a stable Signal ID to monitor material updates, new claims, and source revisions across editions.',
    followedLoading: 'Checking followed signals across archived editions…',
    followedLastKnownEdition: 'Last known edition',
    followedLatestAppearance: 'Latest appearance',
    followedLastMaterialUpdate: 'Last material update',
    followedVersionsCount: (count) => `${count} archived ${count === 1 ? 'snapshot' : 'snapshots'}`,
    followedAbsentLatestNote: 'Not present in the latest edition (omitted, not necessarily resolved).',
    followedMissingArchiveNote: 'Not found in currently loaded archive editions.',
    topicsEmptyTitle: 'No followed topics yet',
    topicsEmptyBody:
      'Follow normalized editorial topics from the current edition to quickly filter related developments.',
    topicsAddLabel: 'Add normalized topic from current edition',
    topicsAddButton: 'Follow topic',
    topicsRemoveAction: 'Remove',
    topicsCurrentMatches: (count) => `${count} matching ${count === 1 ? 'signal' : 'signals'} in current edition`,
    clearDataButton: 'Clear local reader data',
    clearDataConfirm: 'Confirm clear all',
    clearDataCancel: 'Cancel',
    clearDataWarning:
      'This removes all saved signals, followed signals, topics, and reviewed checkpoints stored on this device.',
  },
  catchUp: {
    eyebrow: 'Since Your Last Visit',
    title: 'Editorial Catch-up Digest',
    firstVisitTitle: 'Set your first reviewed checkpoint',
    firstVisitBody: (editionDate, count) =>
      `You are reading edition ${editionDate} (${count} signals). Mark this edition as reviewed whenever you finish to track genuine content changes on your next visit.`,
    markAsReviewed: 'Mark as reviewed',
    reviewedCheckpointLabel: (date) => `Last reviewed: ${date}`,
    upToDateTitle: 'No material changes since your checkpoint',
    upToDateBody: (date) =>
      `The current edition has no material editorial changes compared with your reviewed checkpoint (${date}).`,
    baselineUnavailableTitle: 'Detailed comparison unavailable',
    baselineUnavailableSnapshot: (date) =>
      `Your last checkpoint (${date}) was on this date, but a prior local revision snapshot is unavailable. Mark as reviewed to capture a fresh baseline.`,
    baselineUnavailableArchived: (date) =>
      `Your last reviewed edition (${date}) is no longer present in the loaded archive and no local snapshot is available. Differences cannot be fabricated.`,
    changesHeadline: (fromDate, toDate) => `Changes since ${fromDate} → ${toDate}`,
    sameDayRevisionBadge: 'Same-day revision',
    usedLocalSnapshotNote: 'Compared deterministically against your compact local reviewed snapshot.',
    generalCatchUpTitle: 'Publication changes',
    personalCatchUpTitle: 'Followed signals needing attention',
    personalCatchUpEmpty: 'None of your followed signals changed materially since your last checkpoint.',
    groupNew: 'New signals',
    groupUpdated: 'Materially updated',
    groupReappeared: 'Reappeared',
    groupClaimChanges: 'Claim ledger updates',
    groupSourceChanges: 'Source ledger updates',
    groupOmitted: 'Omitted since checkpoint',
    openFullDigest: 'Inspect full catch-up',
    inspectNextHint: 'Inspect next',
    followedAlertKinds: {
      new: 'New',
      updated: 'Updated',
      reappeared: 'Reappeared',
      omitted: 'Omitted',
    },
  },
  editionCompare: {
    triggerButton: 'Compare editions',
    dialogTitle: 'Arbitrary Edition Comparison',
    dialogSubtitle: 'Deterministic diff between any two archived Markdown editions',
    close: 'Close edition comparison',
    fromEditionLabel: 'From edition',
    toEditionLabel: 'To edition',
    swapOrder: 'Swap',
    reorderedNote: (fromDate, toDate) =>
      `Displayed chronologically from older (${fromDate}) to newer (${toDate}).`,
    validationErrors: {
      insufficient_archive: 'At least two archived editions are required to compare editions.',
      missing_date: 'Select both a From edition and a To edition.',
      invalid_date_not_in_archive: 'One or both selected dates do not exist in the published archive index.',
      same_edition_selected: 'Select two different edition dates to compare.',
    },
    loadingPair: (fromDate, toDate) => `Loading editions ${fromDate} and ${toDate}…`,
    loadErrorTitle: 'Unable to load selected editions',
    retry: 'Retry',
    openPreviousVersion: (date) => `Previous (${date})`,
    openCurrentVersion: (date) => `Current (${date})`,
    daySpanLabel: (days) => `${days}-day span`,
    compareAction: 'Compare',
  },
  media: {
    sectionTitle: 'Supporting Editorial Media',
    sectionSubtitle:
      'Rights-verified visual context attached to this signal. Visual media provides context only and is excluded from independent reporting-origin and claim-corroboration counts.',
    relationships: {
      direct_event_documentation: 'Direct Event Documentation',
      contextual: 'Contextual Image',
      illustrative: 'Editorial Illustration',
      data_visualization: 'Data Visualization',
    },
    relationshipDisclosures: {
      direct_event_documentation: 'Verified documentation of the reported event',
      contextual: 'Contextual reference — does not directly document the reported event',
      illustrative: 'Illustrative visual — conceptual, not documentary photography',
      data_visualization: 'Structured chart, map, or analytical diagram',
    },
    mediaTypes: {
      photograph: 'Photograph',
      illustration: 'Illustration',
      chart: 'Chart',
      map: 'Map',
      diagram: 'Diagram',
      document_scan: 'Document Scan',
      screenshot: 'Screenshot',
    },
    sourcePageLink: 'Original media page',
    licenseLink: 'License',
    creatorLabel: 'Creator',
    depictedLabel: 'Depicted',
    uncroppedNote: 'Displayed uncropped per rights terms',
    unavailableFallbackTitle: 'External media unavailable',
    unavailableFallbackBody:
      'This remote image could not be loaded. Original attribution and provenance links remain available below.',
    nonEvidenceNote: 'Visual context only · Excluded from reporting-origin counts',
    supportingCount: (count) =>
      count === 1 ? '1 supporting asset' : `${count} supporting assets`,
  },
};

const ZH_DICT: UiDictionary = {
  brandTagline: '循证每日情报简报',
  nav: {
    briefing: '简报',
    expanded: '深度信号',
    synthesis: '综合与影响',
    audit: '来源与审计',
  },
  navShort: {
    briefing: '简报',
    expanded: '信号',
    synthesis: '综合',
    audit: '审计',
  },
  archive: {
    button: '档案',
    title: '期刊档案与偏好设置',
    subtitle: '静态 Markdown 日报档案（美西时间）',
    latest: '最新一期',
    previousEdition: '上一期',
    nextEdition: '下一期',
    editionsCount: (n) => `已归档 ${n} 期`,
    emptyArchive: '当前档案库中尚无已发布期刊。',
    refreshEdition: '检查当日更新',
    refreshing: '正在检查…',
    refreshedNotice: '已与最新档案索引同步检查。',
    appearance: '界面外观',
    lightMode: '浅色',
    darkMode: '深色',
    interfaceLanguage: '界面语言',
    developerTools: '本地校验工具',
    developerToolsHint: '在浏览器内存中预览本地 Markdown 日报文件，不会改动已发布档案。',
    loadLocalMarkdown: '加载本地 Markdown 预览',
    localPreviewActive: '本地 Markdown 预览模式（非正式档案）',
    exitPreview: '返回已发布档案',
    close: '关闭',
    searchPlaceholder: '按日期、状态或提要关键词筛选期刊…',
    noMatchingEditions: '没有符合筛选条件的归档期刊。',
    matchingCount: (shown, total) => `显示 ${shown} / ${total} 期`,
  },
  masthead: {
    editionLabel: '期次',
    updatedLabel: '最后更新',
    syncCycleLabel: '同步时段',
    statusLabel: '状态',
    coverageWindowLabel: '覆盖窗口',
    signalsCount: (n) => `${n} 个信号`,
    independentOriginsCount: (n) => `${n} 个独立报道来源`,
    claimsCount: (n) => `${n} 条声明`,
    recordsCount: (n) => `${n} 条来源记录`,
    diagnosticsLink: (errors, warnings) => `${errors} 项错误 · ${warnings} 项提示`,
  },
  briefing: {
    leadKicker: '本期焦点',
    executiveSummaryTitle: '本期提要',
    editorialLimitationsTitle: '阅读须知与覆盖局限',
    topSignalsTitle: '重点信号',
    topSignalsNote: '按本期编辑部遴选顺序排列',
    readDossier: '阅读完整档案',
    domainsOverviewTitle: '三大领域概览',
    exploreDomain: '查看该领域信号',
    additionalSignalsTitle: '本期其余信号索引',
    additionalSignalsSubtitle: '除上述重点信号外，按三大领域分组的紧凑索引。',
    readingPathTitle: '继续深读',
    readingPathSubtitle: '从执行摘要进入完整信号档案、跨领域综合分析或完整来源审计。',
    openExpandedDesc: '逐条查看全部信号的时间线、声明核验、来源视角与情景推演。',
    openSynthesisDesc: '浏览有证据支持的跨领域因果链、时间维度影响、个人启示与观察清单。',
    openAuditDesc: '核查去重后的独立报道源、声明到来源的完整证据链、更正记录与未解问题。',
    summaryExpand: '展开完整提要',
    summaryCollapse: '收起完整提要',
    limitationsExpand: (count) =>
      count > 1 ? `展开全部 ${count} 条局限与更新说明` : '展开完整说明',
    limitationsCollapse: '收起说明',
    artworkCaption: '焦点信号结构图解',
    artworkIllustrativeNote: '基于结构化元数据生成的示意图解，非纪实摄影或现场证据。',
    artworkOriginsLabel: '独立源',
    artworkClaimsLabel: '声明',
    artworkSourcesLabel: '来源记录',
    artworkTimelineMilestones: (count) => `${count} 个纪实节点`,
    artworkDeclaredLinks: (count) => `${count} 条显式关联`,
    artworkOverflowNote: (displayed, total) => `图面示意 ${displayed} 节点（实际共 ${total} 个独立源）`,
    domainShareLabel: (pct) => `占本期 ${pct}%`,
    domainBalanceTitle: '本期三大领域覆盖结构',
    domainHighPriorityCount: (count) => `${count} 项高优先级（4–5/5）`,
    domainImp5Label: '5/5 极高',
    domainImp4Label: '4/5 高',
    domainImpOtherLabel: '1–3/5 常规',
    mastheadDescriptor: '独立全球情报与循证简报',
    coverPlateTitles: {
      world: '地缘经纬结构图版',
      ai: '前沿架构拓扑图版',
      economy: '宏观传导结构图版',
    },
    coverPlateFolio: {
      world: '图版一',
      ai: '图版二',
      economy: '图版三',
    },
    coverEditionDeskLabel: '本期编务简报',
  },
  dailyDelta: {
    eyebrow: '每日变动监测',
    title: '跨期变化账本',
    comparingRange: (prev, curr) => `对比期次：${prev} → ${curr}`,
    dateGapNote: (days, prev) =>
      `档案间隔 ${days} 天：与时间上最近一期可用期刊（${prev}）进行对比，不假设为前一日。`,
    schemaTransitionNote: (prevV, currV) =>
      `数据结构由 v${prevV} 升级至 v${currV}：新增的结构化时间线事件或显式关联字段可能反映版本迁移，同时保留实质编辑变动。`,
    loadingLabel: (prev) => `正在加载上一可用期刊（${prev}）以计算确定性跨期变动…`,
    categories: {
      new: '新增信号',
      updated: '实质更新',
      unchanged: '无实质变化',
      omitted: '本期未收录',
    },
    categoryDescriptions: {
      new: '相对上一可用期刊首次出现',
      updated: '事实、状态、置信度或证据发生变动',
      unchanged: '核心内容无变动（已忽略例行时间戳）',
      omitted: '上期存在但本期未出现（不代表事件已解决）',
    },
    categoryBadges: {
      new: '新增',
      updated: '更新',
      unchanged: '未变',
      omitted: '未收录',
    },
    reasons: {
      headline: '标题',
      importance: '重要性',
      status: '状态',
      confidence: '置信度',
      topic: '主题与标签',
      event: '事件信息',
      claims: '声明核验',
      sources: '来源记录',
      relationships: '关联关系',
      narrative: '正文与时间线',
    },
    emptyCategory: '该对比类别在本期中暂无信号。',
    omittedNoticeTitle: '未收录不等于事件已解决',
    omittedNoticeBody: (prev, curr) =>
      `以下信号曾收录于 ${prev} 期，但未出现在 ${curr} 期中。未收录并不表示事件已经结束、解决或被撤回；点击任意信号将跳转至 ${prev} 期打开其原始档案。`,
    omittedItemExplanation: (prev, curr) =>
      `见于 ${prev} 期，未收录于 ${curr} 期；未收录不代表事件已解决或撤回。`,
    newItemExplanation: (curr, claims, sources) =>
      `于 ${curr} 期首次出现，附带 ${claims} 条结构化声明与 ${sources} 条来源记录。`,
    unchangedItemExplanation: (prev) =>
      `自 ${prev} 期以来无实质编辑变动；例行同步与来源访问时间不计为更新。`,
    updatedReasonsPrefix: '变动维度',
    evidenceToggleShow: '展开证据变动明细',
    evidenceToggleHide: '收起证据变动明细',
    evidenceSummaryClaims: (added, revised, withdrawn) => {
      const parts: string[] = [];
      if (added > 0) parts.push(`新增 ${added}`);
      if (revised > 0) parts.push(`修订 ${revised}`);
      if (withdrawn > 0) parts.push(`撤回 ${withdrawn}`);
      return `声明：${parts.join(' / ')}`;
    },
    evidenceSummarySources: (added, revised, removed) => {
      const parts: string[] = [];
      if (added > 0) parts.push(`新增 ${added}`);
      if (revised > 0) parts.push(`修订 ${revised}`);
      if (removed > 0) parts.push(`移除 ${removed}`);
      return `来源：${parts.join(' / ')}`;
    },
    addedClaimsLabel: '新增声明',
    revisedClaimsLabel: '修订声明',
    withdrawnClaimsLabel: '撤回声明',
    addedSourcesLabel: '新增来源',
    revisedSourcesLabel: '修订来源',
    removedSourcesLabel: '移除来源',
    routineMetadataNote:
      '基于稳定 signal_id 进行确定性比对；例行期刊同步时间与来源抓取时间戳已排除。',
    openCurrentDossier: '打开档案',
    openPreviousDossier: (prev) => `在 ${prev} 期中打开`,
    showAllCategory: (total, label) => `展开全部 ${total} 个${label}`,
    showFewerCategory: '收起列表',
    unavailableTitle: '暂无法生成跨期对比',
    unavailableLocalPreview:
      '每日变动监测仅对已归档期刊进行确定性比对；本地 Markdown 预览模式下不生成历史对比，也不虚构零值统计。',
    unavailableNoPrevious: (curr) =>
      curr
        ? `${curr} 为当前档案库中最早一期，暂无更早期刊可供跨期对比。`
        : '当前档案库中暂无更早期刊可供跨期对比。',
    unavailableLoadFailed: (prev) =>
      prev
        ? `加载上一可用期刊（${prev}）失败，暂无法计算跨期变动。`
        : '加载上一可用期刊失败，暂无法计算跨期变动。',
    unavailableIncomplete: '当前期刊缺少完整的历史对比条件，暂无法生成跨期变动。',
    retryComparison: '重试对比',
    transitionImportance: (prev, curr) => `重要性 ${prev}/5 → ${curr}/5`,
    transitionStatus: (prev, curr) => `状态：${prev} → ${curr}`,
    transitionConfidence: (prev, curr) => `置信度：${prev} → ${curr}`,
    headlineChangedNote: (prevHeadline) => `上期标题：“${prevHeadline}”`,
  },
  expanded: {
    title: '深度信号浏览器',
    subtitle: '按领域、重要性、置信度、主题与来源类型筛选，并逐条审阅完整证据档案。',
    searchPlaceholder: '搜索标题、事实、声明、媒体机构…',
    filtersButton: '筛选条件',
    resetFilters: '重置筛选',
    showingCount: (shown, total) => `显示 ${shown} / ${total} 个信号`,
    allDomains: '全部领域',
    allConfidence: '全部置信度',
    allStatus: '全部状态',
    allTopics: '全部主题',
    allTags: '全部标签',
    allSourceClasses: '全部来源类别',
    importanceMin: (n) => (n === 1 ? '不限重要性' : `重要性 ≥ ${n}/5`),
    noMatchesTitle: '没有符合当前筛选条件的信号',
    noMatchesBody: '请放宽或重置筛选条件以查看本期收录的信号。',
    backToList: '返回信号列表',
    copySignalLink: '复制链接',
    copiedLink: '已复制',
    eventDateLabel: '事件日期',
    publishedLabel: '发布时间',
    firstVerifiedLabel: '首次核实',
    updatedLabel: '最近更新',
    geographyLabel: '涉及地区',
    topicLabel: '主题',
    importanceLabel: '重要性',
    confidenceLabel: '置信度',
    confidenceRationaleTitle: '置信度依据',
    sectionJumpLabel: '目录跳转',
    sections: {
      whatHappened: '事件经过',
      verifiedFacts: '已核实事实',
      timeline: '时间线',
      whyItMatters: '重要意义',
      sourcePerspectives: '来源视角',
      analysis: '深度分析',
      uncertainties: '不确定性与分歧',
      scenarios: '情景推演',
      personalRelevance: '个人相关性',
      whatToWatch: '后续观察点',
      media: '编务影像与图资',
      claims: '声明核验账本',
      sources: '来源记录账本',
      related: '关联信号',
    },
    scenarioKinds: {
      base: '基准情景',
      downside: '下行风险',
      upside: '上行情景',
      other: '情景',
    },
    claimsEmpty: '该信号暂无结构化声明记录。',
    sourcesEmpty: '该信号暂无来源记录。',
    supportingSources: '支撑来源',
    supportsClaims: '支撑声明',
    qualifiesIndependent: '计入独立报道源',
    excludedFromIndependent: '不计入独立报道源',
    registryIdLabel: '名录编号',
    unregisteredCandidate: '候选来源（待纳入名录）',
    unsafeUrlBlocked: '已拦截不安全链接',
    openSource: '查看原文',
    relatedSignalsTitle: '本期关联信号',
    relatedNotInEdition: '指向非本期收录的信号',
    domainTabShort: {
      all: '全部',
      world: '世界',
      ai: 'AI',
      economy: '经济',
    },
    evidenceChainLabel: '信号 → 声明 → 来源记录 → 独立报道源',
    sourceGroupLabel: '独立来源分组',
    sourceTagsLabel: '标签',
    showAllClaims: (total) => `展开全部 ${total} 条声明`,
    showAllSources: (total) => `展开全部 ${total} 条来源`,
    showFewerItems: '收起',
    activeFiltersLabel: (count) => `已启用 ${count} 项筛选`,
    continuityLabel: '故事线延续性',
    firstSeenLabel: '首次见于',
    lastUpdateLabel: '最近实质更新',
    historyIncompleteNote: '档案回溯不完整',
    layerFactual: '第一部分 · 核实记录与时间线',
    layerInterpretive: '第二部分 · 重要意义与深度分析',
    layerForwardLooking: '第三部分 · 不确定性与前瞻情景',
    typedRelationshipsTitle: '显式声明的信号关联',
    typedRelationshipsSubtitle: '期刊元数据中显式标注类型、依据与支撑声明的跨信号关联。',
    supportingClaimsLabel: '支撑声明',
    legacyRelatedTitle: '背景关联信号',
    legacyRelatedNote: '仅来自 related_signal_ids 的粗粒度背景关联，不代表因果关系。',
    structuredTimelineBadge: '绑定证据链的纪实节点',
    dossierOutlineTitle: '档案目录',
    evidenceSnapshotTitle: '证据速览',
    prevSignal: '上一信号',
    nextSignal: '下一信号',
    signalPosition: (current, total) => `第 ${String(current).padStart(2, '0')} / ${String(total).padStart(2, '0')} 篇`,
  },
  synthesis: {
    title: '跨领域综合、影响与观察清单',
    subtitle: '基于证据的跨领域传导机制、分时间维度影响、条件情景、一般性个人启示与关键节点清单。',
    crossDomainTitle: '跨领域综合联系',
    crossDomainSubtitle: '仅记录有明确来源支撑的跨领域联系；未建立证据链的关联单独列出、不作推断。',
    establishedLabel: '有证据支撑的联系',
    unestablishedLabel: '未建立的联系（不作推断）',
    linkedSignalsLabel: '关联信号',
    impactAnalysisTitle: '经济与结构性时间维度影响',
    impactAnalysisSubtitle: '提炼自本期经济展望信号中明确记录的即时、短期、中期与结构性传导。',
    scenariosSectionTitle: '重点信号条件情景汇总',
    scenariosSectionSubtitle: '按基准、下行、上行条件呈现定性路径，不附加虚构的概率百分比。',
    personalImplicationsTitle: '个人启示与决策支持',
    personalDisclaimerFallback:
      '以下内容仅供一般性信息与决策参考，不构成个性化投资、财务、法律或医疗建议。',
    watchlistTitle: '后续观察清单',
    watchlistSubtitle: '值得持续追踪的宏观数据发布、政策会议与核验触发点。',
    watchlistCols: {
      indicator: '观察指标或事件',
      whyItMatters: '关注理由',
      nextCheckpoint: '下一个关键节点',
      signalsLinked: '关联信号',
    },
    watchlistUnlinked: '暂无关联信号',
    noThreadsFallback: '本期暂无结构化跨领域联系记录。',
    relationshipMapTitle: '显式信号关联图谱与矩阵',
    relationshipMapSubtitle: '仅投影本期元数据中显式声明的信号关联，不根据时间先后或内容相似自动推断因果。',
    relationshipFilterAllExplicit: '全部显式关联',
    relationshipToggleLegacy: (count) => `显示粗粒度背景关联（${count}）`,
    relationshipInspectPrompt: '点击图谱连线或下方账本条目，可查看该关联的完整理由、置信度与支撑声明。',
    relationshipNoExplicit: '本期未声明带类型的 Schema v2 信号关联。',
    relationshipExplicitBadge: '显式类型关联',
    relationshipLegacyBadge: '背景关联（非因果）',
    relationshipUnresolvedNote: (count) => `另有 ${count} 条显式关联指向非本期收录的跨期信号。`,
    relationshipSourceNode: '起点信号',
    relationshipTargetNode: '目标信号',
    relationshipEvidenceClaims: '支撑声明',
    relationshipEdgeCount: (shown, total) => `显示 ${shown} / ${total} 条关联`,
    watchlistFilterAll: '全部观察项',
    watchlistFilterLinked: '仅看关联信号项',
    relationshipFocusAll: '全部关联信号',
    relationshipFocusLabel: '聚焦信号',
    relationshipClearFocus: '恢复全图',
    relationshipKeyboardHint: '支持键盘 Tab 与回车键逐项检视节点与关联。',
  },
  audit: {
    title: '来源审计、证据链与方法论',
    subtitle: '由单一权威规则引擎派生的独立来源统计、声明级证据追溯、更正档案与格式校验诊断。',
    overviewTitle: '来源与证据统计概览',
    overviewCards: {
      independentOrigins: '独立报道机构数',
      qualifyingRecords: '合格原创报道记录',
      totalSourceRecords: '来源记录总数',
      excludedRecords: '排除/非独立记录',
      primaryAndResearch: '一级文件与研究论文',
      claimsAudited: '已审计声明总数',
    },
    sourceBreakdownTitle: '来源类别构成',
    originExplorerTitle: '独立报道源分组浏览器',
    originExplorerSubtitle:
      '按 independence_group 分组展示全部来源记录，明确区分计入独立报道的原创机构与按规则排除的转载/一级来源。',
    originFilterAll: '全部分组',
    originFilterQualifying: '仅计入独立源',
    originFilterExcluded: '仅排除项',
    originCountedBadge: '计入独立源',
    originExcludedBadge: '不计入独立源',
    originOutletsLabel: '涉及媒体/机构',
    originSignalsLabel: '覆盖信号',
    originRecordsLabel: (q, t) => `${q} 条计入 / 共 ${t} 条`,
    originExclusionReasonLabel: '排除原因',
    unassignedTitle: '未分组来源记录（无独立报道源分组）',
    unassignedSubtitle:
      '以下记录缺少 independence_group 标识，按规则不计入独立报道源数量，且彼此之间不代表同一新闻机构，以下逐条列出供审计。',
    unassignedBadge: '未分组记录',
    claimLedgerTitle: '声明核验账本',
    claimLedgerSubtitle: '完整追溯每条声明：信号 → 声明 → 来源记录 → 独立报道源。',
    claimFilterStatus: '全部声明状态',
    claimFilterConfidence: '全部置信度',
    claimFilterSignal: '全部信号',
    claimFilterSources: '独立源覆盖',
    claimSourcesAll: '全部声明',
    claimSourcesWithIndependent: '具备独立报道源',
    claimSourcesNoIndependent: '无独立报道源',
    claimTraceLabel: '证据链追溯',
    distributionTitle: '置信度与重要性分布对比',
    distributionSubtitle: '置信度衡量核实充分程度，与编辑重要性严格分离。',
    confidenceDistribution: '按置信度分布',
    importanceDistribution: '按重要性分布（1–5）',
    editorialTrailTitle: '编辑部审计与更正记录',
    trailTabs: {
      sourceAudit: '来源审计',
      openQuestions: '未解问题',
      corrections: '更正记录',
      methodology: '方法论说明',
      diagnostics: '格式校验诊断',
    },
    diagnosticsValid: '全部必需的内容规范校验均已通过。',
    diagnosticsErrors: '错误',
    diagnosticsWarnings: '提示与警告',
    noItemsInSection: '该分节暂无记录。',
    compositionTitle: '来源记录构成比例（由单一规则引擎派生）',
    compositionQualifying: '合格原创报道',
    compositionSyndicated: '通稿转载去重',
    compositionPrimaryResearch: '一级文件与研究',
    compositionOtherExcluded: '其余排除记录',
    showMoreOutlets: (count) => `展开其余 ${count} 个机构`,
    showMoreSignals: (count) => `展开其余 ${count} 个信号`,
    showFewerList: '收起',
    traceFlowLabel: '信号 → 声明 → 来源记录 → 独立报道源',
    claimSearchPlaceholder: '搜索声明内容、声明编号或信号编号…',
    matrixTitle: '重要性 × 置信度交叉矩阵',
    matrixSubtitle: '基于本期真实信号计数的二维分布，直观检验“高重要性”与“高置信度”的独立评估原则。',
    matrixImportanceAxis: '重要性',
    matrixTotalCol: '合计',
    matrixTotalRow: '各列合计',
    claimLoadMore: (count) => `再加载 ${count} 条声明`,
    claimShowAll: (total) => `展开全部 ${total} 条声明`,
    claimShowingRange: (shown, total) => `当前显示 ${shown} / ${total} 条匹配声明`,
    verificationRatioLabel: '合格原创记录占比',
    matrixAxisNote: '纵轴衡量编辑重要性（影响级别），横轴衡量证据核验置信度，二者独立评估。',
    originSummaryRibbon: (q, e) => `${q} 个计入独立报道源 · ${e} 个排除/转载分组`,
  },
  emptyState: {
    eyebrow: '档案状态',
    title: '尚无已发布期刊',
    body: '当前静态档案中还没有已发布的 WORLD SIGNAL Markdown 日报。生成并建立索引后，真实期刊将自动呈现在此。',
    domainsNote: '本刊持续追踪三大核心领域：世界动态、人工智能前沿与经济展望。',
    checkAgain: '重新检查档案',
    openLocalTool: '打开本地 Markdown 预览',
  },
  localModal: {
    title: '本地 Markdown 校验预览',
    subtitle: '在浏览器内存中解析并预览本地 WORLD SIGNAL 日报文件，不会上传或修改服务器内容。',
    uploadFile: '选择 .md 文件',
    pasteLabel: '或直接粘贴日报 Markdown 原文',
    pastePlaceholder: '---\nschema_version: 1\nedition_date: "2026-11-23"\n...',
    previewButton: '渲染预览',
    cancelButton: '取消',
    emptyWarning: '请先选择 Markdown 文件或粘贴内容。',
  },
  errorState: {
    title: '无法加载期刊',
    retry: '重试',
    openArchive: '打开档案',
  },
  loading: '正在加载每日情报简报…',
  domains: {
    world: '世界动态',
    ai: '人工智能前沿',
    economy: '经济展望',
  },
  confidence: {
    high: '高置信度',
    medium: '中等置信度',
    low: '低置信度',
    unverified: '未核实',
  },
  signalStatus: {
    new: '新增',
    developing: '演变中',
    ongoing: '持续',
    confirmed: '已证实',
    disputed: '存在争议',
    unverified: '未核实',
    closed: '已结束',
    corrected: '已更正',
  },
  claimStatus: {
    confirmed: '已证实',
    reported: '已报道',
    official_claim: '官方宣称',
    disputed: '存在争议',
    unverified: '未核实',
  },
  editionStatus: {
    draft: '草稿版',
    reviewed: '已审校',
    published: '正式发布',
  },
  syncRun: {
    morning: '早间同步',
    midday: '午间同步',
    evening: '晚间同步',
    manual: '手动同步',
  },
  sourceClass: {
    tier_1_newsroom: '一线新闻机构',
    specialist_publication: '专业权威媒体',
    primary_source: '一级原始来源',
    research_paper: '学术研究论文',
    unknown: '未分类来源',
  },
  relationship: {
    original_reporting: '原创报道',
    syndicated: '通稿转载',
    official_statement: '官方声明',
    company_announcement: '企业公告',
    research_artifact: '研究报告/产物',
    secondary_analysis: '二次分析',
    unknown: '未知来源关系',
  },
  signalRelationshipType: {
    same_event: '同一事件',
    contextual: '背景关联',
    policy_response: '政策回应',
    market_transmission: '市场传导',
    technological_dependency: '技术依赖',
    causal_link: '因果链条',
    potential_link: '潜在关联',
  },
  signalLifecycle: {
    new: '新增',
    developing: '演变中',
    ongoing: '持续追踪',
    monitoring: '持续监测',
    resolved: '已解决',
    archived: '已归档',
  },
  exclusionReason: {
    flagged_non_independent: '元数据标注为非独立来源',
    missing_independence_group: '缺少独立来源分组标识',
    primary_source: '一级来源（按规则不计入独立新闻机构数）',
    research_paper: '研究论文（按规则不计入独立新闻机构数）',
    unknown_source_class: '来源类别缺失或无效（按规则排除）',
    syndicated: '转载副本（去重排除，不重复计数）',
    official_statement: '官方声明',
    company_announcement: '企业公告',
    research_artifact: '研究产物',
    secondary_analysis: '二次分析',
    unknown_relationship: '来源关系缺失或无效（按规则排除）',
  },
  metaLine: {
    importance: (n) => `重要性 ${n}/5`,
    confidence: (label) => `置信度：${label}`,
    origins: (n) => `${n} 个独立源`,
    claims: (n) => `${n} 条声明`,
  },
  globalSearch: {
    triggerLabel: '全局搜索',
    shortcutHint: '⌘K',
    dialogTitle: '全球情报跨期搜索',
    dialogSubtitle: '基于权威 Markdown 归档期刊的确定性跨期检索',
    inputPlaceholder: '搜索信号 ID、标题、声明内容、媒体来源、主题或中英文关键词…',
    clearQuery: '清除搜索词',
    close: '关闭搜索',
    sortLabel: '排序方式',
    sortOptions: {
      relevance: '相关度',
      latest: '最新出现',
      importance: '重要性',
      confidence: '置信度',
    },
    sortExplainer: {
      relevance: '按确定性字段权重排序（信号 ID > 标题 > 声明 > 来源 > 正文）',
      latest: '按最新匹配的期刊日期降序排列',
      importance: '按编辑重要性 5 至 1 排列（独立于验证置信度）',
      confidence: '按验证置信度由高到低排列（独立于重要性）',
    },
    filtersToggle: '高级筛选',
    activeFiltersCount: (count) => `已选 ${count} 项`,
    resetFilters: '重置筛选',
    dateFromLabel: '起始期数',
    dateToLabel: '截止期数',
    claimStatusLabel: '声明状态',
    allClaimStatuses: '全部声明状态',
    publisherLabel: '媒体 / 机构来源',
    publisherPlaceholder: '例如 Reuters、路透、FT',
    indexingStatus: (indexed, total) => `正在检索归档期刊：已索引 ${indexed} / ${total} 期…`,
    indexedCompleteStatus: (total) => `已完成全部 ${total} 期归档期刊检索`,
    partialResultsBanner: (indexed, total) =>
      `部分结果：当前已索引 ${indexed} / ${total} 期，历史期刊正在按批增量加载。`,
    cancelSearch: '停止加载',
    resumeIndexing: '继续索引剩余期数',
    cancelledBanner: (indexed, total) =>
      `已在加载 ${indexed} / ${total} 期后暂停，当前结果仅反映已索引期数。`,
    failedEditionsBanner: (count, dates) =>
      `有 ${count} 期历史期刊加载失败（${dates}），搜索结果可能不完整。`,
    malformedEditionsNote: (count) =>
      `有 ${count} 期存在结构校验警告，已解析字段仍参与检索。`,
    initialPromptTitle: '跨期检索 WORLD SIGNAL 历史档案',
    initialPromptBody:
      '输入稳定信号 ID、中英文关键词、声明文本或来源媒体，或使用高级筛选条件追溯历史信号。',
    searchingEmptyNote: (indexed, total) =>
      `前 ${indexed} / ${total} 期暂未发现匹配，正在继续检索更早的历史期刊…`,
    noResultsTitle: '未找到匹配的信号',
    noResultsBody: '请尝试放宽关键词条件，或重置当前高级筛选器。',
    resultsSummary: (signals, occurrences) =>
      `共找到 ${signals} 个独立信号（涵盖 ${occurrences} 条跨期记录）`,
    matchedInPrefix: '命中字段',
    matchFields: {
      signal_id: '信号 ID',
      headline: '标题',
      topic: '主题',
      tags: '标签',
      geography: '地理区域',
      claim_id: '声明 ID',
      claim_statement: '声明陈述',
      source_outlet: '发布媒体',
      source_title: '来源标题',
      source_group: '来源分组',
      edition: '期刊信息',
      event_date: '事件日期',
      narrative: '正文分析',
    },
    appearancesCount: (count) => `出现于 ${count} 期`,
    materialUpdatesCount: (count) => `${count} 次实质更新`,
    expandHistory: '展开跨期记录',
    collapseHistory: '收起跨期记录',
    openEditionSignal: (date) => `查看 ${date} 期`,
    openStoryline: '脉络追踪',
    materialUpdateTag: '实质更新',
    keyboardHint: '↑↓ 选择 · Enter 打开 · Esc 关闭',
  },
  storyline: {
    triggerButton: '脉络历史',
    dialogTitle: '纵向事件脉络追踪',
    dialogSubtitle: '基于已保留归档期刊的信号修订历程',
    close: '关闭脉络追踪',
    loadingHistory: (loaded, total) => `正在按需加载历史期刊（${loaded}/${total}）…`,
    cancelLoading: '取消加载',
    retryLoading: '重新加载',
    errorTitle: '无法加载脉络历史',
    emptyTitle: '未找到历史快照',
    emptyBody: '在当前已加载的归档期刊中未发现该信号 ID 的记录。',
    firstSeenLabel: '档案首次出现',
    lastSeenLabel: '档案最近出现',
    lastMaterialUpdateLabel: '最近实质更新',
    appearancesLabel: '出现期数',
    lifecycleLabel: '当前状态',
    coverageLabel: '档案覆盖度',
    coverageComplete: (count) => `已完整核查全部 ${count} 期已保留档案`,
    coverageIncomplete: (loaded, total) => `历史覆盖不完整（已加载 ${loaded} / ${total} 期）`,
    coverageLimitedNote: (count) =>
      `当前覆盖范围仅反映档案索引中现有的 ${count} 期日报快照，并不代表该事件的完整历史周期。`,
    failedEditionsWarning: (dates) => `以下期刊加载失败：${dates}。`,
    sameDayLimitationTitle: '同日修订边界说明',
    sameDayLimitationBody:
      '每个日历日仅保留一份权威累积 Markdown 文件。本脉络追踪反映跨日归档快照之间的变更，而非同一天内每次 Muse 同步记录。',
    absentNotResolvedTitle: '最新一期未收录（并不代表事件已解决）',
    absentNotResolvedBody: (lastSeen, latestDate) =>
      `该信号最后记录于 ${lastSeen}，在 ${latestDate} 期未出现。未收录仅属编辑省略，不能推断事件已解决或撤回。`,
    revisionTimelineTitle: '信号修订脉络时间轴',
    revisionTimelineNote:
      '按时间顺序列出 WORLD SIGNAL 在各期归档中对该信号的记录与实质性修订。',
    eventTimelineDistinctionNote:
      '注意：此处为期刊修订历史，区别于档案正文中的“事件时间线”。',
    revisionKinds: {
      first_seen: '首次记录',
      material_update: '实质更新',
      unchanged: '无实质变化',
      reappeared: '间隔后再现',
    },
    reappearedAfterGap: (days) => `间隔 ${days} 天后重新出现`,
    inspectRevisionTitle: (date) => `期刊快照 · ${date}`,
    openHistoricalDossier: (date) => `打开 ${date} 期完整档案`,
    noMaterialDiffNote: '相较上一次出现，该信号无实质性的事实、证据、状态或正文变更。',
    firstObservedNote: '该稳定信号 ID 在当前可用归档中的最早观察记录。',
    schemaV1Note: '该期采用 Schema v1 格式，连续性与变更由确定性对比引擎计算得出。',
    narrativeChangedNote: '正文叙事或事件时间线已更新。',
    topicChangedNote: (prev, curr) => `主题/标签变更（${prev} → ${curr}）`,
    eventMetaChangedNote: '事件日期或地理范围元数据已更新。',
    relationshipsChangedNote: (prevCount, currCount) =>
      `关联关系已更新（${prevCount} → ${currCount}）`,
  },
  readerDesk: {
    triggerLabel: '研究台',
    dialogTitle: '我的情报研究台',
    dialogSubtitle: '本地优先个人研究工作区',
    close: '关闭研究台',
    localStorageNotice: '你的研究台数据仅保存在本设备浏览器本地，无需账号，也不会上传至服务器。',
    storageWarningPrefix: '本地存储提示',
    storageWarnings: {
      storage_unavailable: '当前浏览器环境不可使用本地存储，操作仅在本次会话生效。',
      corrupt_state_recovered: '检测到损坏的本地研究台数据，已安全恢复为空白状态。',
      migrated_legacy_state: '本地研究台数据已安全迁移至最新格式。',
      quota_exceeded: '设备本地存储空间不足，部分本地快照未能保存。',
    },
    tabs: {
      catchUp: '自上次阅读',
      followed: '追踪中',
      saved: '稍后阅读',
      topics: '关注主题',
    },
    saveAction: '收藏',
    savedAction: '已收藏',
    unsaveAction: '移除',
    followAction: '追踪',
    followingAction: '已追踪',
    unfollowAction: '取消追踪',
    savedEmptyTitle: '暂无收藏信号',
    savedEmptyBody: '在信号档案页或全局搜索结果中点击“收藏”，即可将信号保存至本设备的稍后阅读清单。',
    savedOnLabel: (date) => `收藏于 ${date}`,
    openSavedSignal: (date) => `打开 ${date} 期档案`,
    followedEmptyTitle: '尚未追踪任何信号',
    followedEmptyBody: '按稳定信号 ID 追踪重要议题，跨期监测实质更新、新增声明与来源修订。',
    followedLoading: '正在核查已追踪信号的跨期状态…',
    followedLastKnownEdition: '上次已知期数',
    followedLatestAppearance: '最新出现期数',
    followedLastMaterialUpdate: '最近实质更新',
    followedVersionsCount: (count) => `共 ${count} 个归档版本`,
    followedAbsentLatestNote: '最新一期未收录（属编辑省略，不代表事件已解决）。',
    followedMissingArchiveNote: '当前已加载的归档期刊中未找到该信号记录。',
    topicsEmptyTitle: '尚未关注任何主题',
    topicsEmptyBody: '从当前期刊的规范化主题中选择关注，快速聚焦相关动态。',
    topicsAddLabel: '从当前期刊添加规范化主题',
    topicsAddButton: '关注主题',
    topicsRemoveAction: '移除',
    topicsCurrentMatches: (count) => `当前期刊含 ${count} 条匹配信号`,
    clearDataButton: '清空本地研究台数据',
    clearDataConfirm: '确认全部清空',
    clearDataCancel: '取消',
    clearDataWarning: '此操作将清除本设备保存的所有收藏信号、追踪信号、关注主题及已阅检查点。',
  },
  catchUp: {
    eyebrow: '自上次阅读以来',
    title: '情报变更速览',
    firstVisitTitle: '建立你的首个已阅检查点',
    firstVisitBody: (editionDate, count) =>
      `当前正在阅读 ${editionDate} 期（共 ${count} 条信号）。阅读完成后点击“标记为已阅”，下次回来即可自动比对真实内容变更。`,
    markAsReviewed: '标记为已阅',
    reviewedCheckpointLabel: (date) => `上次已阅：${date}`,
    upToDateTitle: '自上次已阅以来暂无实质变更',
    upToDateBody: (date) => `与你的已阅检查点（${date}）相比，当前期刊未检测到实质性编辑变更。`,
    baselineUnavailableTitle: '无法生成详细变更对比',
    baselineUnavailableSnapshot: (date) =>
      `你的上次检查点位于当日（${date}），但缺少对应的本地精简快照。请点击“标记为已阅”以建立新基线。`,
    baselineUnavailableArchived: (date) =>
      `你的上次已阅期刊（${date}）不在当前已加载档案中且无本地快照，系统不会编造变更差异。`,
    changesHeadline: (fromDate, toDate) => `变更范围：${fromDate} → ${toDate}`,
    sameDayRevisionBadge: '同日修订对比',
    usedLocalSnapshotNote: '已基于本地保存的精简已阅快照进行确定性内容对比。',
    generalCatchUpTitle: '全刊变更概览',
    personalCatchUpTitle: '已追踪信号动态',
    personalCatchUpEmpty: '自上次已阅以来，你追踪的信号暂无实质更新。',
    groupNew: '新增信号',
    groupUpdated: '实质更新',
    groupReappeared: '间隔再现',
    groupClaimChanges: '声明台账变更',
    groupSourceChanges: '来源台账变更',
    groupOmitted: '检查点后未收录',
    openFullDigest: '查看完整变更速览',
    inspectNextHint: '建议优先核查',
    followedAlertKinds: {
      new: '新增',
      updated: '更新',
      reappeared: '再现',
      omitted: '未收录',
    },
  },
  editionCompare: {
    triggerButton: '跨期对比',
    dialogTitle: '任意两期期刊对比',
    dialogSubtitle: '对归档中任意两期权威 Markdown 期刊执行确定性差异比对',
    close: '关闭期刊对比',
    fromEditionLabel: '对比基准期（旧）',
    toEditionLabel: '对比目标期（新）',
    swapOrder: '对调',
    reorderedNote: (fromDate, toDate) => `已按时间顺序展示：从较早期（${fromDate}）至较近期（${toDate}）。`,
    validationErrors: {
      insufficient_archive: '至少需要两期归档期刊才能执行跨期对比。',
      missing_date: '请同时选择起始期数与目标期数。',
      invalid_date_not_in_archive: '所选期数不存在于已发布的归档索引中。',
      same_edition_selected: '请选择两个不同的期刊日期进行对比。',
    },
    loadingPair: (fromDate, toDate) => `正在加载 ${fromDate} 与 ${toDate} 期…`,
    loadErrorTitle: '无法加载所选期刊',
    retry: '重试',
    openPreviousVersion: (date) => `旧版 (${date})`,
    openCurrentVersion: (date) => `新版 (${date})`,
    daySpanLabel: (days) => `间隔 ${days} 天`,
    compareAction: '开始对比',
  },
  media: {
    sectionTitle: '补充编务影像与图资',
    sectionSubtitle:
      '经版权与内容核验的配图与图资。视觉媒体仅用于语境辅助，不计入独立报道来源或声明核验统计。',
    relationships: {
      direct_event_documentation: '事件现场纪实',
      contextual: '背景语境配图',
      illustrative: '编务示意插图',
      data_visualization: '数据可视化',
    },
    relationshipDisclosures: {
      direct_event_documentation: '经核验的本次事件现场影像记录',
      contextual: '背景参考配图——非本次事件现场直接拍摄',
      illustrative: '示意性视觉——概念插图，非现场纪实摄影',
      data_visualization: '结构化数据图表、地图或示意图',
    },
    mediaTypes: {
      photograph: '摄影照片',
      illustration: '插画',
      chart: '图表',
      map: '地图',
      diagram: '结构图',
      document_scan: '文献扫描件',
      screenshot: '界面截图',
    },
    sourcePageLink: '原始来源页面',
    licenseLink: '许可协议',
    creatorLabel: '作者',
    depictedLabel: '描绘信息',
    uncroppedNote: '依授权条款完整无裁切呈现',
    unavailableFallbackTitle: '外部视觉资源暂无法加载',
    unavailableFallbackBody:
      '远程图像加载失败，以下保留原始署名与出处核查链接。',
    nonEvidenceNote: '仅作视觉语境参考 · 不计入独立报道来源',
    supportingCount: (count) => `共 ${count} 项补充图资`,
  },
};

export function normalizeUiLanguage(raw?: string | null): UiLanguage {
  if (!raw) return 'en';
  const lower = raw.trim().toLowerCase();
  if (lower.startsWith('zh')) return 'zh-CN';
  return 'en';
}

export function getUiStrings(lang: UiLanguage): UiDictionary {
  return lang === 'zh-CN' ? ZH_DICT : EN_DICT;
}
