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
    queryKey: [
      'listDocuments',
      opts.org_id,
      opts.project_id,
      opts.search,
      opts.type,
    ],
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

export function slugToTypeId(slug: string): ReqDocumentParams | null {
  const split = slug.split('-');
  if (split.length <= 1) {
    return null;
  }
  if (split[0] !== 'rfc' && split[0] !== 'pb') {
    return null;
  }

  return {
    document_type: split[0],
    document_typeid: split[1],
  };
}

export function useGetDocument(
  opts: Partial<ReqDocumentParams> & ReqGetDocument
) {
  return useQuery({
    enabled: Boolean(opts.document_type && opts.document_typeid),
    queryKey: [
      'getDocument',
      opts.org_id,
      opts.project_id,
      opts.document_type,
      opts.document_typeid,
    ],
    queryFn: async (): Promise<ResGetDocument> => {
      const { json } = await fetchApi<ResGetDocument, ReqGetDocument>(
        `/documents/${opts.document_type}/${opts.document_typeid}`,
        {
          qp: { org_id: opts.org_id, project_id: opts.project_id },
        }
      );

      originalStore.add(json.data);
      return json;
    },
  });
}
