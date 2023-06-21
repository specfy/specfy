import type { Res } from './api';

export type GetRoot = Res<{
  Success: { root: true };
}>;
