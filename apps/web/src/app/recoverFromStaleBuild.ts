// A page loaded before a release asks for lazy chunks the release deleted. One
// reload fetches the current index.html. The guard is keyed by version: a PWA
// keeps its sessionStorage for days, so a bare flag would disable recovery for
// every later release, and a reload that stays on this version cannot help.
const RELOADED_KEY = `stale-build-reloaded:${__APP_VERSION__}`;

export const recoverFromStaleBuild = () => {
  window.addEventListener('vite:preloadError', (event) => {
    if (sessionStorage.getItem(RELOADED_KEY)) return;

    sessionStorage.setItem(RELOADED_KEY, '1');
    event.preventDefault();
    window.location.reload();
  });
};
