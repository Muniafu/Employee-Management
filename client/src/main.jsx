import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './Context/AuthContext';
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
