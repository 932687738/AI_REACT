import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  applyTheme,
  DEFAULT_THEME,
  isValidTheme,
  type ThemeCode,
} from '@/constants/theme';

interface AppStoreState {
  theme: ThemeCode;
  sidebarCollapsed: boolean;
  setTheme: (theme: ThemeCode) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapsed: () => void;
}

export const useAppStore = create<AppStoreState>()(
  persist(
    (set) => ({
      theme: DEFAULT_THEME,
      sidebarCollapsed: false,
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      toggleSidebarCollapsed: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: 'nebula_desk_app',
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
      onRehydrateStorage: () => (state) => {
        const theme = state?.theme && isValidTheme(state.theme) ? state.theme : DEFAULT_THEME;
        applyTheme(theme);
      },
    },
  ),
);

export function selectTheme(state: AppStoreState) {
  return state.theme;
}

export function selectSidebarCollapsed(state: AppStoreState) {
  return state.sidebarCollapsed;
}

function readPersistedTheme(): ThemeCode {
  if (typeof localStorage === 'undefined') {
    return DEFAULT_THEME;
  }
  try {
    const raw = localStorage.getItem('nebula_desk_app');
    if (!raw) {
      return DEFAULT_THEME;
    }
    const parsed = JSON.parse(raw) as { state?: { theme?: unknown } };
    const theme = parsed.state?.theme;
    return isValidTheme(theme) ? theme : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

if (typeof document !== 'undefined') {
  applyTheme(readPersistedTheme());
}
