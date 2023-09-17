// eslint-disable-next-line import/no-unresolved
import path from 'node:path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    exclude: ['build/**'],
    globalSetup: path.resolve(__dirname, './src/test/vitest.global.ts'),
    setupFiles: path.resolve(__dirname, './src/test/vitest.setup.ts'),
    clearMocks: true,
    coverage: {
      enabled: true,
      reporter: ['cobertura'],
      exclude: ['src/test/seed/**.ts'],
      provider: 'v8',
    },
  },
  json: {},
});
