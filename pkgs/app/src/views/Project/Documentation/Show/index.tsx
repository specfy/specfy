import type { ApiDocument, ApiProject } from '@specfy/models';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Skeleton from 'react-loading-skeleton';
import { useParams } from 'react-router-dom';

import { useGetDocumentBySlug } from '../../../../api';
import { titleSuffix } from '../../../../common/string';
import { ContentDoc } from '../../../../components/Content';
import { Flex } from '../../../../components/Flex';
import { HeadingTree } from '../../../../components/HeadingTree';
import { NotFound } from '../../../../components/NotFound';
import { UpdatedAt } from '../../../../components/UpdatedAt';
import type { RouteDocumentation } from '../../../../types/routes';

import cls from './index.module.scss';

export const ProjectDocumentationShow: React.FC<{
  proj: ApiProject;
}> = ({ proj }) => {
  const params = useParams<Partial<RouteDocumentation>>() as RouteDocumentation;
  const [doc, setDoc] = useState<ApiDocument>();

  // Load document
  const getDoc = useGetDocumentBySlug({
    org_id: proj.orgId,
    project_id: proj.id,
    slug: params['*'],
  });

  useEffect(() => {
    if (!getDoc.data) {
      return;
    }

    setDoc(getDoc.data.data);
  }, [getDoc.data]);

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

  return (
    <div className={cls.wrapper}>
      <div className={cls.container}>
        <Helmet title={`${doc.name} - ${proj.name} ${titleSuffix}`} />

        <div className={cls.col1}>
          <HeadingTree blocks={doc.content.content}></HeadingTree>
        </div>
        <div className={cls.col2}>
          <div className={cls.header}>
            <h1 id={doc.slug}>{doc.name}</h1>
          </div>
          <UpdatedAt time={doc.updatedAt} />

          <div className={cls.content}>
            <ContentDoc doc={doc.content} />
          </div>
        </div>

        <div className={cls.col3}></div>
      </div>
    </div>
  );
};
