import { useQuery } from '@tanstack/react-query';
import type {
  ReqDocumentParams,
  ReqGetDocument,
  ReqListDocuments,
  ResGetDocument,
  ResGetDocumentSuccess,
  ResListDocuments,
  ResListDocumentsSuccess,
} from 'api/src/types/api';

import originalStore from '../common/store';

import { fetchApi } from './fetch';
import { APIError, isError } from './helpers';

export function useListDocuments(opts: ReqListDocuments) {
  return useQuery({
    queryKey: [
      'listDocuments',
      opts.org_id,
      opts.project_id,
      opts.search,
      opts.type,
    ],
    queryFn: async (): Promise<ResListDocumentsSuccess> => {
      const { json, res } = await fetchApi<ResListDocuments, ReqListDocuments>(
        '/documents',
        {
          qp: opts,
        }
      );

      if (res.status !== 200 || isError(json)) {
        throw new APIError({ res, json });
      }

      return json;
    },
  });
}

export function useGetDocument(
  opts: Partial<ReqDocumentParams> & ReqGetDocument
) {
  return useQuery({
    enabled: Boolean(opts.document_id),
    queryKey: ['getDocument', opts.org_id, opts.project_id, opts.document_id],
    queryFn: async (): Promise<ResGetDocumentSuccess> => {
      const { json, res } = await fetchApi<ResGetDocument, ReqGetDocument>(
        `/documents/${opts.document_id}`,
        {
          qp: { org_id: opts.org_id, project_id: opts.project_id },
        }
      );

      if (res.status !== 200 || isError(json)) {
        throw new APIError({ res, json });
      }

      originalStore.add(json.data);
      return json;
    },
  });
}
