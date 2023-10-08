import type { ComponentType } from './types.js';

export function isHosting(type: ComponentType) {
  return type === 'hosting' || type === 'cloud';
}
