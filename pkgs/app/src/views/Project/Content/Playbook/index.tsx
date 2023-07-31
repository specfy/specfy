import type { ApiDocument, ApiProject } from '@specfy/api/src/types/api';
import { Space } from 'antd';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';

import { useDocumentsStore } from '../../../../common/store';
import { titleSuffix } from '../../../../common/string';
import { ContentDoc } from '../../../../components/Content';
import { Editor } from '../../../../components/Editor';
import { FakeInput } from '../../../../components/Form/FakeInput';
import { Time } from '../../../../components/Time';
import { useEdit } from '../../../../hooks/useEdit';
import clsLayout from '../Show/index.module.scss';

import cls from './index.module.scss';

export const Playbook: React.FC<{
  proj: ApiProject;
  doc: ApiDocument;
}> = ({ proj, doc }) => {
  const documentsStore = useDocumentsStore();

  // Edition
  const edit = useEdit();
  const isEditing = edit.isEditing;
  const [title, setTitle] = useState('');

  useEffect(() => {
    setTitle(doc.name);
  }, [edit, doc]);

  return (
    <>
      <Helmet title={`${doc.name} - ${proj.name} ${titleSuffix}`} />
      <div className={clsLayout.col1}></div>
      <div className={clsLayout.col2}>
        {!isEditing && (
          <h1 className={cls.title} id={doc.slug}>
            <span className={cls.type}>[RFC-{doc.typeId}]</span>
            {title}
          </h1>
        )}
        {isEditing && (
          <FakeInput.H1
            size="l"
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

        <div className={cls.content}>
          {!isEditing && (
            <ContentDoc key={doc.id} id={doc.id} doc={doc.content} />
          )}
          {isEditing && (
            <Editor
              key={doc.id}
              content={doc.content}
              minHeight="500px"
              onUpdate={(json) => {
                documentsStore.updateField(doc.id, 'content', json);
              }}
            />
          )}
        </div>
      </div>
      <div className={clsLayout.col3}></div>
    </>
  );
};
