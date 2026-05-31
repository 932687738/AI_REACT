import { useEffect, useState } from 'react'
import { DEFAULT_THEME, isValidTheme } from '@/constants/theme'

const STORAGE_KEY = 'nebula_desk_theme'

export function readStoredTheme(defaultTheme = DEFAULT_THEME) {
  const stored = localStorage.getItem(STORAGE_KEY)
  return isValidTheme(stored) ? stored : defaultTheme
}

export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme
}

export function useTheme(defaultTheme = DEFAULT_THEME) {
  const [theme, setTheme] = useState(() => readStoredTheme(defaultTheme))

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, theme)
    applyTheme(theme)
  }, [theme])

  return { theme, setTheme }
}
