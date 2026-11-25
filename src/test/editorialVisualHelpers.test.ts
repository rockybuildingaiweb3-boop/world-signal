import { describe, expect, test } from 'bun:test';
import fs from 'node:fs';
import { parseEditionMarkdown } from '../lib/markdown/parseEdition';
import {
  buildConfidenceImportanceMatrix,
  buildDomainEditionProfiles,
  buildOriginMarkerSummary,
  buildRelationshipExplorerModel,
} from '../lib/intelligence/visual-metrics/editorialVisualHelpers';

describe('editorialVisualHelpers — deterministic data-grounded visual projections', () => {
  test('buildOriginMarkerSummary never hides overflow when independentOriginCount exceeds display cap', () => {
    const uncapped = buildOriginMarkerSummary(3, ['bloomberg', 'reuters', 'wsj'], 8);
    expect(uncapped.totalCount).toBe(3);
    expect(uncapped.displayedCount).toBe(3);
    expect(uncapped.overflowCount).toBe(0);
    expect(uncapped.isCapped).toBe(false);
    expect(uncapped.namedGroups).toEqual(['bloomberg', 'reuters', 'wsj']);

    const capped = buildOriginMarkerSummary(11, ['a', 'b', 'c'], 8);
    expect(capped.totalCount).toBe(11);
    expect(capped.displayedCount).toBe(8);
    expect(capped.overflowCount).toBe(3);
    expect(capped.isCapped).toBe(true);

    const zero = buildOriginMarkerSummary(0, [], 8);
    expect(zero.totalCount).toBe(0);
    expect(zero.displayedCount).toBe(0);
    expect(zero.overflowCount).toBe(0);
    expect(zero.isCapped).toBe(false);
  });

  test('derives exact domain profiles, confidence×importance cross-matrix, and explicit vs legacy relationships on 2026-11-24 edition', () => {
    const md = fs.readFileSync('public/editions/2026/11/2026-11-24.md', 'utf8');
    const edition = parseEditionMarkdown(md, '/editions/2026/11/2026-11-24.md');

    const topIds = new Set(
      edition.executiveBriefing.topSignalRefs.map((r) => r.signal_id)
    );
    const profiles = buildDomainEditionProfiles(
      edition.signals,
      edition.domainIntros,
      topIds
    );
    const totalAcrossDomains = profiles.reduce((acc, p) => acc + p.total, 0);
    expect(totalAcrossDomains).toBe(edition.signals.length);
    for (const p of profiles) {
      expect(p.imp5Count + p.imp4Count + p.impLowerCount).toBe(p.total);
    }

    const matrix = buildConfidenceImportanceMatrix(edition.signals);
    expect(matrix.totalSignals).toBe(edition.signals.length);
    const sumRows = matrix.rows.reduce((acc, r) => acc + r.rowTotal, 0);
    const sumCols =
      matrix.columnTotals.high +
      matrix.columnTotals.medium +
      matrix.columnTotals.low +
      matrix.columnTotals.unverified;
    expect(sumRows).toBe(edition.signals.length);
    expect(sumCols).toBe(edition.signals.length);

    const relModel = buildRelationshipExplorerModel(edition);
    expect(relModel.explicitEdges.length).toBeGreaterThan(0);
    expect(relModel.explicitEdges.every((e) => e.isExplicitlyTyped)).toBe(true);
    expect(relModel.legacyContextualEdges.every((e) => !e.isExplicitlyTyped)).toBe(
      true
    );
  });
});
