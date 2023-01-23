import { List, Skeleton } from 'antd';
import Title from 'antd/es/typography/Title';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMount } from 'react-use';

import { listProjects } from '../../api/projects';
import type { DBProject } from '../../types/db/projects';
import { AvatarAuto } from '../AvatarAuto';

import cls from './index.module.scss';

export const ListProjects: React.FC = () => {
  const [initLoading, setInitLoading] = useState(true);
  const [list, setList] = useState<DBProject[]>([]);
  const { orgId } = useParams();

  useMount(() => {
    setTimeout(async () => {
      setInitLoading(false);
      const projects = await listProjects(orgId!);
      setList(projects);
    }, 250);
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
                  <Link to={`/org/${orgId}/${item.slug}`} relative="path">
                    {item.name}
                  </Link>
                }
                description={
                  <div className={cls.info}>Last updated 5 hours ago</div>
                }
              />
            </Skeleton>
          </List.Item>
        )}
      />
    </div>
  );
};
