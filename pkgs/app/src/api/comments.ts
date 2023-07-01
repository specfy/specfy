import type { CommentRevision } from '@specfy/api/src/types/api';

import { queryClient } from '../common/query';

import { fetchApi } from './fetch';

export async function createComment(
  qp: CommentRevision['QP'],
  data: CommentRevision['Body']
): Promise<CommentRevision['Reply']> {
  const { res, json } = await fetchApi<CommentRevision>(
    `/revisions/${qp.revision_id}/comment`,
    { body: data, qp },
    'POST'
  );

  const keys = [qp.org_id, qp.project_id, qp.revision_id];

  if (res.status === 200) {
    queryClient.refetchQueries(['getRevision', ...keys]);
    queryClient.refetchQueries(['getRevisionChecks', ...keys]);
  }

  return json;
}
