import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-mid)',
                fontFamily: "'Cinzel', serif",
                fontSize: '0.8rem',
                letterSpacing: '0.04em',
                boxShadow: 'var(--shadow-deep)',
              },
              success: { iconTheme: { primary: 'var(--gold)', secondary: 'var(--bg-card)' } },
              error:   { iconTheme: { primary: 'var(--crimson-light)', secondary: 'var(--bg-card)' } },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
