import type { ApiDocument, ApiProject } from 'api/src/types/api';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useGetDocument } from '../../../../api/documents';
import { useDocumentsStore } from '../../../../common/store';
import { useEdit } from '../../../../hooks/useEdit';
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
  const edit = useEdit();

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
    if (getDoc.data?.data) {
      documentsStore.add([getDoc.data.data]);
      setDoc(getDoc.data.data);
    } else if (documentsStore.documents[reqParams.document_id]) {
      setDoc(documentsStore.documents[reqParams.document_id]);
    }
  }, [getDoc]);

  useEffect(() => {
    // Update doc only if we exit edit mode to avoid rerender the whole view at each keystroke
    if (!edit.isEnabled() && edit.prev()) {
      const [id] = params.document_slug.split('-');

      if (documentsStore.documents[id]) {
        setDoc(documentsStore.documents[id]);
        return;
      }
    }
  }, [edit, documentsStore.documents]);

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
