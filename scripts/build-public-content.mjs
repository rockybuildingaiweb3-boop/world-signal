import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { JSON_SCHEMA, load } from 'js-yaml';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = path.join(root, 'content', 'editions');
const publicRoot = path.join(root, 'public');
const publicEditionsRoot = path.join(publicRoot, 'editions');
const indexPath = path.join(publicRoot, 'data', 'editions-index.json');

async function walkMarkdown(directory) {
  let entries;
  try {
    entries = await fs.readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }

  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walkMarkdown(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  return files;
}

function parseFrontmatter(markdown, filePath) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) throw new Error('Missing YAML frontmatter: ' + filePath);
  return match[1];
}

function readScalar(frontmatter, key, filePath) {
  const line = frontmatter.split(/\r?\n/).find((item) => item.startsWith(key + ':'));
  if (!line) throw new Error('Missing frontmatter field "' + key + '" in ' + filePath);

  const raw = line.slice(key.length + 1).trim();
  if (!raw || raw === '|' || raw === '>-' || raw === '>') {
    throw new Error('Field "' + key + '" must be a one-line scalar in ' + filePath);
  }
  if (raw.startsWith('"')) {
    try {
      return JSON.parse(raw);
    } catch {
      throw new Error('Invalid double-quoted scalar for "' + key + '" in ' + filePath);
    }
  }
  if (raw.startsWith("'") && raw.endsWith("'")) {
    return raw.slice(1, -1).replace(/''/g, "'");
  }
  return raw;
}


const VALID_SIGNAL_LIFECYCLES = new Set([
  'new', 'developing', 'ongoing', 'monitoring', 'resolved', 'archived'
]);
const VALID_SIGNAL_CHANGE_TYPES = new Set([
  'initial', 'material_update', 'status_change', 'new_evidence', 'correction', 'no_material_change'
]);
const VALID_SIGNAL_RELATIONSHIPS = new Set([
  'same_event', 'contextual', 'policy_response', 'market_transmission',
  'technological_dependency', 'causal_link', 'potential_link'
]);
const VALID_CONFIDENCE = new Set(['high', 'medium', 'low', 'unverified']);

function readSchemaVersion(frontmatter, filePath) {
  const raw = readScalar(frontmatter, 'schema_version', filePath);
  const version = Number(raw);
  if (!Number.isInteger(version) || ![1, 2].includes(version)) {
    throw new Error('Unsupported schema_version in ' + filePath + ': ' + raw);
  }
  return version;
}

function isCalendarDate(value) {
  if (typeof value !== 'string' || !/^\\d{4}-\\d{2}-\\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;
}

function isDateOrDateTime(value) {
  if (isCalendarDate(value)) return true;
  return typeof value === 'string' &&
    /^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}(?::\\d{2}(?:\\.\\d+)?)?(?:Z|[+-]\\d{2}:\\d{2})$/.test(value) &&
    isCalendarDate(value.slice(0, 10)) &&
    Number.isFinite(Date.parse(value));
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function requireStringArray(value, label, signalId) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new Error(signalId + ': ' + label + ' must be an array of strings.');
  }
}

