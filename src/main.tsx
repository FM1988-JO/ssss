import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { AssetProvider } from './context/AssetContext';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <AssetProvider>
        <App />
      </AssetProvider>
    </HashRouter>
  </StrictMode>,
);
