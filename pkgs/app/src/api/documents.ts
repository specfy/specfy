import type {
  ReqDocumentParams,
  ReqGetDocument,
  ReqListDocuments,
  ResGetDocument,
  ResListDocuments,
} from 'api/src/types/api';
import { useQuery } from 'react-query';

import originalStore from '../common/store';

import { fetchApi } from './fetch';

export function useListDocuments(opts: ReqListDocuments) {
  return useQuery({
    queryKey: ['listDocuments', opts.org_id, opts.project_id, opts.search],
    queryFn: async (): Promise<ResListDocuments> => {
      const { json } = await fetchApi<ResListDocuments, ReqListDocuments>(
        '/documents',
        {
          qp: opts,
        }
      );

      return json;
    },
  });
}

export function useGetDocument(opts: ReqDocumentParams & ReqGetDocument) {
  return useQuery({
    enabled: !!opts.type_id,
    queryKey: ['getDocument', opts.type, opts.type_id],
    queryFn: async (): Promise<ResGetDocument> => {
      const { json } = await fetchApi<ResGetDocument, ReqGetDocument>(
        `/documents/${opts.type}/${opts.type_id}`,
        {
          qp: { org_id: opts.org_id },
        }
      );

      originalStore.add(json.data);
      return json;
    },
  });
}
