import brandDzj from '@/assets/brand-dzj.png';
import brandLv from '@/assets/brand-lv.png';
import brandYxy from '@/assets/brand-yxy.png';

export const THEMES = {
  DZJ: 'dzj',
  LV: 'lv',
  YXY: 'yxy',
} as const;

export type ThemeCode = (typeof THEMES)[keyof typeof THEMES];

export const DEFAULT_THEME: ThemeCode = THEMES.YXY;

export const themeOptions: Array<{ code: ThemeCode; labelId: string }> = [
  { code: THEMES.DZJ, labelId: 'settings.theme.dzj' },
  { code: THEMES.LV, labelId: 'settings.theme.lv' },
  { code: THEMES.YXY, labelId: 'settings.theme.yxy' },
];

export function isValidTheme(value: unknown): value is ThemeCode {
  return value === THEMES.DZJ || value === THEMES.LV || value === THEMES.YXY;
}

export function applyTheme(theme: ThemeCode) {
  document.documentElement.dataset.theme = theme;
}

const brandByTheme: Record<ThemeCode, string> = {
  [THEMES.DZJ]: brandDzj,
  [THEMES.LV]: brandLv,
  [THEMES.YXY]: brandYxy,
};

export function resolveBrandMark(theme: ThemeCode): string {
  return brandByTheme[theme] ?? brandByTheme[DEFAULT_THEME];
}

export function resolveBrandGradient(theme: ThemeCode): string {
  if (theme === THEMES.DZJ) {
    return 'linear-gradient(135deg, #38bdf8, #818cf8)';
  }
  if (theme === THEMES.LV) {
    return 'linear-gradient(135deg, #4ade80, #2dd4bf)';
  }
  return 'linear-gradient(135deg, rgb(56 189 248 / 35%), rgb(99 102 241 / 35%))';
}

export function isLightTheme(theme: ThemeCode): boolean {
  return theme === THEMES.DZJ || theme === THEMES.LV;
}
