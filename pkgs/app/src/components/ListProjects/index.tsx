import { LoadingOutlined } from '@ant-design/icons';
import { IconPlus, IconSearch, IconUsers } from '@tabler/icons-react';
import { Button, Input, Table } from 'antd';
import Title from 'antd/es/typography/Title';
import type { ApiProject } from 'api/src/types/api';
import classnames from 'classnames';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useProjectStore } from '../../common/store';
import { AvatarAuto } from '../AvatarAuto';
import { Time } from '../Time';

import cls from './index.module.scss';

export const ListProjects: React.FC<{ orgId: string }> = ({ orgId }) => {
  const storeProjects = useProjectStore();
  const [list, setList] = useState<ApiProject[]>();
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    setList(storeProjects.projects);
  }, [storeProjects.projects]);

  useEffect(() => {
    if (!search) {
      setList(storeProjects.projects);
      return;
    }

    const reg = new RegExp(search, 'i');
    setList(storeProjects.projects.filter((proj) => proj.name.match(reg)));
  }, [search]);

  return (
    <div>
      <div className={cls.header}>
        <Title level={3}>Projects</Title>
        <div className={cls.actions}>
          <Link to={`/${orgId}/_/project/new`}>
            <Button type="default" icon={<IconPlus />}>
              New
            </Button>
          </Link>
          <Input
            prefix={<IconSearch />}
            style={{ width: '200px' }}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {!list ? (
        <LoadingOutlined />
      ) : (
        <>
          {!search && (!list || list.length <= 0) && (
            <div className={cls.empty}>
              <h2>No projects, yet!</h2>
              <p>Create a project manually or from Github.</p>
              <Link to={`/${orgId}/_/project/new`}>
                <Button type="default" icon={<IconPlus />}>
                  Create a New Project
                </Button>
              </Link>
            </div>
          )}

          {search != '' && (!list || list.length <= 0) && (
            <div className={cls.empty}>
              <h4>No Results Found</h4>
              <p>
                Your search for &quot;{search}&quot; did not return any results
              </p>
            </div>
          )}

          {list && list.length > 0 && (
            <Table
              rowKey="id"
              dataSource={list}
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
                        name={item.name}
                        size="large"
                        shape="square"
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
        </>
      )}
    </div>
  );
};
