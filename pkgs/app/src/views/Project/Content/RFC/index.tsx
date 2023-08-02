import type { ApiDocument, ApiProject } from '@specfy/api/src/types/api';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';

import { useDocumentsStore } from '../../../../common/store';
import { titleSuffix } from '../../../../common/string';
import { ContentDoc } from '../../../../components/Content';
import { Editor } from '../../../../components/Editor';
import { FakeInput } from '../../../../components/Form/FakeInput';
import { HeadingTree } from '../../../../components/HeadingTree';
import { SidebarBlock } from '../../../../components/Sidebar/Block';
import { UpdatedAt } from '../../../../components/UpdatedAt';
import { UserList } from '../../../../components/UserList';
import { useEdit } from '../../../../hooks/useEdit';
import clsLayout from '../Show/index.module.scss';

import cls from './index.module.scss';

export const RFC: React.FC<{
  proj: ApiProject;
  doc: ApiDocument;
}> = ({ doc, proj }) => {
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
      <div className={clsLayout.col1}>
        <HeadingTree blocks={doc.content.content}></HeadingTree>
      </div>
      <div className={clsLayout.col2}>
        <div className={cls.header}>
          {!isEditing && (
            <h1 className={cls.title} id={doc.slug}>
              <span className={cls.type}>[RFC-{doc.typeId}]</span>
              {title}
            </h1>
          )}
          {isEditing && (
            <div className={cls.title}>
              <span className={cls.type}>[RFC-{doc.typeId}]</span>
              <FakeInput.H1
                size="l"
                value={title}
                placeholder="Title..."
                onChange={(e) => {
                  setTitle(e.target.value);
                  documentsStore.updateField(doc.id, 'name', e.target.value);
                }}
              />
            </div>
          )}
        </div>
        <UpdatedAt time={doc.updatedAt} />

        <div className={cls.content}>
          {!isEditing && <ContentDoc doc={doc.content} />}
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

      <div className={clsLayout.col3}>
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
