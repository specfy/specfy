import { Typography, Space } from 'antd';
import Title from 'antd/es/typography/Title';
import type { ApiDocument, ApiProject } from 'api/src/types/api';
import { useEffect, useState } from 'react';

import { useDocumentsStore } from '../../../../common/store';
import { ContentDoc } from '../../../../components/Content';
import { Editor } from '../../../../components/Editor';
import { HeadingTree } from '../../../../components/HeadingTree';
import { FakeInput } from '../../../../components/Input';
import { SidebarBlock } from '../../../../components/SidebarBlock';
import { Time } from '../../../../components/Time';
import { UserList } from '../../../../components/UserList';
import { useEdit } from '../../../../hooks/useEdit';

import cls from './index.module.scss';

export const RFC: React.FC<{
  proj: ApiProject;
  doc: ApiDocument;
}> = ({ proj, doc }) => {
  const documentsStore = useDocumentsStore();

  // Edition
  const edit = useEdit();
  const isEditing = edit.isEnabled();
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (!doc) {
      return;
    }

    setTitle(doc.name);
  }, [edit, doc]);

  return (
    <>
      <div>
        <div className={cls.headings}>
          <HeadingTree blocks={doc.content.content}></HeadingTree>
        </div>
      </div>
      <div>
        {!isEditing && (
          <Title level={1} className={cls.title} id={doc.slug}>
            <span className={cls.type}>[RFC-{doc.typeId}]</span>
            {title}
          </Title>
        )}
        {isEditing && (
          <FakeInput.H1
            size="large"
            value={title}
            placeholder="Title..."
            onChange={(e) => {
              setTitle(e.target.value);
              documentsStore.updateField(doc.id, 'name', e.target.value);
            }}
          />
        )}
        <Space>
          <div className={cls.lastUpdate}>
            Updated <Time time={doc.updatedAt} />
          </div>
        </Space>

        <Typography className={cls.content}>
          {!isEditing && <ContentDoc doc={doc.content} />}
          {isEditing && (
            <Editor
              content={doc.content}
              minHeight="500px"
              onUpdate={(json) => {
                documentsStore.updateField(doc.id, 'content', json);
              }}
            />
          )}
        </Typography>
      </div>

      <div>
        <SidebarBlock title="Authors">
          <UserList list={doc.authors} />
        </SidebarBlock>
        <SidebarBlock title="Reviewers">
          <UserList list={doc.reviewers} />
        </SidebarBlock>
      </div>
    </>
  );
};
