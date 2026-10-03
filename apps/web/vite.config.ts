import { lingui, linguiTransformerBabelPreset } from '@lingui/vite-plugin';
import babel from '@rolldown/plugin-babel';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vitest/config';

import packageJson from './package.json' with { type: 'json' };

// Vite 8 compiles JSX with oxc, so @vitejs/plugin-react no longer runs Babel
// plugins. The Lingui macro transform therefore goes through rolldown's own
// Babel pass instead of react({ babel: ... }).
export default defineConfig({
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
      generateBundle() {
        this.emitFile({
          type: 'asset',
          fileName: 'version.json',
          source: JSON.stringify({ version: packageJson.version })
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
              // Room for the current build and the tail of the previous one;
              // older chunks age out instead of piling up per release.
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 30 * 24 * 60 * 60
              },
              cacheableResponse: { statuses: [200] }
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
});
