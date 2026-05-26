import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Console branding
console.log(
  '%c' + [
    ' _____ _  _ ___   _   ___   ___  ___    _   ___ _____ ',
    '|_   _| || | __| /_\\ |_ _| |   \\| _ \\  /_\\ | __|_   _|',
    '  | | | __ | _| / _ \\ | |  | |) |   / / _ \\| _|  | |  ',
    '  |_| |_||_|___/_/ \\_\\___| |___/|_|_\\/_/ \\_\\_|   |_|  ',
  ].join('\n'),
  'color: #C8F31D; font-family: monospace; font-size: 12px; font-weight: bold;'
)
console.log(
  '%cWho\'s moving in AI? We know before you do.',
  'color: #F59E0B; font-size: 12px; font-family: "Barlow", sans-serif;'
)
console.log(
  '%cReal-time AI talent intelligence. theaidraft.com',
  'color: #7E8A9A; font-size: 10px;'
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