function parseSignalMetadataBlock(signalBlock, signalId, filePath) {
  const fence = signalBlock.match(/^(?:~~~|\\x60\\x60\\x60)[ \\t]*yaml[ \\t]*\\r?\\n([\\s\\S]*?)\\r?\\n(?:~~~|\\x60\\x60\\x60)[ \\t]*$/m);
  if (!fence) {
    throw new Error('Missing YAML metadata fence for signal ' + signalId + ' in ' + filePath);
  }

  let metadata;
  try {
    metadata = load(fence[1], { schema: JSON_SCHEMA });
  } catch (error) {
    throw new Error('Invalid YAML metadata for signal ' + signalId + ' in ' + filePath + ': ' + error.message);
  }

  if (!isRecord(metadata) || metadata.signal_id !== signalId) {
    throw new Error('Signal heading / signal_id mismatch for ' + signalId + ' in ' + filePath);
  }

  const continuity = metadata.continuity;
  if (!isRecord(continuity)) {
    throw new Error(signalId + ': schema-v2 continuity object is required.');
  }
  const firstSeenValid = continuity.first_seen_edition === null || isCalendarDate(continuity.first_seen_edition);
  const lastUpdateValid = continuity.last_material_update === null || isCalendarDate(continuity.last_material_update);
  if (!firstSeenValid || !lastUpdateValid) {
    throw new Error(signalId + ': continuity dates must be valid YYYY-MM-DD values or explicit null.');
  }
  if (typeof continuity.history_complete !== 'boolean') {
    throw new Error(signalId + ': continuity.history_complete must be a boolean.');
  }
  if (continuity.history_complete &&
      (continuity.first_seen_edition === null || continuity.last_material_update === null)) {
    throw new Error(signalId + ': history_complete=true requires both continuity dates.');
  }
  if (!VALID_SIGNAL_LIFECYCLES.has(continuity.lifecycle)) {
    throw new Error(signalId + ': invalid continuity.lifecycle value.');
  }

  const update = metadata.update;
  if (!isRecord(update) || !VALID_SIGNAL_CHANGE_TYPES.has(update.change_type) ||
      typeof update.summary !== 'string' || !update.summary.trim()) {
    throw new Error(signalId + ': update requires a valid change_type and non-empty summary.');
  }
  if (update.previous_edition !== undefined &&
      update.previous_edition !== null &&
      !isCalendarDate(update.previous_edition)) {
    throw new Error(signalId + ': update.previous_edition must be a valid date or null.');
  }
  if (!isRecord(update.evidence_changes)) {
    throw new Error(signalId + ': update.evidence_changes is required.');
  }
  for (const field of [
    'added_claim_ids', 'revised_claim_ids', 'withdrawn_claim_ids',
    'added_source_urls', 'removed_source_urls'
  ]) {
    requireStringArray(update.evidence_changes[field], 'update.evidence_changes.' + field, signalId);
  }

  if (!Array.isArray(metadata.timeline_events)) {
    throw new Error(signalId + ': timeline_events must be an array (it may be empty).');
  }
  for (const [index, event] of metadata.timeline_events.entries()) {
    if (!isRecord(event) ||
        typeof event.event_id !== 'string' || !event.event_id.trim() ||
        !isDateOrDateTime(event.occurred_at) ||
        typeof event.title !== 'string' || !event.title.trim() ||
        typeof event.summary !== 'string' || !event.summary.trim()) {
      throw new Error(signalId + ': timeline_events[' + index + '] is missing a valid event_id, occurred_at, title or summary.');
    }
    requireStringArray(event.claim_ids, 'timeline_events[' + index + '].claim_ids', signalId);
    requireStringArray(event.source_ids, 'timeline_events[' + index + '].source_ids', signalId);
  }

  if (!Array.isArray(metadata.relationships)) {
    throw new Error(signalId + ': relationships must be an array (it may be empty).');
  }
  for (const [index, relationship] of metadata.relationships.entries()) {
    if (!isRecord(relationship) ||
        typeof relationship.target_signal_id !== 'string' || !relationship.target_signal_id.trim() ||
        !VALID_SIGNAL_RELATIONSHIPS.has(relationship.relationship_type) ||
        !VALID_CONFIDENCE.has(relationship.confidence) ||
        typeof relationship.rationale !== 'string' || !relationship.rationale.trim()) {
      throw new Error(signalId + ': relationships[' + index + '] is missing a valid target, type, confidence or rationale.');
    }
    requireStringArray(relationship.supporting_claim_ids, 'relationships[' + index + '].supporting_claim_ids', signalId);
  }
}

