import { IconPlus, IconUsers } from '@tabler/icons-react';
import { Button, Table } from 'antd';
import Title from 'antd/es/typography/Title';
import type { ApiProject } from 'api/src/types/api';
import classnames from 'classnames';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useProjectsStore } from '../../common/store';
import { AvatarAuto } from '../AvatarAuto';
import { Time } from '../Time';

import cls from './index.module.scss';

export const ListProjects: React.FC = () => {
  const storeProjects = useProjectsStore();
  const [list, setList] = useState<ApiProject[]>();

  useEffect(() => {
    setList(storeProjects.projects);
  }, [storeProjects.projects]);

  return (
    <div>
      <Title level={3}>Projects</Title>

      {!list ||
        (list.length <= 0 && (
          <div className={cls.empty}>
            <Button type="default" icon={<IconPlus />}>
              Create a project
            </Button>
          </div>
        ))}

      {list && list.length > 0 && (
        <Table
          rowKey="id"
          dataSource={list}
          size="small"
          showHeader={false}
          pagination={false}
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
