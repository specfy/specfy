import type { Res } from '@specfy/core';
import type { Perms } from '@specfy/db';

export interface ApiMe {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  token: string;
  createdAt: string;
  updatedAt: string;
  perms: Array<Pick<Perms, 'orgId' | 'projectId' | 'role'>>;
}

// GET /me
export type GetMe = Res<{
  Success: {
    data: ApiMe;
  };
}>;

// PUT /me
export type PutMe = Res<{
  Body: {
    name: string;
  };
  Success: { data: { done: boolean } };
}>;

// DELETE /me
export type DeleteMe = Res<{
  Success: never;
}>;
