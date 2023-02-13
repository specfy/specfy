import {
  PlusOutlined,
  MinusOutlined,
  CheckCircleOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { Card, Typography, Space, Divider } from 'antd';
import Title from 'antd/es/typography/Title';
import type { ApiDocument } from 'api/src/types/api/documents';
import type { ApiProject } from 'api/src/types/api/projects';
import clsn from 'classnames';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { useGetDocument } from '../../../api/documents';
import { ContentDoc } from '../../../components/Content';
import { HeadingTree } from '../../../components/HeadingTree';
import { RFCStatusTag } from '../../../components/RFCStatusTag';
import { Time } from '../../../components/Time';
import { UserCard } from '../../../components/UserCard';
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

  useEffect(() => {
    setItem(doc.data?.data);
  }, [doc.isLoading]);

  if (doc.isLoading) {
    return null;
  }

  if (!item) {
    return <div>not found</div>;
  }

  return (
    <div className={clsn(cls.container, menu ? cls.withMenu : null)}>
      <div>
        <Card>
          <Title level={2} className={cls.title}>
            {item.name}{' '}
            <Typography.Text type="secondary" className={cls.subtitle}>
              RFC-{item.typeId}
            </Typography.Text>
          </Title>
          <Space>
            <RFCStatusTag status={item.status} locked={item.locked} />
            <div className={cls.lastUpdate}>
              <Time time={item.updatedAt} />
            </div>
          </Space>

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

          <Typography className={cls.content}>
            <Divider />

            <ContentDoc doc={item.content} />
            {item.content.content.length <= 0 && (
              <Typography.Text type="secondary">No content</Typography.Text>
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
