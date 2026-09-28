import { lingui, linguiTransformerBabelPreset } from '@lingui/vite-plugin';
import babel from '@rolldown/plugin-babel';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// Vite 8 compiles JSX with oxc, so @vitejs/plugin-react no longer runs Babel
// plugins. The Lingui macro transform therefore goes through rolldown's own
// Babel pass instead of react({ babel: ... }).
export default defineConfig({
  server: {
    port: 4000
  },
  plugins: [
    react(),
    babel({ presets: [linguiTransformerBabelPreset()] }),
    lingui()
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
