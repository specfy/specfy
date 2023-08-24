import type { PostAiOperation } from '@specfy/models';

import { fetchApi } from './fetch';

export async function aiOperation(
  body: PostAiOperation['Body']
): Promise<PostAiOperation['Reply']> {
  const { json } = await fetchApi<PostAiOperation>(
    '/ai',
    {
      body,
    },
    'POST'
  );

  return json;
}
