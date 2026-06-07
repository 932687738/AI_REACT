export type PlatformToolSource = 'agent-hub' | 'mcp';

export interface PlatformToolSummaryItem {
  source: PlatformToolSource | string;
  name: string;
  summary: string;
}

export interface PlatformToolSummaryResponse {
  tools: PlatformToolSummaryItem[];
}

export type PlatformToolSourceFilter = 'all' | PlatformToolSource;
