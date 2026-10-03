import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';

import { App } from '@web/app/App';
import { setupReporter } from '@web/app/setupReporter';
import { printVersion } from '@web/shared/lib';
import { initAmplitude } from '@web/shared/lib/analytics/amplitude';

printVersion();
setupReporter();
initAmplitude();

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
