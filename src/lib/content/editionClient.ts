import type { EditionsIndex, ParsedEdition } from '../../types/edition';
import { parseEditionMarkdown } from '../markdown/parseEdition';

const editionCache = new Map<string, ParsedEdition>();

export async function fetchEditionsIndex(): Promise<EditionsIndex> {
  const response = await fetch('/data/editions-index.json', {
    headers: { Accept: 'application/json' },
    cache: 'no-cache',
  });

  if (!response.ok) {
    throw new Error(`Unable to load archive index (HTTP ${response.status}).`);
  }

  const data = (await response.json()) as Partial<EditionsIndex>;
  if (!data || typeof data !== 'object' || !Array.isArray(data.editions)) {
    throw new Error('Archive index returned an invalid structure.');
  }

  return {
    schema_version: Number(data.schema_version ?? 1),
    latest_edition: data.latest_edition ?? null,
    generated_at: typeof data.generated_at === 'string' ? data.generated_at : '',
    editions: data.editions,
  };
}

export async function fetchAndParseEdition(editionPath: string): Promise<ParsedEdition> {
  const cached = editionCache.get(editionPath);
  if (cached) {
    return cached;
  }

  const normalizedPath = editionPath.startsWith('/') ? editionPath : `/${editionPath}`;
  const response = await fetch(normalizedPath, {
    headers: { Accept: 'text/markdown, text/plain' },
  });

  if (!response.ok) {
    throw new Error(`Unable to fetch edition "${normalizedPath}" (HTTP ${response.status}).`);
  }

  const contentType = response.headers.get('content-type') || '';
  const markdown = await response.text();

  // Guard against SPA HTML fallback if an edition file is missing on the static server
  if (contentType.includes('text/html') || markdown.trimStart().toLowerCase().startsWith('<!doctype html')) {
    throw new Error(`Edition file "${normalizedPath}" was not found on the static server.`);
  }

  const parsed = parseEditionMarkdown(markdown, normalizedPath, false);
  editionCache.set(editionPath, parsed);
  return parsed;
}

export function clearEditionCache(): void {
  editionCache.clear();
}
