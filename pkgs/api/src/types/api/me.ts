import type { ResErrors } from './api';

export interface ApiMe {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

// GET /me
export interface ResGetMeSuccess {
  data: ApiMe;
}
export type ResGetMe = ResErrors | ResGetMeSuccess;

// PUT /me
export type ReqPutMe = {
  name: string;
};
export type ResPutMeSuccess = { data: ApiMe };
export type ResPutMe = ResErrors | ResPutMeSuccess;

// DELETE /me
export type ResDeleteMeSuccess = never;
export type ResDeleteMe = ResDeleteMeSuccess | ResErrors;
