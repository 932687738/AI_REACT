import { get } from '@/utils/request'

function resolveLocalizedText(value, locale) {
  if (typeof value === 'string') {
    return value
  }

  if (!value || typeof value !== 'object') {
    return ''
  }

  const isEnglish = String(locale || '').toLowerCase().startsWith('en')
  const primary = isEnglish ? value.en : value.zh
  const fallback = isEnglish ? value.zh : value.en

  return String(primary || fallback || '').trim()
}

function normalizeExamples(examples, locale) {
  if (!Array.isArray(examples)) {
    return []
  }

  return examples.map((item, index) => ({
    id: item?.id || `example-${index}`,
    title: resolveLocalizedText(item?.title, locale),
    description: resolveLocalizedText(item?.description, locale),
    sample: resolveLocalizedText(item?.sample, locale),
  }))
}

function normalizeModule(item, locale) {
  return {
    packageName: String(item?.packageName || '').trim(),
    title: resolveLocalizedText(item?.title, locale),
    overview: resolveLocalizedText(item?.overview, locale),
    usageGuide: resolveLocalizedText(item?.usageGuide, locale),
    packageExamples: normalizeExamples(item?.packageExamples, locale),
    components: Array.isArray(item?.components)
      ? item.components.map((component, index) => ({
          id: component?.className || `component-${index}`,
          className: String(component?.className || '').trim(),
          description: resolveLocalizedText(component?.description, locale),
          examples: normalizeExamples(component?.examples, locale),
        }))
      : [],
  }
}

function normalizeEntity(item, locale, extra = {}) {
  return {
    name: String(item?.name || '').trim(),
    description:
      resolveLocalizedText(item?.description, locale) ||
      resolveLocalizedText(item?.promptAugmentation, locale),
    examples: normalizeExamples(item?.examples, locale),
    toolCount: Number(item?.toolCount) || 0,
    ...extra,
  }
}

function normalizeStatusResponse(data, locale) {
  return {
    locale: String(data?.locale || locale || 'zh').trim() || 'zh',
    modules: Array.isArray(data?.modules) ? data.modules.map((item) => normalizeModule(item, locale)) : [],
    skills: Array.isArray(data?.skills)
      ? data.skills.map((item) => normalizeEntity(item, locale))
      : [],
    subAgents: Array.isArray(data?.subAgents)
      ? data.subAgents.map((item) => normalizeEntity(item, locale))
      : [],
    tools: Array.isArray(data?.tools)
      ? data.tools.map((item) => normalizeEntity(item, locale))
      : [],
    mcpCallbacks: Array.isArray(data?.mcpCallbacks)
      ? data.mcpCallbacks.map((item) => normalizeEntity(item, locale))
      : [],
  }
}

export async function fetchAgentHubStatus(locale = 'zh', mode) {
  const params = { locale }
  if (mode) {
    params.mode = mode
  }

  const data = await get('/api/agent-hub/status', params)
  return normalizeStatusResponse(data, locale)
}
