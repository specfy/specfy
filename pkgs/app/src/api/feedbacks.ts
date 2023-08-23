import type { PostFeedback } from '@specfy/models';

import { fetchApi } from './fetch';

export async function createFeedback(
  data: PostFeedback['Body']
): Promise<PostFeedback['Reply']> {
  const { json } = await fetchApi<PostFeedback>(
    '/feedbacks',
    { body: data },
    'POST'
  );

  return json;
}
