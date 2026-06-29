import { API_PATHS } from '@/constants/ApiPaths';
import { request } from '@/openapi/request';
import type { AgentHubStatusResponse } from '@/openapi/typings';

function resolveLocalizedText(value: unknown, locale: string): string {
  if (typeof value === 'string') {
    return value;
  }
  if (!value || typeof value !== 'object') {
    return '';
  }
  const record = value as { en?: string; zh?: string };
  const isEnglish = locale.toLowerCase().startsWith('en');
  const primary = isEnglish ? record.en : record.zh;
  const fallback = isEnglish ? record.zh : record.en;
  return String(primary || fallback || '').trim();
}

function normalizeExamples(examples: unknown, locale: string) {
  if (!Array.isArray(examples)) {
    return [];
  }
  return examples.map((item, index) => {
    const row = item as Record<string, unknown>;
    return {
      id: (row.id as string) || `example-${index}`,
      title: resolveLocalizedText(row.title, locale),
      description: resolveLocalizedText(row.description, locale),
      sample: resolveLocalizedText(row.sample, locale),
    };
  });
}

function normalizeModule(item: unknown, locale: string) {
  const row = item as Record<string, unknown>;
  return {
    packageName: String(row.packageName || '').trim(),
    title: resolveLocalizedText(row.title, locale),
    overview: resolveLocalizedText(row.overview, locale),
    usageGuide: resolveLocalizedText(row.usageGuide, locale),
    packageExamples: normalizeExamples(row.packageExamples, locale),
    components: Array.isArray(row.components)
      ? row.components.map((component, index) => {
          const c = component as Record<string, unknown>;
          return {
            id: (c.className as string) || `component-${index}`,
            className: String(c.className || '').trim(),
            description: resolveLocalizedText(c.description, locale),
            examples: normalizeExamples(c.examples, locale),
          };
        })
      : [],
  };
}

function normalizeEntity<T extends Record<string, unknown> = Record<string, never>>(
  item: unknown,
  locale: string,
  extra?: T,
) {
  const row = item as Record<string, unknown>;
  const base = {
    name: String(row.name || '').trim(),
    description:
      resolveLocalizedText(row.description, locale) ||
      resolveLocalizedText(row.promptAugmentation, locale),
    examples: normalizeExamples(row.examples, locale),
    toolCount: Number(row.toolCount) || 0,
  };
  return { ...base, ...(extra ?? ({} as T)) };
}

function normalizeLocalTool(item: unknown, locale: string) {
  const row = item as Record<string, unknown>;
  return normalizeEntity(item, locale, {
    beanClass: String(row.beanClass || '').trim(),
    module: String(row.module || '').trim(),
  });
}

function normalizeMcpCallback(item: unknown, locale: string) {
  const row = item as Record<string, unknown>;
  return normalizeEntity(item, locale, {
    providerBean: String(row.providerBean || '').trim(),
    transport: String(row.transport || '').trim(),
    endpointSummary: String(row.endpointSummary || '').trim(),
  });
}

function normalizeMcpProvider(item: unknown) {
  const row = item as Record<string, unknown>;
  return {
    name: String(row.name || '').trim(),
    transport: String(row.transport || '').trim(),
    endpoint: String(row.endpoint || '').trim(),
    toolCount: Number(row.toolCount) || 0,
    ready: Boolean(row.ready),
  };
}

export interface NormalizedAgentHubStatus {
  locale: string;
  modules: ReturnType<typeof normalizeModule>[];
  skills: ReturnType<typeof normalizeEntity>[];
  subAgents: ReturnType<typeof normalizeEntity>[];
  tools: ReturnType<typeof normalizeLocalTool>[];
  mcpCallbacks: ReturnType<typeof normalizeMcpCallback>[];
  mcpProviders: ReturnType<typeof normalizeMcpProvider>[];
}

export type AgentHubEntity = NormalizedAgentHubStatus['skills'][number];
export type AgentHubLocalTool = NormalizedAgentHubStatus['tools'][number];
export type AgentHubMcpCallback = NormalizedAgentHubStatus['mcpCallbacks'][number];
export type AgentHubMcpProvider = NormalizedAgentHubStatus['mcpProviders'][number];
export type AgentHubModule = NormalizedAgentHubStatus['modules'][number];

function normalizeStatusResponse(data: AgentHubStatusResponse, locale: string): NormalizedAgentHubStatus {
  return {
    locale: String(data?.locale || locale || 'zh').trim() || 'zh',
    modules: Array.isArray(data?.modules) ? data.modules.map((item) => normalizeModule(item, locale)) : [],
    skills: Array.isArray(data?.skills) ? data.skills.map((item) => normalizeEntity(item, locale)) : [],
    subAgents: Array.isArray(data?.subAgents)
      ? data.subAgents.map((item) => normalizeEntity(item, locale))
      : [],
    tools: Array.isArray(data?.tools) ? data.tools.map((item) => normalizeLocalTool(item, locale)) : [],
    mcpCallbacks: Array.isArray(data?.mcpCallbacks)
      ? data.mcpCallbacks.map((item) => normalizeMcpCallback(item, locale))
      : [],
    mcpProviders: Array.isArray(data?.mcpProviders)
      ? data.mcpProviders.map((item) => normalizeMcpProvider(item))
      : [],
  };
}

export async function getAgentHubStatus(locale = 'zh', mode?: string) {
  const params: Record<string, string> = { locale };
  if (mode) {
    params.mode = mode;
  }
  const data = await request<AgentHubStatusResponse>(API_PATHS.agentHub.status, {
    method: 'GET',
    params,
  });
  return normalizeStatusResponse(data, locale);
}
