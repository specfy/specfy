import type { CommentRevision } from '@specfy/models';

import { qcli } from '../common/query';

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
    qcli.refetchQueries(['getRevision', ...keys]);
    qcli.refetchQueries(['getRevisionChecks', ...keys]);
  }

  return json;
}
