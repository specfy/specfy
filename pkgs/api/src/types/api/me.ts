import type { Res } from './api';

export interface ApiMe {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
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
  Success: { data: ApiMe };
}>;

// DELETE /me
export type DeleteMe = Res<{
  Success: never;
}>;
