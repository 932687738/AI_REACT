import HomePage from '@/pages/HomePage'
import { useLanguage } from '@/hooks/useLanguage'
import { useTheme } from '@/hooks/useTheme'

function App() {
  const { language, setLanguage } = useLanguage()
  const { theme, setTheme } = useTheme()

  return (
    <HomePage
      language={language}
      onLanguageChange={setLanguage}
      theme={theme}
      onThemeChange={setTheme}
    />
  )
}

export default App
