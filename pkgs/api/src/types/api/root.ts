import type { Res } from '@specfy/core';

export type GetRoot = Res<{
  Success: { root: true };
}>;
