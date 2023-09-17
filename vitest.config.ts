import { config } from 'dotenv';
import { defineConfig } from 'vitest/config';

if (process.env.TEST_WATCH) {
  // Patch stdin on the process so that we can fake it to seem like a real interactive terminal and pass the TTY checks
  process.stdin.isTTY = true;
  process.stdin.setRawMode = () => process.stdin;
}

process.env = Object.assign(process.env, config({ path: '.env.test' }));
export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      enabled: true,
      all: true,
      reporter: ['cobertura'],
      provider: 'v8',
    },
    setupFiles: ['dotenv/config'],
  },
});
