import type { GetDocument, ListDocuments } from '@specfy/models';
import { useQuery } from '@tanstack/react-query';

import { addOriginal } from '../common/store';

import { fetchApi } from './fetch';
import { APIError, isError } from './helpers';

export function useListDocuments(opts: ListDocuments['Querystring']) {
  return useQuery({
    queryKey: [
      'listDocuments',
      opts.org_id,
      opts.project_id,
      opts.search,
      opts.type,
    ],
    queryFn: async (): Promise<ListDocuments['Success']> => {
      const { json, res } = await fetchApi<ListDocuments>('/documents', {
        qp: opts,
      });

      if (res.status !== 200 || isError(json)) {
        throw new APIError({ res, json });
      }

      return json;
    },
  });
}

export function useGetDocument(
  opts: GetDocument['Querystring'] & Partial<GetDocument['Params']>
) {
  return useQuery({
    enabled: Boolean(opts.document_id),
    queryKey: ['getDocument', opts.org_id, opts.project_id, opts.document_id],
    queryFn: async (): Promise<GetDocument['Success']> => {
      const { json, res } = await fetchApi<GetDocument>(
        `/documents/${opts.document_id}`,
        {
          qp: { org_id: opts.org_id, project_id: opts.project_id },
        }
      );

      if (res.status !== 200 || isError(json)) {
        throw new APIError({ res, json });
      }

      addOriginal(json.data);
      return json;
    },
  });
}
