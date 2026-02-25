import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryProvider } from '@/app/providers/query-provider';
import { router } from '@/app/router';
import { setStoredAuthAccessKey, setStoredAuthUserName, getStoredAuthAccessKey } from '@/services/api/auth.service';
import '@/app/styles/globals.css';
import '@/app/styles/theme.css';

// Auto-seed credentials so the app works without manual login
if (!getStoredAuthAccessKey()) {
  setStoredAuthUserName('Admin');
  setStoredAuthAccessKey('auto-bootstrap');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryProvider>
      <RouterProvider router={router} />
    </QueryProvider>
  </React.StrictMode>,
);
