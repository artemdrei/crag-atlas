import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Without this vitest also picks up the compiled copies under dist/.
    include: ['src/**/*.spec.ts'],
    // Integration specs need a database; they run from vitest.integration.config.
    exclude: ['src/**/*.int.spec.ts']
  }
});
