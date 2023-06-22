import { IconDotsVertical } from '@tabler/icons-react';
import type { MenuProps } from 'antd';
import { App, Typography, Dropdown, Button } from 'antd';
import Title from 'antd/es/typography/Title';
import type { ApiDocument, ApiProject } from 'api/src/types/api';
import type { MenuClickEventHandler } from 'rc-menu/lib/interface';
import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

import { useDocumentsStore } from '../../../../common/store';
import { titleSuffix } from '../../../../common/string';
import { ContentDoc } from '../../../../components/Content';
import { Editor } from '../../../../components/Editor';
import { HeadingTree } from '../../../../components/HeadingTree';
import { FakeInput } from '../../../../components/Input';
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
  const { message } = App.useApp();
  const navigate = useNavigate();

  // Edition
  const edit = useEdit();
  const isEditing = edit.isEnabled();
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
      documentsStore.remove(doc!.id);
      message.success('Document deleted');
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
                size="large"
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
