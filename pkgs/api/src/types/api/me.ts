import type { ResErrors } from './api';

export interface ApiMe {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResGetMeSuccess {
  data: ApiMe;
}
export type ResGetMe = ResErrors | ResGetMeSuccess;
