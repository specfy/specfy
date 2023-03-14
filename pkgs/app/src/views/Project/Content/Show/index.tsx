import type { ApiProject } from 'api/src/types/api';
import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { slugToTypeId, useGetDocument } from '../../../../api/documents';
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

  // Parse params
  const reqParams = useMemo(() => {
    return slugToTypeId(params.document_slug);
  }, [params]);

  // Load document
  const doc = useGetDocument({
    org_id: proj.orgId,
    project_id: proj.id,
    ...reqParams,
  });
  useEffect(() => {
    if (doc.data?.data) {
      documentsStore.add([doc.data.data]);
      documentsStore.setCurrent(doc.data.data.id);
    }
  }, [doc.data]);

  if (!doc.data) {
    return <div>not found</div>;
  }

  if (reqParams?.document_type === 'rfc') {
    return (
      <div className={cls.wrapper}>
        <div className={cls.container}>
          <RFC proj={proj} doc={doc.data.data} />
        </div>
      </div>
    );
  }

  return (
    <div className={cls.wrapper}>
      <div className={cls.container}>
        <Playbook proj={proj} doc={doc.data.data} />
      </div>
    </div>
  );
};
