import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { Card, Typography, Space, Divider } from 'antd';
import Title from 'antd/es/typography/Title';
import type { ApiDocument } from 'api/src/types/api/documents';
import type { ApiProject } from 'api/src/types/api/projects';
import clsn from 'classnames';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { useGetDocument } from '../../../../api/documents';
import { ContentDoc } from '../../../../components/Content';
import { Editor } from '../../../../components/Editor';
import { HeadingTree } from '../../../../components/HeadingTree';
import {
  SidebarBlock,
  SidebarUserList,
} from '../../../../components/SidebarBlock';
import { Time } from '../../../../components/Time';
import { useEdit } from '../../../../hooks/useEdit';
import type { RouteDocument, RouteProject } from '../../../../types/routes';

import cls from './index.module.scss';

export const RFC: React.FC<{
  proj: ApiProject;
  params: RouteProject;
}> = ({ proj, params }) => {
  const [menu] = useState(true);
  const [item, setItem] = useState<ApiDocument>();
  const p = useParams<Partial<RouteDocument>>();
  const doc = useGetDocument({
    type: 'rfc',
    type_id: p.document_type_id!,
    org_id: p.org_id!,
  });

  // Edition
  const edit = useEdit();
  const curr = useMemo(() => {
    if (!item) return null;
    return edit.get<ApiDocument>('document', item.id, item);
  }, [edit.isEnabled, item]);
  const content = useMemo(() => {
    return curr?.changes.content || item?.content;
  }, [item, curr]);

  useEffect(() => {
    setItem(doc.data?.data);
  }, [doc.isLoading]);

  if (doc.isLoading) {
    return null;
  }

  if (!item || !content) {
    return <div>not found</div>;
  }

  return (
    <div className={clsn(cls.container, menu ? cls.withMenu : null)}>
      <div>
        <Card className={cls.card}>
          <Title level={1} className={cls.title}>
            {item.name}{' '}
            <Typography.Text type="secondary" className={cls.subtitle}>
              RFC-{item.typeId}
            </Typography.Text>
          </Title>
          <Space>
            <div className={cls.lastUpdate}>
              updated <Time time={item.updatedAt} />
            </div>
          </Space>
          {!edit.isEnabled() && (
            <div>
              {item.tldr && <p className={cls.tldr}>{item.tldr}</p>}

              <ul className={cls.tldrList}>
                <li>
                  <PlusOutlined style={{ color: '#52c41a' }} /> Creates{' '}
                  <Link to="/">Public API</Link>
                </li>
                <li>
                  <PlusOutlined style={{ color: '#52c41a' }} /> Activity{' '}
                  <Link to="/">Postgres</Link>
                </li>
                <li>
                  <PlusOutlined style={{ color: '#52c41a' }} /> Introduces{' '}
                  <Link to="/">NodeJS</Link>
                </li>
                <li>
                  <MinusOutlined style={{ color: '#fa541c' }} /> Removes{' '}
                  <Link to="/">Golang</Link>
                </li>
              </ul>
              <Divider />
            </div>
          )}

          <Typography className={cls.content}>
            {!edit.isEnabled() && <ContentDoc doc={content} />}
            {!edit.isEnabled() && item.content.content.length <= 0 && (
              <Typography.Text type="secondary">
                Write something...
              </Typography.Text>
            )}
            {edit.isEnabled() && (
              <Editor
                content={content}
                minHeight="500px"
                onUpdate={(json) => {
                  curr?.set('content', json);
                }}
              />
            )}
          </Typography>
          {menu && (
            <div className={cls.headings}>
              <HeadingTree blocks={item.content.content}></HeadingTree>
            </div>
          )}
        </Card>
      </div>

      <div className={cls.right}>
        <SidebarBlock title="Authors">
          <SidebarUserList list={item.authors} />
        </SidebarBlock>
        <SidebarBlock title="Reviewers">
          <SidebarUserList list={item.reviewers} />
        </SidebarBlock>
      </div>
    </div>
  );
};
