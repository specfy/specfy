import type { PostDemo } from '@specfy/models';

import { qcli } from '../common/query';

import { fetchApi } from './fetch';

export async function createDemo(): Promise<PostDemo['Reply']> {
  const { res, json } = await fetchApi<PostDemo>('/demo', undefined, 'POST');

  if (res.status === 200) {
    qcli.refetchQueries(['listOrgs']);
  }

  return json;
}
