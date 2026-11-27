import type {
  EditionIndexEntry,
  EditionsIndex,
  ParsedEdition,
  RejectedIndexEntry,
} from '../../types/edition';
import { parseEditionMarkdown } from '../markdown/parseEdition';

const INDEX_URL = '/data/editions-index.json';
const EDITION_PATH_REGEX = /^\/editions\/(\d{4})\/(\d{2})\/(\d{4}-\d{2}-\d{2})\.md$/;

const editionCache = new Map<string, ParsedEdition>();

function isValidCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;
}

export class ArchivePathError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ArchivePathError';
  }
}

/**
 * Strictly validates that an archive edition path points to a canonical local Markdown file:
 * `/editions/YYYY/MM/YYYY-MM-DD.md`, where YYYY/MM matches the filename date.
 * Rejects external URLs, protocol-relative URLs, path traversal (`..`), backslashes,
 * encoded traversal sequences, query strings, and fragments.
 */
export function validateEditionPath(rawPath: string): { normalizedPath: string; pathDate: string } {
  if (typeof rawPath !== 'string') {
    throw new ArchivePathError('Edition path must be a string.');
  }

  const trimmed = rawPath.trim();
  if (!trimmed) {
    throw new ArchivePathError('Edition path is empty.');
  }

  // Reject any URL schemes, protocol-relative paths, backslashes, traversal, or query/fragment tokens
  if (
    /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ||
    trimmed.startsWith('//') ||
    trimmed.includes('\\') ||
    trimmed.includes('..') ||
    /%2e|%2f|%5c/i.test(trimmed) ||
    trimmed.includes('?') ||
    trimmed.includes('#')
  ) {
    throw new ArchivePathError(`Rejected unsafe archive path: "${trimmed}".`);
  }

  const normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  const match = normalizedPath.match(EDITION_PATH_REGEX);
  if (!match) {
    throw new ArchivePathError(
      `Invalid edition archive path "${normalizedPath}". Expected /editions/YYYY/MM/YYYY-MM-DD.md.`
    );
  }

  const [, year, month, fileDate] = match;
  if (!isValidCalendarDate(fileDate)) {
    throw new ArchivePathError(`Edition path contains an invalid calendar date "${fileDate}".`);
  }
  if (!fileDate.startsWith(`${year}-${month}-`)) {
    throw new ArchivePathError(
      `Edition path directory "${year}/${month}" does not match filename date "${fileDate}".`
    );
  }

  return { normalizedPath, pathDate: fileDate };
}

export function buildEditionCacheKey(normalizedPath: string, revisionKey?: string): string {
  const rev = revisionKey?.trim() || 'unversioned';
  return `${normalizedPath}::${rev}`;
}

export function clearEditionCache(): void {
  editionCache.clear();
}

export function getEditionCacheSize(): number {
  return editionCache.size;
}

export function getCachedEdition(
  editionPath: string,
  revisionKey?: string
): ParsedEdition | null {
  try {
    const { normalizedPath } = validateEditionPath(editionPath);
    const cacheKey = buildEditionCacheKey(normalizedPath, revisionKey);
    return editionCache.get(cacheKey) ?? null;
  } catch {
    return null;
  }
}

export function getAllCachedEditions(): ParsedEdition[] {
  return Array.from(editionCache.values());
}

