import { useQuery } from '@tanstack/react-query';

import type {
  ApiSource,
  DeleteSource,
  ListSources,
  PostSource,
  PutSource,
} from '@specfy/models';

import { qcli } from '@/common/query';

import { fetchApi } from './fetch';
import { APIError, isError } from './helpers';

export async function createSource(
  data: PostSource['Body']
): Promise<PostSource['Reply']> {
  const { res, json } = await fetchApi<PostSource>(
    '/sources',
    { body: data },
    'POST'
  );

  if (res.status === 200) {
    qcli.refetchQueries(['listSources', data.orgId, data.projectId]);
  }

  return json;
}

export async function updateSource(
  opts: PutSource['QP'],
  data: PutSource['Body']
): Promise<PutSource['Reply']> {
  const { res, json } = await fetchApi<PutSource>(
    `/sources/${opts.source_id}`,
    { body: data, qp: { org_id: opts.org_id, project_id: opts.project_id } },
    'PUT'
  );

  if (res.status === 200) {
    qcli.refetchQueries(['listSources', opts.org_id, opts.project_id]);
  }

  return json;
}

export async function deleteSource(
  opts: DeleteSource['QP']
): Promise<DeleteSource['Reply']> {
  const { res, json } = await fetchApi<DeleteSource>(
    `/sources/${opts.source_id}`,
    { qp: { org_id: opts.org_id, project_id: opts.project_id } },
    'DELETE'
  );

  if (res.status === 204) {
    qcli.refetchQueries(['listSources', opts.org_id, opts.project_id]);
  }

  return json;
}

export function useListSources(opts: ListSources['Querystring']) {
  return useQuery({
    queryKey: ['listSources', opts.org_id, opts.project_id],
    queryFn: async (): Promise<ListSources['Success']> => {
      const { json, res } = await fetchApi<ListSources>('/sources', {
        qp: opts,
      });
      if (res.status !== 200 || isError(json)) {
        throw new APIError({ res, json });
      }

      return json;
    },
  });
}

export function getDefaultSettings(): ApiSource['settings'] {
  return {
    branch: 'main',
    documentation: {
      enabled: true,
      path: '/',
    },
    stack: {
      enabled: true,
      path: '/',
    },
  };
}
