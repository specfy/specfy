import {
  CommentOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { Skeleton, Timeline } from 'antd';
import Title from 'antd/es/typography/Title';
import type { DBEvent } from 'api/src/types/db/events';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMount } from 'react-use';

import cls from './index.module.scss';

const tmpList: DBEvent[] = [
  {
    id: 'b',
    orgId: 'algolia',
    projectId: '3hjfe8SUHer',
    event: 'updated',
    typeId: '1',
    userId: '1',
    publishedAt: '2023-01-01T00:00:00Z',
    payload: {
      id: '7',
      type: 'rfc',
      slug: 'use-of-oauth2-in-authentication-system',
      name: 'RFC-3 - Use of Oauth2 in authentication system',
      project: {
        id: '3hjfe8SUHer',
        slug: 'crawler',
      },
    },
  },
  {
    id: 'a',
    orgId: 'algolia',
    projectId: '3hjfe8SUHer',
    event: 'created',
    typeId: '1',
    userId: '1',
    publishedAt: '2023-01-01T00:00:00Z',
    payload: {
      id: '7',
      type: 'rfc',
      slug: 'use-of-oauth2-in-authentication-system',
      name: 'RFC-3 - Use of Oauth2 in authentication system',
      project: {
        id: '3hjfe8SUHer',
        slug: 'crawler',
      },
    },
  },
  {
    id: 'c',
    orgId: 'algolia',
    projectId: '3hjfe8SUHer',
    event: 'deleted',
    typeId: '1',
    userId: '1',
    publishedAt: '2023-01-01T00:00:00Z',
    payload: {
      id: '7',
      type: 'rfc',
      slug: 'use-of-oauth2-in-authentication-system',
      name: 'RFC-4 - Elasticsearch introduction',
      project: {
        id: '3hjfe8SUHer',
        slug: 'crawler',
      },
    },
  },
  {
    id: 'd',
    orgId: 'algolia',
    projectId: '3hjfe8SUHer',
    event: 'approved',
    typeId: '5',
    userId: '1',
    publishedAt: '2023-01-01T00:00:00Z',
    payload: {
      id: '7',
      type: 'rfc',
      slug: 'api-definition',
      name: 'RFC-1 - API Definition',
      project: {
        id: '3hjfe8SUHer',
        slug: 'crawler',
      },
    },
  },
  {
    id: 'e',
    orgId: 'algolia',
    projectId: '3hjfe8SUHer',
    event: 'rejected',
    typeId: '5',
    userId: '1',
    publishedAt: '2023-01-01T00:00:00Z',
    payload: {
      id: '7',
      type: 'rfc',
      slug: 'api-definition',
      name: 'RFC-1 - API Definition',
      project: {
        id: '3hjfe8SUHer',
        slug: 'crawler',
      },
    },
  },
  {
    id: 'f',
    orgId: 'algolia',
    projectId: '3hjfe8SUHer',
    event: 'commented',
    typeId: '5',
    userId: '1',
    publishedAt: '2023-01-01T00:00:00Z',
    payload: {
      id: '7',
      type: 'rfc',
      slug: 'fontend-definition',
      name: 'RFC-2 - Frontend Definition',
      project: {
        id: '3hjfe8SUHer',
        slug: 'crawler',
      },
    },
  },
];

export const Update: React.FC<{ evt: DBEvent; orgId: string }> = ({
  evt,
  orgId,
}) => {
  const pl = evt.payload;
  let color = 'gray';
  let icon: ReactNode | undefined;
  if (evt.event === 'created') {
    color = 'blue';
  } else if (evt.event === 'updated') {
    icon = <EditOutlined />;
  } else if (evt.event === 'deleted') {
    color = 'red';
    icon = <DeleteOutlined />;
  } else if (evt.event === 'commented') {
    color = 'gray';
    icon = <CommentOutlined />;
  } else if (evt.event === 'approved') {
    color = 'green';
    icon = <CheckCircleOutlined />;
  } else if (evt.event === 'rejected') {
    color = 'red';
    icon = <CloseCircleOutlined />;
  }

  let target: ReactNode | undefined;
  if (pl.type === 'rfc') {
    target = (
      <Link
        className={cls.linkTarget}
        to={`/org/${orgId}/${pl.project.slug}/c/${pl.id}-${pl.slug}`}
      >
        {pl.name}
      </Link>
    );
  }

  let text = '';
  if (evt.event === 'commented') {
    text = 'on';
  }

  return (
    <Timeline.Item color={color} dot={icon}>
      <div className={cls.item}>
        <Link to={`/u/${evt.userId}`} className={cls.linkUser}>
          @Samuel B.
        </Link>{' '}
        {evt.event} {text} {target}
      </div>
      <div className={cls.date}>2022-01-02</div>
    </Timeline.Item>
  );
};

export const ListActivity: React.FC<{
  orgId: string;
  projectSlug?: string;
}> = ({ projectSlug, orgId }) => {
  const [initLoading, setInitLoading] = useState(true);
  const [list, setList] = useState<DBEvent[]>([]);

  useMount(() => {
    setTimeout(() => {
      setInitLoading(false);
      setList(tmpList);
    }, 250);
  });

  return (
    <div>
      <Title level={5}>Activity</Title>
      {initLoading && (
        <div>
          <Skeleton paragraph={{ rows: 0 }} active />
          <Skeleton paragraph={{ rows: 0 }} active />
          <Skeleton paragraph={{ rows: 0 }} active />
        </div>
      )}
      <Timeline className={cls.list}>
        {list.map((evt) => {
          return <Update key={evt.id} evt={evt} orgId={orgId} />;
        })}
      </Timeline>
    </div>
  );
};
