import { registerSW } from 'virtual:pwa-register';

// The new worker activates at once and the plugin reloads the page onto it.
// Browsers check for an update only on navigation, and an installed PWA is
// resumed rather than navigated, so returning to the app checks too.
export const registerServiceWorker = () => {
  registerSW({
    immediate: true,
    onRegisteredSW: (_url, registration) => {
      if (!registration) return;

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') registration.update();
      });
    }
  });
};
