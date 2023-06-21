import type { PostAuthLocal, PostLogout } from 'api/src/types/api';

import { queryClient } from '../common/query';

import { fetchApi } from './fetch';

export async function authLocal(data: PostAuthLocal['Body']) {
  const { json } = await fetchApi<PostAuthLocal>(
    '/auth/local',
    { body: data },
    'POST'
  );

  return json;
}

export async function logout() {
  const { json, res } = await fetchApi<PostLogout>(
    '/auth/logout',
    undefined,
    'POST'
  );

  if (res.status === 204) {
    queryClient.clear();
  }
  return json;
}
