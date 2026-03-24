import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './APP/index.css'
import App from './APP/App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
