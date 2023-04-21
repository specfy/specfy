import type {
  ReqPostAuthLocal,
  ResPostAuthLocal,
  ResPostLogout,
} from 'api/src/types/api';

import { queryClient } from '../common/query';

import { fetchApi } from './fetch';

export async function authLocal(data: ReqPostAuthLocal) {
  const { json } = await fetchApi<
    ResPostAuthLocal,
    undefined,
    ReqPostAuthLocal
  >('/auth/local', { body: data }, 'POST');

  return json;
}

export async function logout() {
  const { json, res } = await fetchApi<ResPostLogout>(
    '/auth/logout',
    undefined,
    'POST'
  );

  if (res.status === 204) {
    queryClient.clear();
  }
  return json;
}
