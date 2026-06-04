import type { AppRoute } from '@/constants/routes';

export type SidebarModuleId = 'chat' | 'knowledge' | 'agentHub';

export interface SidebarNavItem {
  key: string;
  path: AppRoute;
  labelId: string;
}

export interface SidebarModuleGroup {
  id: SidebarModuleId;
  titleId: string;
  items: SidebarNavItem[];
}
