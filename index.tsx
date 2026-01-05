import React from 'react';
import { createRoot } from 'react-dom/client';
import Page from './app/page';

// Entry point for the local preview environment.
// Production deployments (Vercel) will use the app/ folder structure directly.

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <Page />
    </React.StrictMode>
  );
}