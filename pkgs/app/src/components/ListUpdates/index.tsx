import {
  CommentOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { Skeleton, Timeline } from 'antd';
import Title from 'antd/es/typography/Title';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMount } from 'react-use';

import cls from './index.module.scss';

interface Event {
  id: string;
  event:
    | 'approved'
    | 'commented'
    | 'created'
    | 'deleted'
    | 'rejected'
    | 'updated';
  typeId: string;
  userId: string;
  publishedAt: string;
}
const tmpList: Event[] = [
  {
    id: 'a',
    event: 'created',
    typeId: '1',
    userId: '1',
    publishedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: 'b',
    event: 'updated',
    typeId: '1',
    userId: '1',
    publishedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: 'c',
    event: 'deleted',
    typeId: '1',
    userId: '1',
    publishedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: 'd',
    event: 'approved',
    typeId: '5',
    userId: '1',
    publishedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: 'e',
    event: 'rejected',
    typeId: '5',
    userId: '1',
    publishedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: 'f',
    event: 'commented',
    typeId: '5',
    userId: '1',
    publishedAt: '2023-01-01T00:00:00Z',
  },
];

export const Update: React.FC<{ evt: Event }> = ({ evt }) => {
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

  return (
    <Timeline.Item className={cls.item} color={color} dot={icon}>
      <Link to={`/u/${evt.userId}`}>@user</Link> {evt.event}
      <div className={cls.date}>2022-01-02</div>
    </Timeline.Item>
  );
};

export const ListUpdates: React.FC = () => {
  const [initLoading, setInitLoading] = useState(true);
  const [list, setList] = useState<typeof tmpList>([]);

  useMount(() => {
    setTimeout(() => {
      setInitLoading(false);
      setList(tmpList);
    }, 1000);
  });

  return (
    <div>
      <Title level={5}>Updates</Title>
      {initLoading && (
        <div>
          <Skeleton paragraph={{ rows: 0 }} active />
          <Skeleton paragraph={{ rows: 0 }} active />
          <Skeleton paragraph={{ rows: 0 }} active />
        </div>
      )}
      <Timeline className={cls.list}>
        {list.map((evt) => {
          return <Update key={evt.id} evt={evt} />;
        })}
      </Timeline>
    </div>
  );
};
