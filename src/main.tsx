// ============================================================
// YYC3 Hacker Chatbot — Application Entry Point
// Mounts React root with StrictMode
// ============================================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/app/App';
import '@/styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
