import type { SourceSettingsGithub } from './types.js';
import type { RequiredDeep } from 'type-fest';

export function getDefaultConfig(): RequiredDeep<SourceSettingsGithub> {
  return {
    branch: 'main',
    documentation: { enabled: true, path: '/' },
    stack: { enabled: true, path: '/' },
    git: { enabled: true },
  };
}
