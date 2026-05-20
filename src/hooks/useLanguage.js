import { useEffect, useState } from 'react'

const STORAGE_KEY = 'nebula_desk_language'
const LEGACY_STORAGE_KEY = 'ai_react_language'

export function useLanguage(defaultLanguage = 'zh') {
  const [language, setLanguage] = useState(() => {
    return (
      localStorage.getItem(STORAGE_KEY) ||
      localStorage.getItem(LEGACY_STORAGE_KEY) ||
      defaultLanguage
    )
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language)
    localStorage.removeItem(LEGACY_STORAGE_KEY)
    document.documentElement.lang = language
  }, [language])

  return { language, setLanguage }
}
