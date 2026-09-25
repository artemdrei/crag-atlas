import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.int.spec.ts'],
    // One database, shared fixtures: parallel files would race each other.
    fileParallelism: false,
    testTimeout: 30_000
  }
});
