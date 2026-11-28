/**
 * Pure, deterministic editorial pull-thesis extraction for `PullQuoteBand`.
 *
 * INTEGRITY INVARIANT:
 * - Strictly extracts the opening declarative sentence verbatim (minus raw
 *   Markdown/citation syntax) from the signal's real `whyItMatters` or synthesis
 *   prose. Never invents, paraphrases, or summarizes text.
 * - Preserves full original Markdown so interactive `[S1]`/`[C1]` citations
 *   remain clickable in the accompanying prose.
 */

export interface ExtractedLeadThesis {
  /** Clean opening declarative sentence for display-serif presentation */
  readonly thesis: string;
  /** Remaining Markdown prose after the lead sentence (empty if single-sentence) */
  readonly remainderMarkdown: string;
  /** Whether the original opening sentence contained inline citations (kept in full prose) */
  readonly hadInlineCitations: boolean;
}

function stripMarkdownForDisplay(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '$1')
    .replace(/\s*\[[SC]\d+(?:\s*[,，]\s*[SC]\d+)*\]/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^[-*•]\s+/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts the first declarative sentence from editorial Markdown prose.
 * Returns `null` when the text is too short, purely tabular/list-based, or
 * lacks a clear opening thesis sentence.
 */
export function extractLeadThesis(
  markdown: string | null | undefined
): ExtractedLeadThesis | null {
  const trimmed = (markdown ?? '').trim();
  if (!trimmed || trimmed.length < 32) return null;

  // Do not pull-quote markdown tables or pure bullet lists
  if (/^\s*\|/.test(trimmed) || /^\s*[-*]\s+/m.test(trimmed.split('\n')[0] ?? '')) {
    return null;
  }

  // Split into first paragraph and subsequent paragraphs
  const paragraphs = trimmed.split(/\n{2,}/);
  const firstPara = (paragraphs[0] ?? '').trim();
  if (!firstPara || firstPara.length < 28) return null;

  const isCjk = /[\u4e00-\u9fff]/.test(firstPara);

  // Locate the first natural sentence boundary
  let splitIdx = -1;
  if (isCjk) {
    const match = firstPara.match(/^([\s\S]{14,130}?[。！？])/);
    if (match) {
      splitIdx = match[1].length;
    }
  } else {
    // Match English sentence boundary avoiding common abbreviations (U.S., Dr., etc.)
    const regex = /(?<!\b(?:U\.S|U\.K|E\.U|Mr|Ms|Dr|St|vs|No|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec))[.!?](?=\s|$)/g;
    let m: RegExpExecArray | null;
    while ((m = regex.exec(firstPara)) !== null) {
      const candidateEnd = m.index + 1;
      if (candidateEnd >= 32) {
        splitIdx = candidateEnd;
        break;
      }
    }
  }

  // If no mid-paragraph boundary found, accept the whole first paragraph if concise
  const rawLead =
    splitIdx > 0
      ? firstPara.slice(0, splitIdx).trim()
      : firstPara.length <= (isCjk ? 110 : 240)
        ? firstPara
        : '';

  if (!rawLead) return null;

  const hadInlineCitations = /\[[SC]\d+/.test(rawLead);
  const cleanThesis = stripMarkdownForDisplay(rawLead);
  if (cleanThesis.length < (isCjk ? 14 : 30)) return null;
  if (cleanThesis.length > (isCjk ? 120 : 250)) return null;

  const restOfFirstPara =
    splitIdx > 0 ? firstPara.slice(splitIdx).trim() : '';
  const remainingParts = [
    ...(restOfFirstPara ? [restOfFirstPara] : []),
    ...paragraphs.slice(1),
  ];

  // If the opening sentence had interactive citations, keep the full original markdown
  // as the readable body below so zero `[S1]`/`[C1]` citations are dropped.
  const remainderMarkdown = hadInlineCitations
    ? trimmed
    : remainingParts.join('\n\n').trim();

  return {
    thesis: cleanThesis,
    remainderMarkdown,
    hadInlineCitations,
  };
}
