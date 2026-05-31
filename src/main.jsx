import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '@/app/App'
import { applyTheme, readStoredTheme } from '@/hooks/useTheme'
import '@/styles/index.css'

applyTheme(readStoredTheme())

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
