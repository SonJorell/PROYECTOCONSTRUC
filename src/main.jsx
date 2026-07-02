import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { Toaster } from 'react-hot-toast'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#0D0B61',
            color: '#F1F5F9',
            border: '1px solid rgba(41,70,105,0.3)',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#478B8D', secondary: '#F1F5F9' } },
          error: { iconTheme: { primary: '#EF4444', secondary: '#F1F5F9' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>,
)
