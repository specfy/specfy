import { Typography, Space } from 'antd';
import Title from 'antd/es/typography/Title';
import type { ApiDocument, ApiProject } from 'api/src/types/api';

import { useDocumentsStore } from '../../../../common/store';
import { ContentDoc } from '../../../../components/Content';
import { Editor } from '../../../../components/Editor';
import { Time } from '../../../../components/Time';
import { useEdit } from '../../../../hooks/useEdit';

import cls from './index.module.scss';

export const Playbook: React.FC<{
  proj: ApiProject;
  doc: ApiDocument;
}> = ({ proj, doc }) => {
  const documentsStore = useDocumentsStore();

  // Edition
  const edit = useEdit();
  const isEditing = edit.isEnabled();

  return (
    <div className={cls.container}>
      <div>
        <Title level={1} className={cls.title} id={doc.slug}>
          <span className={cls.type}>[PB-{doc.typeId}]</span>
          {doc.name}
        </Title>
        <Space>
          <div className={cls.lastUpdate}>
            Updated <Time time={doc.updatedAt} />
          </div>
        </Space>

        <Typography className={cls.content}>
          {!isEditing && (
            <ContentDoc key={doc.id} id={doc.id} doc={doc.content} />
          )}
          {!isEditing && doc.content.content.length <= 0 && (
            <Typography.Text type="secondary">
              Write something...
            </Typography.Text>
          )}
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
    </div>
  );
};
