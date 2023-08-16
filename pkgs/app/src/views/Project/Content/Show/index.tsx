import type { ApiDocument, ApiProject } from '@specfy/models';
import { useEffect, useMemo, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { useParams } from 'react-router-dom';

import { useGetDocument } from '../../../../api';
import { useDocumentsStore } from '../../../../common/store';
import { Flex } from '../../../../components/Flex';
import { NotFound } from '../../../../components/NotFound';
import type { RouteDocument } from '../../../../types/routes';
import { Doc } from '../Doc';
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
    if (reqParams.document_id in documentsStore.documents) {
      setDoc(documentsStore.documents[reqParams.document_id]);
    } else if (getDoc.data?.data) {
      documentsStore.add([getDoc.data.data]);
      setDoc(getDoc.data.data);
    }
  }, [getDoc.data, reqParams]);

  if (getDoc.isLoading && !doc) {
    return (
      <div className={cls.wrapper}>
        <div className={cls.container}>
          <div></div>
          <Flex column gap="l" align="flex-start" style={{ margin: '32px 0' }}>
            <Skeleton height={40} width={200} />
            <Skeleton count={3} width={400} />
          </Flex>
        </div>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className={cls.wrapper}>
        <div className={cls.container}>
          <div></div>

          <NotFound />
        </div>
      </div>
    );
  }

  if (doc.type === 'rfc') {
    return (
      <div className={cls.wrapper}>
        <div className={cls.container}>
          <RFC proj={proj} doc={doc} />
        </div>
      </div>
    );
  } else if (doc.type === 'doc') {
    return (
      <div className={cls.wrapper}>
        <div className={cls.container}>
          <Doc proj={proj} doc={doc} />
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
