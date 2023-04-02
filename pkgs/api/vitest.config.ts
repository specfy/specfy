// eslint-disable-next-line import/no-unresolved
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    globalSetup: 'src/test/vitest.global.ts',
    setupFiles: 'src/test/vitest.each.ts',
    clearMocks: true,
  },
});
