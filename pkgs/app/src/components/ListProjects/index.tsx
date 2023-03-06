import { IconPlus, IconUsers } from '@tabler/icons-react';
import { Button, Skeleton, Table } from 'antd';
import Title from 'antd/es/typography/Title';
import type { ApiProject } from 'api/src/types/api';
import classnames from 'classnames';
import { Link, useParams } from 'react-router-dom';

import { useListProjects } from '../../api/projects';
import type { RouteOrg } from '../../types/routes';
import { AvatarAuto } from '../AvatarAuto';
import { Time } from '../Time';

import cls from './index.module.scss';

export const ListProjects: React.FC = () => {
  const p = useParams<Partial<RouteOrg>>();
  const res = useListProjects({ org_id: p.org_id! });

  if (res.isLoading) {
    return (
      <div>
        <Skeleton active title={false} paragraph={{ rows: 3 }}></Skeleton>
      </div>
    );
  }

  return (
    <div>
      <Title level={3}>Projects</Title>

      {!res.data ||
        (res.data.data.length <= 0 && (
          <div className={cls.empty}>
            <Button type="default" icon={<IconPlus />}>
              Create a project
            </Button>
          </div>
        ))}

      {res.data && res.data.data.length > 0 && (
        <Table
          rowKey="id"
          dataSource={res.data.data}
          size="small"
          showHeader={false}
          pagination={{ position: ['bottomCenter'] }}
        >
          <Table.Column
            dataIndex="slug"
            key="slug"
            className={classnames(cls.item, cls.tdAvatar)}
            render={(_, item: ApiProject) => {
              return (
                <Link to={`/${item.orgId}/${item.slug}`} relative="path">
                  <AvatarAuto
                    className={cls.avatar}
                    name={item.name}
                    size="large"
                  />
                </Link>
              );
            }}
          />
          <Table.Column
            dataIndex="name"
            key="name"
            className={cls.item}
            render={(_, item: ApiProject) => {
              return (
                <>
                  <Link
                    to={`/${item.orgId}/${item.slug}`}
                    relative="path"
                    className={cls.title}
                  >
                    {item.name}
                  </Link>

                  <div className={cls.info}>
                    <div>
                      <IconUsers /> 12
                    </div>
                    <div>
                      Updated <Time time={item.updatedAt} />
                    </div>
                  </div>
                </>
              );
            }}
          />
        </Table>
      )}
    </div>
  );
};
