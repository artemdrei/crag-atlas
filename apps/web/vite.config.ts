import { lingui } from '@lingui/vite-plugin';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  server: {
    port: 4000
  },
  plugins: [
    react({ babel: { plugins: ['@lingui/babel-plugin-lingui-macro'] } }),
    lingui(),
    tsconfigPaths()
  ],
  test: {
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    include: ['src/**/*.spec.{ts,tsx}']
  }
});
