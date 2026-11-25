import type {
  ParsedEdition,
  SignalRelationship,
  SignalRelationshipType,
} from '../../../types/edition';

export interface SignalRelationshipEdge {
  sourceSignalId: string;
  targetSignalId: string;
  relationshipType: SignalRelationshipType;
  confidence: SignalRelationship['confidence'];
  rationale: string;
  supportingClaimIds: string[];
  declaredInEdition: string;
  isExplicitlyTyped: boolean;
}

export interface RelationshipGraph {
  edges: SignalRelationshipEdge[];
  unresolvedTargets: Array<{
    sourceSignalId: string;
    targetSignalId: string;
    declaredInEdition: string;
  }>;
}

/**
 * Projects only relationships explicitly declared in Markdown.
 * Legacy related_signal_ids become coarse contextual links; no causal meaning is inferred.
 */
export function buildRelationshipGraph(editions: ParsedEdition[]): RelationshipGraph {
  const ordered = [...editions].sort((a, b) =>
    a.frontmatter.edition_date.localeCompare(b.frontmatter.edition_date)
  );
  const latestSignals = new Map<string, { signal: ParsedEdition['signals'][number]; editionDate: string }>();

  for (const edition of ordered) {
    for (const signal of edition.signals) {
      latestSignals.set(signal.signal_id, { signal, editionDate: edition.frontmatter.edition_date });
    }
  }

  const edges: SignalRelationshipEdge[] = [];
  const unresolvedTargets: RelationshipGraph['unresolvedTargets'] = [];
  const edgeKeys = new Set<string>();

  for (const [sourceSignalId, snapshot] of latestSignals) {
    const explicitTargets = new Set(snapshot.signal.relationships.map((link) => link.target_signal_id));
    const declarations: Array<{
      targetSignalId: string;
      relationshipType: SignalRelationshipType;
      confidence: SignalRelationship['confidence'];
      rationale: string;
      supportingClaimIds: string[];
      isExplicitlyTyped: boolean;
    }> = snapshot.signal.relationships.map((link) => ({
      targetSignalId: link.target_signal_id,
      relationshipType: link.relationship_type,
      confidence: link.confidence,
      rationale: link.rationale,
      supportingClaimIds: link.supporting_claim_ids,
      isExplicitlyTyped: true,
    }));

    for (const targetSignalId of snapshot.signal.related_signal_ids) {
      if (explicitTargets.has(targetSignalId)) continue;
      declarations.push({
        targetSignalId,
        relationshipType: 'contextual',
        confidence: 'unverified',
        rationale: 'Declared in related_signal_ids; no more specific relationship metadata is available.',
        supportingClaimIds: [],
        isExplicitlyTyped: false,
      });
    }

    for (const declaration of declarations) {
      if (declaration.targetSignalId === sourceSignalId) continue;
      const targetExists = latestSignals.has(declaration.targetSignalId);
      if (!targetExists) {
        unresolvedTargets.push({
          sourceSignalId,
          targetSignalId: declaration.targetSignalId,
          declaredInEdition: snapshot.editionDate,
        });
        continue;
      }

      const key = `${sourceSignalId}→${declaration.targetSignalId}`;
      if (edgeKeys.has(key)) continue;
      edgeKeys.add(key);
      edges.push({
        sourceSignalId,
        targetSignalId: declaration.targetSignalId,
        relationshipType: declaration.relationshipType,
        confidence: declaration.confidence,
        rationale: declaration.rationale,
        supportingClaimIds: declaration.supportingClaimIds,
        declaredInEdition: snapshot.editionDate,
        isExplicitlyTyped: declaration.isExplicitlyTyped,
      });
    }
  }

  return {
    edges: edges.sort((a, b) =>
      a.sourceSignalId.localeCompare(b.sourceSignalId) ||
      a.targetSignalId.localeCompare(b.targetSignalId)
    ),
    unresolvedTargets: unresolvedTargets.sort((a, b) =>
      a.sourceSignalId.localeCompare(b.sourceSignalId) ||
      a.targetSignalId.localeCompare(b.targetSignalId)
    ),
  };
}
