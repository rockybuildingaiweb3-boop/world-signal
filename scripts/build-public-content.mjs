import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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

function validateEdition(filePath, relativePath, markdown) {
  const frontmatter = parseFrontmatter(markdown, filePath);
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
