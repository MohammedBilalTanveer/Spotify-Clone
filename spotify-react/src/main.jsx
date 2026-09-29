import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import App from './App'

import './styles/base.css'
import './styles/layout.css'
import './styles/sidebar.css'
import './styles/player.css'
import './styles/mobile.css'
import './styles/content.css'
import './styles/pages.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
