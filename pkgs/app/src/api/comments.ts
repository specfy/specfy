import type {
  ReqGetRevision,
  ReqPostCommentRevision,
  ReqRevisionParams,
  ResPostCommentRevision,
} from 'api/src/types/api';

import { queryClient } from '../common/query';

import { fetchApi } from './fetch';

export async function createComment(
  qp: ReqGetRevision & ReqRevisionParams,
  data: ReqPostCommentRevision
): Promise<ResPostCommentRevision> {
  const { json } = await fetchApi<
    ResPostCommentRevision,
    ReqGetRevision,
    ReqPostCommentRevision
  >(`/revisions/${qp.revision_id}/comment`, { body: data, qp }, 'POST');

  const keys = [qp.org_id, qp.project_id, qp.revision_id];
  queryClient.refetchQueries(['getRevision', ...keys]);
  queryClient.refetchQueries(['getRevisionChecks', ...keys]);

  return json;
}
