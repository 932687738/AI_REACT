const ADMIN_KEY_STORAGE = 'aether.platform.adminApiKey';
const TENANT_STORAGE = 'aether.platform.tenantId';
const USER_STORAGE = 'aether.platform.userId';

export function getStoredAdminApiKey(): string {
  if (typeof sessionStorage === 'undefined') {
    return '';
  }
  return sessionStorage.getItem(ADMIN_KEY_STORAGE) ?? '';
}

export function setStoredAdminApiKey(value: string) {
  sessionStorage.setItem(ADMIN_KEY_STORAGE, value.trim());
}

export function getStoredTenantId(): string {
  if (typeof sessionStorage === 'undefined') {
    return 'default';
  }
  return sessionStorage.getItem(TENANT_STORAGE) ?? 'default';
}

export function setStoredTenantId(value: string) {
  sessionStorage.setItem(TENANT_STORAGE, value.trim() || 'default');
}

export function getStoredUserId(): string {
  if (typeof sessionStorage === 'undefined') {
    return 'anonymous';
  }
  return sessionStorage.getItem(USER_STORAGE) ?? 'anonymous';
}

export function setStoredUserId(value: string) {
  sessionStorage.setItem(USER_STORAGE, value.trim() || 'anonymous');
}

export function platformHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'X-Tenant-Id': getStoredTenantId(),
    'X-User-Id': getStoredUserId(),
  };
  const apiKey = getStoredAdminApiKey();
  if (apiKey) {
    headers['X-Admin-Api-Key'] = apiKey;
  }
  return headers;
}

/** 写操作：mutation/onError 独占错误 UX，避免与 app.tsx 全局 errorHandler 重复弹 toast */
export const platformWriteRequestOptions = {
  skipErrorHandler: true,
} as const;
