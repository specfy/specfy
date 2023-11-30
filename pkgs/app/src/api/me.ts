import type { ApiMe, DeleteMe, GetMe, PutMe } from '@specfy/models';

import { qcli } from '@/common/query';

import { fetchApi } from './fetch';
import { isError } from './helpers';

export async function getMe(): Promise<ApiMe | null> {
  const { json, res } = await fetchApi<GetMe>('/me');

  return res.status !== 200 || isError(json) ? null : json.data;
}

export async function updateMe(data: PutMe['Body']): Promise<PutMe['Reply']> {
  const { json, res } = await fetchApi<PutMe>(`/me`, { body: data }, 'PUT');

  if (res.status === 200) {
    void qcli.invalidateQueries(['listOrgs']);
  }

  return json;
}

export async function deleteMe(): Promise<number> {
  const { res } = await fetchApi<DeleteMe>(`/me`, undefined, 'DELETE');

  return res.status;
}
