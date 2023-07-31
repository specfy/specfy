import type { ApiDocument, ApiProject } from '@specfy/api/src/types/api';
import { IconDotsVertical } from '@tabler/icons-react';
import type { MenuProps } from 'antd';
import { Dropdown } from 'antd';
import type { MenuClickEventHandler } from 'rc-menu/lib/interface';
import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

import { useDocumentsStore } from '../../../../common/store';
import { titleSuffix } from '../../../../common/string';
import { ContentDoc } from '../../../../components/Content';
import { Editor } from '../../../../components/Editor';
import { Button } from '../../../../components/Form/Button';
import { FakeInput } from '../../../../components/Form/FakeInput';
import { HeadingTree } from '../../../../components/HeadingTree';
import { UpdatedAt } from '../../../../components/UpdatedAt';
import { useEdit } from '../../../../hooks/useEdit';
import { useToast } from '../../../../hooks/useToast';
import clsLayout from '../Show/index.module.scss';

import cls from './index.module.scss';

export const Doc: React.FC<{
  proj: ApiProject;
  doc: ApiDocument;
}> = ({ doc, proj }) => {
  const documentsStore = useDocumentsStore();
  const toast = useToast();
  const navigate = useNavigate();

  // Edition
  const edit = useEdit();
  const isEditing = false;
  const [title, setTitle] = useState('');

  useEffect(() => {
    setTitle(doc.name);
  }, [edit, doc]);

  const menuItems = useMemo<MenuProps['items']>(() => {
    return [{ key: 'delete', label: 'Delete', danger: true }];
  }, []);

  const onClickMenu: MenuClickEventHandler = (e) => {
    if (e.key === 'delete') {
      edit.enable(true);
      documentsStore.remove(doc.id);
      toast.add({ title: 'Document deleted', status: 'success' });
      navigate(`/${proj.orgId}/${proj.slug}/content`);
    }
  };

  return (
    <>
      <Helmet title={`${doc.name} - ${proj.name} ${titleSuffix}`} />

      <div className={clsLayout.col1}>
        <div className={cls.headings}>
          <HeadingTree blocks={doc.content.content}></HeadingTree>
        </div>
      </div>
      <div className={clsLayout.col2}>
        <div className={cls.header}>
          {!isEditing && (
            <h1 className={cls.title} id={doc.slug}>
              {title}
            </h1>
          )}
          {isEditing && (
            <div className={cls.title}>
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

          {edit.can && (
            <div>
              <Dropdown menu={{ items: menuItems, onClick: onClickMenu }}>
                <Button display="ghost">
                  <IconDotsVertical />
                </Button>
              </Dropdown>
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

      <div className={clsLayout.col3}></div>
    </>
  );
};
