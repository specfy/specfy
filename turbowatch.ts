import type { ChangeEvent } from 'turbowatch';
import { defineConfig } from 'turbowatch';

export default defineConfig({
  project: `${__dirname}/pkgs/`,
  debounce: {
    wait: 1000,
  },
  triggers: [
    {
      name: 'api:build',
      initialRun: true,
      interruptible: false,
      persistent: true,
      expression: ['match', '*.ts', 'basename'],
      onChange: async ({ spawn }: ChangeEvent) => {
        await spawn`npm run -w @specfy/api build`;
      },
    },
    {
      name: 'api:run',
      interruptible: true,
      persistent: true,
      // expression: ['dirname', path.join(__dirname, 'pkgs', 'api', 'dist')],

      // expression: ['match', '*.js', 'basename'],
      expression: [
        'allof',
        ['not', ['dirname', 'node_modules']],
        ['anyof', ['match', '*.js', 'basename']],
      ],
      onChange: async ({ spawn }: ChangeEvent) => {
        await spawn`npm run -w @specfy/api dev:built`;
      },
      retry: {
        retries: 1,
      },
    },
  ],
});
