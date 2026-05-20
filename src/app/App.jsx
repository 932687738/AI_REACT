import HomePage from '@/pages/HomePage'
import { useLanguage } from '@/hooks/useLanguage'

function App() {
  const { language, setLanguage } = useLanguage()

  return <HomePage language={language} onLanguageChange={setLanguage} />
}

export default App
