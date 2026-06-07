import type { PlatformToolSourceFilter, PlatformToolSummaryItem } from '@/types/platformToolCatalog';

export function filterPlatformTools(
  items: PlatformToolSummaryItem[],
  keyword: string,
  sourceFilter: PlatformToolSourceFilter,
): PlatformToolSummaryItem[] {
  const kw = keyword.trim().toLowerCase();
  return items.filter((item) => {
    if (sourceFilter !== 'all' && item.source !== sourceFilter) {
      return false;
    }
    if (!kw) {
      return true;
    }
    return (
      item.name.toLowerCase().includes(kw) ||
      item.summary.toLowerCase().includes(kw)
    );
  });
}
