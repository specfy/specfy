import type { Res } from './api.js';

export type GetRoot = Res<{
  Success: { root: true };
}>;
