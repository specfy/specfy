import type { ApiDocument, ApiProject } from 'api/src/types/api';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useGetDocument } from '../../../../api/documents';
import { useDocumentsStore } from '../../../../common/store';
import type { RouteDocument } from '../../../../types/routes';
import { Playbook } from '../Playbook';
import { RFC } from '../RFC';

import cls from './index.module.scss';

export const DocumentShow: React.FC<{
  proj: ApiProject;
}> = ({ proj }) => {
  const params = useParams<Partial<RouteDocument>>() as RouteDocument;
  const documentsStore = useDocumentsStore();
  const [doc, setDoc] = useState<ApiDocument>();

  // Parse params
  const reqParams = useMemo(() => {
    const split = params.document_slug.split('-');
    return { document_id: split[0] };
  }, [params]);

  // Load document
  const getDoc = useGetDocument({
    org_id: proj.orgId,
    project_id: proj.id,
    ...reqParams,
  });

  useEffect(() => {
    const [type, typeId] = params.document_slug.split('-');
    const exists = documentsStore.select(
      type as ApiDocument['type'],
      parseInt(typeId)
    );
    if (exists) {
      setDoc(exists);
      return;
    }
    if (getDoc.data?.data) {
      documentsStore.add([getDoc.data.data]);
      setDoc(getDoc.data.data);
    }
  }, [getDoc.data]);

  if (!doc) {
    return <div>not found</div>;
  }

  if (doc.type === 'rfc') {
    return (
      <div className={cls.wrapper}>
        <div className={cls.container}>
          <RFC proj={proj} doc={doc} />
        </div>
      </div>
    );
  }

  return (
    <div className={cls.wrapper}>
      <div className={cls.container}>
        <Playbook proj={proj} doc={doc} />
      </div>
    </div>
  );
};
