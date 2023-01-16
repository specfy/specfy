import { List, Skeleton } from 'antd';
import Title from 'antd/es/typography/Title';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMount } from 'react-use';

import { AvatarAuto } from '../AvatarAuto';

import cls from './index.module.scss';

interface Project {
  id: string;
  slug: string;
  name: string;
  description: string;
}
const tmpList: Project[] = [
  {
    id: '3hjfe8SUHer',
    slug: 'crawler',
    name: 'Crawler',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  },
  {
    id: '45jfe8SUFkjd',
    slug: 'dashboard',
    name: 'Dashboard',
    description:
      'Donec mollis pretium nisl at dignissim. Duis dui magna, tempus a scelerisque id, semper eu metus.',
  },
  {
    id: '45jfe8SUFkjd',
    slug: 'analytics-api',
    name: 'Analytics API',
    description: 'Duis dui magna, tempus a scelerisque id, semper eu metus.',
  },
];

export const ListProjects: React.FC = () => {
  const [initLoading, setInitLoading] = useState(true);
  const [list, setList] = useState<Project[]>([]);

  useMount(() => {
    setTimeout(() => {
      setInitLoading(false);
      setList(tmpList);
    }, 1000);
  });

  return (
    <div>
      <Title level={5}>Projects</Title>
      <List
        className={cls.list}
        loading={initLoading}
        dataSource={list}
        itemLayout="horizontal"
        size="small"
        renderItem={(item) => (
          <List.Item key={item.name} className={cls.item}>
            <Skeleton title={false} loading={false} active>
              <List.Item.Meta
                avatar={<AvatarAuto className={cls.avatar} name={item.name} />}
                title={
                  <Link to={`/p/${item.id}-${item.slug}`} relative="path">
                    {item.name}
                  </Link>
                }
                description={item.description}
              />
            </Skeleton>
          </List.Item>
        )}
      />
    </div>
  );
};
