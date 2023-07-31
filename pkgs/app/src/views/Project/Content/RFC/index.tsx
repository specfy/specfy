import type { ApiDocument, ApiProject } from '@specfy/api/src/types/api';
import { IconDotsVertical } from '@tabler/icons-react';
import type { MenuProps } from 'antd';
import { Typography, Dropdown, Button } from 'antd';
import Title from 'antd/es/typography/Title';
import type { MenuClickEventHandler } from 'rc-menu/lib/interface';
import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

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
import { useToast } from '../../../../hooks/useToast';
import clsLayout from '../Show/index.module.scss';

import cls from './index.module.scss';

export const RFC: React.FC<{
  proj: ApiProject;
  doc: ApiDocument;
}> = ({ doc, proj }) => {
  const documentsStore = useDocumentsStore();
  const toast = useToast();
  const navigate = useNavigate();

  // Edition
  const edit = useEdit();
  const isEditing = edit.isEditing;
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
            <Title level={1} className={cls.title} id={doc.slug}>
              <span className={cls.type}>[RFC-{doc.typeId}]</span>
              {title}
            </Title>
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
          {edit.can && (
            <div>
              <Dropdown menu={{ items: menuItems, onClick: onClickMenu }}>
                <Button icon={<IconDotsVertical />} type="ghost" />
              </Dropdown>
            </div>
          )}
        </div>
        <UpdatedAt time={doc.updatedAt} />

        <Typography className={cls.content}>
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
        </Typography>
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
