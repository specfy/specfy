import type { ResErrors } from './api';

export interface ReqPostAuthLocal {
  email: string;
  password: string;
}

export interface ResPostAuthLocalSuccess {
  data: { done: boolean };
}

export type ResPostAuthLocal = ResErrors | ResPostAuthLocalSuccess;
