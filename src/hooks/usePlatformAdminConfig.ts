import { useEffect, useState } from 'react';
import {
  getStoredAdminApiKey,
  getStoredTenantId,
  setStoredAdminApiKey,
  setStoredTenantId,
} from '@/services/platformAdminCommon';

export function usePlatformAdminConfig() {
  const [configOpen, setConfigOpen] = useState(false);
  const [tenantId, setTenantId] = useState(getStoredTenantId);
  const [adminKey, setAdminKey] = useState(getStoredAdminApiKey);

  useEffect(() => {
    setStoredTenantId(tenantId);
    setStoredAdminApiKey(adminKey);
  }, [tenantId, adminKey]);

  return {
    configOpen,
    setConfigOpen,
    tenantId,
    setTenantId,
    adminKey,
    setAdminKey,
    openConfig: () => setConfigOpen(true),
  };
}
