import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

// PWA 注册
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // 静默处理，离线功能降级但不影响主功能
    })
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
