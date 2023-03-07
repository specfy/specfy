import { Typography, Space } from 'antd';
import Title from 'antd/es/typography/Title';
import type { ApiDocument, ApiProject } from 'api/src/types/api';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { slugToTypeId, useGetDocument } from '../../../../api/documents';
import { useDocumentsStore } from '../../../../common/store';
import { ContentDoc } from '../../../../components/Content';
import { Editor } from '../../../../components/Editor';
import { HeadingTree } from '../../../../components/HeadingTree';
import { SidebarBlock } from '../../../../components/SidebarBlock';
import { Time } from '../../../../components/Time';
import { UserList } from '../../../../components/UserList';
import { useEdit } from '../../../../hooks/useEdit';
import type { RouteDocument } from '../../../../types/routes';

import cls from './index.module.scss';

export const RFC: React.FC<{
  proj: ApiProject;
}> = ({ proj }) => {
  const [item, setItem] = useState<ApiDocument>();
  const params = useParams<Partial<RouteDocument>>();
  const reqParams = useMemo(() => {
    return slugToTypeId(params.document_slug!);
  }, [params]);
  const doc = useGetDocument({
    org_id: proj.orgId,
    project_id: proj.id,
    ...reqParams,
  });
  const documentsStore = useDocumentsStore();

  // Edition
  const edit = useEdit();
  const isEditing = edit.isEnabled();

  useEffect(() => {
    if (doc.data?.data) {
      documentsStore.add([doc.data.data]);
      setItem(documentsStore.select(doc.data.data.slug));
    }
  }, [doc.data]);

  if (doc.isLoading) {
    return null;
  }

  if (!item) {
    return <div>not found</div>;
  }

  return (
    <div className={cls.container}>
      <div>
        <div className={cls.headings}>
          <HeadingTree blocks={item.content.content}></HeadingTree>
        </div>
      </div>
      <div>
        <Title level={1} className={cls.title}>
          <span className={cls.type}>[RFC-{item.typeId}]</span>
          {item.name}
        </Title>
        <Space>
          <div className={cls.lastUpdate}>
            Updated <Time time={item.updatedAt} />
          </div>
        </Space>

        <Typography className={cls.content}>
          {!isEditing && <ContentDoc doc={item.content} />}
          {!isEditing && item.content.content.length <= 0 && (
            <Typography.Text type="secondary">
              Write something...
            </Typography.Text>
          )}
          {isEditing && (
            <Editor
              content={item.content}
              minHeight="500px"
              onUpdate={(json) => {
                documentsStore.updateField(item.id, 'content', json);
              }}
            />
          )}
        </Typography>
      </div>

      <div>
        <SidebarBlock title="Authors">
          <UserList list={item.authors} />
        </SidebarBlock>
        <SidebarBlock title="Reviewers">
          <UserList list={item.reviewers} />
        </SidebarBlock>
      </div>
    </div>
  );
};
