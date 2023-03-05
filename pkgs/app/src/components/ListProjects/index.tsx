import { List, Skeleton } from 'antd';
import Title from 'antd/es/typography/Title';
import { Link, useParams } from 'react-router-dom';

import { useListProjects } from '../../api/projects';
import type { RouteOrg } from '../../types/routes';
import { AvatarAuto } from '../AvatarAuto';
import { Time } from '../Time';

import cls from './index.module.scss';

export const ListProjects: React.FC = () => {
  const p = useParams<Partial<RouteOrg>>();
  const q = useListProjects({ org_id: p.org_id! });

  if (q.isLoading) {
    return <Skeleton active></Skeleton>;
  }

  return (
    <div>
      <Title level={5}>Projects</Title>
      <List
        className={cls.list}
        dataSource={q.data?.data}
        itemLayout="horizontal"
        size="small"
        renderItem={(item) => {
          return (
            <List.Item key={item.name} className={cls.item}>
              <Skeleton title={false} loading={false} active>
                <List.Item.Meta
                  avatar={
                    <Link to={`/${p.org_id}/${item.slug}`} relative="path">
                      <AvatarAuto
                        className={cls.avatar}
                        name={item.name}
                        size="large"
                      />
                    </Link>
                  }
                  title={
                    <Link to={`/${p.org_id}/${item.slug}`} relative="path">
                      {item.name}
                    </Link>
                  }
                  description={
                    <div className={cls.info}>
                      updated <Time time={item.updatedAt} />
                    </div>
                  }
                />
              </Skeleton>
            </List.Item>
          );
        }}
      />
    </div>
  );
};
