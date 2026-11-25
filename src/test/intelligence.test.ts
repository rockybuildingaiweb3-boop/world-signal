import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseEditionMarkdown } from '../lib/markdown/parseEdition';
import { compareEditions } from '../lib/intelligence/edition-diff/compareEditions';
import { buildStorylineIndex } from '../lib/intelligence/storylines/buildStorylineIndex';
import { buildRelationshipGraph } from '../lib/intelligence/relationships/buildRelationshipGraph';
import { VALID_SYNTHETIC_EDITION } from './fixtures/syntheticEdition';

function parseAtDate(markdown: string, date: string) {
  const dated = markdown
    .replace('edition_date: "2026-10-01"', `edition_date: "${date}"`)
    .replace('generated_at: "2026-10-01T07:00:00-07:00"', `generated_at: "${date}T07:00:00-07:00"`)
    .replace('updated_at: "2026-10-01T14:00:00-07:00"', `updated_at: "${date}T14:00:00-07:00"`);
  return parseEditionMarkdown(dated, `/editions/${date.slice(0, 4)}/${date.slice(5, 7)}/${date}.md`, {
    expectedDate: date,
  });
}

describe('cross-edition intelligence projections', () => {
  it('detects material changes by stable signal ID and ignores edition sync timestamps', () => {
    const previous = parseAtDate(VALID_SYNTHETIC_EDITION, '2026-10-01');
    const changedMarkdown = VALID_SYNTHETIC_EDITION
      .replace('status: "confirmed"', 'status: "disputed"')
      .replace('A concise, factual summary of this edition.', 'A revised summary of this edition.');
    const current = parseAtDate(changedMarkdown, '2026-10-02');

    const diff = compareEditions(previous, current);
    const world = diff.changes.find((change) => change.signalId === 'WORLD-20261001-port-treaty');
    const ai = diff.changes.find((change) => change.signalId === 'AI-20261001-eval-standard');

    assert.equal(world?.kind, 'updated');
    assert.ok(world?.diff.reasons.includes('status'));
    assert.equal(ai?.kind, 'unchanged');
    assert.equal(diff.summary.newSignals, 0);
    assert.equal(diff.summary.materiallyUpdatedSignals, 1);
  });

  it('builds a stable storyline history without equating omission with resolution', () => {
    const first = parseAtDate(VALID_SYNTHETIC_EDITION, '2026-10-01');
    const secondMarkdown = VALID_SYNTHETIC_EDITION.replace(
      'status: "confirmed"',
      'status: "disputed"'
    );
    const second = parseAtDate(secondMarkdown, '2026-10-02');

    const index = buildStorylineIndex([second, first]);
    const storyline = index.find((record) => record.signalId === 'WORLD-20261001-port-treaty');

    assert.ok(storyline);
    assert.equal(storyline.firstSeenEdition, '2026-10-01');
    assert.equal(storyline.lastSeenEdition, '2026-10-02');
    assert.equal(storyline.lastMaterialUpdateEdition, '2026-10-02');
    assert.equal(storyline.appearanceCount, 2);
    assert.deepEqual(
      storyline.history.map((entry) => entry.kind),
      ['first_seen', 'material_update']
    );
  });

  it('builds contextual legacy links without inventing causal relationships', () => {
    const edition = parseAtDate(VALID_SYNTHETIC_EDITION, '2026-10-01');
    const graph = buildRelationshipGraph([edition]);
    const edge = graph.edges.find((item) =>
      item.sourceSignalId === 'WORLD-20261001-port-treaty' &&
      item.targetSignalId === 'ECON-20261001-freight-rates'
    );

    assert.ok(edge);
    assert.equal(edge.relationshipType, 'contextual');
    assert.equal(edge.isExplicitlyTyped, false);
    assert.equal(edge.confidence, 'unverified');
    assert.match(edge.rationale, /related_signal_ids/);
  });

  it('parses additive schema-v2 timeline and relationship metadata with local reference checks', () => {
    let markdown = VALID_SYNTHETIC_EDITION;
    markdown = markdown.replace(
      'signal_id: "WORLD-20261001-port-treaty"',
      `signal_id: "WORLD-20261001-port-treaty"
continuity:
  first_seen_edition: "2026-10-01"
  last_material_update: "2026-10-01"
  lifecycle: "developing"
update:
  change_type: "initial"
  summary: "First observed in the archive."
  evidence_changes:
    added_claim_ids: ["WORLD-20261001-port-treaty-C01"]
    revised_claim_ids: []
    withdrawn_claim_ids: []
    added_source_urls: ["https://www.reuters.com/world/corridor-test"]
    removed_source_urls: []
timeline_events:
  - event_id: "WORLD-20261001-port-treaty-E01"
    occurred_at: "2026-10-01"
    title: "Protocol signed"
    summary: "The participating states signed the protocol."
    claim_ids: ["WORLD-20261001-port-treaty-C01"]
    source_ids: ["S1"]
relationships:
  - target_signal_id: "ECON-20261001-freight-rates"
    relationship_type: "market_transmission"
    confidence: "medium"
    rationale: "The protocol changes maritime capacity assumptions used in freight-rate analysis."
    supporting_claim_ids: ["WORLD-20261001-port-treaty-C01"]`
    );

    const edition = parseAtDate(markdown, '2026-10-01');
    const signal = edition.signals.find((item) => item.signal_id === 'WORLD-20261001-port-treaty');

    assert.equal(signal?.continuity?.first_seen_edition, '2026-10-01');
    assert.equal(signal?.update?.change_type, 'initial');
    assert.equal(signal?.timelineEvents.length, 1);
    assert.equal(signal?.relationships[0]?.relationship_type, 'market_transmission');
    assert.equal(edition.validation.errors.length, 0);
    assert.ok(!edition.validation.warnings.some((warning) => warning.code.startsWith('BROKEN_')));
  });
});
