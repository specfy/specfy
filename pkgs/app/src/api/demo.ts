import type { PostDemo } from '@specfy/models';

import { fetchApi } from './fetch';

export async function createDemo(): Promise<PostDemo['Reply']> {
  const { json } = await fetchApi<PostDemo>('/demo', undefined, 'POST');
  return json;
}
