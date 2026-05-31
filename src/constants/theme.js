import brandDzj from '@/assets/brand-dzj.png'
import brandLv from '@/assets/brand-lv.png'
import brandYxy from '@/assets/brand-yxy.png'

export const THEMES = {
  DZJ: 'dzj',
  LV: 'lv',
  YXY: 'yxy',
}

export const DEFAULT_THEME = THEMES.YXY

export const themeOptions = [
  { code: THEMES.DZJ, labelKey: 'themeDzj' },
  { code: THEMES.LV, labelKey: 'themeLv' },
  { code: THEMES.YXY, labelKey: 'themeYxy' },
]

export const brandByTheme = {
  [THEMES.DZJ]: brandDzj,
  [THEMES.LV]: brandLv,
  [THEMES.YXY]: brandYxy,
}

export function resolveBrandMark(theme) {
  return brandByTheme[theme] || brandByTheme[DEFAULT_THEME]
}

export function isValidTheme(value) {
  return value === THEMES.DZJ || value === THEMES.LV || value === THEMES.YXY
}
