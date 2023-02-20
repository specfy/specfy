import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { Card, Typography, Space, Divider } from 'antd';
import Title from 'antd/es/typography/Title';
import type { ApiDocument } from 'api/src/types/api/documents';
import type { ApiProject } from 'api/src/types/api/projects';
import clsn from 'classnames';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { useGetDocument } from '../../../api/documents';
import { ContentDoc } from '../../../components/Content';
import { Editor } from '../../../components/Editor';
import { HeadingTree } from '../../../components/HeadingTree';
import { RFCStatusTag } from '../../../components/RFCStatusTag';
import { Time } from '../../../components/Time';
import { UserCard } from '../../../components/UserCard';
import { useEdit } from '../../../hooks/useEdit';
import type { RouteDocument, RouteProject } from '../../../types/routes';

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
    return curr?.edits.content || item?.content;
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
            <RFCStatusTag status={item.status} locked={item.locked} />
            <div className={cls.lastUpdate}>
              updated <Time time={item.updatedAt} />
            </div>
          </Space>
          {!edit.isEnabled && (
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
            {!edit.isEnabled && <ContentDoc doc={content} />}
            {!edit.isEnabled && item.content.content.length <= 0 && (
              <Typography.Text type="secondary">
                Write something...
              </Typography.Text>
            )}
            {edit.isEnabled && (
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
        <div className={cls.infoBlock}>
          <div className={cls.infoHeader}>Authors</div>
          <ul className={cls.userList}>
            {item.authors.map((user) => {
              return (
                <li key={user.id}>
                  <UserCard name={user.name} size="small" />
                </li>
              );
            })}
          </ul>
        </div>
        <div className={cls.infoBlock}>
          <div className={cls.infoHeader}>Reviewers</div>
          <ul className={cls.userList}>
            {item.reviewers.map((user) => {
              return (
                <li key={user.id}>
                  <UserCard name={user.name} size="small" />
                </li>
              );
            })}
            {item.reviewers.length <= 0 && (
              <Typography.Text type="secondary">
                No one assigned
              </Typography.Text>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};