export async function fetchEditionsIndex(options?: {
  forceRefresh?: boolean;
  signal?: AbortSignal;
  fetchImpl?: typeof fetch;
}): Promise<EditionsIndex> {
  const fetchFn = options?.fetchImpl ?? fetch;
  const url = options?.forceRefresh ? `${INDEX_URL}?t=${Date.now()}` : INDEX_URL;
  const response = await fetchFn(url, {
    cache: options?.forceRefresh ? 'reload' : 'no-cache',
    signal: options?.signal,
  });

  if (!response.ok) {
    throw new Error(`Unable to load editions index (${response.status} ${response.statusText}).`);
  }

  const data = (await response.json()) as Partial<EditionsIndex>;
  const rawEditions = Array.isArray(data.editions) ? data.editions : [];

  // Reject unsafe paths and metadata that does not describe the same edition date.
  // A malformed index entry must never be able to label one Markdown file as another date.
  const validEditions: EditionIndexEntry[] = [];
  const rejectedEntries: RejectedIndexEntry[] = [];
  const seenDates = new Set<string>();
  const validStatuses = ['draft', 'reviewed', 'published'] as const;

  for (let i = 0; i < rawEditions.length; i += 1) {
    const entry = rawEditions[i];
    const rawDate = typeof entry?.date === 'string' ? entry.date : undefined;
    const rawPath = typeof entry?.path === 'string' ? entry.path : undefined;

    if (!entry || typeof entry !== 'object') {
      rejectedEntries.push({ index: i, reason: 'Index entry is not an object.' });
      continue;
    }
    if (typeof entry.date !== 'string' || !isValidCalendarDate(entry.date)) {
      rejectedEntries.push({
        index: i,
        rawDate,
        rawPath,
        reason: `Invalid edition date "${String(entry.date ?? '')}".`,
      });
      continue;
    }
    if (seenDates.has(entry.date)) {
      rejectedEntries.push({
        index: i,
        rawDate,
        rawPath,
        reason: `Duplicate archive entry for date "${entry.date}".`,
      });
      continue;
    }
    if (
      typeof entry.title !== 'string' ||
      typeof entry.updated_at !== 'string' ||
      !Number.isFinite(Date.parse(entry.updated_at)) ||
      typeof entry.language !== 'string' ||
      typeof entry.summary !== 'string'
    ) {
      rejectedEntries.push({
        index: i,
        rawDate,
        rawPath,
        reason: 'Missing required archive metadata or invalid updated_at timestamp.',
      });
      continue;
    }
    if (
      typeof entry.status !== 'string' ||
      !validStatuses.includes(entry.status as (typeof validStatuses)[number])
    ) {
      rejectedEntries.push({
        index: i,
        rawDate,
        rawPath,
        reason: `Unsupported edition status "${String(entry.status ?? '')}".`,
      });
      continue;
    }
    if (typeof entry.path !== 'string') {
      rejectedEntries.push({
        index: i,
        rawDate,
        reason: 'Missing edition path.',
      });
      continue;
    }

    try {
      const { normalizedPath, pathDate } = validateEditionPath(entry.path);
      if (pathDate !== entry.date) {
        rejectedEntries.push({
          index: i,
          rawDate,
          rawPath,
          reason: `Declared date "${entry.date}" does not match path date "${pathDate}".`,
        });
        continue;
      }
      seenDates.add(entry.date);
      validEditions.push({ ...entry, path: normalizedPath } as EditionIndexEntry);
    } catch (err) {
      rejectedEntries.push({
        index: i,
        rawDate,
        rawPath,
        reason: err instanceof Error ? err.message : 'Invalid edition archive path.',
      });
    }
  }

  const requestedLatest = typeof data.latest_edition === 'string' ? data.latest_edition : null;
  const latestEdition = requestedLatest && seenDates.has(requestedLatest)
    ? requestedLatest
    : validEditions[0]?.date ?? null;

  return {
    schema_version: typeof data.schema_version === 'number' ? data.schema_version : 1,
    latest_edition: latestEdition,
    generated_at: typeof data.generated_at === 'string' ? data.generated_at : '',
    editions: validEditions,
    rejectedEntries,
  };
}

export async function fetchAndParseEdition(
  editionPath: string,
  options?: {
    revisionKey?: string;
    forceRefresh?: boolean;
    signal?: AbortSignal;
    fetchImpl?: typeof fetch;
  }
): Promise<ParsedEdition> {
  const { normalizedPath, pathDate } = validateEditionPath(editionPath);
  const revisionKey = options?.revisionKey?.trim();
  const cacheKey = buildEditionCacheKey(normalizedPath, revisionKey);

  if (!options?.forceRefresh && editionCache.has(cacheKey)) {
    return editionCache.get(cacheKey)!;
  }

  const fetchFn = options?.fetchImpl ?? fetch;
  const requestUrl =
    options?.forceRefresh || revisionKey
      ? `${normalizedPath}?v=${encodeURIComponent(
          options?.forceRefresh ? String(Date.now()) : revisionKey ?? ''
        )}`
      : normalizedPath;

  const response = await fetchFn(requestUrl, {
    cache: options?.forceRefresh ? 'reload' : 'no-cache',
    signal: options?.signal,
  });

  if (!response.ok) {
    throw new Error(
      `Unable to load edition file "${normalizedPath}" (${response.status} ${response.statusText}).`
    );
  }

  const markdown = await response.text();
  const parsed = parseEditionMarkdown(markdown, normalizedPath, {
    isLocalPreview: false,
    expectedDate: pathDate,
  });

  // Evict stale revisions for the same path before storing the latest revision
  for (const existingKey of Array.from(editionCache.keys())) {
    if (existingKey.startsWith(`${normalizedPath}::`)) {
      editionCache.delete(existingKey);
    }
  }
  editionCache.set(cacheKey, parsed);

  return parsed;
}
