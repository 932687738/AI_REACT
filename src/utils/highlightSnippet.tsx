import type { ReactNode } from 'react';

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function highlightSnippet(snippet: string, keyword: string): ReactNode[] {
  const text = snippet ?? '';
  const term = keyword.trim();
  if (!text || !term) {
    return [text];
  }

  const pattern = new RegExp(`(${escapeRegExp(term)})`, 'gi');
  const parts = text.split(pattern);
  return parts.map((part, index) =>
    part.toLowerCase() === term.toLowerCase() ? (
      <mark key={`${part}-${index}`} className="conversation-search-mark">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}
