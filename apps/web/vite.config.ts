import { lingui, linguiTransformerBabelPreset } from '@lingui/vite-plugin';
import babel from '@rolldown/plugin-babel';
import react from '@vitejs/plugin-react';
import { loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vitest/config';

import packageJson from './package.json' with { type: 'json' };

// Vite 8 compiles JSX with oxc, so @vitejs/plugin-react no longer runs Babel
// plugins. The Lingui macro transform therefore goes through rolldown's own
// Babel pass instead of react({ babel: ... }).
const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const apiPattern = new RegExp(
    `^${escapeRegExp(env.VITE_API_URL ?? 'http://localhost:4001')}/`
  );
  const photoPattern = new RegExp(
    `^${escapeRegExp(env.VITE_SUPABASE_URL ?? '')}/storage/v1/object/public/`
  );

  return {
    server: {
      port: 4000
    },
    define: {
      __APP_VERSION__: JSON.stringify(packageJson.version)
    },
    plugins: [
      react(),
      babel({ presets: [linguiTransformerBabelPreset()] }),
      lingui(),
      {
        name: 'emit-version',
        // assets lets features/offlineRegions pull every chunk of this build
        // into the cache, so pages never opened online still open offline.
        generateBundle(_, bundle) {
          this.emitFile({
            type: 'asset',
            fileName: 'version.json',
            source: JSON.stringify({
              version: packageJson.version,
              assets: Object.keys(bundle).filter((file) =>
                file.startsWith('assets/')
              )
            })
          });
        }
      },
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: false,
        includeManifestIcons: false,
        manifest: {
          name: 'crag-atlas',
          short_name: 'crag-atlas',
          start_url: '/',
          display: 'standalone',
          theme_color: '#C25A2A',
          background_color: '#F6F1E9',
          icons: [
            { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
            { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
            {
              src: 'maskable-icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            }
          ]
        },
        workbox: {
          // Icons only. A precached bundle outlives the release whose chunks it
          // names: Render serves only the current build, so a stale precache is
          // a white screen no reload clears.
          // version.json is what changes the worker from one release to the
          // next; without it the worker is byte-identical across releases, the
          // browser never installs a new one, and an open app keeps old code.
          globPatterns: ['*.{ico,png,svg,webmanifest}', 'version.json'],
          // The plugin sets these only when it injects the registration itself.
          // Left waiting, the new worker would need every tab closed, and an
          // installed PWA is never closed.
          skipWaiting: true,
          clientsClaim: true,
          // The default routes every navigation to a precached index.html,
          // cache-first, which is exactly the stale shell above.
          navigateFallback: null,
          runtimeCaching: [
            {
              urlPattern: ({ request }) => request.mode === 'navigate',
              // No networkTimeoutSeconds: on a slow phone a timeout would serve
              // the stale shell. The cache answers only when the network fails.
              handler: 'NetworkFirst',
              options: {
                cacheName: 'app-shell',
                cacheableResponse: { statuses: [200] },
                matchOptions: { ignoreVary: true },
                // Every path gets the same SPA index.html, so one entry serves
                // an offline open of any route, not just the ones visited.
                plugins: [{ cacheKeyWillBeUsed: async () => '/' }]
              }
            },
            {
              // Hashed filenames: a hit is always the right bytes.
              urlPattern: ({ url }) => url.pathname.startsWith('/assets/'),
              handler: 'CacheFirst',
              options: {
                cacheName: 'app-assets',
                // A module script asks with an Origin header and the offline
                // warm-up fetch without one, so a `Vary: Origin` response
                // stored by one would never answer the other.
                matchOptions: { ignoreVary: true },
                // Room for the current build and the tail of the previous one.
                // No maxAgeSeconds: it reads the response's Date header, so a
                // region saved and then left a month offline would find its
                // chunks expired and open on a white screen.
                expiration: { maxEntries: 200 },
                cacheableResponse: { statuses: [200] }
              }
            },
            // 'offline-regions' is written by features/offlineRegions only. On
            // weak signal a saved region answers from it after the timeout;
            // anything not saved misses the cache and keeps waiting for the
            // network.
            {
              urlPattern: apiPattern,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'offline-regions',
                networkTimeoutSeconds: 5,
                matchOptions: { ignoreVary: true },
                plugins: [{ cacheWillUpdate: async () => null }]
              }
            },
            // A saved photo is served from the copy even online. Photos merely
            // browsed are not stored, or the cache would grow without bound.
            {
              urlPattern: photoPattern,
              handler: 'CacheFirst',
              options: {
                cacheName: 'offline-regions',
                matchOptions: { ignoreVary: true },
                plugins: [{ cacheWillUpdate: async () => null }]
              }
            }
          ]
        }
      })
    ],
    resolve: {
      tsconfigPaths: true
    },
    test: {
      environment: 'jsdom',
      setupFiles: './vitest.setup.ts',
      include: ['src/**/*.spec.{ts,tsx}']
    }
  };
});
