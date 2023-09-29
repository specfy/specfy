import type { SourceSettingsGithub } from './types.js';

export function getDefaultConfig(): SourceSettingsGithub {
  return {
    branch: 'main',
    documentation: {
      enabled: true,
      path: '/',
    },
    stack: {
      enabled: true,
      path: '/',
    },
  };
}
