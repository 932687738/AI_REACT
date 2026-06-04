import type { KnowledgeChatMeta, KnowledgeCitation } from '@/openapi/typings';

export function isKnowledgeMetaPayload(chunk: string | null | undefined): boolean {
  if (!chunk || typeof chunk !== 'string') {
    return false;
  }
  let trimmed = chunk.trim();
  if (!trimmed) {
    return false;
  }
  if (trimmed.startsWith('data:')) {
    trimmed = trimmed.replace(/^data:\s*/, '').trim();
  }
  if (trimmed.includes('event: meta')) {
    return true;
  }
  const jsonStart = trimmed.indexOf('{');
  if (jsonStart === -1) {
    return false;
  }
  try {
    const parsed = JSON.parse(trimmed.slice(jsonStart)) as { event?: string };
    return parsed?.event === 'meta';
  } catch {
    return false;
  }
}

export function parseKnowledgeMetaPayload(chunk: string | null | undefined): KnowledgeChatMeta | null {
  if (!chunk) {
    return null;
  }
  let trimmed = chunk.trim();
  if (trimmed.startsWith('data:')) {
    trimmed = trimmed.replace(/^data:\s*/, '').trim();
  }
  const jsonStart = trimmed.indexOf('{');
  if (jsonStart === -1) {
    return null;
  }
  try {
    const parsed = JSON.parse(trimmed.slice(jsonStart)) as KnowledgeChatMeta;
    if (parsed?.event !== 'meta') {
      return null;
    }
    if (parsed?.citations?.length) {
      parsed.citations = parsed.citations.map((item) => ({
        ...item,
        score: item.score ?? item.rerankScore,
        vectorScore: item.vectorScore !== null && item.vectorScore !== undefined ? Number(item.vectorScore) : null,
      }));
    }
    return parsed;
  } catch {
    return null;
  }
}

export function stripKnowledgeMetaFromText(fullText: string | null | undefined): string {
  if (!fullText || typeof fullText !== 'string') {
    return fullText ?? '';
  }
  let text = fullText;
  const metaJsonIndex = text.lastIndexOf('{"event":"meta"');
  if (metaJsonIndex !== -1) {
    text = text.slice(0, metaJsonIndex);
  }
  const metaEventIndex = text.lastIndexOf('event: meta');
  if (metaEventIndex !== -1) {
    text = text.slice(0, metaEventIndex);
  }
  const looseMetaIndex = text.search(/\{\s*"event"\s*:\s*"meta"/);
  if (looseMetaIndex !== -1) {
    text = text.slice(0, looseMetaIndex);
  }
  return text.replace(/\n*data:\s*$/m, '').trimEnd();
}

function toUnitScore(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) {
    return n === 0 ? 0 : null;
  }
  if (n > 1) {
    if (n <= 10) {
      return Math.min(1, n / 10);
    }
    if (n <= 100) {
      return Math.min(1, n / 100);
    }
    return 1;
  }
  return Math.min(1, n);
}

export function formatSimilarityPercent(value: unknown): string | null {
  const unit = toUnitScore(value);
  if (unit === null || unit === undefined) {
    return null;
  }
  const pct = unit * 100;
  if (pct === 0) {
    return '0';
  }
  if (pct < 1) {
    return pct.toFixed(1);
  }
  return String(Math.round(pct));
}

export function normalizeCitation(citation: KnowledgeCitation | null | undefined): KnowledgeCitation | null {
  if (!citation) {
    return null;
  }
  const score = toUnitScore(citation.score ?? citation.rerankScore) ?? 0;
  const vectorScore = toUnitScore(citation.vectorScore);
  return {
    chunkId: citation.chunkId,
    documentId: citation.documentId,
    knowledgeBaseId: citation.knowledgeBaseId,
    knowledgeBaseName: citation.knowledgeBaseName || '',
    documentName: citation.documentName || '',
    preview: citation.preview || '',
    vectorScore,
    score,
  };
}
