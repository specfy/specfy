import { List, Skeleton } from 'antd';
import Title from 'antd/es/typography/Title';
import { Link, useParams } from 'react-router-dom';

import { useListProjects } from '../../api/projects';
import { AvatarAuto } from '../AvatarAuto';

import cls from './index.module.scss';

export const ListProjects: React.FC = () => {
  const { orgId } = useParams();
  const q = useListProjects(orgId!);

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
        renderItem={(item) => (
          <List.Item key={item.name} className={cls.item}>
            <Skeleton title={false} loading={false} active>
              <List.Item.Meta
                avatar={
                  <AvatarAuto
                    className={cls.avatar}
                    name={item.name}
                    size="large"
                  />
                }
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