function validateSchemaV2Signals(markdown, filePath) {
  const headingPattern = /^##\\s+((?:WORLD|AI|ECON)-[A-Za-z0-9-]+)\\s*(?:—|--|-|:)\\s*.+$/gm;
  const headings = [...markdown.matchAll(headingPattern)];
  if (headings.length === 0) {
    throw new Error('Schema-v2 edition contains no parseable signal headings: ' + filePath);
  }

  for (let index = 0; index < headings.length; index += 1) {
    const start = headings[index].index;
    const nextSignalStart = headings[index + 1]?.index ?? markdown.length;
    const nextTopLevel = markdown.slice(start + headings[index][0].length).search(/^#\\s/m);
    const topLevelStart = nextTopLevel >= 0
      ? start + headings[index][0].length + nextTopLevel
      : markdown.length;
    const end = Math.min(nextSignalStart, topLevelStart);
    parseSignalMetadataBlock(
      markdown.slice(start, end),
      headings[index][1],
      filePath
    );
  }

  return headings.length;
}

function assertNoSchemaDowngrade(relativePath, currentSchemaVersion, filePath) {
  let previousMarkdown;
  try {
    previousMarkdown = execFileSync(
      'git',
      ['show', 'HEAD^:content/editions/' + relativePath],
      { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
    );
  } catch {
    // First edition commit or no previous version of this date: no downgrade comparison is possible.
    return;
  }

  const previousFrontmatter = parseFrontmatter(
    previousMarkdown,
    'previous revision of ' + filePath
  );
  const previousSchemaVersion = readSchemaVersion(
    previousFrontmatter,
    'previous revision of ' + filePath
  );

  if (previousSchemaVersion >= 2 && currentSchemaVersion < previousSchemaVersion) {
    throw new Error(
      'Schema downgrade rejected for ' + relativePath +
      ': previous version was ' + previousSchemaVersion +
      ', current version is ' + currentSchemaVersion +
      '. Preserve schema v2 on every subsequent sync.'
    );
  }
}

function validateEdition(filePath, relativePath, markdown) {
  const frontmatter = parseFrontmatter(markdown, filePath);
  const schemaVersion = readSchemaVersion(frontmatter, filePath);
  assertNoSchemaDowngrade(relativePath, schemaVersion, filePath);
  if (schemaVersion >= 2) validateSchemaV2Signals(markdown, filePath);
  const editionDate = readScalar(frontmatter, 'edition_date', filePath);
  const title = readScalar(frontmatter, 'edition_title', filePath);
  const updatedAt = readScalar(frontmatter, 'updated_at', filePath);
  const status = readScalar(frontmatter, 'edition_status', filePath);
  const language = readScalar(frontmatter, 'content_language', filePath);
  const summary = readScalar(frontmatter, 'summary', filePath);

  const pathMatch = relativePath.match(/^(\d{4})\/(\d{2})\/(\d{4}-\d{2}-\d{2})\.md$/);
  if (!pathMatch) throw new Error('Path must be YYYY/MM/YYYY-MM-DD.md: ' + relativePath);
  if (editionDate !== pathMatch[3]) {
    throw new Error('edition_date does not match filename date in ' + relativePath);
  }
  if (!['draft', 'reviewed', 'published'].includes(status)) {
    throw new Error('Invalid edition_status in ' + relativePath + ': ' + status);
  }
  if (!/^\d{4}-\d{2}-\d{2}T/.test(updatedAt)) {
    throw new Error('updated_at must be an ISO 8601 timestamp in ' + relativePath);
  }

  const headings = [
    '# Executive Briefing',
    '# World Events',
    '# AI Frontier',
    '# Economic Outlook',
    '# Cross-Domain Synthesis',
    '# Personal Implications',
    '# Watchlist',
    '# Audit & Methodology'
  ];
  for (const heading of headings) {
    if (!markdown.includes(heading)) {
      throw new Error('Missing required heading "' + heading + '" in ' + relativePath);
    }
  }

  return {
    date: editionDate,
    title,
    path: '/editions/' + relativePath,
    updated_at: updatedAt,
    status,
    language,
    summary
  };
}

async function removeStaleMarkdown(directory, expectedFiles) {
  let entries;
  try {
    entries = await fs.readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') return;
    throw error;
  }

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await removeStaleMarkdown(fullPath, expectedFiles);
      const remaining = await fs.readdir(fullPath);
      if (remaining.length === 0) await fs.rmdir(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.md') && !expectedFiles.has(fullPath)) {
      await fs.unlink(fullPath);
    }
  }
}

async function main() {
  const canonicalFiles = await walkMarkdown(sourceRoot);
  const editions = [];
  const expectedPublicFiles = new Set();

  for (const filePath of canonicalFiles) {
    const relativePath = path.relative(sourceRoot, filePath).split(path.sep).join('/');
    const markdown = await fs.readFile(filePath, 'utf8');
    const edition = validateEdition(filePath, relativePath, markdown);
    const publicPath = path.join(publicEditionsRoot, ...relativePath.split('/'));

    await fs.mkdir(path.dirname(publicPath), { recursive: true });
    await fs.writeFile(publicPath, markdown, 'utf8');
    editions.push(edition);
    expectedPublicFiles.add(publicPath);
  }

  editions.sort((a, b) => b.date.localeCompare(a.date));
  const seenDates = new Set();
  for (const edition of editions) {
    if (seenDates.has(edition.date)) throw new Error('Duplicate edition date: ' + edition.date);
    seenDates.add(edition.date);
  }

  await fs.mkdir(path.dirname(indexPath), { recursive: true });
  await fs.mkdir(publicEditionsRoot, { recursive: true });
  await removeStaleMarkdown(publicEditionsRoot, expectedPublicFiles);

  const index = {
    schema_version: 1,
    latest_edition: editions.length ? editions[0].date : null,
    generated_at: new Date().toISOString(),
    editions
  };

  await fs.writeFile(indexPath, JSON.stringify(index, null, 2) + '\n', 'utf8');
  process.stdout.write('Published ' + editions.length + ' edition(s); rebuilt public/data/editions-index.json\n');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
