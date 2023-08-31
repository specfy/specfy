// eslint-disable-next-line import/no-unresolved
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    clearMocks: true,
    coverage: {
      enabled: true,
      reporter: ['cobertura'],
      provider: 'v8',
    },
  },
  json: {},
});
