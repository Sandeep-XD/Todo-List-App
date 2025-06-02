import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {Provider} from 'react-redux'
import {store} from './app/store'
import './index.css'
import App from './App.jsx'
import { ClerkProvider } from '@clerk/clerk-react'
import { ThemeProvider } from './contexts/ThemeContext';
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}> 
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl='/'>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </ClerkProvider>
    </Provider>
  </StrictMode>,
)
