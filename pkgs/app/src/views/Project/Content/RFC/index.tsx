import { IconCircleMinus, IconCirclePlus } from '@tabler/icons-react';
import { Typography, Space, Divider } from 'antd';
import Title from 'antd/es/typography/Title';
import type { ApiDocument, ApiProject } from 'api/src/types/api';
import clsn from 'classnames';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { useGetDocument } from '../../../../api/documents';
import { Card } from '../../../../components/Card';
import { ContentDoc } from '../../../../components/Content';
import { Editor } from '../../../../components/Editor';
import { HeadingTree } from '../../../../components/HeadingTree';
import { SidebarBlock } from '../../../../components/SidebarBlock';
import { Time } from '../../../../components/Time';
import { UserList } from '../../../../components/UserList';
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
    if (!item) {
      return null;
    }
    return edit.get('document', item.id, item);
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
        <Card padded>
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
                  <IconCirclePlus style={{ color: '#52c41a' }} /> Creates{' '}
                  <Link to="/">Public API</Link>
                </li>
                <li>
                  <IconCirclePlus style={{ color: '#52c41a' }} /> Activity{' '}
                  <Link to="/">Postgres</Link>
                </li>
                <li>
                  <IconCirclePlus style={{ color: '#52c41a' }} /> Introduces{' '}
                  <Link to="/">NodeJS</Link>
                </li>
                <li>
                  <IconCircleMinus style={{ color: '#fa541c' }} /> Removes{' '}
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
          <UserList list={item.authors} />
        </SidebarBlock>
        <SidebarBlock title="Reviewers">
          <UserList list={item.reviewers} />
        </SidebarBlock>
      </div>
    </div>
  );
};
