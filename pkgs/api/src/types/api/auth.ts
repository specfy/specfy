import type { ResErrors } from './api';

// POST /auth/local
export interface ReqPostAuthLocal {
  email: string;
  password: string;
}

export interface ResPostAuthLocalSuccess {
  data: { done: boolean };
}

export type ResPostAuthLocal = ResErrors | ResPostAuthLocalSuccess;

// POST /auth/logout
export type ResPostLogoutSuccess = never;
export type ResPostLogout = ResErrors | ResPostLogoutSuccess;
