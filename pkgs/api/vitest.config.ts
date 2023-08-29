// eslint-disable-next-line import/no-unresolved
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    exclude: ['build/**'],
    globalSetup: 'src/test/vitest.global.ts',
    setupFiles: 'src/test/vitest.setup.ts',
    clearMocks: true,
    coverage: {
      enabled: true,
      reporter: ['cobertura'],
      exclude: ['src/test/seed/**.ts'],
    },
  },
  json: {},
});
