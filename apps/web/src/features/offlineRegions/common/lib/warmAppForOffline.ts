import { mapWithConcurrency } from './mapWithConcurrency';

// Both caches belong to the service worker (vite.config.ts): fetching a chunk
// from a controlled page stores it in 'app-assets', and 'app-shell' is the
// page every offline navigation opens.
const APP_SHELL_CACHE = 'app-shell';
const CONCURRENCY = 6;

export const warmAppForOffline = async () => {
  if (!navigator.serviceWorker?.controller) return;

  const { assets } = (await (await fetch('/version.json')).json()) as {
    assets: string[];
  };

  await mapWithConcurrency(assets, CONCURRENCY, async (path) => {
    await fetch(`/${path}`);
  });

  const shell = await fetch('/', { cache: 'no-store' });

  if (shell.ok) await (await caches.open(APP_SHELL_CACHE)).put('/', shell);
};
