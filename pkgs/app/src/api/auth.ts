import type { PostAuthLocal, PostLogout } from '@specfy/api/src/types/api/auth';

import { qcli } from '@/common/query';

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
    qcli.clear();
  }
  return json;
}
