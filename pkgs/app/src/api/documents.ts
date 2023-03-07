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
    queryKey: ['getDocument', opts.org_id, opts.project_id, opts.document_slug],
    queryFn: async (): Promise<ResGetDocument> => {
      const { json } = await fetchApi<ResGetDocument, ReqGetDocument>(
        `/documents/${opts.document_slug}`,
        {
          qp: { org_id: opts.org_id, project_id: opts.project_id },
        }
      );

      originalStore.add(json.data);
      return json;
    },
  });
}
