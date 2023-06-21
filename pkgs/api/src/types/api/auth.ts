import type { Res } from './api';

// POST /auth/local
export type PostAuthLocal = Res<{
  Body: {
    email: string;
    password: string;
  };
  Success: {
    data: { done: boolean };
  };
}>;

// POST /auth/logout
export type PostLogout = Res<{
  Success: never;
}>;
