import type { AgentAppVariable } from '@/types/platformAgentRegistry';
import { AGENT_VARIABLE_MAX_VALUE_LENGTH } from '@/types/platformAgentRegistry';

const cache = new Map<string, Record<string, string>>();

function cacheKey(conversationId: string, agentName: string): string {
  return `${conversationId}::${agentName}`;
}

export function getAgentSessionVariables(
  conversationId: string,
  agentName: string,
): Record<string, string> {
  return { ...(cache.get(cacheKey(conversationId, agentName)) ?? {}) };
}

/** 本会话是否已填写并确认过变量（含默认值确认）。 */
export function hasAgentSessionVariablesConfigured(
  conversationId: string,
  agentName: string,
): boolean {
  return cache.has(cacheKey(conversationId, agentName));
}

export function setAgentSessionVariables(
  conversationId: string,
  agentName: string,
  values: Record<string, string>,
): void {
  cache.set(cacheKey(conversationId, agentName), { ...values });
}

export function clearAgentSessionVariables(conversationId: string, agentName: string): void {
  cache.delete(cacheKey(conversationId, agentName));
}

export function mergeVariableDefaults(
  definitions: AgentAppVariable[],
  sessionValues: Record<string, string>,
): Record<string, string> {
  const merged: Record<string, string> = {};
  for (const def of definitions) {
    const raw = sessionValues[def.name] ?? def.defaultValue ?? '';
    merged[def.name] = raw.trim();
  }
  return merged;
}

export function findMissingRequiredVariables(
  definitions: AgentAppVariable[],
  sessionValues: Record<string, string>,
): AgentAppVariable[] {
  return definitions.filter((def) => {
    if (!def.required) {
      return false;
    }
    const value = (sessionValues[def.name] ?? def.defaultValue ?? '').trim();
    return !value;
  });
}

export function validateVariableValues(values: Record<string, string>): string | null {
  for (const [name, value] of Object.entries(values)) {
    if (value.length > AGENT_VARIABLE_MAX_VALUE_LENGTH) {
      return name;
    }
  }
  return null;
}
