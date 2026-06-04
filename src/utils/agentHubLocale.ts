import { getLocale } from '@umijs/max';

export function resolveAgentHubApiLocale(locale = getLocale()): string {
  return locale.toLowerCase().startsWith('en') ? 'en' : 'zh';
}
