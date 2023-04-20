import type { ReqPostAuthLocal, ResPostAuthLocal } from 'api/src/types/api';

import { fetchApi } from './fetch';

export async function authLocal(data: ReqPostAuthLocal) {
  const { json } = await fetchApi<
    ResPostAuthLocal,
    undefined,
    ReqPostAuthLocal
  >('/auth/local', { body: data }, 'POST');

  return json;
}
