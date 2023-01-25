import type {
  ReqDocumentParams,
  ReqGetDocument,
  ReqListDocuments,
  ResGetDocument,
  ResListDocuments,
} from 'api/src/types/api/documents';
import { useQuery } from 'react-query';

import { fetchApi } from './fetch';

export function useListDocuments(opts: ReqListDocuments) {
  return useQuery({
    queryKey: ['listDocuments', opts.org_id, opts.project_id],
    queryFn: async (): Promise<ResListDocuments> => {
      const { json } = await fetchApi<ResListDocuments>('/documents', {
        qp: opts,
      });

      return json;
    },
  });
}

export function useGetDocument(opts: ReqDocumentParams & ReqGetDocument) {
  return useQuery({
    enabled: !!opts.typeId,
    queryKey: ['getDocument', opts.type, opts.typeId],
    queryFn: async (): Promise<ResGetDocument> => {
      const { json } = await fetchApi<ResGetDocument>(
        `/documents/${opts.type}/${opts.typeId}`,
        {
          qp: { org_id: opts.org_id },
        }
      );

      return json;
    },
  });
}
